import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Eye, Fingerprint, Lightbulb, ListChecks, Wifi } from 'lucide-react';
import WordGenerator from '@/components/generator/word-generator';
import { pageMetadata } from '@/lib/seo';

const title = 'Imposter Word Generator - Random Secret Words';
const description = 'Generate random Imposter words by category. Use this simple word-only tool for secret-word rounds, clue ideas, and quick party games.';

export const metadata: Metadata = pageMetadata('/imposter-word-generator/', title, description);

export default function ImposterWordGeneratorPage() {
  return <div className="content-page">
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Imposter home"><span className="emblem emblem-small" aria-hidden="true"><Eye strokeWidth={1.25} /></span><span>imposter<span className="brand-dot">.</span></span></Link>
      <span className="header-note">RANDOM WORDS. QUICK ROUNDS.</span>
      <nav aria-label="Main navigation"><Link className="nav-link" href="/imposter-game-generator/"><Fingerprint size={17} /><span>Role cards</span></Link><span className="nav-divider" /><Link className="nav-link" href="/imposter-game-rules/"><ListChecks size={17} /><span>Rules</span></Link></nav>
    </header>
    <main>
      <section className="content-hero">
        <span className="eyebrow"><Lightbulb size={14} /> WORD GENERATOR</span>
        <h1>Imposter word generator</h1>
        <p>Generate a single secret word for your next Imposter round. This page is for groups that already know the game and want quick word ideas without setting up private role cards.</p>
        <div><Link className="gold-button" href="/imposter-game-generator/">Generate role cards <ArrowRight size={17} /></Link><Link className="outline-button" href="/imposter-game-words/">Browse word lists <ArrowRight size={16} /></Link></div>
      </section>
      <WordGenerator />
      <section className="example-section" aria-labelledby="word-generator-tips">
        <div><span className="eyebrow">CLUE IDEAS</span><h2 id="word-generator-tips">How to use random Imposter words</h2><p>Pick a word, show it only to the friends, and tell the imposter only their role. Friends should give clues that prove they know the word without spelling it out.</p></div>
        <ul>
          <li><span><strong>Too obvious:</strong> naming a direct ingredient, place, or synonym that gives the word away.</span></li>
          <li><span><strong>Too vague:</strong> clues like “thing,” “nice,” or “fun” can make a friend sound like the imposter.</span></li>
          <li><span><strong>Good balance:</strong> a clue connected to the word through memory, category, use, sound, or situation.</span></li>
        </ul>
      </section>
      <section className="content-next"><h2>Need private cards?</h2><p>The full game generator creates the secret word and assigns one imposter automatically.</p><div><Link className="gold-button" href="/imposter-game-generator/">Open game generator <ArrowRight size={17} /></Link><Link className="outline-button" href="/online/"><Wifi size={16} /> Play online</Link></div></section>
    </main>
  </div>;
}
