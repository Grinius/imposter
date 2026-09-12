'use client';
import { useCallback, useRef, useState } from 'react';
import { ArrowRight, Check, EyeOff, Fingerprint, Hourglass, Play, RotateCcw, Square, Timer } from 'lucide-react';
import { secureRandom } from '@/lib/game';
import { createTimerRound, formatTime, guessTolerance, timerRanges, timerTransition, validateTimerSettings, type TimerAction, type TimerRange, type TimerRound, type TimerSettings } from '@/lib/timer-imposter';
import { freePlayerLimit, premiumPlayerLimit } from '@/lib/limits';
import { usePremiumStatus } from '@/lib/premium-client';
import PremiumPaywallNotice from '@/components/premium/paywall-notice';
import RevealStage from '@/components/reveal-stage';
import RecapButton from '@/components/recap-button';
import { Avatar, Ballot, Handoff, PlayerNames, ResultBrand, ResultHeader, RoundChrome, VariantLinks, VoteResults, useHeadingFocus, usePrivacyGuard } from './shared';
import { useTrackRoundEnd } from '@/components/use-track-round';
import { track } from '@/lib/analytics';

const steps = ['Secret time', 'Run the clock', 'Cast your vote', 'The reveal'];
export default function TimerImposter() {
  const { premium } = usePremiumStatus();
  const maxPlayers = premium ? premiumPlayerLimit : freePlayerLimit;
  const [settings, setSettings] = useState<TimerSettings>({ names: ['Alex', 'Jamie', 'Taylor', 'Morgan'], range: 'short' });
  const [round, setRound] = useState<TimerRound | null>(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [error, setError] = useState('');
  const [paywall, setPaywall] = useState(false);
  const [guess, setGuess] = useState('');
  const [revealed, setRevealed] = useState(false);
  const startedAt = useRef(0);
  const heading = useHeadingFocus(round ? `${round.phase}-${round.cursor}` : null);
  const act = useCallback((action: TimerAction) => setRound(current => current ? timerTransition(current, action) : null), []);
  usePrivacyGuard(!!round && round.phase !== 'result', useCallback(() => act({ type: 'privacy' }), [act]));
  useTrackRoundEnd(round, 'timer', roundNumber);

  function start(replay = false) {
    if (!premium && settings.names.length > freePlayerLimit) { setPaywall(true); setError(''); return; }
    const message = validateTimerSettings(settings, maxPlayers); if (message) { setError(message); return; }
    setPaywall(false); setError(''); setGuess(''); setRevealed(false);
    setRound(createTimerRound(settings, secureRandom, maxPlayers)); setRoundNumber(replay ? roundNumber + 1 : 1); track({ name: 'round_start', mode: 'timer', pack: settings.range, players: settings.names.length });
    requestAnimationFrame(() => document.getElementById('timer-imposter')?.scrollIntoView({ block: 'start' }));
  }
  function stop() { act({ type: 'stop-timer', elapsed: Math.max(0, Math.round((performance.now() - startedAt.current) / 10)) }); }
  function submitGuess() { const seconds = Number(guess.replace(',', '.')); if (Number.isFinite(seconds) && seconds >= 0) act({ type: 'guess', time: Math.round(seconds * 100) }); }

  if (!round) return <section className="variant-setup setup-panel" id="timer-imposter" aria-labelledby="timer-setup-title">
    <div className="panel-topline"><span><Timer size={15} /> PASS & PLAY</span><span className="edition">TIMER EDITION</span></div>
    <div className="panel-heading"><h2 id="timer-setup-title">Everyone knows the time. Almost.</h2><p>One target. One player who never saw it. A stopwatch nobody can read.</p></div>
    <form onSubmit={event => { event.preventDefault(); start(); }}>
      <PlayerNames names={settings.names} premium={premium} onChange={names => { setSettings({ ...settings, names }); setError(''); setPaywall(false); }} />
      <div className="field-heading category-heading"><label id="range-label"><span className="step-number">02</span> How long is the target?</label></div>
      <div className="category-grid range-grid" role="group" aria-labelledby="range-label">{(Object.keys(timerRanges) as TimerRange[]).map(id => <button type="button" key={id} className={`category-button ${settings.range === id ? 'selected' : ''}`} aria-pressed={settings.range === id} onClick={() => setSettings({ ...settings, range: id })}><Hourglass size={19} strokeWidth={1.5} /><span>{timerRanges[id].label}</span>{settings.range === id && <Check size={11} className="category-check" />}</button>)}</div>
      <p className="hint-description">{timerRanges[settings.range].blurb}</p>
      {error && <p role="alert" className="form-error">{error}</p>}
      {paywall && <PremiumPaywallNotice reasons={[`${settings.names.length} players`]} onUseFree={() => { setSettings({ ...settings, names: settings.names.slice(0, freePlayerLimit) }); setPaywall(false); }} />}
      <button className="start-button" type="submit"><span><Timer size={21} /> Start the clock</span><ArrowRight size={20} /></button>
      <VariantLinks current="timer" />
    </form>
  </section>;

  const step = ['handoff', 'reveal'].includes(round.phase) ? 1 : ['turn-handoff', 'timing', 'running', 'discussion'].includes(round.phase) ? 2 : ['vote-handoff', 'voting'].includes(round.phase) ? 3 : 4;
  const name = round.names[round.cursor], isImposter = round.cursor === round.imposter;
  const remaining = round.times.filter(time => time === null).length;
  return <div id="timer-imposter"><RoundChrome roundNumber={roundNumber} playerCount={round.names.length} steps={steps} step={step} onLeave={() => setRound(null)}>
    <div className="round-surface" key={`${round.phase}-${round.cursor}`}>
      {round.phase === 'handoff' && <Handoff eyebrow={`SECRET CARD ${round.cursor + 1} OF ${round.names.length}`} name={name} subtitle="A little privacy, please. Your target is waiting." label="Reveal my card" onOpen={() => act({ type: 'reveal' })} heading={heading} />}
      {round.phase === 'reveal' && <>
        <p className="eyebrow">FOR {name.toUpperCase()}’S EYES ONLY</p>
        <h2 ref={heading} tabIndex={-1}>{isImposter ? 'Keep your cool.' : 'Remember this number.'}</h2>
        <p className="round-subtitle">{isImposter ? 'Everyone else knows the target. You will have to fake it by feel.' : 'Stop the clock as close to it as you can. Don’t say it out loud.'}</p>
        <div className={`secret-card card-front ${isImposter ? 'imposter-card' : ''}`}><span className="role-label">{isImposter ? 'YOUR ROLE' : 'YOUR TARGET TIME'}</span>{isImposter ? <Fingerprint className="role-icon" size={48} strokeWidth={1} /> : <Timer className="role-icon" size={36} strokeWidth={1} />}<strong className="secret-word">{isImposter ? 'The imposter' : formatTime(round.target)}</strong><div className="card-rule" /><p>{isImposter ? <>Somewhere between <b>{timerRanges[round.settings.range].label}</b>.</> : 'Run the clock blind. Land on it.'}</p><span className="role-badge">{isImposter ? 'BLEND IN & STAY HIDDEN' : 'YOU ARE ONE OF THE FRIENDS'}</span></div>
        <button className="gold-button" onClick={() => act({ type: 'hide' })}><EyeOff size={18} /> Hide & {round.cursor + 1 === round.names.length ? 'start the round' : 'pass the phone'}<ArrowRight size={17} /></button>
        <span className="private-note">Memorized it? Hide your card before passing.</span>
      </>}
      {round.phase === 'turn-handoff' && <>
        <p className="eyebrow">STOPWATCH {round.names.length - remaining + 1} OF {round.names.length}</p>
        <h2 ref={heading} tabIndex={-1}>Pass the phone to <em>{name}.</em></h2>
        <p className="round-subtitle">Put it in the middle where everyone can see the button — and nobody can see a number.</p>
        <div className="at-table">{round.names.map((player, index) => <div key={index}><Avatar name={player} index={index} /><span>{player}</span>{round.times[index] !== null && <small>DONE</small>}{index === round.cursor && <small>UP NOW</small>}</div>)}</div>
        <button className="gold-button" onClick={() => act({ type: 'take-turn' })}><Timer size={18} /> {name} is ready<ArrowRight size={17} /></button>
      </>}
      {(round.phase === 'timing' || round.phase === 'running') && <>
        <p className="eyebrow">{round.phase === 'timing' ? `${name.toUpperCase()}’S RUN` : 'NO PEEKING. THE CLOCK IS HIDDEN.'}</p>
        <h2 ref={heading} tabIndex={-1}>{round.phase === 'timing' ? <>Tap start, then stop on <em>the target.</em></> : <>Running<em>…</em></>}</h2>
        <p className="round-subtitle">{round.phase === 'timing' ? 'Nobody sees the number. Not even you.' : 'Count in your head. Stop when it feels right.'}</p>
        {round.phase === 'timing'
          ? <button className="stopwatch-button" onClick={() => { startedAt.current = performance.now(); act({ type: 'begin-timer' }); }}><Play size={34} strokeWidth={1.5} /><span>START</span></button>
          : <button className="stopwatch-button stopwatch-running" onClick={stop}><Square size={30} strokeWidth={1.5} /><span>STOP</span></button>}
        <span className="private-note">The time is recorded silently and revealed at the end.</span>
      </>}
      {round.phase === 'discussion' && <>
        <p className="eyebrow">EVERYONE HAS RUN THE CLOCK</p>
        <h2 ref={heading} tabIndex={-1}>Who was <em>guessing?</em></h2>
        <p className="round-subtitle">Talk it through. Who stopped way too early, who hesitated, who looked at the others before pressing?</p>
        <div className="at-table">{round.names.map((player, index) => <div key={index}><Avatar name={player} index={index} /><span>{player}</span><small>RECORDED</small></div>)}</div>
        <button className="gold-button" onClick={() => act({ type: 'start-vote' })}><Fingerprint size={18} /> Ready to vote<ArrowRight size={17} /></button><span className="private-note">All times stay hidden until after the vote.</span>
      </>}
      {round.phase === 'vote-handoff' && <Handoff eyebrow={`PRIVATE VOTE ${round.cursor + 1} OF ${round.names.length}`} name={name} subtitle="Your vote stays secret until everyone has voted." label="Open my ballot" onOpen={() => act({ type: 'open-ballot' })} heading={heading} />}
      {round.phase === 'voting' && <Ballot names={round.names} voter={round.cursor} onVote={target => act({ type: 'vote', target })} heading={heading} />}
      {round.phase === 'guess' && <>
        <p className="eyebrow">CAUGHT. BUT NOT QUITE FINISHED.</p><h2 ref={heading} tabIndex={-1}>One last chance, <em>{round.names[round.imposter]}.</em></h2><p className="round-subtitle">Guess the target within {formatTime(guessTolerance(round.target))} to steal the win.</p>
        <div className="guess-emblem"><Timer size={65} strokeWidth={1} /></div>
        <form className="guess-form" onSubmit={event => { event.preventDefault(); submitGuess(); }}><label htmlFor="time-guess">What was the target, in seconds?</label><input id="time-guess" inputMode="decimal" value={guess} onChange={event => setGuess(event.target.value)} placeholder="e.g. 7.4" maxLength={8} autoComplete="off" /><button className="gold-button" disabled={!Number.isFinite(Number(guess.replace(',', '.'))) || !guess.trim()} type="submit">Make my final guess<ArrowRight size={17} /></button></form><button className="text-button" onClick={() => act({ type: 'skip-guess' })}>I’ve got nothing. Reveal the times.</button>
      </>}
      {round.phase === 'result' && round.winner && !revealed && <RevealStage mode="timer" names={round.names} imposter={round.imposter} secretLabel="THE TARGET TIME" secret={formatTime(round.target)} winner={round.winner} onDone={() => setRevealed(true)} />}
      {round.phase === 'result' && round.winner && revealed && <>
        <ResultHeader winner={round.winner} heading={heading} subtitle={round.reason === 'tie' ? 'A split vote. Just enough doubt to get away.' : round.reason === 'escaped' ? `${round.names[round.accused!]} took the blame. The real imposter slipped away.` : round.reason === 'guessed' ? 'Caught in the act, but a lucky guess at the target saved the day.' : 'You saw through the bluff. Nice ears.'} />
        <div className="result-details"><div><span>THE IMPOSTER</span><strong>{round.names[round.imposter]}</strong></div><div><span>THE TARGET</span><strong>{formatTime(round.target)}</strong></div></div>
        <ResultBrand />
        <RecapButton mode="timer" data={{ roleLabel: 'THE IMPOSTER WAS', imposter: round.names[round.imposter], secretLabel: 'THE TARGET TIME', secret: formatTime(round.target), verdict: round.winner === 'friends' ? 'Caught. The friends win.' : round.reason === 'tie' ? 'A split vote. The imposter got away.' : round.reason === 'guessed' ? 'Caught, but guessed the target. The imposter wins.' : `${round.names[round.accused!]} took the blame. The imposter wins.`, rowsTitle: 'HOW CLOSE EVERYONE GOT', rows: round.names.map((player, index) => ({ label: player, value: formatTime(round.times[index] ?? 0), highlight: index === round.imposter })) }} />
        <div className="vote-results times-list"><span className="votes-label">HOW CLOSE EVERYONE GOT</span>{round.names.map((player, index) => { const time = round.times[index] ?? 0, delta = time - round.target; return <div className="vote-result" key={index}><span>{player}{index === round.imposter && ' ✦'}</span><b>{formatTime(time)}</b><small>{delta === 0 ? 'exact' : `${delta > 0 ? '+' : '−'}${formatTime(Math.abs(delta))}`}</small></div>; })}</div>
        <VoteResults names={round.names} votes={round.votes} />
        <button className="gold-button" onClick={() => start(true)}><RotateCcw size={17} /> Another round<ArrowRight size={17} /></button><button className="text-button" onClick={() => setRound(null)}>Change players or range</button>
      </>}
    </div>
  </RoundChrome></div>;
}
