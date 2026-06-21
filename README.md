# playwriteAgents

Project of end-to-end tests built with Playwright and TypeScript.

## Summary

This repository contains Playwright test automation for a sample e-commerce demo application. Tests are written in TypeScript and live under the `tests/` folder. The configuration lives in `playwright.config.ts` and test run scripts are defined in `package.json`.

## Key files and folders

- `package.json` - scripts and dev dependencies (uses `@playwright/test`).
- `playwright.config.ts` - Playwright configuration, environment presets, reporter settings and projects.
- `tests/` - Playwright test files (specs). Add new tests here.
- `utilities/` - helper utilities (support code used by tests).
- `artifacts/` - saved images and other artifact outputs.
- `test-results/` and `playwright-report/` - generated test reports and results.
- `results/results.xml` - JUnit-style results output by the reporter.

## Prerequisites

- Node.js (recommend LTS)
- npm

## Install

1. Install dependencies:

   npm install

2. Install Playwright browsers (required to run tests locally):

   npx playwright install

## Environment and configuration

The test environment is controlled by the `TEST_ENV` environment variable. Available environments and defaults are defined in `playwright.config.ts`. If `TEST_ENV` is not set, the `dev` preset is used.

Example presets (configured in repo):
- dev, qa, staging, prod

Each preset configures:
- `BASE_URL` — base application URL used with `page.goto('')`
- `HEADLESS` — whether tests run headless
- `RETRIES` — number of retries for failing tests

To run tests against a different environment set `TEST_ENV` before running the test command, for example:

  TEST_ENV=qa npm test

## Useful npm scripts

- Run tests (default configured):

  npm test

- Run tests headed (browser visible):

  npm run test:headed

- Open the HTML report:

  npm run show-report


You can also run Playwright directly for more control, for example:

- Run a specific spec or project (chromium):

  npx playwright test tests/example.spec.ts --project=chromium

- Run with grep to target tests by title:

  npx playwright test -g "add to cart"

## Reports and artifacts

- HTML report is saved to `playwright-report/` and can be opened via `npm run show-report`.
- JUnit XML output is written to `results/results.xml` (reporter configured in `playwright.config.ts`).
- Screenshots and other artifacts are stored under `artifacts/` and `test-results/` (Playwright's output folders).

## Test structure and writing tests

- Tests are TypeScript files using Playwright Test runner APIs. Follow the existing style in `tests/`.
- Use fixtures and helpers from `utilities/` and `tests/data/` as applicable.

## Contributing

- Create feature branches from `main` and open a pull request.
- Keep tests deterministic and avoid relying on external state where possible.

## License

This repository does not include a license file. Add one if you plan to share this project publicly.

---

If you want, I can update this README with more detail (examples, CI instructions, badges) or add a CONTRIBUTING.md. Let me know which additions you want.
