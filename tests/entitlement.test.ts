import { describe, expect, it } from 'vitest';
import { signEntitlement, verifyEntitlement } from '../lib/entitlement';

const secret = 'a'.repeat(64); // 32 bytes hex, matching `openssl rand -hex 32` output shape

describe('entitlement tokens', () => {
  it('round-trips a freshly signed token', async () => {
    const { token, expiresAt } = await signEntitlement(secret, 'cs_test_abc123');
    const payload = await verifyEntitlement(secret, token);
    expect(payload?.paid).toBe(true);
    expect(payload?.sessionId).toBe('cs_test_abc123');
    expect(payload?.exp).toBe(expiresAt);
  });
  it('rejects a token signed with a different secret', async () => {
    const { token } = await signEntitlement(secret, 'cs_test_abc123');
    const otherSecret = 'b'.repeat(64);
    expect(await verifyEntitlement(otherSecret, token)).toBeNull();
  });
  it('rejects a tampered payload even if the signature parses', async () => {
    const { token } = await signEntitlement(secret, 'cs_test_abc123');
    const [payloadB64, signatureB64] = token.split('.');
    const tamperedPayload = payloadB64.slice(0, -1) + (payloadB64.at(-1) === 'A' ? 'B' : 'A');
    expect(await verifyEntitlement(secret, `${tamperedPayload}.${signatureB64}`)).toBeNull();
  });
  it('rejects malformed tokens', async () => {
    expect(await verifyEntitlement(secret, 'not-a-token')).toBeNull();
    expect(await verifyEntitlement(secret, '')).toBeNull();
    expect(await verifyEntitlement(secret, 'a.b.c')).toBeNull();
  });
  it('rejects an expired token', async () => {
    const { token } = await signEntitlement(secret, 'cs_test_abc123', -1);
    expect(await verifyEntitlement(secret, token)).toBeNull();
  });
});
