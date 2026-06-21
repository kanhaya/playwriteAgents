import { test, expect } from '@playwright/test';

test('Capture home page screenshot (scaffold)', async ({ page }) => {
  await page.goto('/');
  await page.screenshot({ path: 'artifacts/homepage.png', fullPage: true });
  expect(true).toBeTruthy();
});
