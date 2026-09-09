# Current status

Updated: 2026-09-09.

## Built

Initial pass-the-phone game is playable locally. Next.js 16.3.4 + React + TypeScript static export; custom responsive CSS; original optimized detective-club artwork; self-hosted fonts. Cloudflare Workers Static Assets configuration is included.

Features: 3–5 free editable players, 120 starter words in five packs plus mixed, category hints, secure browser randomness, private role handoffs, a 650 ms rapid-tap guard, secret hiding on blur/visibility loss, optional sound, pause/resume discussion timer, private non-self voting, tie/plurality resolution, final imposter guess, results, and replay. Rules dialog and guarded exit are implemented. Settings stay across rounds but not refreshes.

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

## Not implemented

Authentication, analytics, ads, Stripe payment verification, real-time 3D, and Google Search Console submission remain unimplemented. Keyword data remains pending. The production domain is `laughtable.com`. Starter words still need user playtesting; no claims of keyword volume or ranking difficulty have been verified.

## Next work

Keep local play available. Connect Stripe Checkout with server-side entitlement verification before unlocking premium features. After deployment, verify `https://laughtable.com/premium/` and confirm `https://laughtable.com/sitemap.xml` lists all nine canonical URLs.

## Local preview

`npm run dev` serves http://localhost:3000. See README for reproducible install, check, build, and Cloudflare preview commands.

## Premium foundation

A locked premium surface is implemented at `/premium/` and in the local generator, pass-and-play setup, and online room lobby. The prepared premium feature set includes premium word packs, custom word packs, classroom/family mode, branded private rooms, longer room history, more players, and printable cards/PDF party packs. Access remains locked until Stripe payment is connected and verified. The optional `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` environment variable only supplies the outbound checkout link; it does not prove entitlement.
