import { freePlayerLimit } from './limits';
import { freshPool, pick, tally, validateNames, voteIsValid } from './deduction';
import { normalizeGuess } from './game';
import { categories, getWords, type Category, type Word } from './words';

// Drawing Imposter (the "fake artist" game): everyone knows what is being drawn except the imposter.
// The phone goes round the table and each player adds exactly one continuous line per pass — enough
// to prove you know the subject, not enough to give it away. Two passes, then a vote; a caught
// imposter can still steal the win by naming the word. Strokes are stored in normalised 0–1
// coordinates so the drawing can be redrawn at any size, and each stroke remembers its player so
// the table can argue about who drew the suspicious squiggle.

export type Point = [number, number];
export interface Stroke { player: number; points: Point[]; }
export interface DrawingSettings { names: string[]; category: Category; passes: 1 | 2; }
export type DrawingPhase = 'handoff' | 'reveal' | 'turn-handoff' | 'drawing' | 'discussion' | 'vote-handoff' | 'voting' | 'guess' | 'result';
export interface DrawingRound {
  names: string[]; settings: DrawingSettings; word: Word; imposter: number; firstTurn: number;
  phase: DrawingPhase; cursor: number; turn: number; strokes: Stroke[]; votes: number[]; accused: number | null;
  winner: 'friends' | 'imposter' | null; reason: 'caught' | 'escaped' | 'tie' | 'guessed' | null;
}
export type DrawingAction =
  | { type: 'reveal' | 'hide' | 'privacy' | 'take-turn' | 'start-vote' | 'open-ballot' | 'skip-guess' }
  | { type: 'stroke'; points: Point[] }
  | { type: 'vote'; target: number }
  | { type: 'guess'; word: string };

export const maxStrokePoints = 2000;
export function validateDrawingSettings(settings: DrawingSettings, options: { maxPlayers?: number; premium?: boolean } = {}): string | null {
  const { maxPlayers = freePlayerLimit, premium = false } = options;
  const namesError = validateNames(settings.names, maxPlayers); if (namesError) return namesError;
  const category = categories.find(candidate => candidate.id === settings.category);
  if (!category) return 'Choose a category.';
  if (category.premium && !premium) return `${category.name} is a premium category. Upgrade to Imposter Premium to play it.`;
  if (settings.passes !== 1 && settings.passes !== 2) return 'Choose one or two passes.';
  return null;
}
export function totalTurns(round: DrawingRound) { return round.names.length * round.settings.passes; }
export function createDrawingRound(settings: DrawingSettings, random: () => number, exclude?: string | string[], options: { maxPlayers?: number; premium?: boolean } = {}): DrawingRound {
  const error = validateDrawingSettings(settings, options); if (error) throw new Error(error);
  const names = settings.names.map(name => name.trim());
  const pool = freshPool(getWords(settings.category), exclude);
  return { names, settings: { ...settings, names }, word: pool[pick(pool.length, random)], imposter: pick(names.length, random), firstTurn: pick(names.length, random), phase: 'handoff', cursor: 0, turn: 0, strokes: [], votes: [], accused: null, winner: null, reason: null };
}
function strokeIsValid(points: unknown): points is Point[] {
  return Array.isArray(points) && points.length >= 1 && points.length <= maxStrokePoints
    && points.every(point => Array.isArray(point) && point.length === 2 && point.every(value => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1));
}

export function drawingTransition(round: DrawingRound, action: DrawingAction): DrawingRound {
  switch (action.type) {
    case 'reveal': return round.phase === 'handoff' ? { ...round, phase: 'reveal' } : round;
    case 'hide':
      if (round.phase !== 'reveal') return round;
      return round.cursor + 1 === round.names.length ? { ...round, phase: 'turn-handoff', cursor: round.firstTurn } : { ...round, phase: 'handoff', cursor: round.cursor + 1 };
    case 'privacy':
      // The canvas is public; only a private card or ballot retreats behind the handoff screen.
      if (round.phase === 'reveal') return { ...round, phase: 'handoff' };
      if (round.phase === 'voting') return { ...round, phase: 'vote-handoff' };
      return round;
    case 'take-turn': return round.phase === 'turn-handoff' ? { ...round, phase: 'drawing' } : round;
    case 'stroke': {
      if (round.phase !== 'drawing' || !strokeIsValid(action.points)) return round;
      const strokes = [...round.strokes, { player: round.cursor, points: action.points }], turn = round.turn + 1;
      if (turn >= totalTurns(round)) return { ...round, strokes, turn, phase: 'discussion' };
      return { ...round, strokes, turn, phase: 'turn-handoff', cursor: (round.cursor + 1) % round.names.length };
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
      if (round.phase !== 'guess' || !normalizeGuess(action.word)) return round;
      const stolen = normalizeGuess(action.word) === normalizeGuess(round.word.text);
      return { ...round, phase: 'result', winner: stolen ? 'imposter' : 'friends', reason: stolen ? 'guessed' : 'caught' };
    }
    case 'skip-guess': return round.phase === 'guess' ? { ...round, phase: 'result', winner: 'friends', reason: 'caught' } : round;
  }
}
