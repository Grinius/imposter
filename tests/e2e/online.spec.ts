import { expect, test, type Page } from '@playwright/test';

async function waitForTurn(page: Page) { await expect(page.getByRole('heading', { name: 'Discuss the clues' })).toBeVisible({ timeout: 15_000 }); }

test('three browsers complete a private online round', async ({ browser }) => {
  const contexts = await Promise.all([browser.newContext(), browser.newContext(), browser.newContext()]);
  const pages = await Promise.all(contexts.map(context => context.newPage()));
  const names = ['Alex', 'Jamie', 'Taylor'];
  await pages[0].goto('/online/'); await pages[0].getByLabel('Your name').fill(names[0]); await pages[0].getByRole('button', { name: /Create a private room/i }).click();
  const code = (await pages[0].locator('.room-code strong').textContent())!;
  for (let index = 1; index < pages.length; index += 1) { await pages[index].goto('/online/'); await pages[index].getByLabel('Your name').fill(names[index]); await pages[index].getByLabel('Room code').fill(code); await pages[index].getByRole('button', { name: /Join with code/i }).click(); }
  for (const page of pages) await expect(page.locator('.online-player')).toHaveCount(3);
  await pages[0].getByRole('button', { name: /Start the round/i }).click();
  for (const page of pages) await expect(page.locator('.online-role')).toBeVisible({ timeout: 15_000 });
  const roles = await Promise.all(pages.map(page => page.locator('.online-role').textContent())); expect(roles.filter(role => role?.includes('imposter'))).toHaveLength(1); expect(roles.filter(role => role?.includes('friend'))).toHaveLength(2); for (const [index, role] of roles.entries()) { if (index === roles.findIndex(value => value?.includes('imposter'))) expect(role).not.toContain('Secret word'); else expect(role).not.toContain('imposter'); } const imposterIndex = roles.findIndex(role => role?.includes('imposter')); const imposterName = names[imposterIndex];
  for (let turn = 0; turn < names.length; turn += 1) { let acted = false; const deadline = Date.now() + 12_000; while (!acted && Date.now() < deadline) { for (const page of pages) { const input = page.getByPlaceholder('Your clue'); if (!await input.isVisible().catch(() => false)) continue; try { await input.fill(`clue ${turn + 1}`, { timeout: 1_000 }); await page.getByRole('button', { name: /Submit clue/i }).click({ timeout: 1_000 }); acted = true; break; } catch { /* another client advanced the room; try the current turn again */ } } } expect(acted).toBe(true); }
  await expect(pages[0].getByRole('button', { name: /Start voting/i })).toBeVisible(); await pages[0].getByRole('button', { name: /Start voting/i }).click();
  for (let turn = 0; turn < names.length; turn += 1) { const page = pages[turn]; await expect(page.getByRole('button', { name: /Open my ballot/i })).toBeVisible({ timeout: 15_000 }); await page.getByRole('button', { name: /Open my ballot/i }).click(); const target = turn === imposterIndex ? names[(turn + 1) % names.length] : imposterName; await page.getByRole('button', { name: target, exact: true }).click(); }
  const imposterPage = pages[imposterIndex]; await expect(imposterPage.getByPlaceholder('Guess the secret word')).toBeVisible({ timeout: 15_000 }); await imposterPage.getByPlaceholder('Guess the secret word').fill('definitely-wrong-guess'); await imposterPage.getByRole('button', { name: /Make final guess/i }).click(); for (const page of pages) await expect(page.getByRole('heading', { name: 'Friends win!' })).toBeVisible({ timeout: 15_000 });
  await pages[0].getByRole('button', { name: /Play another round/i }).click(); await expect(pages[0].locator('.online-role')).toBeVisible({ timeout: 15_000 });
  await pages[0].evaluate(() => { const socket = (window as Window & { __imposterSocket?: WebSocket }).__imposterSocket; socket?.send(JSON.stringify({ type: 'action', round: 1, action: { type: 'start-vote' } })); }); await expect(pages[0].getByRole('alert')).toContainText(/old or inactive|not valid/i);
  await pages[1].reload(); await expect(pages[1].locator('.online-player')).toHaveCount(3, { timeout: 15_000 }); await pages[2].close(); await expect(pages[0].locator('.presence.connected')).toHaveCount(2, { timeout: 15_000 }); await Promise.all(contexts.map(context => context.close()));
});
