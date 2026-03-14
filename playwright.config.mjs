import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://127.0.0.1:4173';
const API_URL = process.env.E2E_API_URL || 'http://127.0.0.1:7000/api/v1';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 120_000,
  expect: {
    timeout: 15_000
  },
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/playwright-report.json' }]
  ],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: [
    {
      command: 'npm start',
      cwd: '../ledgerly-backend',
      url: 'http://127.0.0.1:7000/health',
      timeout: 180_000,
      reuseExistingServer: true
    },
    {
      command: `npm run build && npx vite preview --host 127.0.0.1 --port 4173 --strictPort`,
      cwd: '.',
      url: BASE_URL,
      timeout: 300_000,
      reuseExistingServer: true,
      env: {
        ...process.env,
        VITE_API_URL: API_URL
      }
    }
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
