import { describe, expect, it } from 'vitest';
import { safeProps, scrubUrl } from '../lib/analytics';

describe('analytics guardrails', () => {
  it('forwards only whitelisted, low-cardinality props and drops anything that could be a secret', () => {
    const leaky = { name: 'round_start', mode: 'word', players: 4, pack: 'halloween', word: 'Pizza', names: ['Alex', 'Jamie'], role: 'imposter', clue: 'hot', roomId: 'ABC123', question: 'How many?', reason: 'x'.repeat(41), extra: { nested: 1 } };
    expect(safeProps(leaky)).toEqual({ mode: 'word', players: 4, pack: 'halloween' });
    expect(safeProps({ name: 'paywall_shown', reason: '6 players' })).toEqual({ reason: '6 players' });
  });
  it('strips room codes from pageview URLs and leaves everything else alone', () => {
    expect(scrubUrl('https://laughtable.com/online/?room=ABC123')).toBe('https://laughtable.com/online/');
    expect(scrubUrl('https://laughtable.com/online/?room=abc123&utm_source=tiktok')).toBe('https://laughtable.com/online/?utm_source=tiktok');
    expect(scrubUrl('https://laughtable.com/online/?utm_source=tiktok&room=ABC123')).toBe('https://laughtable.com/online/?utm_source=tiktok');
    expect(scrubUrl('https://laughtable.com/?pack=halloween')).toBe('https://laughtable.com/?pack=halloween');
    expect(scrubUrl('https://laughtable.com/packs/halloween/')).toBe('https://laughtable.com/packs/halloween/');
  });
});
