# Deferred work

Items the owner has explicitly parked. Each is a proposal until recorded as adopted in
`docs/DECISIONS.md`; remove it here when it ships or is rejected.

## Premium

- **Run one real end-to-end payment** as the owner once `STRIPE_SECRET_KEY` and `ENTITLEMENT_SECRET`
  are set on the Worker (`docs/STATUS.md`).

## Growth (from `docs/GROWTH.md`)

- Free player cap decision (5 → 8 or 10); scored highest in the audit, owner's pricing call.
- Custom shareable word packs (`/packs/new` → `/p/<id>`), the UGC half of bet 4.
- Wavelength × Imposter variant; no tool exists anywhere for it yet.
- Film and post the Timer Imposter demo; run the ≤€500 creator test (bet 3).

## Online rooms

- **TV / big-screen spectator view** (parked 2026-09-15). Imposter's private cards cannot go on a
  shared screen, so this is the Jackbox shape: phones stay the private hands, the TV is the table.
  Design: `/online/?room=CODE&screen=1` joins as a non-player that takes no seat and does not count
  toward the player cap, receives only the existing public broadcast (already stripped of roles and
  the word before the result), and renders large: room code + QR in the lobby, whose clue turn and
  the discussion timer, "3 of 5 have voted", then the reveal roulette and result. Casting itself is
  the browser's job (tab-cast, AirPlay, HDMI); nothing to build there. Roughly a day. Revisit when
  online rounds are a meaningful share in Plausible, or when Zoom/Jackbox-alternative outreach
  editors ask for it; no search demand seen for "imposter game on tv".
