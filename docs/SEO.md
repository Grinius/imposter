# Web SEO plan

## Evidence status

The user will supply keyword research later. No volume, difficulty, country, seasonality, or revenue metric is currently verified. The initial search found multiple dedicated competitors; it did not establish exact Google positions in the intended market.

When data arrives, retain its source and date. Capture keyword, country, language, volume, difficulty, intent, current ranking URLs, and proposed destination. Distinguish the party game from unrelated meanings of “imposter.” Group synonyms by intent before creating pages. Cover both spellings naturally where useful.

## Candidate pages

- Main playable imposter game.
- `/imposter-game-generator/`: functional word and role-card generator for the "imposter game generator" intent.
- `/imposter-game-rules/`: rules, example clues, voting, and final-guess explanation for "imposter game rules" and "how to play imposter game" intent.
- `/imposter-game-words/`: curated starter word lists by category for "imposter game words" and "imposter word list" intent.
- Private room creation/joining entry point.

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
