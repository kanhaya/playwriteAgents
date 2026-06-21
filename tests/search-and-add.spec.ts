import { test, expect } from '@playwright/test';

function resolveCtor(mod: any) {
  if (!mod) return mod;
  if (typeof mod === 'function') return mod;
  if (mod.default) {
    if (typeof mod.default === 'function') return mod.default;
    if (mod.default.default && typeof mod.default.default === 'function') return mod.default.default;
  }
  if (mod.HomePage && typeof mod.HomePage === 'function') return mod.HomePage;
  return mod;
}

test.describe('Search and add flow', () => {
  test('Search for product and add to cart', async ({ page }) => {
    const mod = await import('./pages/HomePage');
    const HomePage = resolveCtor(mod);
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
