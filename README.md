# myMacroBuddy
[![Playwright Tests](https://github.com/dzmpa/myMacroBuddy.github.io/actions/workflows/ci-playwright.yml/badge.svg)](https://github.com/dzmpa/myMacroBuddy.github.io/actions/workflows/ci-playwright.yml)

A lightweight PWA for tracking meals and macronutrients.

Highlights

- **Performance:** DOM rendering optimized with DocumentFragment and granular updates to avoid layout thrashing.
- **Engineering Defensive:** API boundary validation for USDA, Edamam, and Open Food Facts to drop malformed payloads early.
- **Quality:** CI pipeline with Playwright E2E tests and GitHub Actions to prevent regressions before deploy.

Run tests locally

```bash
npm install
npx playwright install
npx playwright test
```

Note: update the badge URL to match your GitHub owner if different from `dzmpa`.
