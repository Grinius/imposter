import { describe, expect, it } from 'vitest';
import { tally, validateNames, voteIsValid } from '../lib/deduction';
import { createTimerRound, formatTime, guessTolerance, timerRanges, timerTransition, type TimerRound } from '../lib/timer-imposter';
import { createQuestionRound, questionFor, questionTransition, type QuestionRound } from '../lib/question-imposter';
import { questionPairs } from '../lib/questions';
import { createDrawingRound, drawingTransition, maxStrokePoints, totalTurns, type DrawingRound } from '../lib/drawing-imposter';

const names = ['Alex', 'Jamie', 'Taylor', 'Morgan'];
// A fixed random stream: target picks the low end of the range, imposter is player 0, first turn is player 2.
const stream = (values: number[]) => { let i = 0; return () => values[i++ % values.length]; };

describe('shared deduction rules', () => {
  it('validates names the same way the main game does', () => {
    expect(validateNames(['a', 'b'])).toMatch(/3–5 players/);
    expect(validateNames(['a', 'b', 'c', 'd', 'e', 'f'])).toMatch(/3–5 players/);
    expect(validateNames(['a', 'b', 'c', 'd', 'e', 'f'], 20)).toBeNull();
    expect(validateNames(['a', ' ', 'c'])).toMatch(/name/);
    expect(validateNames(['a', 'A', 'c'])).toMatch(/different name/);
    expect(validateNames(names)).toBeNull();
  });
  it('accuses only a clear leader and refuses self-votes and out-of-range targets', () => {
    expect(tally([1, 1, 0, 2], 4)).toBe(1);
    expect(tally([1, 0, 1, 0], 4)).toBeNull();
    expect(voteIsValid(1, 0, 4)).toBe(true); expect(voteIsValid(0, 0, 4)).toBe(false); expect(voteIsValid(4, 0, 4)).toBe(false); expect(voteIsValid(1.5, 0, 4)).toBe(false);
  });
});

describe('timer imposter', () => {
  const make = () => createTimerRound({ names, range: 'short' }, stream([0, 0, 0.5]));
  const revealAll = (round: TimerRound) => { for (let i = 0; i < names.length; i++) { round = timerTransition(round, { type: 'reveal' }); round = timerTransition(round, { type: 'hide' }); } return round; };
  const timeAll = (round: TimerRound, elapsed: number[]) => { for (const time of elapsed) { round = timerTransition(round, { type: 'take-turn' }); round = timerTransition(round, { type: 'begin-timer' }); round = timerTransition(round, { type: 'stop-timer', elapsed: time }); } return round; };
  const voteAll = (round: TimerRound, targets: number[]) => { round = timerTransition(round, { type: 'start-vote' }); for (const target of targets) { round = timerTransition(round, { type: 'open-ballot' }); round = timerTransition(round, { type: 'vote', target }); } return round; };

  it('picks a target inside the chosen range and starts everyone unrevealed', () => {
    const round = make();
    expect(round.target).toBe(timerRanges.short.min); expect(round.imposter).toBe(0); expect(round.firstTurn).toBe(2);
    expect(round.phase).toBe('handoff'); expect(round.times).toEqual([null, null, null, null]);
    expect(() => createTimerRound({ names: ['a', 'b'], range: 'short' }, Math.random)).toThrow(/players/);
    expect(() => createTimerRound({ names, range: 'nope' as never }, Math.random)).toThrow(/range/);
  });
  it('walks reveal → blind timing from the first turn → discussion, ignoring out-of-phase taps', () => {
    let round = make();
    expect(timerTransition(round, { type: 'hide' })).toBe(round); // nothing to hide yet
    round = revealAll(round);
    expect(round.phase).toBe('turn-handoff'); expect(round.cursor).toBe(2);
    expect(timerTransition(round, { type: 'stop-timer', elapsed: 100 })).toBe(round); // not running
    round = timeAll(round, [310, 290, 900, 305]);
    expect(round.phase).toBe('discussion');
    expect(round.times).toEqual([900, 305, 310, 290]); // recorded against the player who ran it, from player 2 round the table
    expect(timerTransition(round, { type: 'stop-timer', elapsed: 1 })).toBe(round);
  });
  it('rejects negative or fractional times and caps absurd ones', () => {
    let round = revealAll(make()); round = timerTransition(round, { type: 'take-turn' }); round = timerTransition(round, { type: 'begin-timer' });
    expect(timerTransition(round, { type: 'stop-timer', elapsed: -1 })).toBe(round);
    expect(timerTransition(round, { type: 'stop-timer', elapsed: 1.5 })).toBe(round);
    expect(timerTransition(round, { type: 'stop-timer', elapsed: 10_000_000 }).times[2]).toBe(360000);
  });
  it('sends a phone that lost focus back behind the handoff, but leaves a running stopwatch alone', () => {
    let round = timerTransition(make(), { type: 'reveal' });
    expect(timerTransition(round, { type: 'privacy' }).phase).toBe('handoff');
    round = revealAll(make()); round = timerTransition(round, { type: 'take-turn' }); round = timerTransition(round, { type: 'begin-timer' });
    expect(timerTransition(round, { type: 'privacy' })).toBe(round);
  });
  it('lets the imposter escape on a tie or a wrong accusation', () => {
    const base = timeAll(revealAll(make()), [300, 300, 300, 300]);
    expect(voteAll(base, [1, 0, 1, 0])).toMatchObject({ phase: 'result', winner: 'imposter', reason: 'tie' });
    expect(voteAll(base, [1, 3, 1, 1])).toMatchObject({ phase: 'result', winner: 'imposter', reason: 'escaped', accused: 1 });
  });
  it('gives a caught imposter one guess at the target, within a tolerance that never drops below 0.30 s', () => {
    const caught = voteAll(timeAll(revealAll(make()), [300, 300, 300, 300]), [1, 0, 0, 0]);
    expect(caught.phase).toBe('guess');
    expect(guessTolerance(300)).toBe(30); expect(guessTolerance(4000)).toBe(400);
    expect(timerTransition(caught, { type: 'guess', time: 330 })).toMatchObject({ winner: 'imposter', reason: 'guessed' });
    expect(timerTransition(caught, { type: 'guess', time: 331 })).toMatchObject({ winner: 'friends', reason: 'caught' });
    expect(timerTransition(caught, { type: 'guess', time: -5 })).toBe(caught);
    expect(timerTransition(caught, { type: 'skip-guess' })).toMatchObject({ winner: 'friends', reason: 'caught' });
    expect(formatTime(305)).toBe('3.05 s'); expect(formatTime(4500)).toBe('45.00 s');
  });
});

describe('question imposter', () => {
  const make = () => createQuestionRound({ names }, stream([0, 0, 0.5]));
  const revealAll = (round: QuestionRound) => { for (let i = 0; i < names.length; i++) { round = questionTransition(round, { type: 'reveal' }); round = questionTransition(round, { type: 'hide' }); } return round; };
  const voteAll = (round: QuestionRound, targets: number[]) => { round = questionTransition(round, { type: 'start-vote' }); for (const target of targets) { round = questionTransition(round, { type: 'open-ballot' }); round = questionTransition(round, { type: 'vote', target }); } return round; };

  it('ships sixty distinct pairs with distinct questions', () => {
    expect(questionPairs.length).toBeGreaterThanOrEqual(60);
    expect(new Set(questionPairs.map(pair => pair.id)).size).toBe(questionPairs.length);
    for (const pair of questionPairs) expect(pair.friends).not.toBe(pair.imposter);
  });
  it('deals the odd question to exactly one player and never repeats the previous pair', () => {
    const round = make();
    expect(names.map((_, i) => questionFor(round, i)).filter(q => q === round.pair.imposter)).toHaveLength(1);
    for (let i = 0; i < 100; i++) expect(createQuestionRound({ names }, () => i / 100, round.pair.id).pair.id).not.toBe(round.pair.id);
  });
  it('goes from the last reveal straight to answers, then to a vote with no final guess', () => {
    let round = revealAll(make());
    expect(round.phase).toBe('answers'); expect(round.cursor).toBe(2);
    expect(voteAll(round, [1, 0, 1, 0])).toMatchObject({ phase: 'result', winner: 'imposter', reason: 'tie' });
    expect(voteAll(round, [1, 0, 0, 0])).toMatchObject({ phase: 'result', winner: 'friends', reason: 'caught', accused: 0 });
    expect(voteAll(round, [2, 2, 1, 2])).toMatchObject({ phase: 'result', winner: 'imposter', reason: 'escaped', accused: 2 });
    round = questionTransition(questionTransition(make(), { type: 'reveal' }), { type: 'privacy' });
    expect(round.phase).toBe('handoff');
  });
});

describe('drawing imposter', () => {
  const make = (passes: 1 | 2 = 2) => createDrawingRound({ names, category: 'animals', passes }, stream([0, 0, 0.5]));
  const revealAll = (round: DrawingRound) => { for (let i = 0; i < names.length; i++) { round = drawingTransition(round, { type: 'reveal' }); round = drawingTransition(round, { type: 'hide' }); } return round; };
  const line: [number, number][] = [[0.1, 0.1], [0.5, 0.5]];
  const drawAll = (round: DrawingRound) => { while (round.phase === 'turn-handoff') { round = drawingTransition(round, { type: 'take-turn' }); round = drawingTransition(round, { type: 'stroke', points: line }); } return round; };
  const voteAll = (round: DrawingRound, targets: number[]) => { round = drawingTransition(round, { type: 'start-vote' }); for (const target of targets) { round = drawingTransition(round, { type: 'open-ballot' }); round = drawingTransition(round, { type: 'vote', target }); } return round; };

  it('applies the word-pack rules, including the premium gate', () => {
    expect(() => createDrawingRound({ names, category: 'objects', passes: 2 }, Math.random)).toThrow(/premium/i);
    expect(createDrawingRound({ names, category: 'objects', passes: 2 }, Math.random, undefined, { premium: true }).word.category).toBe('objects');
    expect(() => createDrawingRound({ names, category: 'animals', passes: 3 as never }, Math.random)).toThrow(/passes/);
  });
  it('gives every player exactly one stroke per pass, attributed to them, then opens discussion', () => {
    let round = revealAll(make());
    expect(round.phase).toBe('turn-handoff'); expect(round.cursor).toBe(2); expect(totalTurns(round)).toBe(8);
    expect(drawingTransition(round, { type: 'stroke', points: line })).toBe(round); // must take the turn first
    round = drawingTransition(round, { type: 'take-turn' }); round = drawingTransition(round, { type: 'stroke', points: line });
    expect(round.strokes).toEqual([{ player: 2, points: line }]); expect(round.cursor).toBe(3); expect(round.phase).toBe('turn-handoff');
    expect(drawingTransition(round, { type: 'stroke', points: line })).toBe(round); // one line per turn
    round = drawAll(round);
    expect(round.phase).toBe('discussion'); expect(round.strokes.map(s => s.player)).toEqual([2, 3, 0, 1, 2, 3, 0, 1]);
    expect(drawAll(revealAll(make(1))).strokes).toHaveLength(4);
  });
  it('rejects strokes that leave the canvas, are empty, or are absurdly long', () => {
    const round = drawingTransition(revealAll(make()), { type: 'take-turn' });
    expect(drawingTransition(round, { type: 'stroke', points: [] })).toBe(round);
    expect(drawingTransition(round, { type: 'stroke', points: [[1.2, 0]] })).toBe(round);
    expect(drawingTransition(round, { type: 'stroke', points: [[0, Number.NaN]] })).toBe(round);
    expect(drawingTransition(round, { type: 'stroke', points: Array.from({ length: maxStrokePoints + 1 }, () => [0.5, 0.5] as [number, number]) })).toBe(round);
    expect(drawingTransition(round, { type: 'stroke', points: [[0.5, 0.5]] }).strokes).toHaveLength(1); // a dot is a line
  });
  it('lets a caught imposter steal the win by naming the word', () => {
    const caught = voteAll(drawAll(revealAll(make())), [1, 0, 0, 0]);
    expect(caught.phase).toBe('guess');
    expect(drawingTransition(caught, { type: 'guess', word: ` ${caught.word.text.toUpperCase()} ` })).toMatchObject({ winner: 'imposter', reason: 'guessed' });
    expect(drawingTransition(caught, { type: 'guess', word: 'definitely not' })).toMatchObject({ winner: 'friends', reason: 'caught' });
    expect(drawingTransition(caught, { type: 'skip-guess' })).toMatchObject({ winner: 'friends', reason: 'caught' });
    expect(voteAll(drawAll(revealAll(make())), [1, 0, 1, 0])).toMatchObject({ winner: 'imposter', reason: 'tie' });
  });
});
