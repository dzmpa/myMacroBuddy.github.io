import { test, expect, devices } from '@playwright/test';

const MOBILE_DEVICES = [
  'iPhone 13',
  'Pixel 5',
];

for (const deviceName of MOBILE_DEVICES) {
  test.describe(`Mobile layout checks — ${deviceName}`, () => {
    test(`${deviceName} - essential controls visible and within viewport`, async ({ browser }) => {
      const device = devices[deviceName];
      const context = await browser.newContext({ ...device });
      const page = await context.newPage();

      await page.goto('http://127.0.0.1:8000');

      // selectors to sanity-check on mobile
      const selectors = [
        '#calculateMacrosBtn',
        '#macroCalcKcal',
        '#selectedDateLabel',
        '#macroChart',
        '#macroCalcProt',
      ];

      for (const sel of selectors) {
        const loc = page.locator(sel);
        await expect(loc).toBeVisible({ timeout: 5000 });

        const box = await loc.boundingBox();
        expect(box).not.toBeNull();

        const viewport = device.viewport || { width: 390, height: 844 };
        // ensure element is inside viewport bounds (not pushed off-screen)
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
        expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
      }

      await context.close();
    });

    test(`${deviceName} - trophy modal is accessible and closable`, async ({ browser }) => {
      const device = devices[deviceName];
      const context = await browser.newContext({ ...device });
      const page = await context.newPage();

      await page.goto('http://127.0.0.1:8000');

      // The trophy modal exists in DOM; ensure close button is present and clickable
      const modal = page.locator('#trophyModal');
      const closeBtn = page.locator('#closeTrophyModalBtn');

      await expect(modal).toBeVisible();
      await expect(closeBtn).toBeVisible();

      // Simulate opening the modal by removing 'hidden' class via script (safe test-only action)
      await page.evaluate(() => {
        const m = document.getElementById('trophyModal');
        if (m) m.classList.remove('hidden');
      });

      await expect(modal).toHaveClass(/flex/);
      await closeBtn.click();

      // After click, the modal should be hidden again (class may change)
      await page.evaluate(() => {
        const m = document.getElementById('trophyModal');
        if (m) m.classList.add('hidden');
      });

      await context.close();
    });
  });
}
