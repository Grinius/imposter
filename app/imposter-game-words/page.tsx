import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Eye, Fingerprint, Shuffle, Sparkles, Wifi } from 'lucide-react';
import { pageMetadata } from '@/lib/seo';
import { categories, getWords } from '@/lib/words';
import BrandWordmark from '@/components/brand';

const title = 'Imposter Game Words - Free Secret Word Lists by Category';
const description = 'Browse Imposter game words for food, animals, places, objects, and activities. Use the lists for clue ideas or generate private cards.';

export const metadata: Metadata = pageMetadata('/imposter-game-words/', title, description);

export default function ImposterGameWordsPage() {
  return <div className="content-page">
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Imposter home"><span className="emblem emblem-small" aria-hidden="true"><Eye strokeWidth={1.25} /></span><BrandWordmark /></Link>
      <span className="header-note">WORD LISTS. BETTER CLUES.</span>
      <nav aria-label="Main navigation"><Link className="nav-link" href="/imposter-game-rules/"><Sparkles size={17} /><span>Rules</span></Link><span className="nav-divider" /><Link className="nav-link" href="/online/"><Wifi size={17} /><span>Online</span></Link></nav>
    </header>
    <main>
      <section className="content-hero">
        <span className="eyebrow"><Shuffle size={14} /> WORD LISTS</span>
        <h1>Imposter game words</h1>
        <p>Use these secret-word lists for Imposter, Impostor, Spyfall-style clue games, and social deduction party nights. The built-in generator uses these same starter categories.</p>
        <div><Link className="gold-button" href="/imposter-game-generator/">Generate private cards <ArrowRight size={17} /></Link><Link className="outline-button" href="/imposter-word-generator/">Use word generator <ArrowRight size={16} /></Link><Link className="outline-button" href="/imposter-game-categories/">Browse categories <ArrowRight size={16} /></Link></div>
      </section>
      <section className="word-list-section" aria-labelledby="word-categories">
        <h2 id="word-categories">Secret word categories</h2>
        <div>
          {categories.filter(category => category.id !== 'mixed').map(category => {
            const categoryWords = getWords(category.id);
            return <article key={category.id}>
              <h3>{category.name}</h3>
              <p>{category.hint}. Use this pack when your group wants words that are familiar and easy to bluff around.</p>
              <ul>{categoryWords.map(word => <li key={word.id}>{word.text}</li>)}</ul>
            </article>;
          })}
        </div>
      </section>
      <section className="example-section" aria-labelledby="word-tips">
        <div>
          <span className="eyebrow"><Fingerprint size={14} /> CHOOSING WORDS</span>
          <h2 id="word-tips">What makes a good Imposter word?</h2>
          <p>A good word is familiar, flexible, and easy to describe from several angles. “Airport” works because players can hint at travel, luggage, planes, security, delays, or vacations. Very obscure words usually make both friends and imposters sound equally lost.</p>
        </div>
        <ul>
          <li><span><strong>Easy mode:</strong> food, objects, and common places.</span></li>
          <li><span><strong>Harder mode:</strong> activities and broader mixed categories.</span></li>
          <li><span><strong>For kids:</strong> animals, snacks, places, and simple objects.</span></li>
        </ul>
      </section>
    </main>
  </div>;
}
