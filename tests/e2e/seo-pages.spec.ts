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
  '/timer-imposter/',
  '/question-imposter/',
  '/drawing-imposter/',
  '/packs/',
  '/packs/halloween/',
  '/packs/football/',
  '/packs/k-pop/',
  '/packs/pop-superstars/',
  '/packs/christmas/',
  '/premium/',
  '/privacy/',
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

  await page.goto('/premium/');
  await expect(page.getByRole('heading', { name: 'Imposter premium' })).toBeVisible();
  await expect(page.getByText('Premium word packs')).toBeVisible();
  await expect(page.getByText('Custom word packs')).toBeVisible();
  // Which checkout affordance renders depends on whether NEXT_PUBLIC_STRIPE_PAYMENT_LINK was baked
  // into this build, so assert that the page offers one either way rather than pinning the build's
  // Stripe configuration — a real link once it's set, "Stripe link pending" before that.
  await expect(page.getByRole('link', { name: /Unlock with Stripe/i })
    .or(page.getByText('Stripe link pending')).first()).toBeVisible();
});

test('sitemap includes every canonical public route', async ({ page }) => {
  await page.goto('/sitemap.xml');
  const xml = await page.locator('body').innerText();
  for (const route of publicRoutes) {
    expect(xml).toContain(`https://laughtable.com${route}`);
  }
});

test('pack pages carry the full word list, the preselect link, and the home grid honours ?pack=', async ({ page }) => {
  const html = await (await page.request.get('/packs/halloween/')).text();
  expect(html).toContain('| LaughTable</title>'); expect(html).toContain('Jack-o’-lantern'); expect(html).toContain('href="/?pack=halloween"'); expect(html).toContain('href="/packs/christmas/"');
  expect((await (await page.request.get('/packs/')).text())).toContain('href="/packs/k-pop/"');
  await page.goto('/?pack=halloween');
  await expect(page.getByRole('button', { name: /^Halloween/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: /Mixed bag/ })).toHaveAttribute('aria-pressed', 'false');
  await page.goto('/?pack=bogus');
  await expect(page.getByRole('button', { name: /Mixed bag/ })).toHaveAttribute('aria-pressed', 'true');
});
