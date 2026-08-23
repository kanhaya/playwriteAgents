// spec: specs/test.plan.md
// seed: tests/seed.spec.ts
// generated-by: manual
// generated-at: 2026-08-23

import { test, expect } from '@playwright/test';

test('Basic accessibility snapshot (scaffold)', async ({ page }) => {
  await page.goto('/');
  const snapshot = await page.accessibility.snapshot();
  // Ensure snapshot is an object and contains a root
  expect(typeof snapshot).toBe('object');
  expect(snapshot.role).toBeDefined();
});
