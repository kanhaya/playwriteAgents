// spec: specs/test.plan.md
// seed: tests/seed.spec.ts
// generated-by: manual
// generated-at: 2026-08-23

import { test, expect } from '@playwright/test';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';

test.describe('Checkout flow (scaffold)', () => {
  test('Apply promo and validate price change', async ({ page }) => {
    if (typeof HomePage !== 'function') {
      const mod = await import('./pages/HomePage');
      throw new Error(`HomePage is not a constructor. Exports: ${Object.keys(mod).join(', ')}`);
    }
    if (typeof CartPage !== 'function') {
      const mod = await import('./pages/CartPage');
      throw new Error(`CartPage is not a constructor. Exports: ${Object.keys(mod).join(', ')}`);
    }

    const home = new HomePage(page);
    const cart = new CartPage(page);

    await home.goto();
    await home.search('cucumber');
    await home.addProductToCart('Cucumber');

    await cart.proceedToCheckout();
    // scaffold: apply a promo and validate discount behavior
    await cart.applyPromo('rahulshettyacademy');

    await expect(page.getByText(/total after discount/i)).toBeVisible();
  });
});
