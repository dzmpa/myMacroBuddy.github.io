import { test, expect } from '@playwright/test';

// Visual regression for the dashboard. Chromium-only to keep snapshots consistent.
// Baseline images should be committed to the repo (tests/__screenshots__/) or
// captured once locally with `npx playwright test --update-snapshots`.

test.use({ viewport: { width: 1280, height: 800 } });

test('Dashboard visual regression (Chromium)', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Run visual regression on Chromium for stable snapshots');

  await page.addInitScript(() => {
    sessionStorage.setItem('mmb_session_v1', 'support@v6fitness.app');
  });
  await page.goto('http://127.0.0.1:8000');

  // Wait for key UI to render
  await page.waitForSelector('#selectedDateLabel', { timeout: 5000 });
  await page.waitForSelector('#macroChart', { timeout: 5000 }).catch(() => {});

  // Stabilize dynamic content: remove transient attributes and disable transitions
  await page.evaluate(() => {
    // remove timestamps used for chart renders
    document.querySelectorAll('[data-rendered-at]').forEach((el) => el.removeAttribute('data-rendered-at'));
    // disable transitions and animations
    const style = document.createElement('style');
    style.id = 'pw-disable-animations';
    style.textContent = `* { transition: none !important; animation: none !important; }`;
    document.head.appendChild(style);
  });

  // Small pause to settle layout
  await page.waitForTimeout(500);

  // Full page screenshot comparison with 0.2% pixel tolerance
  await expect(page).toHaveScreenshot('dashboard-chromium.png', {
    fullPage: true,
    // Allow up to 0.2% of pixels to differ (0.002)
    maxDiffPixelRatio: 0.002,
  });
});
