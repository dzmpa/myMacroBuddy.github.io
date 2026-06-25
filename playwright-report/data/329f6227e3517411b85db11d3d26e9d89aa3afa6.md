# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard-mobile.spec.mjs >> Mobile layout checks — iPhone 13 >> iPhone 13 - essential controls visible and within viewport
- Location: tests/dashboard-mobile.spec.mjs:10:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  locator('#selectedDateLabel')
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('#selectedDateLabel')
    14 × locator resolved to <p id="selectedDateLabel" class="mt-1 font-medium text-white"></p>
       - unexpected value "hidden"

```

```yaml
- main:
  - paragraph: Selected date
  - paragraph
  - paragraph: myMacroBuddy
  - heading "Macro Calculator" [level=1]
  - paragraph: Start with a simple daily macro target calculator. Food logging, search, and planning still live below when you need them.
  - button "Calculate"
  - button "Trophies"
  - paragraph: Calories left
  - paragraph: "0"
  - paragraph: remaining kcal
  - paragraph: Water
  - paragraph: "--"
  - paragraph: liters per day
  - paragraph: Per meal split
  - paragraph: Add your stats first to see an easy per-meal breakdown.
  - paragraph: Kcal
  - paragraph: "--"
  - paragraph: Protein
  - paragraph: "--"
  - paragraph: Carb
  - paragraph: "--"
  - paragraph: Fat
  - paragraph: "--"
  - paragraph: Fiber
  - paragraph: "--"
  - paragraph: Recommendation
  - paragraph: Recommendation will appear here
  - paragraph: Add neck, waist, and hip for female entries to get the American Navy body-fat estimate and a recommendation.
- paragraph: Today
- heading "Log today and track progress" [level=2]
- paragraph: "Everything important for today lives here: remaining targets, quick logging, and your day foods."
- paragraph: Daily dashboard
- heading "Day summary" [level=3]
- paragraph: Calories left
- paragraph: "0"
- paragraph: Calorie status
- paragraph
- paragraph: Macros
- paragraph
- paragraph: Day
- paragraph
- paragraph: Active targets
- paragraph
- text: Kcal
- spinbutton "Kcal"
- text: Protein
- spinbutton "Protein"
- text: Carbs
- spinbutton "Carbs"
- text: Fat
- spinbutton "Fat"
- text: Weight
- spinbutton "Weight"
- text: Water
- spinbutton "Water"
- text: Fiber
- spinbutton "Fiber"
- text: Day type
- combobox "Day type":
  - option "normal" [selected]
  - option "training"
  - option "rest"
- paragraph: Context and insight
- paragraph: normal
- paragraph: "Adaptive TDEE: not enough data yet."
- text: Notes
- textbox "Notes":
  - /placeholder: How did today go?
- paragraph: Notes preview
- paragraph: No notes saved for this day.
- paragraph: Food log
- heading "Quick log" [level=3]
- button "Copy previous day"
- paragraph: Copies food, notes, and daily metrics from the previous calendar day.
- combobox
- spinbutton
- button "Add"
- list
- paragraph: Add foods
- heading "Search, pick, and log" [level=2]
- paragraph: One fast flow for local matches first and Open Food Facts pages for everything else.
- textbox "Search chicken, rice, oats, yogurt, or paste an Open Food Facts link..."
- button "Search"
- text: "`Enter` runs search Open Food Facts powers external food search Barcode import stays optional Browse more with Previous and Next page Open Food Facts product links work too"
- paragraph: Search foods by name, barcode, or paste an Open Food Facts product link.
- paragraph: Suggestions
- heading "Plan the rest of the day" [level=2]
- paragraph: Meal planner
- heading "Suggestions for the rest of the day" [level=3]
- button "Refresh plan"
- paragraph: Progress
- heading "History and trend" [level=2]
- paragraph: Calendar
- heading "Day navigation" [level=3]
- button "Previous"
- button "Next"
- paragraph
- paragraph: Charts
- heading "Weight trend" [level=3]
- paragraph: Charts
- heading "Day macros" [level=3]
- group:
  - paragraph: Settings
  - heading "Database, APIs, and setup" [level=2]
  - text: Expand to manage profile, foods, recipes, and backups
- navigation:
  - button "🏠"
  - button "📅"
  - button "⚙️"
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
  16 |       await page.waitForLoadState('networkidle');
  17 | 
  18 |       const selectors = [
  19 |         '#calculateMacrosBtn',
  20 |         '#macroCalcKcal',
  21 |         '#selectedDateLabel',
  22 |         '#macroChart',
  23 |         '#macroCalcProt',
  24 |       ];
  25 | 
  26 |       const viewport = device.viewport || { width: 390, height: 844 };
  27 | 
  28 |       for (const sel of selectors) {
  29 |         const loc = page.locator(sel);
  30 | 
  31 |         // Scroll element into view before asserting — mobile layouts can be taller than one screen
  32 |         await loc.scrollIntoViewIfNeeded({ timeout: 5000 });
> 33 |         await expect(loc).toBeVisible({ timeout: 5000 });
     |                           ^ Error: expect(locator).toBeVisible() failed
  34 | 
  35 |         const box = await loc.boundingBox();
  36 |         expect(box).not.toBeNull();
  37 | 
  38 |         // Element must fit within the viewport WIDTH (horizontal overflow = broken layout)
  39 |         // Height can exceed initial viewport because of vertical scrolling — only check width
  40 |         expect(box.x).toBeGreaterThanOrEqual(0);
  41 |         expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
  42 |         expect(box.width).toBeGreaterThan(0);
  43 |       }
  44 | 
  45 |       await context.close();
  46 |     });
  47 | 
  48 |     test(`${deviceName} - trophy modal is accessible and closable`, async ({ browser }) => {
  49 |       const device = devices[deviceName];
  50 |       const context = await browser.newContext({ ...device });
  51 |       const page = await context.newPage();
  52 | 
  53 |       await page.goto('http://127.0.0.1:8000');
  54 |       await page.waitForLoadState('networkidle');
  55 | 
  56 |       const modal = page.locator('#trophyModal');
  57 |       const closeBtn = page.locator('#closeTrophyModalBtn');
  58 | 
  59 |       // The modal exists in the DOM but is hidden by default — that is correct UX
  60 |       await expect(modal).toBeAttached({ timeout: 5000 });
  61 | 
  62 |       // Open the modal programmatically (mirrors what toggleTrophyModal(true) does)
  63 |       await page.evaluate(() => {
  64 |         const m = document.getElementById('trophyModal');
  65 |         if (m) {
  66 |           m.classList.remove('hidden');
  67 |           m.classList.add('flex');
  68 |         }
  69 |       });
  70 | 
  71 |       await expect(modal).toBeVisible({ timeout: 2000 });
  72 |       await expect(closeBtn).toBeVisible({ timeout: 2000 });
  73 | 
  74 |       // Close via button click
  75 |       await closeBtn.click();
  76 | 
  77 |       // After close the modal must be hidden again (hidden class re-added by toggleTrophyModal)
  78 |       // Use evaluate as a fallback in case the button handler runs async
  79 |       await page.waitForTimeout(200);
  80 |       const isHidden = await page.evaluate(() => {
  81 |         const m = document.getElementById('trophyModal');
  82 |         return m ? m.classList.contains('hidden') : true;
  83 |       });
  84 |       expect(isHidden).toBe(true);
  85 | 
  86 |       await context.close();
  87 |     });
  88 |   });
  89 | }
  90 | 
```