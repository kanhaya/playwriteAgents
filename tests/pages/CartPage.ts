import { expect, type Page, type Locator } from '@playwright/test';

export default class CartPage {
  readonly page: Page;
  readonly cartIcon: Locator;
  readonly checkoutButton: Locator;
  readonly promoInput: Locator;
  readonly applyPromoButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartIcon = page.locator('a').filter({ has: page.getByRole('img', { name: 'Cart' }) });
    this.checkoutButton = page.getByRole('button', { name: 'PROCEED TO CHECKOUT' });
    this.promoInput = page.getByPlaceholder(/enter promo code/i);
    this.applyPromoButton = page.getByRole('button', { name: /^apply$/i });
  }

  async openCart() {
    await this.cartIcon.click();
    if (!(await this.checkoutButton.isVisible().catch(() => false))) {
      await this.cartIcon.click();
    }
    await this.checkoutButton.waitFor({ state: 'visible', timeout: 10000 });
  }

  async proceedToCheckout() {
    await this.openCart();
    await this.checkoutButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async applyPromo(code: string) {
    await this.promoInput.fill(code);
    await this.applyPromoButton.click();
    await expect(this.page.getByText(/total after discount/i)).toBeVisible({ timeout: 10000 });
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
