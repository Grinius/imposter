import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Download, Eye, Fingerprint, Mail, Newspaper, Smartphone, Users, Wifi } from 'lucide-react';
import { pageMetadata } from '@/lib/seo';
import { freePlayerLimit, premiumPlayerLimit } from '@/lib/limits';
import { packs } from '@/lib/packs';
import BrandWordmark from '@/components/brand';

const title = 'Press Kit - LaughTable Imposter Game';
const description = 'Press kit for LaughTable’s Imposter game: one-paragraph description, logo, screenshots, how to play in three lines, and a contact for writers.';

export const metadata: Metadata = pageMetadata('/press/', title, description);

const contact = 'justinas@appcognita.com';

// Everything a writer needs to link the game without asking: the screenshots are real captures of
// one pass-and-play round on a phone (scripts/press-shots.mjs), the PNGs are the files to embed.
const shots = [
  ['01-setup', 'Setup screen on a phone: the table illustration, player list and category picker', 'Setup'],
  ['02-secret-card', 'A private card showing the secret word "Strawberry" for one player', 'Secret card'],
  ['03-vote', 'The private ballot: "Who’s bluffing?" with three suspects to choose from', 'Voting'],
  ['04-reveal', 'The reveal: "The imposter was Taylor. The secret word: Strawberry."', 'Reveal'],
] as const;

const facts = [
  ['Players', `${freePlayerLimit} free, up to ${premiumPlayerLimit} with Premium`],
  ['Round length', 'About ten minutes'],
  ['Devices', 'One shared phone, or a private online room with a device each'],
  ['Cost', 'Free to play; no app, no account, no ads'],
  ['Word packs', `${packs.length} themed packs plus the core categories`],
  ['Variants', 'Timer Imposter, Question Imposter, Drawing Imposter'],
  ['Platform', 'Any modern browser on phone, tablet or desktop'],
  ['Made by', 'Justinas Grinius, independent developer'],
] as const;

export default function PressPage() {
  return <div className="content-page">
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Imposter home"><span className="emblem emblem-small" aria-hidden="true"><Eye strokeWidth={1.25} /></span><BrandWordmark /></Link>
      <span className="header-note">PRESS KIT. FACTS. FILES.</span>
      <nav aria-label="Main navigation"><Link className="nav-link" href="/imposter-game-rules/"><Fingerprint size={17} /><span>Rules</span></Link><span className="nav-divider" /><Link className="nav-link" href="/online/"><Wifi size={17} /><span>Online</span></Link></nav>
    </header>
    <main>
      <section className="content-hero">
        <span className="eyebrow"><Newspaper size={14} /> PRESS KIT</span>
        <h1>LaughTable press kit</h1>
        <p>Writing about the Imposter game? Everything on this page is free to use: description, logo, screenshots, and a three-line explanation of how to play. Link to <strong>laughtable.com</strong> and we&rsquo;re happy.</p>
        <div><a className="gold-button" href={`mailto:${contact}`}><Mail size={17} /> {contact}</a><Link className="outline-button" href="/">Play the game <ArrowRight size={16} /></Link></div>
      </section>

      <section className="example-section" aria-labelledby="press-about">
        <div>
          <span className="eyebrow"><Eye size={14} /> IN ONE PARAGRAPH</span>
          <h2 id="press-about">What LaughTable is</h2>
          <p className="press-paragraph">LaughTable is a free browser version of Imposter, the secret-word party game that spread on TikTok. Everyone at the table gets the same secret word except one player, the imposter, who has to bluff through a round of one-word clues without knowing what everyone else is talking about. It runs on one shared phone or in a private online room with a code, needs no app, account or download, and offers {packs.length} themed word packs alongside timer, question and drawing variants.</p>
          <p className="press-short"><strong>Short version:</strong> Free Imposter party game in your browser: one phone or an online room, no app, no sign-up.</p>
        </div>
        <ul>
          {facts.map(([label, value]) => <li key={label}><Users size={17} /><span><strong>{label}:</strong> {value}</span></li>)}
        </ul>
      </section>

      <section className="content-grid" aria-labelledby="press-how">
        <h2 id="press-how">How to play, in three lines</h2>
        <div>
          <article><span>01</span><h3>One word, one liar</h3><p>Everyone secretly sees the same word. One player sees &ldquo;The imposter&rdquo; instead.</p></article>
          <article><span>02</span><h3>One-word clues</h3><p>Go around the table giving a single-word clue. Prove you know the word without giving it away.</p></article>
          <article><span>03</span><h3>Vote, then reveal</h3><p>Vote for the bluffer. Catch the imposter and they get one guess at the word to steal the win.</p></article>
        </div>
      </section>

      <section className="press-shots" aria-labelledby="press-shots">
        <div className="press-shots-heading">
          <span className="eyebrow"><Smartphone size={14} /> SCREENSHOTS</span>
          <h2 id="press-shots">Four screens from one round</h2>
          <p>Phone captures at 780&times;1688, PNG. Click a screenshot for the full-size file. Free to embed and crop; please credit laughtable.com.</p>
        </div>
        <ul>
          {shots.map(([file, alt, caption]) => <li key={file}>
            <a href={`/press/${file}.png`}><Image src={`/press/${file}.webp`} alt={alt} width="390" height="844" loading="lazy" /></a>
            <span>{caption} <a className="press-download" href={`/press/${file}.png`} download><Download size={13} /> PNG</a></span>
          </li>)}
        </ul>
      </section>

      <section className="example-section" aria-labelledby="press-logo">
        <div>
          <span className="eyebrow"><Download size={14} /> LOGO &amp; SOCIAL CARD</span>
          <h2 id="press-logo">Logo files</h2>
          <p>The emblem is an eye in a dark green tile with gold line-work. Use it on light or dark backgrounds; don&rsquo;t recolour it. The wordmark is &ldquo;imposter. by LaughTable&rdquo;, and the site name is always written <strong>LaughTable</strong>, one word, capital L and T.</p>
          <div className="press-logo-row">
            <Image src="/press/laughtable-emblem.png" alt="LaughTable emblem: a gold eye on a dark green tile" width="96" height="96" />
            <div><a className="press-download" href="/press/laughtable-emblem.svg" download><Download size={13} /> Emblem SVG</a><a className="press-download" href="/press/laughtable-emblem.png" download><Download size={13} /> Emblem PNG 512px</a><a className="press-download" href="/og/laughtable-imposter.png" download><Download size={13} /> Social card 1200&times;630</a></div>
          </div>
        </div>
        <ul>
          <li><Smartphone size={17} /><span><strong>Where to link:</strong> the home page <Link href="/">laughtable.com</Link> for the classic game, <Link href="/timer-imposter/">/timer-imposter/</Link> for the timer variant, <Link href="/imposter-game-online/">/imposter-game-online/</Link> for remote play.</span></li>
          <li><Fingerprint size={17} /><span><strong>Founder line:</strong> LaughTable is built and run by Justinas Grinius, an independent developer. Available for quotes and interviews by email.</span></li>
          <li><Mail size={17} /><span><strong>Contact:</strong> <a href={`mailto:${contact}`}>{contact}</a>. Email is the fastest way to reach us.</span></li>
        </ul>
      </section>

      <section className="content-next"><h2>Want to try it before you write?</h2><p>A full round with three to five people takes about ten minutes. No sign-up, so open it on your phone and pass it around the desk.</p><div><Link className="gold-button" href="/">Play on one phone <ArrowRight size={17} /></Link><Link className="outline-button" href="/imposter-game-rules/">Full rules <ArrowRight size={16} /></Link></div></section>
    </main>
  </div>;
}
