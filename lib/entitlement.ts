// Signed, opaque "premium" entitlement tokens. There are no accounts, so a token just proves
// "this browser redeemed a paid Stripe Checkout session" — it is minted server-side by
// src/worker.ts's /api/premium/verify after checking the session with Stripe directly, and
// verified server-side (never trusted from the client alone) wherever it gates a feature.
export interface EntitlementPayload { v: 1; paid: true; iat: number; exp: number; sessionId: string; }

// A one-time purchase should stay unlocked on that device for as long as the device keeps playing:
// /api/premium/status renews a token silently once it is inside its last two years, so an active
// buyer never sees this expire. The bound exists so a token that is copied elsewhere, or left in an
// abandoned browser, eventually dies instead of being good more or less forever.
const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24 * 365 * 3;

function hexToBytes(hex: string): Uint8Array {
  if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2 !== 0) throw new Error('ENTITLEMENT_SECRET must be a hex string (e.g. from `openssl rand -hex 32`).');
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + (4 - normalized.length % 4) % 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacKey(secretHex: string) {
  return crypto.subtle.importKey('raw', hexToBytes(secretHex) as BufferSource, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function signEntitlement(secretHex: string, sessionId: string, ttlMs = DEFAULT_TTL_MS): Promise<{ token: string; expiresAt: number }> {
  const iat = Date.now();
  const exp = iat + ttlMs;
  const payload: EntitlementPayload = { v: 1, paid: true, iat, exp, sessionId };
  const payloadB64 = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await hmacKey(secretHex);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64));
  return { token: `${payloadB64}.${toBase64Url(new Uint8Array(signature))}`, expiresAt: exp };
}

export async function verifyEntitlement(secretHex: string, token: string): Promise<EntitlementPayload | null> {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, signatureB64] = parts;
  let signatureBytes: Uint8Array;
  try { signatureBytes = fromBase64Url(signatureB64); } catch { return null; }
  const key = await hmacKey(secretHex);
  const valid = await crypto.subtle.verify('HMAC', key, signatureBytes as BufferSource, new TextEncoder().encode(payloadB64));
  if (!valid) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadB64))) as EntitlementPayload;
    if (payload.v !== 1 || payload.paid !== true || typeof payload.exp !== 'number') return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch { return null; }
}
