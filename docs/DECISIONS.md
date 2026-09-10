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

## 2026-09-09 — Stripe entitlement architecture (adopted)

Live Stripe (not test mode), one-time payment via a Shareable Payment Link, product category "Software as a service (SaaS) – personal use." No account system exists, so entitlement is device-bound: the buyer returns from Checkout to `/premium/success/?session_id={CHECKOUT_SESSION_ID}`, the Worker's `POST /api/premium/verify` confirms payment directly against the Stripe API and mints a signed (HMAC-SHA256, `lib/entitlement.ts`) token stored in that browser's `localStorage`; `GET /api/premium/status` re-verifies it wherever a page needs to know if the current browser is premium. Only `STRIPE_SECRET_KEY` and `ENTITLEMENT_SECRET` (Worker secrets, never client-visible) can produce a valid token — nothing trusts a client-reported premium claim on its own. This intentionally does not survive a cleared browser or a new device; revisit if/when an account system exists (e.g. for room history, which needs one anyway).

Only the player cap (`freePlayerLimit` → `premiumPlayerLimit`) is actually gated on this so far, since it is the only premium feature with real mechanics already built. The other six listed premium features remain unbuilt and say so honestly in the UI once a viewer is verified premium, rather than implying they are delivered. Deployment of the frontend build with the live Payment Link baked in is intentionally deferred until the owner sets both Worker secrets and completes one real end-to-end payment themselves.

## 2026-09-10 — Online room and entitlement hardening (adopted)

A security review of the Worker found four issues that are now fixed; the ones deliberately left for
later are listed in `docs/SECURITY-BACKLOG.md`.

**A seat has a public handle and a private credential.** Player ids are broadcast to every player in
the room (clients need them for host and turn checks), so an id can no longer be what proves
ownership of a seat. Each seat now also carries a server-minted `secret` (`RoomPlayer` in
`lib/online.ts`), sent to exactly one socket in a `seat` message and stored per room code in that
browser. Reconnecting requires it. Neither half is ever accepted from the client: previously a
client could supply its own player id at room creation. `publicRoom()` is the single projection that
reaches clients and rebuilds players from an explicit four-field pick, so a secret cannot leak into
a broadcast by being added to a type later. Before this, any player could re-join using another
player's broadcast id, which disconnected that player and handed over their private role and secret
word.

**The server authorizes every action against the round's own cursor.** `actionIsAuthorized` in
`lib/game.ts` states, per action type, who may take it: the cursor player for `clue`, `vote`,
`open-ballot` and `privacy`; the host for `start-vote`; the imposter for `guess` and `skip-guess`;
nobody for the pass-and-play `reveal`/`hide`. It lives with the rules rather than in the Worker
because it is the same "whose turn is it" question `transition` already encodes, and it is
exhaustive so a new action type will not compile until its authorization is stated. `transition`
attributes a clue or a ballot to `round.cursor` rather than to the sender, so without this any
player could speak and vote in every other player's name — and the online client showed the clue box
and ballot to everyone, so this happened through the ordinary UI, not just crafted messages. The
client now gates both on `game.cursorPlayerId`, and the vote grid excludes the voter.

**Opening a room socket costs something.** `GET /api/rooms/{code}` is rate limited at 30 per 5
minutes per IP and rejects a foreign `Origin` (a missing one is still allowed, for non-browser
clients and tests). WebSockets are exempt from the same-origin policy, and every probe instantiates
a Durable Object, so without both, 32^6 room codes could be swept for free from any web page.
Expect the local e2e suite to trip the room-creation cap after a few consecutive runs; clear
`.wrangler/state/v3/do/imposter-game-RateLimiter` to reset it.

**One payment mints a bounded number of entitlements.** A `RedemptionLedger` Durable Object, one
instance per Stripe Checkout session id, caps `/api/premium/verify` at 5 tokens per payment, charged
only after Stripe confirms the session is paid so failed attempts cost a buyer nothing. It fails
open, like the rate limiter: a ledger outage must not stand between a buyer and what they paid for.
Token lifetime drops from 20 years to 3, and `/api/premium/status` returns a renewed token once one
is inside its last two years, so a device that keeps playing stays unlocked indefinitely while an
abandoned or copied token eventually dies. Full non-transferability and revocation are not
achievable without accounts and are not attempted.
