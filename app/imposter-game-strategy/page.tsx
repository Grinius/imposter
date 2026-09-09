import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Eye, Fingerprint, ShieldCheck, Target, Vote, Wifi } from 'lucide-react';
import { pageMetadata } from '@/lib/seo';

const title = 'Imposter Game Strategy - Clues, Bluffing, and Voting Tips';
const description = 'Improve your Imposter game strategy with clue tips for friends, bluffing tips for the imposter, and voting advice for close rounds.';

export const metadata: Metadata = pageMetadata('/imposter-game-strategy/', title, description);

const friendTips = [
  'Give clues connected to the word through use, place, texture, memory, or category.',
  'Avoid clues so direct that the imposter can immediately guess the word.',
  'Listen for players who repeat previous clues instead of adding a fresh angle.',
];

const imposterTips = [
  'Start broad, then become more specific only after hearing enough clues.',
  'Use category-safe words instead of pretending you know a detail you might get wrong.',
  'Watch reactions. A clue that makes everyone pause may reveal more than the words themselves.',
];

export default function ImposterGameStrategyPage() {
  return <div className="content-page">
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Imposter home"><span className="emblem emblem-small" aria-hidden="true"><Eye strokeWidth={1.25} /></span><span>imposter<span className="brand-dot">.</span></span></Link>
      <span className="header-note">CLUES. BLUFFS. VOTES.</span>
      <nav aria-label="Main navigation"><Link className="nav-link" href="/imposter-game-rules/"><ShieldCheck size={17} /><span>Rules</span></Link><span className="nav-divider" /><Link className="nav-link" href="/imposter-game-generator/"><Fingerprint size={17} /><span>Generator</span></Link></nav>
    </header>
    <main>
      <section className="content-hero">
        <span className="eyebrow"><Target size={14} /> STRATEGY GUIDE</span>
        <h1>Imposter game strategy</h1>
        <p>Better clues make the game sharper. Friends need to prove they know the word, while the imposter needs to sound connected without overcommitting.</p>
        <div><Link className="gold-button" href="/imposter-game-generator/">Start a round <ArrowRight size={17} /></Link><Link className="outline-button" href="/imposter-game-rules/">Read rules <ArrowRight size={16} /></Link></div>
      </section>
      <section className="strategy-columns" aria-labelledby="strategy-tips">
        <h2 id="strategy-tips">How to win more rounds</h2>
        <div>
          <article><ShieldCheck size={31} strokeWidth={1.2} /><h3>Friend strategy</h3><ul>{friendTips.map(tip => <li key={tip}>{tip}</li>)}</ul></article>
          <article><Fingerprint size={31} strokeWidth={1.2} /><h3>Imposter strategy</h3><ul>{imposterTips.map(tip => <li key={tip}>{tip}</li>)}</ul></article>
        </div>
      </section>
      <section className="example-section" aria-labelledby="voting-strategy">
        <div><span className="eyebrow"><Vote size={14} /> VOTING</span><h2 id="voting-strategy">What to watch before voting</h2><p>The best vote usually comes from the whole pattern: clue quality, timing, confidence, and whether someone seemed to learn the word during discussion.</p></div>
        <ul>
          <li><span><strong>Vague clues:</strong> suspicious when everyone else gives specific but safe clues.</span></li>
          <li><span><strong>Copied clues:</strong> suspicious when a player adds no new angle.</span></li>
          <li><span><strong>Too specific too late:</strong> suspicious when someone suddenly sounds confident after hearing the table.</span></li>
        </ul>
      </section>
      <section className="content-next"><h2>Put the strategy to work</h2><p>Generate a round, play online, or browse word lists for clue practice.</p><div><Link className="gold-button" href="/imposter-game-generator/">Generate game <ArrowRight size={17} /></Link><Link className="outline-button" href="/online/"><Wifi size={16} /> Online room</Link></div></section>
    </main>
  </div>;
}
