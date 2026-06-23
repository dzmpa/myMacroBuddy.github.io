import { test, expect } from '@playwright/test';

// This test uses Chrome DevTools Protocol (CDP) to emulate slow network and CPU.
// It will be skipped for non-chromium browsers.

test('Throttled network and CPU do not freeze UI (Chromium only)', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'CDP network/CPU throttling available only on Chromium');

  // Navigate to the app
  await page.goto('http://127.0.0.1:8000');

  // Create a CDP session and enable network emulation + CPU throttle
  const client = await page.context().newCDPSession(page);

  await client.send('Network.enable');
  // Emulate Slow 3G-ish conditions (latency in ms, throughput in bytes/sec)
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 200, // ms
    downloadThroughput: 200 * 1024 / 8, // ~200kbps
    uploadThroughput: 200 * 1024 / 8,
  });

  // Throttle CPU 4x slower
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  // Interact with the kcal input rapidly and ensure UI remains responsive
  const kcalInput = page.locator('#kcal');
  const kcalRemaining = page.locator('#kcalRemaining');
  const macroCanvas = page.locator('#macroChart');

  await expect(kcalInput).toBeVisible();

  // Ensure initial render timestamp exists
  const before = await macroCanvas.getAttribute('data-rendered-at');

  // Rapid typing: simulate thrash
  await kcalInput.click();
  await page.keyboard.type('1', { delay: 20 });
  await page.keyboard.type('0', { delay: 20 });
  await page.keyboard.type('0', { delay: 20 });

  // The text node should update quickly despite throttling
  await expect(kcalRemaining).not.toHaveText('--', { timeout: 2000 });

  // Charts are debounced — should update after a short delay even under throttling
  await page.waitForTimeout(1500);
  const after = await macroCanvas.getAttribute('data-rendered-at');
  expect(after).not.toBe(before);

  // Clean up: disable emulation
  // Part A complete: now verify Service Worker cache behavior under full offline

  // Ensure the Service Worker is installed and caches are populated
  const cacheKeys = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator) || !('caches' in window)) return [];
    await navigator.serviceWorker.ready;
    return await caches.keys();
  });
  expect(cacheKeys.length).toBeGreaterThan(0);

  // Emulate full offline
  await client.send('Network.emulateNetworkConditions', {
    offline: true,
    latency: 0,
    downloadThroughput: 0,
    uploadThroughput: 0,
  });

  // Reload the page while offline — the SW should serve cached assets
  await page.reload();

  // Critical UI elements should still render from cache
  const selectedDate = page.locator('#selectedDateLabel');
  await expect(selectedDate).toBeVisible();
  await expect(kcalInput).toBeVisible();

  const renderedAfterOffline = await macroCanvas.getAttribute('data-rendered-at');
  expect(renderedAfterOffline).not.toBeNull();

  // Re-enable network interception cleanup
  await client.send('Network.disable');
  await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
});
