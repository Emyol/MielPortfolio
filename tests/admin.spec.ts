import { test, expect } from '@playwright/test';

test('the private editor is excluded from search and never exposes editing controls anonymously', async ({ page }) => {
  await page.goto('/admin');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.getByRole('button', { name: /^publish/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^save draft/i })).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText('Application error');
});

test('anonymous requests cannot read drafts or mutate portfolio content', async ({ request, baseURL }) => {
  const headers = { origin: new URL(baseURL!).origin };
  const attempts = [
    () => request.get('/api/admin/content'),
    () => request.get('/api/admin/export'),
    () => request.put('/api/admin/content', { headers, data: { content: {}, revision: 0 } }),
    () => request.post('/api/admin/publish', { headers, data: { revision: 0 } }),
    () => request.post('/api/admin/upload', {
      headers,
      multipart: { file: { name: 'certificate.png', mimeType: 'image/png', buffer: Buffer.from('not-an-image') } },
    }),
  ];
  for (const attempt of attempts) {
    const response = await attempt();
    // An unconfigured installation is unavailable; a configured one requires authentication.
    expect([401, 403, 503]).toContain(response.status());
    expect(response.headers()['cache-control'] || '').not.toMatch(/public|s-maxage/);
  }
});

test('private preview redirects anonymous visitors to the editor entry screen', async ({ request }) => {
  const response = await request.get('/admin/preview', { maxRedirects: 0 });
  expect([303, 307, 308]).toContain(response.status());
  expect(response.headers().location).toBe('/admin');
});

test('the public portfolio still contains crawlable identity and Work content', async ({ request }) => {
  const response = await request.get('/');
  expect(response.ok()).toBeTruthy();
  const html = await response.text();
  expect(html).toMatch(/Amiel Josiah/);
  expect(html).toContain('work-gallery-content');
  expect(html).not.toMatch(/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/);
});
