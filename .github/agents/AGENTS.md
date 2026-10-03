# Shared Agent Context

All agents in this repository must follow these conventions. Read this file before planning, generating, healing, or reviewing tests.

## Application under test

- **URL:** `https://rahulshettyacademy.com/seleniumPractise/#/`
- **Type:** E-commerce demo (Selenium Practice Store)
- **Routing:** Hash-based (`#/`); URL assertions should allow optional hash fragment
- **Promo codes:** Site may support promo/discount flows — verify in UI before asserting

## Repository layout

| Path | Purpose |
|------|---------|
| `specs/test.plan.md` | Master test plan (human + machine-readable YAML at bottom) |
| `specs/archive/` | Versioned plan history |
| `specs/flaky-registry.md` | Quarantined or repeatedly healed tests |
| `specs/run-reports/` | Agent run summaries |
| `tests/*.spec.ts` | Playwright test specs |
| `tests/pages/` | Page Object Model classes |
| `tests/data/` | JSON test data |
| `tests/seed.spec.ts` | Seed template for generator |
| `utilities/` | Shared helpers (a11y, resolveCtor) |
| `config/` | Environment config |
| `framework/` | Test context, run id, trace id, run manifest |
| `playwright.config.ts` | Playwright runner config |

## Environment

- `TEST_ENV` — `dev` (default), `qa`, `staging`, `prod`
- `BASE_URL` — set per environment in `playwright.config.ts`
- Run CI locally: `npm run test:ci`
- Start MCP server: `npm run mcp`

## Locator strategy (priority order)

1. `page.getByRole()` with accessible name
2. `page.getByTestId()` / `data-testid`
3. `page.getByLabel()` / `page.getByPlaceholder()`
4. `page.getByText()` with exact or regex
5. CSS selectors — only when no semantic locator exists

## Page Object Model

- Extend `BasePage` for shared navigation/waits
- Existing pages: `HomePage`, `CartPage`, `CheckoutPage`, `ProductPage`
- Reuse POM methods — do not duplicate selectors in specs

## Spec file contract

Every spec must start with:

```typescript
// spec: specs/test.plan.md
// seed: tests/seed.spec.ts
// generated-by: playwright-test-generator | manual
// generated-at: YYYY-MM-DD

import { test, expect } from '../framework/test';
```

Import `test` and `expect` from `framework/test` (path relative to the spec). That fixture assigns `runId` and `traceId` and sends them as `x-run-id` and `x-trace-id` on browser requests. Each run writes `results/results.xml` and `results/run-manifest.json`.

Healer edits must add:

```typescript
// healed-by: playwright-test-healer
// healed-at: YYYY-MM-DD
// reason: <brief explanation>
```

## Never do

- Do **not** use `waitForLoadState('networkidle')` — deprecated and flaky
- Do **not** use hardcoded `page.waitForTimeout()` — use `expect` or `locator.waitFor`
- Do **not** hardcode credentials or secrets
- Do **not** edit `.env*` files
- Do **not** modify application source code — only `tests/`, `specs/`, `utilities/`, `scripts/`

## Agent pipeline

```
Planner → specs/test.plan.md
Generator → tests/*.spec.ts
Runner → npm run test:ci
Healer → fix failing specs (max 3 iterations per test)
Reviewer → PR quality checklist
```

## Agents available

| Agent | File | When to use |
|-------|------|-------------|
| Orchestrator | `playwright-test-orchestrator.agent.md` | Full plan → generate → run → heal loop |
| Planner | `playwright-test-planner.agent.md` | Explore app and write test plan |
| Generator | `playwright-test-generator.agent.md` | Turn plan scenarios into Playwright specs |
| Healer | `playwright-test-healer.agent.md` | Debug and fix failing tests |
| Reviewer | `playwright-test-reviewer.agent.md` | Review test quality on PRs |
| Architect | `playwright-framework-architect.agent.md` | Framework design and structure |

## Invoking agents

```bash
# Copilot CLI
copilot --agent playwright-test-orchestrator --prompt "Cover checkout flows end to end"

# VS Code / Cursor: select agent from Agents panel, then prompt
```

## CI expectations

- PRs: smoke suite + plan drift check
- Nightly: full regression across chromium + firefox
- On nightly failure: healer workflow opens fix PR or documents skip
