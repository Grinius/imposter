# LaughTable — next days/weeks checkpoints

Written 2026-09-13 from docs/GROWTH.md, docs/STATUS.md and docs/TODO.md. Tick items off here or in the
Apple Note copy; keep this file as the record. Done so far: share loop (invite links, QR, PNG preview,
brand on screen), Timer/Question/Drawing variants, filmable reveal + recap image, five themed packs,
Plausible analytics, title/site-name fixes. Google has indexed the home page, /timer-imposter/ and
/packs/christmas/ and shows an AI Overview.

## This weekend (13–14 Sep)
- [ ] `npm run deploy` (titles + site name + analytics are in main but check production has them: view-source should show `og:site_name` and the Plausible tag)
- [ ] Search Console → Request indexing: `/`, `/timer-imposter/`, `/question-imposter/`, `/drawing-imposter/`, `/packs/`, `/packs/halloween/` (≈10/day limit)
- [ ] Plausible → confirm first pageviews arrive; Pages must never show `/online/?room=`
- [ ] Decide the free player cap: 5 → 8 or 10 (Google now summarises the game as "3–5 players"). Tell Claude the number; cap + copy change together
- [x] Stripe dashboard → confirm the Payment Link is a ONE-TIME price, not recurring (confirmed 13 Sep)
- [x] Set `STRIPE_SECRET_KEY` + `ENTITLEMENT_SECRET` on the Worker and make ONE real purchase yourself (done 13 Sep; `/api/premium/verify` returned a token for the live session)
- [ ] Open the success link in your own browser and confirm the 20-player unlock in the generator / an online room

## Week of 15 Sep — film + seed
- [ ] Day 2 of indexing requests: `/packs/football/`, `/packs/k-pop/`, `/packs/pop-superstars/`, `/packs/christmas/`, `/imposter-game-rules/`, `/imposter-game-words/`
- [ ] Film the 20-s Timer Imposter demo (shot list: target card → 3 blind runs, faces → tap "Reveal the imposter" on camera, hold through the roulette → recap image + "laughtable.com/timer-imposter"). Say the domain out loud
- [ ] Cut a 6–8 s reveal-only version
- [ ] Post to TikTok, Reels, Shorts with link `laughtable.com/timer-imposter/?utm_source=tiktok&utm_medium=demo&utm_campaign=timer-launch` (change utm_source per platform)
- [ ] Submit: itch.io (web, party-game tag), AlternativeTo (alternative to Undercover / Spyfall / Jackbox)
- [ ] Email 5 "free Jackbox alternatives / browser games with friends" listicle authors (cbr.com, gamebuddies.io, gamesocial.io, dinogame.gg, winrogames.com)
- [ ] Build the creator list: 20 TikTok accounts posting imposter rounds at 10–60K followers (#impostergame #timerimposter #guesstheimposter). DM 10 with the brief + a per-creator link `?utm_source=tiktok&utm_campaign=creator-<handle>`
- [ ] Reply under 10 new Timer/Buzzer imposter videos: "free at laughtable.com/timer-imposter"
- [ ] Optional: Lithuanian seed — friends, 3 uni groups, 2 media pitches (15min / Delfi lifestyle)

## Week of 22 Sep — creator test + Halloween prep
- [ ] DM the other 10 creators; close 3–5 deals at €80–150 each (≤€500 total). Brief: one normal round, phone on camera at the reveal for 3 s, say "we used laughtable.com"
- [ ] Watch Plausible per creator link within 72 h of each post. Kill rule: first two paid videos < 300 visits combined → stop paying, keep the reveal screen
- [ ] DM 20 fandom/party accounts with a pack ("we made a Halloween / K-pop / football pack for your audience")
- [ ] Email writers who covered the 2025 trend (The Tab, Her Campus, Dexerto): "the 2026 version is Timer Imposter — free tool"
- [ ] Review Plausible: round_start by source, room_join by via, recap_save rate, paywall_shown count. Write down which channel gave the cheapest round-starter

## Week of 29 Sep — double down
- [ ] Put remaining budget into the channel that won (creators / variants / packs)
- [ ] Halloween push starts mid-October: pin `/packs/halloween/` in TikTok bio, post 2 Halloween-pack rounds
- [ ] If variant pages have < 100 GSC impressions each by ~13 Oct → stop building variants, go all-in on packs

## October
- [ ] 13 Oct: 30-day check on variant SERPs (GSC impressions/clicks per variant URL)
- [ ] 20–31 Oct: Halloween week — everything shareable ready; Halloween-pack videos daily if it's working
- [ ] By 15 Nov: if no pack page has > 50 GSC clicks and no creator used a pack → stop producing packs

## Parked (docs/TODO.md) — only when the above is running
- [ ] "Restore purchase" field on /premium/
- [ ] Custom shareable word packs (/packs/new)
- [ ] Wavelength × Imposter variant
- [ ] Christmas push from late November
