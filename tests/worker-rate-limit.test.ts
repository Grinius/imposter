import { describe, expect, it } from 'vitest';
import { RateLimiter } from '../src/worker';

function makeState() {
  const store = new Map<string, unknown>();
  let alarmAt: number | null = null;
  return {
    storage: {
      async get<T>(key: string) { return store.get(key) as T | undefined; },
      async put(values: Record<string, unknown>) { for (const [key, value] of Object.entries(values)) store.set(key, value); },
      setAlarm(timestamp: number) { alarmAt = timestamp; },
      async deleteAll() { store.clear(); },
    },
    // exposed only for the "fires its own cleanup alarm" assertion below
    _alarmAt: () => alarmAt,
  } as unknown as ConstructorParameters<typeof RateLimiter>[0] & { _alarmAt: () => number | null };
}

async function hit(limiter: RateLimiter, limit: number, windowMs: number) {
  const response = await limiter.fetch(new Request('https://x/', { method: 'POST', body: JSON.stringify({ limit, windowMs }) }));
  return (await response.json()) as { allowed: boolean };
}

describe('RateLimiter', () => {
  it('allows requests up to the limit within the window, then rejects', async () => {
    const limiter = new RateLimiter(makeState());
    for (let i = 0; i < 3; i += 1) expect((await hit(limiter, 3, 60_000)).allowed).toBe(true);
    expect((await hit(limiter, 3, 60_000)).allowed).toBe(false);
    expect((await hit(limiter, 3, 60_000)).allowed).toBe(false); // still rejected, not a one-shot block
  });

  it('resets the count once the window has passed', async () => {
    const state = makeState();
    const limiter = new RateLimiter(state);
    expect((await hit(limiter, 1, 60_000)).allowed).toBe(true);
    expect((await hit(limiter, 1, 60_000)).allowed).toBe(false);
    // Simulate the window elapsing by backdating the stored bucket's resetAt directly.
    const stored = await state.storage.get<{ count: number; resetAt: number }>('bucket');
    await state.storage.put({ bucket: { ...stored, resetAt: Date.now() - 1 } });
    expect((await hit(limiter, 1, 60_000)).allowed).toBe(true);
  });

  it('schedules its own cleanup alarm so idle rate-limit buckets do not persist forever', async () => {
    const state = makeState();
    const limiter = new RateLimiter(state);
    await hit(limiter, 5, 60_000);
    expect(state._alarmAt()).not.toBeNull();
    await limiter.alarm();
    expect(await state.storage.get('bucket')).toBeUndefined();
  });

  it('tracks separate keys independently (a distinct Durable Object per key in production)', async () => {
    // This is really just documenting the design: each rate-limit key gets its own RateLimiter
    // instance via idFromName, so two independent instances never share state.
    const a = new RateLimiter(makeState());
    const b = new RateLimiter(makeState());
    expect((await hit(a, 1, 60_000)).allowed).toBe(true);
    expect((await hit(a, 1, 60_000)).allowed).toBe(false);
    expect((await hit(b, 1, 60_000)).allowed).toBe(true);
  });
});
