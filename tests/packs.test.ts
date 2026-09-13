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
    expect([...mixed].sort()).toEqual(['animals', 'everyday', 'food']);
    expect(getWords('mixed').length).toBeGreaterThanOrEqual(250);
  });
  it('gives every pack enough words for a long night, unique within the pack and within Mixed bag', () => {
    const minimum: Record<string, number> = { food: 80, animals: 80, everyday: 100, places: 80, objects: 80, activities: 80, 'date-night': 48, holidays: 48, halloween: 48, football: 64, 'k-pop': 64, 'pop-superstars': 64, christmas: 48 };
    for (const category of categories.filter(c => c.id !== 'mixed')) {
      const list = getWords(category.id); expect(list.length, category.id).toBeGreaterThanOrEqual(minimum[category.id]);
      expect(new Set(list.map(w => w.text.toLowerCase())).size, `${category.id} duplicates`).toBe(list.length);
    }
    const mixed = getWords('mixed').map(w => w.text.toLowerCase()); expect(new Set(mixed).size, 'Mixed bag duplicates').toBe(mixed.length);
  });
  it('resolves pack slugs and the ?pack= preselect, ignoring junk', () => {
    expect(packBySlug('halloween')?.id).toBe('halloween'); expect(packBySlug('nope')).toBeNull();
    expect(categoryFromSearch('?pack=christmas&utm_source=x')).toBe('christmas');
    expect(categoryFromSearch('?pack=places')).toBe('places');
    expect(categoryFromSearch('?pack=<script>')).toBeNull(); expect(categoryFromSearch('')).toBeNull();
  });
});
