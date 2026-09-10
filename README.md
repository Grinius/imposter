# Imposter

A playable secret-word party game for 3–5 friends sharing one phone. Original detective-club artwork, private role reveals, discussion timer, private voting, a final imposter guess, and replay.

## Run locally

Use Node.js 22 or newer and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. No credentials or external services are needed for gameplay. Current rounds live in memory and reset on refresh; they are not stored or uploaded.

## Verify

```sh
npm run test       # Domain rules and state transitions (Vitest)
npm run typecheck
npm run lint
npm run build     # Static HTML/CSS/JS in out/
npm run check     # All of the above
npm run test:e2e:setup  # Download Chromium for CI or machines without Chrome
npm run test:e2e        # Playwright multiplayer browser test
```

## Cloudflare

The initial version uses Next.js static export and Cloudflare Workers Static Assets. It requires no running Next.js server, database, or OpenNext adapter. `wrangler.jsonc` is ready for a Cloudflare account when deployment is requested.

```sh
npm run build
npm run preview                 # Local Cloudflare runtime
npx wrangler deploy --dry-run    # Validate without publishing
```

For an authorized public launch, set `SITE_URL=https://laughtable.com` in the build environment, then run `npm run deploy` while authenticated to the intended Cloudflare account. The code defaults to `https://laughtable.com` for canonical URLs, robots, and sitemap output so the production sitemap does not build empty. The build includes original artwork and self-hosted fonts. No analytics, ads, or accounts are enabled. Stripe Checkout for premium is implemented (see "Premium checkout" below) but stays inert until `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` is baked into a build and the `STRIPE_SECRET_KEY`/`ENTITLEMENT_SECRET` Worker secrets are set.

## What is built

- Editable 3–5 free player names; five packs of 24 words each and a mixed category.
- Exactly one imposter, optional category hints, independently randomized first clue giver.
- Hidden handoff screens, rapid-tap guard, secret hiding on blur/visibility loss.
- A 2, 3, or 5 minute discussion timer with pause/resume; voting can start earlier.
- One private vote per player, no self-votes. Unique plurality accuses a player; ties favor the imposter.
- A caught imposter gets one final guess. Replay avoids immediately repeating a word.
- Mobile and desktop layouts, keyboard controls, reduced-motion support, optional synthesized sound.
- Online beta at `/online/`: create/join room, six-character code, Durable Object lobby presence, reconnecting player IDs, host transfer, synchronized clues, distributed voting, final guesses, and per-player role delivery.

## Next

The online flow is implemented and covered by domain tests plus a Playwright room-join test. Production launch still needs deployed staging validation, broader reconnect/disconnect browser coverage, and operational safeguards. See [architecture](docs/ARCHITECTURE.md).

The initial art uses an illustration with CSS motion, not a real-time 3D scene. Word packs are a starter editorial selection and still need playtesting across ages and cultures. SEO keyword data remains pending; the production domain is `laughtable.com`.

## Project guidance

- [Project brief](docs/PROJECT.md)
- [Current status and validation](docs/STATUS.md)
- [Technical architecture](docs/ARCHITECTURE.md)
- [SEO plan](docs/SEO.md)
- [Quality criteria](docs/QUALITY.md)
- [Decision log](docs/DECISIONS.md)
- [Artwork provenance](docs/ASSETS.md)
- [Shared agent instructions](AGENTS.md)

Project skills live in `.agents/skills`; `.claude/skills` links to the same sources. CLAUDE.md imports AGENTS.md. Use the relevant game, visual-design, and web-SEO skills for future work.

### Premium checkout

`NEXT_PUBLIC_STRIPE_PAYMENT_LINK` is baked into the Next.js build (public, not a secret) and shows an outbound "Unlock with Stripe" button on `/premium/` and elsewhere once set. That link alone proves nothing: the buyer returns to `/premium/success/?session_id={CHECKOUT_SESSION_ID}`, which calls the Worker's `POST /api/premium/verify` to confirm the session was actually paid directly with the Stripe API, and only then mints a signed entitlement token stored in that browser's `localStorage`. `GET /api/premium/status` re-verifies that token (signature + expiry) whenever a page needs to know if the current browser is premium — nothing trusts a client-reported "I'm premium" claim on its own.

The Worker needs two secrets it never gets from a client, set with `npx wrangler secret put <NAME>` against the deployed Worker (or in a git-ignored `.dev.vars` for `wrangler dev`):

- `STRIPE_SECRET_KEY` — Stripe's secret API key, used only server-side to look up a Checkout session's payment status.
- `ENTITLEMENT_SECRET` — a random secret (e.g. `openssl rand -hex 32`) used to sign/verify entitlement tokens. Never reuse the Stripe key for this.

Today the entitlement, once verified, only raises the player cap from `freePlayerLimit` to `premiumPlayerLimit` (`lib/limits.ts`) in local pass-and-play, the generator, and online rooms (the room's cap is fixed at creation by whether the host presented a valid token). The rest of the listed premium features (`lib/premium.ts`) are not built yet and say so honestly in the UI once unlocked.
