# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard-throttle.spec.mjs >> Throttled network and CPU do not freeze UI (Chromium only)
- Location: tests/dashboard-throttle.spec.mjs:6:1

# Error details

```
TimeoutError: page.waitForFunction: Timeout 3000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - main [ref=e4]:
      - generic [ref=e6]:
        - paragraph [ref=e7]: Selected date
        - paragraph [ref=e8]: —
      - generic [ref=e10]:
        - generic [ref=e12]:
          - generic [ref=e13]:
            - paragraph [ref=e14]: myMacroBuddy
            - heading "Macro Calculator" [level=1] [ref=e15]
            - paragraph [ref=e16]: Start with a simple daily macro target calculator. Food logging, search, and planning still live below when you need them.
          - generic [ref=e17]:
            - generic [ref=e18]:
              - button "Calculate" [ref=e19] [cursor=pointer]
              - button "Trophies" [ref=e20] [cursor=pointer]
            - generic [ref=e21]:
              - generic [ref=e22]:
                - paragraph [ref=e23]: Calories left
                - paragraph [ref=e24]: "0"
                - paragraph [ref=e25]: remaining kcal
              - generic [ref=e26]:
                - paragraph [ref=e27]: Water
                - paragraph [ref=e28]: "--"
                - paragraph [ref=e29]: liters per day
              - generic [ref=e30]:
                - paragraph [ref=e31]: Per meal split
                - paragraph [ref=e32]: Add your stats first to see an easy per-meal breakdown.
        - generic [ref=e33]:
          - generic [ref=e34]:
            - paragraph [ref=e35]: Kcal
            - paragraph [ref=e36]: "--"
          - generic [ref=e37]:
            - paragraph [ref=e38]: Protein
            - paragraph [ref=e39]: "--"
          - generic [ref=e40]:
            - paragraph [ref=e41]: Carb
            - paragraph [ref=e42]: "--"
          - generic [ref=e43]:
            - paragraph [ref=e44]: Fat
            - paragraph [ref=e45]: "--"
          - generic [ref=e46]:
            - paragraph [ref=e47]: Fiber
            - paragraph [ref=e48]: "--"
        - generic [ref=e49]:
          - paragraph [ref=e50]: Recommendation
          - paragraph [ref=e51]: Recommendation will appear here
          - paragraph [ref=e52]: Add neck, waist, and hip for female entries to get the American Navy body-fat estimate and a recommendation.
    - generic [ref=e53]:
      - generic [ref=e54]:
        - paragraph [ref=e55]: Today
        - heading "Log today and track progress" [level=2] [ref=e56]
        - paragraph [ref=e57]: "Everything important for today lives here: remaining targets, quick logging, and your day foods."
      - generic [ref=e59]:
        - generic [ref=e60]:
          - generic [ref=e61]:
            - generic [ref=e62]:
              - paragraph [ref=e63]: Daily dashboard
              - heading "Day summary" [level=3] [ref=e64]
            - generic [ref=e65]:
              - paragraph [ref=e66]: Calories left
              - paragraph [ref=e67]: "0"
          - generic [ref=e68]:
            - generic [ref=e69]:
              - paragraph [ref=e70]: Calorie status
              - paragraph
            - generic [ref=e71]:
              - paragraph [ref=e72]: Macros
              - paragraph
            - generic [ref=e73]:
              - paragraph [ref=e74]: Day
              - paragraph
            - generic [ref=e75]:
              - paragraph [ref=e76]: Active targets
              - paragraph
          - generic [ref=e77]:
            - generic [ref=e78]:
              - text: Kcal
              - spinbutton "Kcal" [active] [ref=e79]: "100"
            - generic [ref=e80]:
              - text: Protein
              - spinbutton "Protein" [ref=e81]
            - generic [ref=e82]:
              - text: Carbs
              - spinbutton "Carbs" [ref=e83]
            - generic [ref=e84]:
              - text: Fat
              - spinbutton "Fat" [ref=e85]
            - generic [ref=e86]:
              - text: Weight
              - spinbutton "Weight" [ref=e87]
            - generic [ref=e88]:
              - text: Water
              - spinbutton "Water" [ref=e89]
            - generic [ref=e90]:
              - text: Fiber
              - spinbutton "Fiber" [ref=e91]
            - generic [ref=e92]:
              - text: Day type
              - combobox "Day type" [ref=e93]:
                - option "normal" [selected]
                - option "training"
                - option "rest"
          - generic [ref=e95]:
            - paragraph [ref=e96]: Context and insight
            - paragraph [ref=e97]: normal
            - paragraph [ref=e98]: "Adaptive TDEE: not enough data yet."
          - generic [ref=e100]:
            - generic [ref=e101]:
              - text: Notes
              - textbox "Notes" [ref=e102]:
                - /placeholder: How did today go?
            - generic [ref=e103]:
              - paragraph [ref=e104]: Notes preview
              - paragraph [ref=e105]: No notes saved for this day.
        - generic [ref=e107]:
          - generic [ref=e108]:
            - paragraph [ref=e109]: Food log
            - generic [ref=e110]:
              - heading "Quick log" [level=3] [ref=e111]
              - button "Copy previous day" [ref=e112] [cursor=pointer]
            - paragraph [ref=e113]: Copies food, notes, and daily metrics from the previous calendar day.
          - generic [ref=e114]:
            - combobox [ref=e115]
            - spinbutton [ref=e116]
            - button "Add" [ref=e117] [cursor=pointer]
          - list
    - generic [ref=e118]:
      - generic [ref=e119]:
        - paragraph [ref=e120]: Add foods
        - heading "Search, pick, and log" [level=2] [ref=e121]
        - paragraph [ref=e122]: One fast flow for local matches first and Open Food Facts pages for everything else.
      - generic [ref=e123]:
        - generic [ref=e124]:
          - textbox "Search chicken, rice, oats, yogurt, or paste an Open Food Facts link..." [ref=e125]
          - button "Search" [ref=e126] [cursor=pointer]
        - generic [ref=e127]:
          - generic [ref=e128]: "`Enter` runs search"
          - generic [ref=e129]: Open Food Facts powers external food search
          - generic [ref=e130]: Barcode import stays optional
          - generic [ref=e131]: Browse more with Previous and Next page
          - generic [ref=e132]: Open Food Facts product links work too
        - paragraph [ref=e133]: Search foods by name, barcode, or paste an Open Food Facts product link.
    - generic [ref=e134]:
      - generic [ref=e135]:
        - paragraph [ref=e136]: Suggestions
        - heading "Plan the rest of the day" [level=2] [ref=e137]
      - generic [ref=e139]:
        - generic [ref=e140]:
          - paragraph [ref=e141]: Meal planner
          - heading "Suggestions for the rest of the day" [level=3] [ref=e142]
        - button "Refresh plan" [ref=e143] [cursor=pointer]
    - generic [ref=e144]:
      - generic [ref=e145]:
        - paragraph [ref=e146]: Progress
        - heading "History and trend" [level=2] [ref=e147]
      - generic [ref=e148]:
        - generic [ref=e149]:
          - generic [ref=e150]:
            - generic [ref=e151]:
              - paragraph [ref=e152]: Calendar
              - heading "Day navigation" [level=3] [ref=e153]
            - generic [ref=e154]:
              - button "Previous" [ref=e155] [cursor=pointer]
              - button "Next" [ref=e156] [cursor=pointer]
          - paragraph
        - generic [ref=e157]:
          - generic [ref=e159]:
            - paragraph [ref=e160]: Charts
            - heading "Weight trend" [level=3] [ref=e161]
          - generic [ref=e165]:
            - paragraph [ref=e166]: Charts
            - heading "Day macros" [level=3] [ref=e167]
    - group [ref=e170]:
      - generic "Settings Database, APIs, and setup Expand to manage profile, foods, recipes, and backups" [ref=e171] [cursor=pointer]:
        - generic [ref=e172]:
          - generic [ref=e173]:
            - paragraph [ref=e174]: Settings
            - heading "Database, APIs, and setup" [level=2] [ref=e175]
          - generic [ref=e176]: Expand to manage profile, foods, recipes, and backups
  - navigation [ref=e177]:
    - button "🏠" [ref=e178] [cursor=pointer]
    - button "📅" [ref=e179] [cursor=pointer]
    - button "⚙️" [ref=e180] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | // This test uses Chrome DevTools Protocol (CDP) to emulate slow network and CPU.
  4  | // It is skipped automatically for non-Chromium browsers.
  5  | 
  6  | test('Throttled network and CPU do not freeze UI (Chromium only)', async ({ page, browserName }) => {
  7  |   test.skip(browserName !== 'chromium', 'CDP network/CPU throttling available only on Chromium');
  8  | 
  9  |   await page.goto('http://127.0.0.1:8000');
  10 |   await page.waitForLoadState('networkidle');
  11 | 
  12 |   const client = await page.context().newCDPSession(page);
  13 | 
  14 |   await client.send('Network.enable');
  15 |   await client.send('Network.emulateNetworkConditions', {
  16 |     offline: false,
  17 |     latency: 200,
  18 |     downloadThroughput: (200 * 1024) / 8,
  19 |     uploadThroughput: (200 * 1024) / 8,
  20 |   });
  21 |   await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  22 | 
  23 |   const kcalInput = page.locator('#kcal');
  24 |   const kcalRemaining = page.locator('#kcalRemaining');
  25 |   const macroCanvas = page.locator('#macroChart');
  26 | 
  27 |   await expect(kcalInput).toBeVisible({ timeout: 10000 });
  28 | 
  29 |   const before = await macroCanvas.getAttribute('data-rendered-at');
  30 | 
  31 |   await kcalInput.click();
  32 |   await page.keyboard.type('1', { delay: 20 });
  33 |   await page.keyboard.type('0', { delay: 20 });
  34 |   await page.keyboard.type('0', { delay: 20 });
  35 | 
  36 |   // Under 4× CPU throttle the UI should still respond within a generous window
  37 |   const remainingText = await kcalRemaining.textContent({ timeout: 3000 });
  38 |   expect(typeof remainingText).toBe('string');
  39 | 
  40 |   // Charts are debounced — wait long enough under throttle (input debounce 400ms +
  41 |   // chart debounce 300ms + 4× CPU overhead → 3 s is a safe ceiling)
> 42 |   await page.waitForFunction(
     |              ^ TimeoutError: page.waitForFunction: Timeout 3000ms exceeded.
  43 |     (prevTimestamp) => {
  44 |       const canvas = document.getElementById('macroChart');
  45 |       if (!canvas) return false;
  46 |       const current = canvas.getAttribute('data-rendered-at');
  47 |       return current !== null && current !== prevTimestamp;
  48 |     },
  49 |     before,
  50 |     { timeout: 3000 },
  51 |   );
  52 | 
  53 |   const after = await macroCanvas.getAttribute('data-rendered-at');
  54 |   expect(after).not.toBe(before);
  55 | 
  56 |   // --- Service Worker / offline section ---
  57 | 
  58 |   // Verify the SW is registered and has populated at least one cache
  59 |   const cacheKeys = await page.evaluate(async () => {
  60 |     if (!('serviceWorker' in navigator) || !('caches' in window)) return [];
  61 |     try {
  62 |       await navigator.serviceWorker.ready;
  63 |       return await caches.keys();
  64 |     } catch {
  65 |       return [];
  66 |     }
  67 |   });
  68 |   // SW may not be active on the very first load in CI — treat as soft check
  69 |   if (cacheKeys.length > 0) {
  70 |     await client.send('Network.emulateNetworkConditions', {
  71 |       offline: true,
  72 |       latency: 0,
  73 |       downloadThroughput: 0,
  74 |       uploadThroughput: 0,
  75 |     });
  76 | 
  77 |     await page.reload({ waitUntil: 'domcontentloaded' });
  78 | 
  79 |     // Critical UI should still render from SW cache
  80 |     await expect(page.locator('#selectedDateLabel')).toBeVisible({ timeout: 8000 });
  81 |     await expect(page.locator('#kcal')).toBeVisible({ timeout: 5000 });
  82 | 
  83 |     const renderedAfterOffline = await page.locator('#macroChart').getAttribute('data-rendered-at');
  84 |     expect(renderedAfterOffline).not.toBeNull();
  85 |   }
  86 | 
  87 |   // Restore network and CPU
  88 |   await client.send('Network.disable');
  89 |   await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  90 | });
  91 | 
```