# Deferred work

Items the owner has explicitly parked. Each is a proposal until recorded as adopted in
`docs/DECISIONS.md`; remove it here when it ships or is rejected.

## Premium

- **Restore purchase on `/premium/`.** Today a paid buyer restores on a new device only by re-opening
  the confirmation link from their Stripe receipt email (`/premium/success/?session_id=…`, up to 5
  tokens per payment). Add a "Restore purchase" field that accepts the receipt link or session id and
  calls the same `/api/premium/verify` endpoint — no new backend. Parked 2026-09-12.
- **Confirm the Stripe Payment Link is a one-time price.** The Worker mints a 3-year, self-renewing
  token on the first paid session and never re-checks a subscription, so a recurring price would be
  charged repeatedly while granting nothing extra. Check in the Stripe dashboard before going live.
- **Run one real end-to-end payment** as the owner once `STRIPE_SECRET_KEY` and `ENTITLEMENT_SECRET`
  are set on the Worker (`docs/STATUS.md`).

## Growth (from `docs/GROWTH.md`)

- Free player cap decision (5 → 8 or 10); scored highest in the audit, owner's pricing call.
- Custom shareable word packs (`/packs/new` → `/p/<id>`), the UGC half of bet 4.
- Wavelength × Imposter variant; no tool exists anywhere for it yet.
- Film and post the Timer Imposter demo; run the ≤€500 creator test (bet 3).
