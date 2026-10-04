import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.goto('/'); });

test('Find contains focus, handles empty results and restores the trigger', async ({ page }) => {
  const trigger = page.getByRole('button', { name: /Find/ });
  await trigger.click();
  const input = page.getByRole('combobox');
  await expect(input).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(input).toBeFocused();
  await input.fill('no such destination');
  await expect(page.getByText('Nothing matches.')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(input).toHaveValue('');
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('option', { name: /Certificates/ })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('Work cards expand on hover and focus, and each card links to its repository', async ({ page }) => {
  const gallery = page.locator('[data-work-gallery]');
  await expect(gallery.locator('li')).toHaveCount(4);
  await expect(page.locator('.work-filters')).toHaveCount(0);
  const cards = gallery.getByRole('link');
  await cards.nth(2).hover();
  await expect(gallery.locator('li').nth(2)).toHaveAttribute('data-active', 'true');
  await cards.nth(3).focus();
  await expect(gallery.locator('li').nth(3)).toHaveAttribute('data-active', 'true');
  await expect(cards.nth(3)).toHaveAttribute('href', 'https://github.com/Emyol/city-sense');
  await expect(cards.nth(3)).toHaveAttribute('target', '_blank');
  await expect(gallery.locator('li').nth(2)).toContainText('BekiLang');
  await expect(gallery.locator('li').nth(3)).toContainText('CitySense');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await gallery.evaluate(node => getComputedStyle(node).transitionDuration)).toBe('0s');
});

test('Leadership shows all seven roles grouped by start year without controls', async ({ page }) => {
  const section = page.locator('#leadership');
  await expect(section.locator('h3')).toHaveText(['2023', '2024', '2025']);
  await expect(section.locator('.leadership-role')).toHaveCount(7);
  await expect(section.locator('.leadership-dates')).toHaveText([
    'Aug 2023 \u2014 Aug 2024', 'Aug 2023 \u2014 Aug 2024', 'Aug 2023 \u2014 Aug 2024',
    'Sep 2023 \u2014 Present', 'Aug 2024 \u2014 Aug 2025', 'Aug 2024 \u2014 Aug 2025', 'Aug 2025 \u2014 Aug 2026',
  ]);
  for (const role of await section.locator('.leadership-role').all()) await expect(role).toBeVisible();
  await expect(section.locator('button, [tabindex], [inert], [aria-expanded]')).toHaveCount(0);
  await expect(section.getByText(/Across my SCC roles/)).toHaveCount(1);
  await expect(section.getByText(/Across my ACM roles/)).toHaveCount(1);
});

test('Leadership content is readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:3108');
  await expect(page.locator('.leadership-role')).toHaveCount(7);
  for (const role of await page.locator('.leadership-role').all()) await expect(role).toBeVisible();
  await expect(page.locator('#hero-title')).toContainText('Hi, I');
  await context.close();
});

test('live reduced motion stops portrait rendering and finalizes metrics', async ({ page }) => {
  await page.evaluate(() => {
    const ctx = document.querySelector('canvas')!.getContext('2d')!;
    const original = ctx.clearRect.bind(ctx);
    (window as any).portraitPaints = 0;
    ctx.clearRect = (...args) => { (window as any).portraitPaints++; original(...args); };
  });
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => (window as any).portraitPaints)).toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(100);
  const count = await page.evaluate(() => (window as any).portraitPaints);
  await page.waitForTimeout(180);
  expect(await page.evaluate(() => (window as any).portraitPaints)).toBe(count);
  await expect(page.locator('[data-count="700"]')).toHaveText('700+');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
});

for (const width of [390, 768, 1440]) {
  test(`layout stays within ${width}px and hero portrait clears navigation`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(800);
    const bounds = await page.locator('.field-hero-visual').boundingBox();
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    expect(bounds!.y).toBeLessThan(180);
    expect(bounds!.height).toBeGreaterThan(400);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const id of ['about', 'credentials', 'projects', 'leadership', 'contact']) {
      await page.evaluate((id) => document.getElementById(id)!.scrollIntoView({ behavior: 'instant' }), id);
      await page.waitForTimeout(850);
      const heading = await page.locator(`#${id} h2`).boundingBox();
      expect(heading!.y).toBeGreaterThanOrEqual(70);
      expect(heading!.x + heading!.width).toBeLessThanOrEqual(width);
    }
  });
}

test('Find survives rapid shortcut reopen and backdrop dismissal', async ({ page }) => {
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('combobox')).toBeFocused();
  expect(await page.locator('.command-dialog').evaluate(node => getComputedStyle(node).transform)).toBe('none');
  expect(await page.locator('.command-dialog').evaluate(node => getComputedStyle(node).transitionDuration)).toBe('0s');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('combobox')).toBeFocused();
  await page.locator('.command-backdrop').click({ position: { x: 5, y: 5 } });
  await expect(page.getByRole('button', { name: /Find/ })).toBeFocused();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('metrics wait for viewport entry and only count once', async ({ page }) => {
  await page.evaluate(() => {
    (window as any).metricUpdates = [];
    const target = document.querySelector('[data-count="700"]')!;
    new MutationObserver(() => (window as any).metricUpdates.push(target.textContent)).observe(target, { childList: true });
  });
  await page.waitForTimeout(1100);
  expect(await page.evaluate(() => (window as any).metricUpdates.length)).toBe(0);
  await page.locator('.field-measures').scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(() => (window as any).metricUpdates.length)).toBeGreaterThan(2);
  await expect(page.locator('[data-count="700"]')).toHaveText('700+');
  const updates = await page.evaluate(() => (window as any).metricUpdates.length);
  await page.locator('#hero').scrollIntoViewIfNeeded();
  await page.locator('.field-measures').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  expect(await page.evaluate(() => (window as any).metricUpdates.length)).toBe(updates);
});

test('credential cards morph into details and restore focus on dismissal', async ({ page }) => {
  await page.locator('.credentials-gallery').scrollIntoViewIfNeeded();
  const trigger = page.getByRole('button', { name: /PMI Project Management Ready/ });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: /PMI Project Management Ready/ });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Formally evaluated in project-management fundamentals');
  await expect(dialog.locator('img')).toHaveAttribute('src', '/certificates/pmi.jpg');
  await expect(page.getByRole('button', { name: 'Close dialog' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Close dialog' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('Work selection responds promptly without animating its image filter', async ({ page }) => {
  const gallery = page.locator('[data-work-gallery]');
  await gallery.scrollIntoViewIfNeeded();
  const cards = gallery.getByRole('link');
  await cards.nth(1).hover();
  await expect(gallery.locator('li').nth(1)).toHaveAttribute('data-active', 'true');
  const transition = await gallery.evaluate(node => getComputedStyle(node).transitionDuration);
  expect(transition).toBe('0.24s');
  const imageProperties = await gallery.locator('.work-gallery-image').first().evaluate(node => getComputedStyle(node).transitionProperty);
  expect(imageProperties).not.toContain('filter');
});

test('stack marquee pauses offscreen and stops for reduced motion', async ({ page }) => {
  const track = page.locator('.infinite-slider-track');
  await track.scrollIntoViewIfNeeded();
  await expect.poll(() => track.evaluate(node => node.getAnimations()[0]?.playState)).toBe('running');
  await page.evaluate(() => document.getElementById('projects')!.scrollIntoView({ behavior: 'instant' }));
  await expect.poll(() => track.evaluate(node => node.getAnimations()[0]?.playState)).toBe('paused');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => track.evaluate(node => node.getAnimations().length)).toBe(0);
});

test('credential dialog dismisses from its backdrop and respects reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const trigger = page.getByRole('button', { name: /PMI Project Management Ready/ });
  await trigger.click();
  await expect(page.getByRole('dialog', { name: /PMI Project Management Ready/ })).toBeVisible();
  await page.locator('[data-morph-backdrop]').click({ position: { x: 5, y: 5 } });
  await expect(page.getByRole('dialog', { name: /PMI Project Management Ready/ })).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('credentials retain carousel navigation and click-to-open details on touch widths', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.locator('.credentials-gallery').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Next slide' }).click();
  await expect(page.locator('.credentials-gallery')).toContainText('02 / 06');
  await page.getByRole('button', { name: /Certified Project Manager/ }).click();
  await expect(page.getByRole('dialog', { name: /Certified Project Manager/ })).toBeVisible();
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.getByRole('button', { name: 'Previous slide' }).click();
  await expect(page.locator('.credentials-gallery')).toContainText('01 / 06');
});

test('portrait pauses offscreen and resumes on return', async ({ page }) => {
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    const ctx = document.querySelector('canvas')!.getContext('2d')!;
    const original = ctx.clearRect.bind(ctx);
    (window as any).portraitPaints = 0;
    ctx.clearRect = (...args) => { (window as any).portraitPaints++; original(...args); };
  });
  await page.evaluate(() => document.getElementById('projects')!.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(300);
  const count = await page.evaluate(() => (window as any).portraitPaints);
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => (window as any).portraitPaints)).toBe(count);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect.poll(() => page.evaluate(() => (window as any).portraitPaints)).toBeGreaterThan(count);
});

test('initial reduced motion hydrates without errors and can change live', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await expect(page.locator('.discipline-practice-grid')).toBeVisible();
  await expect(page.locator('[data-count="700"]')).toHaveText('700+');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('.discipline-marquee')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.discipline-practice-grid')).toBeVisible();
  expect(errors).toEqual([]);
});

test('live reduced motion finishes timeline entrances and they do not replay', async ({ page }) => {
  const group = page.locator('[data-leadership-year]').nth(1);
  await page.evaluate(() => document.documentElement.style.scrollBehavior = 'auto');
  await group.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    const node = document.querySelectorAll('[data-leadership-year]')[1];
    const opacity = Number(getComputedStyle(node).opacity);
    return opacity > 0.35 && opacity < 1;
  }, { }, { polling: 'raf' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(group).toHaveCSS('opacity', '1');
  await expect(group).toHaveCSS('transform', 'none');
  // Allow matchMedia cleanup to run before restoring the preference.
  await page.waitForFunction(() => !document.querySelectorAll('[data-leadership-year]')[1].getAttribute('style'));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.locator('#hero').scrollIntoViewIfNeeded();
  await group.scrollIntoViewIfNeeded();
  await expect(group).toHaveCSS('opacity', '1');
  await expect(group).toHaveCSS('transform', 'none');
});
