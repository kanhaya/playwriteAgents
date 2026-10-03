// spec: specs/test.plan.md
// seed: tests/seed.spec.ts
// generated-by: playwright-test-generator
// generated-at: 2026-08-23

import { test, expect } from '../framework/test';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';

const GROCERY_ITEMS = [
  { search: 'banana', name: 'Banana' },
  { search: 'pomegranate', name: 'Pomegranate' },
  { search: 'apple', name: 'Apple' },
  { search: 'tomato', name: 'Tomato' },
  { search: 'potato', name: 'Potato' },
] as const;

const MAX_BUDGET = 500;

test.describe('Mixed grocery E2E', () => {
  test('TC-MG1-MG4: Buy fruits and vegetables under 500 and place order', async ({ page }) => {
    const home = new HomePage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);

    // 1. Navigate to GreenKart home
    await home.goto();

    // 2. Search and add banana, pomegranate, apple, tomato, potato
    for (const item of GROCERY_ITEMS) {
      await home.search(item.search);
      await expect(home.getProductByName(item.name)).toBeVisible();
      await home.addProductToCart(item.name);
    }

    // 3. Assert cart has all items and total is under budget
    await expect.poll(() => home.cartCount()).toBe(GROCERY_ITEMS.length);
    const headerTotal = await home.ensureUnderBudget(MAX_BUDGET);
    expect(headerTotal).toBeGreaterThan(0);
    expect(headerTotal).toBeLessThan(MAX_BUDGET);

    // 4. Proceed to checkout
    await cart.proceedToCheckout();
    await expect(page).toHaveURL(/#\/cart/);

    // 5. Assert checkout summary
    for (const item of GROCERY_ITEMS) {
      await expect(page.getByText(new RegExp(item.name, 'i'))).toBeVisible();
    }
    await expect(cart.promoInput).toBeVisible();
    await expect(checkout.placeOrderButton).toBeVisible();

    const cartTotal = await checkout.cartTotal();
    expect(cartTotal).toBeGreaterThan(0);
    expect(cartTotal).toBeLessThan(MAX_BUDGET);

    // 6. Select country, accept terms, place order
    await checkout.completeOrder('India');

    // 7. Verify order confirmation
    await checkout.expectOrderConfirmation();
  });
});
