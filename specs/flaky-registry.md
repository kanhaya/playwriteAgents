# Flaky Test Registry

Tests listed here have been quarantined, repeatedly healed, or marked `test.fixme()`.
The healer and reviewer agents update this file when a test cannot be stabilized.

| Test file | Test title | Status | Reason | Date | Agent |
|-----------|-----------|--------|--------|------|-------|
| _none yet_ | — | — | — | — | — |

## Status values

- `fixme` — skipped via `test.fixme()`, needs manual investigation
- `quarantined` — runs with extra retries, not blocking PR smoke
- `healed` — fixed by healer but watch for recurrence
- `flaky` — passes intermittently, under observation

## How to add an entry

When healer marks `test.fixme()` or a test fails 2+ heal iterations:

```markdown
| tests/cart.spec.ts | Add single product updates badge | fixme | Selector .cart-count removed from DOM | 2026-08-23 | playwright-test-healer |
```
