import { test, expect } from '@playwright/test';

test('touch visitors can read every Work description before opening a repository', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const entries = page.locator('.work-gallery-content');
  await expect(entries).toHaveCount(4);
  for (const entry of await entries.all()) {
    await entry.scrollIntoViewIfNeeded();
    await expect(entry).toHaveCSS('opacity', '1');
    const bounds = await entry.boundingBox();
    const link = await entry.locator('..').boundingBox();
    expect(bounds!.y).toBeGreaterThanOrEqual(link!.y);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(link!.y + link!.height + 1);
  }
});

test('all practices remain readable on mobile without waiting for animation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const practices = page.locator('.discipline-practice-grid');
  await expect(practices).toBeVisible();
  await expect(practices.locator('.discipline-practice-card')).toHaveCount(8);
  await expect(practices.getByText('Operational leadership')).toBeVisible();
  await expect(practices.getByText('Campus logistics')).toBeVisible();
});
