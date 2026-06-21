import { test, expect } from '@playwright/test';

test('Search & add flow on mobile viewport (scaffold)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const { default: HomePage } = await import('./pages/HomePage');
  const home = new HomePage(page);
  await home.goto();
  await home.search('apple');
  // ensure at least one product shows
  const products = home.getProducts();
  await expect(products).toHaveCountGreaterThan(0);
});
