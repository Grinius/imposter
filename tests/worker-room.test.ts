import { describe, expect, it } from 'vitest';
import { ImposterRoom, type Env } from '../src/worker';
import { signEntitlement } from '../lib/entitlement';
import { freePlayerLimit, premiumPlayerLimit } from '../lib/limits';
import type { PublicRoom } from '../lib/online';

// ImposterRoom talks to Cloudflare's Durable Object runtime only through `state.storage` and plain
// WebSocket-shaped sockets, so both can be stubbed well enough to exercise its private join/start/
// action logic directly — the one thing this genuinely cannot cover is the real WebSocketPair/HTTP
// upgrade plumbing in fetch(), which only a real `wrangler dev` (as done manually this session) or
// the Playwright e2e suite touches.
function makeState() {
  const store = new Map<string, unknown>();
  return {
    storage: {
      async get<T>(key: string) { return store.get(key) as T | undefined; },
      async put(values: Record<string, unknown>) { for (const [key, value] of Object.entries(values)) store.set(key, value); },
      setAlarm() { /* no-op for tests */ },
      async deleteAll() { store.clear(); },
    },
  } as unknown as ConstructorParameters<typeof ImposterRoom>[0];
}

function makeEnv(overrides: Partial<Env> = {}): Env {
  return { ASSETS: {} as Env['ASSETS'], ROOMS: {} as Env['ROOMS'], STRIPE_SECRET_KEY: 'sk_test_fake', ENTITLEMENT_SECRET: 'a'.repeat(64), ...overrides };
}

function makeSocket() {
  const received: unknown[] = [];
  const socket = { send: (data: string) => received.push(JSON.parse(data)), close: () => {} } as unknown as WebSocket;
  return { socket, received };
}

// join/start/action are private; TS privacy is compile-time only, and testing them directly here
// is more honest than duplicating this logic behind a public wrapper just for tests.
type Room = { join: (socket: WebSocket, message: { type: 'join'; name: string; playerId?: string; premiumToken?: string }) => Promise<void>; room: PublicRoom | null };

describe('ImposterRoom premium player cap', () => {
  it('marks a room premium only when the creating join carries a token that verifies, and raises the cap', async () => {
    const env = makeEnv();
    const { token } = await signEntitlement(env.ENTITLEMENT_SECRET, 'cs_test_abc123');
    const room = new ImposterRoom(makeState(), env) as unknown as Room;

    await room.join(makeSocket().socket, { type: 'join', name: 'Host', premiumToken: token });
    expect(room.room?.premium).toBe(true);

    for (let i = 0; i < 8; i += 1) await room.join(makeSocket().socket, { type: 'join', name: `Player${i}` });
    expect(room.room?.players.length).toBe(9); // host + 8, well past the free cap
    expect(room.room!.players.length).toBeGreaterThan(freePlayerLimit);
    expect(room.room!.players.length).toBeLessThanOrEqual(premiumPlayerLimit);
  });

  it('does not mark a room premium for a forged or missing token, and enforces the free cap', async () => {
    const env = makeEnv();
    const room = new ImposterRoom(makeState(), env) as unknown as Room;

    await room.join(makeSocket().socket, { type: 'join', name: 'Host', premiumToken: 'not-a-real-token' });
    expect(room.room?.premium).toBe(false);

    const outcomes: unknown[] = [];
    for (let i = 0; i < 7; i += 1) { const { socket, received } = makeSocket(); await room.join(socket, { type: 'join', name: `Player${i}` }); outcomes.push(received.at(-1)); }
    expect(room.room?.players.length).toBe(freePlayerLimit); // host + 4 more, then the 6th onward is rejected
    const rejected = outcomes.filter((message): message is { type: 'error'; message: string } => typeof message === 'object' && message !== null && (message as { type?: string }).type === 'error');
    expect(rejected.length).toBeGreaterThan(0);
    expect(rejected[0].message).toMatch(/free room is full/);
  });

  it('rejects a token signed with the wrong secret rather than trusting it', async () => {
    const env = makeEnv();
    const { token } = await signEntitlement('b'.repeat(64), 'cs_test_abc123'); // different secret than the room's env
    const room = new ImposterRoom(makeState(), env) as unknown as Room;

    await room.join(makeSocket().socket, { type: 'join', name: 'Host', premiumToken: token });
    expect(room.room?.premium).toBe(false);
  });
});
