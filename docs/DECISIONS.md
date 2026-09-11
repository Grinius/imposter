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

## 2026-09-10 — Remaining security findings closed (adopted)

The four lower-severity findings left over from the hardening pass are now fixed, leaving only the
dev-only `sharp` advisory and the accepted transferability of an accountless entitlement
(`docs/SECURITY-BACKLOG.md`).

**The entitlement token stops travelling in a URL.** `/api/premium/status` is a `POST` that reads
the token from the request body. It is a bearer credential, and query strings are written to request
logs and analytics, where anyone with log access could lift and replay one.

**Verifying a premium claim can no longer break what it is attached to.** `verifiedEntitlement` in
`src/worker.ts` turns any failure — malformed token, unset or non-hex `ENTITLEMENT_SECRET` — into
"not premium". Previously a well-formed two-part token was enough to reach `hexToBytes`, which threw
whenever the secret was unconfigured (its state until launch) and took room creation down with it.

**Static responses carry security headers.** `public/_headers` is served by Workers Static Assets
and applies to every asset response, including the 404 page; API responses from the Worker do not
pass through it. `script-src`/`style-src` allow `'unsafe-inline'` because a static export has no
server to issue a per-request nonce and Next inlines its own hydration payload — the policy's real
work here is blocking script and connection *origins*, which is what would stop an injected script
or an exfiltrated premium token. `connect-src` names `wss://laughtable.com` alongside `'self'`:
Chrome treats `'self'` as covering a same-origin WebSocket, verified here with a full three-client
round, but that reading has not always held everywhere and a blocked socket would break online play
silently. Keep that host in step with `lib/site.ts`. HSTS is set without `includeSubDomains`, so a
future subdomain is not forced onto HTTPS before it is ready.

**A socket cannot flood its room.** `ImposterRoom` allows 20 messages per second per socket, answers
the first message over the line with one explanation, and drops the rest in silence — replying to a
flood per message would double it. The counters are in memory, not storage: a flooder keeps the
object awake so the counter lasts exactly as long as the flood, and a quiet room that hibernates
loses only zeroes.

**`wrangler.jsonc` now names the asset binding.** Found while verifying the headers rather than in
the review itself: the Worker's `env.ASSETS` fallthrough threw on every unmatched URL because the
assets block declared no `binding`, so missing pages answered 500 instead of serving the 404 page.
Crawlers would have seen 500s for every probe of a URL that does not exist.

## Premium prompts moved off the acquisition path (2026-09-10)

**The always-on upgrade cards no longer render for visitors who have not paid.** `components/game.tsx`
and `components/generator/imposter-generator.tsx` wrapped their `UpgradeCard`s in `{premium && …}`.
A paid viewer still sees them, because "what have I got and what is still coming" is real information
to that person; a first-time visitor does not.

Two things were doing the same job in the same column. The premium tags on the category grid and the
player rows create the desire, and `PremiumPaywallNotice` asks for the money at the moment the player
presses start or generate — after they have named six friends or picked Date night, with the reason
spelled out. That prompt is better timed than a card sitting above the fold before anyone has played
a round. The cards were the redundant half.

The `premium-packs` card was the clearer cut: those packs are not built, so `UpgradeCard` renders it
with no checkout button at all. It could not convert anyone by construction, and it sat on the page
that has to earn the "imposter game generator" ranking, pushing the explanatory content and the word
categories below two ad blocks.

The reasoning behind this is a bet, not a measurement. There is no conversion rate to protect yet —
the Stripe round trip has never run with real money and the site has no organic traffic — so the cost
of being wrong is currently near zero and the change is a one-line revert. Revisit it with real
numbers once payments are live-verified and traffic exists; putting the cards back and watching what
happens is the experiment, and it needs traffic to mean anything.

The category tags, the player-slot tags, the `/premium/` link in the setup links, and every
server-side premium rule are untouched.

## 2026-09-11 — Share-loop basics: invite links, QR, PNG preview, site name on screen

Source: `docs/GROWTH.md` bet 1. Four things a party game needs before any distribution channel can
work, none of which existed on the live site.

**The invite is `/online/?room=CODE`, a query parameter, not `/online/CODE`.** The site is a static
export served by Workers Static Assets: `/online/` is one HTML file, and a path segment would need a
Worker rewrite to reach it and would 404 under plain `next dev`. The parameter costs nothing, survives
being lower-cased or having `utm_` junk appended (`roomIdFromSearch` validates and upper-cases), and
the page keeps the address bar equal to the invite while in a room via `history.replaceState`, so the
URL a host copies from the bar and the one the button copies are the same thing. A code in the URL
beats the remembered room: a pasted invite always goes where it says. A guest arriving by link sees the
join form first (code filled, name next, one gold button); the create form moves under the rule. Leaving
resets the URL to `/online/` so a stale link is not left in the bar.

**Native share where it exists.** `navigator.share` on phones, the clipboard elsewhere; a dismissed
share sheet (`AbortError`) is not an error. Both paths carry the code link, never the bare page.

**The QR is inline SVG from `qrcode`'s module matrix, not an `<img>` data URL.** No innerHTML, no
change to the `img-src` policy in `public/_headers`. It renders only while the room is in the lobby.
`qrcode` is the one new runtime dependency; the audit still reports only the pre-existing dev-only
`sharp` advisory.

**The social preview is a PNG rendered from the SVG source.** WhatsApp, iMessage, Discord, Slack, X
and Facebook do not unfurl an SVG `og:image`. `scripts/render-og.mjs` (`npm run og`) renders
`public/og/laughtable-imposter.svg` to `public/og/laughtable-imposter.png` with `sharp`, which moved
from a transitive to a declared dev dependency; both files are committed. The SVG copy now reads
"Imposter — the secret-word party game", not "game generator", because the same image serves every
page.

**The site name is on every screen without redrawing the header.** The wordmark stays "imposter."
(the game) with "BY LAUGHTABLE" beneath it (`components/brand.tsx`, used by all twelve headers); the
footer names LaughTable and the domain; both result screens carry "Played on laughtable.com" — the one
screen that gets turned toward the table or a camera; every `<title>` ends in " | LaughTable". This
is the reversible half of the positioning question in `docs/GROWTH.md`; renaming the wordmark itself
is not decided.

**Not done here, deliberately:** the free player cap (5) is unchanged — that is a pricing decision
for the owner (`docs/GROWTH.md` scores it highest); the two "coming soon" cards in the lobby are
unchanged; there is still no analytics, so none of this can be measured yet.

## 2026-09-11 — Variant modes at their own URLs: Timer, Question, Drawing Imposter

Source: `docs/GROWTH.md` bet 2. The generic "imposter game" SERP is a clone field; the variants that
TikTok creators are minting in 2026 have zero or one tool each. Each variant is a playable page with
its own rules, tests, and static explainer.

**Rules are separate modules, not flags on the word game.** `lib/timer-imposter.ts`,
`lib/question-imposter.ts` and `lib/drawing-imposter.ts` each carry an explicit phase machine;
`lib/deduction.ts` holds only what is genuinely identical (name validation, extracted from
`validateSettings` without changing its messages; vote validity; tally with tie → nobody). A rule
change in one variant therefore cannot leak into another, and each module is tested on its own
(`tests/variants.test.ts`).

**Exact rule choices.** Timer: target drawn uniformly from the chosen range in hundredths of a
second; the imposter sees only the range; each player runs the stopwatch once, blind (the UI never
renders digits while running; times are capped at 3600 s); tie or wrong accusation → imposter;
caught → one guess, stolen if within max(0.30 s, target/10). Question: the odd question goes to one
player who is *not told* — every card looks identical — so there is no bluff and no final guess;
caught → friends, otherwise imposter. Drawing: same word packs and premium gate as the word game;
one continuous stroke per turn (a dot counts), two passes by default, strokes kept in 0–1
coordinates with the player index so the reveal is colour-coded; one redo before confirming is a
UI courtesy, not a rule (the rule sees only the kept stroke); caught → one word guess via
`normalizeGuess`. All three keep the word game's privacy behaviour: a lost focus during a reveal or
ballot retreats to the handoff screen, and the 650 ms handoff guard is shared.

**Invites carry no state.** Variants are pass-and-play only; there is no online mode for them yet
and the pages are indexable, unlike `/online/`.

**Pages are real HTML.** `components/variants/variant-page.tsx` renders how-to steps, rules, and FAQ
at build time around the client game; the three pages cross-link, the home page and rules page link
to them, and they are in the sitemap (`publicRoutes`). Titles follow the "X Imposter Game - …" shape
that matches how people search for the TikTok variants.

**Not done:** no online rooms for variants, no analytics (still), no themed content for the
question pack beyond the 60 built-in pairs. Touch drawing on a real phone was confirmed by the
owner the same day (pointer capture had only been exercised with a mouse in Playwright).

## 2026-09-11 — Filmable reveal stage, recap image, and the online result reveal

Source: `docs/GROWTH.md` bet 3 (the product half; the creator test is the owner's).

**The result is gated behind a tap.** In every mode the round now ends on `components/reveal-stage.tsx`:
a full-bleed, portrait-composed overlay that shows nothing until the host taps "Reveal the imposter",
runs a slowing roulette over the names (14 ticks, 70 → 520 ms, always landing on the imposter),
flashes the name in, then the secret, then a "See the full result" tap. Every step is a tap so a
phone held up to a camera never advances on its own; `prefers-reduced-motion` skips the roulette.
The domain sits in the corner throughout. The full result (votes, times, drawing, recap) comes after.

**Online rooms now reveal at result — and only then.** `PublicGame.reveal` (`imposter`, `word`,
`votes`) is added to the broadcast projection exclusively when `phase === 'result'`; before that
the imposter's seat and the word still travel only in private role messages. Covered in
`tests/online.test.ts` and, across three real sockets, in `tests/e2e/online.spec.ts`, which records
every broadcast and asserts none carries `reveal` before the result. Until now the online result
screen showed only "Friends win!" and a reason — nobody was told who the imposter was.

**The recap is a 1080×1920 PNG drawn in the browser** (`lib/recap-card.ts`): imposter, secret,
generic rows (typed clues online; everyone's time in Timer; vote counts otherwise), verdict, and
the domain top and bottom. Nothing is uploaded. On touch devices it goes to the share sheet (which
offers "Save Image"); everywhere else it downloads. Desktop `navigator.share` is deliberately not
used: it is a poor fit for a download and in headless Chrome on macOS its promise never settles,
which would leave the button stuck.

**Not done:** no sound on the reveal (the word game's optional chime is untouched); the recap does
not include the drawing itself; no analytics, so how often the recap is saved is unmeasured.
