import { expect, test } from '@playwright/test';

const publicRoutes = [
  '/',
  '/imposter-game-generator/',
  '/imposter-word-generator/',
  '/imposter-game-rules/',
  '/imposter-game-words/',
  '/imposter-game-categories/',
  '/imposter-game-online/',
  '/imposter-game-strategy/',
] as const;

test('seo support pages expose crawlable content and links', async ({ page }) => {
  await page.goto('/imposter-game-rules/');
  await expect(page.getByRole('heading', { name: 'Imposter game rules' })).toBeVisible();
  await expect(page.getByText('Example clues for one round')).toBeVisible();
  await expect(page.getByRole('link', { name: /Generate a game/i })).toHaveAttribute('href', '/imposter-game-generator/');
  await expect(page.getByRole('link', { name: /Strategy guide/i })).toHaveAttribute('href', '/imposter-game-strategy/');

  await page.goto('/imposter-game-words/');
  await expect(page.getByRole('heading', { name: 'Imposter game words' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Food & drink' })).toBeVisible();
  await expect(page.getByText('Pizza')).toBeVisible();
  await expect(page.getByRole('link', { name: /Generate private cards/i })).toHaveAttribute('href', '/imposter-game-generator/');
  await expect(page.getByRole('link', { name: /Use word generator/i })).toHaveAttribute('href', '/imposter-word-generator/');

  await page.goto('/imposter-word-generator/');
  await expect(page.getByRole('heading', { name: 'Imposter word generator' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Generate one secret word' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Generate word/i })).toBeVisible();

  await page.goto('/imposter-game-categories/');
  await expect(page.getByRole('heading', { name: 'Imposter game categories' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Food & drink' })).toBeVisible();
  await expect(page.getByText('Pizza')).toBeVisible();

  await page.goto('/imposter-game-online/');
  await expect(page.getByRole('heading', { name: 'Imposter game online' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Create online room/i })).toHaveAttribute('href', '/online/');

  await page.goto('/imposter-game-strategy/');
  await expect(page.getByRole('heading', { name: 'Imposter game strategy' })).toBeVisible();
  await expect(page.getByText('Friend strategy')).toBeVisible();
});

test('sitemap includes every canonical public route', async ({ page }) => {
  await page.goto('/sitemap.xml');
  const xml = await page.locator('body').innerText();
  for (const route of publicRoutes) {
    expect(xml).toContain(`https://laughtable.com${route}`);
  }
});
