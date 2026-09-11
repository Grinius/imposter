# Web SEO plan

## Evidence status

The user will supply keyword research later. No volume, difficulty, country, seasonality, or revenue metric is currently verified. The initial search found multiple dedicated competitors; it did not establish exact Google positions in the intended market.

### 2026-09-10 competitive check (source: Claude WebSearch/WebFetch, US market, no login/location control — not a rank tracker)

- The user supplied a 7-site "top of Google for imposter game generator" list (impostergamegenerator.com, imposter-game-generator.com, impostergamesgenerator.com, psycatgames.com/app/imposter, imposter.app, imposterwho.com, imposterword.com). A same-day WebSearch for the identical phrase returned a **different** set of top results (play.gameonfamily.com, playimposter.com, impostergames.org, imposter.app, impostergenerator.com, impostergamewords.com; a second query also surfaced imposter-game-generator.com, impostergamegenerator.com, charades-generator.com). Only `imposter.app` and `imposter-game-generator.com`/`impostergamegenerator.com` appeared in both. This confirms the SERP for this phrase is volatile/personalized and not a fixed top-7 — no source here is an authoritative rank tracker (SERP API, Search Console, or similar), so treat all of it as directional, not a verified position.
- At least 10 distinct competitor domains were observed across both lists, several of them exact- or near-exact-match domains for "imposter game generator" (a domain-relevance signal, though no longer a strong Google ranking factor on its own).
- Sampled competitor content depth: impostergamegenerator.com is a real interactive generator (~650 words, FAQ, 15 categories, 3–20 players) — comparable in shape to our own `/imposter-game-generator/`. imposterwho.com is a thin app-store landing page (~85 words), not a real competitor for this on-page intent despite ranking for the brand term. Could not fetch imposter.app/online/ (403) or verify the others in this batch.
- `site:laughtable.com` returned **zero results** — the production domain is not indexed by Google at all yet, and Search Console submission is still unimplemented (confirmed against `docs/STATUS.md`). This is the actual current blocker, ahead of ranking position: an unindexed page cannot rank top-3 for anything, regardless of on-page quality or competitor weakness.
- No backlink, domain-age, or traffic data for any competitor was available through these tools; do not infer competitor authority from page content alone.

When data arrives, retain its source and date. Capture keyword, country, language, volume, difficulty, intent, current ranking URLs, and proposed destination. Distinguish the party game from unrelated meanings of “imposter.” Group synonyms by intent before creating pages. Cover both spellings naturally where useful.

## Candidate pages

- Main playable imposter game.
- `/imposter-game-generator/`: functional word and role-card generator for the "imposter game generator" intent.
- `/imposter-word-generator/`: word-only utility for groups that already know the rules and need a fast secret word.
- `/imposter-game-rules/`: rules, example clues, voting, and final-guess explanation for "imposter game rules" and "how to play imposter game" intent.
- `/imposter-game-words/`: curated starter word lists by category for "imposter game words" and "imposter word list" intent.
- `/imposter-game-categories/`: category-selection guide with static examples and starter words.
- `/imposter-game-online/`: crawlable online-play landing page that links into the private room app.
- `/imposter-game-strategy/`: clue, bluffing, and voting guide for strategy intent.
- Private room creation/joining app at `/online/`.
- `/timer-imposter/`, `/question-imposter/`, `/drawing-imposter/`: playable variant modes with static
  explainers, targeting the 2026 TikTok variant queries ("timer imposter game", "imposter timer app",
  "question imposter game", "drawing imposter") where the SERP is thin (see `docs/GROWTH.md` §4).

These are candidate page types, not a commitment to separate URLs for every phrase. Each indexable page needs distinct utility; avoid interchangeable location/category pages and mass-generated keyword permutations. Do not expose the current round's secret words in supporting content.

## Technical baseline

Deliver meaningful public content and links in HTML. Use descriptive titles, headings, canonicals, correct response codes, and a sitemap containing only intended canonical public pages. Keep private room pages out of the index. Avoid indexing every filter combination. Use structured data only when it truthfully matches visible content and is supported for the intended use; do not invent reviews or expect FAQ rich results.

Load decorative graphics progressively. Reserve layout space for images and any later ads. Target good Core Web Vitals (LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1 at the 75th percentile); lab checks during development do not establish field results. Measure actual pages after launch.

Once a domain exists, configure Search Console and validate indexing. Track game starts, completed rounds, replay, and room joins without collecting secret roles, words, or unnecessary personal data. Separate actual results from forecasts.

## Search Console

The production domain is `https://laughtable.com`. Submit `https://laughtable.com/sitemap.xml` in Google Search Console after each public route batch. Search Console access requires the owner's Google account and is not stored in this repository.

## Official references

Verify current guidance when implementing:
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- https://developers.google.com/search/docs/appearance/core-web-vitals
