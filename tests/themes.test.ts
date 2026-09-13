import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { themes } from '../lib/themes';
import { categories } from '../lib/words';

describe('pack themes', () => {
  const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
  it('exist for every themed pack and for nothing else', () => {
    const themed = categories.filter(category => category.group === 'themed').map(category => category.id).sort();
    expect(Object.keys(themes).sort()).toEqual(themed);
  });
  it('keep the CSS palette in step with the TS palette the recap image uses', () => {
    for (const theme of Object.values(themes)) {
      const block = css.match(new RegExp(`\\[data-theme=${theme.id}\\]\\{[^}]*\\}`))?.[0];
      expect(block, theme.id).toBeTruthy();
      expect(block).toContain(`--gold:${theme.palette.accent}`); expect(block).toContain(`--gold-light:${theme.palette.accentLight}`);
      if (theme.full) for (const stop of theme.palette.bg) expect(css, `${theme.id} ${stop}`).toContain(stop);
    }
  });
});
