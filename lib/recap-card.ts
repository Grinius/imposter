import { siteHost } from '@/components/brand';
import type { Theme } from '@/lib/themes';

// Renders a round recap as a 9:16 PNG — the shape a story or a TikTok caption card wants — from
// data the round already has. Nothing is uploaded: the image is drawn in the browser and handed to
// the share sheet or saved. Rows are generic ("Alex — hot") so the word game can list votes, the
// online room can list the typed clues, and Timer can list everyone's time.
export interface RecapRow { label: string; value: string; highlight?: boolean; }
export interface RecapData { roleLabel: string; imposter: string; secretLabel: string; secret: string; verdict: string; rowsTitle?: string; rows?: RecapRow[]; palette?: Theme['palette']; }
const width = 1080, height = 1920;
const serif = '"Cormorant Garamond", Georgia, serif', sans = '"DM Sans", Arial, sans-serif';

function wrap(context: CanvasRenderingContext2D, text: string, max: number) {
  const words = text.split(/\s+/), lines: string[] = []; let line = '';
  for (const word of words) { const next = line ? `${line} ${word}` : word; if (context.measureText(next).width > max && line) { lines.push(line); line = word; } else line = next; }
  if (line) lines.push(line); return lines;
}
function fit(context: CanvasRenderingContext2D, text: string, font: (size: number) => string, size: number, max: number, minSize: number) {
  for (let s = size; s >= minSize; s -= 4) { context.font = font(s); if (context.measureText(text).width <= max) return s; }
  return minSize;
}
export async function renderRecap(data: RecapData): Promise<Blob> {
  try { await Promise.all([document.fonts.load(`600 150px ${serif}`), document.fonts.load(`500 40px ${sans}`), document.fonts.load(`400 40px ${serif}`)]); } catch { /* system fallbacks are fine */ }
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const c = canvas.getContext('2d'); if (!c) throw new Error('Canvas unavailable');
  const { accent, accentLight, bg: stops, cream } = data.palette ?? { accent: '#cfb17b', accentLight: '#edd4a0', bg: ['#2d5442', '#12302a', '#08161a'] as [string, string, string], cream: '#f3ecdd' };
  const bg = c.createRadialGradient(540, 520, 60, 540, 700, 1500); bg.addColorStop(0, stops[0]); bg.addColorStop(.5, stops[1]); bg.addColorStop(1, stops[2]);
  c.fillStyle = bg; c.fillRect(0, 0, width, height);
  c.strokeStyle = `${accent}44`; c.lineWidth = 2; c.strokeRect(60, 60, width - 120, height - 120); c.strokeRect(78, 78, width - 156, height - 156);
  c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  const eyebrow = (text: string, y: number, color = accent) => { c.fillStyle = color; c.font = `500 30px ${sans}`; c.letterSpacing = '8px'; c.fillText(text, 540, y); c.letterSpacing = '0px'; };
  eyebrow(`IMPOSTER  ·  ${siteHost.toUpperCase()}`, 190);
  eyebrow(data.roleLabel, 420, '#b4c2b7');
  c.fillStyle = cream; const nameSize = fit(c, data.imposter, s => `600 ${s}px ${serif}`, 190, 900, 90); c.font = `600 ${nameSize}px ${serif}`; c.fillText(data.imposter, 540, 600);
  c.fillStyle = accent; c.fillRect(490, 660, 100, 2);
  eyebrow(data.secretLabel, 760, '#b4c2b7');
  c.fillStyle = accentLight; c.font = `500 84px ${serif}`; const secretLines = wrap(c, data.secret, 880).slice(0, 3); let y = 860;
  for (const line of secretLines) { c.fillText(line, 540, y); y += 92; }
  y += 30;
  if (data.rows?.length) {
    eyebrow(data.rowsTitle ?? 'HOW THE TABLE VOTED', y, '#b4c2b7'); y += 40;
    const rows = data.rows.slice(0, 20), rowH = Math.min(70, Math.floor(700 / rows.length)), size = Math.min(40, rowH - 22);
    for (const row of rows) {
      y += rowH; c.textAlign = 'left'; c.font = `${row.highlight ? 600 : 500} ${size}px ${sans}`; c.fillStyle = row.highlight ? accentLight : '#d6d9c9'; c.fillText(row.highlight ? `✦ ${row.label}` : row.label, 160, y);
      c.textAlign = 'right'; c.font = `500 ${size}px ${serif}`; c.fillStyle = row.highlight ? accentLight : cream;
      let value = row.value; while (c.measureText(value).width > 520 && value.length > 4) value = value.slice(0, -2).trimEnd() + '…'; c.fillText(value, 920, y);
      c.fillStyle = `${accent}22`; c.fillRect(160, y + 18, 760, 1);
    }
    c.textAlign = 'center'; y += 80;
  }
  c.fillStyle = cream; c.font = `400 46px ${serif}`; for (const line of wrap(c, data.verdict, 860).slice(0, 2)) { c.fillText(line, 540, Math.max(y, 1560)); y = Math.max(y, 1560) + 56; }
  eyebrow(`PLAY FREE AT ${siteHost.toUpperCase()}`, 1760); eyebrow('NO APP  ·  NO SIGN-UP', 1812, '#8b9f8f');
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not render the recap')), 'image/png'));
}
// The share sheet on a phone offers "Save Image"; elsewhere the browser downloads the file. Desktop
// browsers also expose navigator.share, but a desktop share sheet is a worse fit than a download
// and (in at least one Chrome build) its promise never settles, so only a coarse pointer gets it.
export function prefersShareSheet() {
  return typeof navigator !== 'undefined' && typeof navigator.canShare === 'function' && window.matchMedia('(pointer: coarse)').matches;
}
export async function saveRecap(data: RecapData): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const blob = await renderRecap(data); const file = new File([blob], 'imposter-recap.png', { type: 'image/png' });
  if (prefersShareSheet() && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Imposter recap' }); return 'shared'; }
    catch (cause) { if (cause instanceof DOMException && cause.name === 'AbortError') return 'cancelled'; }
  }
  const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = file.name; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000); return 'downloaded';
}
