import { expect, test } from '@playwright/test';

test('seo support pages expose crawlable content and links', async ({ page }) => {
  await page.goto('/imposter-game-rules/');
  await expect(page.getByRole('heading', { name: 'Imposter game rules' })).toBeVisible();
  await expect(page.getByText('Example clues for one round')).toBeVisible();
  await expect(page.getByRole('link', { name: /Generate a game/i })).toHaveAttribute('href', '/imposter-game-generator/');

  await page.goto('/imposter-game-words/');
  await expect(page.getByRole('heading', { name: 'Imposter game words' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Food & drink' })).toBeVisible();
  await expect(page.getByText('Pizza')).toBeVisible();
  await expect(page.getByRole('link', { name: /Generate private cards/i })).toHaveAttribute('href', '/imposter-game-generator/');
});
