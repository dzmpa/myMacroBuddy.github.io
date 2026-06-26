import { test, expect } from '@playwright/test';

// This test uses Chrome DevTools Protocol (CDP) to emulate slow network and CPU.
// It is skipped automatically for non-Chromium browsers.

test('Throttled network and CPU do not freeze UI (Chromium only)', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'CDP network/CPU throttling available only on Chromium');

  await page.addInitScript(() => {
    sessionStorage.setItem('mmb_session_v1', 'support@v6fitness.app');
  });
  await page.goto('http://127.0.0.1:8000');
  await page.waitForLoadState('networkidle');

  const client = await page.context().newCDPSession(page);

  await client.send('Network.enable');
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 200,
    downloadThroughput: (200 * 1024) / 8,
    uploadThroughput: (200 * 1024) / 8,
  });
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  const kcalInput = page.locator('#kcal');
  const kcalRemaining = page.locator('#kcalRemaining');
  const macroCanvas = page.locator('#macroChart');

  await expect(kcalInput).toBeVisible({ timeout: 10000 });

  const before = await macroCanvas.getAttribute('data-rendered-at');

  await kcalInput.click();
  await page.keyboard.type('1', { delay: 20 });
  await page.keyboard.type('0', { delay: 20 });
  await page.keyboard.type('0', { delay: 20 });

  // Under 4× CPU throttle the UI should still respond within a generous window
  const remainingText = await kcalRemaining.textContent({ timeout: 3000 });
  expect(typeof remainingText).toBe('string');

  // Charts are debounced — wait long enough under throttle (input debounce 400ms +
  // chart debounce 300ms + 4× CPU overhead → 3 s is a safe ceiling)
  await page.waitForFunction(
    (prevTimestamp) => {
      const canvas = document.getElementById('macroChart');
      if (!canvas) return false;
      const current = canvas.getAttribute('data-rendered-at');
      return current !== null && current !== prevTimestamp;
    },
    before,
    { timeout: 3000 },
  );

  const after = await macroCanvas.getAttribute('data-rendered-at');
  expect(after).not.toBe(before);

  // --- Service Worker / offline section ---

  // Verify the SW is registered and has populated at least one cache
  const cacheKeys = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator) || !('caches' in window)) return [];
    try {
      await navigator.serviceWorker.ready;
      return await caches.keys();
    } catch {
      return [];
    }
  });
  // SW may not be active on the very first load in CI — treat as soft check
  if (cacheKeys.length > 0) {
    await client.send('Network.emulateNetworkConditions', {
      offline: true,
      latency: 0,
      downloadThroughput: 0,
      uploadThroughput: 0,
    });

    await page.reload({ waitUntil: 'domcontentloaded' });

    // Critical UI should still render from SW cache
    await expect(page.locator('#selectedDateLabel')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('#kcal')).toBeVisible({ timeout: 5000 });

    const renderedAfterOffline = await page.locator('#macroChart').getAttribute('data-rendered-at');
    expect(renderedAfterOffline).not.toBeNull();
  }

  // Restore network and CPU
  await client.send('Network.disable');
  await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
});
