import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  // Global `use` settings applied to all projects. Enable screenshots/videos/traces on failure.
  use: {
    actionTimeout: 0,
    navigationTimeout: 30_000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    // store artifacts under test-results for easier CI uploads
    outputDir: 'test-results',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium', ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox', ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit', ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-iphone',
      use: { browserName: 'webkit', ...devices['iPhone 13'] },
    },
    {
      name: 'mobile-pixel',
      use: { browserName: 'chromium', ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'python3 -m http.server 8000',
    port: 8000,
    reuseExistingServer: false,
    timeout: 10_000,
  },
});
