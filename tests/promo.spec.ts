// spec: specs/test.plan.md
// seed: tests/seed.spec.ts
// generated-by: manual
// generated-at: 2026-08-23

import { test, expect } from '../framework/test';
import HomePage from './pages/HomePage';
import CheckoutPage from './pages/CheckoutPage';

test('Apply valid and invalid promo codes (scaffold)', async ({ page }) => {
  if (typeof HomePage !== 'function') {
    const mod = await import('./pages/HomePage');
    throw new Error(`HomePage is not a constructor. Exports: ${Object.keys(mod).join(', ')}`);
  }
  if (typeof CheckoutPage !== 'function') {
    const mod = await import('./pages/CheckoutPage');
    throw new Error(`CheckoutPage is not a constructor. Exports: ${Object.keys(mod).join(', ')}`);
  }

  const home = new HomePage(page);
  const checkout = new CheckoutPage(page);

  await home.goto();
  await home.search('cucumber');
  await home.addProductToCart('Cucumber');
  await checkout.applyPromo('rahulshettyacademy');
  await expect(page.locator('.promoInfo')).toBeVisible();
});
