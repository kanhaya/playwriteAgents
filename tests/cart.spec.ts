// spec: specs/test.plan.md
// seed: tests/seed.spec.ts
// generated-by: manual
// generated-at: 2026-08-23

import { test, expect } from '@playwright/test';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';

test.describe('Cart operations', () => {
  test('Add product, update quantity and verify totals (scaffold)', async ({ page }) => {
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

    await expect.poll(() => home.cartCount()).toBeGreaterThanOrEqual(1);
    await cart.proceedToCheckout();
    await expect(page).toHaveURL(/#\/cart/);
    await expect(cart.promoInput).toBeVisible();
  });
});
