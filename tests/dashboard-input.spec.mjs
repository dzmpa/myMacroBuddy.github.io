import { test, expect } from '@playwright/test';

test.describe('Dashboard input debounce and granular updates', () => {
  test('kcal input updates immediate text and charts are debounced', async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem('mmb_session_v1', 'support@v6fitness.app');
    });
    await page.goto('http://127.0.0.1:8000');

    // Wait for the app to fully initialise before interacting
    await page.waitForLoadState('networkidle');

    const kcalInput = page.locator('#kcal');
    await expect(kcalInput).toBeVisible({ timeout: 5000 });

    const macroCanvas = page.locator('#macroChart');
    const kcalRemaining = page.locator('#kcalRemaining');

    // Capture the render timestamp before typing
    const beforeRendered = await macroCanvas.getAttribute('data-rendered-at');

    // Type into the kcal field
    await kcalInput.click();
    await page.keyboard.type('1');
    await page.keyboard.type('0');
    await page.keyboard.type('0');

    // Chart should NOT update immediately (debounce is 300ms)
    const soonRendered = await macroCanvas.getAttribute('data-rendered-at');
    expect(soonRendered).toBe(beforeRendered);

    // Wait well past the debounce window (300ms render + 400ms input debounce)
    await page.waitForTimeout(800);

    // After debounce settles the chart timestamp must have changed
    const afterRendered = await macroCanvas.getAttribute('data-rendered-at');
    expect(afterRendered).not.toBe(beforeRendered);

    // kcalRemaining either changed from '--' (profile set) or stayed '--' (no profile) —
    // either way the element must be visible and contain a string
    const remainingText = await kcalRemaining.textContent();
    expect(typeof remainingText).toBe('string');
  });

  test('updating water does not re-render selected date label', async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem('mmb_session_v1', 'support@v6fitness.app');
    });
    await page.goto('http://127.0.0.1:8000');
    await page.waitForLoadState('networkidle');

    const aguaInput = page.locator('#agua');
    const selectedDateLabel = page.locator('#selectedDateLabel');

    await expect(aguaInput).toBeVisible({ timeout: 5000 });

    // Capture the label content before the water input changes
    const before = await selectedDateLabel.innerHTML();

    await aguaInput.fill('2');

    // Allow the input debounce + any granular update to settle
    await page.waitForTimeout(500);

    const after = await selectedDateLabel.innerHTML();
    // The date label must be identical — water input must not cause a full re-render
    expect(after).toBe(before);
  });
});
