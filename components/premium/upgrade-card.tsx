import Link from 'next/link';
import { ArrowRight, LockKeyhole, Sparkles } from 'lucide-react';
import { premiumConfigured, stripePaymentLink, type PremiumFeature } from '@/lib/premium';

export default function UpgradeCard({ feature, compact = false }: { feature?: PremiumFeature; compact?: boolean }) {
  const title = feature?.title ?? 'Premium access';
  const summary = feature?.summary ?? 'Premium features unlock after Stripe payment is connected and verified.';

  return <aside className={`upgrade-card ${compact ? 'compact' : ''}`} aria-label={`${title} is a premium feature`}>
    <span className="upgrade-badge"><LockKeyhole size={13} /> Premium</span>
    <h2>{title}</h2>
    <p>{summary}</p>
    {premiumConfigured ? <a className="gold-button" href={stripePaymentLink}>Unlock with Stripe <ArrowRight size={17} /></a> : <Link className="outline-button" href="/premium/"><Sparkles size={16} /> View premium options</Link>}
  </aside>;
}
