import { describe, expect, it } from 'vitest';
import { categories, getWords, words } from '../lib/words';
import { categoryFromSearch, packBySlug, packWords, packs } from '../lib/packs';

describe('themed packs', () => {
  it('ships every themed category as a free pack with a page, at least 40 unique words each', () => {
    const themed = categories.filter(category => category.group === 'themed');
    expect(themed.length).toBe(5);
    for (const category of themed) {
      const pack = packs.find(pack => pack.id === category.id); expect(pack, category.id).toBeTruthy();
      expect(category.premium).toBe(false);
      const list = packWords(pack!); expect(list.length, category.id).toBeGreaterThanOrEqual(40);
      expect(new Set(list.map(word => word.text.toLowerCase())).size).toBe(list.length);
    }
    expect(new Set(words.map(word => word.id)).size).toBe(words.length);
  });
  it('keeps Mixed bag to free core packs: no premium words and no themed words', () => {
    const mixed = new Set(getWords('mixed').map(word => word.category));
    expect([...mixed].sort()).toEqual(['animals', 'food']);
  });
  it('resolves pack slugs and the ?pack= preselect, ignoring junk', () => {
    expect(packBySlug('halloween')?.id).toBe('halloween'); expect(packBySlug('nope')).toBeNull();
    expect(categoryFromSearch('?pack=christmas&utm_source=x')).toBe('christmas');
    expect(categoryFromSearch('?pack=places')).toBe('places');
    expect(categoryFromSearch('?pack=<script>')).toBeNull(); expect(categoryFromSearch('')).toBeNull();
  });
});
