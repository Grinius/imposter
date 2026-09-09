import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Eye, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { pageMetadata } from '@/lib/seo';
import { premiumConfigured, premiumFeatures, stripePaymentLink } from '@/lib/premium';

const title = 'Imposter Premium - Word Packs, Custom Rooms, and Printables';
const description = 'Unlock premium Imposter features after Stripe payment: premium word packs, custom packs, classroom mode, branded rooms, more players, history, and printable cards.';

export const metadata: Metadata = pageMetadata('/premium/', title, description);

export default function PremiumPage() {
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
        <p>Premium features are prepared, but access will stay locked until Stripe Checkout is connected. After payment is verified, premium play can unlock extra packs, custom rooms, larger groups, history, and printable cards.</p>
        <div>{premiumConfigured ? <a className="gold-button" href={stripePaymentLink}>Unlock with Stripe <ArrowRight size={17} /></a> : <span className="outline-button disabled-link" aria-disabled="true"><ShieldCheck size={16} /> Stripe link pending</span>}<Link className="outline-button" href="/">Keep playing free <ArrowRight size={16} /></Link></div>
      </section>
      <section className="premium-grid" aria-labelledby="premium-features-title">
        <h2 id="premium-features-title">Premium features waiting behind payment</h2>
        <div>{premiumFeatures.map(feature => <article key={feature.id}><span><LockKeyhole size={15} /> Locked</span><h3>{feature.title}</h3><p>{feature.summary}</p></article>)}</div>
      </section>
      <section className="content-next"><h2>Payment enforcement plan</h2><p>The free game remains playable. Premium buttons lead to Stripe once the payment link is provided. Full server-side unlock should be added with a Stripe webhook or verified Checkout session before any premium feature becomes usable.</p><div><Link className="gold-button" href="/imposter-game-generator/">Use free generator <ArrowRight size={17} /></Link></div></section>
    </main>
  </div>;
}
