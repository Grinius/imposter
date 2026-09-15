// Renders the four /press/ screenshots by walking one pass-and-play round on a phone-sized
// viewport against a running site. Usage: BASE_URL=http://localhost:3000 node scripts/press-shots.mjs
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const base = process.env.BASE_URL ?? 'http://localhost:3000';
const outDir = new URL('../public/press/', import.meta.url).pathname;
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
await context.route(/plausible\.io/, route => route.abort());
const page = await context.newPage();
async function save(name) {
  const png = await page.screenshot({ fullPage: false });
  await sharp(png).png({ compressionLevel: 9, palette: true }).toFile(`${outDir}${name}.png`);
  await sharp(png).webp({ quality: 82 }).toFile(`${outDir}${name}.webp`);
  console.log('saved', name);
}

await page.goto(`${base}/`);
await page.waitForLoadState('networkidle');
await save('01-setup');

const names = ['Alex', 'Jamie', 'Taylor', 'Morgan'];
// Trim or extend the remembered player list to exactly four, then name them.
while (await page.getByLabel(/^Player \d+ name$/).count() > names.length) await page.getByRole('button', { name: /Remove player/ }).last().click();
while (await page.getByLabel(/^Player \d+ name$/).count() < names.length) await page.getByRole('button', { name: /Add a player/ }).click();
for (let i = 0; i < names.length; i++) await page.getByLabel(`Player ${i + 1} name`).fill(names[i]);
await page.getByRole('button', { name: /^Food/ }).click().catch(() => {});
await page.getByRole('button', { name: /Let the bluffing begin/ }).click();

// Reveal cards until a friend's card is on screen (the secret word, not the imposter role).
let shotCard = false;
for (let i = 0; i < names.length; i++) {
  const reveal = page.getByRole('button', { name: /Reveal my card/ });
  await reveal.waitFor(); await page.waitForTimeout(800); await reveal.click();
  const text = await page.locator('.secret-word').textContent();
  if (!shotCard && !/imposter/i.test(text ?? '')) { await page.waitForTimeout(400); await save('02-secret-card'); shotCard = true; }
  await page.getByRole('button', { name: /Hide &/ }).click();
}
await page.getByRole('button', { name: /Ready to vote/ }).click();
const open = page.getByRole('button', { name: /Open my ballot/ });
await open.waitFor(); await page.waitForTimeout(800); await open.click();
await page.locator('.ballot-option', { hasText: 'Jamie' }).click();
await page.waitForTimeout(300);
await save('03-vote');
for (let i = 0; i < names.length; i++) {
  if (i > 0) { const again = page.getByRole('button', { name: /Open my ballot/ }); await again.waitFor(); await page.waitForTimeout(800); await again.click(); await page.locator('.ballot-option').first().click(); }
  await page.getByRole('button', { name: /Lock in my vote/ }).click();
}
// Final guess (if the imposter was caught) or straight to the reveal.
const skip = page.getByRole('button', { name: /Reveal the word/ });
if (await skip.isVisible().catch(() => false)) await skip.click();
await page.getByRole('button', { name: /Reveal the imposter/ }).click();
await page.locator('.reveal-secret').waitFor({ timeout: 10_000 });
await page.waitForTimeout(600);
await save('04-reveal');
await browser.close();
