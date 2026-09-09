# Decision log

## 2026-09-08 — Project-local shared instructions (adopted)

Keep AGENTS.md as the shared instruction source, with CLAUDE.md importing it. Store three focused skills in `.agents/skills` and link them into `.claude/skills`. This keeps future Codex and Claude sessions aligned without modifying global configuration.

## 2026-09-08 — Application architecture and visual style (proposed)

Prefer indexable public HTML, a separate game domain, private authoritative rooms, and progressive visual effects. A polished tabletop style is a candidate. Framework, backend, hosting, brand, and final visual design remain unselected.

## 2026-09-08 — SEO opportunity (unverified)

The user's keyword findings are pending. Do not record low competition or high volume as independently established facts, or make revenue/ranking promises.

## 2026-09-08 — Initial playable version (adopted)

Use Next.js 16.3.4, React 19, TypeScript, custom CSS, self-hosted fonts, Lucide icons, and Vitest. Use original illustration and CSS motion first; Motion, Tailwind, and Three.js were candidate tools, not necessary dependencies for this slice. Keep the domain pure in lib/game.ts and words in lib/words.ts.

The user accepted the all-Cloudflare direction. The first version is a static export served by Workers Static Assets, with no adapter or backend required. Future private rooms will use Durable Objects. No production deployment was requested or performed.

Initial rules now use 3–5 free players, exactly one imposter, 2/3/5-minute optional discussion timer, optional category hint, one private non-self vote per player. Unique plurality accuses; ties favor the imposter. A caught imposter may win with one correct final guess. Guess matching ignores case, whitespace, punctuation, and accents but does not perform fuzzy matching. Replay preserves setup and avoids immediate word repeats.

Rounds are ephemeral and device-local. Hidden DOM states prevent accidental reveals, not inspection via developer tools. Do not reuse the client-side secret model for network play. `https://laughtable.com` is the default canonical origin for production metadata, robots, and sitemap output.

## 2026-09-08 — Online room foundation (adopted)

Rooms use a six-character non-ambiguous code mapped to one Cloudflare Durable Object. The public room projection includes only player identity, connection state, host state, status, and round number. Roles and words are sent in a separate per-socket message. A reconnect may reuse a UUID player ID; a room does not trust the room code as authorization. The worker rejects stale round actions and requires active membership. The remote turn protocol is intentionally incomplete until its client controls and multi-browser tests are in place.

## 2026-09-09 — Imposter game generator page (adopted)

Target the "imposter game generator" intent with one useful canonical route at `/imposter-game-generator/`. The page should generate a playable secret word and private role cards from the shared starter word packs instead of acting as a thin keyword page. Keep keyword volume and difficulty claims out of copy until the user supplies dated source data.

## 2026-09-09 — SEO support pages (adopted)

Add `/imposter-game-rules/` and `/imposter-game-words/` as distinct support pages for rules and word-list intent. Keep the content editorial and finite rather than creating mass-generated variants. Use one shared Open Graph image for the initial public launch.

## 2026-09-09 — Second SEO side-page batch (adopted)

Add a finite group of distinct support pages: `/imposter-word-generator/`, `/imposter-game-categories/`, `/imposter-game-online/`, and `/imposter-game-strategy/`. Each page must provide standalone utility and link to the relevant playable flow. Do not create thin spelling, city, or category permutations until keyword data justifies separate pages and the content can be meaningfully different.

## 2026-09-09 — Premium payment gate foundation (adopted)

Expose premium features as locked upgrade surfaces until Stripe is connected. Do not unlock premium features from query parameters, local storage, or other client-only state. A public Stripe Payment Link may be used as the checkout entry point, but actual access should require server-side verification through a Stripe webhook or verified Checkout session before enabling premium word packs, custom packs, classroom/family mode, branded rooms, longer history, larger rooms, or printable/PDF packs.

## 2026-09-09 — Free player cap for premium positioning (adopted)

Set the free player limit to 5 for pass-and-play, the role-card generator, and online rooms. Keep the premium target at 20 players, but do not unlock it until Stripe payment is connected and entitlement is verified server-side.
