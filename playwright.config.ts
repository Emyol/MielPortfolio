import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  webServer: process.env.PREVIEW_URL ? undefined : {
    command: 'node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3108',
    url: 'http://127.0.0.1:3108',
    reuseExistingServer: true,
  },
  use: { baseURL: process.env.PREVIEW_URL || 'http://127.0.0.1:3108', channel: 'chrome', trace: 'retain-on-failure' },
});
