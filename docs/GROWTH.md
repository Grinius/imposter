# Growth and distribution research

Written: 2026-09-11. Source: live inspection of laughtable.com, competitor pages, TikTok tag/discover pages,
press explainers, Similarweb estimates, and web search. Reddit was inaccessible to the research tools
(blocked for the search API, fetch, and the browser pane), and Google Trends rate-limited the session, so
community demand below is inferred from TikTok, competitor content, and press rather than Reddit threads,
and seasonality is inferred from competitor traffic and holiday content rather than a Trends chart.

Status of every item here: **proposal / research finding**, not a confirmed requirement or a measured
result. Record any decision taken from this document in `docs/DECISIONS.md` and mark the item here as
adopted, rejected, or superseded with the date.

## 1. Diagnosis

The "imposter word game" web category is saturated roughly 12 months after its TikTok peak, and
LaughTable enters it with a weaker free tier than the incumbents under a brand that does not appear on
the page.

- **Clone field.** Direct web competitors observed: play.gameonfamily.com/imposter, imposter.app,
  imposterwords.com, word-impostor.com, wordimpostor.com, findtheimposter.com, impostergames.org,
  impostergame.net, impostergames.io, playimposter.com, playimposteronline.com, impostergenerator.com,
  impostorwho.com, bluffin.app, toz-app.com, imposter.online, imposter-game.io, playcircle.io. Localized
  clones exist in Spanish (juegoelimpostor.es, elimpostoronline.com, impostorjuego.online, impostor.me),
  German (findtheimposter.com/de) and Polish (graimpostor.pl, impostor-gra.pl, toponton.pl/impostor).
  The App Store lists 25+ "Imposter … Word Game" apps with ids in the 674x–676x range (late-2025 launches).
- **The leader is shrinking.** Similarweb estimates play.gameonfamily.com at ~145K visits over three
  months, −53% month over month, 77% organic search, top keywords "imposter game / imposter / imposter
  game online" (https://www.similarweb.com/website/play.gameonfamily.com/). Its about page claims 40M+
  games, 150M+ player-rounds, 8,000+ ratings, 3.7 players per game. It gives away 6,000+ words in 50+
  categories, printable slips, an online mode and 2,700-word guides, and it ships a browser tool for each
  TikTok game trend within weeks (Timer Imposter, Ride the Bus, Island Game, Celebrity Game).
- **Free tier below the trend's group size.** The Tab's explainer describes 7 players + 1 imposter
  (https://thetab.com/2025/09/22/heres-how-to-start-the-iconic-imposter-game-all-the-girlies-are-playing-on-tiktok-rn);
  gameonfamily says "optimal 6–10". LaughTable's free cap is 5 players and 3 categories (120 words);
  a 6th player triggers the Premium prompt. Competitors are free to 12–20 players.
- **Broken invite loop.** Creating a room keeps the URL at `/online/` and "Copy invite" copies exactly
  that (`components/online.tsx`, `copyInvite`); the recipient must type the code. Competitors ship
  `site/online/CODE` links and QR codes (imposter.online, impostergame.net, playimposter.com).
- **Links do not unfurl.** `og:image` is `/og/laughtable-imposter.svg` (2.9 KB, `image/svg+xml`).
  WhatsApp, iMessage, Discord, Slack, X and Facebook do not render SVG previews.
- **Brand mismatch.** Every visible surface says "imposter."; "LaughTable" appears only in OG alt text
  and the privacy page. `site:laughtable.com` returned nothing on 2026-09-11.
- **Generic positioning.** The current copy is interchangeable with the clones. The domain is broad
  enough for a hub of viral TikTok table games, which the clones' exact-match domains are not.

Positioning recommendation: brand = LaughTable (visible in header, result screen, and spoken URL);
product = "the viral TikTok party games, in your browser, no app", with Imposter as game #1 and its
variants as games #2–4. "Date night"/couples is a category name, not a use case (the game needs 3+).

## 2. Product inspection (2026-09-11)

| Area | Observed |
|---|---|
| Home | Setup above the fold; 4 players pre-filled, "4 / 5 free"; 3 free categories, 5 premium-tagged; 2/3/5-min discussion; hint toggle. ~120 ms TTFB, 37 KB HTML. |
| Flow | Setup → private reveals → clue turns → discussion → private votes → tie/plurality → final guess → result → replay. |
| Result screen | Winner, imposter, word, vote breakdown. No share, copy, image, or brand mark. Only moment the phone is naturally turned to the group/camera. |
| Online rooms | Name + expected players → 6-char code → lobby → per-player private roles over WebSocket; typed clues stored (`lib/online.ts`). Lobby shows two "Premium · coming soon" cards between code and settings. |
| Premium | Stripe Checkout, 3-year device-bound entitlement; only the 5→20 player cap is gated; six "coming soon" features on the paywall page. |
| SEO pages | Generator, word generator, rules, words, categories, online, strategy, privacy, premium; all target phrases the clones already hold. |
| Analytics | None. No tactic can currently be measured. |
| Shareability | No code-in-URL, no QR, no result card, SVG OG image, no custom words. |

## 3. How competitors get users

| Player | Evidence |
|---|---|
| Game On Family | 77% organic; cited by press explainers (The Tab links only to it); builds a tool per TikTok trend; long guides and word lists. |
| Fakeit: Imposter Game (app) | Paid TikTok creator seeding ("Check out the @Fakeit app" @archie.grace; "#FakeIt #ad" @megan.bone). |
| Splash Party Games (app, PL) | Polish creators tag "[REKLAMA] Aplikacja: @splashpartygames" (@podejrzani_pl). |
| LowKey Imposter Game (app) | Own TikTok account (@lowkeyimpostergame) posting rounds. |
| Imposter Party (imposterparty.app) | `/tiktok-party-game` landing page, 16 languages, "#ImposterParty", "pass one phone, film with another". |
| Impostor Who? / Bluffin / TOZ / playimposterwords | Programmatic occasion and use-case pages (Thanksgiving, Christmas, office teams, music words, "football imposter game" claimed 650/mo). |
| Undercover (Yanstar) | 7.5M+ App Store / 5M+ Play; app-store incumbency since 2014. |
| Discord | impostr.io, Impostor Bot, "El impostor" exist; Discord has no global browse surface. |
| Gartic Phone / skribbl.io | Streamer-driven invite-link loop; not replicable for a 5-minute pass-the-phone game. |

Gaps nobody in the clone field fills well: fast variant shipping (only gameonfamily), a filmable
branded reveal, and a shareable-pack loop.

## 4. Where demand already exists

1. "How do I play the TikTok imposter game / what app": TikTok discover pages exist for dozens of
   phrasings ("impostor word game app", "what app to use for the imposter game", "game where everyone
   has the same word except one person", "list of words for secret word imposter"). Real but contested.
2. **New variants (2026), least served:**
   - Timer / Buzzer / Stoplight Imposter / Timer Ladder: everyone sees a target time except the imposter;
     each runs a hidden stopwatch; the group judges by feel. Driven by @9kamz (284.8K followers, 43.3M
     likes), @mercbros, @thesidelinebros, @crossoverbros. Discover pages: "Imposter Game Timer App",
     "How to Play The Timer Impostor Game", "Button Timer Game Exact Time". Only gameonfamily has a tool
     (https://play.gameonfamily.com/timer-imposter/).
   - Question Imposter (same question for all, different one for the imposter): discover page exists;
     served by apps and impostergames.io only.
   - Drawing Imposter (@9kamz); imposter.app has a rules page, no tool found.
   - Wavelength × Imposter hybrid (@highlandbros, 2026): no tool anywhere.
3. Themed/fandom rounds: Collingwood FC "Taylor Swift themed imposter game", @wots.team K-pop round,
   discover pages "Imposter Game Kpop", "The Imposter Game Taylor Swift", "NFL imposter game".
4. Seasonal: Halloween (31 Oct) and Christmas; competitors already hold "Christmas imposter game words"
   and occasion pages; party-game demand peaks Nov–Jan.
5. Non-English: Polish, German, Spanish are large and already cloned. Lithuanian is empty (only a Flash
   portal page) — tiny ceiling, zero competition, presumably the founder's home network.
6. Classrooms: TES/TPT/Scribd resources and YouTube Shorts exist, but 42 US states have phone laws and
   30 are bell-to-bell bans (EdWeek, Jan 2026). Path is Chromebook + room code (Blooket model) or
   printables, requiring 30-player rooms and multiple imposters. Real, not a 2–6-week win.
7. Office/remote teams and Discord/Zoom: fit is fine, demand diffuse, competitor content exists.
8. Couples: not a fit (3+ players).

## 5. Opportunity scoring

Scores 1–10; effort scored so 10 = trivial; overall = mean.

| # | Opportunity | Traffic | Prob. | Speed | Effort | Compound | PMF | Viral | Overall |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Raise free cap to 8–10 players; monetize packs/features instead | 7 | 9 | 9 | 10 | 8 | 10 | 7 | 8.6 |
| 2 | Share-loop basics: PNG OG image, code-in-link, QR, brand on screen | 6 | 9 | 9 | 9 | 8 | 10 | 8 | 8.4 |
| 3 | Variant modes at own URLs (Timer, Question, Drawing) + explainers | 7 | 6 | 6 | 5 | 8 | 8 | 7 | 6.7 |
| 4 | Filmable reveal screen + recap card + watermark | 5 | 5 | 7 | 7 | 7 | 8 | 8 | 6.7 |
| 5 | Paid seeding: 3–5 micro TikTok creators in the imposter genre (≤€500) | 6 | 5 | 8 | 7 | 4 | 9 | 8 | 6.7 |
| 6 | Themed packs + pages on a calendar (Halloween → fandoms → Christmas) | 6 | 6 | 6 | 6 | 7 | 8 | 6 | 6.4 |
| 7 | Lithuanian localization + home-market seeding | 3 | 8 | 8 | 7 | 4 | 8 | 6 | 6.3 |
| 8 | Custom shareable packs (UGC pack links, later indexable) | 6 | 5 | 4 | 4 | 9 | 8 | 7 | 6.1 |
| 9 | Drinking-mode toggle + rules page | 4 | 5 | 8 | 8 | 5 | 7 | 5 | 6.0 |
| 10 | Directory/backlink batch (itch.io, AlternativeTo, listicle outreach) | 3 | 7 | 6 | 8 | 6 | 6 | 2 | 5.4 |
| 11 | Press/explainer outreach (student media, "how to play" writers) | 5 | 3 | 4 | 6 | 7 | 8 | 4 | 5.3 |
| 12 | Own TikTok account posting rounds | 5 | 3 | 4 | 3 | 6 | 8 | 7 | 5.1 |
| 13 | Discord Activity | 5 | 4 | 3 | 3 | 7 | 7 | 5 | 4.9 |
| 14 | Reddit posts (unverified; Reddit inaccessible during research) | 3 | 4 | 7 | 8 | 3 | 6 | 3 | 4.9 |
| 15 | Classroom mode (30 players, multi-imposter, vocab packs) + TPT/Pinterest | 6 | 4 | 3 | 3 | 8 | 6 | 3 | 4.7 |
| 16 | Office/remote-team icebreaker page + Slack communities | 3 | 4 | 5 | 7 | 5 | 6 | 3 | 4.7 |
| 17 | Show HN / Product Hunt | 4 | 3 | 7 | 8 | 3 | 4 | 3 | 4.6 |
| 18 | Couples / date-night positioning | 2 | 2 | 5 | 7 | 3 | 3 | 3 | 3.6 |

Tiers: **A (48 h)** #1, #2, plus cookieless analytics. **B (this week)** #3 (Timer first), #4, #10,
start #7. **C (next month)** #5, #6, #8, #9, #11, #12. **D (ignore for now)** #13, #15, #16, #17, #18;
#14 only if live threads can be verified.

## 6. Distribution bets

### Bet 1 — Unbreak the loop before touching any channel

> **Status 2026-09-11:** items (a) PNG preview, (b) code-in-link, (c) QR, and (e) site name on screen
> are adopted (`docs/DECISIONS.md`). (d) free cap and (f) lobby cards remain open; analytics still missing.
- Insight: every channel ends in a link pasted into a group chat or a phone turned toward friends;
  today the link has no preview, no room code, and the screen carries no name.
- Changes: 1200×630 PNG/JPG OG image per page; `/online/CODE` deep links that auto-join, and "Copy
  invite" copies that; QR in the lobby; free cap → 8 (or 10) with premium = packs + custom words + 20
  players; "LaughTable · laughtable.com" in the header and on the result screen; move the two "coming
  soon" cards out of the lobby.
- Effort ~1 day. Measure: rooms created → players joined; share of joins via `/online/CODE`; share
  clicks; paywall-prompt rate at setup. No kill criterion — table stakes.

### Bet 2 — Be the fastest tool for new imposter variants ("SEO before SEO")

> **Status 2026-09-11:** `/timer-imposter/`, `/question-imposter/` and `/drawing-imposter/` are built and
> linked (`docs/DECISIONS.md`). Wavelength × Imposter is not. Explainer outreach and demo clips are still to do.
- Insight: the generic SERP is 18 clones deep; variant SERPs are 0–1 deep and TikTok mints variants
  monthly. The tool that exists the week a variant trends gets the explainer links and the "how to play
  X app" traffic.
- Assets: `/timer-imposter/` (target time instead of word; reuse the pass-and-play scaffold),
  `/question-imposter/` (~60 question pairs), later `/drawing-imposter/` and `/wavelength-imposter/`.
  Each: playable tool + 400–600-word explainer + short vertical demo clip.
- Queries: `timer imposter game`, `imposter timer app`, `buzzer imposter game how to play`,
  `question imposter game`.
- Effort: Timer 1–2 days, Question 1 day + content, Drawing 3–4 days. Measure: GSC impressions/clicks
  per variant URL, rounds per variant, referral links. Kill: after 30 days <100 impressions per page
  and stalled variant hashtags → stop variants, go all-in on Bet 4.

### Bet 3 — Make the reveal filmable, then pay ≤€500 to put it in 3–5 videos
- Insight: imposter TikToks film faces, not phones; the reveal is the one on-camera moment. Competitor
  apps already pay creators in this genre (Fakeit, Splash), so the format is proven.
- Assets: a reveal screen built for a phone held to camera (full-bleed, suspense animation, "THE
  IMPOSTER WAS … / THE WORD WAS …", `laughtable.com` in the corner); for online rounds an auto-generated
  recap card (each player's typed clue + the imposter) — the overlay creators currently hand-edit; a
  UTM'd short link per creator.
- Brief: play one normal round, film the phone for 3 s at the reveal, say "we used laughtable.com".
  Pay 3–5 creators at 10–60K followers €80–150 each; no single large creator. 2026 rate cards put micro
  creators at €150–1,500/video (influencermarketinghub.com).
- Expected: 50–300K views → 1–5K visits. Measure: visits per short link within 72 h, rounds per visit,
  "what site is that" comments. Kill: first two paid videos <300 visits combined → stop paying, keep the
  reveal screen, move budget to a Halloween push.

### Bet 4 — Themed packs on a calendar, ending in shareable custom packs
- Insight: themed rounds keep the format fresh on TikTok (Swift, K-pop, football, NFL) and holidays are
  when families play; packs are cheap content with their own landing pages and give creators a reason to
  post; custom packs turn that into UGC links that land on the domain.
- Assets: `/packs/halloween/` by 1 Oct, then football, K-pop, pop-superstar (avoid trademarked names in
  URLs/titles); each page shows the word list (crawlable) and a "Play this pack" button; later
  `/packs/new` → `laughtable.com/p/<id>` (noindex until moderated). Themed packs free; charge for custom
  packs + 20 players.
- Effort 2–3 h per pack; custom packs 3–4 days. Measure: rounds per pack, pack-link shares, GSC clicks
  per pack page. Kill: by 15 Nov no pack page >50 GSC clicks and no creator used a pack → stop packs,
  invest in variants.

### Optional Bet 5 — Home market
Lithuanian UI + ~150 Lithuanian words seeded through the founder's network, university groups, and LT
TikTok/media. Zero competition, tiny ceiling, but can deliver the first 1–2K real users in a week and
clean word-of-mouth data. Worth ~2 days only if the network exists.

## 7. Path to 10,000 users without Google and ≤€500

Define a user as a unique visitor who starts a round (requires analytics first).

1. Days 1–2: Bet 1 + analytics. Nothing else until previews, code links, and the cap are fixed.
2. Days 3–5: Timer Imposter + filmable reveal; one demo clip from the founder's own group.
3. Days 5–7: home-market seed (target 1–2K).
4. Days 6–12: creator test — DM 20 micro accounts, pay 3–5 (€300–450 total) (target 2–5K).
5. Days 8–14: Halloween pack + page; DM 20 fandom/party accounts; reply under new variant videos
   (target 1–2K).
6. Weeks 3–6: double down on whichever of {variants, creators, packs} produced the cheapest
   round-starter; spend the remaining €50–200 there. Halloween week (27–31 Oct) is the biggest organic
   window in the period.

Base case is 4–7K round-starters in six weeks; 10K needs one creator breakout or a press hit. The
Nov–Dec season is where the category's real volume is.

## 8. 14-day execution plan

| Day | Task |
|---|---|
| 1 | Cookieless analytics (round start/complete, room create/join, share clicks, UTM). PNG OG image per page. "LaughTable · laughtable.com" in header and result screen. Deploy. |
| 2 | `/online/CODE` deep links + auto-join; "Copy invite" copies the code link; QR in lobby. Free cap → 8 (decide 8 vs 10; 20 stays premium). Remove "coming soon" cards from the lobby. Two-phone test. |
| 3 | Timer Imposter on the pass-and-play scaffold at `/timer-imposter/` with a 500-word explainer; sitemap + GSC indexing request. |
| 4 | Filmable reveal screen; online recap card with "Save image"; film a 20-s vertical Timer Imposter demo. |
| 5 | Post the demo (TikTok/Reels/Shorts). Submit to itch.io (web, party-game) and AlternativeTo; email 5 "free Jackbox alternatives / browser games with friends" listicle authors (cbr.com, gamebuddies.io, gamesocial.io, dinogame.gg, winrogames.com). |
| 6 | Creator list: 20 accounts at 10–60K followers from #impostergame, #timerimposter, #guesstheimposter; DM 10 with the brief and per-creator short links. |
| 7 | LT localization (if Bet 5) or Question Imposter content (60 pairs). Reply under 10 new variant videos with the tool link. |
| 8 | DM the other 10 creators; close 3–5 deals (€80–150 each). Ship `/question-imposter/`. |
| 9 | Halloween pack (60 words, 3 difficulty bands) + `/packs/halloween/`. Email writers who covered the 2025 trend (The Tab, Her Campus, Dexerto) about Timer Imposter. |
| 10 | First creator videos live; watch short-link traffic hourly; answer every "what site" comment; fix what traffic breaks. |
| 11 | Football + K-pop packs and pages; DM 20 fandom/party accounts. |
| 12 | LT seed day (network, 3 uni groups, 2 media pitches) or start Drawing Imposter. |
| 13 | Review analytics by source (creator link / variant page / pack / LT / directory); kill or scale per criteria. |
| 14 | Plan the next two weeks from the numbers; fund the winning channel; schedule Thanksgiving/Christmas packs; decide on custom shareable packs. |

## 9. Key sources

- Competitor leader: https://play.gameonfamily.com/imposter/ , /about/ , /how-to-play/ , /timer-imposter/ ,
  https://play.gameonfamily.com/ ; traffic estimate https://www.similarweb.com/website/play.gameonfamily.com/
- Press explainer: https://thetab.com/2025/09/22/heres-how-to-start-the-iconic-imposter-game-all-the-girlies-are-playing-on-tiktok-rn
- Competitor landing/marketing: https://imposterparty.app/tiktok-party-game , https://www.imposterwords.com/ , https://impostr.io/
- TikTok: https://www.tiktok.com/tag/impostergame ; @9kamz (Buzzer Imposter 7647216293745249539, Timer
  Imposter 7662802149608344854, Drawing 7633864817027173654); @mercbros 7647648354188397855;
  @thesidelinebros 7651051350817525022; @highlandbros 7643242623272013087; @collingwoodfc
  7536115775833148679; @wots.team 7539089698858241286; @megan.bone 7552318151329942839 (Fakeit #ad);
  @podejrzani_pl 7574380464023031 (Splash [REKLAMA]).
- TikTok discover: /discover/imposter-game-timer-app , /discover/how-to-play-the-timer-impostor-game ,
  /discover/how-to-play-the-impostor-question-game , /discover/juego-del-impostor
- Trend context: https://genz.ai/trends/gaming/drops/spot-the-imposter-and-tiktok-game-challenges/
- Apps: Undercover https://apps.apple.com/us/app/undercover-word-party-game/id946882449 ;
  Fakeit https://play.google.com/store/apps/details?id=com.smakapps.imposter
- Discord: https://docs.discord.com/developers/platform/activities , https://www.impostorbot.com/
- Classroom context: https://www.edweek.org/technology/teachers-like-cellphone-bans-but-not-for-themselves/2026/01 ,
  https://ballotpedia.org/State_policies_on_cellphone_use_in_K-12_public_schools
- Creator rates: https://influencermarketinghub.com/influencer-rates/tiktok-influencer-rates/
- Occasion/theme pages at competitors: https://toz-app.com/en/blog/party-games/music-imposter-game-words ,
  https://impostergamewords.com/christmas-imposter-game-words , https://bluffin.app/occasions/christmas/ ,
  https://playimposterwords.com/imposter-game-for-office-teams/
- Portals/launch: https://docs.crazygames.com/faq/ , https://itch.io/games/platform-web/tag-party-game ,
  https://www.shno.co/marketing-statistics/product-hunt-launch-statistics
- Localized clones: https://juegoelimpostor.es/ , https://impostor.me/en , https://findtheimposter.com/de/ ,
  https://graimpostor.pl/ , https://impostor-gra.pl/
