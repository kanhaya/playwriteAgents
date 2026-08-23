// spec: specs/test.plan.md
// seed: tests/seed.spec.ts
// generated-by: manual
// generated-at: 2026-08-23

import { test, expect } from '@playwright/test';

test('Capture home page screenshot (scaffold)', async ({ page }) => {
  await page.goto('/');
  await page.screenshot({ path: 'artifacts/homepage.png', fullPage: true });
  expect(true).toBeTruthy();
});
