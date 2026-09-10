# Security backlog

Findings from the 2026-09-10 review that were deliberately **not** fixed in that session's hardening
pass, kept here for the owner to review and schedule. The four that were fixed (seat hijacking,
missing turn authorization, unrated room probing, unlimited entitlement minting) are described in
`docs/DECISIONS.md` and are not repeated here.

Nothing below is known to be exploited, and none of it is a reason to delay launch on its own. They
are ordered by how much they would matter once the site has real traffic and real payments.

## 1. Entitlement token travels in a URL query string

`lib/premium-client.ts` calls `/api/premium/status?token=…`. The token is a bearer credential: query
strings land in Cloudflare request logs and analytics, and anything with log access can replay one.
It is not in browser history (it is a `fetch`, not a navigation) and it is not sent cross-origin.

**Fix:** make `/api/premium/status` a `POST` carrying the token in the JSON body (or read an
`Authorization: Bearer` header), and update `usePremiumStatus`. `premiumStatus()` currently takes a
`URL`, so its signature and `tests/worker-premium.test.ts` change with it. Half an hour, no user-
visible behaviour change.

## 2. An unset or malformed `ENTITLEMENT_SECRET` makes `join` throw

`src/worker.ts`'s `join()` awaits `verifyEntitlement` unguarded, and `hexToBytes`
(`lib/entitlement.ts`) throws when the secret is empty or not hex. A client sending any well-formed
two-part token — `"YWJj.ZGVm"` is enough — makes room creation reject with an unhandled exception
rather than simply not being premium. Reproduced in the review with the secret unset, which is the
state the Worker is in today. The `/api/premium/*` handlers already guard for this; only the join
path does not.

**Fix:** one line — wrap the call so a verification failure of any kind means "not premium":

```ts
const premium = message.premiumToken ? await verifyEntitlement(this.env.ENTITLEMENT_SECRET, message.premiumToken).then(Boolean).catch(() => false) : false;
```

Worth doing before the secrets are set, because until they are, every premium-token join throws.

## 3. No security response headers

Neither `next.config.ts`, `wrangler.jsonc`, nor a `_headers` file sets a Content-Security-Policy,
`frame-ancestors`, `X-Content-Type-Options`, or `Referrer-Policy`. The review found no XSS sink in
the app (no `dangerouslySetInnerHTML`, no `innerHTML`, no `eval`; external links already carry
`rel="noopener noreferrer"`), so nothing is exploitable today. CSP matters here mainly as the
control that would keep a *future* XSS from reading the premium token out of `localStorage`.

**Fix:** add `public/_headers` (Workers Static Assets serves it) with a starting policy along the
lines of `Content-Security-Policy: default-src 'self'; frame-ancestors 'none'; base-uri 'self'`,
plus `X-Content-Type-Options: nosniff` and `Referrer-Policy: strict-origin-when-cross-origin`. The
policy needs testing against the real pages first — self-hosted fonts, the inline Next.js bootstrap
and the `wss:` room connection all have to be allowed, so expect a round of console errors before it
is right. Budget an hour, and check every route.

## 4. No per-connection message rate limit

The per-IP limits cover opening sockets and creating rooms, not messages sent down a socket that is
already open. A joined player can spam `action` messages; each one costs a Durable Object storage
write and a room-wide broadcast. The blast radius is one room (only members can act, and actions are
now turn-checked), so this is a cost and annoyance issue, not a data issue.

**Fix:** a per-socket token bucket in the attachment, or a cheap counter with a rejection above ~20
messages/second. Only worth doing if room costs ever look wrong.

## 5. `sharp`/libheif advisory in the dev toolchain

`npm audit` reports 3 high findings via `wrangler → miniflare → sharp` (GHSA-rgj7-g3m4-5g8c and
friends, libheif image decoding). `npm audit --omit=dev` reports **0** — nothing ships to
production, and the project never decodes untrusted images locally. The only offered fix downgrades
wrangler to 4.15.2, which is a bigger regression than the risk.

**Fix:** leave it; re-check when wrangler ships a patched miniflare.

## Accepted, not fixable without accounts

A premium entitlement is transferable by design: with no account system, a token proves "some
browser redeemed a paid Stripe session" and nothing more, so a buyer who shares their token or their
Stripe success URL shares their premium. The redemption cap in `src/worker.ts` bounds this to a
handful of devices per payment; genuinely preventing it, or revoking a specific buyer's access,
needs the account system that room history would need anyway. See `docs/DECISIONS.md`.
