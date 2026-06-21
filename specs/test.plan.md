# Test Plan - Selenium Practice Store

Overview
- Application: https://rahulshettyacademy.com/seleniumPractise/#/
- Goal: Provide a maintainable Playwright UI automation framework that covers core shopping flows: search, add to cart, update quantity, checkout and promo handling; plus stability, accessibility and regression checks.
- Approach: Playwright Test + TypeScript, Page Object Model (POM), fixtures, reporters, CI, and data-driven specs.

Suites (expanded)

1) Search & Product Listing
- File: `tests/search-and-add.spec.ts`
- Purpose: Verify search, product listing, pagination/filtering (if any) and product card details.
- Test cases:
  - TC-S1: Search returns relevant products for a query (single match).
  - TC-S2: Search returns multiple matches and shows correct count.
  - TC-S3: Product card shows name, price, and Add to Cart button.
  - TC-S4: Empty/whitespace search shows full product list or no-results message.
  - TC-S5: Case-insensitive search and partial-match behavior.
  - TC-S6: Special characters input handled gracefully.

2) Product Details & Navigation
- File: `tests/product.spec.ts`
- Purpose: Validate product detail view and navigation from listing.
- Test cases:
  - TC-P1: Clicking product name/image opens details (if available) or focuses card.
  - TC-P2: Product detail contains price, description and add-to-cart controls.

3) Cart Basic Operations
- File: `tests/cart.spec.ts`
- Purpose: Verify cart operations, persistence and price calculations.
- Test cases:
  - TC-C1: Add single product to cart updates cart badge.
  - TC-C2: Add multiple different products and verify badge increments accordingly.
  - TC-C3: Update quantity in cart updates line total and grand total.
  - TC-C4: Remove item updates totals and badge; empty-cart state shown.
  - TC-C5: Cart persists across navigation within session (localStorage/session storage checks).
  - TC-C6: Adding the same product twice increases quantity (if UI supports) vs separate line items.

4) Checkout & Promo
- File: `tests/checkout.spec.ts`
- Purpose: End-to-end checkout verification, promo validation and order summary.
- Test cases:
  - TC-CHK1: Proceed to checkout flow displays correct order summary.
  - TC-CHK2: Apply valid promo code -> discount applied, message shown.
  - TC-CHK3: Apply invalid promo code -> error message shown, totals unchanged.
  - TC-CHK4: Remove promo -> totals revert to original.
  - TC-CHK5: Complete checkout (simulate placing order) and validate confirmation message.

5) Payment Simulation (scaffold)
- File: `tests/payment.spec.ts`
- Purpose: If payment step exists, validate payment form validation and success/failure handling.
- Test cases:
  - TC-PAY1: Payment form validation for required fields.
  - TC-PAY2: Simulate successful payment flow (stub network if necessary).

6) Promo & Discounts (edge cases)
- File: `tests/promo.spec.ts`
- Purpose: Validate discount math, stacking rules and edge conditions.
- Test cases:
  - TC-P1: Large quantities and rounding behavior.
  - TC-P2: Expired promo codes message/handling.
  - TC-P3: Promo code concurrency (apply then remove rapidly).

7) Accessibility & ARIA checks
- File: `tests/accessibility.spec.ts`
- Purpose: Basic automated accessibility smoke checks.
- Test cases:
  - TC-A1: Main pages have meaningful landmarks/roles (use Playwright accessibility snapshot).
  - TC-A2: Important interactive elements are keyboard-focusable.

8) Visual & Regression checks
- File: `tests/visual.spec.ts` (optional)
- Purpose: Capture baseline screenshots for critical pages and compare in CI when required.
- Test cases:
  - TC-V1: Home page baseline screenshot on desktop width.
  - TC-V2: Cart/Checkout pages baseline screenshots.

9) Network & Error Handling
- File: `tests/network.spec.ts`
- Purpose: Validate graceful failure when APIs return errors or network is offline.
- Test cases:
  - TC-N1: Simulate offline mode -> app shows offline indicator or meaningful error.
  - TC-N2: Mock product API failure -> UI shows retry/error message.

10) Responsiveness / Mobile views
- File: `tests/responsive.spec.ts`
- Purpose: Ensure critical flows work in mobile viewport(s).
- Test cases:
  - TC-R1: Search & add flow on narrow viewport (e.g., 375x812).
  - TC-R2: Cart/Checkout layout adapts and remains usable.

11) Security / Cookies & Storage
- File: `tests/storage.spec.ts`
- Purpose: Verify storage behavior and cookie flags where accessible.
- Test cases:
  - TC-SC1: Storage-state export/import (Playwright storageState) reproducible.
  - TC-SC2: Sensitive cookies are flagged HttpOnly/Secure in supported envs (where visible).

Test Data & Variants
- Data-driven tests: use `tests/data/*.json` for queries, promo codes, and product sets.
- Use parameterized tests (test.describe.parallel with test.each equivalent) to run combos.

Assumptions
- Tests start from a fresh browser context unless storageState is explicitly used.
- Tests do not require authenticated users by default.
- Live site may redirect to `#/` fragment; URL assertions allow optional hash.

Stability & Flakiness Mitigation
- Use explicit waits via Playwright expect/locator.waitFor when asserting dynamic UI.
- Use retries in CI (configured in `playwright.config.ts`).
- Capture trace on first retry and screenshot on failure.

Tagging & Priorities
- High: Critical flows (Search, Cart, Checkout) — run on every PR.
- Medium: Promo, Persistence, Mobile — run nightly or on-demand.
- Low: Visual baselines — run on release branches.

CI Strategy
- Run smoke suite (high-priority) on PRs (fast, minimal tests).
- Run full suite nightly or on merges to main.
- Export junit + HTML reports and artifacts for failed runs.

Deliverables
- Implement POM classes for new pages: `tests/pages/*`.
- Add data files in `tests/data/` and fixtures in `tests/fixtures.ts`.
- Implement CI gating for smoke vs full suites.

Estimated effort (scaffolded implementation)
- Scaffold POM + 6 core tests: 2–4 hours.
- Full suite (all cases + robustness): 1–2 days depending on selector work and site behavior.

Next actions I can take now
- Implement the `HomePage.search()` stabilization and re-run the `search-and-add` test.
- Scaffold selected new test files (pick which suites to generate).
- Generate data-driven variants for search and promo tests.
