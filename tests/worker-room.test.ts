import { describe, expect, it } from 'vitest';
import { ImposterRoom, RateLimiter, type Env } from '../src/worker';
import { signEntitlement } from '../lib/entitlement';
import { freePlayerLimit, premiumPlayerLimit } from '../lib/limits';
import type { RoomState } from '../lib/online';

// ImposterRoom talks to Cloudflare's Durable Object runtime only through `state.storage`, the
// Hibernation WebSocket API (acceptWebSocket/getWebSockets, ws.serialize/deserializeAttachment), and
// plain WebSocket-shaped sockets, so all of that can be stubbed well enough to exercise its private
// join/start/action logic directly — the one thing this genuinely cannot cover is the real
// WebSocketPair/HTTP upgrade plumbing in fetch(), which only a real `wrangler dev` (as done manually
// this session) or the Playwright e2e suite touches.
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

// A real, working RATE_LIMITER binding — one persistent RateLimiter instance per key, mirroring how
// Durable Object idFromName/get resolves to the *same* instance for the same name in production.
function makeRateLimiterNamespace(): Env['RATE_LIMITER'] {
  const instances = new Map<string, RateLimiter>();
  return {
    idFromName: (name: string) => ({ name }),
    get: (id: { name?: string }) => {
      const name = id.name ?? '';
      let instance = instances.get(name);
      if (!instance) { instance = new RateLimiter(makeState() as unknown as ConstructorParameters<typeof RateLimiter>[0]); instances.set(name, instance); }
      return instance;
    },
  } as unknown as Env['RATE_LIMITER'];
}

// Registers the socket on `state` the way fetch()'s acceptWebSocket call would in production —
// without this, broadcast()/getWebSockets() and the reconnect-kick lookup would never see it.
function makeSocket(state: TestState) {
  const received: unknown[] = [];
  let attachment: unknown = null;
  const socket = {
    send: (data: string) => received.push(JSON.parse(data)),
    close: () => { /* no-op for tests */ },
    serializeAttachment: (value: unknown) => { attachment = value; },
    deserializeAttachment: () => attachment,
  } as unknown as WebSocket;
  state.acceptWebSocket(socket);
  return { socket, received };
}

// join/start/action are private; TS privacy is compile-time only, and testing them directly here
// is more honest than duplicating this logic behind a public wrapper just for tests.
type Room = { join: (socket: WebSocket, message: { type: 'join'; name: string; playerId?: string; seat?: string; premiumToken?: string; create?: boolean }) => Promise<void>; room: RoomState | null };

// The seat credential the server issues to one socket. Tests read it the only way a real client
// can: out of that socket's own `seat` message.
function seatOf(received: unknown[]) {
  return received.find((message): message is { type: 'seat'; playerId: string; seat: string } => (message as { type?: string }).type === 'seat')!;
}

describe('ImposterRoom premium player cap', () => {
  it('marks a room premium only when the creating join carries a token that verifies, and raises the cap', async () => {
    const env = makeEnv();
    const { token } = await signEntitlement(env.ENTITLEMENT_SECRET, 'cs_test_abc123');
    const state = makeState();
    const room = new ImposterRoom(state, env) as unknown as Room;

    await room.join(makeSocket(state).socket, { type: 'join', name: 'Host', premiumToken: token, create: true });
    expect(room.room?.premium).toBe(true);

    for (let i = 0; i < 8; i += 1) await room.join(makeSocket(state).socket, { type: 'join', name: `Player${i}` });
    expect(room.room?.players.length).toBe(9); // host + 8, well past the free cap
    expect(room.room!.players.length).toBeGreaterThan(freePlayerLimit);
    expect(room.room!.players.length).toBeLessThanOrEqual(premiumPlayerLimit);
  });

  it('does not mark a room premium for a forged or missing token, and enforces the free cap', async () => {
    const env = makeEnv();
    const state = makeState();
    const room = new ImposterRoom(state, env) as unknown as Room;

    await room.join(makeSocket(state).socket, { type: 'join', name: 'Host', premiumToken: 'not-a-real-token', create: true });
    expect(room.room?.premium).toBe(false);

    const outcomes: unknown[] = [];
    for (let i = 0; i < 7; i += 1) { const { socket, received } = makeSocket(state); await room.join(socket, { type: 'join', name: `Player${i}` }); outcomes.push(received.at(-1)); }
    expect(room.room?.players.length).toBe(freePlayerLimit); // host + 4 more, then the 6th onward is rejected
    const rejected = outcomes.filter((message): message is { type: 'error'; message: string } => typeof message === 'object' && message !== null && (message as { type?: string }).type === 'error');
    expect(rejected.length).toBeGreaterThan(0);
    expect(rejected[0].message).toMatch(/free room is full/);
  });

  it('rejects a token signed with the wrong secret rather than trusting it', async () => {
    const env = makeEnv();
    const { token } = await signEntitlement('b'.repeat(64), 'cs_test_abc123'); // different secret than the room's env
    const state = makeState();
    const room = new ImposterRoom(state, env) as unknown as Room;

    await room.join(makeSocket(state).socket, { type: 'join', name: 'Host', premiumToken: token, create: true });
    expect(room.room?.premium).toBe(false);
  });
});

describe('ImposterRoom room-not-found protection', () => {
  it('refuses to spin up a brand-new room for a code nobody officially created (a mistyped/guessed code)', async () => {
    const state = makeState();
    const room = new ImposterRoom(state, makeEnv()) as unknown as Room;
    const { socket, received } = makeSocket(state);

    await room.join(socket, { type: 'join', name: 'Alex' }); // no create flag -- this is a "join with code" attempt
    expect(room.room).toBeNull();
    const last = received.at(-1) as { type: string; message: string };
    expect(last.type).toBe('error');
    expect(last.message).toMatch(/room code/i);
  });

  it('lets the official create flow spin up a room, and later plain joins into it succeed normally', async () => {
    const state = makeState();
    const room = new ImposterRoom(state, makeEnv()) as unknown as Room;
    await room.join(makeSocket(state).socket, { type: 'join', name: 'Host', create: true });
    expect(room.room?.players).toHaveLength(1);

    const { socket, received } = makeSocket(state);
    await room.join(socket, { type: 'join', name: 'Jamie' }); // no create needed -- the room already exists
    expect(room.room?.players).toHaveLength(2);
    expect(received.some(message => (message as { type?: string }).type === 'error')).toBe(false);
  });

  it('kicks the previous connection when the same player reconnects, without losing them from state.getWebSockets()', async () => {
    const state = makeState();
    const room = new ImposterRoom(state, makeEnv()) as unknown as Room;
    const first = makeSocket(state);
    await room.join(first.socket, { type: 'join', name: 'Host', create: true });
    const credentials = seatOf(first.received);

    let closed = false;
    (first.socket as unknown as { close: () => void }).close = () => { closed = true; };

    const second = makeSocket(state);
    await room.join(second.socket, { type: 'join', name: 'Host', playerId: credentials.playerId, seat: credentials.seat });
    expect(closed).toBe(true);
    expect(room.room?.players).toHaveLength(1); // still one seat, just re-attached to the new socket
  });
});

describe('ImposterRoom room-creation rate limiting', () => {
  it('caps how many rooms the same client can spin up in a window, independent of which code each used', async () => {
    // Every ImposterRoom instance here shares one RATE_LIMITER namespace and defaults to the same
    // clientIp ('unknown', since fetch() -- which sets it from a real request -- is never called in
    // these direct-join tests), matching how the same real visitor hitting many different room codes
    // shares one rate-limit bucket in production.
    const env = makeEnv({ RATE_LIMITER: makeRateLimiterNamespace() });
    const outcomes: boolean[] = [];
    for (let i = 0; i < 8; i += 1) {
      const state = makeState();
      const room = new ImposterRoom(state, env) as unknown as Room;
      const { socket, received } = makeSocket(state);
      await room.join(socket, { type: 'join', name: `Host${i}`, create: true });
      outcomes.push(room.room !== null);
      if (room.room === null) expect((received.at(-1) as { message: string }).message).toMatch(/too many rooms/i);
    }
    expect(outcomes.filter(Boolean).length).toBe(6); // the configured limit
    expect(outcomes.slice(6)).toEqual([false, false]);
  });
});
