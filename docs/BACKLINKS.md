# Backlink intelligence: "imposter game generator" (2026-09-14)

Objective: get laughtable.com into the top Google results for `imposter game generator` by
replicating the competitors' legitimate link channels. Everything below is either **verified**
(fetched the page and read the `rel` attribute, or read it in a backlink index) or marked as an
estimate/unverified. Nothing is invented; where data was unavailable it says so.

## 0. Method and data limits (read first)

| Source | What it gave | Limit |
|---|---|---|
| Startpage (Google-sourced results, US-English) | Positions 1–20 for `imposter game generator`, 1–10 for `imposter game online` | Google itself served a bot check; Startpage results are Google's but not personalised/localised the same way. Startpage then rate-limited further queries. |
| DuckDuckGo HTML (Bing index) | Top 10 for `imposter game`, `imposter party game`, `imposter game word generator`, plus cross-checks | Bing index, not Google. Used only where Startpage was unavailable and labelled "Bing". |
| Seobility free Backlink Checker | Backlink counts, referring domains, a "domain rating" (0–100), top rows with Follow/Nofollow flags and a server-side search box, for **3 domains/day** | Used on gameonfamily.com, imposter.app, impostergame.net; quota then exhausted. Its index is partial (it did not contain thetab.com → gameonfamily, which is live). |
| `curl` + regex on every referring page | The real `rel` attribute, anchor text, target URL, bylines, dates | Ground truth for every "verified follow" claim below. |
| Ahrefs free checker, Majestic, SmallSEOTools, Moz | — | All behind Cloudflare/Turnstile human checks or login; not used (I do not complete CAPTCHAs). You can run Ahrefs' free checker yourself in ~2 minutes for the long tail of small domains; see §8. |

Authority numbers: only the three Seobility-checked domains have a measured figure. For everything
else "authority" is a qualitative label (national media / niche blog / new exact-match domain) and
is marked *est.*

Where laughtable.com stands today: not in the top 20 of any query checked. Search Console's first
week shows the site's only ranking phrases are the Timer-Imposter cluster (`docs/STATUS.md`).
`site:laughtable.com` search-mention discovery finds only the GitHub repo.

## 1. SERP competitor discovery

### `imposter game generator` — Startpage (Google-sourced), 2026-09-14

| # | Domain | Ranking URL | Title | Content type | Intent | Direct competitor | Authority |
|---|---|---|---|---|---|---|---|
| 1 | imposter.app | https://imposter.app/ | Play the Imposter Game Online \| Free Word Generator | Tool homepage + SEO subpages | Play now / generator | Yes | **DR 49** (Seobility), 126 ref. domains, 3,805 links — almost all from its own PsyCat Games network (see §2) |
| 2 | play.gameonfamily.com | https://play.gameonfamily.com/imposter/ | Play Imposter Game Online Free \| Word Generator, No App | Tool page on a family-games publisher | Play now | Yes | **DR 44** (Seobility), 665 ref. domains, 2,530 links — mostly to the 2017-era card-game blog, not the imposter page |
| 3 | impostergamewordgenerator.com | https://impostergamewordgenerator.com/ | Imposter Game Word Generator \| Free Online Party Game | Exact-match-domain tool | Generator | Yes | *est.* new EMD, no referring pages found by search |
| 4 | impostergame.ai | https://impostergame.ai/ | Imposter Game – Free Party Word-Guessing Game Generator | EMD tool | Generator | Yes | *est.* low; none found |
| 5 | imposter-game-generator.com | https://imposter-game-generator.com/ | Play Imposter Game Online - Free Generator for Friends & Parties | EMD tool + word-list pages | Generator | Yes | *est.* low; none found |
| 6 | impostergame.net | https://impostergame.net/ | Imposter Game Online - Play Free Multiplayer & Local (No Download) | Tool + programmatic subpages, 6 languages | Play now | Yes | **DR 33** (Seobility), 102 ref. domains — profile is PBN/"buy backlinks" pages plus a few directories (§2) |
| 7 | impostergames.org | https://impostergames.org/ | Imposter Game – Free Online Generator \| Pass & Play on One Phone | EMD tool | Generator | Yes | *est.* low |
| 8 | apps.apple.com | Fakeit app listing | Imposter Game: Spy — Fakeit | App store | App download | Excluded (store) | — |
| 9 | wordimpostor.com | https://www.wordimpostor.com/ | Imposter Game Online \| Word Impostor | Tool | Play now | Yes | *est.* low |
| 10 | play.google.com | at.vucak.impostor | Imposter Game - Party Edition | App store | App | Excluded | — |
| 11 | findtheimposter.com | https://findtheimposter.com/imposter-game-generator | Imposter Game Generator \| Free Secret Word Tool | Tool subpage; site has /classroom and a blog of "alternative to X" posts | Generator | Yes | *est.* low–mid; publishes its own listicles, no referring pages found |
| 12 | imposter-game.io | https://imposter-game.io/ | Imposter — the free online word bluffing game | Tool | Play now | Yes | *est.* low |
| 13 | csclub.uwaterloo.ca | /~s23adhik/myPosts/imposter.html | Impostor Game | Student's single-file game on a university host | Play now | No (but shows how weak the SERP is) | .edu host |
| 14 | impostergamegenerator.com | https://www.impostergamegenerator.com/ | Imposter Game Generator - Free Online Imposter Word Game | EMD tool | Generator | Yes | *est.* low |
| 16 | imposterwho.com | https://imposterwho.com/ | Imposter WHO? | App landing page | App | Partial | *est.* low |
| 17 | imposterword.com | https://imposterword.com/ | — | Tool | Generator | Yes | *est.* low |
| 18 | impostergamesgenerator.com | https://www.impostergamesgenerator.com/ | Imposter Game Generator \| Free Local Party Word Game | EMD tool | Generator | Yes | *est.* low |
| 19 | impostorkit.com | https://impostorkit.com/ | — | Tool | Generator | Yes | *est.* low |
| 20 | impostergame.net | /imposter-game-generator | second URL from #6 | | | | |

(Position 15 was an Instagram tag page; excluded.)

### Other queries (top 10)

- `imposter game online` — Startpage/Google: 1 imposter.app · 2 imposter.app/online/ · 3 findtheimposter.com/game · 4 play.gameonfamily.com/imposter/ · 5 impostergame.net · 6 Google Play "Imposter Who?" · 7 playimposteronline.com · 8 imposter.online · 9 imposter-game.io · 10 impostargame.com
- `imposter game` — Bing: imposter.app/online/, imposter-online.com/en, impostergame.net, imposter-game.io, gameonfamily, imposter.app, the-imposter.app, imposterland.com, imposterlive.com, imposter-game.com
- `imposter party game` — Bing: imposter-online.com/en, imposter.app/online/, imposterpartygame.app, imposteronline.net, imposterland.com, imposterlive.com, theimpostergame.io, imposter-game.com, impostergame.party, theimposter.io
- `imposter game word generator` — Bing: gameonfamily, muxgen.com/gaming-tools/imposter-game-generator, imposter.app, imposterwords.com/word-generator, impostergenerator.com/en, k13.games/imposter/word-generator, impostergamewordgenerator.com, playimposter.com/tools/random-word/, imposterwordgamegenerator.com, psycatgames.com/app/imposter/
- `imposter game generator` — Bing: gameonfamily, muxgen, imposter.app, impostergenerator.com, psycatgames.com/app/imposter/, impostergamesgenerator.com, impostergamegenerator.com, imposterwordgamegenerator.com, findtheimposter.com, playimposter.com

### Realistic targets

Two sites own the head of the SERP for structural reasons that are hard to copy: **imposter.app**
(PsyCat Games' network of ~20 sibling game domains cross-linking in footers) and
**gameonfamily.com** (a nine-year-old family-games blog with 665 referring domains, plus the only
national-press explainer link). Everything from position 3 down is a 2025–26 exact-match-domain
clone with, as far as any source I could reach shows, **no editorial backlinks at all**.
That is the realistic field: impostergamewordgenerator.com, impostergame.ai,
imposter-game-generator.com, impostergame.net, impostergames.org, wordimpostor.com,
findtheimposter.com, imposter-game.io, impostergamegenerator.com, imposterword.com. A handful of
genuine followed links from relevant pages should be enough to pass all of them; passing the top
two needs the press/explainer channel in §4.

## 2. Competitor backlinks (page-level, verified)

Legend — Follow status: **F-verified** = I fetched the page and the anchor has no `nofollow`/
`sponsored`/`ugc`; **NF-verified** = nofollow read on the page; **index-only** = Seobility said
Follow but I could not fetch the page.

| Referring domain | Referring page | Target | Anchor | Follow | Authority | Why they linked | Type | Obtainable for LaughTable? | Difficulty | Method |
|---|---|---|---|---|---|---|---|---|---|---|
| thetab.com | https://thetab.com/2025/09/22/heres-how-to-start-the-iconic-imposter-game-all-the-girlies-are-playing-on-tiktok-rn | play.gameonfamily.com/imposter/ | "Imposter Game" | **F-verified** | UK national student/youth media (*est.* high) | Writer (Harrison Brocklehurst) explained the TikTok trend and linked "the simplest way" to play — the tool with one-phone pass-and-play | editorial recommendation / trend explainer | Yes, for the *next* variant (Timer, Question, Drawing…) or a refresh of this piece | Medium | Pitch the writer the day a variant trends; see §4 pattern A |
| nolafamily.com | https://nolafamily.com/7-simple-family-game-night-ideas-for-chilly-evenings/ (by Madeline Pistorius, 2025-12-29) | play.gameonfamily.com/imposter/ | "Imposter" | **F-verified** | Regional parenting magazine (*est.* mid) | "No-board-needed" game-night idea list; imposter was the one online tool among Amazon board-game links | party-game roundup / blog article | Yes — the article is syndicated | Easy–Medium | One email to the syndicate (below) |
| coloradoparent.com | https://coloradoparent.com/7-simple-family-game-night-ideas-for-chilly-evenings/ (2026-01-05, author field `amelia@familyresourcegroupinc.com`) | play.gameonfamily.com/imposter/ | "Imposter" | **F-verified** | Regional parenting magazine (*est.* mid) | Same article syndicated by Family Resource Group Inc. (network footer also lists Baton Rouge Parents, Birmingham Parent, Cincinnati Family, Fidi Family, MetroFamily, Kid Scoop News) | syndicated roundup | Yes | Easy–Medium | Same email; one placement can land in 5–7 magazines |
| hsdial.org | https://hsdial.org/2026/04/30/from-screens-to-face-to-face-memories/ | gameonfamily.com/blogs/tutorials/imposter | "aim" | **F-verified** (rel=noopener noreferrer only) | High-school newspaper (*est.* low, but topical and real) | Student feature on the game at school; linked the rules page | student-press editorial | Yes, for other school papers | Easy | §4 pattern D |
| midnights-door.com | https://www.midnights-door.com/ | gameonfamily.com/blogs/tutorials/imposter | "Imposter" | **F-verified** | Hobby site (*est.* very low) | Rules hub for the owner's game night links to rule pages | resource page | Yes | Easy | Ask; low value |
| impostergamegenerator.click | https://impostergamegenerator.click/ | play.gameonfamily.com/imposter | (image/none) | index-only | Dead (HTTP 000 on 2026-09-14) | Clone that credited the original | other | No (dead) | — | — |
| pctechmag.com | https://pctechmag.com/2026/07/event-planners-secret-weapon-for-managing-crowds-without-chaos/ | impostergame.net | "imposter game", "imposter game online" | **F-verified** | Ugandan tech magazine (*est.* mid) | Two exact-match anchors in an unrelated event-planning article — reads as a paid placement | product mention (likely sponsored, unlabeled) | Not recommended | — | Skip; this is the kind of link the brief excludes |
| producthubx.com | https://producthubx.com/product/imposter-g-me-ultimate-online-word-decep-ion-experience/150509 | impostergame.net/?utm_source=producthubx.com | "Visit Website" | **F-verified** | Product directory (*est.* low) | Self-submitted listing | product directory | Yes | Easy | Submit; modest value |
| mrrscout.com | https://mrrscout.com/category/writing-content | impostergame.net | (site title) | **F-verified** (noopener noreferrer) | Indie-product directory (*est.* low) | Self-submitted listing, mis-categorised | product directory | Yes | Easy | Submit; modest value |
| arster27.itch.io | https://arster27.itch.io/imposter-game-online | playimposter.com | URL | **NF-verified** (nofollow noopener) | itch.io (high domain, but nofollow) | Dev listed a "web build" that just links out | game directory | Yes, but nofollow | Easy | Worth a listing for discovery, not for PageRank |
| truthordare.app, 5second.app, 2truths1lie.app, mostlikelyto.app, kingscup.app, hotseat.app, 20questions.app, doordrink.app, fishbowl.app, whatif.app, quizpanda.com, istinailiizazov.com, felelszvagymersz.com, prawdaczywyzwanie.com, adevarsauprovocare.com, nodtellersannhet.com, psycatgames.com | homepages / footers | imposter.app | "imposter" / "impostor" | Follow (index; footer of each site checked: all say PsyCat Games) | Each *est.* mid (Seobility link rating 40–44%) | Same owner — sitewide footer cross-links | site network | No (would need to own a network) | — | Not replicable; the honest equivalent is variants on laughtable.com itself |
| parse.gl, xploredomains.com | AI-answer page; "domains of the day" | imposter.app | URL | NF (index) | low | Automated | other | No value | — | — |
| link-legion-*.xyz, seo-anomaly-*.online, *.site "Boost your Google rankings" pages | — | gameonfamily, imposter.app, impostergame.net | spam | mixed | spam | Link-seller footprints | spam | No | — | Exclude |

Competitors where **no backlink data could be obtained**: impostergamewordgenerator.com,
impostergame.ai, imposter-game-generator.com, impostergames.org, wordimpostor.com,
findtheimposter.com, imposter-game.io, impostergamegenerator.com, imposterword.com,
impostorkit.com, muxgen.com, playimposter.com (beyond itch.io). Search-mention discovery for these
domains returned nothing except their own pages and app stores. That is consistent with zero
editorial links, but it is not proof — run them through Ahrefs' free checker to confirm (§8).

Competitor-run "best imposter games" listicles (imposter.online/games-like-among-us,
findtheimpostergame.com/blog/…, playcircle.io/games-like-imposter, impostorwho.com/blog/…)
do **not** link out to other tools; they are not link sources.

## 3. Referring-domain overlap

Strictly, only one domain links to two *imposter* competitors in the data available
(none of the small clones have any links to overlap). So I widened "competitor" to the adjacent
free browser party games that share the search intent and get linked from the same pages:
spyfall.app, codenames.game / horsepaste.com, garticphone.com, skribbl.io, wavelength.zone.
These are the pages that have already proved they link to free browser party games.

| Rank | Referring domain | Games linked (verified on page) | Link type | Follow? | Authority | Opportunity for LaughTable | Suggested outreach |
|---|---|---|---|---|---|---|---|
| 1 | cbr.com — https://www.cbr.com/jackbox-free-alternative-party-games/ | votesout.com, stopots.com, deathbyai.gg, qwiqwit.com, squabble.me, kahoot.it | "25 free Jackbox alternatives" roundup | **F-verified** (noopener noreferrer only) | Valnet network, very high (*est.*) | High: the list has no social-deduction/imposter entry at all; Imposter is the most-played party game of the year | Email the CBR games editor (five credited authors, updated 2025-03-03): "your 25 Jackbox alternatives is missing the game that beat Jackbox on TikTok — one phone, no app". Offer a 60-word blurb + screenshot |
| 2 | thesmartlocal.com — https://thesmartlocal.com/read/free-online-games/ | netgames.io (Avalon), horsepaste, skribbl.io, squabble.me, tgwerewolf.com, quizarium.com, garticphone.com, gabtoschi.itch.io/timeheist | "13 free online games to play with friends like Among Us" | **F-verified** (noopener) | Singapore mass media, high (*est.*) | High: already lists Avalon/Werewolf; Imposter is the one-phone version | Pitch an update: "Among Us in real life is now a one-phone game" |
| 3 | rachelandreago.com — https://rachelandreago.com/remote-team-building-games/ | spyfall.app, codenames.game, garticphone.com, skribbl.io, scattergoriesonline.net, colonist.io, geoguessr, playtaboo.com, play-charades.com | Remote team-building listicle | **F-verified** | Personal blog of Rachel Andrea Go (2023 post), mid (*est.*) | High: Spyfall is #1 on the list; Imposter is Spyfall without the location cards | "You lead with Spyfall — here's the 2026 version your readers are already playing on TikTok; works over Zoom with the online room" |
| 4 | questworks.io — https://www.questworks.io/blog/fun-team-building-games-remote.html | codenames.game, garticphone.com, skribbl.io, geoguessr, sporcle, thewikigame, wavelength.zone, kahoot.it, jackbox.tv | "20 fun team-building games for remote teams (2026)" | **F-verified** | Team-building vendor blog, mid (*est.*) | High: links Wavelength (the other TikTok party game) | Same angle; offer the `/online/` room mode |
| 5 | geekculture.co — two pages (see §6) | horsepaste, houseparty.com (dead), skribbl.io, secrethitler.io, werewolf Telegram bot | Quarantine-era free games list | **F-verified** (noreferrer noopener) | Singapore geek media, mid-high (*est.*) | High + broken-link angle | "Houseparty shut down in 2021 — swap it for Imposter" |
| 6 | brightful.me — https://www.brightful.me/blog/what-are-the-best-social-games-to-play-with-your-remote-team/ | skribbl.io, warofthewizards.net (now redirects to teambuilding.com), scattergoriesonline.net, garticphone.com, horsepaste.com | Remote social games list | **F-verified** (`?ref=` params, no nofollow) | Team-games vendor, mid (*est.*) | Medium: they sell their own games but link free ones | Replacement pitch for the redirected War of the Wizards entry |
| 7 | distractify.com — https://www.distractify.com/p/how-to-play-wavelength-game-explained | wavelength.zone/presskit | TikTok-trend explainer | **F-verified** (noopener noreferrer) | US entertainment media, high (*est.*) | Medium: they explain viral games and link the official site's press kit | Needs a `/press/` page; pitch the next variant |
| 8 | Family Resource Group syndicate (nolafamily.com, coloradoparent.com + 5 sister titles) | play.gameonfamily.com/imposter/ | Family game-night roundup | **F-verified** | Regional parenting mags, mid (*est.*) | High: only online tool in the piece; a "Halloween / Christmas game night" follow-up is natural | Pitch a seasonal pack page |
| 9 | seafish.io — https://www.seafish.io/blog/how-to-play-codenames-online/ | 20+ Codenames clones (codenames.game, horsepaste, netgames.io, kodenames.io…) | Developer's "every online version" list | **F-verified** | Personal dev blog, low-mid | Low (Codenames-specific) — but shows the "every online version of X" resource-page pattern | Not a fit; noted for the pattern |
| 10 | larryxu.com — https://www.larryxu.com/blog/online-board-games/ | codenames.plus, horsepaste, netgames.io, jackbox, playpseudonyms.com (dead), drawasaurus.org, starbound.space.fashion (dead) | Personal "online board games" resource page | **F-verified** | Personal blog, low | Low–medium; two dead links to replace | Broken-link email |

Pages checked that turned out to be **nofollow** or **no outbound links** (skip for PageRank):
melmagazine.com free-games list (nofollow), lkiconsulting.io Discord games (nofollow), itch.io
(nofollow), Product Hunt (nofollow by policy), and the AI-written game blogs dinogame.gg,
winrogames.com, gamezipper.com, gamenightcentral.net, curioroom.net, letsfib.com,
gamingrooms.net, doodleduel.ai, padlessbox.com, onlineparty.games, partygames.party,
gamebuddies.io — none link to third-party games.

## 4. Replicable backlink patterns

### A. TikTok-trend explainers in youth/entertainment media ("how to play the viral X game")
- **Why they link:** the article's job is "how do I play this thing I saw on TikTok"; the writer links the tool they used. The Tab does it every time: Password Game → neal.fun (2023), Imposter → gameonfamily (2025-09-22), Star By Face → starbyface.com (2026-09-14). Distractify linked wavelength.zone's press kit.
- **Asset needed:** a variant that exists *before* the writer searches for it, with a plain URL, one-phone mode, a 3-line "how to play", and a `/press/` page with screenshots and a one-paragraph description. `docs/GROWTH.md` already identified this ("the tool that exists the week a variant trends gets the explainer links").
- **Prospect queries:** `site:thetab.com "how to play" tiktok game`, `site:distractify.com "how to play" tiktok game`, `site:dexerto.com "viral" game tiktok "how to play"`, `site:dailydot.com tiktok challenge explained game`, `"tiktok" "party game" "how to play" 2026 -site:tiktok.com`, `site:hercampus.com "party game" tiktok`, `site:tyla.com OR site:ladbible.com "tiktok game"`.
- **Angle:** don't pitch "Imposter" (they've done it); pitch the variant the day it trends: "Timer Imposter is all over TikTok this week — here's a free one-phone version, no app: laughtable.com/timer-imposter/". Name the writer who covered the last one (Harrison Brocklehurst at The Tab).

### B. "Remote team-building / games to play on Zoom" listicles that link free browser games
- **Why they link:** these posts are lists of free tools; each entry is a link. Spyfall, Codenames, Gartic Phone, Skribbl, Wavelength get followed links from rachelandreago.com, questworks.io, brightful.me, thesmartlocal.com, geekculture.co.
- **Asset needed:** a page that answers "how do we play this over Zoom/Meet/Discord" — `/online/` already exists; it needs a "Play over Zoom / Discord" section (room code flow, 3–20 players, ~10 min a round) and a short remote-team paragraph. Optional: a `/team-building/` page with 30 work-safe words (the Office pack already exists).
- **Prospect queries:** `"remote team building games" spyfall codenames`, `"games to play on zoom" spyfall OR codenames OR "gartic phone"`, `"virtual game night" "spyfall.app" OR "codenames.game" OR "horsepaste"`, `"games to play on discord" skribbl "gartic phone" -site:reddit.com`, `intitle:"free online games" "with friends" spyfall`.
- **Angle:** "You list Spyfall; Imposter is the version everyone is playing this year — same social deduction, no location sheet, works on one phone or over Zoom." Offer the exact blurb, in their format.

### C. "Free Jackbox alternatives" / "games like Among Us in real life" roundups on big games media
- **Why they link:** the article is literally a list of free browser games; CBR links six tiny indie sites with followed links.
- **Asset needed:** a comparison-friendly page: "Imposter vs Jackbox: one phone, free, no console" — can live on `/imposter-game/` as a section. A screenshot set and a 2-sentence description the editor can paste.
- **Prospect queries:** `"jackbox alternatives" free browser`, `"games like jackbox" free "no download"`, `"games like among us" "in real life" OR "irl" party`, `"party games" "phones as controllers" free`.
- **Angle:** "Your 25 Jackbox alternatives has no social-deduction game; Imposter is the most-played party game on TikTok in 2025–26 and needs one phone."

### D. Student and school press (high-school / university papers)
- **Why they link:** students write features about what everyone plays at lunch; hsdial.org linked gameonfamily's rules page, hcdevilsadvocate.com wrote 900 words without linking anything, Tampere University's PlayLab magazine (tuni.fi) wrote about "word impostor" with no link.
- **Asset needed:** `/imposter-game-rules/` (exists) plus a "how to play at school in 5 minutes" section and a clean-words note (the Brainrot and school-safe packs are the hook).
- **Prospect queries:** `"imposter game" site:*.edu` (use Google), `"imposter game" "student" "lunch" tiktok -site:tiktok.com`, `"imposter game" inurl:news 2026 school`, `"word impostor" OR "imposter game" site:*.ac.uk OR site:*.fi OR site:*.edu.au`.
- **Angle:** short note to the student author/adviser: "loved the piece; if readers want to try it, laughtable.com runs on one phone with no app — happy to be linked as the tool". Low authority each, but they are real editorial links, fast, and they cluster around the exact topic.

### E. Regional parenting magazines' game-night roundups (syndicated)
- **Why they link:** "games that need nothing but a phone" entries in family-game-night lists; the Family Resource Group syndicate pushed one article to at least two titles (NOLA Family, Colorado Parent) with the same followed link.
- **Asset needed:** a family-facing page: `/family-game-night/` or a "Play with kids" section with the Kids/Animals/Food packs, a hint mode explanation, and the 3-minute round timer. Seasonal packs (Halloween, Christmas) are ready-made hooks.
- **Prospect queries:** `"family game night ideas" "no board" OR "just a phone"`, `"family game night" imposter`, `site:nolafamily.com OR site:coloradoparent.com OR site:metrofamilymagazine.com "game night"`, `"parenting magazine" "game night ideas" 2026`.
- **Angle:** to `amelia@familyresourcegroupinc.com` (the byline on the Colorado Parent copy) and Madeline Pistorius (NOLA Family): "you featured Imposter as the no-board option; LaughTable has a kids mode and 13 themed packs (Halloween pack for October) — worth a mention in the fall/holiday game-night piece?"

### F. Product / indie-tool directories (self-serve)
- **Why they link:** self-submission. producthubx.com and mrrscout.com give followed "Visit website" links; itch.io and Product Hunt are nofollow.
- **Asset needed:** nothing beyond a logo, screenshots and a tagline.
- **Prospect queries:** `"submit" "your product" directory free tools games`, `inurl:submit "browser game" directory`, `"indie games directory" web games submit`.
- **Angle:** submit and move on; these are worth a few hours total, not a campaign. Expect low weight.

### G. Personal "every online version of X" resource pages
- **Why they link:** hobbyists maintain lists of free implementations (seafish.io's 20-way Codenames list, larryxu.com's online board games page, midnights-door.com's rules hub).
- **Asset needed:** a "How to play Imposter online — every free version compared" page **on laughtable.com** would itself attract these links and rank for "imposter game online free" comparisons; the site can afford to be honest about competitors because it wins on variants and packs.
- **Prospect queries:** `"online board games" list "horsepaste" -site:reddit.com`, `"free online versions" "party games" blog`, `intitle:"online games" "codenames" "spyfall" blog personal`.
- **Angle:** "Your list has X and Y; Imposter (the word-clue social-deduction game) isn't on it — free, one phone or room code."

### H. Site networks (what actually got imposter.app to #1) — *not* replicable honestly
imposter.app's 3,805 links are footer links from ~17 sibling PsyCat domains. Building a private network is exactly the risk the brief excludes. The honest analogue: keep every variant and pack on **laughtable.com** (as already decided in `docs/DECISIONS.md`) so that each explainer link to a variant page strengthens the whole domain.

## 5. Top replicable followed links, scored

Score = average of authority, topical relevance, likelihood of a followed link, likelihood they add LaughTable, expected SEO value, inverse effort (1–10 each). Follow column: F-verified = read on the page.

| Priority | Referring site | Page | Competitor/peer linked | Follow? | Why they linked | LaughTable angle | Acquisition strategy | Difficulty | Score |
|---|---|---|---|---|---|---|---|---|---|
| 1 | cbr.com | /jackbox-free-alternative-party-games/ | votesout.com, stopots.com, deathbyai.gg, qwiqwit.com, squabble.me | F-verified | Free Jackbox alternatives list | No social-deduction entry; Imposter = one-phone Jackbox | Editor email + paste-ready blurb + 2 screenshots | Medium | 8.0 |
| 2 | thetab.com | next "how to play the viral … game" piece | gameonfamily (2025), neal.fun (2023), starbyface (2026) | F-verified | Trend explainer | Timer/Question/Drawing Imposter the week it trends | Email Harrison Brocklehurst with the tool link the day a variant spikes on TikTok | Medium | 7.8 |
| 3 | thesmartlocal.com | /read/free-online-games/ | netgames.io, horsepaste, skribbl, squabble, garticphone | F-verified | Free games like Among Us list | "Among Us IRL on one phone" | Update pitch to editorial@ | Medium | 7.5 |
| 4 | rachelandreago.com | /remote-team-building-games/ | spyfall.app (#1 entry), codenames.game… | F-verified | Remote team games | Spyfall 2026 = Imposter; online room | Personal email to the author, Rachel Andrea Go (post dated 2023-04-10) | Easy–Medium | 7.5 |
| 5 | questworks.io | /blog/fun-team-building-games-remote.html | codenames, garticphone, wavelength.zone… | F-verified | 20 remote team games (2026) | Wavelength's sibling TikTok game | Contact form; offer 60-word entry | Easy–Medium | 7.2 |
| 6 | geekculture.co | /top-free-games-to-play-online-with-friends-to-while-the-quarantine-woes-away/ and /top-free-online-games-to-play-in-quarantine-with-friends/ | horsepaste, skribbl, houseparty.com (dead) | F-verified | Free games list | Replace dead Houseparty link | Broken-link email | Easy–Medium | 7.2 |
| 7 | Family Resource Group syndicate (nolafamily.com, coloradoparent.com, +5) | /7-simple-family-game-night-ideas-for-chilly-evenings/ | play.gameonfamily.com/imposter/ | F-verified | Family game-night ideas | Kids mode + Halloween/Christmas packs for the fall piece | Email Amelia (FRG) + Madeline Pistorius | Easy–Medium | 7.0 |
| 8 | distractify.com | future trend explainer (they linked wavelength.zone/presskit) | wavelength.zone | F-verified | Trend explainer | Press kit + variant | Needs `/press/`; pitch on the next trend | Medium–Hard | 6.7 |
| 9 | brightful.me | /blog/what-are-the-best-social-games-to-play-with-your-remote-team/ | skribbl, horsepaste, warofthewizards.net (redirects away) | F-verified | Remote social games | Replace the redirected War of the Wizards entry | Replacement-link email | Easy | 6.5 |
| 10 | genz.ai | /trends/gaming/slangs/imposter-game/ , /formats/imposter-game-challenge/ , /drops/spot-the-imposter-and-tiktok-game-challenges/ | none (unlinked) | Unverified (no outbound links on page) | Trend encyclopedia | "Where to play" line | Ask for a tool link in the "how to play" section | Easy | 6.3 |
| 11 | blogs.tuni.fi (Tampere University PlayLab) | /playlab/game-related-media/guess-betray-repeat-how-word-impostor-became-last-months-most-addictive-guessing-game/ | none (unlinked) | Unverified | Academic game-culture magazine | Reference link to a playable version | Email the PlayLab editor | Easy | 6.2 |
| 12 | hcdevilsadvocate.com | /news/2026/01/20/from-clues-to-clicks-the-cultural-impact-of-tik-toks-imposter-game/ | none (unlinked) | Unverified | HS newspaper feature | "If you want to try it" link | Story-idea form on the site / adviser email | Easy | 5.8 |
| 13 | hsdial.org | /2026/04/30/from-screens-to-face-to-face-memories/ | gameonfamily rules page | F-verified | HS newspaper feature | Second tool mention | Email adviser | Easy | 5.5 |
| 14 | larryxu.com | /blog/online-board-games/ | codenames.plus, horsepaste, 2 dead links | F-verified | Personal resource page | Replace playpseudonyms.com / starbound.space.fashion | Broken-link email | Easy | 5.5 |
| 15 | yourdictionary.com | /articles/fun-icebreakers-classroom | none (no game links) | Unverified | Classroom icebreakers | "Imposter" is already a named icebreaker concept there | Pitch a linked "digital version" note | Medium | 5.5 |
| 16 | theatrefolk.com | /blog/improv-game-imposter | none | Unverified | Drama-class improv game called Imposter | Cross-reference to the word version | Email | Medium | 5.2 |
| 17 | seafish.io | /blog/how-to-play-codenames-online/ | 20 Codenames sites | F-verified | Every-version list | Only if the dev writes a Spyfall/Imposter equivalent | Ask | Hard | 4.8 |
| 18 | midnights-door.com | / | gameonfamily rules | F-verified | Hobby rules hub | Second rules link | Ask | Easy | 4.5 |
| 19 | producthubx.com | product listing | impostergame.net | F-verified | Directory | Listing | Submit | Easy | 4.5 |
| 20 | mrrscout.com | /site/… | impostergame.net | F-verified | Directory | Listing | Submit | Easy | 4.2 |
| 21 | itch.io | /… | playimposter.com | NF-verified | Game directory | Discovery only | Submit web build | Easy | 3.8 (nofollow) |
| 22 | producthunt.com | — | undercover-game-online, who-s-the-liar, impostor-party-word-game | Nofollow by policy (not re-verified) | Launch listing | Discovery/traffic | Launch once, with the online mode | Medium | 3.5 |

Not scored because excluded by the brief: pctechmag.com (looks paid), link-legion/seo-anomaly/PBN
pages, parse.gl, xploredomains.

## 6. Broken / outdated / replacement opportunities

| Referring page | What's broken | Verified status (2026-09-14) | Pitch |
|---|---|---|---|
| https://geekculture.co/top-free-games-to-play-online-with-friends-to-while-the-quarantine-woes-away/ and https://geekculture.co/top-free-online-games-to-play-in-quarantine-with-friends/ | Links to houseparty.com (Houseparty app shut down 2021) | `curl` → HTTP 000 (no response) | "Your free-games list still sends readers to Houseparty, which closed in 2021. Imposter is the one-phone social-deduction game everyone plays now — free, no app; happy to send a screenshot." Both pages carry followed links. |
| https://www.brightful.me/blog/what-are-the-best-social-games-to-play-with-your-remote-team/ | warofthewizards.net now 301s to teambuilding.com (a competitor of Brightful) | 403 → https://teambuilding.com/activity/originals/war-of-the-wizards | "Entry #2 now redirects to TeamBuilding.com's paid product. Imposter is free and works over Zoom with a room code." |
| https://www.larryxu.com/blog/online-board-games/ | playpseudonyms.com and starbound.space.fashion are dead | both HTTP 000 | Two-line email: two dead links, one suggested replacement. |
| https://www.melmagazine.com/en-us/story/best-free-online-games-play-with-friends-quarantine | Links houseparty.com | dead; but MEL's links are **nofollow** | Low priority; only for traffic. |
| impostergamegenerator.click → gameonfamily | The *referring* clone died | HTTP 000 | Not an opportunity (dead referrer), listed for completeness. |
| Tools that now gate behind login/payment | Codenames.game and Board Game Arena require accounts for some modes; Jackbox is paid | — | This is the angle for every "free alternatives" list: "no account, no app, no console". Use it in pattern C pitches rather than as a broken-link claim. |

I did not find any page linking to a *dead imposter tool*; the clones are all under two years old.
Re-check in 6 months — EMD clones with no traffic get dropped, and the pages linking them become
replacement targets.

## 7. Unlinked mentions and natural inclusions

Pages that discuss the game (or the exact category) and currently link no tool, or link only competitors:

| Page | Ranks for / about | Links out today | Why LaughTable fits | Priority |
|---|---|---|---|---|
| https://genz.ai/trends/gaming/slangs/imposter-game/ (+ /formats/imposter-game-challenge/, /drops/spot-the-imposter-and-tiktok-game-challenges/) | "what is the imposter game trend" | none | Three explainer pages with a "how to play" section and no "where to play" | High |
| https://blogs.tuni.fi/playlab/game-related-media/guess-betray-repeat-how-word-impostor-became-last-months-most-addictive-guessing-game/ | "word impostor" (university magazine) | none | Academic authority on the exact game; a reference link is normal there | High |
| https://hcdevilsadvocate.com/news/2026/01/20/from-clues-to-clicks-the-cultural-impact-of-tik-toks-imposter-game/ | "imposter game tiktok students" | none | 900-word feature; mentions "the Imposter app" without naming one | Medium |
| https://www.cbr.com/jackbox-free-alternative-party-games/ | "free jackbox alternatives" | 6 indie browser games | Gap: no social-deduction entry | High |
| https://thesmartlocal.com/read/free-online-games/ | "free online games to play with friends like Among Us" | Avalon, Werewolf bot, Codenames… | Imposter is the offline Among Us | High |
| https://rachelandreago.com/remote-team-building-games/ · https://www.questworks.io/blog/fun-team-building-games-remote.html · https://www.brightful.me/blog/… | "remote team building games" | Spyfall, Codenames, Wavelength | Same category; LaughTable has an online room + Office pack | High |
| https://www.yourdictionary.com/articles/fun-icebreakers-classroom | "icebreakers for the classroom" | none | Already describes an "Imposter"-style icebreaker; a digital version is a natural aside | Medium |
| https://www.theatrefolk.com/blog/improv-game-imposter | "improv game imposter" | none | Drama teachers; the word game is the low-prep cousin | Medium |
| https://findtheimposter.com/blog/spyfall-alternative-free-browser-no-app · https://www.imposter.online/games-like-among-us · https://playcircle.io/games-like-imposter | "games like spyfall/among us/imposter" | none (competitor-owned) | They will not add you; listed so you know these SERPs are competitor listicles and the way in is your own `/games-like-spyfall/` page | Skip |
| https://gameslikethisone.com/games-like-spyfall/ · https://www.boardgamehalv.com/games-like-spyfall/ · https://www.moregameslike.com/spyfall/ | "games like spyfall" (board-game blogs) | board games only | A "free browser version" aside is plausible on gameslikethisone | Low–Medium |

## 8. Execution plan

### A. Top 10 links to pursue first

1. **cbr.com — "25 Free Jackbox Party Game Alternatives"** (https://www.cbr.com/jackbox-free-alternative-party-games/). Highest-authority page found that gives followed links to tiny browser games. Difficulty: Medium. Angle: "The list has no social-deduction game. Imposter was the most-played party game on TikTok in 2025–26; LaughTable runs it on one phone, free, no app, with 13 themed packs. Blurb + screenshots attached; happy to be entry 26 or replace one that's gone quiet."
2. **thetab.com — Harrison Brocklehurst** (author of https://thetab.com/2025/09/22/…imposter-game…). Difficulty: Medium (timing-dependent). Angle: the day Timer/Question/Drawing Imposter spikes: "You covered Imposter in September; the Timer version is the one blowing up this week — free one-phone version here, no app: laughtable.com/timer-imposter/".
3. **thesmartlocal.com — "13 Free Online Games To Play With Friends Like Among Us"** (https://thesmartlocal.com/read/free-online-games/). Difficulty: Medium. Angle: "Among Us in real life is now a one-phone game; your list has Avalon and Werewolf but not the game your readers are filming on TikTok."
4. **rachelandreago.com — remote team-building games** (https://rachelandreago.com/remote-team-building-games/). Difficulty: Easy–Medium. Angle: "Spyfall is your #1; Imposter is Spyfall without the location list, and LaughTable's room mode works over Zoom for 3–20 people."
5. **questworks.io — 20 remote team-building games (2026)** (https://www.questworks.io/blog/fun-team-building-games-remote.html). Difficulty: Easy–Medium. Angle: "You include Wavelength — the other TikTok party game is Imposter; Office pack has 80 work-safe words."
6. **geekculture.co — two free-games lists linking dead houseparty.com**. Difficulty: Easy–Medium. Angle: broken-link swap (§6).
7. **Family Resource Group syndicate** (`amelia@familyresourcegroupinc.com`; NOLA Family byline Madeline Pistorius). Difficulty: Easy–Medium. Angle: "You featured Imposter in the chilly-evenings piece; for the Halloween/holiday game-night article, LaughTable has kids mode and seasonal packs."
8. **genz.ai — three imposter-game explainer pages**. Difficulty: Easy. Angle: "Your explainer has no 'where to play' link; here is the free one-phone version."
9. **blogs.tuni.fi PlayLab — "word impostor" article**. Difficulty: Easy. Angle: reference link to a playable version for readers.
10. **brightful.me — remote social games** (https://www.brightful.me/blog/what-are-the-best-social-games-to-play-with-your-remote-team/). Difficulty: Easy. Angle: "Entry 2 now redirects to a competitor's paid product; Imposter is free and needs no account."

### B. 30-day plan (solo founder, ~4–6 h/week)

**Week 1 — make the site linkable, then the easy asks**
- Ship `/press/` (one paragraph, logo, 4 screenshots incl. the reveal, founder line, contact) and a "Play over Zoom / Discord" section on `/online/`.
- Add a 3-sentence "Imposter vs Jackbox / Spyfall / Among Us" block to `/imposter-game/`.
- Send the four Easy emails: genz.ai, tuni.fi PlayLab, hcdevilsadvocate.com (story-idea form), larryxu.com. Submit producthubx.com and mrrscout.com listings. Post the itch.io web-build page (nofollow, discovery only).
- Run the ~12 small clone domains through Ahrefs' free backlink checker yourself (needs the human check) to confirm they have nothing; if one does, add its sources to this list.

**Week 2 — the team-building cluster and broken links**
- Email rachelandreago.com, questworks.io, brightful.me (replacement), geekculture.co (dead Houseparty). Include the paste-ready 60-word entry in each site's own format.
- Find 10 more of the same with the §4-B queries; check each with the `rel` test before emailing (don't send to nofollow lists).
- Write the family angle: a short `/family-game-night/` section or FAQ on the packs index.

**Week 3 — media**
- Pitch CBR (games editor) and TheSmartLocal with screenshots.
- Email the Family Resource Group syndicate with the Halloween pack hook (they publish October content in late September).
- Prepare the Tab/Distractify pitch text for the next variant and set a TikTok alert (hashtags for timer/question/drawing imposter). Send it within 24 h of a spike.

**Week 4 — measure and second wave**
- Check Search Console for `imposter game generator`, `imposter game online`, `timer imposter game` positions and any new referring domains (GSC → Links).
- Follow up once on every unanswered week-2/3 email (one polite nudge, 7–10 days after).
- Second wave of 10 student-press and 10 "games to play on Zoom" prospects from the §4 queries.
- Kill criterion: if week 1–3 produce zero placements, the assets are the problem — revisit `/press/` and the blurb before sending more.

### C. Content assets worth building (only those the link research supports)

| Asset | Supported by | What it needs |
|---|---|---|
| `/press/` page | Distractify linked wavelength.zone/**presskit**; The Tab links whatever page the writer lands on | Description, screenshots, founder line, "how to play in 3 lines", contact |
| "Play over Zoom / Discord / Meet" section on `/online/` | Every team-building and Zoom-games list links tools with a remote mode (spyfall.app, codenames.game, garticphone) | Room-code flow, player range, round length, one screenshot |
| Variant pages that exist before the trend (`/timer-imposter/` done; Question, Drawing next) | The Tab/Distractify explainer pattern; GROWTH bet 3 | Same scaffold; the page must be live the week the variant trends |
| `/family-game-night/` (or a family section on `/packs/`) | Family Resource Group syndicate links the "no board needed" game | Kids mode, hint toggle, seasonal packs, 5-minute setup |
| `/team-building/` or Office-pack landing copy aimed at remote teams | rachelandreago, questworks, brightful link team-oriented tools | 80 work-safe words exist; add "for remote teams" framing |
| `/games-like-spyfall/` comparison (honest, links competitors) | Personal resource pages (seafish.io, larryxu.com) and "games like" SERPs are competitor-owned listicles today | A fair comparison table; this is also the page hobbyist list-makers will cite |
| Classroom/school-safe note on `/imposter-game-rules/` | Student-press links go to the rules page (hsdial → gameonfamily tutorial) | "5-minute lunch version", clean packs (Brainrot, Animals), no sign-in |

Not supported by the evidence, so not recommended now: a statistics/data asset (no page in this
niche links to data), an embeddable widget (no embed links observed), printable PDFs (the
parenting syndicate linked the online tool, not printables).

## Sources (key)

- SERPs: Startpage https://www.startpage.com/do/search?q=imposter+game+generator ; DuckDuckGo HTML https://html.duckduckgo.com/html/?q=imposter+game
- Backlink index: https://www.seobility.net/en/backlinkchecker/ (gameonfamily.com, imposter.app, impostergame.net)
- Verified referring pages: https://thetab.com/2025/09/22/heres-how-to-start-the-iconic-imposter-game-all-the-girlies-are-playing-on-tiktok-rn ; https://nolafamily.com/7-simple-family-game-night-ideas-for-chilly-evenings/ ; https://coloradoparent.com/7-simple-family-game-night-ideas-for-chilly-evenings/ ; https://hsdial.org/2026/04/30/from-screens-to-face-to-face-memories/ ; https://www.midnights-door.com/ ; https://pctechmag.com/2026/07/event-planners-secret-weapon-for-managing-crowds-without-chaos/ ; https://producthubx.com/product/imposter-g-me-ultimate-online-word-decep-ion-experience/150509 ; https://mrrscout.com/category/writing-content ; https://arster27.itch.io/imposter-game-online
- Pattern pages: https://www.cbr.com/jackbox-free-alternative-party-games/ ; https://thesmartlocal.com/read/free-online-games/ ; https://rachelandreago.com/remote-team-building-games/ ; https://www.questworks.io/blog/fun-team-building-games-remote.html ; https://www.brightful.me/blog/what-are-the-best-social-games-to-play-with-your-remote-team/ ; https://geekculture.co/top-free-games-to-play-online-with-friends-to-while-the-quarantine-woes-away/ ; https://www.distractify.com/p/how-to-play-wavelength-game-explained ; https://thetab.com/2026/09/14/heres-how-to-do-that-viral-celebrity-look-alike-trend-from-tiktok-with-star-by-face ; https://thetab.com/2023/07/03/heres-how-to-beat-rule-24-in-the-viral-password-game-taking-over-tiktok-right-now ; https://www.seafish.io/blog/how-to-play-codenames-online/ ; https://www.larryxu.com/blog/online-board-games/
- Unlinked mentions: https://genz.ai/trends/gaming/slangs/imposter-game/ ; https://blogs.tuni.fi/playlab/game-related-media/guess-betray-repeat-how-word-impostor-became-last-months-most-addictive-guessing-game/ ; https://hcdevilsadvocate.com/news/2026/01/20/from-clues-to-clicks-the-cultural-impact-of-tik-toks-imposter-game/ ; https://www.yourdictionary.com/articles/fun-icebreakers-classroom ; https://www.theatrefolk.com/blog/improv-game-imposter
- PsyCat network confirmation: footers of https://imposter.app/ , https://truthordare.app/ , https://quizpanda.com/ all credit PsyCat Games; https://psycatgames.com/app/imposter/
