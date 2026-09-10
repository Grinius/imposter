import { afterEach, describe, expect, it, vi } from 'vitest';
import { premiumStatus, verifyPremiumCheckout, type Env } from '../src/worker';
import { signEntitlement, verifyEntitlement } from '../lib/entitlement';

// These exercise the exact HTTP handlers the deployed Worker runs for premium verification,
// with Stripe's own API mocked out — the one thing that genuinely cannot be unit tested here is
// whether the real Stripe API behaves the way these tests assume it does.
const baseEnv: Env = {
  ASSETS: {} as Env['ASSETS'],
  ROOMS: {} as Env['ROOMS'],
  STRIPE_SECRET_KEY: 'sk_test_fake',
  ENTITLEMENT_SECRET: 'a'.repeat(64),
};

function mockStripe(response: { ok: boolean; body?: unknown }) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: response.ok, json: async () => response.body } as Response);
}

afterEach(() => { vi.restoreAllMocks(); });

describe('POST /api/premium/verify', () => {
  it('refuses to run without both secrets configured', async () => {
    const response = await verifyPremiumCheckout(new Request('https://x/', { method: 'POST', body: JSON.stringify({ sessionId: 'cs_test_abc' }) }), { ...baseEnv, ENTITLEMENT_SECRET: '' });
    expect(response.status).toBe(503);
  });
  it('rejects a request body that is not valid JSON', async () => {
    const response = await verifyPremiumCheckout(new Request('https://x/', { method: 'POST', body: 'not json' }), baseEnv);
    expect(response.status).toBe(400);
  });
  it('rejects a session id that does not look like a Stripe Checkout session id', async () => {
    for (const sessionId of [undefined, '', 'evil"; DROP TABLE', 'cs_bogus_123', 123]) {
      const response = await verifyPremiumCheckout(new Request('https://x/', { method: 'POST', body: JSON.stringify({ sessionId }) }), baseEnv);
      expect(response.status).toBe(400);
    }
  });
  it('reports a Stripe lookup failure (e.g. an invalid Stripe key) as a clean 502, not a crash', async () => {
    mockStripe({ ok: false });
    const response = await verifyPremiumCheckout(new Request('https://x/', { method: 'POST', body: JSON.stringify({ sessionId: 'cs_test_abc123' }) }), baseEnv);
    expect(response.status).toBe(502);
  });
  it('refuses to mint a token for a session that is not actually paid', async () => {
    mockStripe({ ok: true, body: { status: 'open', payment_status: 'unpaid' } });
    const response = await verifyPremiumCheckout(new Request('https://x/', { method: 'POST', body: JSON.stringify({ sessionId: 'cs_test_abc123' }) }), baseEnv);
    expect(response.status).toBe(402);
  });
  it('mints a verifiable token only once Stripe confirms the session is complete and paid', async () => {
    mockStripe({ ok: true, body: { status: 'complete', payment_status: 'paid' } });
    const response = await verifyPremiumCheckout(new Request('https://x/', { method: 'POST', body: JSON.stringify({ sessionId: 'cs_test_abc123' }) }), baseEnv);
    expect(response.status).toBe(200);
    const { token } = await response.json() as { token: string };
    const payload = await verifyEntitlement(baseEnv.ENTITLEMENT_SECRET, token);
    expect(payload?.paid).toBe(true);
    expect(payload?.sessionId).toBe('cs_test_abc123');
  });
});

describe('GET /api/premium/status', () => {
  it('reports not premium when no token is given', async () => {
    const response = await premiumStatus(new URL('https://x/api/premium/status'), baseEnv);
    expect(await response.json()).toEqual({ premium: false });
  });
  it('reports not premium when the entitlement secret is not configured', async () => {
    const { token } = await signEntitlement(baseEnv.ENTITLEMENT_SECRET, 'cs_test_abc123');
    const response = await premiumStatus(new URL(`https://x/api/premium/status?token=${token}`), { ...baseEnv, ENTITLEMENT_SECRET: '' });
    expect(await response.json()).toEqual({ premium: false });
  });
  it('reports premium for a legitimately signed, unexpired token', async () => {
    const { token } = await signEntitlement(baseEnv.ENTITLEMENT_SECRET, 'cs_test_abc123');
    const response = await premiumStatus(new URL(`https://x/api/premium/status?token=${token}`), baseEnv);
    expect(await response.json()).toEqual({ premium: true });
  });
  it('rejects a token signed with a different secret (e.g. a forged client-side claim)', async () => {
    const { token } = await signEntitlement('b'.repeat(64), 'cs_test_abc123');
    const response = await premiumStatus(new URL(`https://x/api/premium/status?token=${token}`), baseEnv);
    expect(await response.json()).toEqual({ premium: false });
  });
});
