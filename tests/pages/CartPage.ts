import { Page } from '@playwright/test';
import type { Locator } from '@playwright/test';

export default class CartPage {
  readonly page: Page;
  readonly cartIcon: Locator;
  readonly checkoutButton: Locator;
  readonly promoInput: Locator;
  readonly applyPromoButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartIcon = page.locator('.cart-icon');
    this.checkoutButton = page.locator('text=PROCEED TO CHECKOUT');
    this.promoInput = page.locator('input.promoCode');
    this.applyPromoButton = page.locator('button.promoBtn');
  }

  async openCart() {
    await this.cartIcon.click();
    await this.page.waitForSelector('text=PROCEED TO CHECKOUT');
  }

  async proceedToCheckout() {
    await this.openCart();
    await this.checkoutButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async applyPromo(code: string) {
    await this.promoInput.fill(code);
    await this.applyPromoButton.click();
    // Wait for promo result
    await this.page.waitForTimeout(500);
  }

  async lineTotals(): Promise<number[]> {
    const rows = this.page.locator('tr.cartItem');
    const count = await rows.count();
    const totals: number[] = [];
    for (let i = 0; i < count; i++) {
      const v = await rows.nth(i).locator('.amount').textContent();
      totals.push(Number((v || '0').trim()));
    }
    return totals;
  }
}
