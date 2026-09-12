import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Eye, Layers, Shuffle, Sparkles, Wifi } from 'lucide-react';
import { pageMetadata } from '@/lib/seo';
import { categories, getWords } from '@/lib/words';
import BrandWordmark from '@/components/brand';

const title = 'Imposter Game Categories - Best Word Packs';
const description = 'Choose the best Imposter game categories for your group: food, animals, places, objects, activities, and mixed word packs.';

export const metadata: Metadata = pageMetadata('/imposter-game-categories/', title, description);

const guidance: Record<string, string> = {
  food: 'Easy to explain and good for first rounds because most clues can be specific without being too revealing.',
  animals: 'Good for kids and mixed-age groups. Clues can use habitat, sound, size, movement, or appearance.',
  places: 'Great for travel and memory clues. Players can hint at what people do there without naming the place.',
  objects: 'Good all-purpose category. Everyday objects create fair clues because everyone understands the word.',
  activities: 'Slightly harder because clues can become broad. Best after the group understands the game.',
};

export default function ImposterGameCategoriesPage() {
  return <div className="content-page">
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Imposter home"><span className="emblem emblem-small" aria-hidden="true"><Eye strokeWidth={1.25} /></span><BrandWordmark /></Link>
      <span className="header-note">CATEGORIES. WORD PACKS.</span>
      <nav aria-label="Main navigation"><Link className="nav-link" href="/imposter-game-words/"><Shuffle size={17} /><span>Words</span></Link><span className="nav-divider" /><Link className="nav-link" href="/online/"><Wifi size={17} /><span>Online</span></Link></nav>
    </header>
    <main>
      <section className="content-hero">
        <span className="eyebrow"><Layers size={14} /> CATEGORY GUIDE</span>
        <h1>Imposter game categories</h1>
        <p>Choose a category based on your group. Easy categories create faster rounds. Broader categories create harder bluffs and more debate.</p>
        <div><Link className="gold-button" href="/imposter-game-generator/">Generate by category <ArrowRight size={17} /></Link><Link className="outline-button" href="/imposter-game-words/">Browse all words <ArrowRight size={16} /></Link></div>
      </section>
      <section className="word-list-section" aria-labelledby="category-guide">
        <h2 id="category-guide">Which category should you pick?</h2>
        <div>{categories.filter(category => category.id !== 'mixed').map(category => <article key={category.id}>
          <h3>{category.short}</h3>
          <p>{guidance[category.id]}</p>
          <ul>{getWords(category.id).slice(0, 12).map(word => <li key={word.id}>{word.text}</li>)}</ul>
        </article>)}</div>
      </section>
      <section className="example-section" aria-labelledby="category-tips">
        <div><span className="eyebrow"><Sparkles size={14} /> DIFFICULTY</span><h2 id="category-tips">Simple way to set difficulty</h2><p>Choose familiar concrete words for easy rounds. Choose broader activities or mixed categories when players are comfortable bluffing.</p></div>
        <ul>
          <li><span><strong>First game:</strong> food or objects.</span></li>
          <li><span><strong>Family game:</strong> animals or places.</span></li>
          <li><span><strong>Harder game:</strong> activities or mixed bag.</span></li>
        </ul>
      </section>
      <section className="example-section" aria-labelledby="themed-packs-heading"><div><span className="eyebrow">THEMED PACKS</span><h2 id="themed-packs-heading">Halloween, football, K-pop, pop and Christmas</h2><p>Five free themed packs, each with 48 words and its own page: <Link href="/packs/halloween/">Halloween</Link>, <Link href="/packs/football/">football</Link>, <Link href="/packs/k-pop/">K-pop</Link>, <Link href="/packs/pop-superstars/">pop superstars</Link> and <Link href="/packs/christmas/">Christmas</Link>. Browse them all on the <Link href="/packs/">packs page</Link>.</p></div><ul className="variant-list"><li><strong>Seasonal.</strong> Halloween and Christmas words for the parties that actually happen.</li><li><strong>Fandom.</strong> Football, K-pop and pop hits: the friends who know the most get suspected the most.</li></ul></section>
    </main>
  </div>;
}
