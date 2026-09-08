import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [['dot'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: 'http://127.0.0.1:8787', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: { command: 'npm run build && npx wrangler dev --local --port 8787 --inspector-port 0', url: 'http://127.0.0.1:8787/online/', reuseExistingServer: !process.env.CI, timeout: 120_000 },
});
