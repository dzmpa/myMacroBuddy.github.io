# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard-throttle.spec.mjs >> Throttled network and CPU do not freeze UI (Chromium only)
- Location: tests\dashboard-throttle.spec.mjs:6:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.evaluate: Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - dialog "Sign in or create account" [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - paragraph [ref=e5]: myMacroBuddy
        - heading "Welcome" [level=1] [ref=e6]
        - paragraph [ref=e7]: Your personal nutrition companion
      - generic [ref=e8]:
        - generic [ref=e9]:
          - button "Sign in" [ref=e10]
          - button "Create account" [ref=e11]
        - generic [ref=e12]:
          - generic [ref=e13]:
            - generic [ref=e14]:
              - text: Username
              - textbox "Username" [ref=e15]:
                - /placeholder: your_username
            - generic [ref=e16]:
              - text: Password
              - textbox "Password" [ref=e17]:
                - /placeholder: ••••••••
            - generic [ref=e18]:
              - checkbox "Keep me signed in" [ref=e19]
              - text: Keep me signed in
            - paragraph
            - button "Sign in" [ref=e20]
          - paragraph [ref=e21]:
            - text: No account yet?
            - button "Create one" [ref=e22]
        - generic [ref=e23]:
          - generic [ref=e24]:
            - paragraph [ref=e25]: Account
            - generic [ref=e26]:
              - generic [ref=e27]:
                - text: Username
                - textbox "Username Min 3 chars. Letters, numbers, _ . + - only." [ref=e28]:
                  - /placeholder: your_username
                - paragraph [ref=e29]: Min 3 chars. Letters, numbers, _ . + - only.
              - generic [ref=e30]:
                - text: Email
                - textbox "Email" [ref=e31]:
                  - /placeholder: you@example.com
              - generic [ref=e32]:
                - text: Password
                - textbox "Password" [ref=e33]:
                  - /placeholder: ••••••••
              - generic [ref=e34]:
                - text: Confirm password
                - textbox "Confirm password" [ref=e35]:
                  - /placeholder: ••••••••
            - paragraph [ref=e36]: Profile
            - generic [ref=e37]:
              - generic [ref=e38]:
                - text: First name
                - textbox "First name" [ref=e39]:
                  - /placeholder: Maria
              - generic [ref=e40]:
                - text: Last name
                - textbox "Last name" [ref=e41]:
                  - /placeholder: Silva
              - generic [ref=e42]:
                - text: Gender
                - combobox "Gender" [ref=e43]:
                  - option "Select" [selected]
                  - option "Male"
                  - option "Female"
                  - option "Other"
              - generic [ref=e44]:
                - text: Age
                - spinbutton "Age" [ref=e45]
            - generic [ref=e46]:
              - text: "Units:"
              - generic [ref=e47]:
                - button "Metric" [pressed] [ref=e48]
                - button "Imperial" [ref=e49]
            - generic [ref=e50]:
              - generic [ref=e51]:
                - text: Weight (kg)
                - spinbutton "Weight (kg)" [ref=e52]
              - generic [ref=e53]:
                - text: Height (cm)
                - spinbutton "Height (cm)" [ref=e54]
              - generic [ref=e55]:
                - text: Height (ft / in)
                - generic [ref=e56]:
                  - spinbutton [ref=e57]
                  - spinbutton [ref=e58]
                - paragraph [ref=e59]: feet / inches
            - generic [ref=e60]:
              - generic [ref=e61]:
                - text: Goal
                - combobox "Goal" [ref=e62]:
                  - option "Cut (lose fat)"
                  - option "Maintain weight" [selected]
                  - option "Bulk (gain muscle)"
              - generic [ref=e63]:
                - text: Activity level
                - combobox "Activity level" [ref=e64]:
                  - option "Select" [selected]
                  - option "Sedentary (desk job)"
                  - option "Light (1-3x / week)"
                  - option "Moderate (3-5x / week)"
                  - option "Heavy (6-7x / week)"
                  - option "Athlete (2x / day)"
            - generic [ref=e65]:
              - paragraph [ref=e66]: Existing data found
              - paragraph [ref=e67]: We found fitness data saved in this browser from before accounts were introduced. Would you like to import it into your new account?
              - generic [ref=e68]:
                - checkbox "Yes, import my existing data" [checked] [ref=e69]
                - text: Yes, import my existing data
            - generic [ref=e70]:
              - checkbox "Keep me signed in" [checked] [ref=e71]
              - text: Keep me signed in
            - paragraph
            - button "Create account & get started" [ref=e72]
          - paragraph [ref=e73]:
            - text: Already have an account?
            - button "Sign in" [ref=e74]
  - generic [ref=e75]:
    - generic [ref=e76]:
      - banner [ref=e77]:
        - generic [ref=e78]:
          - generic [ref=e79]:
            - paragraph [ref=e80]: myMacroBuddy
            - heading "Macro Calculator" [level=1] [ref=e81]
            - paragraph [ref=e82]: Start with a simple daily macro target calculator. Food logging, search, and planning still live below when you need them.
          - generic [ref=e83]:
            - generic [ref=e84]: "?"
            - generic [ref=e85]:
              - paragraph [ref=e86]: Signed in as
              - paragraph [ref=e87]: –
            - button "Sign out" [ref=e88]
          - generic [ref=e91]:
            - generic [ref=e92]:
              - heading "Trophy Room" [level=2] [ref=e93]
              - paragraph [ref=e94]: Your journey of discipline and consistency.
            - button "✕" [ref=e95]
          - generic [ref=e96]:
            - paragraph [ref=e97]: Selected date
            - paragraph [ref=e98]: Friday, June 26, 2026
            - generic [ref=e100]:
              - generic [ref=e101]:
                - generic [ref=e102]: Lvl 1
                - paragraph [ref=e104]: "XP: 0"
              - generic [ref=e105]:
                - text: 🔥 0
                - button "Troféus 🏆" [ref=e106]
      - navigation "App pages" [ref=e107]:
        - generic [ref=e108]:
          - generic [ref=e109]:
            - paragraph [ref=e110]: App pages
            - paragraph [ref=e111]: Open one main section at a time.
          - generic [ref=e112]:
            - button "Calculator" [ref=e113]
            - button "Today" [ref=e114]
            - button "Search" [ref=e115]
            - button "Suggestions" [ref=e116]
            - button "Progress" [ref=e117]
            - button "Settings" [ref=e118]
      - main [ref=e119]:
        - generic [ref=e120]:
          - generic [ref=e121]:
            - paragraph [ref=e122]: Calculator
            - heading "Get your macros in one step" [level=2] [ref=e123]
            - paragraph [ref=e124]: If all you want is calories and macros, stop here. Fill in your stats and the app will calculate daily targets and a simple per-meal split.
          - generic [ref=e125]:
            - generic [ref=e126]:
              - text: "Units:"
              - generic [ref=e127]:
                - button "Metric (kg / cm)" [pressed] [ref=e128]
                - button "Imperial (lbs / ft-in)" [ref=e129]
            - generic [ref=e130]:
              - generic [ref=e131]:
                - generic [ref=e132]:
                  - text: Age
                  - spinbutton "Age" [ref=e133]
                - generic [ref=e134]:
                  - text: Weight (kg)
                  - spinbutton "Weight (kg)" [ref=e135]
                - generic [ref=e136]:
                  - text: Height (cm)
                  - spinbutton "Height (cm)" [ref=e137]
                - generic [ref=e138]:
                  - text: Height (ft / in)
                  - generic [ref=e139]:
                    - spinbutton [ref=e140]
                    - spinbutton [ref=e141]
                  - paragraph [ref=e142]: feet / inches
                - generic [ref=e143]:
                  - text: Gender
                  - combobox "Gender" [ref=e144]:
                    - option "Select gender" [selected]
                    - option "Male"
                    - option "Female"
                    - option "Other"
                - generic [ref=e145]:
                  - text: Activity
                  - combobox "Activity" [ref=e146]:
                    - option "Select activity" [selected]
                    - option "Sedentary"
                    - option "Light"
                    - option "Moderate"
                    - option "Heavy"
                    - option "Athlete"
                - generic [ref=e147]:
                  - text: Goal
                  - combobox "Goal" [ref=e148]:
                    - option "Maintenance" [selected]
                    - option "Cut"
                    - option "Bulk"
                - generic [ref=e149]:
                  - text: Meals per day
                  - spinbutton "Meals per day" [ref=e150]: "4"
                - generic [ref=e151]:
                  - text: Training hours (optional)
                  - spinbutton "Training hours (optional)" [ref=e152]
                - generic [ref=e153]:
                  - paragraph [ref=e154]: American Navy body-fat estimate
                  - paragraph [ref=e155]: Add circumference measurements in cm for a body-fat estimate and a recommendation.
                  - generic [ref=e156]:
                    - generic [ref=e157]:
                      - text: Neck (cm)
                      - spinbutton "Neck (cm)" [ref=e158]
                    - generic [ref=e159]:
                      - text: Waist (cm)
                      - spinbutton "Waist (cm)" [ref=e160]
                    - generic [ref=e161]:
                      - text: Hip (cm, female only)
                      - spinbutton "Hip (cm, female only)" [ref=e162]
              - generic [ref=e163]:
                - generic [ref=e164]:
                  - generic [ref=e165]:
                    - generic [ref=e166]:
                      - paragraph [ref=e167]: Daily targets
                      - heading "Macro output" [level=3] [ref=e168]
                    - button "Calculate macros" [ref=e169]
                  - paragraph [ref=e170]: Complete age, weight, height, gender, activity, and goal to calculate your macros.
                  - paragraph [ref=e171]: Uses the Mifflin-St Jeor formula, an activity multiplier, and a goal adjustment.
                - generic [ref=e172]:
                  - article [ref=e173]:
                    - paragraph [ref=e174]: Calories
                    - paragraph [ref=e175]: "--"
                    - paragraph [ref=e176]: daily target
                  - article [ref=e177]:
                    - paragraph [ref=e178]: Protein
                    - paragraph [ref=e179]: "--"
                    - paragraph [ref=e180]: grams per day
                  - article [ref=e181]:
                    - paragraph [ref=e182]: Carbs
                    - paragraph [ref=e183]: "--"
                    - paragraph [ref=e184]: grams per day
                  - article [ref=e185]:
                    - paragraph [ref=e186]: Fat
                    - paragraph [ref=e187]: "--"
                    - paragraph [ref=e188]: grams per day
                  - article [ref=e189]:
                    - paragraph [ref=e190]: Fiber
                    - paragraph [ref=e191]: "--"
                    - paragraph [ref=e192]: grams per day
                  - article [ref=e193]:
                    - paragraph [ref=e194]: Water
                    - paragraph [ref=e195]: "--"
                    - paragraph [ref=e196]: liters per day
                - generic [ref=e197]:
                  - paragraph [ref=e198]: Per meal split
                  - paragraph [ref=e199]: Add your stats first to see an easy per-meal breakdown.
                - generic [ref=e200]:
                  - article [ref=e201]:
                    - paragraph [ref=e202]: Body fat
                    - paragraph [ref=e203]: "--"
                    - paragraph [ref=e204]: American Navy estimate
                  - article [ref=e205]:
                    - paragraph [ref=e206]: Lean mass
                    - paragraph [ref=e207]: "--"
                    - paragraph [ref=e208]: estimated kilograms
                  - article [ref=e209]:
                    - paragraph [ref=e210]: Fat mass
                    - paragraph [ref=e211]: "--"
                    - paragraph [ref=e212]: estimated kilograms
                - generic [ref=e213]:
                  - paragraph [ref=e214]: Recommendation
                  - paragraph [ref=e215]: Recommendation will appear here
                  - paragraph [ref=e216]: Add neck, waist, and hip for female entries to get the American Navy body-fat estimate and a recommendation.
        - generic [ref=e217]:
          - generic [ref=e218]:
            - paragraph [ref=e219]: Today
            - heading [level=2] [ref=e220]: Welcome, support@v6fitness.app
            - paragraph [ref=e221]: "Everything important for today lives here: remaining targets, quick logging, and your day foods."
          - generic [ref=e223]:
            - generic [ref=e224]:
              - generic [ref=e225]:
                - generic [ref=e226]:
                  - paragraph [ref=e227]: Daily dashboard
                  - heading [level=3] [ref=e228]: Day summary
                - generic [ref=e229]:
                  - paragraph [ref=e230]: Calories left
                  - paragraph [ref=e231]: "--"
              - generic [ref=e232]:
                - generic [ref=e233]:
                  - paragraph [ref=e234]: Calorie status
                  - paragraph [ref=e235]: Complete your profile to unlock live targets and daily remaining calories.
                - generic [ref=e236]:
                  - paragraph [ref=e237]: Macros
                  - paragraph [ref=e238]: Live targets are unavailable until you save your profile.
                - generic [ref=e239]:
                  - paragraph [ref=e240]: Day
                  - paragraph [ref=e241]: Weight -- | Water -- | Fiber --
                - generic [ref=e242]:
                  - paragraph [ref=e243]: Active targets
                  - paragraph [ref=e244]: No live targets calculated yet.
              - generic [ref=e245]:
                - generic [ref=e246]:
                  - text: Kcal
                  - spinbutton [active] [ref=e247]: "100"
                - generic [ref=e248]:
                  - text: Protein
                  - spinbutton [ref=e249]
                - generic [ref=e250]:
                  - text: Carbs
                  - spinbutton [ref=e251]
                - generic [ref=e252]:
                  - text: Fat
                  - spinbutton [ref=e253]
                - generic [ref=e254]:
                  - text: Weight
                  - spinbutton [ref=e255]
                - generic [ref=e256]:
                  - text: Water
                  - spinbutton [ref=e257]
                - generic [ref=e258]:
                  - text: Fiber
                  - spinbutton [ref=e259]
                - generic [ref=e260]:
                  - text: Day type
                  - combobox [ref=e261]
              - generic [ref=e263]:
                - paragraph [ref=e264]: Context and insight
                - paragraph [ref=e265]: normal
                - paragraph [ref=e266]: "Adaptive TDEE: not enough data yet."
              - generic [ref=e267]:
                - generic [ref=e268]:
                  - text: Notes
                  - textbox [ref=e269]:
                    - /placeholder: How did today go?
                - generic [ref=e270]:
                  - paragraph [ref=e271]: Notes preview
                  - paragraph [ref=e272]: No notes saved for this day.
            - generic [ref=e274]:
              - generic [ref=e275]:
                - paragraph [ref=e276]: Food log
                - generic [ref=e277]:
                  - heading [level=3] [ref=e278]: Quick log
                  - button [ref=e279]: Copy previous day
                - paragraph [ref=e280]: Copies food, notes, and daily metrics from the previous calendar day.
              - generic [ref=e281]:
                - combobox [ref=e282]
                - spinbutton [ref=e283]
                - button [ref=e284]: Add
              - list [ref=e285]:
                - listitem [ref=e286]: Sem alimentos registados.
        - generic [ref=e287]:
          - generic [ref=e288]:
            - paragraph [ref=e289]: Add foods
            - heading [level=2] [ref=e290]: Search, pick, and log
            - paragraph [ref=e291]: One fast flow for local matches first and Open Food Facts pages for everything else.
          - generic [ref=e292]:
            - generic [ref=e293]:
              - textbox [ref=e294]:
                - /placeholder: Search chicken, rice, oats, yogurt, or paste an Open Food Facts link...
              - button [ref=e295]: Search
            - generic [ref=e296]: "`Enter` runs search Open Food Facts powers external food search Barcode import stays optional Browse more with Previous and Next page Open Food Facts product links work too"
            - paragraph [ref=e297]: Search foods by name, barcode, or paste an Open Food Facts product link.
            - generic [ref=e298]:
              - article [ref=e299]:
                - paragraph [ref=e300]: Local database
                - paragraph [ref=e301]: "86"
                - paragraph [ref=e302]: saved food(s) ready for fast local matches.
              - article [ref=e303]:
                - paragraph [ref=e304]: Today
                - paragraph [ref=e305]: "0"
                - paragraph [ref=e306]: 0 kcal logged for the selected day.
              - article [ref=e307]:
                - paragraph [ref=e308]: Search order
                - paragraph [ref=e309]: Local database, then Open Food Facts
                - paragraph [ref=e310]: External food search is now simpler and fully name-first.
              - article [ref=e311]:
                - paragraph [ref=e312]: Quick action
                - paragraph [ref=e313]: Set grams, add to today, or save
                - paragraph [ref=e314]: You can also paste an Open Food Facts product link to load the exact item.
            - generic [ref=e316]: Search a food name, paste an Open Food Facts link, or enter a barcode. Then pick the result, set grams, and add it straight to today.
        - generic [ref=e317]:
          - generic [ref=e318]:
            - paragraph [ref=e319]: Suggestions
            - heading [level=2] [ref=e320]: Plan the rest of the day
          - generic [ref=e321]:
            - generic [ref=e322]:
              - generic [ref=e323]:
                - paragraph [ref=e324]: Meal planner
                - heading [level=3] [ref=e325]: Suggestions for the rest of the day
              - button [ref=e326]: Refresh plan
            - generic [ref=e328]: Completa o perfil para calcular targets reais antes de gerar o meal planner.
        - generic [ref=e329]:
          - generic [ref=e330]:
            - paragraph [ref=e331]: Progress
            - heading [level=2] [ref=e332]: History and trend
          - generic [ref=e333]:
            - generic [ref=e334]:
              - generic [ref=e335]:
                - generic [ref=e336]:
                  - paragraph [ref=e337]: Calendar
                  - heading [level=3] [ref=e338]: Day navigation
                - generic [ref=e339]:
                  - button [ref=e340]: Previous
                  - button [ref=e341]: Next
              - paragraph [ref=e342]: JUNE 2026
              - generic [ref=e343]:
                - button [ref=e344]: "1"
                - button [ref=e345]: "2"
                - button [ref=e346]: "3"
                - button [ref=e347]: "4"
                - button [ref=e348]: "5"
                - button [ref=e349]: "6"
                - button [ref=e350]: "7"
                - button [ref=e351]: "8"
                - button [ref=e352]: "9"
                - button [ref=e353]: "10"
                - button [ref=e354]: "11"
                - button [ref=e355]: "12"
                - button [ref=e356]: "13"
                - button [ref=e357]: "14"
                - button [ref=e358]: "15"
                - button [ref=e359]: "16"
                - button [ref=e360]: "17"
                - button [ref=e361]: "18"
                - button [ref=e362]: "19"
                - button [ref=e363]: "20"
                - button [ref=e364]: "21"
                - button [ref=e365]: "22"
                - button [ref=e366]: "23"
                - button [ref=e367]: "24"
                - button [ref=e368]: "25"
                - button [ref=e369]: "26"
                - button [ref=e370]: "27"
                - button [ref=e371]: "28"
                - button [ref=e372]: "29"
                - button [ref=e373]: "30"
            - generic [ref=e374]:
              - generic [ref=e376]:
                - paragraph [ref=e377]: Charts
                - heading [level=3] [ref=e378]: Weight trend
              - generic [ref=e382]:
                - paragraph [ref=e383]: Charts
                - heading [level=3] [ref=e384]: Day macros
        - group [ref=e387]:
          - generic [ref=e389]:
            - generic [ref=e390]:
              - paragraph [ref=e391]: Settings
              - heading [level=2] [ref=e392]: Database, APIs, and setup
            - text: Expand to manage profile, foods, recipes, and backups
    - generic [ref=e394]:
      - generic [ref=e395]:
        - paragraph [ref=e396]: Profile setup
        - heading [level=2] [ref=e397]: Set up your profile to unlock targets and planning
        - paragraph [ref=e398]: The core food flows work without this, but targets, planner output, and adaptive suggestions depend on a saved profile.
      - generic [ref=e399]:
        - generic [ref=e400]:
          - text: Name
          - textbox [ref=e401]:
            - /placeholder: Name
        - generic [ref=e402]:
          - text: "Units:"
          - generic [ref=e403]:
            - button [pressed] [ref=e404]: Metric (kg / cm)
            - button [ref=e405]: Imperial (lbs / ft-in)
        - generic [ref=e406]:
          - generic [ref=e407]:
            - text: Age
            - spinbutton [ref=e408]
          - generic [ref=e409]:
            - text: Weight (kg)
            - spinbutton [ref=e410]
          - generic [ref=e411]:
            - text: Height (cm)
            - spinbutton [ref=e412]
          - generic [ref=e413]:
            - text: Height (ft / in)
            - generic [ref=e414]:
              - spinbutton [ref=e415]
              - spinbutton [ref=e416]
            - paragraph [ref=e417]: feet / inches
          - generic [ref=e418]:
            - text: Gender
            - combobox [ref=e419]
        - generic [ref=e420]:
          - text: Goal
          - combobox [ref=e421]
        - generic [ref=e422]:
          - text: Activity level
          - combobox [ref=e423]
        - generic [ref=e424]:
          - text: Meals per day
          - combobox [ref=e425]
        - separator [ref=e426]
        - generic [ref=e427]:
          - heading [level=4] [ref=e428]: Shopping Preferences
          - paragraph [ref=e429]: Used to prioritize Open Food Facts search results.
          - generic [ref=e430]:
            - text: Country
            - combobox [ref=e431]
          - generic [ref=e432]:
            - text: Supermarket Brand
            - combobox [ref=e433]
        - button [ref=e434]: Save profile
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
  9  |   await page.addInitScript(() => {
  10 |     sessionStorage.setItem('mmb_session_v1', 'support@v6fitness.app');
  11 |   });
  12 |   await page.goto('http://127.0.0.1:8000');
  13 |   await page.waitForLoadState('networkidle');
  14 | 
  15 |   const client = await page.context().newCDPSession(page);
  16 | 
  17 |   await client.send('Network.enable');
  18 |   await client.send('Network.emulateNetworkConditions', {
  19 |     offline: false,
  20 |     latency: 200,
  21 |     downloadThroughput: (200 * 1024) / 8,
  22 |     uploadThroughput: (200 * 1024) / 8,
  23 |   });
  24 |   await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  25 | 
  26 |   const kcalInput = page.locator('#kcal');
  27 |   const kcalRemaining = page.locator('#kcalRemaining');
  28 |   const macroCanvas = page.locator('#macroChart');
  29 | 
  30 |   await expect(kcalInput).toBeVisible({ timeout: 10000 });
  31 | 
  32 |   const before = await macroCanvas.getAttribute('data-rendered-at');
  33 | 
  34 |   await kcalInput.click();
  35 |   await page.keyboard.type('1', { delay: 20 });
  36 |   await page.keyboard.type('0', { delay: 20 });
  37 |   await page.keyboard.type('0', { delay: 20 });
  38 | 
  39 |   // Under 4× CPU throttle the UI should still respond within a generous window
  40 |   const remainingText = await kcalRemaining.textContent({ timeout: 3000 });
  41 |   expect(typeof remainingText).toBe('string');
  42 | 
  43 |   // Charts are debounced — wait long enough under throttle (input debounce 400ms +
  44 |   // chart debounce 300ms + 4× CPU overhead → 3 s is a safe ceiling)
  45 |   await page.waitForFunction(
  46 |     (prevTimestamp) => {
  47 |       const canvas = document.getElementById('macroChart');
  48 |       if (!canvas) return false;
  49 |       const current = canvas.getAttribute('data-rendered-at');
  50 |       return current !== null && current !== prevTimestamp;
  51 |     },
  52 |     before,
  53 |     { timeout: 3000 },
  54 |   );
  55 | 
  56 |   const after = await macroCanvas.getAttribute('data-rendered-at');
  57 |   expect(after).not.toBe(before);
  58 | 
  59 |   // --- Service Worker / offline section ---
  60 | 
  61 |   // Verify the SW is registered and has populated at least one cache
> 62 |   const cacheKeys = await page.evaluate(async () => {
     |                                ^ Error: page.evaluate: Test timeout of 30000ms exceeded.
  63 |     if (!('serviceWorker' in navigator) || !('caches' in window)) return [];
  64 |     try {
  65 |       await navigator.serviceWorker.ready;
  66 |       return await caches.keys();
  67 |     } catch {
  68 |       return [];
  69 |     }
  70 |   });
  71 |   // SW may not be active on the very first load in CI — treat as soft check
  72 |   if (cacheKeys.length > 0) {
  73 |     await client.send('Network.emulateNetworkConditions', {
  74 |       offline: true,
  75 |       latency: 0,
  76 |       downloadThroughput: 0,
  77 |       uploadThroughput: 0,
  78 |     });
  79 | 
  80 |     await page.reload({ waitUntil: 'domcontentloaded' });
  81 | 
  82 |     // Critical UI should still render from SW cache
  83 |     await expect(page.locator('#selectedDateLabel')).toBeVisible({ timeout: 8000 });
  84 |     await expect(page.locator('#kcal')).toBeVisible({ timeout: 5000 });
  85 | 
  86 |     const renderedAfterOffline = await page.locator('#macroChart').getAttribute('data-rendered-at');
  87 |     expect(renderedAfterOffline).not.toBeNull();
  88 |   }
  89 | 
  90 |   // Restore network and CPU
  91 |   await client.send('Network.disable');
  92 |   await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  93 | });
  94 | 
```