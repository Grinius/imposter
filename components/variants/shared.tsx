'use client';
import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowRight, Check, Eye, Fingerprint, LockKeyhole, Plus, ShieldCheck, Users, X } from 'lucide-react';
import { freePlayerLimit, minPlayerLimit, premiumPlayerLimit } from '@/lib/limits';
import { siteHost } from '@/components/brand';

// Pieces the pass-and-play variants share with each other. They mirror what `components/game.tsx`
// does for the word game (same CSS classes, same handoff guard, same privacy behaviour) so the three
// variants feel like the same product; the word game keeps its own copies untouched.

export const playerColors = ['#b77d5c', '#65847c', '#a09564', '#82758f', '#6886a0', '#aa6c78', '#8a9862', '#b58b56', '#729594', '#997c66', '#827e9e', '#809164'];
export function Avatar({ index, name, large = false }: { index: number; name: string; large?: boolean }) {
  return <span className={`avatar ${large ? 'avatar-large' : ''}`} style={{ '--avatar-color': playerColors[index % playerColors.length] } as CSSProperties} aria-hidden="true">{name.trim().slice(0, 1).toUpperCase() || '?'}</span>;
}
export function Emblem({ small = false }: { small?: boolean }) { return <span className={`emblem ${small ? 'emblem-small' : ''}`} aria-hidden="true"><Eye strokeWidth={1.25} /></span>; }

// The 650 ms guard and the double-tap check keep a rapid second tap on "pass the phone" from
// opening the next player's card before the phone has changed hands.
export function HandoffButton({ label, onOpen }: { label: string; onOpen: () => void }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setReady(true), 650); return () => clearTimeout(timer); }, []);
  return <button className="gold-button" disabled={!ready} onClick={event => { if (event.detail < 2) onOpen(); }}><Eye size={18} />{label}<ArrowRight size={17} /></button>;
}
export function CardBack() {
  return <div className="secret-card card-back"><div className="card-corner">I<span>✦</span></div><Emblem /><span className="card-back-title">TRUST NO ONE</span><span className="card-back-subtitle">THE IMPOSTER SOCIETY</span><div className="card-corner bottom">I<span>✦</span></div></div>;
}
export function Handoff({ eyebrow, name, subtitle, label, onOpen, heading }: { eyebrow: string; name: string; subtitle: string; label: string; onOpen: () => void; heading: React.RefObject<HTMLHeadingElement | null> }) {
  return <>
    <p className="eyebrow">{eyebrow}</p>
    <h2 ref={heading} tabIndex={-1}>Pass the phone to <em>{name}.</em></h2>
    <p className="round-subtitle">{subtitle}</p>
    <CardBack />
    <HandoffButton label={label} onOpen={onOpen} />
    <span className="private-note"><LockKeyhole size={13} /> Only {name} should look at this screen.</span>
  </>;
}

export function PlayerNames({ names, premium, onChange }: { names: string[]; premium: boolean; onChange: (names: string[]) => void }) {
  return <>
    <div className="field-heading"><label id="players-label"><span className="step-number">01</span> Who’s at the table?</label><span className="count-label">{names.length} / {premium ? premiumPlayerLimit : `${freePlayerLimit} free`}</span></div>
    <div className="player-inputs" role="group" aria-labelledby="players-label">{names.map((name, index) => { const isPremiumSlot = !premium && index >= freePlayerLimit; return <div className={`player-input ${isPremiumSlot ? 'premium-slot' : ''}`} key={index}><Avatar index={index} name={name} /><input aria-label={`Player ${index + 1} name`} value={name} maxLength={20} autoComplete="off" onChange={event => onChange(names.map((value, i) => i === index ? event.target.value : value))} /><button type="button" aria-label={`Remove player ${index + 1}`} disabled={names.length <= minPlayerLimit} onClick={() => onChange(names.filter((_, i) => i !== index))}><X size={14} /></button>{isPremiumSlot && <small className="premium-tag"><LockKeyhole size={10} /> Premium</small>}</div>; })}</div>
    <button className="add-player" type="button" disabled={names.length >= premiumPlayerLimit} onClick={() => { let number = names.length + 1; while (names.includes(`Player ${number}`)) number++; onChange([...names, `Player ${number}`]); }}><Plus size={15} /> Add a player{!premium && names.length >= freePlayerLimit && <span className="premium-tag inline"><LockKeyhole size={10} /> Premium</span>}</button>
  </>;
}

export function RoundChrome({ roundNumber, playerCount, steps, step, onLeave, children }: { roundNumber: number; playerCount: number; steps: string[]; step: number; onLeave: () => void; children: ReactNode }) {
  return <section className="round-layout">
    <div className="round-top"><button className="text-button" onClick={onLeave}><X size={15} /> Leave game</button><span>ROUND {String(roundNumber).padStart(2, '0')}</span><span className="round-player-count"><Users size={14} /> {playerCount} suspects</span></div>
    <div className="phase-track" aria-label={`Step ${step} of ${steps.length}`}>{steps.map((title, index) => <div className={step === index + 1 ? 'current' : step > index + 1 ? 'complete' : ''} key={title}><span>{step > index + 1 ? <Check size={12} /> : `0${index + 1}`}</span><span>{title}</span></div>)}</div>
    {children}
  </section>;
}

export function Ballot({ names, voter, onVote, heading }: { names: string[]; voter: number; onVote: (target: number) => void; heading: React.RefObject<HTMLHeadingElement | null> }) {
  const [selected, setSelected] = useState<number | null>(null);
  return <>
    <p className="eyebrow">{names[voter].toUpperCase()}’S PRIVATE BALLOT</p>
    <h2 ref={heading} tabIndex={-1}>Who’s the <em>odd one out?</em></h2><p className="round-subtitle">Choose the person you suspect. You can’t vote for yourself.</p>
    <div className="ballot-grid">{names.map((name, index) => index !== voter && <button className={`ballot-option ${selected === index ? 'chosen' : ''}`} key={index} aria-pressed={selected === index} onClick={() => setSelected(index)}><Avatar name={name} index={index} /><span>{name}</span><span className="ballot-check">{selected === index && <Check size={14} />}</span></button>)}</div>
    <button className="gold-button" disabled={selected === null} onClick={() => { if (selected !== null) onVote(selected); }}><LockKeyhole size={17} /> Lock in my vote<ArrowRight size={17} /></button><span className="private-note">Once locked in, your vote can’t be changed.</span>
  </>;
}

export function ResultHeader({ winner, subtitle, heading }: { winner: 'friends' | 'imposter'; subtitle: string; heading: React.RefObject<HTMLHeadingElement | null> }) {
  return <>
    <p className="eyebrow">{winner === 'friends' ? 'A VERY GOOD PIECE OF DETECTIVE WORK' : 'A LITTLE TOO GOOD AT LYING'}</p><div className="result-emblem">{winner === 'friends' ? <ShieldCheck size={50} strokeWidth={1} /> : <Fingerprint size={50} strokeWidth={1} />}</div>
    <h2 ref={heading} tabIndex={-1}>{winner === 'friends' ? <>The friends <em>win.</em></> : <>The imposter <em>wins.</em></>}</h2><p className="round-subtitle">{subtitle}</p>
  </>;
}
export function VoteResults({ names, votes }: { names: string[]; votes: number[] }) {
  return <div className="vote-results"><span className="votes-label">HOW THE TABLE VOTED</span>{names.map((name, index) => <div className="vote-result" key={index}><span>{name}</span><span className="vote-bar"><i style={{ width: `${votes.filter(v => v === index).length / names.length * 100}%` }} /></span><b>{votes.filter(v => v === index).length}</b></div>)}</div>;
}
export function ResultBrand() { return <p className="result-brand">Played on <b>{siteHost}</b></p>; }

export function VariantLinks({ current }: { current: 'word' | 'timer' | 'question' | 'drawing' }) {
  const games = [
    { id: 'word', href: '/', label: 'Imposter word game' },
    { id: 'timer', href: '/timer-imposter/', label: 'Timer Imposter' },
    { id: 'question', href: '/question-imposter/', label: 'Question Imposter' },
    { id: 'drawing', href: '/drawing-imposter/', label: 'Drawing Imposter' },
  ] as const;
  return <div className="setup-links">{games.filter(game => game.id !== current).map(game => <Link className="online-link" key={game.id} href={game.href}>{game.label} <ArrowRight size={15} /></Link>)}</div>;
}

// Private cards and ballots retreat behind the handoff screen the moment the phone loses focus,
// and a round in progress asks before the tab is closed. Same behaviour as the word game.
export function usePrivacyGuard(active: boolean, protect: () => void) {
  useEffect(() => {
    const onBlur = () => protect(); const onHidden = () => { if (document.hidden) protect(); };
    window.addEventListener('blur', onBlur); document.addEventListener('visibilitychange', onHidden);
    return () => { window.removeEventListener('blur', onBlur); document.removeEventListener('visibilitychange', onHidden); };
  }, [protect]);
  useEffect(() => {
    if (!active) return;
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [active]);
}
export function useHeadingFocus(key: string | null) {
  const heading = useRef<HTMLHeadingElement>(null), previous = useRef<string | null>(null);
  useEffect(() => { if (previous.current !== key) heading.current?.focus({ preventScroll: true }); previous.current = key; }, [key]);
  return heading;
}
