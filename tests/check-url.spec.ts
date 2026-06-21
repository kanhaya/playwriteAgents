import { test, expect } from '@playwright/test';

test('Load Rahul Shetty Selenium Practise homepage', async ({ page }) => {
  await page.goto('https://rahulshettyacademy.com/seleniumPractise/');
  await page.waitForLoadState('domcontentloaded');
  // Accept either the base URL or the one with the hash fragment the site redirects to
  await expect(page).toHaveURL(/https:\/\/rahulshettyacademy\.com\/seleniumPractise(\/#\/)?$/);
});
