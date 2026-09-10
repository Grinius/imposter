'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronDown, CircleHelp, Clock3, Eye, EyeOff, Feather, Fingerprint, Gem, Heart, LockKeyhole, MapPin, Pause, PawPrint, Play, Plus, RotateCcw, ShieldCheck, Shuffle, Smartphone, Sparkles, Utensils, Users, Volume2, VolumeX, Vote, Wifi, X } from 'lucide-react';
import { categories, type Category } from '@/lib/words';
import { createRound, normalizeGuess, secureRandom, transition, validateSettings, type Action, type Round, type Settings } from '@/lib/game';
import UpgradeCard from '@/components/premium/upgrade-card';
import { freePlayerLimit, minPlayerLimit, premiumPlayerLimit } from '@/lib/limits';
import { premiumFeatures } from '@/lib/premium';
import { usePremiumStatus } from '@/lib/premium-client';

const categoryIcons = { mixed: Shuffle, food: Utensils, animals: PawPrint, places: MapPin, objects: Gem, activities: Sparkles };
const playerColors = ['#b77d5c', '#65847c', '#a09564', '#82758f', '#6886a0', '#aa6c78', '#8a9862', '#b58b56', '#729594', '#997c66', '#827e9e', '#809164'];
function Avatar({ index, name, large = false }: { index: number; name: string; large?: boolean }) {
  return <span className={`avatar ${large ? 'avatar-large' : ''}`} style={{ '--avatar-color': playerColors[index % playerColors.length] } as CSSProperties} aria-hidden="true">{name.trim().slice(0, 1).toUpperCase() || '?'}</span>;
}
function Emblem({ small = false }: { small?: boolean }) { return <span className={`emblem ${small ? 'emblem-small' : ''}`} aria-hidden="true"><Eye strokeWidth={1.25} /></span>; }
function HandoffButton({ ballot, onOpen }: { ballot: boolean; onOpen: () => void }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setReady(true), 650); return () => clearTimeout(timer); }, []);
  return <button className="gold-button" disabled={!ready} onClick={event => { if (event.detail < 2) onOpen(); }}><Eye size={18} />{ballot ? 'Open my ballot' : 'Reveal my card'}<ArrowRight size={17} /></button>;
}
function Rules() {
  return <div className="rule-list">
    <div><span>01</span><section><h3>A secret for almost everyone.</h3><p>Pass the phone. Everyone sees the same word, except one player: the imposter.</p></section></div>
    <div><span>02</span><section><h3>Say a little. Listen a lot.</h3><p>Take turns giving a one-word clue. Prove you know the word without making it too obvious.</p></section></div>
    <div><span>03</span><section><h3>Someone doesn’t belong.</h3><p>Discuss, then pass the phone for a private vote. You can’t vote for yourself. The player with the most votes is accused; a tie lets the imposter escape.</p></section></div>
    <div><span>04</span><section><h3>One last chance to bluff.</h3><p>If you catch the imposter, they get one guess at the secret word. A correct guess steals the win. Otherwise, the friends win.</p></section></div>
  </div>;
}

export default function Game() {
  const { premium } = usePremiumStatus();
  const maxPlayers = premium ? premiumPlayerLimit : freePlayerLimit;
  const [settings, setSettings] = useState<Settings>({ names: ['Alex', 'Jamie', 'Taylor', 'Morgan'], category: 'mixed', minutes: 3, hints: true });
  const [round, setRound] = useState<Round | null>(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [error, setError] = useState('');
  const [rulesOpen, setRulesOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [sound, setSound] = useState(false);
  const [seconds, setSeconds] = useState(180);
  const [running, setRunning] = useState(false);
  const [selectedVote, setSelectedVote] = useState<number | null>(null);
  const [guess, setGuess] = useState('');
  const rulesDialog = useRef<HTMLDialogElement>(null);
  const exitDialog = useRef<HTMLDialogElement>(null);
  const phaseHeading = useRef<HTMLHeadingElement>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const deadline = useRef(0);
  const previousPhase = useRef<string | null>(null);

  function chime() {
    if (!sound) return;
    try {
      const context = audioContext.current ?? new AudioContext(); audioContext.current = context;
      void context.resume();
      const oscillator = context.createOscillator(), gain = context.createGain();
      oscillator.connect(gain); gain.connect(context.destination);
      oscillator.frequency.setValueAtTime(660, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(440, context.currentTime + .15);
      gain.gain.setValueAtTime(.035, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .22);
      oscillator.start(); oscillator.stop(context.currentTime + .23);
    } catch { /* Sound is optional; gameplay remains available. */ }
  }
  function act(action: Action) { setRound(current => current ? transition(current, action) : null); chime(); }
  function start(replay = false) {
    const message = validateSettings(settings, maxPlayers); if (message) { setError(message); return; }
    setError(''); setGuess(''); setSelectedVote(null); setRunning(false); setSeconds(settings.minutes * 60);
    setRound(createRound(settings, secureRandom, round?.word.id, maxPlayers));
    setRoundNumber(replay ? roundNumber + 1 : 1); requestAnimationFrame(() => document.getElementById('game')?.scrollIntoView({ block: 'start' })); chime();
  }
  function stopRound() { setRound(null); setExitOpen(false); setRunning(false); setSelectedVote(null); setGuess(''); }
  function toggleTimer() {
    if (!running && seconds > 0) deadline.current = Date.now() + seconds * 1000;
    setRunning(!running && seconds > 0);
  }
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setSeconds(remaining); if (!remaining) setRunning(false);
    }, 250);
    return () => clearInterval(interval);
  }, [running]);
  useEffect(() => {
    const protect = () => { setRound(current => current ? transition(current, { type: 'privacy' }) : null); };
    const hidden = () => { if (document.hidden) protect(); };
    window.addEventListener('blur', protect); document.addEventListener('visibilitychange', hidden);
    return () => { window.removeEventListener('blur', protect); document.removeEventListener('visibilitychange', hidden); };
  }, []);
  useEffect(() => {
    if (!round || round.phase === 'result') return;
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [round]);
  useEffect(() => {
    const phaseKey = round ? `${round.phase}-${round.cursor}` : null;
    if (previousPhase.current !== phaseKey) phaseHeading.current?.focus({ preventScroll: true });
    previousPhase.current = phaseKey;
  }, [round]);
  useEffect(() => { if (rulesOpen) rulesDialog.current?.showModal(); else rulesDialog.current?.close(); }, [rulesOpen]);
  useEffect(() => { if (exitOpen) exitDialog.current?.showModal(); else exitDialog.current?.close(); }, [exitOpen]);

  const isSetup = !round;
  const category = categories.find(category => category.id === settings.category)!;
  const phaseNumber = !round ? 0 : ['handoff', 'reveal'].includes(round.phase) ? 1 : round.phase === 'discussion' ? 2 : ['vote-handoff', 'voting'].includes(round.phase) ? 3 : 4;
  const isImposter = round?.imposter === round?.cursor;

  return <>
    <a className="skip-link" href="#game">Skip to game</a>
    <header className="site-header">
      <Link className="brand" href="/" onClick={event => { if (round) { event.preventDefault(); setExitOpen(true); } }} aria-label="Imposter home"><Emblem small /><span>imposter<span className="brand-dot">.</span></span></Link>
      <span className="header-note">GOOD COMPANY. QUESTIONABLE ALIBIS.</span>
      <nav aria-label="Main navigation"><button className="nav-link" onClick={() => { act({ type: 'privacy' }); setRulesOpen(true); }}><CircleHelp size={17} /><span>How to play</span></button><span className="nav-divider" /><button className="icon-button" aria-label={sound ? 'Mute sound' : 'Enable sound'} aria-pressed={sound} onClick={() => setSound(!sound)}>{sound ? <Volume2 size={19} /> : <VolumeX size={19} />}</button></nav>
    </header>
    <main id="game">
      {isSetup ? <div className="setup-layout">
        <section className="intro">
          <div className="eyebrow"><span className="live-dot" /> THE SECRET-WORD PARTY GAME</div>
          <h1>Trust your friends.<br /><em>Question everything.</em></h1>
          <p className="intro-copy">One secret word. One convincing liar.<br />A table full of people you thought you knew.</p>
          <div className="scene" role="img" aria-label="An illustrated group of mysterious suspects gathered around a green card table"><Image src="/art/detective-club.webp" alt="" width="1536" height="1024" loading="eager" fetchPriority="high" /><div className="scene-shade" /><span className="scene-label"><Eye size={15} /> THERE’S AN IMPOSTER AMONG US.</span></div>
          <div className="intro-facts"><span><Users size={16} /> 3–5 free players</span><span><Clock3 size={16} /> 5-minute rounds</span><span><Smartphone size={16} /> Just one phone</span></div>
        </section>
        <section className="setup-panel" aria-labelledby="setup-title">
          <div className="panel-topline"><span><Smartphone size={15} /> PASS & PLAY</span><span className="edition">THE ORIGINAL EDITION</span></div>
          <div className="panel-heading"><h2 id="setup-title">Gather your suspects.</h2><p>No sign-ups. No downloads. Just a good poker face.</p></div>
          <form onSubmit={event => { event.preventDefault(); start(); }}>
            <div className="field-heading"><label id="players-label"><span className="step-number">01</span> Who’s at the table?</label><span className="count-label">{settings.names.length} / {maxPlayers} players</span></div>
            <div className="player-inputs" role="group" aria-labelledby="players-label">{settings.names.map((name, index) => <div className="player-input" key={index}><Avatar index={index} name={name} /><input aria-label={`Player ${index + 1} name`} value={name} maxLength={20} autoComplete="off" onChange={event => { setSettings({ ...settings, names: settings.names.map((value, i) => i === index ? event.target.value : value) }); setError(''); }} /><button type="button" aria-label={`Remove player ${index + 1}`} disabled={settings.names.length <= minPlayerLimit} onClick={() => setSettings({ ...settings, names: settings.names.filter((_, i) => i !== index) })}><X size={14} /></button></div>)}</div>
            <button className="add-player" type="button" disabled={settings.names.length >= maxPlayers} onClick={() => { let number = settings.names.length + 1; while (settings.names.includes(`Player ${number}`)) number++; setSettings({ ...settings, names: [...settings.names, `Player ${number}`] }); }}><Plus size={15} /> Add a player</button>
            <div className="field-heading category-heading"><label id="category-label"><span className="step-number">02</span> Choose your secret category.</label></div>
            <div className="category-grid" role="group" aria-labelledby="category-label">{categories.map(item => { const Icon = categoryIcons[item.id]; return <button type="button" className={`category-button ${settings.category === item.id ? 'selected' : ''}`} key={item.id} aria-pressed={settings.category === item.id} onClick={() => setSettings({ ...settings, category: item.id as Category })}><Icon size={19} strokeWidth={1.5} /><span>{item.short}</span>{settings.category === item.id && <Check size={11} className="category-check" />}</button>; })}</div>
            <div className="game-options"><label className="time-option"><Clock3 size={16} /><span>Discussion</span><select aria-label="Discussion duration" value={settings.minutes} onChange={event => setSettings({ ...settings, minutes: Number(event.target.value) })}><option value={2}>2 min</option><option value={3}>3 min</option><option value={5}>5 min</option></select><ChevronDown size={12} /></label><label className="hint-option"><span>Imposter hint</span><input type="checkbox" checked={settings.hints} onChange={event => setSettings({ ...settings, hints: event.target.checked })} /><span className="switch" aria-hidden="true" /></label></div>
            <p className="hint-description">{settings.hints ? 'The imposter gets a category hint. A little help with the bluff.' : 'No hint for the imposter. Let your poker face do the work.'}</p>
            {error && <p role="alert" className="form-error">{error}</p>}
            <button className="start-button" type="submit"><span><Fingerprint size={21} /> Let the bluffing begin</span><ArrowRight size={20} /></button>
            <div className="setup-links"><a className="online-link" href="/online/"><Wifi size={16} /> Play online with friends <ArrowRight size={15} /></a><a className="online-link" href="/imposter-game-generator/"><Shuffle size={16} /> Open game generator <ArrowRight size={15} /></a><a className="online-link" href="/premium/"><Gem size={16} /> Premium packs <ArrowRight size={15} /></a><a className="online-link" href="/imposter-game-rules/"><CircleHelp size={16} /> Read rules <ArrowRight size={15} /></a></div><UpgradeCard feature={premiumFeatures.find(feature => feature.id === 'more-players')} compact unlocked={premium} available />
            <div className="setup-footnote"><LockKeyhole size={12} /> Secret roles. Real friends. Absolutely no accounts.</div>
          </form>
        </section>
      </div> : <section className="round-layout">
        <div className="round-top"><button className="text-button" onClick={() => { act({ type: 'privacy' }); setExitOpen(true); }}><ArrowLeft size={15} /> Leave game</button><span>ROUND {String(roundNumber).padStart(2, '0')}</span><span className="round-player-count"><Users size={14} /> {round.names.length} suspects</span></div>
        <div className="phase-track" aria-label={`Step ${phaseNumber} of 4`}>{['Secret roles', 'Give clues', 'Cast your vote', 'The reveal'].map((title, index) => <div className={phaseNumber === index + 1 ? 'current' : phaseNumber > index + 1 ? 'complete' : ''} key={title}><span>{phaseNumber > index + 1 ? <Check size={12} /> : `0${index + 1}`}</span><span>{title}</span></div>)}</div>
        <div className="round-surface" key={`${round.phase}-${round.cursor}`}>
          {(round.phase === 'handoff' || round.phase === 'vote-handoff') && <>
            <p className="eyebrow">{round.phase === 'handoff' ? `SECRET CARD ${round.cursor + 1} OF ${round.names.length}` : `PRIVATE VOTE ${round.cursor + 1} OF ${round.names.length}`}</p>
            <h2 ref={phaseHeading} tabIndex={-1}>Pass the phone to <em>{round.names[round.cursor]}.</em></h2>
            <p className="round-subtitle">{round.phase === 'handoff' ? 'A little privacy, please. Your secret is waiting.' : 'Your vote stays secret until everyone has voted.'}</p>
            <div className="secret-card card-back"><div className="card-corner">I<span>✦</span></div><Emblem /><span className="card-back-title">TRUST NO ONE</span><span className="card-back-subtitle">THE IMPOSTER SOCIETY</span><div className="card-corner bottom">I<span>✦</span></div></div>
            <HandoffButton ballot={round.phase === 'vote-handoff'} onOpen={() => act({ type: round.phase === 'handoff' ? 'reveal' : 'open-ballot' })} />
            <span className="private-note"><LockKeyhole size={13} /> Only {round.names[round.cursor]} should look at this screen.</span>
          </>}
          {round.phase === 'reveal' && <>
            <p className="eyebrow">FOR {round.names[round.cursor].toUpperCase()}’S EYES ONLY</p>
            <h2 ref={phaseHeading} tabIndex={-1}>{isImposter ? 'Keep your cool.' : 'You’re in on the secret.'}</h2>
            <p className="round-subtitle">{isImposter ? 'They know the word. You’ll have to read the room.' : 'Remember your word. Don’t say it out loud.'}</p>
            <div className={`secret-card card-front ${isImposter ? 'imposter-card' : ''}`}><span className="role-label">{isImposter ? 'YOUR ROLE' : 'YOUR SECRET WORD'}</span>{isImposter ? <Fingerprint className="role-icon" size={48} strokeWidth={1} /> : <Feather className="role-icon" size={36} strokeWidth={1} />}<strong className="secret-word">{isImposter ? 'The imposter' : round.word.text}</strong><div className="card-rule" /><p>{isImposter ? (round.settings.hints ? <>Your hint: <b>{categories.find(c => c.id === round.word.category)!.short}</b></> : 'No hint. Just your instincts.') : 'Give a clue. Find the bluff.'}</p><span className="role-badge">{isImposter ? 'BLEND IN & STAY HIDDEN' : 'YOU ARE ONE OF THE FRIENDS'}</span></div>
            <button className="gold-button" onClick={() => act({ type: 'hide' })}><EyeOff size={18} /> Hide & {round.cursor + 1 === round.names.length ? 'start the round' : 'pass the phone'}<ArrowRight size={17} /></button>
            <span className="private-note">Memorized it? Hide your card before passing.</span>
          </>}
          {round.phase === 'discussion' && <>
            <p className="eyebrow">THE ART OF SAYING ALMOST NOTHING</p>
            <h2 ref={phaseHeading} tabIndex={-1}>Make every word <em>count.</em></h2>
            <p className="round-subtitle"><b>{round.names[round.firstClue]}</b> gives the first one-word clue. Go clockwise.<br />Listen closely. Someone is making it up.</p>
            <div className={`timer-face ${seconds === 0 ? 'timer-finished' : ''}`}><span className="timer-caption">{seconds === 0 ? 'TIME TO MAKE YOUR CASE' : running ? 'THE CLOCK IS TICKING' : 'TAKE A BREATH'}</span><span className="timer-digits" role="timer" aria-label={`${Math.floor(seconds / 60)} minutes ${seconds % 60} seconds remaining`}>{Math.floor(seconds / 60)}<i>:</i>{String(seconds % 60).padStart(2, '0')}</span><button className="timer-control" disabled={seconds === 0} onClick={toggleTimer}>{running ? <Pause size={14} /> : <Play size={14} />}{seconds === 0 ? 'Discussion finished' : running ? 'Pause timer' : seconds === settings.minutes * 60 ? 'Start discussion' : 'Resume timer'}</button></div>
            <div className="at-table">{round.names.map((name, index) => <div key={index}><Avatar name={name} index={index} /><span>{name}</span>{index === round.firstClue && <small>FIRST CLUE</small>}</div>)}</div>
            <button className="gold-button" onClick={() => { setRunning(false); act({ type: 'start-vote' }); }}><Vote size={18} /> Ready to vote<ArrowRight size={17} /></button><span className="private-note">Take a few clue rounds, then talk through your suspicions.</span>
          </>}
          {round.phase === 'voting' && <>
            <p className="eyebrow">{round.names[round.cursor].toUpperCase()}’S PRIVATE BALLOT</p>
            <h2 ref={phaseHeading} tabIndex={-1}>Who’s <em>bluffing?</em></h2><p className="round-subtitle">Choose the person you suspect. You can’t vote for yourself.</p>
            <div className="ballot-grid">{round.names.map((name, index) => index !== round.cursor && <button className={`ballot-option ${selectedVote === index ? 'chosen' : ''}`} key={index} aria-pressed={selectedVote === index} onClick={() => setSelectedVote(index)}><Avatar name={name} index={index} /><span>{name}</span><span className="ballot-check">{selectedVote === index && <Check size={14} />}</span></button>)}</div>
            <button className="gold-button" disabled={selectedVote === null} onClick={() => { if (selectedVote !== null) { act({ type: 'vote', target: selectedVote }); setSelectedVote(null); } }}><LockKeyhole size={17} /> Lock in my vote<ArrowRight size={17} /></button><span className="private-note">Once locked in, your vote can’t be changed.</span>
          </>}
          {round.phase === 'guess' && <>
            <p className="eyebrow">CAUGHT. BUT NOT QUITE FINISHED.</p><h2 ref={phaseHeading} tabIndex={-1}>One last chance, <em>{round.names[round.imposter]}.</em></h2><p className="round-subtitle">The table found you. Guess the secret word to steal the win.</p>
            <div className="guess-emblem"><Fingerprint size={65} strokeWidth={1} /></div>
            <form className="guess-form" onSubmit={event => { event.preventDefault(); act({ type: 'guess', word: guess }); }}><label htmlFor="final-guess">What was the secret word?</label><input id="final-guess" value={guess} onChange={event => setGuess(event.target.value)} placeholder="Your one and only guess…" maxLength={60} autoComplete="off" /><button className="gold-button" disabled={!normalizeGuess(guess)} type="submit">Make my final guess<ArrowRight size={17} /></button></form><button className="text-button" onClick={() => act({ type: 'skip-guess' })}>I’ve got nothing. Reveal the word.</button>
          </>}
          {round.phase === 'result' && <>
            <p className="eyebrow">{round.winner === 'friends' ? 'A VERY GOOD PIECE OF DETECTIVE WORK' : 'A LITTLE TOO GOOD AT LYING'}</p><div className="result-emblem">{round.winner === 'friends' ? <ShieldCheck size={50} strokeWidth={1} /> : <Fingerprint size={50} strokeWidth={1} />}</div>
            <h2 ref={phaseHeading} tabIndex={-1}>{round.winner === 'friends' ? <>The friends <em>win.</em></> : <>The imposter <em>wins.</em></>}</h2><p className="round-subtitle">{round.reason === 'tie' ? 'A split vote. Just enough doubt to get away.' : round.reason === 'escaped' ? `${round.names[round.accused!]} took the blame. The real imposter slipped away.` : round.reason === 'guessed' ? 'Caught in the act, but the secret word saved the day.' : 'You saw through the bluff. The secret stayed safe.'}</p>
            <div className="result-details"><div><span>THE IMPOSTER</span><strong>{round.names[round.imposter]}</strong></div><div><span>THE SECRET WORD</span><strong>{round.word.text}</strong></div></div>
            <div className="vote-results"><span className="votes-label">HOW THE TABLE VOTED</span>{round.names.map((name, index) => <div className="vote-result" key={index}><span>{name}</span><span className="vote-bar"><i style={{ width: `${round.votes.filter(v => v === index).length / round.names.length * 100}%` }} /></span><b>{round.votes.filter(v => v === index).length}</b></div>)}</div>
            <button className="gold-button" onClick={() => start(true)}><RotateCcw size={17} /> Another round<ArrowRight size={17} /></button><button className="text-button" onClick={stopRound}>Change players or category</button>
          </>}
        </div>
        <div className="round-bottom"><span><LockKeyhole size={13} /> One phone. All together.</span><span>{category.short} <span className="tiny-star">✦</span> One imposter</span></div>
      </section>}
      {isSetup && <section className="how-section" id="how-to-play"><div className="how-heading"><span className="eyebrow">A MINUTE TO LEARN. ALL NIGHT TO ARGUE.</span><h2>Good friends. <em>Great liars.</em></h2><p>The imposter word game, also spelled “impostor,” is a social deduction game for 3–5 free players. Gather around one phone and find out who can keep a straight face.</p></div><div className="quick-rules"><article><span className="rule-icon"><Eye size={24} strokeWidth={1.3} /></span><span className="quick-step">01 / THE SECRET</span><h3>Know your role.</h3><p>Everyone gets a secret word. One of you gets a very different assignment.</p></article><article><span className="rule-icon"><Feather size={24} strokeWidth={1.3} /></span><span className="quick-step">02 / THE BLUFF</span><h3>Keep them guessing.</h3><p>Give a one-word clue. Be convincing, but don’t give the whole game away.</p></article><article><span className="rule-icon"><Fingerprint size={24} strokeWidth={1.3} /></span><span className="quick-step">03 / THE REVEAL</span><h3>Trust your instinct.</h3><p>Talk it out, cast your votes, and see who was hiding in plain sight.</p></article></div><button className="text-button full-rules" onClick={() => setRulesOpen(true)}>Read the full rules <ArrowRight size={15} /></button></section>}
    </main>
    <footer className="site-footer"><span className="footer-brand"><Eye size={18} strokeWidth={1.3} /> imposter.</span><span>A little mystery brings people together.</span><span>Made for a good night in <Heart size={12} /></span></footer>
    <dialog className="modal" ref={rulesDialog} aria-labelledby="rules-title" onCancel={() => setRulesOpen(false)} onClick={event => { if (event.target === event.currentTarget) setRulesOpen(false); }}><div className="modal-inner"><button className="modal-close" aria-label="Close rules" onClick={() => setRulesOpen(false)}><X size={20} /></button><span className="eyebrow">THE HOUSE RULES</span><h2 id="rules-title">A good bluff goes a long way.</h2><Rules /><p className="rules-tip"><Sparkles size={17} /> First time? Turn on imposter hints and choose Food & drink.</p><button className="start-button" onClick={() => setRulesOpen(false)}>Got it. Let’s play.<ArrowRight size={18} /></button></div></dialog>
    <dialog className="modal exit-modal" ref={exitDialog} aria-labelledby="exit-title" onCancel={() => setExitOpen(false)}><div className="modal-inner"><span className="eyebrow">LEAVING SO SOON?</span><h2 id="exit-title">End this round?</h2><p>Your current round will be lost. Your players and settings will stay.</p><button className="start-button" onClick={stopRound}>End round & return to setup<ArrowRight size={17} /></button><button className="text-button" onClick={() => setExitOpen(false)}>Keep playing</button></div></dialog>
  </>;
}
