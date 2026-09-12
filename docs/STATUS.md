# Current status

Updated: 2026-09-12.

## Analytics (2026-09-12, adopted)

Plausible via the per-site script tag in `app/layout.tsx` (cookieless, no banner), CSP opened for
`plausible.io` only, room codes stripped from reported URLs by `transformRequest`. Eight typed
events through `lib/analytics.ts` with a prop whitelist that cannot carry names, words, roles,
clues, questions or room codes; wired into the word game, the three variants, online rooms
(host-only round events), the reveal stage, the recap button and the paywall notice. Privacy page
updated. On the way, browser-only reads (invite code, remembered name/room, pack preselect,
`navigator.share`) moved onto `useSyncExternalStore` (`lib/use-client-value.ts`), removing the React
#418 hydration errors on `/online/?room=…` and `/?pack=…`; the online URL sync now resets only on
leave, and boot runs exactly once. Reasoning in `docs/DECISIONS.md`.

Validation: 95 Vitest (2 new: prop whitelist drops secrets, URL scrub), TypeScript, ESLint (1
pre-existing warning), static build, 13 Playwright (updated timer and online specs stub the tag,
block the vendor, and assert the exact events and that no event contains a name, the secret or the
code; 1 new: an invite link beats a remembered room, no second socket after creating a room, and
zero console errors on the URL-driven pages). The real tag was seen loading in the Worker preview
with the CSP applied. Not verifiable here: real pageviews (the script skips localhost) — after
deploy, confirm in Plausible that `/online/` pages never show `?room=`.

Plausible dashboard configured by the owner on 2026-09-12 (owner report): the eight events as custom-event
goals, a pageview goal for `/timer-imposter/`, the eight property keys (`mode`, `pack`, `players`, `winner`,
`reason`, `via`, `method`, `outcome`), and two funnels — Visit /timer-imposter/ → round_start → round_end →
recap_save, and round_start → round_end → reveal_tap → recap_save. Any new event or prop key added in
`lib/analytics.ts` must also be added there or it will not appear.

Next step: deploy; put UTMs on every link you post; the free-cap decision is the last open day-1 item.

## Themed packs (2026-09-12, adopted)

Five free themed packs (Halloween, Football, K-pop, Pop superstars, Christmas; 48 words each) are
categories in `lib/words.ts` with metadata and page copy in `lib/packs.ts`, pages at `/packs/` and
`/packs/<slug>/` (full word list in the HTML, pairs that play well, FAQ, one-tap links into each mode
with `?pack=` preselecting the category), and links from the home grid ("Themed packs" row), the
categories page, the words page and the sitemap. Mixed bag stays core-free-only. The two "coming
soon" cards are removed from the online lobby. Reasoning in `docs/DECISIONS.md`.

Validation: 93 Vitest (3 new: every themed category is a free pack with ≥40 unique words, Mixed bag
is exactly food+animals, slug/`?pack=` resolution ignores junk), TypeScript, ESLint (2 pre-existing
warnings), static build (five `/packs/[slug]` pages prerendered), 12 Playwright (1 new: pack HTML
carries the word list, the preselect link and cross-links; `/?pack=halloween` selects Halloween;
`/?pack=bogus` falls back to Mixed). Home grid, hub, a pack page and the lobby inspected from
Playwright captures at desktop. Not verified: real search demand for the pack phrases (needs GSC).

Next step: deploy and request indexing for `/packs/` and the five pack pages ahead of Halloween;
then the free-cap decision and analytics.

## Filmable reveal and recap (2026-09-11, adopted)

Every mode (word game, the three variants, online rooms) now ends on a tap-gated, full-screen
reveal stage — roulette over the names, the imposter lands, the secret follows, domain in the corner,
each step a tap — before the full result (`components/reveal-stage.tsx`). A "Share/Save recap
image" button renders a 1080×1920 PNG in the browser (`lib/recap-card.ts`, `components/recap-button.tsx`)
with the imposter, secret, rows (clues online, times in Timer, votes elsewhere) and the domain. The
online room's public projection gains `game.reveal` (imposter, word, votes) at result only; the online
result screen now shows the imposter, the word, and the clues with the imposter marked.
Reasoning in `docs/DECISIONS.md`.

Validation: 90 Vitest (1 new: reveal absent in every pre-result phase, present at result), TypeScript,
ESLint (2 pre-existing warnings), static build, 11 Playwright (updated: each mode walks the reveal —
blank until tapped, lands on the real imposter, shows the secret, domain present — then the result; the
online spec asserts no broadcast carried `reveal` before the result and that all three phones see the
imposter, word and clues; the timer and online specs capture the recap download and check its
filename). Reveal states and both recap PNGs were inspected from Playwright captures at desktop and at
390×844. The pane's mobile emulation misplaces screenshots, so phone visuals came from Playwright, not
the pane; the real share sheet on a phone is untested here.

Next step: deploy; the owner films the 20-second Timer Imposter demo (shot list in the session
notes); then the free-cap decision and analytics.

## Variant modes (2026-09-11, adopted)

Three pass-and-play variants ship at their own indexable URLs, from `docs/GROWTH.md` bet 2:
`/timer-imposter/` (hidden stopwatch, guess-the-target steal), `/question-imposter/` (one player
gets a different question and is not told; no final guess), `/drawing-imposter/` (one stroke per
turn on a shared canvas, colour-coded by player, word guess to steal). Rules live in
`lib/timer-imposter.ts`, `lib/question-imposter.ts`, `lib/drawing-imposter.ts` over the shared
`lib/deduction.ts`; 60 question pairs in `lib/questions.ts`; UI in `components/variants/` (shared
handoff/ballot/result pieces, a canvas `sketch-pad.tsx`, and a static `variant-page.tsx` frame with
how-to, rules and FAQ rendered at build time). Home and the rules page link to all three; all three
are in the sitemap. Exact rule choices are in `docs/DECISIONS.md`.

Validation: 89 Vitest (15 new: shared rules, and for each variant allowed/rejected transitions,
privacy retreat, ties, escapes, guess tolerance/word guess), TypeScript, ESLint (2 pre-existing
warnings), static build, and 11 Playwright specs (4 new: each variant played from setup to the
branded result including the handoff guard, hidden digits while the stopwatch runs, identical
question cards with exactly one odd, one-stroke-per-turn with a redo, and a crawlability check of
the rendered HTML, titles and cross-links). Result, stopwatch and canvas screens were inspected
from Playwright screenshots. Touch drawing was verified by the owner on a real phone on 2026-09-11 (owner report). Not
verified: how the variant SERPs respond (needs deploy + GSC).

Next step: deploy, request indexing for the three URLs in GSC, and post the short demo clip per
`docs/GROWTH.md` day 4–5; then the free-cap decision and analytics remain the open day-1 items.

## Share-loop basics (2026-09-11, adopted)

From `docs/GROWTH.md` bet 1. Invite links now carry the room code (`/online/?room=CODE`; the address
bar mirrors it while in a room and resets on leave; a guest landing by link gets the join form first
with the code filled), the lobby offers native share on phones and copy elsewhere plus an inline-SVG
QR of the same link, the social preview is a committed PNG rendered from the SVG source
(`npm run og`, `scripts/render-og.mjs`), and the site name is on screen everywhere: "BY LAUGHTABLE"
under the wordmark on all twelve headers (`components/brand.tsx`), LaughTable and the domain in the
footer, "Played on laughtable.com" on both result screens, " | LaughTable" on every title. Reasoning
in `docs/DECISIONS.md`.

Validation: 74 Vitest (6 new for `inviteUrl`/`roomIdFromSearch`), TypeScript, ESLint (same 2
pre-existing warnings), static build, and the 7 Playwright specs, with `online.spec.ts` extended so
one guest joins through a lower-cased invite link with tracking junk, the host URL and QR label are
asserted, and the result screen must name the domain. Manually, against `wrangler dev` with two
origins for separate storage: create → URL carries code → guest lands on the join-first form → joins →
host reconnects by URL after a Worker restart → copied link is the code link → leave resets URL; a full
pass-and-play round at 375 px ends on "Played on laughtable.com"; the PNG preview was viewed at
1200×630. Not verifiable here: how chat apps actually unfurl the PNG (needs the deploy; check with
the Facebook/X/Discord debuggers after `npm run deploy`).

Not changed: the free player cap (owner's pricing call, scored highest in `docs/GROWTH.md`), the two
"coming soon" lobby cards, analytics (still none). `.claude/launch.json` gained `worker-8787` because a
stale `next-server` held port 3000 during this session.

Next step: deploy, then check the preview with the platform debuggers; then decide the free cap and
add cookieless analytics so the loop can be measured (`docs/GROWTH.md` day 1–2).

## Growth research (2026-09-11, proposals only)

A distribution audit is recorded in `docs/GROWTH.md`. It ranks 18 opportunities and proposes four
bets (share-loop fixes and cap change, fast variant modes such as Timer Imposter, a filmable reveal
plus a ≤€500 creator test, themed packs on a holiday calendar). The share-loop half of bet 1 is now
adopted (above); the cap change, analytics, and everything else remain proposals until recorded in
`docs/DECISIONS.md`.

## Built

Initial pass-the-phone game is playable locally. Next.js 16.3.4 + React + TypeScript static export; custom responsive CSS; original optimized detective-club artwork; self-hosted fonts. Cloudflare Workers Static Assets configuration is included.

Features: 3–5 free editable players, 120 starter words in five packs plus mixed, category hints, secure browser randomness, private role handoffs, a 650 ms rapid-tap guard, secret hiding on blur/visibility loss, optional sound, pause/resume discussion timer, private non-self voting, tie/plurality resolution, final imposter guess, results, and replay. Rules dialog and guarded exit are implemented. Settings stay across rounds but not refreshes.

## Rate limiting (adopted)

A `RateLimiter` Durable Object (`src/worker.ts`) gives a fixed-window per-IP counter, keyed per rate-limited action (`create-room:<ip>`, `mint-code:<ip>`, `premium-verify:<ip>`, `premium-status:<ip>`), failing open on any internal error so a rate-limiter bug can never take down the feature it's protecting. Enforced: room creation via WebSocket join (the action that actually allocates a persistent Durable Object) at 6/15min, the cheap `POST /api/rooms` code-mint at 20/15min, `POST /api/premium/verify` at 10/10min (protects the Stripe API call budget), `GET /api/premium/status` at 60/min. Client IP comes from Cloudflare's own `CF-Connecting-IP` header, which a client cannot spoof. Verified live against `wrangler dev`: hit each threshold and got the expected 429/error exactly at the configured limit, one request early and one late. This does not replace Cloudflare's own network-layer DDoS protection (already automatic for anything behind Cloudflare) — it addresses application-level abuse (mass Durable Object creation, Stripe API exhaustion) that the network layer doesn't see.

## Security hardening (adopted)

A review of the Worker on 2026-09-10 found four issues, all now fixed and covered by regression
tests; the rationale is in `docs/DECISIONS.md`.

- **Seat hijacking (was: any player could read another player's secret word).** Player ids are
  broadcast to the whole room, and an id alone used to be enough to re-join as that player, which
  kicked them off their socket and delivered their private role to the attacker. Seats now carry a
  server-minted secret that goes to one socket only and is required to reconnect.
- **No turn authorization (was: any player could speak and vote in everyone else's name).** The
  Worker accepted `clue`, `vote`, `open-ballot`, `privacy` and `start-vote` from any connected
  player and attributed them to whoever's turn it actually was; one player could submit every clue
  and cast every ballot. `actionIsAuthorized` in `lib/game.ts` now states who may take each action,
  and the online client only shows the clue box and ballot to the player whose turn it is.
- **Free room probing.** `GET /api/rooms/{code}` now rejects a foreign `Origin` and is capped at 30
  connections per 5 minutes per IP, so room codes cannot be swept and Durable Objects cannot be
  spun up for free from any web page.
- **Unlimited entitlement minting.** A `RedemptionLedger` Durable Object caps `/api/premium/verify`
  at 5 tokens per Stripe session, charged only after payment is confirmed. Token lifetime is 3
  years with silent renewal on `/api/premium/status`, replacing an effectively permanent 20-year
  token.

The four lower-severity findings are now fixed too: the entitlement token moved out of the URL into
a POST body, a client-supplied premium token can no longer throw and take room creation with it,
`public/_headers` sets CSP/`frame-ancestors`/nosniff/`Referrer-Policy`/`Permissions-Policy`/HSTS on
every static response, and a socket is capped at 20 messages per second. Verifying the headers also
turned up a pre-existing bug outside the review: `wrangler.jsonc` declared no `binding` for the
asset namespace, so the Worker's fallthrough threw and **every 404 answered 500** — crawlers
included. Adding the binding fixes it. Only the dev-only `sharp` advisory and the accepted
transferability of an accountless entitlement remain open (`docs/SECURITY-BACKLOG.md`).

## Validation completed

- 73 Vitest tests pass, including 19 added for the hardening pass: seat secrets absent from every broadcast, hijack attempts with a correct player id refused, legitimate reconnect still restoring the private role, off-turn clues and stuffed ballots refused, host-only vote calls, imposter-only final guesses, foreign-origin sockets refused, room-probe rate limiting, the per-payment mint cap, per-socket
  flood limiting counted separately per socket, and an unverifiable premium token reading as "not
  premium" instead of throwing.
- Domain tests cover setup validation, word selection, replay exclusion, reveal ordering, illegal transitions, privacy transitions, vote authorization, duplicate actions, ties, wrong accusations, and final guesses.
- TypeScript and ESLint pass. Production static build passes.
- Playwright E2E passes for online multiplayer and sitemap coverage. The multiplayer spec now also runs two attacks against the real Worker over real sockets: a raw WebSocket re-join using a victim's public player id (refused, victim stays connected) and an out-of-turn clue sent straight down the socket past the UI (refused, no clue recorded). Both were confirmed to fail against the pre-fix code, so they are not vacuous.
- Three new E2E checks pass against a real wrangler response, which is the only thing that can
  prove `public/_headers` is honoured: the security headers on `/`, a missing page answering 404
  rather than 500, and `/api/premium/status` rejecting the old `?token=` form while accepting a POST
  body. A full three-client online round also passes under the CSP, confirming the same-origin
  WebSocket and the room API are not blocked by `connect-src`.
- The full Playwright suite passes, 7/7. The two previously stale specs are fixed: `generator.spec.ts` now asserts "Add player" is *enabled* at the free cap and walks the intended conversion path (overshoot to 6 players → "This setup needs Premium" naming the reason → "Use free setup instead" → back to 5 and generate), and it asserts the premium-only upgrade cards are absent for an unpaid visitor. `seo-pages.spec.ts` no longer pins the build's Stripe configuration: it accepts either the real "Unlock with Stripe" link or the "Stripe link pending" placeholder, so it passes with or without `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` baked in. Its sitemap route list also gained the missing `/privacy/`, so all ten canonical routes are now covered.
- Browser: checked the turn-gated online panels at 1280 and 390 px across three separate browser contexts — the player on the cursor sees the clue box or ballot, everyone else sees a waiting note, and the vote grid excludes the voter. No horizontal overflow at either size.
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

## Premium prompts off the acquisition path (adopted)

The standing `UpgradeCard`s in `components/game.tsx` and `components/generator/imposter-generator.tsx` now render only for a viewer who is already premium (`{premium && …}`). Rationale is in `docs/DECISIONS.md`: the category/player-slot premium tags plus `PremiumPaywallNotice` at start-or-generate time already do the selling, at a better moment, and the `premium-packs` card could never convert anyone because those packs are unbuilt and the card therefore carries no checkout button. On `/imposter-game-generator/` the two cards were also pushing the how-it-works content and word categories — the content that has to earn that page's ranking — below two ad blocks.

Prompted by a visual review of the live site at 1280 and 390 px in the context of submitting to party-game directories, which list "free browser party games": the free tier genuinely qualifies (full game, three free categories, five players, online rooms, no signup), but five of eight categories carrying lock badges plus a Stripe card above the fold read as more paywalled than the product is.

Validation: 73 Vitest tests, TypeScript, ESLint (2 pre-existing warnings, unrelated), and the static build all pass. In the browser against `npm run dev`, both pages render without the cards, the premium tags remain on the category grid, and the paywall still fires correctly — selecting Date night and pressing "Generate roles" produces the inline "This setup needs premium" notice naming the reason, with "Unlock with Stripe" and "Use free setup instead". Not verified: the already-premium rendering path (needs a verified entitlement token in the browser), and the homepage paywall was not re-clicked separately — it is the same component and the same edit as the generator's, which was verified.

## Not implemented

Authentication, analytics, ads, and real-time 3D remain unimplemented. The owner submitted `https://laughtable.com/sitemap.xml` to Google Search Console on 2026-09-09 (per owner report, not independently verified from this repo — no GSC access here); indexing/coverage/query data has not yet been checked and is too early to expect (same-day `site:laughtable.com` search still returned nothing, consistent with a fresh submission, not a problem). Keyword data remains pending. The production domain is `laughtable.com`. Starter words (including the two new premium categories) still need user playtesting; no claims of keyword volume or ranking difficulty have been verified. Five of the seven listed premium features (custom word packs, classroom/family mode, branded rooms, longer history, printable cards) are still unbuilt — the player cap and the two premium categories are live.

## Next work

Deploy: `main` now carries the security fixes (seat hijacking, turn authorization) and production is still serving pre-fix code. Keep local play available. Set the `STRIPE_SECRET_KEY` and `ENTITLEMENT_SECRET` Worker secrets, then do one real end-to-end payment as the owner to confirm the verify → unlock flow works before exposing the checkout button to real visitors (see README's "Premium checkout" section). After deployment, verify `https://laughtable.com/premium/` and confirm `https://laughtable.com/sitemap.xml` lists all ten canonical URLs (`lib/seo.ts` has listed ten since `/privacy/` was added; the live sitemap was verified to carry all ten).

## Local preview

`npm run dev` serves http://localhost:3000. See README for reproducible install, check, build, and Cloudflare preview commands.

## Premium payment (implemented, not yet live-verified)

Stripe Checkout is wired end to end: `/premium/`, the local generator, pass-and-play setup, and the online room lobby show a real "Unlock with Stripe" link once `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` is baked into a build. The buyer returns to `/premium/success/?session_id=…`, which calls the Worker's `POST /api/premium/verify` — this checks the session directly against the Stripe API (never trusting the session id alone) and, only if paid, mints a signed entitlement token stored in that browser's `localStorage`. `GET /api/premium/status` re-verifies that token's signature and expiry wherever a page needs to know if the current browser is premium. The Worker never sees or needs the actual Stripe secret key or signing secret from a client.

The only feature actually gated on this so far is the player cap (`freePlayerLimit` → `premiumPlayerLimit`, `lib/limits.ts`) in local pass-and-play, the generator, and online rooms (fixed per-room at creation by whether the host presented a valid token).

Automated coverage (44 Vitest tests total): token sign/verify round-trips and tamper/expiry rejection (`tests/entitlement.test.ts`); the Worker's `/api/premium/verify` and `/api/premium/status` handlers with Stripe's API mocked — missing secrets, malformed JSON, bad session id shape, a failed Stripe lookup, an unpaid session, and a legitimately paid one (`tests/worker-premium.test.ts`); and `ImposterRoom.join()`'s premium-flag/player-cap logic itself, run directly against a stubbed Durable Object storage — a valid token unlocks the room past 5 players, a forged or wrong-secret token does not (`tests/worker-room.test.ts`).

What automated tests cannot cover, by nature: the real Stripe API's actual behavior (only assumed here, via mocks) and the real WebSocketPair/HTTP-upgrade plumbing in `fetch()` (covered once by a manual `wrangler dev` + live-WebSocket smoke test this session, not committed as a repeatable test). Not yet verified at all: an actual real-money Stripe Checkout round trip end to end — that still needs the owner to set the two Worker secrets and complete one real payment before this goes live to visitors.

## Privacy policy (adopted)

A `/privacy/` page is live, linked from the homepage and generator footers and from `/premium/`, and included in the sitemap. Written to accurately reflect what this specific system actually does: no accounts, ephemeral Durable Object room data, what's kept in browser localStorage, Stripe handling all payment/card data (we only ever receive a Checkout session ID, verified server-side), transient IP use for rate limiting, no analytics/ads/tracking. Contact: justinas@appcognita.com. This has not been reviewed by a lawyer — treat it as a solid, honest starting point, not a substitute for legal review before handling personal data at real scale.

## WebSocket Hibernation migration (adopted)

`ImposterRoom` (`src/worker.ts`) now uses Cloudflare's Hibernation WebSocket API (`state.acceptWebSocket`, `state.getWebSockets`, `ws.serializeAttachment`/`deserializeAttachment`) instead of `server.accept()` + in-memory event listeners and a `Map<WebSocket, playerId>`. Purely a cost/scale optimization — the object can now spin down to zero compute between messages instead of staying billed for the whole time any socket is connected — with no functional or visible change for players. Ambient types added to `src/cloudflare.d.ts` (this project hand-rolls Durable Object types rather than depending on `@cloudflare/workers-types`). Verified: 53 Vitest tests (updated stubs plus a new reconnect-kick test exercising exactly the logic this touched most) pass, and a full 3-player round — join, roles, three clues, a disconnect — plus the room-not-found and rate-limit protections were re-confirmed live against `wrangler dev`, not just stubs.

## Online room setup parity (adopted)

The online lobby was missing category, discussion-duration, and imposter-hint controls entirely — `start()` hardcoded `category: 'mixed', minutes: 3, hints: true` with no way for the host to change any of it. `components/online.tsx` now shows the same category grid (with premium categories tagged and paywalled, mirroring pass-and-play) plus duration/hint controls to the host in the lobby before starting. Also added an optional "Expecting how many players?" selector on room creation (3–20): picking above the free cap shows an immediate premium heads-up, but never blocks creating the room or restricts who can actually join beyond the real server-enforced cap (5 free / 20 premium) — it's a heads-up based on what the host expects, not a new hard limit.

## Local dev server for the real Worker

`.claude/launch.json` gained a `worker` configuration (`wrangler dev --port 3000 --local`) alongside the existing plain `next dev` one, since online-mode features need the actual Worker (API routes, Durable Objects), not just the Next.js dev server.
