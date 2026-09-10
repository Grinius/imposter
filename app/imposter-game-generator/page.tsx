import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, Eye, ListChecks, ShieldCheck, Wifi } from 'lucide-react';
import ImposterGenerator from '@/components/generator/imposter-generator';
import { categories, getWords } from '@/lib/words';
import { pageMetadata } from '@/lib/seo';

const title = 'Imposter Game Generator - Free Secret Word Cards';
const description = 'Use this free imposter game generator to create secret words, private role cards, and one imposter for 3-5 free players. Play on one phone or online.';

export const metadata: Metadata = {
  ...pageMetadata('/imposter-game-generator/', title, description),
};

export default function ImposterGameGeneratorPage() {
  return <div className="generator-page">
    <a className="skip-link" href="#generator-tool-title">Skip to generator</a>
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Imposter home"><span className="emblem emblem-small" aria-hidden="true"><Eye strokeWidth={1.25} /></span><span>imposter<span className="brand-dot">.</span></span></Link>
      <span className="header-note">SECRET WORDS. PRIVATE ROLES.</span>
      <nav aria-label="Main navigation"><Link className="nav-link" href="/imposter-game-rules/"><BookOpen size={17} /><span>Rules</span></Link><span className="nav-divider" /><Link className="nav-link" href="/online/"><Wifi size={17} /><span>Online</span></Link></nav>
    </header>
    <main>
      <ImposterGenerator />
      <section className="generator-copy" aria-labelledby="generator-rules">
        <div>
          <span className="eyebrow"><ListChecks size={14} /> HOW IT WORKS</span>
          <h2 id="generator-rules">Generate an imposter game in seconds.</h2>
          <p>This imposter game generator creates one secret word for the friends and assigns one player as the imposter. Players reveal their own card privately, give clues, discuss suspicious answers, and vote for the person who does not seem to know the word.</p>
        </div>
        <ol>
          <li><strong>Add 3-5 free players.</strong><span>Use real names or nicknames so the vote is easy to follow.</span></li>
          <li><strong>Pick a word category.</strong><span>Use mixed words for variety, or choose food, animals, places, objects, or activities.</span></li>
          <li><strong>Reveal cards privately.</strong><span>Friends see the secret word. The imposter sees their role and tries to blend in.</span></li>
          <li><strong>Give clues and vote.</strong><span>After everyone gives clues, vote. If the imposter is caught, they can still win by guessing the word.</span></li>
        </ol>
      </section>
      <section className="generator-word-packs" aria-labelledby="generator-packs">
        <span className="eyebrow"><ShieldCheck size={14} /> WORD PACKS</span>
        <h2 id="generator-packs">Built-in imposter word categories</h2>
        <div>
          {categories.filter(category => category.id !== 'mixed').map(category => <article key={category.id}>
            <h3>{category.name}</h3>
            <p>{category.hint}</p>
            <span>{getWords(category.id).length} starter words</span>
          </article>)}
        </div>
      </section>
      <section className="generator-next">
        <h2>Want the full game flow?</h2>
        <p>Use the main game for timed discussion, private voting, final guesses, and replay. Use online rooms when every player has their own device.</p>
        <div><Link className="gold-button" href="/">Play on one phone <ArrowRight size={17} /></Link><Link className="outline-button" href="/imposter-game-words/">Browse words <ArrowRight size={16} /></Link><Link className="outline-button" href="/online/">Create online room <ArrowRight size={16} /></Link></div>
      </section>
    </main>
    <footer className="site-footer"><span className="footer-brand"><Eye size={18} strokeWidth={1.3} /> imposter.</span><span>Free imposter word game generator.</span><span>Private cards. Better bluffs.</span><Link href="/privacy/">Privacy</Link></footer>
  </div>;
}
