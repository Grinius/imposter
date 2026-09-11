import { freePlayerLimit } from './limits';
import { pick, tally, validateNames, voteIsValid } from './deduction';

// Timer Imposter: everyone is shown the same target time except the imposter, who sees only the
// range. Each player then runs a stopwatch blind — no digits on screen — trying to stop on the
// target, and the table judges by feel who was guessing. Times are in hundredths of a second so the
// rules never touch floating point.

export type TimerRange = 'quick' | 'short' | 'long';
export const timerRanges: Record<TimerRange, { label: string; min: number; max: number; blurb: string }> = {
  quick: { label: '1–5 s', min: 100, max: 500, blurb: 'Snappy. Every tenth of a second shows.' },
  short: { label: '3–15 s', min: 300, max: 1500, blurb: 'The classic. Long enough to lose count.' },
  long: { label: '10–45 s', min: 1000, max: 4500, blurb: 'A real wait. Nerves of steel required.' },
};
export interface TimerSettings { names: string[]; range: TimerRange; }
export type TimerPhase = 'handoff' | 'reveal' | 'turn-handoff' | 'timing' | 'running' | 'discussion' | 'vote-handoff' | 'voting' | 'guess' | 'result';
export interface TimerRound {
  names: string[]; settings: TimerSettings; target: number; imposter: number; firstTurn: number;
  phase: TimerPhase; cursor: number; times: (number | null)[]; votes: number[]; accused: number | null;
  winner: 'friends' | 'imposter' | null; reason: 'caught' | 'escaped' | 'tie' | 'guessed' | null;
}
export type TimerAction =
  | { type: 'reveal' | 'hide' | 'privacy' | 'take-turn' | 'begin-timer' | 'start-vote' | 'open-ballot' | 'skip-guess' }
  | { type: 'stop-timer'; elapsed: number }
  | { type: 'vote'; target: number }
  | { type: 'guess'; time: number };

export function validateTimerSettings(settings: TimerSettings, maxPlayers = freePlayerLimit): string | null {
  return validateNames(settings.names, maxPlayers) ?? (timerRanges[settings.range] ? null : 'Choose a time range.');
}
export function formatTime(hundredths: number) { return `${Math.floor(hundredths / 100)}.${String(hundredths % 100).padStart(2, '0')} s`; }
// Close enough to steal the win: a tenth of the target, never tighter than 0.30 s.
export function guessTolerance(target: number) { return Math.max(30, Math.round(target / 10)); }

export function createTimerRound(settings: TimerSettings, random: () => number, maxPlayers = freePlayerLimit): TimerRound {
  const error = validateTimerSettings(settings, maxPlayers); if (error) throw new Error(error);
  const names = settings.names.map(name => name.trim()), range = timerRanges[settings.range];
  const target = range.min + pick(range.max - range.min + 1, random);
  return { names, settings: { ...settings, names }, target, imposter: pick(names.length, random), firstTurn: pick(names.length, random), phase: 'handoff', cursor: 0, times: names.map(() => null), votes: [], accused: null, winner: null, reason: null };
}

export function timerTransition(round: TimerRound, action: TimerAction): TimerRound {
  const next = (cursor: number) => (cursor + 1) % round.names.length;
  switch (action.type) {
    case 'reveal': return round.phase === 'handoff' ? { ...round, phase: 'reveal' } : round;
    case 'hide':
      if (round.phase !== 'reveal') return round;
      return round.cursor + 1 === round.names.length ? { ...round, phase: 'turn-handoff', cursor: round.firstTurn } : { ...round, phase: 'handoff', cursor: round.cursor + 1 };
    case 'privacy':
      // A phone that lost focus mid-reveal or mid-ballot goes back behind the handoff screen. A running
      // stopwatch is public, so it is left alone.
      if (round.phase === 'reveal') return { ...round, phase: 'handoff' };
      if (round.phase === 'voting') return { ...round, phase: 'vote-handoff' };
      return round;
    case 'take-turn': return round.phase === 'turn-handoff' ? { ...round, phase: 'timing' } : round;
    case 'begin-timer': return round.phase === 'timing' ? { ...round, phase: 'running' } : round;
    case 'stop-timer': {
      if (round.phase !== 'running' || !Number.isInteger(action.elapsed) || action.elapsed < 0) return round;
      const times = round.times.map((time, index) => index === round.cursor ? Math.min(action.elapsed, 360000) : time);
      const done = times.every(time => time !== null);
      return done ? { ...round, times, phase: 'discussion' } : { ...round, times, phase: 'turn-handoff', cursor: next(round.cursor) };
    }
    case 'start-vote': return round.phase === 'discussion' ? { ...round, phase: 'vote-handoff', cursor: 0 } : round;
    case 'open-ballot': return round.phase === 'vote-handoff' ? { ...round, phase: 'voting' } : round;
    case 'vote': {
      if (round.phase !== 'voting' || !voteIsValid(action.target, round.cursor, round.names.length)) return round;
      const votes = [...round.votes, action.target];
      if (votes.length < round.names.length) return { ...round, votes, cursor: round.cursor + 1, phase: 'vote-handoff' };
      const accused = tally(votes, round.names.length);
      if (accused === null) return { ...round, votes, phase: 'result', winner: 'imposter', reason: 'tie' };
      return accused === round.imposter ? { ...round, votes, accused, phase: 'guess' } : { ...round, votes, accused, phase: 'result', winner: 'imposter', reason: 'escaped' };
    }
    case 'guess': {
      if (round.phase !== 'guess' || !Number.isInteger(action.time) || action.time < 0) return round;
      const stolen = Math.abs(action.time - round.target) <= guessTolerance(round.target);
      return { ...round, phase: 'result', winner: stolen ? 'imposter' : 'friends', reason: stolen ? 'guessed' : 'caught' };
    }
    case 'skip-guess': return round.phase === 'guess' ? { ...round, phase: 'result', winner: 'friends', reason: 'caught' } : round;
  }
}
