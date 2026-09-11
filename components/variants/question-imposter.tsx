'use client';
import { useCallback, useState } from 'react';
import { ArrowRight, EyeOff, Fingerprint, MessageCircleQuestion, RotateCcw } from 'lucide-react';
import { secureRandom } from '@/lib/game';
import { createQuestionRound, questionFor, questionTransition, validateQuestionSettings, type QuestionAction, type QuestionRound, type QuestionSettings } from '@/lib/question-imposter';
import { freePlayerLimit, premiumPlayerLimit } from '@/lib/limits';
import { usePremiumStatus } from '@/lib/premium-client';
import PremiumPaywallNotice from '@/components/premium/paywall-notice';
import { Avatar, Ballot, Handoff, PlayerNames, ResultBrand, ResultHeader, RoundChrome, VariantLinks, VoteResults, useHeadingFocus, usePrivacyGuard } from './shared';

const steps = ['Secret question', 'Answer out loud', 'Cast your vote', 'The reveal'];
export default function QuestionImposter() {
  const { premium } = usePremiumStatus();
  const maxPlayers = premium ? premiumPlayerLimit : freePlayerLimit;
  const [settings, setSettings] = useState<QuestionSettings>({ names: ['Alex', 'Jamie', 'Taylor', 'Morgan'] });
  const [round, setRound] = useState<QuestionRound | null>(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [error, setError] = useState('');
  const [paywall, setPaywall] = useState(false);
  const heading = useHeadingFocus(round ? `${round.phase}-${round.cursor}` : null);
  const act = useCallback((action: QuestionAction) => setRound(current => current ? questionTransition(current, action) : null), []);
  usePrivacyGuard(!!round && round.phase !== 'result', useCallback(() => act({ type: 'privacy' }), [act]));

  function start(replay = false) {
    if (!premium && settings.names.length > freePlayerLimit) { setPaywall(true); setError(''); return; }
    const message = validateQuestionSettings(settings, maxPlayers); if (message) { setError(message); return; }
    setPaywall(false); setError('');
    setRound(createQuestionRound(settings, secureRandom, round?.pair.id, maxPlayers)); setRoundNumber(replay ? roundNumber + 1 : 1);
    requestAnimationFrame(() => document.getElementById('question-imposter')?.scrollIntoView({ block: 'start' }));
  }

  if (!round) return <section className="variant-setup setup-panel" id="question-imposter" aria-labelledby="question-setup-title">
    <div className="panel-topline"><span><MessageCircleQuestion size={15} /> PASS & PLAY</span><span className="edition">QUESTION EDITION</span></div>
    <div className="panel-heading"><h2 id="question-setup-title">Same question for everyone. Nearly.</h2><p>One player gets a different question — and doesn’t know it. The answers give it away.</p></div>
    <form onSubmit={event => { event.preventDefault(); start(); }}>
      <PlayerNames names={settings.names} premium={premium} onChange={names => { setSettings({ names }); setError(''); setPaywall(false); }} />
      <p className="hint-description">No bluffing required. Answer honestly and listen for the answer that doesn’t fit.</p>
      {error && <p role="alert" className="form-error">{error}</p>}
      {paywall && <PremiumPaywallNotice reasons={[`${settings.names.length} players`]} onUseFree={() => { setSettings({ names: settings.names.slice(0, freePlayerLimit) }); setPaywall(false); }} />}
      <button className="start-button" type="submit"><span><MessageCircleQuestion size={21} /> Deal the questions</span><ArrowRight size={20} /></button>
      <VariantLinks current="question" />
    </form>
  </section>;

  const step = ['handoff', 'reveal'].includes(round.phase) ? 1 : round.phase === 'answers' ? 2 : ['vote-handoff', 'voting'].includes(round.phase) ? 3 : 4;
  const name = round.names[round.cursor];
  return <div id="question-imposter"><RoundChrome roundNumber={roundNumber} playerCount={round.names.length} steps={steps} step={step} onLeave={() => setRound(null)}>
    <div className="round-surface" key={`${round.phase}-${round.cursor}`}>
      {round.phase === 'handoff' && <Handoff eyebrow={`SECRET CARD ${round.cursor + 1} OF ${round.names.length}`} name={name} subtitle="A little privacy, please. Your question is waiting." label="Reveal my card" onOpen={() => act({ type: 'reveal' })} heading={heading} />}
      {round.phase === 'reveal' && <>
        <p className="eyebrow">FOR {name.toUpperCase()}’S EYES ONLY</p>
        <h2 ref={heading} tabIndex={-1}>Read it. Remember it.</h2>
        <p className="round-subtitle">Don’t read it out loud. You’ll answer it in a moment.</p>
        {/* Every card looks identical on purpose: nobody, including the odd one out, knows who has the different question. */}
        <div className="secret-card card-front question-card"><span className="role-label">YOUR QUESTION</span><MessageCircleQuestion className="role-icon" size={36} strokeWidth={1} /><strong className="secret-word secret-question">{questionFor(round, round.cursor)}</strong><div className="card-rule" /><p>Answer honestly. Keep it short.</p><span className="role-badge">ONE OF YOU HAS A DIFFERENT QUESTION</span></div>
        <button className="gold-button" onClick={() => act({ type: 'hide' })}><EyeOff size={18} /> Hide & {round.cursor + 1 === round.names.length ? 'start the round' : 'pass the phone'}<ArrowRight size={17} /></button>
        <span className="private-note">Got it? Hide your card before passing.</span>
      </>}
      {round.phase === 'answers' && <>
        <p className="eyebrow">ANSWER OUT LOUD, ONE AT A TIME</p>
        <h2 ref={heading} tabIndex={-1}>Whose answer <em>doesn’t fit?</em></h2>
        <p className="round-subtitle"><b>{round.names[round.firstAnswer]}</b> answers first. Go clockwise, then talk it through.<br />One of you answered a different question and doesn’t know it.</p>
        <div className="at-table">{round.names.map((player, index) => <div key={index}><Avatar name={player} index={index} /><span>{player}</span>{index === round.firstAnswer && <small>FIRST ANSWER</small>}</div>)}</div>
        <button className="gold-button" onClick={() => act({ type: 'start-vote' })}><Fingerprint size={18} /> Ready to vote<ArrowRight size={17} /></button><span className="private-note">Ask follow-ups. The odd one out will defend an answer that made sense to them.</span>
      </>}
      {round.phase === 'vote-handoff' && <Handoff eyebrow={`PRIVATE VOTE ${round.cursor + 1} OF ${round.names.length}`} name={name} subtitle="Your vote stays secret until everyone has voted." label="Open my ballot" onOpen={() => act({ type: 'open-ballot' })} heading={heading} />}
      {round.phase === 'voting' && <Ballot names={round.names} voter={round.cursor} onVote={target => act({ type: 'vote', target })} heading={heading} />}
      {round.phase === 'result' && round.winner && <>
        <ResultHeader winner={round.winner} heading={heading} subtitle={round.reason === 'tie' ? 'A split vote. The odd one out gets away with it.' : round.reason === 'escaped' ? `${round.names[round.accused!]} took the blame. The real odd one out slipped away.` : 'You spotted the answer that didn’t belong.'} />
        <div className="result-details question-result"><div><span>EVERYONE ELSE WAS ASKED</span><strong>{round.pair.friends}</strong></div><div><span>{round.names[round.imposter].toUpperCase()} WAS ASKED</span><strong>{round.pair.imposter}</strong></div></div>
        <ResultBrand />
        <VoteResults names={round.names} votes={round.votes} />
        <button className="gold-button" onClick={() => start(true)}><RotateCcw size={17} /> Another round<ArrowRight size={17} /></button><button className="text-button" onClick={() => setRound(null)}>Change players</button>
      </>}
    </div>
  </RoundChrome></div>;
}
