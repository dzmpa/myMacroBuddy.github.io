This folder should contain the Playwright visual regression baseline images (golden snapshots).

Recommended workflow to generate and commit baselines locally:

1. Install dependencies and Playwright browsers:

```bash
npm install
npx playwright install
```

2. Start a local static server from the repository root (Playwright will load `http://127.0.0.1:8000`):

```bash
npx http-server -c-1 .  # or: python3 -m http.server 8000
```

3. Run the visual regression test once to generate the baseline snapshot(s):

```bash
npx playwright test tests/visual-regression.spec.mjs --project=chromium --update-snapshots
```

This will create image files named like `dashboard-chromium.png` under the Playwright snapshot output folder (usually `tests/__screenshots__` or `playwright-report/screenshots`). Move or copy them into this directory and commit.

4. Commit the baseline images so the CI can compare against them on every run.

Notes:
- I couldn't generate the pixel-perfect baseline from here because Playwright must run in your environment (browsers and rendering engine). If you want, I can add a small script to help with moving snapshots into `tests/__screenshots__` and committing them.
- Once the baseline is committed, CI will detect visual regressions automatically.
