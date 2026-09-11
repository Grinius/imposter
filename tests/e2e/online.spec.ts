import { expect, test } from '@playwright/test';

test('three browsers complete a private online round', async ({ browser }) => {
  const contexts = await Promise.all([browser.newContext(), browser.newContext(), browser.newContext()]);
  const pages = await Promise.all(contexts.map(context => context.newPage()));
  const names = ['Alex', 'Jamie', 'Taylor'];
  await pages[0].goto('/online/'); await pages[0].getByLabel('Your name').fill(names[0]); await pages[0].getByRole('button', { name: /Create a private room/i }).click();
  const code = (await pages[0].locator('.room-code strong').textContent())!;
  // The address bar is the invite: it carries the code, and the lobby shows a QR of the same link.
  await expect(pages[0]).toHaveURL(new RegExp(`/online/\\?room=${code}$`));
  await expect(pages[0].locator('.qr-code')).toHaveAttribute('aria-label', new RegExp(code));
  // Record the room broadcasts the host's socket receives: the player list every player is sent,
  // and the only place another player's id is legitimately visible.
  await pages[0].evaluate(() => { const scope = window as Window & { __imposterSocket?: WebSocket; __rooms?: { players: { id: string; name: string }[] }[] }; scope.__rooms = []; scope.__imposterSocket?.addEventListener('message', event => { const message = JSON.parse((event as MessageEvent<string>).data) as { type: string; room?: { players: { id: string; name: string }[] } }; if (message.type === 'room' && message.room) scope.__rooms!.push(message.room); }); });
  // Jamie arrives through the pasted invite link (lower-cased, with tracking junk, as links get): the
  // code is pre-filled and the join form leads. Taylor types the code the old way.
  await pages[1].goto(`/online/?room=${code.toLowerCase()}&utm_source=chat`); await expect(pages[1].locator('.invite-note')).toContainText(code); await expect(pages[1].getByLabel('Room code')).toHaveValue(code); await pages[1].getByLabel('Your name').fill(names[1]); await pages[1].getByRole('button', { name: new RegExp(`Join room ${code}`) }).click();
  await pages[2].goto('/online/'); await pages[2].getByLabel('Your name').fill(names[2]); await pages[2].getByLabel('Room code').fill(code); await pages[2].getByRole('button', { name: /Join with code/i }).click();
  for (const page of pages) await expect(page.locator('.online-player')).toHaveCount(3);
  // A player id is public by design (it is in every room broadcast). Holding one must not be
  // enough to take that seat -- doing so would kick the real player off and hand over their role.
  const victimId = await pages[0].evaluate(() => { const scope = window as Window & { __rooms?: { players: { id: string; name: string }[] }[] }; return scope.__rooms!.at(-1)!.players.find(player => player.name === 'Jamie')!.id; });
  expect(victimId).toBeTruthy();
  const hijack = await pages[0].evaluate(async ({ code, victimId }) => await new Promise<string>(resolve => {
    const socket = new WebSocket(`${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/api/rooms/${code}`);
    socket.onopen = () => socket.send(JSON.stringify({ type: 'join', name: 'Jamie', playerId: victimId }));
    socket.onmessage = event => { const message = JSON.parse((event as MessageEvent<string>).data) as { type: string; message?: string }; if (['error', 'role', 'seat'].includes(message.type)) { resolve(`${message.type}:${message.message ?? ''}`); socket.close(); } };
    setTimeout(() => resolve('timeout'), 5_000);
  }), { code, victimId });
  expect(hijack).toMatch(/^error:.*belongs to another player/i);
  await expect(pages[0].locator('.presence.connected')).toHaveCount(3); // the real Jamie was never dropped

  await pages[0].getByRole('button', { name: /Start the round/i }).click();
  for (const page of pages) await expect(page.locator('.online-role')).toBeVisible({ timeout: 15_000 });
  const roles = await Promise.all(pages.map(page => page.locator('.online-role').textContent())); expect(roles.filter(role => role?.includes('imposter'))).toHaveLength(1); expect(roles.filter(role => role?.includes('friend'))).toHaveLength(2); for (const [index, role] of roles.entries()) { if (index === roles.findIndex(value => value?.includes('imposter'))) expect(role).not.toContain('Secret word'); else expect(role).not.toContain('imposter'); } const imposterIndex = roles.findIndex(role => role?.includes('imposter')); const imposterName = names[imposterIndex];
  // A stranger who only knows another player's public display name must not be able to steal their seat mid-round.
  const hijackContext = await browser.newContext(); const hijackPage = await hijackContext.newPage();
  await hijackPage.goto('/online/'); await hijackPage.getByLabel('Your name').fill(names[1]); await hijackPage.getByLabel('Room code').fill(code); await hijackPage.getByRole('button', { name: /Join with code/i }).click();
  await expect(hijackPage.locator('.form-error')).toContainText(/already started/i);
  await expect(pages[1].locator('.presence.connected')).toHaveCount(3, { timeout: 5_000 }); // nobody got disconnected by the impersonation attempt
  await hijackContext.close();
  // Only the player the cursor is on may speak. The UI already hides the clue box from everyone
  // else, so this bypasses it and sends the action straight down the socket.
  const offTurn = (await Promise.all(pages.map(async page => await page.getByPlaceholder('Your clue').isVisible().catch(() => false) ? null : page))).find(Boolean)!;
  await offTurn.evaluate(() => (window as Window & { __imposterSocket?: WebSocket }).__imposterSocket?.send(JSON.stringify({ type: 'action', round: 1, action: { type: 'clue', text: 'stolen turn' } })));
  await expect(offTurn.locator('.form-error')).toContainText(/not yours|not available/i);
  for (const page of pages) await expect(page.locator('.clue-list p')).toHaveCount(0);

  for (let turn = 0; turn < names.length; turn += 1) { let acted = false; const deadline = Date.now() + 12_000; while (!acted && Date.now() < deadline) { for (const page of pages) { const input = page.getByPlaceholder('Your clue'); if (!await input.isVisible().catch(() => false)) continue; try { await input.fill(`clue ${turn + 1}`, { timeout: 1_000 }); await page.getByRole('button', { name: /Submit clue/i }).click({ timeout: 1_000 }); acted = true; break; } catch { /* another client advanced the room; try the current turn again */ } } } expect(acted).toBe(true); }
  await expect(pages[0].getByRole('button', { name: /Start voting/i })).toBeVisible(); await pages[0].getByRole('button', { name: /Start voting/i }).click();
  for (let turn = 0; turn < names.length; turn += 1) { let acted = false; const deadline = Date.now() + 15_000; while (!acted && Date.now() < deadline) { for (const page of pages) { const ballot = page.getByRole('button', { name: /Open my ballot/i }); if (!await ballot.isVisible().catch(() => false)) continue; try { await ballot.click({ timeout: 1_000 }); const target = turn === imposterIndex ? names[(turn + 1) % names.length] : imposterName; await page.getByRole('button', { name: target, exact: true }).click({ timeout: 1_000 }); acted = true; break; } catch { /* another room update replaced this ballot */ } } } expect(acted).toBe(true); }
  const imposterPage = pages[imposterIndex]; await expect(imposterPage.getByPlaceholder('Guess the secret word')).toBeVisible({ timeout: 15_000 }); await imposterPage.getByPlaceholder('Guess the secret word').fill('definitely-wrong-guess'); await imposterPage.getByRole('button', { name: /Make final guess/i }).click(); for (const page of pages) await expect(page.getByRole('heading', { name: 'Friends win!' })).toBeVisible({ timeout: 15_000 });
  for (const page of pages) await expect(page.locator('.result-brand')).toContainText('laughtable.com'); // the screen that gets turned to the camera names the site
  await pages[0].getByRole('button', { name: /Play another round/i }).click(); await expect(pages[0].locator('.online-role')).toBeVisible({ timeout: 15_000 });
  await pages[0].evaluate(() => { const socket = (window as Window & { __imposterSocket?: WebSocket }).__imposterSocket; socket?.send(JSON.stringify({ type: 'action', round: 1, action: { type: 'start-vote' } })); }); await expect(pages[0].locator('.form-error')).toContainText(/old or inactive|not valid/i);
  const roleBeforeReload = await pages[1].locator('.online-role').textContent();
  await pages[1].reload(); await expect(pages[1].locator('.online-player')).toHaveCount(3, { timeout: 15_000 });
  // Reconnecting mid-round must restore the player's private role/word, not just their lobby presence.
  await expect(pages[1].locator('.online-role')).toBeVisible({ timeout: 15_000 }); expect(await pages[1].locator('.online-role').textContent()).toBe(roleBeforeReload);
  await pages[2].close(); await expect(pages[0].locator('.presence.connected')).toHaveCount(2, { timeout: 15_000 }); await Promise.all(contexts.map(context => context.close()));
});
