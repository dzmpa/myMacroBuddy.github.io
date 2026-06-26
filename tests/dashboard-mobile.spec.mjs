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

      await page.addInitScript(() => {
        sessionStorage.setItem('mmb_session_v1', 'support@v6fitness.app');
      });
      await page.goto('http://127.0.0.1:8000');
      await page.waitForLoadState('networkidle');

      const selectors = [
        '#calculateMacrosBtn',
        '#macroCalcKcal',
        '#selectedDateLabel',
        '#macroChart',
        '#macroCalcProt',
      ];

      const viewport = device.viewport || { width: 390, height: 844 };

      for (const sel of selectors) {
        const loc = page.locator(sel);

        // Scroll element into view before asserting — mobile layouts can be taller than one screen
        await loc.scrollIntoViewIfNeeded({ timeout: 5000 });
        await expect(loc).toBeVisible({ timeout: 5000 });

        const box = await loc.boundingBox();
        expect(box).not.toBeNull();

        // Element must fit within the viewport WIDTH (horizontal overflow = broken layout)
        // Height can exceed initial viewport because of vertical scrolling — only check width
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
        expect(box.width).toBeGreaterThan(0);
      }

      await context.close();
    });

    test(`${deviceName} - trophy modal is accessible and closable`, async ({ browser }) => {
      const device = devices[deviceName];
      const context = await browser.newContext({ ...device });
      const page = await context.newPage();

      await page.addInitScript(() => {
        sessionStorage.setItem('mmb_session_v1', 'support@v6fitness.app');
      });
      await page.goto('http://127.0.0.1:8000');
      await page.waitForLoadState('networkidle');

      const modal = page.locator('#trophyModal');
      const closeBtn = page.locator('#closeTrophyModalBtn');

      // The modal exists in the DOM but is hidden by default — that is correct UX
      await expect(modal).toBeAttached({ timeout: 5000 });

      // Open the modal programmatically (mirrors what toggleTrophyModal(true) does)
      await page.evaluate(async () => {
        const mod = await import('./js/trophies.js');
        mod.toggleTrophyModal(true);
      });

      await expect(modal).toBeVisible({ timeout: 2000 });
      await expect(closeBtn).toBeVisible({ timeout: 2000 });

      // Close via button click
      await closeBtn.click();

      // After close the modal must be hidden again (hidden class re-added by toggleTrophyModal)
      // Use evaluate as a fallback in case the button handler runs async
      await page.waitForTimeout(200);
      const isHidden = await page.evaluate(() => {
        const m = document.getElementById('trophyModal');
        return m ? m.classList.contains('hidden') : true;
      });
      expect(isHidden).toBe(true);

      await context.close();
    });
  });
}
