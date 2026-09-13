import { describe, expect, it } from 'vitest';
import { freshPool } from '../lib/deduction';
import { readHistory, remember, type HistoryStore } from '../lib/history';
import { createRound } from '../lib/game';
import { getWords } from '../lib/words';

const memoryStore = (): HistoryStore & { data: Record<string, string> } => { const data: Record<string, string> = {}; return { data, getItem: key => data[key] ?? null, setItem: (key, value) => { data[key] = value; } }; };

describe('no-repeat drawing', () => {
  it('never deals a word the device has seen while the pack has fresh ones', () => {
    const pool = getWords('food'), seen = pool.slice(0, pool.length - 1).map(word => word.id);
    for (let i = 0; i < 50; i++) expect(createRound({ names: ['a', 'b', 'c'], category: 'food', minutes: 3, hints: true }, () => i / 50, seen).word.id).toBe(pool[pool.length - 1].id);
  });
  it('falls back to the whole pack minus the last word once everything has been seen, and to the pack itself for a one-word pool', () => {
    const pool = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    expect(freshPool(pool, ['b', 'c', 'a']).map(item => item.id)).toEqual(['b', 'c']); // 'a' was the most recent
    expect(freshPool(pool, 'c').map(item => item.id)).toEqual(['a', 'b']); // a single previous id still works
    expect(freshPool(pool, undefined)).toHaveLength(3);
    expect(freshPool([{ id: 'only' }], ['only'])).toHaveLength(1);
  });
  it('remembers ids in order, de-duplicates, caps the list, and survives junk in storage', () => {
    const store = memoryStore();
    for (const id of ['w1', 'w2', 'w3', 'w2']) remember('k', id, 3, store);
    expect(readHistory('k', store)).toEqual(['w1', 'w3', 'w2']);
    remember('k', 'w4', 3, store); expect(readHistory('k', store)).toEqual(['w3', 'w2', 'w4']);
    store.data.k = '{"not":"a list"}'; expect(readHistory('k', store)).toEqual([]);
    store.data.k = '[1, "ok", null]'; expect(readHistory('k', store)).toEqual(['ok']);
    expect(readHistory('k', null)).toEqual([]); expect(() => remember('k', 'x', 3, null)).not.toThrow();
  });
});
