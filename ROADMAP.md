# Agentic Testing Roadmap

This roadmap turns **playwriteAgents** from an agent-enabled Playwright repo into an **agent-driven** testing system — where planning, generation, healing, and review happen with minimal manual handoff.

## Current state (baseline)

| Layer | Status |
|-------|--------|
| Custom agents (`.github/agents/`) | ✅ 4 agents defined (planner, generator, healer, architect) |
| Playwright MCP (`.vscode/mcp.json`) | ✅ Configured |
| Test plan artifact (`specs/test.plan.md`) | ✅ Exists |
| Generated-test traceability | ❌ No `// spec:` / `// seed:` markers in specs |
| CI agent integration | ❌ CI only runs `playwright test` |
| Self-healing on failure | ❌ Healer is manual-only |
| Multi-agent orchestration | ❌ No coordinator agent or workflow |

**Target maturity:** move from ~4/10 to ~8/10 agentic within 4 phases.

## Implementation status (2026-08-23)

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 0 — Foundation | ✅ Done | Workflow fix, npm scripts, README, agent rename |
| Phase 1 — Traceability | ✅ Done | Spec headers, plan archive, healer contract, orchestrator |
| Phase 2 — CI integration | ✅ Done | Consolidated CI, nightly, plan drift, healer workflow |
| Phase 3 — Smarter agents | ✅ Done | AGENTS.md, YAML scenarios, reviewer, flaky registry |
| Phase 4 — Full autonomy | ⏳ Pending | Event-driven triggers, impact agent, metrics dashboard |

**Completed 2026-08-23 follow-up:**
- Upgraded `@playwright/test` to 1.62.1 (fixes Node 22+/23 import loader bug)
- Fixed `HomePage` navigation (`goto('')` not `goto('/')`) and cart selectors
- All smoke tests passing (`npm run test:smoke`)
- `gh aw init` + compiled `playwright-test-healer.lock.yml`

**Next:** Enable `permissions.copilot-requests: write` for token-based healer runs; add TC IDs to spec files for stricter plan coverage.

---

## Phase 0 — Foundation fixes (1–2 days)

> Fix broken plumbing so agents and CI behave predictably.

### 0.1 Fix Copilot setup workflow

**File:** `.github/workflows/copilot-setup-steps.yml`

**Problem:** `npx run build` fails — there is no `build` script in `package.json`.

**Change:**
```yaml
- name: Verify Playwright install
  run: npx playwright --version
```

**Acceptance:** Workflow passes on push to `main`.

---

### 0.2 Add npm scripts agents rely on

**File:** `package.json`

Add scripts so humans *and* agents invoke the same commands:

```json
{
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "test:report": "playwright show-report",
    "test:ci": "playwright test --reporter=list,junit,html",
    "mcp": "playwright run-test-mcp-server"
  }
}
```

**Acceptance:** `npm run test:ci` produces `results/results.xml` and `playwright-report/`.

---

### 0.3 Document the agent workflow in README

**File:** `README.md`

Add a section covering:
- The 4 agents and when to use each
- How to start the MCP server locally (`npm run mcp`)
- The intended pipeline: **Plan → Generate → Run → Heal**
- Links to `specs/` and `ROADMAP.md`

**Acceptance:** A new contributor can run the agent pipeline without tribal knowledge.

---

### 0.4 Standardize agent file naming

**Files:** `.github/agents/`

Rename for consistency (Copilot expects `.agent.md`):
- `playwright_framework_architect_agent.md` → `playwright-framework-architect.agent.md`

Update any references in docs.

**Acceptance:** All agent files follow `*.agent.md` convention.

---

## Phase 1 — Traceability & conventions (2–3 days)

> Make it obvious which artifacts came from which agent, so the pipeline is auditable.

### 1.1 Generator output contract

Every agent-generated spec must start with:

```typescript
// spec: specs/test.plan.md
// seed: tests/seed.spec.ts
// generated-by: playwright-test-generator
// generated-at: 2026-08-23
```

**Files to update:** all `tests/*.spec.ts` (retroactively tag existing specs as `generated-by: manual` or re-run generator).

**Acceptance:** `rg "generated-by" tests/` returns every spec file.

---

### 1.2 Plan versioning

**Structure:**
```
specs/
  README.md
  test.plan.md          # latest
  archive/
    test.plan.2026-08-23.md
```

**Planner agent change:** instruct `playwright-test-planner.agent.md` to:
1. Save to `specs/test.plan.md`
2. Copy prior plan to `specs/archive/test.plan.<date>.md` before overwrite

**Acceptance:** Re-running planner preserves history.

---

### 1.3 Healer edit contract

**Update:** `playwright-test-healer.agent.md`

Require a comment block on every fix:

```typescript
// healed-by: playwright-test-healer
// healed-at: 2026-08-23
// reason: selector changed from .cart-count to [data-testid="cart-badge"]
```

**Acceptance:** Healer never edits without leaving a trace comment.

---

### 1.4 Add a coordinator agent

**New file:** `.github/agents/playwright-test-orchestrator.agent.md`

**Role:** Single entry point that chains sub-agents:

```
1. If no plan exists or plan is stale → invoke planner
2. For each uncovered scenario in plan → invoke generator
3. Run test suite (test_run)
4. For each failure → invoke healer (max 3 iterations per test)
5. Produce summary markdown in specs/run-reports/<date>.md
```

**Tools:** `search`, `edit`, all `playwright-test/*` tools.

**Acceptance:** One prompt ("cover checkout flows") drives the full loop.

---

## Phase 2 — CI integration (3–5 days)

> Agents run on schedule or on failure, not only when a human remembers.

### 2.1 PR smoke gate (traditional — keep)

**File:** `.github/workflows/ci.yml` (consolidate duplicate `playwright.yml`)

On every PR:
- `npm ci`
- `npx playwright install --with-deps`
- `npm run test:ci`
- Upload HTML + JUnit artifacts

**Acceptance:** One canonical CI workflow; delete or merge `playwright.yml`.

---

### 2.2 Nightly regression + failure artifact

**New file:** `.github/workflows/nightly-regression.yml`

```yaml
on:
  schedule:
    - cron: '0 2 * * *'   # 02:00 UTC daily
  workflow_dispatch:
```

Steps:
1. Run full suite across chromium + firefox
2. Upload `playwright-report/`, `test-results/`, traces
3. On failure: open/update a GitHub Issue labeled `test-failure` with JUnit summary

**Acceptance:** Nightly run produces an issue when tests fail.

---

### 2.3 Agentic healer workflow (GitHub Agentic Workflows)

**Goal:** On test failure, automatically attempt a fix PR.

**Option A — GitHub Agentic Workflows (recommended)**

```bash
gh extension install github/gh-aw
gh aw init
```

**New file:** `.github/workflows/playwright-test-healer.md` (agentic workflow)

Trigger: `workflow_dispatch` + `workflow_run` after nightly failure.

Instructions (natural language in the workflow file):
1. Checkout repo
2. Run `playwright-test-healer` agent with failing test names from JUnit XML
3. Open PR with label `agent-healed` if tests pass
4. If still failing after 3 iterations → add `test.fixme()` + explanation, open PR anyway

**Option B — Copilot coding agent (simpler, less control)**

On nightly failure issue, comment:
```
@copilot run playwright-test-healer on failing tests listed above
```

**Acceptance:** A failing nightly run produces either a green fix PR or a documented `test.fixme()` PR within 24h.

---

### 2.4 PR plan drift check

**New file:** `.github/workflows/plan-drift-check.yml`

On PRs that touch `tests/`:
1. Parse `specs/test.plan.md` scenario list
2. Check each scenario has a matching `test()` title or `// spec:` reference
3. Fail with a clear diff if coverage gaps exist

Start simple — a Node script `scripts/check-plan-coverage.ts` that greps plan TC IDs vs spec files.

**Acceptance:** PR adding a test without updating the plan (or vice versa) gets a actionable CI comment.

---

## Phase 3 — Smarter agents (1–2 weeks)

> Agents reason better with shared context and guardrails.

### 3.1 Shared agent context file

**New file:** `.github/agents/AGENTS.md`

Contents:
- App under test URL and quirks (hash routing, promo codes)
- POM locations (`tests/pages/`)
- Locator strategy (prefer `getByRole`, `data-testid`, avoid brittle CSS)
- Environment variables (`TEST_ENV`, `BASE_URL`)
- "Never do" list (no `networkidle`, no hardcoded sleeps)

Reference this file from all 4+ agent frontmatter via instructions.

**Acceptance:** All agents follow the same conventions without duplicating prompts.

---

### 3.2 Strengthen planner → generator handoff

**Planner output schema** — add machine-readable block at bottom of `test.plan.md`:

```yaml
---
scenarios:
  - id: TC-C1
    file: tests/cart.spec.ts
    title: "Add single product updates cart badge"
    steps:
      - action: navigate
        target: home
      - action: click
        target: "Add to cart on Broccoli"
    assertions:
      - "cart badge shows 1"
---
```

**Generator agent:** parse YAML block first; fall back to markdown steps if missing.

**Acceptance:** Generator produces consistent file names and test titles from structured plan.

---

### 3.3 Add test-review agent

**New file:** `.github/agents/playwright-test-reviewer.agent.md`

**Role:** PR reviewer for test quality (not app code).

Checks:
- Flaky patterns (fixed timeouts, `networkidle`)
- Missing assertions
- Locator brittleness
- POM reuse vs duplicated selectors
- Plan coverage

**Trigger:** Run manually on PRs touching `tests/`, or via agentic workflow.

**Acceptance:** Reviewer outputs a checklist comment on PRs.

---

### 3.4 Flaky test registry

**New file:** `specs/flaky-registry.md`

Healer and reviewer update this when:
- A test is marked `test.fixme()`
- A test needed 2+ heal iterations
- A test is quarantined with `test.describe.configure({ retries: 3 })`

**Acceptance:** Team has a single view of unreliable tests and why.

---

## Phase 4 — Full autonomy (2–4 weeks)

> Minimal human intervention for routine test maintenance.

### 4.1 Event-driven orchestration

| Event | Agent action |
|-------|--------------|
| New feature branch | Orchestrator runs planner on changed pages |
| PR opened | Reviewer agent comments; smoke tests run |
| Nightly failure | Healer opens fix PR |
| App deploy to staging | Full regression via `TEST_ENV=staging` |
| Plan updated on `main` | Generator creates/updates specs for new scenarios |

Implement via GitHub Agentic Workflows or a thin `scripts/trigger-agent.sh` wrapper around `copilot --agent`.

---

### 4.2 Test impact analysis agent

**New file:** `.github/agents/playwright-test-impact.agent.md`

On PRs that change `tests/pages/` or app-facing config:
1. Map changed POM methods → affected spec files
2. Output minimal test subset to run: `npx playwright test tests/cart.spec.ts tests/checkout.spec.ts`
3. Post as PR comment to save CI time

**Acceptance:** PR CI runs impacted tests first; full suite on merge.

---

### 4.3 Metrics dashboard

Track agent effectiveness in `specs/run-reports/`:

| Metric | Source |
|--------|--------|
| Tests generated by agent | `generated-by` header count |
| Tests healed by agent | `healed-by` header count |
| Heal success rate | healed PRs merged vs reverted |
| Mean time to fix (MTTF) | nightly failure → green PR |
| Flaky test count | `flaky-registry.md` entries |

Optional: publish to GitHub Pages from nightly workflow.

**Acceptance:** Monthly report shows agent ROI.

---

### 4.4 API testing agent (stretch)

Architect agent already describes API layer. Add:

**New file:** `.github/agents/playwright-api-generator.agent.md`

Generate `tests/api/*.spec.ts` using `request` fixture + Zod schemas.

**Acceptance:** At least one API spec generated and passing in CI.

---

## Implementation priority (do this order)

```
Week 1   Phase 0 (fixes) + Phase 1.1–1.2 (traceability)
Week 2   Phase 1.3–1.4 (healer contract + orchestrator agent)
Week 3   Phase 2.1–2.2 (CI consolidation + nightly)
Week 4   Phase 2.3 (agentic healer workflow)
Week 5+  Phase 3 (smarter agents) → Phase 4 (autonomy)
```

---

## Quick wins you can do today

1. Fix `copilot-setup-steps.yml` (`npx run build` → `npx playwright --version`)
2. Add `// spec:` headers to one spec as a template for the rest
3. Run planner against the app and diff against existing `test.plan.md`
4. Invoke healer on any currently failing test: `copilot --agent playwright-test-healer --prompt "Fix failing cart tests"`
5. Merge `ci.yml` and `playwright.yml` into one workflow

---

## Success criteria (definition of done)

The repo is **agent-driven** when:

- [ ] A new user flow can go from **plan → generated spec → green CI** with one orchestrator prompt
- [ ] Nightly failures produce an **agent PR or documented skip** within 24 hours
- [ ] Every spec file is traceable to a plan scenario via headers or TC IDs
- [ ] CI enforces plan/test alignment on PRs
- [ ] README documents the full agent pipeline
- [ ] Agent metrics show >70% heal success rate over 30 days

---

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Agent opens bad PRs | Require PR review; limit healer to `tests/` only |
| Runaway agent loops | Cap iterations (3 per test); cost alerts on Copilot usage |
| Flaky tests healed incorrectly | Reviewer agent + flaky registry; never auto-merge |
| Plan drift | CI plan-coverage check |
| Secret leakage in agent PRs | Healer tools: no `edit` on `.env*`; secret scanning in CI |

---

## References

- [Playwright Test MCP](https://playwright.dev/docs/test-mcp)
- [GitHub Custom Agents](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-custom-agents)
- [GitHub Agentic Workflows](https://docs.github.com/en/copilot/how-tos/github-agentic-workflows/creating-github-agentic-workflows)
- Repo agents: `.github/agents/`
- Test plan: `specs/test.plan.md`
