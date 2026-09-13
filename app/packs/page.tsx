import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, Eye, Package, Wifi } from 'lucide-react';
import BrandWordmark, { siteHost, siteName } from '@/components/brand';
import { packWords, packs } from '@/lib/packs';
import { pageMetadata } from '@/lib/seo';
import { categories, getWords } from '@/lib/words';

const title = 'Imposter Game Word Packs - Free Themed Packs';
const description = 'Free themed word packs for the imposter game: Halloween, football, K-pop, pop superstars and Christmas, with 48–80 words each and a page apiece. Play on one phone or online, no app.';
export const metadata: Metadata = pageMetadata('/packs/', title, description);

export default function PacksPage() {
  return <div className="generator-page variant-page">
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Imposter home"><span className="emblem emblem-small" aria-hidden="true"><Eye strokeWidth={1.25} /></span><BrandWordmark /></Link>
      <span className="header-note">THEMED PACKS. SAME BLUFF.</span>
      <nav aria-label="Main navigation"><Link className="nav-link" href="/imposter-game-rules/"><BookOpen size={17} /><span>Rules</span></Link><span className="nav-divider" /><Link className="nav-link" href="/online/"><Wifi size={17} /><span>Online</span></Link></nav>
    </header>
    <main>
      <section className="variant-hero"><span className="eyebrow"><Package size={14} /> WORD PACKS</span><h1>Themed <em>packs.</em></h1><p>The same imposter game with a season or a fandom for a secret word. Every pack is free, has its own page with the full word list, and works on one phone, in online rooms, and in the generator.</p></section>
      <section className="pack-grid" aria-label="Themed packs">
        {packs.map(pack => <Link key={pack.slug} href={`/packs/${pack.slug}/`} className="pack-card">
          <span className="eyebrow">{pack.eyebrow}</span><h2>{pack.title.replace(' Imposter Game', '')}</h2><p>{pack.lead.split('. ')[0]}.</p>
          <span className="pack-card-meta">{packWords(pack).length} words · free</span><span className="pack-card-cta">Open pack <ArrowRight size={14} /></span>
        </Link>)}
      </section>
      <section className="generator-copy" aria-labelledby="packs-core">
        <div><span className="eyebrow"><BookOpen size={14} /> EVERYDAY PACKS</span><h2 id="packs-core">The core categories</h2><p>Themed packs sit next to the everyday ones. Mixed bag draws from the free core packs only, so a Halloween word never turns up in a normal round.</p></div>
        <dl>{categories.filter(category => category.group === 'core' && category.id !== 'mixed').map(category => <div key={category.id}><dt>{category.name}{category.premium ? ' · Premium' : ''}</dt><dd>{getWords(category.id).length} words. {category.hint}.</dd></div>)}</dl>
      </section>
      <section className="generator-next">
        <h2>Pick a pack and deal the cards</h2><p>Choose any pack on the home page, in the generator, or in an online room lobby.</p>
        <div><Link className="gold-button" href="/">Play on one phone <ArrowRight size={17} /></Link><Link className="outline-button" href="/imposter-game-generator/">Open the generator <ArrowRight size={16} /></Link><Link className="outline-button" href="/online/">Create an online room <ArrowRight size={16} /></Link></div>
      </section>
    </main>
    <footer className="site-footer"><span className="footer-brand"><Eye size={18} strokeWidth={1.3} /> {siteName}<small>{siteHost}</small></span><span>Themed imposter word packs, free.</span><span>One phone. No app. No sign-up.</span><Link href="/privacy/">Privacy</Link></footer>
  </div>;
}
