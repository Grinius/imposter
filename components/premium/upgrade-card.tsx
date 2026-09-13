'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Check, LockKeyhole, Sparkles } from 'lucide-react';
import { premiumConfigured, stripePaymentLink, type PremiumFeature } from '@/lib/premium';

// `unlocked`: this viewer's entitlement is already verified premium.
// `available`: whether this specific feature is actually built yet — so far the player-cap increase
// and the premium word packs — so an unlocked-but-unbuilt feature should say "on the way," not
// "pay to unlock," to someone who has already paid.
export default function UpgradeCard({ feature, compact = false, unlocked = false, available = false }: { feature?: PremiumFeature; compact?: boolean; unlocked?: boolean; available?: boolean }) {
  const pathname = usePathname();
  const onPremiumPage = pathname === '/premium/';
  const title = feature?.title ?? 'Premium access';
  const summary = feature?.summary ?? 'Premium features unlock after Stripe payment is connected and verified.';
  const active = unlocked && available;

  return <aside className={`upgrade-card ${compact ? 'compact' : ''} ${unlocked ? 'unlocked' : ''}`} aria-label={`${title} is a ${unlocked ? 'premium feature you’ve unlocked' : 'premium feature'}`}>
    {/* The badge reports what this viewer can actually use today. A paid viewer must not see
        "Unlocked" on a feature that does not exist yet — that reads as a broken promise. */}
    <span className="upgrade-badge">{active ? <><Check size={13} /> Unlocked</> : unlocked ? <><Check size={13} /> Included</> : <><LockKeyhole size={13} /> Premium</>}</span>
    {/* Shown pre-purchase and post-purchase alike: a buyer deciding whether to pay, and one who
        already has, should both see which of these are actually built today. */}
    {!active && <span className={`feature-status ${available ? 'status-live' : 'status-soon'}`}>{available ? 'Available now' : 'Coming soon'}</span>}
    <h2>{title}</h2>
    <p>{summary}</p>
    {unlocked ? <span className="upgrade-note">{active ? 'Thanks for going premium — this one\'s active.' : 'Thanks for going premium — this one\'s still on the way.'}</span>
      // One Premium purchase unlocks everything, not one purchase per feature — so a still-unbuilt
      // card must never carry its own "pay now" button, which would wrongly imply paying gets you
      // this specific thing today. It arrives automatically, at no extra cost, once it ships.
      : !available ? <span className="upgrade-note">Included in Premium — arrives at no extra cost once it ships.</span>
        : premiumConfigured ? <a className="gold-button" href={stripePaymentLink}>Unlock with Stripe <ArrowRight size={17} /></a>
          // Linking to /premium/ from /premium/ itself is a dead click (you're already there) — say so instead.
          : onPremiumPage ? <span className="outline-button disabled-link" aria-disabled="true">Checkout coming soon</span>
            : <Link className="outline-button" href="/premium/"><Sparkles size={16} /> View premium options</Link>}
  </aside>;
}
