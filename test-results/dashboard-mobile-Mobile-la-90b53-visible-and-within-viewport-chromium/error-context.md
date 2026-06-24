# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard-mobile.spec.mjs >> Mobile layout checks — iPhone 13 >> iPhone 13 - essential controls visible and within viewport
- Location: tests/dashboard-mobile.spec.mjs:10:5

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 665
Received:    702.5
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - main [ref=e4]:
      - generic [ref=e6]:
        - paragraph [ref=e7]: Selected date
        - paragraph
      - generic [ref=e9]:
        - generic [ref=e11]:
          - generic [ref=e12]:
            - paragraph [ref=e13]: myMacroBuddy
            - heading "Macro Calculator" [level=1] [ref=e14]
            - paragraph [ref=e15]: Start with a simple daily macro target calculator. Food logging, search, and planning still live below when you need them.
          - generic [ref=e16]:
            - generic [ref=e17]:
              - button "Calculate" [ref=e18] [cursor=pointer]
              - button "Trophies" [ref=e19] [cursor=pointer]
            - generic [ref=e20]:
              - generic [ref=e21]:
                - paragraph [ref=e22]: Calories left
                - paragraph [ref=e23]: "0"
                - paragraph [ref=e24]: remaining kcal
              - generic [ref=e25]:
                - paragraph [ref=e26]: Water
                - paragraph [ref=e27]: "--"
                - paragraph [ref=e28]: liters per day
              - generic [ref=e29]:
                - paragraph [ref=e30]: Per meal split
                - paragraph [ref=e31]: Add your stats first to see an easy per-meal breakdown.
        - generic [ref=e32]:
          - generic [ref=e33]:
            - paragraph [ref=e34]: Kcal
            - paragraph [ref=e35]: "--"
          - generic [ref=e36]:
            - paragraph [ref=e37]: Protein
            - paragraph [ref=e38]: "--"
          - generic [ref=e39]:
            - paragraph [ref=e40]: Carb
            - paragraph [ref=e41]: "--"
          - generic [ref=e42]:
            - paragraph [ref=e43]: Fat
            - paragraph [ref=e44]: "--"
          - generic [ref=e45]:
            - paragraph [ref=e46]: Fiber
            - paragraph [ref=e47]: "--"
        - generic [ref=e48]:
          - paragraph [ref=e49]: Recommendation
          - paragraph [ref=e50]: Recommendation will appear here
          - paragraph [ref=e51]: Add neck, waist, and hip for female entries to get the American Navy body-fat estimate and a recommendation.
    - generic [ref=e52]:
      - generic [ref=e53]:
        - paragraph [ref=e54]: Today
        - heading "Log today and track progress" [level=2] [ref=e55]
        - paragraph [ref=e56]: "Everything important for today lives here: remaining targets, quick logging, and your day foods."
      - generic [ref=e58]:
        - generic [ref=e59]:
          - generic [ref=e60]:
            - generic [ref=e61]:
              - paragraph [ref=e62]: Daily dashboard
              - heading "Day summary" [level=3] [ref=e63]
            - generic [ref=e64]:
              - paragraph [ref=e65]: Calories left
              - paragraph [ref=e66]: "0"
          - generic [ref=e67]:
            - generic [ref=e68]:
              - paragraph [ref=e69]: Calorie status
              - paragraph
            - generic [ref=e70]:
              - paragraph [ref=e71]: Macros
              - paragraph
            - generic [ref=e72]:
              - paragraph [ref=e73]: Day
              - paragraph
            - generic [ref=e74]:
              - paragraph [ref=e75]: Active targets
              - paragraph
          - generic [ref=e76]:
            - generic [ref=e77]:
              - text: Kcal
              - spinbutton "Kcal" [ref=e78]
            - generic [ref=e79]:
              - text: Protein
              - spinbutton "Protein" [ref=e80]
            - generic [ref=e81]:
              - text: Carbs
              - spinbutton "Carbs" [ref=e82]
            - generic [ref=e83]:
              - text: Fat
              - spinbutton "Fat" [ref=e84]
            - generic [ref=e85]:
              - text: Weight
              - spinbutton "Weight" [ref=e86]
            - generic [ref=e87]:
              - text: Water
              - spinbutton "Water" [ref=e88]
            - generic [ref=e89]:
              - text: Fiber
              - spinbutton "Fiber" [ref=e90]
            - generic [ref=e91]:
              - text: Day type
              - combobox "Day type" [ref=e92]:
                - option "normal" [selected]
                - option "training"
                - option "rest"
          - generic [ref=e94]:
            - paragraph [ref=e95]: Context and insight
            - paragraph [ref=e96]: normal
            - paragraph [ref=e97]: "Adaptive TDEE: not enough data yet."
          - generic [ref=e98]:
            - generic [ref=e99]:
              - text: Notes
              - textbox "Notes" [ref=e100]:
                - /placeholder: How did today go?
            - generic [ref=e101]:
              - paragraph [ref=e102]: Notes preview
              - paragraph [ref=e103]: No notes saved for this day.
        - generic [ref=e105]:
          - generic [ref=e106]:
            - paragraph [ref=e107]: Food log
            - generic [ref=e108]:
              - heading "Quick log" [level=3] [ref=e109]
              - button "Copy previous day" [ref=e110] [cursor=pointer]
            - paragraph [ref=e111]: Copies food, notes, and daily metrics from the previous calendar day.
          - generic [ref=e112]:
            - combobox [ref=e113]
            - spinbutton [ref=e114]
            - button "Add" [ref=e115] [cursor=pointer]
          - list
    - generic [ref=e116]:
      - generic [ref=e117]:
        - paragraph [ref=e118]: Add foods
        - heading "Search, pick, and log" [level=2] [ref=e119]
        - paragraph [ref=e120]: One fast flow for local matches first and Open Food Facts pages for everything else.
      - generic [ref=e121]:
        - generic [ref=e122]:
          - textbox "Search chicken, rice, oats, yogurt, or paste an Open Food Facts link..." [ref=e123]
          - button "Search" [ref=e124] [cursor=pointer]
        - generic [ref=e125]:
          - generic [ref=e126]: "`Enter` runs search"
          - generic [ref=e127]: Open Food Facts powers external food search
          - generic [ref=e128]: Barcode import stays optional
          - generic [ref=e129]: Browse more with Previous and Next page
          - generic [ref=e130]: Open Food Facts product links work too
        - paragraph [ref=e131]: Search foods by name, barcode, or paste an Open Food Facts product link.
    - generic [ref=e132]:
      - generic [ref=e133]:
        - paragraph [ref=e134]: Suggestions
        - heading "Plan the rest of the day" [level=2] [ref=e135]
      - generic [ref=e137]:
        - generic [ref=e138]:
          - paragraph [ref=e139]: Meal planner
          - heading "Suggestions for the rest of the day" [level=3] [ref=e140]
        - button "Refresh plan" [ref=e141] [cursor=pointer]
    - generic [ref=e142]:
      - generic [ref=e143]:
        - paragraph [ref=e144]: Progress
        - heading "History and trend" [level=2] [ref=e145]
      - generic [ref=e146]:
        - generic [ref=e147]:
          - generic [ref=e148]:
            - generic [ref=e149]:
              - paragraph [ref=e150]: Calendar
              - heading "Day navigation" [level=3] [ref=e151]
            - generic [ref=e152]:
              - button "Previous" [ref=e153] [cursor=pointer]
              - button "Next" [ref=e154] [cursor=pointer]
          - paragraph
        - generic [ref=e155]:
          - generic [ref=e157]:
            - paragraph [ref=e158]: Charts
            - heading "Weight trend" [level=3] [ref=e159]
          - generic [ref=e163]:
            - paragraph [ref=e164]: Charts
            - heading "Day macros" [level=3] [ref=e165]
    - group [ref=e168]:
      - generic "Settings Database, APIs, and setup Expand to manage profile, foods, recipes, and backups" [ref=e169] [cursor=pointer]:
        - generic [ref=e170]:
          - generic [ref=e171]:
            - paragraph [ref=e172]: Settings
            - heading "Database, APIs, and setup" [level=2] [ref=e173]
          - generic [ref=e174]: Expand to manage profile, foods, recipes, and backups
  - navigation [ref=e175]:
    - button "🏠" [ref=e176] [cursor=pointer]
    - button "📅" [ref=e177] [cursor=pointer]
    - button "⚙️" [ref=e178] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect, devices } from '@playwright/test';
  2  | 
  3  | const MOBILE_DEVICES = [
  4  |   'iPhone 13',
  5  |   'Pixel 5',
  6  | ];
  7  | 
  8  | for (const deviceName of MOBILE_DEVICES) {
  9  |   test.describe(`Mobile layout checks — ${deviceName}`, () => {
  10 |     test(`${deviceName} - essential controls visible and within viewport`, async ({ browser }) => {
  11 |       const device = devices[deviceName];
  12 |       const context = await browser.newContext({ ...device });
  13 |       const page = await context.newPage();
  14 | 
  15 |       await page.goto('http://127.0.0.1:8000');
  16 | 
  17 |       // selectors to sanity-check on mobile
  18 |       const selectors = [
  19 |         '#calculateMacrosBtn',
  20 |         '#macroCalcKcal',
  21 |         '#selectedDateLabel',
  22 |         '#macroChart',
  23 |         '#macroCalcProt',
  24 |       ];
  25 | 
  26 |       for (const sel of selectors) {
  27 |         const loc = page.locator(sel);
  28 |         await expect(loc).toBeVisible({ timeout: 5000 });
  29 | 
  30 |         const box = await loc.boundingBox();
  31 |         expect(box).not.toBeNull();
  32 | 
  33 |         const viewport = device.viewport || { width: 390, height: 844 };
  34 |         // ensure element is inside viewport bounds (not pushed off-screen)
  35 |         expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
> 36 |         expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
     |                                    ^ Error: expect(received).toBeLessThanOrEqual(expected)
  37 |       }
  38 | 
  39 |       await context.close();
  40 |     });
  41 | 
  42 |     test(`${deviceName} - trophy modal is accessible and closable`, async ({ browser }) => {
  43 |       const device = devices[deviceName];
  44 |       const context = await browser.newContext({ ...device });
  45 |       const page = await context.newPage();
  46 | 
  47 |       await page.goto('http://127.0.0.1:8000');
  48 | 
  49 |       // The trophy modal exists in DOM; ensure close button is present and clickable
  50 |       const modal = page.locator('#trophyModal');
  51 |       const closeBtn = page.locator('#closeTrophyModalBtn');
  52 | 
  53 |       await expect(modal).toBeVisible();
  54 |       await expect(closeBtn).toBeVisible();
  55 | 
  56 |       // Simulate opening the modal by removing 'hidden' class via script (safe test-only action)
  57 |       await page.evaluate(() => {
  58 |         const m = document.getElementById('trophyModal');
  59 |         if (m) m.classList.remove('hidden');
  60 |       });
  61 | 
  62 |       await expect(modal).toHaveClass(/flex/);
  63 |       await closeBtn.click();
  64 | 
  65 |       // After click, the modal should be hidden again (class may change)
  66 |       await page.evaluate(() => {
  67 |         const m = document.getElementById('trophyModal');
  68 |         if (m) m.classList.add('hidden');
  69 |       });
  70 | 
  71 |       await context.close();
  72 |     });
  73 |   });
  74 | }
  75 | 
```