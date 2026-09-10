'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Check, LockKeyhole, Sparkles } from 'lucide-react';
import { premiumConfigured, stripePaymentLink, type PremiumFeature } from '@/lib/premium';

// `unlocked`: this viewer's entitlement is already verified premium.
// `available`: whether this specific feature is actually built yet — only the player-cap increase
// is live so far, so an unlocked-but-unbuilt feature should say "on the way," not "pay to unlock,"
// to someone who has already paid.
export default function UpgradeCard({ feature, compact = false, unlocked = false, available = false }: { feature?: PremiumFeature; compact?: boolean; unlocked?: boolean; available?: boolean }) {
  const pathname = usePathname();
  const onPremiumPage = pathname === '/premium/';
  const title = feature?.title ?? 'Premium access';
  const summary = feature?.summary ?? 'Premium features unlock after Stripe payment is connected and verified.';
  const active = unlocked && available;

  return <aside className={`upgrade-card ${compact ? 'compact' : ''} ${unlocked ? 'unlocked' : ''}`} aria-label={`${title} is a ${unlocked ? 'premium feature you’ve unlocked' : 'premium feature'}`}>
    <span className="upgrade-badge">{unlocked ? <><Check size={13} /> Unlocked</> : <><LockKeyhole size={13} /> Premium</>}</span>
    <h2>{title}</h2>
    <p>{summary}</p>
    {unlocked ? <span className="upgrade-note">{active ? 'Thanks for going premium — this one\'s active.' : 'Thanks for going premium — this one\'s still on the way.'}</span>
      : premiumConfigured ? <a className="gold-button" href={stripePaymentLink}>Unlock with Stripe <ArrowRight size={17} /></a>
        // Linking to /premium/ from /premium/ itself is a dead click (you're already there) — say so instead.
        : onPremiumPage ? <span className="outline-button disabled-link" aria-disabled="true">Checkout coming soon</span>
          : <Link className="outline-button" href="/premium/"><Sparkles size={16} /> View premium options</Link>}
  </aside>;
}
