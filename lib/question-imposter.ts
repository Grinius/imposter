import { freePlayerLimit } from './limits';
import { pick, tally, validateNames, voteIsValid } from './deduction';
import { questionPairs, type QuestionPair } from './questions';

// Question Imposter: everyone is dealt the same question except one player, who gets a different
// question with the same shape of answer. Nobody is told they are the odd one out — not even the
// imposter — so there is no bluffing, only answers that don't quite line up. That is the rule that
// makes this variant work for groups who freeze up when asked to lie, and it is why there is no
// final guess: the imposter has nothing to guess.

export interface QuestionSettings { names: string[]; }
export type QuestionPhase = 'handoff' | 'reveal' | 'answers' | 'vote-handoff' | 'voting' | 'result';
export interface QuestionRound {
  names: string[]; settings: QuestionSettings; pair: QuestionPair; imposter: number; firstAnswer: number;
  phase: QuestionPhase; cursor: number; votes: number[]; accused: number | null;
  winner: 'friends' | 'imposter' | null; reason: 'caught' | 'escaped' | 'tie' | null;
}
export type QuestionAction = { type: 'reveal' | 'hide' | 'privacy' | 'start-vote' | 'open-ballot' } | { type: 'vote'; target: number };

export function validateQuestionSettings(settings: QuestionSettings, maxPlayers = freePlayerLimit): string | null {
  return validateNames(settings.names, maxPlayers);
}
export function createQuestionRound(settings: QuestionSettings, random: () => number, previousPair?: string, maxPlayers = freePlayerLimit): QuestionRound {
  const error = validateQuestionSettings(settings, maxPlayers); if (error) throw new Error(error);
  const names = settings.names.map(name => name.trim());
  const pool = questionPairs.filter(pair => pair.id !== previousPair);
  return { names, settings: { names }, pair: pool[pick(pool.length, random)], imposter: pick(names.length, random), firstAnswer: pick(names.length, random), phase: 'handoff', cursor: 0, votes: [], accused: null, winner: null, reason: null };
}
// What the player at `index` is shown on their card. Both cards look the same on purpose.
export function questionFor(round: QuestionRound, index: number) { return index === round.imposter ? round.pair.imposter : round.pair.friends; }

export function questionTransition(round: QuestionRound, action: QuestionAction): QuestionRound {
  switch (action.type) {
    case 'reveal': return round.phase === 'handoff' ? { ...round, phase: 'reveal' } : round;
    case 'hide':
      if (round.phase !== 'reveal') return round;
      return round.cursor + 1 === round.names.length ? { ...round, phase: 'answers', cursor: round.firstAnswer } : { ...round, phase: 'handoff', cursor: round.cursor + 1 };
    case 'privacy':
      if (round.phase === 'reveal') return { ...round, phase: 'handoff' };
      if (round.phase === 'voting') return { ...round, phase: 'vote-handoff' };
      return round;
    case 'start-vote': return round.phase === 'answers' ? { ...round, phase: 'vote-handoff', cursor: 0 } : round;
    case 'open-ballot': return round.phase === 'vote-handoff' ? { ...round, phase: 'voting' } : round;
    case 'vote': {
      if (round.phase !== 'voting' || !voteIsValid(action.target, round.cursor, round.names.length)) return round;
      const votes = [...round.votes, action.target];
      if (votes.length < round.names.length) return { ...round, votes, cursor: round.cursor + 1, phase: 'vote-handoff' };
      const accused = tally(votes, round.names.length);
      if (accused === null) return { ...round, votes, phase: 'result', winner: 'imposter', reason: 'tie' };
      return { ...round, votes, accused, phase: 'result', winner: accused === round.imposter ? 'friends' : 'imposter', reason: accused === round.imposter ? 'caught' : 'escaped' };
    }
  }
}
