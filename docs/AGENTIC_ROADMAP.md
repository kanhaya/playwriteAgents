# Agentic Testing Roadmap

A phased plan to evolve `playwriteAgents` from **agent-enabled** (dev-time Copilot assistants) to **agent-driven** (automated plan → generate → heal loops with traceability).

---

## Current State (Baseline)

| Layer | Status |
|-------|--------|
| Playwright test suite | ✅ 14 specs, POM, multi-env config, CI |
| Copilot agents | ✅ 4 agents in `.github/agents/` |
| Playwright MCP | ✅ `.vscode/mcp.json` |
| Test plan artifact | ✅ `specs/test.plan.md` |
| Generator provenance | ❌ No `// spec:` / `// seed:` markers in tests |
| Automated agent runs | ❌ CI only runs `playwright test` |
| Self-healing on failure | ❌ Healer exists but is manual-only |
| Orchestration | ❌ No pipeline connecting agents |

**Target maturity:** move from ~4/10 to ~8/10 agentic without sacrificing determinism in CI.

---

## Design Principles

1. **Agents propose; CI validates.** Generated or healed code must pass the same gates as human-written code.
2. **Traceability over magic.** Every agent-produced file carries metadata (source plan, agent version, run ID).
3. **Human approval at boundaries.** Auto-merge healed tests only after bounded retries and diff review.
4. **Smoke first.** Agent loops run against a fast smoke subset before full regression.
5. **Fail safe.** If the agent cannot fix within N attempts, open an issue — do not silently `test.fixme()` everything.

---

## Architecture (Target)

```
┌─────────────────────────────────────────────────────────────────┐
│                     Human / Scheduled Triggers                   │
│   (new feature, nightly, PR failure, plan refresh)                │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────┐     ┌────────────────────────┐
│  Planner Agent         │────▶│  specs/*.plan.md       │
│  (explore + MCP)       │     │  + specs/manifest.json │
└────────────────────────┘     └───────────┬────────────┘
                                           │
                                           ▼
┌────────────────────────┐     ┌────────────────────────┐
│  Generator Agent       │────▶│  tests/**/*.spec.ts  │
│  (record + write)      │     │  (with provenance hdr) │
└────────────────────────┘     └───────────┬────────────┘
                                           │
                                           ▼
┌────────────────────────┐     ┌────────────────────────┐
│  Playwright CI         │────▶│  junit + HTML + trace  │
└────────────┬───────────┘     └────────────────────────┘
             │ on failure (bounded)
             ▼
┌────────────────────────┐     ┌────────────────────────┐
│  Healer Agent          │────▶│  PR or draft commit    │
│  (debug loop ≤3)       │     │  + agent-run log       │
└────────────────────────┘     └────────────────────────┘
```

---

## Phase 0 — Foundation (1–2 days)

**Goal:** Make agent output auditable and tests CI-friendly before adding automation.

### 0.1 Provenance headers on all specs

Add a standard header block to every `tests/**/*.spec.ts`:

```typescript
// spec: specs/test.plan.md
// seed: tests/seed.spec.ts
// agent: playwright-test-generator
// generated: 2026-08-23T00:00:00Z
// manual-edits: none
```

**Files to change:**
- All files in `tests/*.spec.ts`
- Update `.github/agents/playwright-test-generator.agent.md` to require this header

**Acceptance criteria:**
- [ ] Every spec references its plan section
- [ ] `grep -r "// spec:" tests/` returns all spec files

### 0.2 Plan manifest

Create `specs/manifest.json` linking plan sections to spec files:

```json
{
  "version": 1,
  "application": "https://rahulshettyacademy.com/seleniumPractise/#/",
  "suites": [
    {
      "id": "search-and-add",
      "planSection": "1) Search & Product Listing",
      "specFile": "tests/search-and-add.spec.ts",
      "priority": "high",
      "tags": ["@smoke"]
    }
  ]
}
```

**Acceptance criteria:**
- [ ] Manifest covers all 11 suites in `specs/test.plan.md`
- [ ] Planner agent updated to maintain manifest via `planner_save_plan`

### 0.3 Smoke tagging

Tag critical tests with `@smoke` in titles or via `test.describe` metadata.

**Files:**
- `playwright.config.ts` — add a `smoke` project or grep config
- `package.json` — add `"test:smoke": "playwright test --grep @smoke"`

**Acceptance criteria:**
- [ ] `npm run test:smoke` completes in < 3 minutes locally
- [ ] CI smoke job runs on every PR

### 0.4 Consolidate duplicate CI workflows

Merge `.github/workflows/ci.yml` and `.github/workflows/playwright.yml` into one workflow with `smoke` and `full` jobs.

**Acceptance criteria:**
- [ ] Single workflow file, two jobs, shared setup via composite action or reusable workflow

---

## Phase 1 — Traceable Agent Workflow (2–3 days)

**Goal:** Formalize the manual planner → generator → healer loop so any team member can repeat it.

### 1.1 Agent run log directory

```
agent-runs/
  .gitkeep
  README.md          # explains retention policy; logs are gitignored
```

Add to `.gitignore`:
```
agent-runs/*
!agent-runs/.gitkeep
!agent-runs/README.md
```

Each agent session saves:
- `agent-runs/<timestamp>-<agent>-<suite>.json` — tool calls, model, outcome
- Link run ID in spec header `// agent-run: 20260823-143022-generator-search`

### 1.2 Orchestrator playbook (human-driven)

Create `docs/AGENT_WORKFLOW.md` with exact steps:

1. **Plan refresh:** invoke `@playwright-test-planner` with target URL + scope
2. **Generate:** invoke `@playwright-test-generator` with plan path + seed spec
3. **Validate:** `npm run test:smoke`
4. **Heal:** invoke `@playwright-test-healer` on failures
5. **Commit:** only after smoke + lint pass

### 1.3 Strengthen agent definitions

| Agent | Add |
|-------|-----|
| Planner | Must update `specs/manifest.json`; must tag priority per suite |
| Generator | Must write provenance header; must not edit unrelated files |
| Healer | Max 3 fix iterations per test; must append `// heal-log:` comment |
| Architect | Must diff against current folder structure before proposing moves |

**Acceptance criteria:**
- [ ] Documented workflow in `docs/AGENT_WORKFLOW.md`
- [ ] All four agent files updated with guardrails

### 1.4 Seed spec as generator anchor

Flesh out `tests/seed.spec.ts` with shared `beforeEach` (goto, cookie dismiss) so generator output is consistent.

**Acceptance criteria:**
- [ ] Generator references seed in every new spec
- [ ] Seed spec passes independently

---

## Phase 2 — CI-Triggered Healing (3–5 days)

**Goal:** On PR/main failure, automatically attempt bounded self-healing and surface a fix PR.

### 2.1 Failure artifact upload (enhance existing CI)

On test failure, upload:
- `playwright-report/`
- `test-results/` (traces, screenshots)
- `results/results.xml`

Already partially done — ensure traces are `on-first-retry` or `retain-on-failure`.

### 2.2 `heal-on-failure` GitHub Actions job

New workflow: `.github/workflows/agent-heal.yml`

```yaml
# Trigger: workflow_run after Playwright Tests completes with failure
# OR: workflow_dispatch with inputs (failed-spec, branch)
```

**Job steps (high level):**
1. Download failure artifacts from triggering run
2. Checkout branch
3. Install deps + Playwright browsers
4. Run healer via GitHub Copilot Agent API *or* Cursor Cloud Agent *or* `gh copilot` (whichever you standardize on)
5. Run `npm run test:smoke` on healed code
6. If pass: open draft PR with label `agent-healed`
7. If fail after 3 attempts: create issue with trace links, `@mention` owner

> **Note:** GitHub Copilot coding agent availability depends on your org plan. If API access is limited, use `workflow_dispatch` + human `@playwright-test-healer` invocation as an interim step, but still automate artifact collection and PR template.

### 2.3 Heal PR template

`.github/pull_request_template_agent_heal.md`:
- Failing test name(s)
- Root cause summary (from healer)
- Files changed
- Smoke re-run result
- Checkbox: "I reviewed agent changes"

### 2.4 Guardrails in healer agent

Add to `playwright-test-healer.agent.md`:
- Never change `playwright.config.ts` or CI files
- Never delete tests — only fix or `test.fixme()` with justification
- Max 50 lines changed per test file per iteration
- Prefer locator updates over increasing timeouts

**Acceptance criteria:**
- [ ] Failed CI run produces artifact bundle within 5 minutes
- [ ] Heal workflow opens draft PR or issue 100% of the time (no silent failure)
- [ ] No auto-merge without human approval

---

## Phase 3 — Scheduled Plan & Generate Loop (1 week)

**Goal:** Nightly drift detection — replan, regenerate impacted specs, open PR.

### 3.1 Nightly smoke + drift check

Schedule: `.github/workflows/nightly-agent.yml` (cron `0 2 * * *`)

1. Run `npm run test:smoke`
2. If failures → trigger heal workflow (Phase 2)
3. If pass → optional planner "drift scan" (see 3.2)

### 3.2 Drift scan (planner diff)

Planner explores live app and diffs against `specs/test.plan.md`:
- New UI flows → new plan sections
- Removed flows → mark specs deprecated in manifest

Output: `specs/drift-report-<date>.md` committed to a bot branch.

### 3.3 Impact-based regeneration

Use `specs/manifest.json` to regenerate only impacted specs:

```
manifest.suites.filter(s => s.planSection in driftReport.changedSections)
```

Generator runs per impacted suite; opens single PR with all changes.

### 3.4 Test impact analysis (lightweight)

Add `scripts/impact-map.ts`:
- Map `tests/pages/*` selectors → spec files (static grep)
- When a page object changes in a PR, comment which specs are affected

**Acceptance criteria:**
- [ ] Nightly workflow runs without manual trigger
- [ ] Drift report generated at least weekly
- [ ] Regeneration PRs are scoped (not whole-suite rewrites)

---

## Phase 4 — Full Agentic Maturity (2+ weeks, optional)

**Goal:** Multi-agent orchestration, review agent, metrics dashboard.

### 4.1 Orchestrator agent (new)

Create `.github/agents/playwright-orchestrator.agent.md`:

```
Inputs:  trigger (plan|generate|heal|full), scope (suite id | @smoke | all)
Steps:   read manifest → dispatch sub-agent → validate → commit/PR
Tools:   read files, run test:smoke, create PR (via gh MCP if available)
```

This replaces the human playbook for routine operations.

### 4.2 Review agent (new)

`.github/agents/playwright-test-reviewer.agent.md`:
- Reviews agent-generated PRs for flaky patterns (`waitForTimeout`, `networkidle`, brittle CSS selectors)
- Checks provenance headers present
- Suggests POM extractions when locators repeat

Runs on PRs with label `agent-generated` or `agent-healed`.

### 4.3 Metrics

Track in `agent-runs/metrics.json` (or external dashboard):

| Metric | Purpose |
|--------|---------|
| Heal success rate | Is healer actually helping? |
| Mean iterations to green | Tune healer prompts |
| Agent-generated test flake rate | vs human-written |
| Plan drift frequency | How often UI changes |

### 4.4 Runtime locator resilience (optional, advanced)

If flake rate stays high, add a thin resolver layer:

```typescript
// utilities/locatorResolver.ts
// Tries data-testid → role → text; logs resolution path for healer
```

Not LLM-at-runtime — deterministic fallback chain that reduces healer invocations.

**Acceptance criteria:**
- [ ] Orchestrator can run `full` pipeline end-to-end with one command
- [ ] Review agent blocks merge on critical anti-patterns
- [ ] Monthly metrics review doc template exists

---

## Priority Matrix

| Phase | Effort | Impact | Do first if… |
|-------|--------|--------|--------------|
| **0** Foundation | Low | High | Always — unblocks everything |
| **1** Traceable workflow | Low | High | You use agents manually today |
| **2** CI healing | Medium | Very high | CI failures are your main pain |
| **3** Nightly drift | Medium | Medium | App changes frequently |
| **4** Full orchestration | High | Medium | Team scale / multiple apps |

**Recommended order:** 0 → 1 → 2 → 3 → 4

---

## File Checklist (Quick Reference)

| File | Phase | Action |
|------|-------|--------|
| `specs/manifest.json` | 0 | Create |
| `docs/AGENT_WORKFLOW.md` | 1 | Create |
| `docs/AGENTIC_ROADMAP.md` | — | This file |
| `tests/seed.spec.ts` | 1 | Implement shared setup |
| `tests/**/*.spec.ts` | 0 | Add provenance headers |
| `playwright.config.ts` | 0 | Smoke grep / project |
| `package.json` | 0 | `test:smoke` script |
| `.github/workflows/playwright.yml` | 0 | Merge + smoke/full jobs |
| `.github/workflows/agent-heal.yml` | 2 | Create |
| `.github/workflows/nightly-agent.yml` | 3 | Create |
| `.github/agents/playwright-orchestrator.agent.md` | 4 | Create |
| `.github/agents/playwright-test-reviewer.agent.md` | 4 | Create |
| `agent-runs/` | 1 | Create + gitignore |
| `scripts/impact-map.ts` | 3 | Create |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Agent introduces flaky `waitForTimeout` | Review agent + lint rule banning `waitForTimeout` |
| Healer weakens assertions to pass | Healer prompt: "never remove expect() calls" |
| Runaway agent loops / cost | Hard cap: 3 heal iterations, smoke-only in CI |
| Live site changes break all tests | Drift scan + manifest priorities; stub network for critical APIs later |
| Secrets in agent logs | Gitignore `agent-runs/`; scrub tokens in workflow |
| Two CI workflows diverge | Phase 0.4 consolidation |

---

## Success Metrics (3-month targets)

| Metric | Today | Target |
|--------|-------|--------|
| Specs with provenance headers | 0% | 100% |
| CI failures with auto-heal attempt | 0% | 80% |
| Heal success rate (smoke) | N/A | ≥ 60% |
| Mean time to fix flaky test | Manual hours | < 30 min (agent draft PR) |
| Plan drift detected proactively | Never | Weekly report |

---

## Immediate Next Steps (This Week)

1. **Phase 0.1** — Add provenance headers to all 14 spec files
2. **Phase 0.2** — Create `specs/manifest.json` from existing plan
3. **Phase 0.3** — Add `@smoke` tags + `npm run test:smoke`
4. **Phase 0.4** — Consolidate CI workflows
5. **Phase 1.2** — Write `docs/AGENT_WORKFLOW.md` (operational runbook)

Say which phase you want implemented first and we can execute it in Agent mode.
