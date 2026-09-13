import { describe, expect, it } from 'vitest';
import { extractCheckoutSessionId } from '../lib/premium';

describe('extractCheckoutSessionId', () => {
  it('accepts a bare live or test session id', () => {
    expect(extractCheckoutSessionId('cs_live_a1W08AOKgfUm')).toBe('cs_live_a1W08AOKgfUm');
    expect(extractCheckoutSessionId('cs_test_abc123')).toBe('cs_test_abc123');
  });
  it('pulls the id out of the post-checkout URL, with or without surrounding noise', () => {
    expect(extractCheckoutSessionId('https://laughtable.com/premium/success/?session_id=cs_live_a1W08AOKgfUm')).toBe('cs_live_a1W08AOKgfUm');
    expect(extractCheckoutSessionId('  https://laughtable.com/premium/success/?session_id=cs_live_a1W08AOKgfUm&utm_source=x. ')).toBe('cs_live_a1W08AOKgfUm');
    expect(extractCheckoutSessionId('Here is my link: laughtable.com/premium/success/?session_id=cs_live_a1W08AOKgfUm')).toBe('cs_live_a1W08AOKgfUm');
  });
  it('returns null when nothing resembles a session id', () => {
    expect(extractCheckoutSessionId('')).toBeNull();
    expect(extractCheckoutSessionId('https://laughtable.com/premium/')).toBeNull();
    expect(extractCheckoutSessionId('pi_3Nabc')).toBeNull();
    expect(extractCheckoutSessionId('cs_live_')).toBeNull();
  });
});
