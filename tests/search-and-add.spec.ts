// spec: specs/test.plan.md
// seed: tests/seed.spec.ts
// generated-by: manual
// generated-at: 2026-08-23

import { test, expect } from '../framework/test';
import HomePage from './pages/HomePage';

test.describe('Search and add flow', () => {
  test('Search for product and add to cart', async ({ page }) => {
    if (typeof HomePage !== 'function') {
      const mod = await import('./pages/HomePage');
      throw new Error(`HomePage is not a constructor. Exports: ${Object.keys(mod).join(', ')}`);
    }
    const home = new HomePage(page);
    await home.goto();

    // Search for a common item; refine query if needed
    await home.search('cauliflower');

    const product = home.getProductByName('Cauliflower');
    await expect(product).toHaveCount(1);

    // Add to cart and validate cart count
    await home.addProductToCart('Cauliflower');
    const count = await home.cartCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
