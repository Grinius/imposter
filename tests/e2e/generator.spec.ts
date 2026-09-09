import { expect, test } from '@playwright/test';

test('imposter game generator creates private cards', async ({ page }) => {
  await page.goto('/imposter-game-generator/');
  await expect(page.getByRole('heading', { name: 'Imposter game generator' })).toBeVisible();
  await expect(page.getByText('Generate an imposter game in seconds.')).toBeVisible();
  await expect(page.getByText('Premium word packs')).toBeVisible();
  await expect(page.getByText('Secret word ready')).toHaveCount(0);
  await expect(page.getByText('4 / 5')).toBeVisible();
  await page.getByRole('button', { name: /Add player/i }).click();
  await expect(page.getByText('5 / 5')).toBeVisible();
  await expect(page.getByRole('button', { name: /Add player/i })).toBeDisabled();

  await page.getByRole('button', { name: /Generate roles/i }).click();
  await expect(page.getByText('Secret word ready')).toBeVisible();
  await expect(page.locator('.generator-card')).toHaveCount(5);

  const revealedRoles: string[] = [];
  for (const name of ['Alex', 'Jamie', 'Taylor', 'Morgan', 'Player 5']) {
    await page.locator('.generator-card', { hasText: name }).click();
    const openCard = page.locator('.generator-card.open');
    await expect(openCard).toBeVisible();
    revealedRoles.push((await openCard.textContent()) ?? '');
  }

  expect(revealedRoles.filter(text => text.includes('The imposter'))).toHaveLength(1);
  expect(revealedRoles.filter(text => !text.includes('The imposter'))).toHaveLength(4);
});
