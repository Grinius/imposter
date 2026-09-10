# Security backlog

What remains from the 2026-09-10 security review. The findings themselves, and the reasoning behind
each fix, are in `docs/DECISIONS.md`; this file only tracks what is still open.

Everything the review raised has now been addressed except the two items below. Neither blocks
launch.

## Open

### `sharp`/libheif advisory in the dev toolchain

`npm audit` reports 3 high findings via `wrangler → miniflare → sharp` (GHSA-rgj7-g3m4-5g8c and
related, libheif image decoding). `npm audit --omit=dev` reports **0**: none of it ships to
production, and the project never decodes untrusted images locally. The only offered fix downgrades
wrangler to 4.15.2, a bigger regression than the risk.

**Action:** leave it. Re-check when wrangler ships a patched miniflare.

## Accepted, not fixable without accounts

A premium entitlement is transferable by design. With no account system a token proves "some browser
redeemed a paid Stripe session" and nothing more, so a buyer who shares their token or their Stripe
success URL shares their premium. The redemption ledger bounds this to 5 devices per payment, and
there is no way to revoke one buyer's access. Genuinely preventing either needs the account system
that room history would need anyway.

## Closed

- **Seat hijacking** — a broadcast player id was enough to take another player's seat and read their
  role. Seats now carry a server-minted secret. (2026-09-10)
- **Missing turn authorization** — any player could submit clues and ballots in everyone else's
  name. `actionIsAuthorized` in `lib/game.ts` now gates every action. (2026-09-10)
- **Free room probing** — `GET /api/rooms/{code}` now rejects a foreign `Origin` and is rate limited
  per IP. (2026-09-10)
- **Unlimited entitlement minting** — a `RedemptionLedger` Durable Object caps tokens per Stripe
  session; token lifetime is 3 years with silent renewal. (2026-09-10)
- **Entitlement token in a URL query string** — `/api/premium/status` is a POST reading the token
  from the request body, so it stays out of request logs. (2026-09-10)
- **Unhandled throw on a client-supplied premium token** — `verifiedEntitlement` in `src/worker.ts`
  makes any verification failure mean "not premium" instead of taking room creation down with it.
  (2026-09-10)
- **No security response headers** — `public/_headers` sets CSP, `frame-ancestors`, nosniff,
  `Referrer-Policy`, `Permissions-Policy`, and HSTS, verified against a real wrangler response.
  (2026-09-10)
- **No per-socket message rate limit** — `ImposterRoom` drops messages past 20/second per socket.
  (2026-09-10)
- **404s returned 500** — found while verifying the headers, not part of the original review: the
  Worker's `env.ASSETS` fallthrough threw because `wrangler.jsonc` declared no `binding` for the
  asset namespace, so every unmatched URL answered 500. (2026-09-10)
