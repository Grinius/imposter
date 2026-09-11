'use client';
import { useCallback, useState } from 'react';
import { ArrowRight, Check, EyeOff, Feather, Fingerprint, LockKeyhole, PenLine, RotateCcw, Undo2 } from 'lucide-react';
import { normalizeGuess, secureRandom } from '@/lib/game';
import { categories, type Category } from '@/lib/words';
import { createDrawingRound, drawingTransition, totalTurns, validateDrawingSettings, type DrawingAction, type DrawingRound, type DrawingSettings, type Point } from '@/lib/drawing-imposter';
import { freePlayerLimit, premiumPlayerLimit } from '@/lib/limits';
import { usePremiumStatus } from '@/lib/premium-client';
import PremiumPaywallNotice from '@/components/premium/paywall-notice';
import RevealStage from '@/components/reveal-stage';
import RecapButton from '@/components/recap-button';
import SketchPad from './sketch-pad';
import { Ballot, Handoff, PlayerNames, ResultBrand, ResultHeader, RoundChrome, VariantLinks, VoteResults, playerColors, useHeadingFocus, usePrivacyGuard } from './shared';

const steps = ['Secret word', 'Draw one line', 'Cast your vote', 'The reveal'];
export default function DrawingImposter() {
  const { premium } = usePremiumStatus();
  const maxPlayers = premium ? premiumPlayerLimit : freePlayerLimit;
  const [settings, setSettings] = useState<DrawingSettings>({ names: ['Alex', 'Jamie', 'Taylor', 'Morgan'], category: 'mixed', passes: 2 });
  const [round, setRound] = useState<DrawingRound | null>(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [error, setError] = useState('');
  const [paywallReasons, setPaywallReasons] = useState<string[] | null>(null);
  const [pending, setPending] = useState<Point[] | null>(null);
  const [guess, setGuess] = useState('');
  const [revealed, setRevealed] = useState(false);
  const heading = useHeadingFocus(round ? `${round.phase}-${round.cursor}-${round.turn}` : null);
  const act = useCallback((action: DrawingAction) => setRound(current => current ? drawingTransition(current, action) : null), []);
  usePrivacyGuard(!!round && round.phase !== 'result', useCallback(() => act({ type: 'privacy' }), [act]));

  function start(replay = false) {
    const chosen = categories.find(item => item.id === settings.category);
    const reasons = premium ? [] : [...(settings.names.length > freePlayerLimit ? [`${settings.names.length} players`] : []), ...(chosen?.premium ? [`${chosen.name} category`] : [])];
    if (reasons.length) { setPaywallReasons(reasons); setError(''); return; }
    const message = validateDrawingSettings(settings, { maxPlayers, premium }); if (message) { setError(message); return; }
    setPaywallReasons(null); setError(''); setGuess(''); setPending(null); setRevealed(false);
    setRound(createDrawingRound(settings, secureRandom, round?.word.id, { maxPlayers, premium })); setRoundNumber(replay ? roundNumber + 1 : 1);
    requestAnimationFrame(() => document.getElementById('drawing-imposter')?.scrollIntoView({ block: 'start' }));
  }

  if (!round) return <section className="variant-setup setup-panel" id="drawing-imposter" aria-labelledby="drawing-setup-title">
    <div className="panel-topline"><span><PenLine size={15} /> PASS & PLAY</span><span className="edition">DRAWING EDITION</span></div>
    <div className="panel-heading"><h2 id="drawing-setup-title">One drawing. One fake artist.</h2><p>Everyone adds a single line to the same picture. One of you has no idea what it’s meant to be.</p></div>
    <form onSubmit={event => { event.preventDefault(); start(); }}>
      <PlayerNames names={settings.names} premium={premium} onChange={names => { setSettings({ ...settings, names }); setError(''); setPaywallReasons(null); }} />
      <div className="field-heading category-heading"><label id="drawing-category-label"><span className="step-number">02</span> What are you drawing?</label></div>
      <div className="category-grid" role="group" aria-labelledby="drawing-category-label">{categories.map(item => { const locked = item.premium && !premium; return <button type="button" key={item.id} className={`category-button ${settings.category === item.id ? 'selected' : ''} ${locked ? 'premium-slot' : ''}`} aria-pressed={settings.category === item.id} onClick={() => { setSettings({ ...settings, category: item.id as Category }); setPaywallReasons(null); }}><span>{item.short}</span>{locked && <small className="premium-tag"><LockKeyhole size={10} /> Premium</small>}{settings.category === item.id && <Check size={11} className="category-check" />}</button>; })}</div>
      <div className="game-options"><label className="time-option"><PenLine size={16} /><span>Lines each</span><select aria-label="Lines per player" value={settings.passes} onChange={event => setSettings({ ...settings, passes: Number(event.target.value) as 1 | 2 })}><option value={1}>1 line</option><option value={2}>2 lines</option></select></label></div>
      <p className="hint-description">{settings.passes === 2 ? 'Two passes round the table. The second line is where imposters get caught.' : 'One pass: quick, brutal, and very hard for the imposter.'}</p>
      {error && <p role="alert" className="form-error">{error}</p>}
      {paywallReasons && <PremiumPaywallNotice reasons={paywallReasons} onUseFree={() => { setSettings({ ...settings, names: settings.names.slice(0, freePlayerLimit), category: categories.find(item => item.id === settings.category)?.premium ? 'mixed' : settings.category }); setPaywallReasons(null); }} />}
      <button className="start-button" type="submit"><span><PenLine size={21} /> Start drawing</span><ArrowRight size={20} /></button>
      <VariantLinks current="drawing" />
    </form>
  </section>;

  const step = ['handoff', 'reveal'].includes(round.phase) ? 1 : ['turn-handoff', 'drawing', 'discussion'].includes(round.phase) ? 2 : ['vote-handoff', 'voting'].includes(round.phase) ? 3 : 4;
  const name = round.names[round.cursor], isImposter = round.cursor === round.imposter;
  const legend = <div className="stroke-legend">{round.names.map((player, index) => <span key={index}><i style={{ background: playerColors[index % playerColors.length] }} />{player}</span>)}</div>;
  return <div id="drawing-imposter"><RoundChrome roundNumber={roundNumber} playerCount={round.names.length} steps={steps} step={step} onLeave={() => setRound(null)}>
    <div className="round-surface" key={`${round.phase}-${round.cursor}-${round.turn}`}>
      {round.phase === 'handoff' && <Handoff eyebrow={`SECRET CARD ${round.cursor + 1} OF ${round.names.length}`} name={name} subtitle="A little privacy, please. Your subject is waiting." label="Reveal my card" onOpen={() => act({ type: 'reveal' })} heading={heading} />}
      {round.phase === 'reveal' && <>
        <p className="eyebrow">FOR {name.toUpperCase()}’S EYES ONLY</p>
        <h2 ref={heading} tabIndex={-1}>{isImposter ? 'Keep your cool.' : 'You know what this is.'}</h2>
        <p className="round-subtitle">{isImposter ? 'Everyone else knows the subject. Watch their lines and improvise.' : 'Add a line that proves it without giving it away.'}</p>
        <div className={`secret-card card-front ${isImposter ? 'imposter-card' : ''}`}><span className="role-label">{isImposter ? 'YOUR ROLE' : 'YOU ARE DRAWING'}</span>{isImposter ? <Fingerprint className="role-icon" size={48} strokeWidth={1} /> : <Feather className="role-icon" size={36} strokeWidth={1} />}<strong className="secret-word">{isImposter ? 'The imposter' : round.word.text}</strong><div className="card-rule" /><p>{isImposter ? <>Category: <b>{categories.find(c => c.id === round.word.category)!.short}</b></> : 'One line per turn. Make it count.'}</p><span className="role-badge">{isImposter ? 'BLEND IN & STAY HIDDEN' : 'YOU ARE ONE OF THE ARTISTS'}</span></div>
        <button className="gold-button" onClick={() => act({ type: 'hide' })}><EyeOff size={18} /> Hide & {round.cursor + 1 === round.names.length ? 'start drawing' : 'pass the phone'}<ArrowRight size={17} /></button>
        <span className="private-note">Memorized it? Hide your card before passing.</span>
      </>}
      {round.phase === 'turn-handoff' && <>
        <p className="eyebrow">LINE {round.turn + 1} OF {totalTurns(round)}</p>
        <h2 ref={heading} tabIndex={-1}>Pass the phone to <em>{name}.</em></h2>
        <p className="round-subtitle">One continuous line. Lift your finger and the turn is over.</p>
        <SketchPad strokes={round.strokes} pending={null} active={false} onStrokeEnd={() => undefined} label={`The drawing so far, ${round.strokes.length} lines`} />
        {legend}
        <button className="gold-button" onClick={() => act({ type: 'take-turn' })}><PenLine size={18} /> {name} is ready to draw<ArrowRight size={17} /></button>
      </>}
      {round.phase === 'drawing' && <>
        <p className="eyebrow">{name.toUpperCase()}’S LINE · {round.turn + 1} OF {totalTurns(round)}</p>
        <h2 ref={heading} tabIndex={-1}>{pending ? <>Keep it, or <em>try again?</em></> : <>Draw <em>one line.</em></>}</h2>
        <p className="round-subtitle">{pending ? 'Everyone saw it. Redo once if your finger slipped.' : 'Prove you know the subject. Don’t hand it to the imposter.'}</p>
        <SketchPad strokes={round.strokes} pending={pending} active onStrokeEnd={setPending} label="Drawing surface: draw one continuous line with your finger or mouse" />
        {legend}
        {pending
          ? <div className="stroke-actions"><button className="gold-button" onClick={() => { act({ type: 'stroke', points: pending }); setPending(null); }}><Check size={18} /> Keep it & pass<ArrowRight size={17} /></button><button className="text-button" onClick={() => setPending(null)}><Undo2 size={15} /> Redo my line</button></div>
          : <span className="private-note">Drag anywhere on the canvas. Lifting your finger ends the line.</span>}
      </>}
      {round.phase === 'discussion' && <>
        <p className="eyebrow">THE DRAWING IS FINISHED</p>
        <h2 ref={heading} tabIndex={-1}>Whose line <em>didn’t belong?</em></h2>
        <p className="round-subtitle">Talk it through. Who added nothing, who copied, who drew a leg on a teapot?</p>
        <SketchPad strokes={round.strokes} pending={null} active={false} onStrokeEnd={() => undefined} label={`The finished drawing, ${round.strokes.length} lines`} />
        {legend}
        <button className="gold-button" onClick={() => act({ type: 'start-vote' })}><Fingerprint size={18} /> Ready to vote<ArrowRight size={17} /></button>
      </>}
      {round.phase === 'vote-handoff' && <Handoff eyebrow={`PRIVATE VOTE ${round.cursor + 1} OF ${round.names.length}`} name={name} subtitle="Your vote stays secret until everyone has voted." label="Open my ballot" onOpen={() => act({ type: 'open-ballot' })} heading={heading} />}
      {round.phase === 'voting' && <Ballot names={round.names} voter={round.cursor} onVote={target => act({ type: 'vote', target })} heading={heading} />}
      {round.phase === 'guess' && <>
        <p className="eyebrow">CAUGHT. BUT NOT QUITE FINISHED.</p><h2 ref={heading} tabIndex={-1}>One last chance, <em>{round.names[round.imposter]}.</em></h2><p className="round-subtitle">The table found you. Name the drawing to steal the win.</p>
        <SketchPad strokes={round.strokes} pending={null} active={false} onStrokeEnd={() => undefined} label="The finished drawing" />
        <form className="guess-form" onSubmit={event => { event.preventDefault(); act({ type: 'guess', word: guess }); }}><label htmlFor="drawing-guess">What were they drawing?</label><input id="drawing-guess" value={guess} onChange={event => setGuess(event.target.value)} placeholder="Your one and only guess…" maxLength={60} autoComplete="off" /><button className="gold-button" disabled={!normalizeGuess(guess)} type="submit">Make my final guess<ArrowRight size={17} /></button></form><button className="text-button" onClick={() => act({ type: 'skip-guess' })}>I’ve got nothing. Reveal the word.</button>
      </>}
      {round.phase === 'result' && round.winner && !revealed && <RevealStage names={round.names} imposter={round.imposter} secretLabel="THEY WERE DRAWING" secret={round.word.text} winner={round.winner} onDone={() => setRevealed(true)} />}
      {round.phase === 'result' && round.winner && revealed && <>
        <ResultHeader winner={round.winner} heading={heading} subtitle={round.reason === 'tie' ? 'A split vote. Just enough doubt to get away.' : round.reason === 'escaped' ? `${round.names[round.accused!]} took the blame. The real imposter slipped away.` : round.reason === 'guessed' ? 'Caught in the act, but they named the drawing and stole the win.' : 'You saw through the scribble. The secret stayed safe.'} />
        <div className="result-details"><div><span>THE IMPOSTER</span><strong>{round.names[round.imposter]}</strong></div><div><span>THE DRAWING</span><strong>{round.word.text}</strong></div></div>
        <ResultBrand />
        <RecapButton data={{ roleLabel: 'THE IMPOSTER WAS', imposter: round.names[round.imposter], secretLabel: 'THEY WERE DRAWING', secret: round.word.text, verdict: round.winner === 'friends' ? 'Caught. The friends win.' : round.reason === 'tie' ? 'A split vote. The imposter got away.' : round.reason === 'guessed' ? 'Caught, but named the drawing. The imposter wins.' : `${round.names[round.accused!]} took the blame. The imposter wins.`, rows: round.names.map((player, index) => ({ label: player, value: `${round.votes.filter(v => v === index).length} vote${round.votes.filter(v => v === index).length === 1 ? '' : 's'}`, highlight: index === round.imposter })) }} />
        <SketchPad strokes={round.strokes} pending={null} active={false} onStrokeEnd={() => undefined} label={`The finished drawing of ${round.word.text}`} />
        {legend}
        <VoteResults names={round.names} votes={round.votes} />
        <button className="gold-button" onClick={() => start(true)}><RotateCcw size={17} /> Another round<ArrowRight size={17} /></button><button className="text-button" onClick={() => setRound(null)}>Change players or category</button>
      </>}
    </div>
  </RoundChrome></div>;
}
