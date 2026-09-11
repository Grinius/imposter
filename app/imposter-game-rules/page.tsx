import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Eye, Fingerprint, ListChecks, MessageCircle, ShieldCheck, Smartphone, Vote, Wifi } from 'lucide-react';
import { pageMetadata } from '@/lib/seo';
import BrandWordmark from '@/components/brand';

const title = 'Imposter Game Rules - How to Play the Secret Word Game';
const description = 'Learn the Imposter game rules: secret words, one imposter, clue rounds, voting, final guesses, and simple house rules for 3-5 free players.';

export const metadata: Metadata = pageMetadata('/imposter-game-rules/', title, description);

const rules = [
  ['Setup', 'Add 3-5 free players. The game chooses one secret word and one imposter. Everyone except the imposter receives the same word.'],
  ['Private reveal', 'Pass the phone or use separate devices. Each player should see only their own card. Friends see the word. The imposter sees their role.'],
  ['Clues', 'Players take turns giving short clues. A good clue proves you know the word without making the word obvious to the imposter.'],
  ['Discussion', 'After clues, talk through who sounded vague, copied another clue, reacted oddly, or seemed too confident.'],
  ['Voting', 'Everyone votes privately. You cannot vote for yourself. The player with the most votes is accused.'],
  ['Final guess', 'If the group catches the imposter, the imposter gets one guess at the secret word. A correct guess lets the imposter steal the win.'],
] as const;

export default function ImposterGameRulesPage() {
  return <div className="content-page">
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Imposter home"><span className="emblem emblem-small" aria-hidden="true"><Eye strokeWidth={1.25} /></span><BrandWordmark /></Link>
      <span className="header-note">RULES. CLUES. VOTES.</span>
      <nav aria-label="Main navigation"><Link className="nav-link" href="/imposter-game-generator/"><Fingerprint size={17} /><span>Generator</span></Link><span className="nav-divider" /><Link className="nav-link" href="/online/"><Wifi size={17} /><span>Online</span></Link></nav>
    </header>
    <main>
      <section className="content-hero">
        <span className="eyebrow"><ListChecks size={14} /> HOW TO PLAY</span>
        <h1>Imposter game rules</h1>
        <p>The Imposter game is a secret-word party game. Most players know the same word. One player is the imposter and has to bluff through clues, discussion, and voting.</p>
        <div><Link className="gold-button" href="/imposter-game-generator/">Generate a game <ArrowRight size={17} /></Link><Link className="outline-button" href="/imposter-game-strategy/">Strategy guide <ArrowRight size={16} /></Link><Link className="outline-button" href="/">Play on one phone <ArrowRight size={16} /></Link></div>
      </section>
      <section className="content-grid" aria-labelledby="rules-steps">
        <h2 id="rules-steps">Step-by-step rules</h2>
        <div>{rules.map(([heading, copy], index) => <article key={heading}><span>{String(index + 1).padStart(2, '0')}</span><h3>{heading}</h3><p>{copy}</p></article>)}</div>
      </section>
      <section className="example-section" aria-labelledby="rules-example">
        <div>
          <span className="eyebrow"><MessageCircle size={14} /> EXAMPLE ROUND</span>
          <h2 id="rules-example">Example clues for one round</h2>
          <p>If the secret word is “pizza,” friends might say “cheese,” “oven,” or “slice.” The imposter does not know the word, so they might give a vague clue like “food.” That clue could be safe, but it may also make the table suspicious.</p>
        </div>
        <ul>
          <li><ShieldCheck size={17} /><span><strong>Good friend clue:</strong> specific enough to prove knowledge, vague enough to protect the word.</span></li>
          <li><Fingerprint size={17} /><span><strong>Good imposter bluff:</strong> follows the category without repeating clues too obviously.</span></li>
          <li><Vote size={17} /><span><strong>Good vote:</strong> based on clues, reactions, and who sounded least connected to the word.</span></li>
        </ul>
      </section>
      <section className="content-next"><h2>Ready to play?</h2><p>Start with the generator for quick private cards, use pass-and-play for the full local round, or create an online room when everyone has their own device.</p><div><Link className="gold-button" href="/imposter-game-generator/">Use generator <ArrowRight size={17} /></Link><Link className="outline-button" href="/online/"><Smartphone size={16} /> Online room</Link></div></section>
    </main>
  </div>;
}
