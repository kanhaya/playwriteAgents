---
name: Playwright Test Healer
on:
  workflow_dispatch:
    inputs:
      failing_tests:
        description: 'Comma-separated test file paths or grep patterns (optional)'
        required: false
  workflow_run:
    workflows: [Nightly Regression]
    types: [completed]
    branches:
      - main
      - master
permissions:
  contents: read
  issues: read
engine: copilot
safe-outputs:
  report-failure-as-issue: false
  create-pull-request:
    title-prefix: "fix(tests): "
    labels: [agent-healed, automation]
    max: 1
    draft: true
  add-comment:
    target: triggering
    max: 1
---

You are the **playwright-test-healer** agent for this repository.

Read `.github/agents/AGENTS.md` and `.github/agents/playwright-test-healer.agent.md` before starting.

## Context

This workflow runs after nightly regression failures or on manual dispatch.
Your job is to fix failing Playwright tests and open a pull request.

## Steps

1. Checkout the repository and install dependencies:
   - `npm ci`
   - `npx playwright install --with-deps chromium`

2. Run the test suite to identify failures:
   - `npm run test:ci`
   - If `failing_tests` input is provided, focus on those files only

3. For each failing test (max 3 heal iterations per test):
   - Debug with Playwright MCP tools (`test_debug`, `browser_snapshot`)
   - Edit only files under `tests/`, `specs/`, `utilities/`, `scripts/`
   - Add healer trace comments:
     ```
     // healed-by: playwright-test-healer
     // healed-at: <today>
     // reason: <explanation>
     ```

4. If a test cannot be fixed after 3 iterations:
   - Mark with `test.fixme()` and explain why
   - Add entry to `specs/flaky-registry.md`

5. Re-run tests to verify fixes pass.

6. Create a pull request output with:
   - Branch: `agent/heal-<date>`
   - Title: `fix(tests): heal failing Playwright tests`
   - Body: list tests fixed, skipped, and reasoning

## Constraints

- Never edit `.env*` or application source code
- Never auto-merge — leave PR for human review
- Do not use `networkidle` or deprecated Playwright APIs
