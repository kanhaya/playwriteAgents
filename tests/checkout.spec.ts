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

test.describe('Checkout flow (scaffold)', () => {
  test('Apply promo and validate price change', async ({ page }) => {
    const modHome = await import('./pages/HomePage');
    const modCart = await import('./pages/CartPage');
    const HomePage = resolveCtor(modHome);
    const CartPage = resolveCtor(modCart);

    const home = new HomePage(page);
    const cart = new CartPage(page);

    await home.goto();
    await home.search('cucumber');
    await home.addProductToCart('Cucumber');

    await cart.proceedToCheckout();
    // scaffold: apply a promo and validate discount behavior
    await cart.applyPromo('rahulshettyacademy');

    // Placeholder: assert promo feedback is visible
    await expect(page.locator('.promoInfo')).toBeVisible();
  });
});
