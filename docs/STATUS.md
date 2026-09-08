# Current status

Updated: 2026-09-08.

## Built

Initial pass-the-phone game is playable locally. Next.js 16.3.4 + React + TypeScript static export; custom responsive CSS; original optimized detective-club artwork; self-hosted fonts. Cloudflare Workers Static Assets configuration is included.

Features: 3–12 editable players, 120 starter words in five packs plus mixed, category hints, secure browser randomness, private role handoffs, a 650 ms rapid-tap guard, secret hiding on blur/visibility loss, optional sound, pause/resume discussion timer, private non-self voting, tie/plurality resolution, final imposter guess, results, and replay. Rules dialog and guarded exit are implemented. Settings stay across rounds but not refreshes.

## Validation completed

- 18 Vitest domain tests pass: setup validation, word selection, replay exclusion, reveal ordering, illegal transitions, privacy transitions, vote authorization, duplicate actions, ties, wrong accusations, and final guesses.
- TypeScript and ESLint pass. Production static build passes.
- Cloudflare Wrangler deployment dry run passes: 94 asset files, no runtime bindings. This did not publish anything.
- Browser: completed a four-player round with all private cards, timer start/pause, private ballots, caught imposter, correct final guess, matching vote totals, and replay to a different word.
- Browser: checked duplicate-name validation, a rapid double click at handoff, opening rules hides the secret, exit confirmation, and preserved settings after returning to setup.
- Browser: checked desktop layout and phone result/setup layouts; measured no horizontal overflow at 320, 390, and 768 px. Tested twelve players, player limit, and a long valid name. These are browser viewport checks, not physical-device testing.
- Export inspection verified HTML text, description metadata, eager-loaded artwork, included image, and preview noindex/robots behavior. Field Core Web Vitals and production indexing have not been measured.
- Artwork is 148,312 bytes as a 1280 px WebP. Provenance and final prompt are in ASSETS.md.

## Online mode slice built

The first online slice is implemented behind `/online/` and the Cloudflare Worker API. It has a six-character room endpoint, WebSocket Durable Object rooms, lobby presence, reconnecting player IDs, host-only start, per-player role messages, and round freshness checks. The shared local rules remain the source for round transitions.

This is a backend/lobby foundation rather than the complete remote turn UI: network clue discussion, distributed voting controls, per-player action authorization for every phase, and full separate-browser integration tests remain next. The current worker keeps the authoritative round object but still needs a complete network action protocol before public deployment.

## Not implemented

Authentication, analytics, ads, payments, real-time 3D, and production deployment remain unimplemented. Keyword data and production domain remain pending. Starter words still need user playtesting; no claims of keyword volume or ranking difficulty have been verified.

## Next work

Complete the remote turn protocol and UI on top of the room foundation: synchronize phases, deliver only the current player's secret, authorize each action on the server, and test two or more browser contexts. Keep local play available. Refine public content and routes when keyword research arrives. Supply the real SITE_URL for public-launch metadata and indexing.

## Local preview

`npm run dev` serves http://localhost:3000. See README for reproducible install, check, build, and Cloudflare preview commands.
