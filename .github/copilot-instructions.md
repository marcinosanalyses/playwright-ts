# Project Guidelines

## Purpose
This repository is for Playwright end-to-end automation written in TypeScript.
Generate tests and supporting files for Playwright Test using `@playwright/test`.

## Test Style
- Test user-visible behavior, not implementation details.
- Keep each test focused on one clear scenario with a descriptive test name.
- Keep tests independent so they can run in any order.
- Prefer standard Playwright structure unless the user requests otherwise:
  - `playwright.config.ts`
  - `tests/**/*.spec.ts`
  - optional shared helpers or fixtures only when repetition is real

## Locator Rules
- Prefer locators in this order:
  - `page.getByRole()` with accessible name
  - `page.getByLabel()`
  - `page.getByPlaceholder()`
  - `page.getByText()` for non-interactive content
  - `page.getByTestId()` when a stable testing contract is needed
- Avoid XPath unless there is no reasonable alternative.
- Avoid brittle CSS selectors, DOM traversal, class-name selectors, and `nth-child` patterns.
- Avoid `locator.nth()` unless order is the behavior being tested.
- If the page lacks a reliable selector, ask for or introduce a stable test id instead of inventing a fragile selector.

## Assertions And Waiting
- Use Playwright web-first assertions such as `await expect(locator).toBeVisible()` and `await expect(page).toHaveURL()`.
- Rely on Playwright auto-waiting and retry behavior.
- Do not use arbitrary sleeps or `waitForTimeout()` unless the user explicitly asks for it or there is a hard technical reason.
- Do not add unnecessary `waitForLoadState()` calls.

## Reuse And Setup
- Use `test.beforeEach()` only for setup that improves clarity without creating hidden coupling.
- If authentication is required across many tests, prefer storage state or a shared setup flow over repeated UI login.
- Reuse helpers and fixtures only after repeated patterns are clear.

## Data And External Systems
- Mock or stub third-party dependencies when needed to keep tests deterministic.
- Prefer stable, controlled test data.
- Do not test external sites or services that the project does not control unless the user explicitly asks for it.

## Output Expectations
- Generate valid TypeScript that runs with Playwright Test.
- Use `import { test, expect } from '@playwright/test'` unless the project establishes a custom fixture module.
- When creating new tests, return complete runnable code rather than partial snippets.
- If a requested test cannot be made reliable, state the blocker clearly and identify the missing accessible name, stable text, or test id.