'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Eye, Fingerprint, Video } from 'lucide-react';
import { siteHost } from '@/components/brand';

// The one screen that gets turned toward the table — or a camera. It shows nothing until the host
// taps, then runs a slowing roulette over the names, lands on the imposter, and follows with the
// secret. Full-bleed, portrait-composed, the domain in the corner throughout, and every step is a
// tap so a phone held up to a camera never moves on by itself. Reduced motion skips the roulette.
export interface RevealProps {
  names: string[]; imposter: number; roleLabel?: string; secretLabel: string; secret: string;
  winner: 'friends' | 'imposter'; onDone: () => void;
}
const ticks = [70, 70, 80, 90, 100, 115, 135, 160, 190, 230, 280, 340, 420, 520];
export default function RevealStage({ names, imposter, roleLabel = 'THE IMPOSTER WAS', secretLabel, secret, winner, onDone }: RevealProps) {
  const [stage, setStage] = useState<'armed' | 'spinning' | 'landed' | 'secret'>('armed');
  const [shown, setShown] = useState(imposter);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  function reveal() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || names.length < 2) { setStage('landed'); timers.current.push(window.setTimeout(() => setStage('secret'), 900)); return; }
    setStage('spinning');
    // Walk the names so the final tick lands on the imposter, whatever the sequence length.
    let at = 0, index = (imposter - ticks.length + names.length * ticks.length) % names.length;
    const step = () => {
      index = (index + 1) % names.length; setShown(index);
      at += 1;
      if (at < ticks.length) timers.current.push(window.setTimeout(step, ticks[at]));
      else { setShown(imposter); setStage('landed'); timers.current.push(window.setTimeout(() => setStage('secret'), 1100)); }
    };
    timers.current.push(window.setTimeout(step, ticks[0]));
  }
  return <div className={`reveal-stage stage-${stage}`} role="dialog" aria-modal="true" aria-label="Reveal the imposter">
    <div className="reveal-brand"><Eye size={16} strokeWidth={1.4} /> {siteHost}</div>
    {stage === 'armed' && <div className="reveal-inner">
      <p className="eyebrow">{winner === 'friends' ? 'THE TABLE HAS DECIDED' : 'THE VOTES ARE IN'}</p>
      <h2>Ready for <em>the reveal?</em></h2>
      <p className="reveal-hint"><Video size={15} /> Hold the phone up. Film this bit.</p>
      <button className="gold-button reveal-button" onClick={reveal}><Fingerprint size={18} /> Reveal the imposter<ArrowRight size={17} /></button>
    </div>}
    {stage !== 'armed' && <div className="reveal-inner">
      <p className="eyebrow">{roleLabel}</p>
      <div className={`reveal-name ${stage === 'spinning' ? 'reveal-spin' : 'reveal-land'}`} aria-live={stage === 'spinning' ? 'off' : 'polite'} key={stage === 'spinning' ? shown : 'landed'}>{names[shown]}</div>
      {stage === 'secret' && <div className="reveal-secret"><span className="eyebrow">{secretLabel}</span><strong>{secret}</strong></div>}
      {stage === 'secret' && <>
        <p className="reveal-verdict">{winner === 'friends' ? 'Caught. The friends win.' : 'Got away with it. The imposter wins.'}</p>
        <button className="gold-button reveal-button" onClick={onDone}>See the full result<ArrowRight size={17} /></button>
      </>}
    </div>}
  </div>;
}
