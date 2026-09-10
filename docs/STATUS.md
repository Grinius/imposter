# Current status

Updated: 2026-09-09.

## Built

Initial pass-the-phone game is playable locally. Next.js 16.3.4 + React + TypeScript static export; custom responsive CSS; original optimized detective-club artwork; self-hosted fonts. Cloudflare Workers Static Assets configuration is included.

Features: 3–5 free editable players, 120 starter words in five packs plus mixed, category hints, secure browser randomness, private role handoffs, a 650 ms rapid-tap guard, secret hiding on blur/visibility loss, optional sound, pause/resume discussion timer, private non-self voting, tie/plurality resolution, final imposter guess, results, and replay. Rules dialog and guarded exit are implemented. Settings stay across rounds but not refreshes.

## Rate limiting (adopted)

A `RateLimiter` Durable Object (`src/worker.ts`) gives a fixed-window per-IP counter, keyed per rate-limited action (`create-room:<ip>`, `mint-code:<ip>`, `premium-verify:<ip>`, `premium-status:<ip>`), failing open on any internal error so a rate-limiter bug can never take down the feature it's protecting. Enforced: room creation via WebSocket join (the action that actually allocates a persistent Durable Object) at 6/15min, the cheap `POST /api/rooms` code-mint at 20/15min, `POST /api/premium/verify` at 10/10min (protects the Stripe API call budget), `GET /api/premium/status` at 60/min. Client IP comes from Cloudflare's own `CF-Connecting-IP` header, which a client cannot spoof. Verified live against `wrangler dev`: hit each threshold and got the expected 429/error exactly at the configured limit, one request early and one late. This does not replace Cloudflare's own network-layer DDoS protection (already automatic for anything behind Cloudflare) — it addresses application-level abuse (mass Durable Object creation, Stripe API exhaustion) that the network layer doesn't see.

## Validation completed

- 18 Vitest domain tests pass: setup validation, word selection, replay exclusion, reveal ordering, illegal transitions, privacy transitions, vote authorization, duplicate actions, ties, wrong accusations, and final guesses.
- TypeScript and ESLint pass. Production static build passes.
- Playwright E2E passes for generator, online multiplayer, SEO support pages, and sitemap coverage.
- Cloudflare Wrangler deployment dry run passes: 94 asset files, no runtime bindings. This did not publish anything.
- Browser: completed a four-player round with all private cards, timer start/pause, private ballots, caught imposter, correct final guess, matching vote totals, and replay to a different word.
- Browser: checked duplicate-name validation, a rapid double click at handoff, opening rules hides the secret, exit confirmation, and preserved settings after returning to setup.
- Browser: checked desktop layout and phone result/setup layouts; measured no horizontal overflow at 320, 390, and 768 px. Tested the current free player limit and a long valid name. These are browser viewport checks, not physical-device testing.
- Export inspection verified HTML text, description metadata, eager-loaded artwork, included image, and production sitemap/canonical behavior for `https://laughtable.com`. Field Core Web Vitals and production indexing have not been measured.
- Artwork is 148,312 bytes as a 1280 px WebP. Provenance and final prompt are in ASSETS.md.

## Online mode slice built

The first online slice is implemented behind `/online/` and the Cloudflare Worker API. It has a six-character room endpoint, WebSocket Durable Object rooms, lobby presence, reconnecting player IDs, host-only start, per-player role messages, and round freshness checks. The shared local rules remain the source for round transitions.

The online round now synchronizes clue submissions, private ballot handoffs, distributed votes, and the imposter's final guess. The Worker authorizes the acting player for each turn and publishes public phase state while roles remain private WebSocket messages. Vitest covers clue ordering, vote resolution, and final-guess outcomes. Full separate-browser automation remains a follow-up because the repository does not yet include a Playwright/WebDriver dependency.

## SEO pages built

`/imposter-game-generator/` is implemented as an indexable page for the "imposter game generator" intent. It renders explanatory content, built-in category summaries, crawlable links to the pass-and-play and online game routes, and a client-side generator that creates private role cards from the shared word packs.

`/imposter-game-rules/` and `/imposter-game-words/` are implemented as crawlable support pages for rules and word-list intent. They include static examples, category word lists, and internal links into the generator, local game, and online room entry points.

`/imposter-word-generator/`, `/imposter-game-categories/`, `/imposter-game-online/`, and `/imposter-game-strategy/` are implemented as a second finite SEO side-page batch. They cover word-only generation, category selection, online-play intent, and clue/bluff/voting strategy without creating mass keyword-variant pages. The sitemap now lists nine public canonical routes including `/premium/`. The shared Open Graph image is `/og/laughtable-imposter.svg`.

## Premium conversion UX (adopted)

More players and premium categories are selectable up front, not blocked — adding a 6th+ player or picking Date night/Holidays is allowed, visually tagged "Premium," and only turns into a paywall prompt (with "Unlock with Stripe" and "Use free setup instead") when the player actually tries to start, in both `components/game.tsx` (pass-and-play) and `components/generator/imposter-generator.tsx`. `lib/game.ts`'s `validateSettings`/`createRound` enforce the same premium-category rule server-side (defense in depth for the online Worker, which now also rejects a premium category without a verified room). The homepage's "Play online with friends" link is now also a prominent bordered banner in the hero, not just a small footer link. Fixed a live bug where every premium upsell card on `/premium/` linked back to `/premium/` itself (a dead click) when Stripe wasn't yet configured — `components/premium/upgrade-card.tsx` now detects that with `usePathname()`.

Two new premium-only word categories exist with real content (`lib/words.ts`): Date night and Holidays & celebrations, 24 words each, same format/quality bar as the existing free packs. These are a first draft — worth the owner's sanity check before wide exposure, same playtesting caveat as the original five packs.

## Not implemented

Authentication, analytics, ads, real-time 3D, and Google Search Console submission remain unimplemented. Keyword data remains pending. The production domain is `laughtable.com`. Starter words (including the two new premium categories) still need user playtesting; no claims of keyword volume or ranking difficulty have been verified. Five of the seven listed premium features (custom word packs, classroom/family mode, branded rooms, longer history, printable cards) are still unbuilt — the player cap and the two premium categories are live.

## Next work

Keep local play available. Set the `STRIPE_SECRET_KEY` and `ENTITLEMENT_SECRET` Worker secrets, then do one real end-to-end payment as the owner to confirm the verify → unlock flow works before exposing the checkout button to real visitors (see README's "Premium checkout" section). After deployment, verify `https://laughtable.com/premium/` and confirm `https://laughtable.com/sitemap.xml` lists all nine canonical URLs.

## Local preview

`npm run dev` serves http://localhost:3000. See README for reproducible install, check, build, and Cloudflare preview commands.

## Premium payment (implemented, not yet live-verified)

Stripe Checkout is wired end to end: `/premium/`, the local generator, pass-and-play setup, and the online room lobby show a real "Unlock with Stripe" link once `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` is baked into a build. The buyer returns to `/premium/success/?session_id=…`, which calls the Worker's `POST /api/premium/verify` — this checks the session directly against the Stripe API (never trusting the session id alone) and, only if paid, mints a signed entitlement token stored in that browser's `localStorage`. `GET /api/premium/status` re-verifies that token's signature and expiry wherever a page needs to know if the current browser is premium. The Worker never sees or needs the actual Stripe secret key or signing secret from a client.

The only feature actually gated on this so far is the player cap (`freePlayerLimit` → `premiumPlayerLimit`, `lib/limits.ts`) in local pass-and-play, the generator, and online rooms (fixed per-room at creation by whether the host presented a valid token).

Automated coverage (44 Vitest tests total): token sign/verify round-trips and tamper/expiry rejection (`tests/entitlement.test.ts`); the Worker's `/api/premium/verify` and `/api/premium/status` handlers with Stripe's API mocked — missing secrets, malformed JSON, bad session id shape, a failed Stripe lookup, an unpaid session, and a legitimately paid one (`tests/worker-premium.test.ts`); and `ImposterRoom.join()`'s premium-flag/player-cap logic itself, run directly against a stubbed Durable Object storage — a valid token unlocks the room past 5 players, a forged or wrong-secret token does not (`tests/worker-room.test.ts`).

What automated tests cannot cover, by nature: the real Stripe API's actual behavior (only assumed here, via mocks) and the real WebSocketPair/HTTP-upgrade plumbing in `fetch()` (covered once by a manual `wrangler dev` + live-WebSocket smoke test this session, not committed as a repeatable test). Not yet verified at all: an actual real-money Stripe Checkout round trip end to end — that still needs the owner to set the two Worker secrets and complete one real payment before this goes live to visitors.
