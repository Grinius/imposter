import { expect, test } from '@playwright/test';

// These only mean anything against a real Cloudflare asset server: `public/_headers` is a file the
// runtime interprets, so nothing but an actual wrangler response can prove it is being applied.
test('static responses carry the security headers', async ({ request }) => {
  const home = await request.get('/');
  expect(home.status()).toBe(200);
  const csp = home.headers()['content-security-policy'];
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain('frame-ancestors https://buildhop.io https://*.buildhop.io');
  expect(csp).not.toContain("frame-ancestors 'none'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("base-uri 'self'");
  expect(home.headers()['x-content-type-options']).toBe('nosniff');
  expect(home.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(home.headers()['permissions-policy']).toContain('camera=()');
});

test('a missing page answers 404, not 500', async ({ request }) => {
  // Regression: without an explicit ASSETS binding the Worker's fallthrough threw, so every
  // unmatched URL -- including anything a crawler probes -- came back as a 500.
  expect((await request.get('/no-such-page/')).status()).toBe(404);
  expect((await request.get('/api/nothing-here')).status()).toBe(404);
});

test('an entitlement token is read from the request body, never the URL', async ({ request }) => {
  expect((await request.get('/api/premium/status?token=YWJj.ZGVm')).status()).toBe(404);
  const posted = await request.post('/api/premium/status', { data: { token: 'YWJj.ZGVm' } });
  expect(posted.status()).toBe(200);
  expect(await posted.json()).toEqual({ premium: false }); // an unverifiable token, not a crash
});
