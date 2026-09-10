'use client';

import { ArrowRight, LockKeyhole, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { premiumConfigured, stripePaymentLink } from '@/lib/premium';

// Shown when someone tries to start a game with a selection (more players, a premium category)
// that isn't actually available on the free tier — after they've picked it, not before, so they
// see exactly what they'd be paying for instead of hitting a wall up front.
export default function PremiumPaywallNotice({ reasons, onUseFree }: { reasons: string[]; onUseFree: () => void }) {
  return <div className="paywall-notice" role="alert">
    <span className="upgrade-badge"><LockKeyhole size={13} /> This setup needs Premium</span>
    <p>You&rsquo;ve picked:</p>
    <ul>{reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>
    <div className="paywall-actions">
      {premiumConfigured ? <a className="gold-button" href={stripePaymentLink}>Unlock with Stripe <ArrowRight size={16} /></a> : <Link className="gold-button" href="/premium/"><Sparkles size={16} /> View premium options</Link>}
      <button type="button" className="outline-button" onClick={onUseFree}>Use free setup instead</button>
    </div>
  </div>;
}
