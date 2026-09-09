import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Eye, Fingerprint, Link2, RefreshCw, Smartphone, Users, Wifi } from 'lucide-react';
import { pageMetadata } from '@/lib/seo';

const title = 'Imposter Game Online - Play Free with Friends';
const description = 'Play Imposter online with friends in a private room. Create a room code, reveal private roles, give clues, vote, and make the final guess.';

export const metadata: Metadata = pageMetadata('/imposter-game-online/', title, description);

const features = [
  ['Private room code', 'Create a six-character room code and share it with friends.'],
  ['Separate devices', 'Each player joins from their own browser, so role reveals stay private.'],
  ['Synchronized clues', 'The room tracks clue turns, voting, final guesses, and results.'],
  ['Reconnect support', 'Players can refresh or reconnect while the room keeps the round state.'],
] as const;

export default function ImposterGameOnlinePage() {
  return <div className="content-page">
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Imposter home"><span className="emblem emblem-small" aria-hidden="true"><Eye strokeWidth={1.25} /></span><span>imposter<span className="brand-dot">.</span></span></Link>
      <span className="header-note">PRIVATE ROOMS. REAL-TIME BLUFFS.</span>
      <nav aria-label="Main navigation"><Link className="nav-link" href="/imposter-game-rules/"><Fingerprint size={17} /><span>Rules</span></Link><span className="nav-divider" /><Link className="nav-link" href="/imposter-game-generator/"><Users size={17} /><span>Generator</span></Link></nav>
    </header>
    <main>
      <section className="content-hero">
        <span className="eyebrow"><Wifi size={14} /> ONLINE ROOMS</span>
        <h1>Imposter game online</h1>
        <p>Play Imposter online with a private room code. Friends join on their own devices, receive private roles, submit clues, vote, and see the result together.</p>
        <div><Link className="gold-button" href="/online/">Create online room <ArrowRight size={17} /></Link><Link className="outline-button" href="/imposter-game-rules/">Read rules <ArrowRight size={16} /></Link></div>
      </section>
      <section className="content-grid" aria-labelledby="online-features">
        <h2 id="online-features">Online room features</h2>
        <div>{features.map(([heading, copy], index) => <article key={heading}><span>{String(index + 1).padStart(2, '0')}</span><h3>{heading}</h3><p>{copy}</p></article>)}</div>
      </section>
      <section className="example-section" aria-labelledby="online-setup">
        <div><span className="eyebrow"><Link2 size={14} /> START A ROOM</span><h2 id="online-setup">How to play online</h2><p>One player creates the room, shares the code, and starts the round when everyone joins. The game sends each player only the private role they are allowed to see.</p></div>
        <ul>
          <li><Smartphone size={17} /><span><strong>Best for remote groups:</strong> video call on the side, game room in the browser.</span></li>
          <li><RefreshCw size={17} /><span><strong>Refresh friendly:</strong> reconnect support helps if someone reloads mid-round.</span></li>
          <li><Fingerprint size={17} /><span><strong>Private roles:</strong> the imposter sees their role, friends see the secret word.</span></li>
        </ul>
      </section>
    </main>
  </div>;
}
