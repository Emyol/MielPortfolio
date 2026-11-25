import { test, expect, type Page } from '@playwright/test';

// The engine marks the page once its listeners are attached (after hydration).
const ready = (page: Page) => expect(page.locator('.dive[data-ready]')).toBeAttached();

// The Dive home page: one ocean canvas, scroll scenes, liquid-glass panels and case pages.

test('every section reads without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('.w-item h3')).toHaveCount(7);
  await expect(page.locator('#tl li')).toHaveCount(7);
  await expect(page.locator('#awards li')).toHaveCount(8);
  await expect(page.locator('#awards li.medal')).toHaveCount(4);
  await expect(page.locator('#awards li.medal').first().locator('.coin-alt')).toHaveText('1st');
  await expect(page.locator('#awards .also-item')).toHaveCount(4);
  await expect(page.locator('.cert')).toHaveCount(6);
  await expect(page.locator('#idx li')).toHaveCount(4);
  await expect(page.getByRole('heading', { name: 'Have a system' })).toBeAttached();
  await context.close();
});

for (const [width, height] of [[1360, 850], [390, 844]]) {
  test(`no horizontal overflow at ${width}px while scrolling every scene`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await ready(page);
    for (const id of ['work', 'experience', 'recognition', 'about', 'contact']) {
      await page.evaluate((s) => document.getElementById(s)!.scrollIntoView(), id);
      await page.waitForTimeout(250);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    }
    expect(errors).toEqual([]);
  });
}

test('a project opens as a full page, steps with the arrow keys, and Escape returns focus', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  await page.evaluate(() => document.getElementById('about')!.scrollIntoView());
  const trigger = page.locator('#idx button').first();
  await trigger.click();
  const view = page.locator('#view');
  await expect(view).toBeVisible();
  await expect(page.locator('#v-title')).toHaveText('KitaKo');
  await expect(view.getByRole('link', { name: /Open the repository/ })).toHaveAttribute('href', /github\.com\/Emyol\/KitaKo/);
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#v-title')).toHaveText('Homestead');
  await page.keyboard.press('Escape');
  await expect(view).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.locator('html')).not.toHaveClass(/dive-locked/);
});

test('the pinned work stage changes project as you scroll', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  const box = await page.evaluate(() => { const s = document.getElementById('work')!; return { top: s.offsetTop, h: s.offsetHeight }; });
  await page.evaluate((y) => window.scrollTo(0, y), box.top + 10);
  await expect(page.locator('.w-item.on h3')).toHaveText('KitaKo');
  await page.evaluate((b) => window.scrollTo(0, b.top + (b.h - innerHeight) * 0.99), box);
  await expect(page.locator('.w-item.on h3')).toHaveText('CitySense');
  await expect(page.locator('#w-count')).toHaveText('07 / 07');
});

test('a certificate opens with its details', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  await page.evaluate(() => document.getElementById('recognition')!.scrollIntoView());
  await page.locator('.cert').first().click({ force: true });
  await expect(page.locator('#v-title')).toHaveText(/PMI Project Management Ready/);
  await expect(page.locator('#v-kicker')).toContainText('Certificate 01');
});

test('reduced motion shows finished figures and stops the ocean loop', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await ready(page);
  await page.evaluate(() => document.querySelector('.figs')!.scrollIntoView());
  await expect(page.locator('.figs [data-count="700"]')).toHaveText('700');
  await expect(page.locator('.rv').first()).toHaveClass(/in/);
  expect(errors).toEqual([]);
  await context.close();
});

const coinSnap = (page: Page) => page.locator('canvas.coin').first().evaluate((c: HTMLCanvasElement) => c.toDataURL());

test('medals turn while on screen', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  await page.evaluate(() => document.querySelector('.rec-medals')!.scrollIntoView());
  await page.waitForTimeout(300);
  const a = await coinSnap(page);
  await page.waitForTimeout(400);
  expect(a).not.toEqual(await coinSnap(page));
  const blank = await page.locator('canvas.coin').first().evaluate((c: HTMLCanvasElement) => { const b = document.createElement('canvas'); b.width = c.width; b.height = c.height; return b.toDataURL(); });
  expect(a).not.toEqual(blank);
});

test('reduced motion keeps medals still and drawn', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  await ready(page);
  await page.evaluate(() => document.querySelector('.rec-medals')!.scrollIntoView());
  await page.waitForTimeout(300);
  const a = await coinSnap(page);
  await page.waitForTimeout(400);
  expect(await coinSnap(page)).toEqual(a);
  const blank = await page.locator('canvas.coin').first().evaluate((c: HTMLCanvasElement) => { const b = document.createElement('canvas'); b.width = c.width; b.height = c.height; return b.toDataURL(); });
  expect(a).not.toEqual(blank);
  await context.close();
});
