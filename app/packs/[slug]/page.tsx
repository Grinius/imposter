import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, BookOpen, Eye, ListChecks, MessageCircleQuestion, Package, PenLine, Shuffle, Smartphone, Wifi } from 'lucide-react';
import BrandWordmark, { siteHost, siteName } from '@/components/brand';
import { packBySlug, packCategory, packWords, packs } from '@/lib/packs';
import { pageMetadata } from '@/lib/seo';
import PackTheme from '@/components/theme';

export const dynamicParams = false;
export function generateStaticParams() { return packs.map(pack => ({ slug: pack.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const pack = packBySlug((await params).slug); if (!pack) return {};
  return pageMetadata(`/packs/${pack.slug}/`, `${pack.title} - ${packWords(pack).length} Free Words`, pack.lead);
}

// One page per themed pack: the full word list in the HTML (the thing people search for), the
// reasons the pack plays well, and one-tap routes into each mode with the pack preselected.
export default async function PackPage({ params }: { params: Promise<{ slug: string }> }) {
  const pack = packBySlug((await params).slug); if (!pack) notFound();
  const words = packWords(pack), category = packCategory(pack), others = packs.filter(other => other.slug !== pack.slug);
  return <div className="generator-page variant-page">
    <PackTheme category={pack.id} />
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Imposter home"><span className="emblem emblem-small" aria-hidden="true"><Eye strokeWidth={1.25} /></span><BrandWordmark /></Link>
      <span className="header-note">{pack.eyebrow}</span>
      <nav aria-label="Main navigation"><Link className="nav-link" href="/packs/"><Package size={17} /><span>All packs</span></Link><span className="nav-divider" /><Link className="nav-link" href="/imposter-game-rules/"><BookOpen size={17} /><span>Rules</span></Link></nav>
    </header>
    <main>
      <section className="variant-hero"><span className="eyebrow"><Package size={14} /> {pack.eyebrow}</span><h1>{pack.title.replace(' Imposter Game', '')} <em>Imposter.</em></h1><p>{pack.lead}</p>
        <div className="pack-actions"><Link className="gold-button" href={`/?pack=${pack.id}`}><Smartphone size={17} /> Play this pack on one phone <ArrowRight size={17} /></Link><Link className="outline-button" href={`/imposter-game-generator/?pack=${pack.id}`}><Shuffle size={16} /> Generator</Link><Link className="outline-button" href="/online/"><Wifi size={16} /> Online room</Link>{category.drawable && <Link className="outline-button" href={`/drawing-imposter/?pack=${pack.id}`}><PenLine size={16} /> Draw it</Link>}</div>
      </section>
      <section className="generator-copy" aria-labelledby="pack-why">
        <div><span className="eyebrow"><ListChecks size={14} /> WHY IT PLAYS WELL</span><h2 id="pack-why">{words.length} words, built in pairs</h2><p>{pack.pitch}</p></div>
        <ol>{pack.pairs.map(pair => <li key={pair.a}><strong>{pair.a} vs {pair.b}</strong><span>{pair.why}</span></li>)}</ol>
      </section>
      <section className="generator-copy" aria-labelledby="pack-words">
        <div><span className="eyebrow"><BookOpen size={14} /> THE WORD LIST</span><h2 id="pack-words">Every word in the {pack.title.replace(' Imposter Game', '')} pack</h2><p>The imposter’s hint in this pack is “{category.hint.toLowerCase()}”. Reading the list before you play is allowed — knowing the pack is not the same as knowing the word.</p></div>
        <ul className="word-cloud">{words.map(word => <li key={word.id}>{word.text}</li>)}</ul>
      </section>
      <section className="generator-copy" aria-labelledby="pack-faq">
        <div><span className="eyebrow"><MessageCircleQuestion size={14} /> QUESTIONS</span><h2 id="pack-faq">Frequently asked</h2></div>
        <dl>{pack.faqs.map(faq => <div key={faq.q}><dt>{faq.q}</dt><dd>{faq.a}</dd></div>)}</dl>
      </section>
      <section className="generator-next">
        <h2>More packs</h2><p>Same bluff, different secret.</p>
        <div>{others.map(other => <Link key={other.slug} className="outline-button" href={`/packs/${other.slug}/`}>{other.title.replace(' Imposter Game', '')} <ArrowRight size={16} /></Link>)}<Link className="gold-button" href="/packs/">All packs <ArrowRight size={17} /></Link></div>
      </section>
    </main>
    <footer className="site-footer"><span className="footer-brand"><Eye size={18} strokeWidth={1.3} /> {siteName}<small>{siteHost}</small></span><span>{pack.title}, free.</span><span>One phone. No app. No sign-up.</span><Link href="/privacy/">Privacy</Link></footer>
  </div>;
}
