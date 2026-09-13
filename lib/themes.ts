import type { Category } from './words';

// Visual themes for the themed packs: "LaughTable in costume", not a different app. A theme swaps
// the accent colours and, for the two seasonal packs, the whole palette and the card-back copy; type,
// layout and rules never change. The theme follows the selected pack (not the calendar) and is
// applied as `data-theme` on <html> by `useTheme`, with matching CSS in app/globals.css. The palette
// is duplicated there on purpose (CSS cannot import TS); tests/themes.test.ts keeps them in step.
export interface Theme {
  id: string; full: boolean;
  palette: { accent: string; accentLight: string; bg: [string, string, string]; cream: string };
  cardTitle: string; cardSubtitle: string;
}
const base = { bg: ['#2d5442', '#12302a', '#08161a'] as [string, string, string], cream: '#f3ecdd' };
export const themes: Partial<Record<Category, Theme>> = {
  halloween: { id: 'halloween', full: true, palette: { accent: '#f0953a', accentLight: '#ffc26a', bg: ['#3a2260', '#1c1233', '#0c0818'], cream: '#f6efe2' }, cardTitle: 'TRUST NO GHOUL', cardSubtitle: 'THE HAUNTED SOCIETY' },
  christmas: { id: 'christmas', full: true, palette: { accent: '#d9553f', accentLight: '#f4c988', bg: ['#1f4a33', '#0f2a1e', '#07140f'], cream: '#f6efe2' }, cardTitle: 'TRUST NO ELF', cardSubtitle: 'THE NAUGHTY LIST' },
  football: { id: 'football', full: false, palette: { ...base, accent: '#7fd36b', accentLight: '#c6f2b8' }, cardTitle: 'TRUST NO REF', cardSubtitle: 'THE AWAY END' },
  'k-pop': { id: 'k-pop', full: false, palette: { ...base, accent: '#ff5fa8', accentLight: '#ffb3d6' }, cardTitle: 'TRUST NO BIAS', cardSubtitle: 'THE FANDOM' },
  'pop-superstars': { id: 'pop-superstars', full: false, palette: { ...base, accent: '#b57bff', accentLight: '#dcc4ff' }, cardTitle: 'TRUST NO ENCORE', cardSubtitle: 'THE ERAS CLUB' },
};
export const defaultCard = { cardTitle: 'TRUST NO ONE', cardSubtitle: 'THE IMPOSTER SOCIETY' };
export function themeFor(category: Category | null | undefined): Theme | null { return (category && themes[category]) || null; }
