import { describe, expect, it } from 'vitest';
import worker, { ImposterRoom, RateLimiter, RedemptionLedger, verifyPremiumCheckout, type Env } from '../src/worker';
import { actionIsAuthorized, createRound, type Action } from '../lib/game';
import type { PublicRoom, RoomState } from '../lib/online';

// Regression tests for the hardening pass in docs/DECISIONS.md (2026-09-10). Each block below
// describes an attack that actually worked against the previous implementation, demonstrated with
// the same moves a player could make from a browser console: a socket, JSON messages, and nothing
// else. They are written as "the attack fails" rather than "the feature works" on purpose — the
// features they touch all still worked while the holes were open.

function makeState() {
  const store = new Map<string, unknown>();
  const sockets = new Set<WebSocket>();
  return {
    storage: {
      async get<T>(key: string) { return store.get(key) as T | undefined; },
      async put(values: Record<string, unknown>) { for (const [key, value] of Object.entries(values)) store.set(key, value); },
      setAlarm() { /* no-op for tests */ },
      async deleteAll() { store.clear(); },
    },
    acceptWebSocket(ws: WebSocket) { sockets.add(ws); },
    getWebSockets() { return [...sockets]; },
  };
}
type TestState = ReturnType<typeof makeState>;

function makeEnv(overrides: Partial<Env> = {}): Env {
  return { ASSETS: {} as Env['ASSETS'], ROOMS: {} as Env['ROOMS'], RATE_LIMITER: {} as Env['RATE_LIMITER'], REDEMPTIONS: {} as Env['REDEMPTIONS'], STRIPE_SECRET_KEY: 'sk_test_fake', ENTITLEMENT_SECRET: 'a'.repeat(64), ...overrides };
}

// Mirrors how idFromName/get resolve to one persistent instance per key in production.
function makeNamespace<T>(create: () => T): Env['RATE_LIMITER'] {
  const instances = new Map<string, T>();
  return {
    idFromName: (name: string) => ({ name }),
    get: (id: { name?: string }) => {
      const name = id.name ?? '';
      if (!instances.has(name)) instances.set(name, create());
      return instances.get(name)!;
    },
  } as unknown as Env['RATE_LIMITER'];
}
const rateLimiterNamespace = () => makeNamespace(() => new RateLimiter(makeState() as unknown as ConstructorParameters<typeof RateLimiter>[0]));
const redemptionNamespace = () => makeNamespace(() => new RedemptionLedger(makeState() as unknown as ConstructorParameters<typeof RedemptionLedger>[0]));

function makeSocket(state: TestState) {
  const received: unknown[] = [];
  let attachment: unknown = null;
  let closed = false;
  const socket = {
    send: (data: string) => received.push(JSON.parse(data)),
    close: () => { closed = true; },
    serializeAttachment: (value: unknown) => { attachment = value; },
    deserializeAttachment: () => attachment,
  } as unknown as WebSocket;
  state.acceptWebSocket(socket);
  return { socket, received, isClosed: () => closed };
}

type Room = {
  join: (socket: WebSocket, message: { type: 'join'; name: string; playerId?: string; seat?: string; create?: boolean }) => Promise<void>;
  start: (socket: WebSocket, playerId: string, settings: object) => Promise<void>;
  action: (socket: WebSocket, playerId: string, message: { type: 'action'; action: Action; round: number }) => Promise<void>;
  room: RoomState | null;
  roundState: ReturnType<typeof createRound> | null;
};
const messagesOfType = (received: unknown[], type: string) => received.filter(message => (message as { type?: string }).type === type);
const seatOf = (received: unknown[]) => messagesOfType(received, 'seat')[0] as { playerId: string; seat: string };
const lastError = (received: unknown[]) => messagesOfType(received, 'error').at(-1) as { message: string } | undefined;

// Three players in a started round, each on their own socket, as a real online game would be.
async function playingRoom() {
  const state = makeState();
  const room = new ImposterRoom(state, makeEnv()) as unknown as Room;
  const seats = [];
  for (const [index, name] of ['Alex', 'Blair', 'Cass'].entries()) {
    const client = makeSocket(state);
    await room.join(client.socket, { type: 'join', name, create: index === 0 });
    seats.push({ ...client, credentials: seatOf(client.received) });
  }
  await room.start(seats[0].socket, seats[0].credentials.playerId, { names: [], category: 'mixed', minutes: 3, hints: true });
  return { state, room, seats };
}
const act = (room: Room, playerId: string, action: Action) => room.action({ send() { /* discarded */ } } as unknown as WebSocket, playerId, { type: 'action', action, round: room.room!.round });

describe('a seat cannot be stolen with a publicly broadcast player id', () => {
  it('never puts a seat secret into the room broadcast every player receives', async () => {
    const { seats } = await playingRoom();
    const broadcasts = messagesOfType(seats[1].received, 'room') as { room: PublicRoom }[];
    expect(broadcasts.length).toBeGreaterThan(0);
    for (const broadcast of broadcasts) expect(JSON.stringify(broadcast)).not.toContain(seats[0].credentials.seat);
    expect(broadcasts.at(-1)!.room.players.every(player => !('secret' in player))).toBe(true);
  });

  it('refuses a re-join that carries another player id without that seat secret, and leaves the victim untouched', async () => {
    const { state, room, seats } = await playingRoom();
    // What an attacker actually has: the victim's public id, read straight off the room broadcast.
    const victimId = (messagesOfType(seats[1].received, 'room').at(-1) as { room: PublicRoom }).room.players[0].id;
    expect(victimId).toBe(seats[0].credentials.playerId);

    const attacker = makeSocket(state);
    await room.join(attacker.socket, { type: 'join', name: 'Alex', playerId: victimId });

    expect(lastError(attacker.received)?.message).toMatch(/belongs to another player/i);
    expect(messagesOfType(attacker.received, 'role')).toHaveLength(0); // the whole point: no secret word, no role
    expect(messagesOfType(attacker.received, 'seat')).toHaveLength(0);
    expect(seats[0].isClosed()).toBe(false); // and the real player is not kicked off their socket
    expect(room.room!.players).toHaveLength(3);
  });

  it('refuses a re-join that guesses at the seat secret', async () => {
    const { state, room, seats } = await playingRoom();
    const attacker = makeSocket(state);
    await room.join(attacker.socket, { type: 'join', name: 'Alex', playerId: seats[0].credentials.playerId, seat: 'not-the-secret' });
    expect(lastError(attacker.received)?.message).toMatch(/belongs to another player/i);
    expect(messagesOfType(attacker.received, 'role')).toHaveLength(0);
  });

  it('still lets the real player reconnect with their own seat and get their role back', async () => {
    const { state, room, seats } = await playingRoom();
    const original = messagesOfType(seats[0].received, 'role').at(-1);

    const reconnected = makeSocket(state);
    await room.join(reconnected.socket, { type: 'join', name: 'Alex', ...seats[0].credentials });

    expect(lastError(reconnected.received)).toBeUndefined();
    expect(messagesOfType(reconnected.received, 'role').at(-1)).toEqual(original);
    expect(seats[0].isClosed()).toBe(true); // the stale socket is dropped, as before
    expect(room.room!.players).toHaveLength(3); // re-attached, not a new seat
  });
});

describe('only the player whose turn it is may act', () => {
  it('rejects a clue from a player the cursor is not on, and accepts the one from the player it is', async () => {
    const { room, seats } = await playingRoom();
    const cursor = room.roundState!.cursor;
    const offTurn = seats.find((_, index) => index !== cursor)!;

    await act(room, offTurn.credentials.playerId, { type: 'clue', text: 'not my turn' });
    expect(room.roundState!.clues).toEqual([]);

    await act(room, seats[cursor].credentials.playerId, { type: 'clue', text: 'my turn' });
    expect(room.roundState!.clues).toEqual(['my turn']);
  });

  it('stops one player from opening every ballot and casting every vote', async () => {
    const { room, seats } = await playingRoom();
    for (let i = 0; i < 3; i += 1) await act(room, seats[room.roundState!.cursor].credentials.playerId, { type: 'clue', text: `clue ${i}` });
    const host = seats.find(seat => seat.credentials.playerId === room.room!.hostId)!;
    await act(room, host.credentials.playerId, { type: 'start-vote' });
    expect(room.roundState!.phase).toBe('vote-handoff');

    // One player tries to run the whole ballot: their own vote, then everyone else's.
    const attacker = seats.find((_, index) => index !== room.roundState!.cursor)!;
    await act(room, attacker.credentials.playerId, { type: 'open-ballot' });
    await act(room, attacker.credentials.playerId, { type: 'vote', target: 1 });
    expect(room.roundState!.votes).toEqual([]);
    expect(room.roundState!.phase).toBe('vote-handoff');

    // The player the cursor is on can still vote normally.
    const voter = seats[room.roundState!.cursor];
    await act(room, voter.credentials.playerId, { type: 'open-ballot' });
    await act(room, voter.credentials.playerId, { type: 'vote', target: (room.roundState!.cursor + 1) % 3 });
    expect(room.roundState!.votes).toHaveLength(1);
  });

  it('lets only the host call the vote', async () => {
    const { room, seats } = await playingRoom();
    for (let i = 0; i < 3; i += 1) await act(room, seats[room.roundState!.cursor].credentials.playerId, { type: 'clue', text: `clue ${i}` });
    const guest = seats.find(seat => seat.credentials.playerId !== room.room!.hostId)!;
    await act(room, guest.credentials.playerId, { type: 'start-vote' });
    expect(room.roundState!.phase).toBe('discussion');
  });

  it('lets only the imposter make or skip the final guess', async () => {
    const { room, seats } = await playingRoom();
    const round = room.roundState!;
    const friend = seats.find((_, index) => index !== round.imposter)!;
    room.roundState = { ...round, phase: 'guess', accused: round.imposter };

    await act(room, friend.credentials.playerId, { type: 'guess', word: round.word.text });
    expect(room.roundState!.phase).toBe('guess');
    await act(room, friend.credentials.playerId, { type: 'skip-guess' });
    expect(room.roundState!.phase).toBe('guess');

    await act(room, seats[round.imposter].credentials.playerId, { type: 'guess', word: round.word.text });
    expect(room.roundState!.winner).toBe('imposter');
  });

  it('refuses the pass-and-play handoff actions outright, whoever sends them', () => {
    const round = { ...createRound({ names: ['Alex', 'Blair', 'Cass'], category: 'mixed', minutes: 3, hints: true }, () => 0), cursor: 0 };
    for (const action of [{ type: 'reveal' }, { type: 'hide' }] as Action[]) {
      expect(actionIsAuthorized(round, { index: 0, isHost: true }, action)).toBe(false);
    }
  });
});

describe('room sockets are not free to open', () => {
  // The room stub answers 200 rather than a real 101: only workerd can construct a 101 Response,
  // so "the request reached the room" is what this asserts, not the upgrade handshake itself.
  const roomsNamespace = () => ({ idFromName: (name: string) => ({ name }), get: () => ({ fetch: async () => new Response('reached the room') }) }) as unknown as Env['ROOMS'];
  const socketRequest = (headers: Record<string, string> = {}) => new Request('https://laughtable.com/api/rooms/ABC123', { headers: { Upgrade: 'websocket', 'CF-Connecting-IP': '203.0.113.7', ...headers } });

  it('turns away a socket opened from another site', async () => {
    const response = await worker.fetch(socketRequest({ Origin: 'https://evil.example' }), makeEnv({ ROOMS: roomsNamespace(), RATE_LIMITER: rateLimiterNamespace() }));
    expect(response.status).toBe(403);
  });

  it('allows a socket from the site itself', async () => {
    const response = await worker.fetch(socketRequest({ Origin: 'https://laughtable.com' }), makeEnv({ ROOMS: roomsNamespace(), RATE_LIMITER: rateLimiterNamespace() }));
    expect(await response.text()).toBe('reached the room');
  });

  it('caps how fast one client can probe room codes, so 32^6 codes cannot be swept for free', async () => {
    const env = makeEnv({ ROOMS: roomsNamespace(), RATE_LIMITER: rateLimiterNamespace() });
    const statuses: number[] = [];
    for (let i = 0; i < 32; i += 1) statuses.push((await worker.fetch(socketRequest(), env)).status);
    expect(statuses.filter(status => status === 200)).toHaveLength(30); // the configured limit
    expect(statuses.slice(30)).toEqual([429, 429]);
  });
});

describe('one payment cannot unlock unlimited devices', () => {
  const paidStripe = () => ({ ok: true, json: async () => ({ status: 'complete', payment_status: 'paid' }) } as Response);
  const verify = (env: Env, sessionId: string) => verifyPremiumCheckout(new Request('https://x/', { method: 'POST', body: JSON.stringify({ sessionId }) }), env);

  it('stops minting new entitlement tokens for a session id that has already been redeemed its share of times', async () => {
    const env = makeEnv({ REDEMPTIONS: redemptionNamespace() });
    const original = globalThis.fetch;
    globalThis.fetch = (async () => paidStripe()) as typeof fetch;
    try {
      const statuses: number[] = [];
      for (let i = 0; i < 7; i += 1) statuses.push((await verify(env, 'cs_test_shared')).status);
      expect(statuses.filter(status => status === 200)).toHaveLength(5); // MINTS_PER_SESSION
      expect(statuses.slice(5)).toEqual([409, 409]);
      // A different payment is unaffected -- the ledger is per session id, not global.
      expect((await verify(env, 'cs_test_other')).status).toBe(200);
    } finally { globalThis.fetch = original; }
  });

  it('does not spend a redemption on a checkout Stripe reports as unpaid', async () => {
    const env = makeEnv({ REDEMPTIONS: redemptionNamespace() });
    const original = globalThis.fetch;
    globalThis.fetch = (async () => ({ ok: true, json: async () => ({ status: 'open', payment_status: 'unpaid' }) }) as Response) as typeof fetch;
    try {
      for (let i = 0; i < 7; i += 1) expect((await verify(env, 'cs_test_unpaid')).status).toBe(402);
      globalThis.fetch = (async () => paidStripe()) as typeof fetch;
      expect((await verify(env, 'cs_test_unpaid')).status).toBe(200); // the buyer's quota is intact
    } finally { globalThis.fetch = original; }
  });
});
