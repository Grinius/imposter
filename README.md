# Imposter

A playable secret-word party game for 3–12 friends sharing one phone. Original detective-club artwork, private role reveals, discussion timer, private voting, a final imposter guess, and replay.

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
```

## Cloudflare

The initial version uses Next.js static export and Cloudflare Workers Static Assets. It requires no running Next.js server, database, or OpenNext adapter. `wrangler.jsonc` is ready for a Cloudflare account when deployment is requested.

```sh
npm run build
npm run preview                 # Local Cloudflare runtime
npx wrangler deploy --dry-run    # Validate without publishing
```

For an authorized public launch, set `SITE_URL` to the actual HTTPS origin in the build environment (see `.env.example`), then run `npm run deploy` while authenticated to the intended Cloudflare account. No domain is hardcoded. Without `SITE_URL`, the build emits noindex metadata and disallows crawling, with no invented canonical URL. The build includes original artwork and self-hosted fonts. No analytics, ads, accounts, or payments are enabled.

## What is built

- Editable 3–12 player names; five packs of 24 words each and a mixed category.
- Exactly one imposter, optional category hints, independently randomized first clue giver.
- Hidden handoff screens, rapid-tap guard, secret hiding on blur/visibility loss.
- A 2, 3, or 5 minute discussion timer with pause/resume; voting can start earlier.
- One private vote per player, no self-votes. Unique plurality accuses a player; ties favor the imposter.
- A caught imposter gets one final guess. Replay avoids immediately repeating a word.
- Mobile and desktop layouts, keyboard controls, reduced-motion support, optional synthesized sound.

## Next

Private online rooms are not implemented. They will use an authoritative Cloudflare Durable Object per room; the current same-device state is not a secure multiplayer backend. See [architecture](docs/ARCHITECTURE.md).

The initial art uses an illustration with CSS motion, not a real-time 3D scene. Word packs are a starter editorial selection and still need playtesting across ages and cultures. SEO keyword data and the production domain remain pending.

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
