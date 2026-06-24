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

Expected: not null
```

# Page snapshot

```yaml
- generic [ref=e1]:
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
              - spinbutton "Kcal" [active] [ref=e78]: "100"
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
          - generic [ref=e99]:
            - generic [ref=e100]:
              - text: Notes
              - textbox "Notes" [ref=e101]:
                - /placeholder: How did today go?
            - generic [ref=e102]:
              - paragraph [ref=e103]: Notes preview
              - paragraph [ref=e104]: No notes saved for this day.
        - generic [ref=e106]:
          - generic [ref=e107]:
            - paragraph [ref=e108]: Food log
            - generic [ref=e109]:
              - heading "Quick log" [level=3] [ref=e110]
              - button "Copy previous day" [ref=e111] [cursor=pointer]
            - paragraph [ref=e112]: Copies food, notes, and daily metrics from the previous calendar day.
          - generic [ref=e113]:
            - combobox [ref=e114]
            - spinbutton [ref=e115]
            - button "Add" [ref=e116] [cursor=pointer]
          - list
    - generic [ref=e117]:
      - generic [ref=e118]:
        - paragraph [ref=e119]: Add foods
        - heading "Search, pick, and log" [level=2] [ref=e120]
        - paragraph [ref=e121]: One fast flow for local matches first and Open Food Facts pages for everything else.
      - generic [ref=e122]:
        - generic [ref=e123]:
          - textbox "Search chicken, rice, oats, yogurt, or paste an Open Food Facts link..." [ref=e124]
          - button "Search" [ref=e125] [cursor=pointer]
        - generic [ref=e126]:
          - generic [ref=e127]: "`Enter` runs search"
          - generic [ref=e128]: Open Food Facts powers external food search
          - generic [ref=e129]: Barcode import stays optional
          - generic [ref=e130]: Browse more with Previous and Next page
          - generic [ref=e131]: Open Food Facts product links work too
        - paragraph [ref=e132]: Search foods by name, barcode, or paste an Open Food Facts product link.
    - generic [ref=e133]:
      - generic [ref=e134]:
        - paragraph [ref=e135]: Suggestions
        - heading "Plan the rest of the day" [level=2] [ref=e136]
      - generic [ref=e138]:
        - generic [ref=e139]:
          - paragraph [ref=e140]: Meal planner
          - heading "Suggestions for the rest of the day" [level=3] [ref=e141]
        - button "Refresh plan" [ref=e142] [cursor=pointer]
    - generic [ref=e143]:
      - generic [ref=e144]:
        - paragraph [ref=e145]: Progress
        - heading "History and trend" [level=2] [ref=e146]
      - generic [ref=e147]:
        - generic [ref=e148]:
          - generic [ref=e149]:
            - generic [ref=e150]:
              - paragraph [ref=e151]: Calendar
              - heading "Day navigation" [level=3] [ref=e152]
            - generic [ref=e153]:
              - button "Previous" [ref=e154] [cursor=pointer]
              - button "Next" [ref=e155] [cursor=pointer]
          - paragraph
        - generic [ref=e156]:
          - generic [ref=e158]:
            - paragraph [ref=e159]: Charts
            - heading "Weight trend" [level=3] [ref=e160]
          - generic [ref=e164]:
            - paragraph [ref=e165]: Charts
            - heading "Day macros" [level=3] [ref=e166]
    - group [ref=e169]:
      - generic "Settings Database, APIs, and setup Expand to manage profile, foods, recipes, and backups" [ref=e170] [cursor=pointer]:
        - generic [ref=e171]:
          - generic [ref=e172]:
            - paragraph [ref=e173]: Settings
            - heading "Database, APIs, and setup" [level=2] [ref=e174]
          - generic [ref=e175]: Expand to manage profile, foods, recipes, and backups
  - navigation [ref=e176]:
    - button "🏠" [ref=e177] [cursor=pointer]
    - button "📅" [ref=e178] [cursor=pointer]
    - button "⚙️" [ref=e179] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Dashboard input debounce and granular updates', () => {
  4  |   test('kcal input updates immediate text and charts are debounced', async ({ page }) => {
  5  |     await page.goto('http://127.0.0.1:8000');
  6  | 
  7  |     // Ensure the kcal input is present
  8  |     const kcalInput = page.locator('#kcal');
  9  |     await expect(kcalInput).toBeVisible();
  10 | 
  11 |     // Read initial kcalRemaining and macroChart render timestamp (if any)
  12 |     const kcalRemaining = page.locator('#kcalRemaining');
  13 |     const macroCanvas = page.locator('#macroChart');
  14 | 
  15 |     const beforeRendered = await macroCanvas.getAttribute('data-rendered-at');
  16 | 
  17 |     // Simulate fast typing into the kcal input
  18 |     await kcalInput.click();
  19 |     await page.keyboard.type('1');
  20 |     await page.keyboard.type('0');
  21 |     await page.keyboard.type('0');
  22 | 
  23 |     // Immediately the kcalRemaining text should reflect the input (or at least change)
  24 |     await expect(kcalRemaining).not.toHaveText('--', { timeout: 1000 });
  25 | 
  26 |     // Chart should NOT have updated immediately (still same data-rendered-at)
  27 |     const soonRendered = await macroCanvas.getAttribute('data-rendered-at');
  28 |     expect(soonRendered).toBe(beforeRendered);
  29 | 
  30 |     // Wait longer than debounce (>= 350ms)
  31 |     await page.waitForTimeout(400);
  32 | 
  33 |     // Now the chart should have a new render timestamp
  34 |     const afterRendered = await macroCanvas.getAttribute('data-rendered-at');
> 35 |     expect(afterRendered).not.toBe(beforeRendered);
     |                               ^ Error: expect(received).not.toBe(expected) // Object.is equality
  36 |   });
  37 | 
  38 |   test('updating water does not re-render selected date label', async ({ page }) => {
  39 |     await page.goto('http://127.0.0.1:8000');
  40 | 
  41 |     const aguaInput = page.locator('#agua');
  42 |     const selectedDateLabel = page.locator('#selectedDateLabel');
  43 | 
  44 |     await expect(aguaInput).toBeVisible();
  45 |     const before = await selectedDateLabel.innerHTML();
  46 | 
  47 |     await aguaInput.fill('2');
  48 |     // allow debounce/processing to settle
  49 |     await page.waitForTimeout(150);
  50 | 
  51 |     const after = await selectedDateLabel.innerHTML();
  52 |     expect(after).toBe(before);
  53 |   });
  54 | });
  55 | 
```