import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, BookOpen, Eye, ListChecks, MessageCircleQuestion, Sparkles, Wifi } from 'lucide-react';
import BrandWordmark, { siteHost, siteName } from '@/components/brand';

// The static frame around each pass-and-play variant: header, hero, the game, and an explainer
// that is real HTML at build time (the tool alone would be an empty page to a crawler). The copy is
// per page; the shape is shared so the three variants read as one family.
export interface Faq { q: string; a: string; }
export interface VariantPageProps {
  eyebrow: string; title: ReactNode; lead: string; headerNote: string;
  game: ReactNode;
  howTitle: string; howIntro: string; steps: { title: string; text: string }[];
  rulesTitle: string; rules: { term: string; text: string }[];
  faqs: Faq[];
  nextTitle: string; nextText: string; footerNote: string;
}
export default function VariantPage({ eyebrow, title, lead, headerNote, game, howTitle, howIntro, steps, rulesTitle, rules, faqs, nextTitle, nextText, footerNote }: VariantPageProps) {
  return <div className="generator-page variant-page">
    <a className="skip-link" href="#variant-game">Skip to game</a>
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Imposter home"><span className="emblem emblem-small" aria-hidden="true"><Eye strokeWidth={1.25} /></span><BrandWordmark /></Link>
      <span className="header-note">{headerNote}</span>
      <nav aria-label="Main navigation"><Link className="nav-link" href="/imposter-game-rules/"><BookOpen size={17} /><span>Rules</span></Link><span className="nav-divider" /><Link className="nav-link" href="/online/"><Wifi size={17} /><span>Online</span></Link></nav>
    </header>
    <main>
      <section className="variant-hero"><span className="eyebrow"><Sparkles size={14} /> {eyebrow}</span><h1>{title}</h1><p>{lead}</p></section>
      <div className="variant-tool" id="variant-game">{game}</div>
      <section className="generator-copy" aria-labelledby="variant-how">
        <div><span className="eyebrow"><ListChecks size={14} /> HOW TO PLAY</span><h2 id="variant-how">{howTitle}</h2><p>{howIntro}</p></div>
        <ol>{steps.map(step => <li key={step.title}><strong>{step.title}</strong><span>{step.text}</span></li>)}</ol>
      </section>
      <section className="generator-copy" aria-labelledby="variant-rules">
        <div><span className="eyebrow"><BookOpen size={14} /> RULES & TIPS</span><h2 id="variant-rules">{rulesTitle}</h2></div>
        <dl>{rules.map(rule => <div key={rule.term}><dt>{rule.term}</dt><dd>{rule.text}</dd></div>)}</dl>
      </section>
      <section className="generator-copy" aria-labelledby="variant-faq">
        <div><span className="eyebrow"><MessageCircleQuestion size={14} /> QUESTIONS</span><h2 id="variant-faq">Frequently asked</h2></div>
        <dl>{faqs.map(faq => <div key={faq.q}><dt>{faq.q}</dt><dd>{faq.a}</dd></div>)}</dl>
      </section>
      <section className="generator-next">
        <h2>{nextTitle}</h2><p>{nextText}</p>
        <div><Link className="gold-button" href="/">Play the word game <ArrowRight size={17} /></Link><Link className="outline-button" href="/timer-imposter/">Timer Imposter <ArrowRight size={16} /></Link><Link className="outline-button" href="/question-imposter/">Question Imposter <ArrowRight size={16} /></Link><Link className="outline-button" href="/drawing-imposter/">Drawing Imposter <ArrowRight size={16} /></Link></div>
      </section>
    </main>
    <footer className="site-footer"><span className="footer-brand"><Eye size={18} strokeWidth={1.3} /> {siteName}<small>{siteHost}</small></span><span>{footerNote}</span><span>One phone. No app. No sign-up.</span><Link href="/privacy/">Privacy</Link></footer>
  </div>;
}
