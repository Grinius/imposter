import { describe, expect, it } from 'vitest';
import { createRound, normalizeGuess, transition, validateSettings, type Round, type Settings } from '../lib/game';
import { categories, getWords } from '../lib/words';
const settings: Settings = { names: ['Alex', 'Jamie', 'Taylor', 'Morgan'], category: 'food', minutes: 3, hints: true };
function make() { const values = [.1, 0, .7]; return createRound(settings, () => values.shift()!); }
function revealed() { let round = make(); for (let i = 0; i < settings.names.length; i++) { round = transition(round, { type: 'reveal' }); round = transition(round, { type: 'hide' }); } return round; }
function vote(targets: number[]) { let round = transition(revealed(), { type: 'start-vote' }); for (const target of targets) { round = transition(round, { type: 'open-ballot' }); round = transition(round, { type: 'vote', target }); } return round; }
describe('setup and word packs', () => {
  it('rejects invalid counts, empty and duplicate names, durations and categories', () => {
    expect(validateSettings({ ...settings, names: ['A', 'B'] })).not.toBeNull();
    expect(validateSettings({ ...settings, names: ['A', 'B', 'C', 'D', 'E', 'F'] })).toBe('Invite 3–5 players to the free table.');
    expect(validateSettings({ ...settings, names: ['Alex', ' alex ', 'C'] })).not.toBeNull();
    expect(validateSettings({ ...settings, names: ['A', '', 'C'] })).not.toBeNull();
    expect(validateSettings({ ...settings, minutes: -1 })).not.toBeNull();
    expect(validateSettings({ ...settings, category: 'invalid' as Settings['category'] })).not.toBeNull();
  });
  it('uses one role per player and independently chooses the first clue giver', () => { const round = make(); expect(round.imposter).toBe(0); expect(round.firstClue).toBe(2); expect(round.phase).toBe('handoff'); expect(round.names).toEqual(settings.names); });
  it('never repeats the previous word when replaying', () => { const one = make(); for (let i = 0; i < 100; i++) { expect(createRound(settings, () => i / 100, one.word.id).word.id).not.toBe(one.word.id); } });
  it('keeps category pools nonempty and word IDs unique', () => { for (const c of categories) expect(getWords(c.id).length).toBeGreaterThan(10); const all = getWords('mixed'); expect(new Set(all.map(w => w.id)).size).toBe(all.length); });
  it('rejects invalid randomness', () => { expect(() => createRound(settings, () => 1)).toThrow(); expect(() => createRound(settings, () => NaN)).toThrow(); });
});
describe('private reveals', () => {
  it('requires a fresh reveal for each player', () => { const initial = make(); expect(transition(initial, { type: 'hide' })).toBe(initial); const hidden = transition(transition(initial, { type: 'reveal' }), { type: 'hide' }); expect(hidden.phase).toBe('handoff'); expect(hidden.cursor).toBe(1); expect(transition(hidden, { type: 'hide' })).toBe(hidden); });
  it('hides the current role on privacy events without skipping its owner', () => { const current = transition(make(), { type: 'reveal' }); const hidden = transition(current, { type: 'privacy' }); expect(hidden.phase).toBe('handoff'); expect(hidden.cursor).toBe(0); });
  it('begins discussion only after everyone has read their card', () => { const round = revealed(); expect(round.phase).toBe('discussion'); expect(round.cursor).toBe(round.firstClue); });
  it('ignores premature or repeated phase actions', () => { const initial = make(); expect(transition(initial, { type: 'start-vote' })).toBe(initial); expect(transition(initial, { type: 'guess', word: initial.word.text })).toBe(initial); });
});
describe('voting and win conditions', () => {
  it('rejects self votes, invalid players, and votes outside a ballot', () => { const handoff = transition(revealed(), { type: 'start-vote' }); expect(transition(handoff, { type: 'vote', target: 1 })).toBe(handoff); const open = transition(handoff, { type: 'open-ballot' }); for (const target of [0, -1, 4, NaN, 1.5]) expect(transition(open, { type: 'vote', target })).toBe(open); });
  it('does not let a repeated vote action vote as the next player', () => { const open = transition(transition(revealed(), { type: 'start-vote' }), { type: 'open-ballot' }); const next = transition(open, { type: 'vote', target: 1 }); expect(next.phase).toBe('vote-handoff'); expect(transition(next, { type: 'vote', target: 2 })).toBe(next); });
  it('returns an open ballot to handoff on a privacy event', () => { const open = transition(transition(revealed(), { type: 'start-vote' }), { type: 'open-ballot' }); expect(transition(open, { type: 'privacy' }).phase).toBe('vote-handoff'); });
  it('gives the caught imposter a final guess', () => { const round = vote([1, 0, 0, 0]); expect(round.phase).toBe('guess'); expect(round.winner).toBeNull(); });
  it('awards the imposter a win for a tie', () => { const round = vote([1, 0, 0, 1]); expect(round.reason).toBe('tie'); expect(round.winner).toBe('imposter'); });
  it('awards the imposter a win when a friend is accused', () => { const round = vote([1, 2, 1, 1]); expect(round.accused).toBe(1); expect(round.reason).toBe('escaped'); });
  it('accepts harmless casing/spacing differences and refuses a second guess', () => { const round = vote([1, 0, 0, 0]); const result = transition(round, { type: 'guess', word: ` ${round.word.text.toUpperCase()} ` }); expect(result.reason).toBe('guessed'); expect(transition(result, { type: 'guess', word: 'wrong' })).toBe(result); expect(normalizeGuess('Ice-cream')).toBe(normalizeGuess('ice cream')); });
  it('awards friends a win on wrong or skipped guesses', () => { const round = vote([1, 0, 0, 0]); expect(transition(round, { type: 'guess', word: 'incorrect' }).winner).toBe('friends'); expect(transition(round, { type: 'skip-guess' }).winner).toBe('friends'); expect(transition(round, { type: 'guess', word: '   ' })).toBe(round); });
  it('replay clears all round state', () => { const old = vote([1, 0, 0, 1]); const fresh: Round = createRound(old.settings, () => .8, old.word.id); expect(fresh.phase).toBe('handoff'); expect(fresh.votes).toEqual([]); expect(fresh.winner).toBeNull(); expect(fresh.accused).toBeNull(); expect(fresh.cursor).toBe(0); });
});
