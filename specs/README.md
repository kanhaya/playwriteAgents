# Specs

This directory holds test plans, agent run reports, and flaky test tracking.

| Path | Purpose |
|------|---------|
| `test.plan.md` | Master test plan (markdown + YAML scenarios at bottom) |
| `archive/` | Versioned plan snapshots before planner overwrites |
| `flaky-registry.md` | Quarantined or repeatedly healed tests |
| `run-reports/` | Daily orchestrator run summaries |

## Plan ↔ test alignment

Run locally:

```bash
npm run check:plan
```

CI runs this on every PR that touches `tests/` or `specs/`.
