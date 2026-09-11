import { freePlayerLimit } from './limits';
import { pick, validateNames } from './deduction';
import { categories, getWords, type Category, type Word } from './words';
export type Phase = 'handoff' | 'reveal' | 'discussion' | 'vote-handoff' | 'voting' | 'guess' | 'result';
export interface Settings { names: string[]; category: Category; minutes: number; hints: boolean; }
export interface Round {
  names: string[]; word: Word; imposter: number; firstClue: number; phase: Phase; cursor: number;
  votes: number[]; accused: number | null; winner: 'friends' | 'imposter' | null;
  clues: string[];
  reason: 'caught' | 'escaped' | 'tie' | 'guessed' | null; settings: Settings;
}
export type Action = { type: 'reveal' | 'hide' | 'privacy' | 'start-vote' | 'open-ballot' | 'skip-guess' } | { type: 'clue'; text: string } | { type: 'vote'; target: number } | { type: 'guess'; word: string };
export interface EntitlementOptions { maxPlayers?: number; premium?: boolean; }
export function validateSettings(settings: Settings, options: EntitlementOptions = {}): string | null {
  const { maxPlayers = freePlayerLimit, premium = false } = options;
  const namesError = validateNames(settings.names, maxPlayers); if (namesError) return namesError;
  const category = categories.find(candidate => candidate.id === settings.category);
  if (!category) return 'Choose a category.';
  // Server-side defense in depth: a premium category must never be playable without a verified
  // entitlement, even if a client bypasses the UI (e.g. an online room host crafting messages by hand).
  if (category.premium && !premium) return `${category.name} is a premium category. Upgrade to Imposter Premium to play it.`;
  if (![2, 3, 5].includes(settings.minutes)) return 'Choose a 2, 3, or 5 minute discussion.';
  return null;
}
export function createRound(settings: Settings, random: () => number, previousWord?: string, options: EntitlementOptions = {}): Round {
  const error = validateSettings(settings, options); if (error) throw new Error(error);
  const pool = getWords(settings.category).filter(word => word.id !== previousWord);
  const normalized = { ...settings, names: settings.names.map(name => name.trim()) };
  return { names: normalized.names, settings: normalized, word: pool[pick(pool.length, random)], imposter: pick(settings.names.length, random), firstClue: pick(settings.names.length, random), phase: 'handoff', cursor: 0, votes: [], clues: [], accused: null, winner: null, reason: null };
}
// Who is allowed to take which action, given the round's own phase machine. Pass-and-play has one
// device speaking for everyone, so only the online worker consults this — but it is a rule, not
// transport: it answers the same "whose turn is it" question `transition` already encodes, and
// keeping it here means it can be tested without a socket. Exhaustive by design: a new action type
// fails to compile until its authorization is stated, rather than defaulting to "anyone may".
export interface Actor { index: number; isHost: boolean; }
export function actionIsAuthorized(round: Round, actor: Actor, action: Action): boolean {
  switch (action.type) {
    // Only the player the cursor is on may speak, vote, open their own ballot, or panic-hide their
    // own private view. Without this, any player could submit clues and ballots in someone else's
    // name -- `transition` attributes both to `round.cursor`, not to whoever sent the message.
    case 'clue': case 'vote': case 'open-ballot': case 'privacy': return actor.index === round.cursor;
    case 'start-vote': return actor.isHost;
    case 'guess': case 'skip-guess': return actor.index === round.imposter;
    // Handoff phases exist only for one shared device; online rounds start at 'discussion'.
    case 'reveal': case 'hide': return false;
  }
}
export function normalizeGuess(word: string) { return word.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
export function transition(round: Round, action: Action): Round {
  switch (action.type) {
    case 'reveal': return round.phase === 'handoff' ? { ...round, phase: 'reveal' } : round;
    case 'hide':
      if (round.phase !== 'reveal') return round;
      return round.cursor + 1 === round.names.length ? { ...round, phase: 'discussion', cursor: round.firstClue } : { ...round, phase: 'handoff', cursor: round.cursor + 1 };
    case 'privacy':
      if (round.phase === 'reveal') return { ...round, phase: 'handoff' };
      if (round.phase === 'voting') return { ...round, phase: 'vote-handoff' };
      return round;
    case 'start-vote': return round.phase === 'discussion' ? { ...round, phase: 'vote-handoff', cursor: 0 } : round;
    case 'clue': {
      const text = action.text.trim().slice(0, 120);
      if (round.phase !== 'discussion' || !text || round.clues.length >= round.names.length) return round;
      return { ...round, clues: [...round.clues, text], cursor: (round.cursor + 1) % round.names.length };
    }
    case 'open-ballot': return round.phase === 'vote-handoff' ? { ...round, phase: 'voting' } : round;
    case 'vote': {
      if (round.phase !== 'voting' || !Number.isInteger(action.target) || action.target < 0 || action.target >= round.names.length || action.target === round.cursor) return round;
      const votes = [...round.votes, action.target];
      if (votes.length < round.names.length) return { ...round, votes, cursor: round.cursor + 1, phase: 'vote-handoff' };
      const counts = round.names.map((_, i) => votes.filter(vote => vote === i).length);
      const top = Math.max(...counts); const leaders = counts.flatMap((count, i) => count === top ? [i] : []);
      if (leaders.length !== 1) return { ...round, votes, phase: 'result', winner: 'imposter', reason: 'tie' };
      const accused = leaders[0];
      return accused === round.imposter ? { ...round, votes, accused, phase: 'guess' } : { ...round, votes, accused, phase: 'result', winner: 'imposter', reason: 'escaped' };
    }
    case 'guess':
      if (round.phase !== 'guess' || !normalizeGuess(action.word)) return round;
      return { ...round, phase: 'result', winner: normalizeGuess(action.word) === normalizeGuess(round.word.text) ? 'imposter' : 'friends', reason: normalizeGuess(action.word) === normalizeGuess(round.word.text) ? 'guessed' : 'caught' };
    case 'skip-guess': return round.phase === 'guess' ? { ...round, phase: 'result', winner: 'friends', reason: 'caught' } : round;
  }
}
export function secureRandom(): number { return crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296; }
