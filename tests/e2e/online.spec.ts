import { expect, test } from '@playwright/test';

test('three isolated browsers can join the same private room', async ({ browser, request }) => {
  const host = await browser.newContext();
  const guest = await browser.newContext();
  const third = await browser.newContext();
  const hostPage = await host.newPage();
  const guestPage = await guest.newPage();
  const thirdPage = await third.newPage();
  await hostPage.goto('/online/');
  await hostPage.getByLabel('Your name').fill('Alex');
  await hostPage.getByRole('button', { name: /Create a private room/i }).click();
  const code = hostPage.locator('.room-code strong');
  await expect(code).toHaveText(/^[A-Z0-9]{6}$/);
  const roomCode = await code.textContent();
  expect(roomCode).toBeTruthy();

  for (const [page, name] of [[guestPage, 'Jamie'], [thirdPage, 'Taylor']] as const) {
    await page.goto('/online/');
    await page.getByLabel('Your name').fill(name);
    await page.getByLabel('Room code').fill(roomCode!);
    await page.getByRole('button', { name: /Join with code/i }).click();
  }
  await expect(hostPage.locator('.online-player')).toHaveCount(3);
  await expect(guestPage.locator('.online-player')).toHaveCount(3);
  await expect(thirdPage.locator('.online-player')).toHaveCount(3);
  await expect(hostPage.getByText('Jamie')).toBeVisible();
  await expect(hostPage.getByText('Taylor')).toBeVisible();

  await host.close();
  await guest.close();
  await third.close();
  await request.dispose();
});
