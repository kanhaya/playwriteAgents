import { test, expect } from '@playwright/test';

test('Storage-state export/import scaffold', async ({ page, context }) => {
  await page.goto('/');
  const state = await context.storageState();
  expect(state).toBeTruthy();
});
