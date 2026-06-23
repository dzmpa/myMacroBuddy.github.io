import { test, expect } from '@playwright/test';

test.describe('Dashboard input debounce and granular updates', () => {
  test('kcal input updates immediate text and charts are debounced', async ({ page }) => {
    await page.goto('http://127.0.0.1:8000');

    // Ensure the kcal input is present
    const kcalInput = page.locator('#kcal');
    await expect(kcalInput).toBeVisible();

    // Read initial kcalRemaining and macroChart render timestamp (if any)
    const kcalRemaining = page.locator('#kcalRemaining');
    const macroCanvas = page.locator('#macroChart');

    const beforeRendered = await macroCanvas.getAttribute('data-rendered-at');

    // Simulate fast typing into the kcal input
    await kcalInput.click();
    await page.keyboard.type('1');
    await page.keyboard.type('0');
    await page.keyboard.type('0');

    // Immediately the kcalRemaining text should reflect the input (or at least change)
    await expect(kcalRemaining).not.toHaveText('--', { timeout: 1000 });

    // Chart should NOT have updated immediately (still same data-rendered-at)
    const soonRendered = await macroCanvas.getAttribute('data-rendered-at');
    expect(soonRendered).toBe(beforeRendered);

    // Wait longer than debounce (>= 350ms)
    await page.waitForTimeout(400);

    // Now the chart should have a new render timestamp
    const afterRendered = await macroCanvas.getAttribute('data-rendered-at');
    expect(afterRendered).not.toBe(beforeRendered);
  });

  test('updating water does not re-render selected date label', async ({ page }) => {
    await page.goto('http://127.0.0.1:8000');

    const aguaInput = page.locator('#agua');
    const selectedDateLabel = page.locator('#selectedDateLabel');

    await expect(aguaInput).toBeVisible();
    const before = await selectedDateLabel.innerHTML();

    await aguaInput.fill('2');
    // allow debounce/processing to settle
    await page.waitForTimeout(150);

    const after = await selectedDateLabel.innerHTML();
    expect(after).toBe(before);
  });
});
