'use client';

import { useState } from 'react';
import { ArrowRight, Check, Copy, Shuffle } from 'lucide-react';
import { categories, getWords, type Category, type Word } from '@/lib/words';
import { secureRandom } from '@/lib/game';

function pickWord(category: Category): Word {
  const pool = getWords(category);
  return pool[Math.floor(secureRandom() * pool.length)];
}

export default function WordGenerator() {
  const [category, setCategory] = useState<Category>('mixed');
  const [word, setWord] = useState<Word | null>(null);
  const [copied, setCopied] = useState(false);

  function generate() {
    setWord(pickWord(category));
    setCopied(false);
  }

  async function copyWord() {
    if (!word) return;
    await navigator.clipboard?.writeText(word.text).catch(() => undefined);
    setCopied(true);
  }

  return <section className="word-tool" aria-labelledby="word-tool-title">
    <div>
      <span className="eyebrow"><Shuffle size={14} /> WORD ONLY TOOL</span>
      <h2 id="word-tool-title">Generate one secret word</h2>
      <p>Use this when you already know the Imposter rules and only need a fresh word for the next round.</p>
      <div className="generator-categories">
        {categories.map(item => <button type="button" key={item.id} className={category === item.id ? 'selected' : ''} aria-pressed={category === item.id} onClick={() => { setCategory(item.id); setWord(null); setCopied(false); }}>
          <Shuffle size={15} />
          <span>{item.short}</span>
          {category === item.id && <Check size={12} />}
        </button>)}
      </div>
      <button className="gold-button" type="button" onClick={generate}>Generate word <ArrowRight size={17} /></button>
    </div>
    <div className="word-result" aria-live="polite">
      {word ? <>
        <span>{categories.find(item => item.id === word.category)?.short}</span>
        <strong>{word.text}</strong>
        <button className="outline-button" type="button" onClick={copyWord}><Copy size={16} /> {copied ? 'Copied' : 'Copy word'}</button>
      </> : <>
        <span>{getWords(category).length} words available</span>
        <strong>Ready</strong>
        <p>Pick a category and generate a word.</p>
      </>}
    </div>
  </section>;
}
