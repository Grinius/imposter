import { expect, test, type Page } from '@playwright/test';

// Pass-and-play variants: each is walked from setup to result on one page, including the handoff
// guard (a card cannot be opened within 650 ms of the handoff screen appearing), private reveals,
// the variant's own turn phase, ballots, and the branded result. Screenshots go to the scratchpad
// when SHOT_DIR is set so the result screens can be eyeballed.
const shots = process.env.SHOT_DIR;
async function shot(page: Page, name: string) { if (shots) await page.screenshot({ path: `${shots}/${name}.png`, fullPage: false }); }
async function revealAll(page: Page, count: number, cardText: RegExp) {
  const seen: string[] = [];
  for (let i = 0; i < count; i++) {
    const reveal = page.getByRole('button', { name: /Reveal my card/ });
    await expect(reveal).toBeDisabled(); // the 650 ms handoff guard
    await expect(reveal).toBeEnabled({ timeout: 3_000 }); await reveal.click();
    seen.push((await page.locator('.secret-word').textContent())!); expect(seen[i]).toMatch(cardText);
    await page.getByRole('button', { name: /Hide &/ }).click();
  }
  return seen;
}
async function voteAll(page: Page, names: string[], target: (voter: number) => string) {
  await page.getByRole('button', { name: /Ready to vote/ }).click();
  for (let i = 0; i < names.length; i++) {
    const open = page.getByRole('button', { name: /Open my ballot/ });
    await expect(open).toBeEnabled({ timeout: 3_000 }); await open.click();
    await page.locator('.ballot-option', { hasText: target(i) }).click();
    await page.getByRole('button', { name: /Lock in my vote/ }).click();
  }
}
// Records every analytics call so the spec can assert what left the page — and what never did.
const recordAnalytics = `window.__events = []; window.plausible = function (name, options) { window.__events.push({ name, props: options && options.props }); };`;
const names = ['Alex', 'Jamie', 'Taylor', 'Morgan'];
// The reveal stage: blank until tapped, then the roulette must land on the real imposter, then the
// secret, then a tap through to the full result.
async function watchReveal(page: Page, imposter: string, secret: RegExp) {
  await expect(page.locator('.reveal-stage')).toBeVisible();
  await expect(page.locator('.reveal-stage')).not.toContainText(imposter);
  await expect(page.locator('.reveal-stage')).toContainText('laughtable.com');
  await page.getByRole('button', { name: /Reveal the imposter/ }).click();
  await expect(page.locator('.reveal-land')).toHaveText(imposter, { timeout: 10_000 });
  await expect(page.locator('.reveal-secret')).toContainText(secret, { timeout: 5_000 });
  await shot(page, `reveal-${imposter}`);
  await page.getByRole('button', { name: /See the full result/ }).click();
  await expect(page.locator('.reveal-stage')).toHaveCount(0);
}

test('timer imposter: hidden stopwatch runs, vote, final guess, times revealed', async ({ page }) => {
  await page.route(/plausible\.io/, route => route.abort()); await page.addInitScript(recordAnalytics); // the real tag must neither load nor be contacted from a test
  await page.goto('/timer-imposter/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Timer');
  await page.getByRole('button', { name: /Start the clock/ }).click();
  const cards = await revealAll(page, 4, /The imposter|\d+\.\d\d s/);
  const imposter = names[cards.findIndex(card => card === 'The imposter')]; expect(imposter).toBeTruthy();
  const target = cards.find(card => card !== 'The imposter')!;
  for (let i = 0; i < 4; i++) {
    await page.getByRole('button', { name: /is ready/ }).click();
    await page.getByRole('button', { name: 'START' }).click();
    await expect(page.locator('.stopwatch-running')).toBeVisible();
    if (i === 0) { await page.locator('.stopwatch-running').scrollIntoViewIfNeeded(); await shot(page, 'timer-running'); }
    await expect(page.locator('.round-surface')).not.toContainText(/\d\.\d\d/); // no digits while running
    await page.waitForTimeout(200 + i * 100);
    await page.getByRole('button', { name: 'STOP' }).click();
  }
  await expect(page.getByRole('heading', { name: /Who was guessing/ })).toBeVisible();
  await voteAll(page, names, voter => names[voter] === imposter ? names.find(n => n !== imposter)! : imposter);
  await expect(page.getByRole('heading', { name: new RegExp(`One last chance, ${imposter}`) })).toBeVisible();
  await page.getByLabel(/What was the target/).fill('99');
  await page.getByRole('button', { name: /Make my final guess/ }).click();
  await watchReveal(page, imposter, new RegExp(target));
  await expect(page.getByRole('heading', { name: /The friends win/ })).toBeVisible();
  await expect(page.locator('.result-details')).toContainText(target);
  const download = page.waitForEvent('download'); await page.getByRole('button', { name: /recap image/ }).click();
  const file = await download; expect(file.suggestedFilename()).toBe('imposter-recap.png'); if (shots) await file.saveAs(`${shots}/recap-timer.png`);
  // Analytics: the four product events fired with low-cardinality props, and nothing that left the
  // page names a player, the target, or a role.
  const events = await page.evaluate(() => (window as Window & { __events?: { name: string; props?: Record<string, unknown> }[] }).__events ?? []);
  expect(events.map(event => event.name)).toEqual(['round_start', 'round_end', 'reveal_tap', 'recap_save']); // the round ends when the result exists; the reveal is watched after
  expect(events[0].props).toEqual({ mode: 'timer', pack: 'short', players: 4 });
  expect(events[1].props).toEqual({ mode: 'timer', winner: 'friends', reason: 'caught' });
  expect(events[3].props).toEqual({ mode: 'timer', outcome: 'downloaded' });
  const serialised = JSON.stringify(events); for (const name of names) expect(serialised).not.toContain(name); expect(serialised).not.toContain(target);
  // The tag's transformRequest strips a room code from any URL it is about to report.
  expect(await page.evaluate(() => (window as Window & { plausible?: { o?: { transformRequest?: (r: { u: string }) => { u: string } } } }).plausible?.o?.transformRequest?.({ u: 'https://laughtable.com/online/?room=ABC123&utm_source=x' }).u)).toBe('https://laughtable.com/online/?utm_source=x');
  await expect(page.locator('.times-list .vote-result')).toHaveCount(4);
  await expect(page.locator('.result-brand')).toContainText('laughtable.com');
  await page.locator('.result-emblem').scrollIntoViewIfNeeded(); await shot(page, 'timer-result');
});

test('question imposter: identical cards, one odd question, no final guess', async ({ page }) => {
  await page.goto('/question-imposter/');
  await page.getByRole('button', { name: /Deal the questions/ }).click();
  const cards = await revealAll(page, 4, /\?$/);
  const counts = new Map<string, number>(); for (const card of cards) counts.set(card, (counts.get(card) ?? 0) + 1);
  expect([...counts.values()].sort()).toEqual([1, 3]); // three of one question, one of the other
  const odd = names[cards.findIndex(card => counts.get(card) === 1)];
  await expect(page.getByRole('heading', { name: /Whose answer doesn/ })).toBeVisible();
  await voteAll(page, names, voter => names[voter] === odd ? names.find(n => n !== odd)! : odd);
  await watchReveal(page, odd, /\?/); // straight to the reveal: no guess phase
  await expect(page.getByRole('heading', { name: /The friends win/ })).toBeVisible();
  await expect(page.locator('.result-details')).toContainText(`${odd.toUpperCase()} WAS ASKED`);
  await expect(page.locator('.result-brand')).toContainText('laughtable.com');
  await page.locator('.result-emblem').scrollIntoViewIfNeeded(); await shot(page, 'question-result');
});

test('drawing imposter: one stroke per turn on a shared canvas, redo, vote, word guess', async ({ page }) => {
  await page.goto('/drawing-imposter/');
  await page.getByRole('button', { name: /Start drawing/ }).click();
  const cards = await revealAll(page, 4, /./);
  const imposter = names[cards.findIndex(card => card === 'The imposter')]; const word = cards.find(card => card !== 'The imposter')!;
  const draw = async (dx: number) => {
    await page.locator('.sketch-pad').scrollIntoViewIfNeeded(); const box = (await page.locator('.sketch-pad').boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * (0.3 + dx)); await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * (0.5 + dx), { steps: 8 }); await page.mouse.up();
  };
  for (let turn = 0; turn < 8; turn++) {
    await expect(page.locator('.round-surface .eyebrow')).toContainText(`LINE ${turn + 1} OF 8`);
    await page.getByRole('button', { name: /is ready to draw/ }).click();
    await draw(turn * 0.04);
    if (turn === 0) { await page.getByRole('button', { name: /Redo my line/ }).click(); await draw(0.02); } // a redo does not consume the turn
    await page.getByRole('button', { name: /Keep it & pass/ }).click();
  }
  await expect(page.getByRole('heading', { name: /Whose line didn/ })).toBeVisible();
  await page.locator('.sketch-pad').scrollIntoViewIfNeeded(); await shot(page, 'drawing-canvas');
  await expect(page.locator('.stroke-legend span')).toHaveCount(4);
  await voteAll(page, names, voter => names[voter] === imposter ? names.find(n => n !== imposter)! : imposter);
  await page.getByLabel(/What were they drawing/).fill(word.toLowerCase());
  await page.getByRole('button', { name: /Make my final guess/ }).click();
  await watchReveal(page, imposter, new RegExp(word));
  await expect(page.getByRole('heading', { name: /The imposter wins/ })).toBeVisible(); // named the word: stolen
  await expect(page.locator('.result-details')).toContainText(word);
  await expect(page.locator('.result-brand')).toContainText('laughtable.com');
  await page.locator('.result-emblem').scrollIntoViewIfNeeded(); await shot(page, 'drawing-result');
});

test('variant pages are crawlable: explainer text, titles, and links to each other', async ({ page }) => {
  for (const [path, phrase] of [['/timer-imposter/', 'How to play the Timer Imposter game'], ['/question-imposter/', 'How to play the Question Imposter game'], ['/drawing-imposter/', 'How to play the Drawing Imposter game']] as const) {
    const response = await page.request.get(path); const html = await response.text();
    expect(html).toContain(phrase); expect(html).toContain('| LaughTable</title>');
    for (const other of ['/timer-imposter/', '/question-imposter/', '/drawing-imposter/']) if (other !== path) expect(html).toContain(`href="${other}"`);
  }
  const home = await (await page.request.get('/')).text(); expect(home).toContain('href="/timer-imposter/"');
  const rules = await (await page.request.get('/imposter-game-rules/')).text(); expect(rules).toContain('href="/drawing-imposter/"');
});
