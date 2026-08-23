# playwriteAgents

Agent-driven Playwright test automation for a sample e-commerce demo application.

## Summary

This repository contains Playwright tests in TypeScript under `tests/`, plus a suite of **GitHub Copilot agents** that plan, generate, heal, and review tests autonomously via the Playwright MCP server.

**Pipeline:** Plan → Generate → Run → Heal → Review

See [ROADMAP.md](ROADMAP.md) for the full agentic testing roadmap.

## Key files and folders

- `package.json` — scripts and dev dependencies (`@playwright/test`)
- `playwright.config.ts` — Playwright configuration and environment presets
- `tests/` — Playwright test specs
- `tests/pages/` — Page Object Model classes
- `specs/` — Test plans, flaky registry, run reports
- `.github/agents/` — Custom Copilot agent definitions
- `utilities/` — Shared helpers
- `scripts/` — Plan coverage and automation scripts
- `results/results.xml` — JUnit output

## Prerequisites

- Node.js (LTS recommended)
- npm
- GitHub Copilot (for agent features)

## Install

```bash
npm install
npx playwright install
```

## Useful npm scripts

| Script | Description |
|--------|-------------|
| `npm test` | Run all tests |
| `npm run test:headed` | Run with visible browser |
| `npm run test:ci` | CI reporters (list + junit + html) |
| `npm run test:smoke` | Critical path smoke suite |
| `npm run test:debug` | Debug mode |
| `npm run test:report` | Open HTML report |
| `npm run mcp` | Start Playwright MCP server for agents |
| `npm run check:plan` | Verify plan ↔ test alignment |

## Environment

Set `TEST_ENV` before running tests: `dev` (default), `qa`, `staging`, `prod`.

```bash
TEST_ENV=qa npm test
```

## Agentic testing

### Agents

| Agent | When to use |
|-------|-------------|
| **Orchestrator** | Full pipeline: plan → generate → run → heal |
| **Planner** | Explore app and write `specs/test.plan.md` |
| **Generator** | Turn plan scenarios into Playwright specs |
| **Healer** | Debug and fix failing tests |
| **Reviewer** | Review test quality on PRs |
| **Architect** | Framework design and structure |

Agent definitions live in `.github/agents/`. Shared context: `.github/agents/AGENTS.md`.

### Running agents

**Copilot CLI:**
```bash
npm run mcp   # start MCP server in another terminal
copilot --agent playwright-test-orchestrator --prompt "Cover checkout flows end to end"
```

**VS Code / Cursor:** Open the Agents panel, select an agent, and prompt.

### Traceability

Every spec file includes headers:
```typescript
// spec: specs/test.plan.md
// seed: tests/seed.spec.ts
// generated-by: manual | playwright-test-generator
```

Healer edits add:
```typescript
// healed-by: playwright-test-healer
// reason: <explanation>
```

## CI

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | PR / push to main | Smoke tests + plan check |
| `nightly-regression.yml` | Daily 02:00 UTC | Full regression; opens issue on failure |
| `plan-drift-check.yml` | PR touching tests/specs | Plan alignment check |
| `playwright-test-healer.md` | After nightly failure | Agentic healer opens fix PR |

To enable agentic workflows, install the GitHub CLI extension:

```bash
brew install gh          # if needed
gh extension install github/gh-aw
gh aw init --engine copilot
gh aw compile
gh aw run playwright-test-healer   # manual healer run
```

Requires GitHub Copilot billing for the `copilot` engine. The compiled workflow is at `.github/workflows/playwright-test-healer.lock.yml`.

## Test structure

- TypeScript specs using Playwright Test APIs
- Page Object Model in `tests/pages/`
- Test data in `tests/data/`
- Helpers in `utilities/`

## Contributing

- Create feature branches from `main` and open a pull request
- Keep tests deterministic; update `specs/test.plan.md` when adding scenarios
- Run `npm run check:plan` before pushing

## License

No license file included. Add one if sharing publicly.

