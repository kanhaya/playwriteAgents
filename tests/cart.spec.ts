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
    await home.search('tomato');
    await home.addProductToCart('Tomato');

    await cart.openCart();
    // Scaffold: exact selectors and assertions need refinement after running against live site
    // Example placeholder: proceed to checkout to see totals
    await cart.proceedToCheckout();
    await expect(page).toHaveURL(/.*checkout/);
  });
});
