'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, Check, Eye, EyeOff, Feather, Fingerprint, LockKeyhole, Plus, RotateCcw, Shuffle, Sparkles, Users, X } from 'lucide-react';
import { categories, getWords, type Category, type Word } from '@/lib/words';
import { secureRandom, type Settings } from '@/lib/game';
import UpgradeCard from '@/components/premium/upgrade-card';
import PremiumPaywallNotice from '@/components/premium/paywall-notice';
import { freePlayerLimit, minPlayerLimit, premiumPlayerLimit } from '@/lib/limits';
import { describePremiumRequirements, premiumFeatures } from '@/lib/premium';
import { usePremiumStatus } from '@/lib/premium-client';
import { categoryFromSearch } from '@/lib/packs';
import { useClientValue } from '@/lib/use-client-value';
import { useTheme } from '@/components/theme';
import { recentWords, rememberWord } from '@/lib/history';
import { freshPool } from '@/lib/deduction';

type GeneratedPlayer = { name: string; isImposter: boolean };
type GeneratedGame = { word: Word; players: GeneratedPlayer[] };

function randomIndex(length: number) {
  return Math.floor(secureRandom() * length);
}

function makeGame(names: string[], category: Category): GeneratedGame {
  const pool = freshPool(getWords(category), recentWords());
  const word = pool[randomIndex(pool.length)]; rememberWord(word.id);
  const imposter = randomIndex(names.length);
  return { word, players: names.map((name, index) => ({ name: name.trim(), isImposter: index === imposter })) };
}

export default function ImposterGenerator() {
  const { premium } = usePremiumStatus();
  const [names, setNames] = useState(['Alex', 'Jamie', 'Taylor', 'Morgan']);
  const [picked, setCategory] = useState<Category | null>(null);
  const packParam = useClientValue(() => categoryFromSearch(window.location.search), null);
  const category: Category = picked ?? packParam ?? 'mixed';
  useTheme(category);
  const [game, setGame] = useState<GeneratedGame | null>(null);
  const [revealed, setRevealed] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [paywallReasons, setPaywallReasons] = useState<string[] | null>(null);
  const currentCategory = useMemo(() => categories.find(item => item.id === category)!, [category]);

  function addPlayer() {
    let next = names.length + 1;
    while (names.includes(`Player ${next}`)) next += 1;
    setNames([...names, `Player ${next}`]);
    setPaywallReasons(null);
  }

  function useFreeSetup() {
    setNames(current => current.slice(0, freePlayerLimit));
    if (currentCategory.premium) setCategory('mixed');
    setPaywallReasons(null);
  }

  function generate() {
    const trimmed = names.map(name => name.trim());
    if (!premium) {
      const reasons = describePremiumRequirements({ names: trimmed, category, minutes: 3, hints: true } as Settings);
      if (reasons.length) { setPaywallReasons(reasons); setError(''); return; }
    }
    if (trimmed.length < minPlayerLimit || trimmed.length > premiumPlayerLimit) { setError(`Use ${minPlayerLimit}-${premiumPlayerLimit} players.`); return; }
    if (trimmed.some(name => !name || name.length > 20)) { setError('Give every player a name up to 20 characters.'); return; }
    if (new Set(trimmed.map(name => name.toLocaleLowerCase())).size !== trimmed.length) { setError('Each player needs a different name.'); return; }
    setError(''); setPaywallReasons(null);
    setRevealed(null);
    setGame(makeGame(trimmed, category));
  }

  return <section className="generator-tool" aria-labelledby="generator-tool-title">
    <div className="generator-controls">
      <div className="generator-panel">
        <span className="eyebrow"><Sparkles size={14} /> FREE IMPOSTER GAME GENERATOR</span>
        <h1 id="generator-tool-title">Imposter game generator</h1>
        <p>Create a secret word, assign one imposter, and reveal private role cards for 3-5 free players.</p>
        <div className="generator-field">
          <label id="generator-players"><Users size={16} /> Players</label>
          <span>{names.length} / {premium ? premiumPlayerLimit : `${freePlayerLimit} free`}</span>
        </div>
        <div className="generator-names" role="group" aria-labelledby="generator-players">
          {names.map((name, index) => { const isPremiumSlot = !premium && index >= freePlayerLimit; return <div className={`generator-name ${isPremiumSlot ? 'premium-slot' : ''}`} key={index}>
            <input aria-label={`Player ${index + 1} name`} value={name} maxLength={20} onChange={event => { setNames(names.map((value, i) => i === index ? event.target.value : value)); setError(''); setPaywallReasons(null); }} />
            <button type="button" aria-label={`Remove player ${index + 1}`} disabled={names.length <= minPlayerLimit} onClick={() => { setNames(names.filter((_, i) => i !== index)); setPaywallReasons(null); }}><X size={14} /></button>
            {isPremiumSlot && <small className="premium-tag"><LockKeyhole size={10} /> Premium</small>}
          </div>; })}
        </div>
        <button className="generator-add" type="button" disabled={names.length >= premiumPlayerLimit} onClick={addPlayer}><Plus size={15} /> Add player{!premium && names.length >= freePlayerLimit && <span className="premium-tag inline"><LockKeyhole size={10} /> Premium</span>}</button>
        <div className="generator-field generator-category-label">
          <label>Category</label>
          <span>{getWords(category).length} words</span>
        </div>
        <div className="generator-categories">
          {categories.map(item => { const locked = item.premium && !premium; return <button type="button" key={item.id} className={`${category === item.id ? 'selected' : ''} ${locked ? 'premium-slot' : ''}`} aria-pressed={category === item.id} onClick={() => { setCategory(item.id); setGame(null); setPaywallReasons(null); }}>
            <Shuffle size={15} />
            <span>{item.short}</span>
            {locked && <small className="premium-tag"><LockKeyhole size={10} /> Premium</small>}
            {category === item.id && <Check size={12} />}
          </button>; })}
        </div>
        {error && <p role="alert" className="form-error">{error}</p>}
        {paywallReasons && <PremiumPaywallNotice reasons={paywallReasons} onUseFree={useFreeSetup} />}
        <button className="start-button generator-start" type="button" onClick={generate}><span><Fingerprint size={20} /> Generate roles</span><ArrowRight size={18} /></button>
        {/* Premium-only, same reasoning as the pass-and-play setup: the tags above plus the paywall
            at generate time do the selling. The "premium packs" card in particular could never
            convert a visitor — those packs aren't built, so it carries no checkout button at all —
            and this is the page that has to earn the "imposter game generator" ranking, so it was
            pushing the real explanatory content below two ad blocks. A paid viewer still sees both,
            since "what have I got, and what's still coming" is genuinely useful to them. */}
        {premium && <><UpgradeCard feature={premiumFeatures.find(feature => feature.id === 'more-players')} compact unlocked available /><UpgradeCard feature={premiumFeatures.find(feature => feature.id === 'premium-packs')} compact unlocked available /></>}
      </div>
    </div>
    <div className="generator-output" aria-live="polite">
      {game ? <>
        <div className="generator-secret">
          <span>{currentCategory.hint}</span>
          <strong>Secret word ready</strong>
          <p>Pass the screen around. Each player should open only their own card.</p>
        </div>
        <div className="generator-cards">
          {game.players.map((player, index) => {
            const isOpen = revealed === index;
            return <button className={`generator-card ${isOpen ? 'open' : ''} ${isOpen && player.isImposter ? 'imposter' : ''}`} type="button" key={`${player.name}-${index}`} onClick={() => setRevealed(isOpen ? null : index)} aria-pressed={isOpen}>
              <span>{player.name}</span>
              {isOpen ? <>
                {player.isImposter ? <Fingerprint size={35} strokeWidth={1.2} /> : <Feather size={31} strokeWidth={1.2} />}
                <strong>{player.isImposter ? 'The imposter' : game.word.text}</strong>
                <small>{player.isImposter ? 'Blend in. Guess the word if caught.' : 'Give a clue without saying the word.'}</small>
                <EyeOff size={15} />
              </> : <>
                <Eye size={34} strokeWidth={1.1} />
                <strong>Private card</strong>
                <small>Tap when this player is looking.</small>
              </>}
            </button>;
          })}
        </div>
        <div className="generator-actions">
          <button className="gold-button" type="button" onClick={generate}><RotateCcw size={17} /> Generate another</button>
          <Link className="outline-button" href="/online/">Play online <ArrowRight size={16} /></Link>
        </div>
      </> : <div className="generator-empty">
        <Eye size={52} strokeWidth={1} />
        <strong>Ready when your group is.</strong>
        <p>Choose a category, enter player names, and generate private cards for the table.</p>
      </div>}
    </div>
  </section>;
}
