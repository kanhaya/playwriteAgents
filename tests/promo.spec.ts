import { test, expect } from '@playwright/test';

test('Apply valid and invalid promo codes (scaffold)', async ({ page }) => {
  const { default: HomePage } = await import('./pages/HomePage');
  const { default: CheckoutPage } = await import('./pages/CheckoutPage');
  const home = new HomePage(page);
  const checkout = new CheckoutPage(page);

  await home.goto();
  await home.search('cucumber');
  await home.addProductToCart('Cucumber');
  await checkout.applyPromo('rahulshettyacademy');
  await expect(page.locator('.promoInfo')).toBeVisible();
});
