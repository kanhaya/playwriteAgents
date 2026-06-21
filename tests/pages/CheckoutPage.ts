import type { Page, Locator } from '@playwright/test';

export default class CheckoutPage {
  readonly page: Page;
  readonly promoInput: Locator;
  readonly applyPromoButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.promoInput = page.locator('input.promoCode');
    this.applyPromoButton = page.locator('button.promoBtn');
  }

  async applyPromo(code: string) {
    await this.promoInput.waitFor({ state: 'visible' });
    await this.promoInput.fill(code);
    await this.applyPromoButton.click();
    await this.page.waitForSelector('.promoInfo', { timeout: 5000 });
  }
}
