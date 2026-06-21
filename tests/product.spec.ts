import { test, expect } from '@playwright/test';

test('Product detail opens from listing (scaffold)', async ({ page }) => {
  const { default: HomePage } = await import('./pages/HomePage');
  const { default: ProductPage } = await import('./pages/ProductPage');
  const home = new HomePage(page);
  const product = new ProductPage(page);

  await home.goto();
  await home.search('tomato');
  await product.openByName('Tomato');
  expect(await product.isVisible()).toBeTruthy();
});
