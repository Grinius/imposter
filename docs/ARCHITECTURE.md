# Technical direction

The initial version uses Next.js static export, React, TypeScript, custom CSS, and Vitest. Public HTML is generated at build time; gameplay runs on the shared device. Cloudflare Workers Static Assets serves out/. No backend or OpenNext adapter is needed for this slice.

Current files: lib/game.ts (pure transitions), lib/words.ts (120 starter words), components/game.tsx (UI and local round state), app/ (static page and metadata). Multiplayer below is the next architectural stage, not implemented functionality.

## Boundaries

- Game domain: pure state transitions and rule validation, independent of rendering and networking.
- Content: versioned word packs with stable IDs, language, category, difficulty, optional hints, and editorial review state.
- Interface: accessible HTML controls, responsive layouts, animation, and optional decorative 3D loaded separately.
- Room service: authoritative game state, authenticated player sessions, private per-player projections, persistence/expiry appropriate to hosting.
- Public content: indexable landing pages, rules, and useful word tools. Private room URLs should be excluded from search indexing and sitemaps; indexing directives are not access controls.

## Multiplayer invariants

Room codes locate rooms; player credentials authorize actions. Never broadcast all roles or the word to clients that must not know them. Host status does not grant secret visibility. Validate membership, phase, and action legality on the server. Handle duplicate/stale messages, concurrent votes, disconnect/reconnect, host departure, and room expiry explicitly. Reconnect restores the same player rather than creating duplicate seats. A new round invalidates old-round actions. Keep secrets out of URLs, analytics, public logs, and serialized public HTML.

## Scope and cost

Start with a complete local round, then implement private rooms against the same domain. A mock lobby is not working multiplayer. Public matchmaking, built-in voice, accounts, runtime AI players, payments, and persistent profiles are outside the proposed initial scope unless requested. Choose a room lifecycle and rate limits to bound cost. Do not deploy an in-memory-only room service across multiple instances without a coherent ownership/persistence strategy.
