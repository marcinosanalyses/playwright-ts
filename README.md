# Playwright TS E2E

Concise Playwright end-to-end test suite for LeanCode pages and Patrol docs.

## What is covered

- LeanCode website checks in [tests/leancode.spec.ts](tests/leancode.spec.ts)
- Patrol docs checks in [tests/patrol.spec.ts](tests/patrol.spec.ts)

## Tech

- TypeScript + Playwright Test
- Browser project: Firefox
- Config: [playwright.config.ts](playwright.config.ts)

## Quick start

```bash
npm ci
npx playwright install firefox
```

## Run tests

```bash
npm test
```

Run one spec:

```bash
npx playwright test tests/patrol.spec.ts
npx playwright test tests/leancode.spec.ts
```

Useful scripts:

```bash
npm run test:headed
npm run test:ui
npm run report
```

## CI

GitHub Actions workflow: [.github/workflows/playwright.yml](.github/workflows/playwright.yml)