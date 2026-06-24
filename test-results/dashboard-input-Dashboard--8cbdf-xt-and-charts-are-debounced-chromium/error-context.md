# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard-input.spec.mjs >> Dashboard input debounce and granular updates >> kcal input updates immediate text and charts are debounced
- Location: tests/dashboard-input.spec.mjs:4:3

# Error details

```
Error: expect(received).not.toBe(expected) // Object.is equality

Expected: not "0"
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
  3  | test.describe('Dashboard input debounce and granular updates', () => {
  4  |   test('kcal input updates immediate text and charts are debounced', async ({ page }) => {
  5  |     await page.goto('http://127.0.0.1:8000');
  6  | 
  7  |     // Wait for the app to fully initialise before interacting
  8  |     await page.waitForLoadState('networkidle');
  9  | 
  10 |     const kcalInput = page.locator('#kcal');
  11 |     await expect(kcalInput).toBeVisible({ timeout: 5000 });
  12 | 
  13 |     const macroCanvas = page.locator('#macroChart');
  14 |     const kcalRemaining = page.locator('#kcalRemaining');
  15 | 
  16 |     // Capture the render timestamp before typing
  17 |     const beforeRendered = await macroCanvas.getAttribute('data-rendered-at');
  18 | 
  19 |     // Type into the kcal field
  20 |     await kcalInput.click();
  21 |     await page.keyboard.type('1');
  22 |     await page.keyboard.type('0');
  23 |     await page.keyboard.type('0');
  24 | 
  25 |     // Chart should NOT update immediately (debounce is 300ms)
  26 |     const soonRendered = await macroCanvas.getAttribute('data-rendered-at');
  27 |     expect(soonRendered).toBe(beforeRendered);
  28 | 
  29 |     // Wait well past the debounce window (300ms render + 400ms input debounce)
  30 |     await page.waitForTimeout(800);
  31 | 
  32 |     // After debounce settles the chart timestamp must have changed
  33 |     const afterRendered = await macroCanvas.getAttribute('data-rendered-at');
> 34 |     expect(afterRendered).not.toBe(beforeRendered);
     |                               ^ Error: expect(received).not.toBe(expected) // Object.is equality
  35 | 
  36 |     // kcalRemaining either changed from '--' (profile set) or stayed '--' (no profile) —
  37 |     // either way the element must be visible and contain a string
  38 |     const remainingText = await kcalRemaining.textContent();
  39 |     expect(typeof remainingText).toBe('string');
  40 |   });
  41 | 
  42 |   test('updating water does not re-render selected date label', async ({ page }) => {
  43 |     await page.goto('http://127.0.0.1:8000');
  44 |     await page.waitForLoadState('networkidle');
  45 | 
  46 |     const aguaInput = page.locator('#agua');
  47 |     const selectedDateLabel = page.locator('#selectedDateLabel');
  48 | 
  49 |     await expect(aguaInput).toBeVisible({ timeout: 5000 });
  50 | 
  51 |     // Capture the label content before the water input changes
  52 |     const before = await selectedDateLabel.innerHTML();
  53 | 
  54 |     await aguaInput.fill('2');
  55 | 
  56 |     // Allow the input debounce + any granular update to settle
  57 |     await page.waitForTimeout(500);
  58 | 
  59 |     const after = await selectedDateLabel.innerHTML();
  60 |     // The date label must be identical — water input must not cause a full re-render
  61 |     expect(after).toBe(before);
  62 |   });
  63 | });
  64 | 
```