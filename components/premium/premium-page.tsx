'use client';

import Link from 'next/link';
import { ArrowRight, Eye, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { premiumConfigured, premiumFeatures, stripePaymentLink } from '@/lib/premium';
import { usePremiumStatus } from '@/lib/premium-client';
import UpgradeCard from '@/components/premium/upgrade-card';

export default function PremiumPage() {
  const { premium, checked } = usePremiumStatus();

  return <div className="content-page premium-page">
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Imposter home"><span className="emblem emblem-small" aria-hidden="true"><Eye strokeWidth={1.25} /></span><span>imposter<span className="brand-dot">.</span></span></Link>
      <span className="header-note">PREMIUM PACKS. PRIVATE ROOMS.</span>
      <nav aria-label="Main navigation"><Link className="nav-link" href="/imposter-game-generator/"><Sparkles size={17} /><span>Generator</span></Link></nav>
    </header>
    <main>
      <section className="content-hero">
        <span className="eyebrow"><LockKeyhole size={14} /> PREMIUM ACCESS</span>
        <h1>Imposter premium</h1>
        {premium ? <p>You&rsquo;re on premium in this browser. Bigger games (up to 20 players) are unlocked now; the rest of the pack below is on the way.</p>
          : <p>Premium features are prepared, and bigger games (up to 20 players) unlock immediately after a verified Stripe payment. The rest of the pack below is on the way.</p>}
        <div>
          {premium ? <span className="outline-button disabled-link" aria-disabled="true"><ShieldCheck size={16} /> Premium unlocked on this device</span>
            : premiumConfigured ? <a className="gold-button" href={stripePaymentLink}>Unlock with Stripe <ArrowRight size={17} /></a>
              : <span className="outline-button disabled-link" aria-disabled="true"><ShieldCheck size={16} /> Stripe link pending</span>}
          <Link className="outline-button" href="/">Keep playing free <ArrowRight size={16} /></Link>
        </div>
        {!premium && checked && <p className="upgrade-note">Already paid on this device? Entitlement is checked automatically — if it&rsquo;s not showing, try the confirmation link from your Stripe receipt again.</p>}
        <p className="upgrade-note">Payment is handled entirely by Stripe — we never see your card details. See our <Link href="/privacy/">privacy policy</Link> for what we do collect.</p>
      </section>
      <section className="premium-grid" aria-labelledby="premium-features-title">
        <h2 id="premium-features-title">Premium features {premium ? 'unlocked on this device' : 'waiting behind payment'}</h2>
        <div>{premiumFeatures.map(feature => <UpgradeCard key={feature.id} feature={feature} unlocked={premium} available={feature.id === 'more-players'} />)}</div>
      </section>
      <section className="content-next"><h2>Payment enforcement plan</h2><p>The free game remains playable without payment. Once a Stripe Checkout session is verified server-side, this browser unlocks the bigger player cap immediately; the remaining features (custom packs, classroom mode, branded rooms, room history, printable cards) are still being built and will unlock the same way as they ship.</p><div><Link className="gold-button" href="/imposter-game-generator/">Use free generator <ArrowRight size={17} /></Link></div></section>
    </main>
  </div>;
}
