import { expect, type Page, type Locator } from '@playwright/test';

export default class CheckoutPage {
  readonly page: Page;
  readonly promoInput: Locator;
  readonly applyPromoButton: Locator;
  readonly countrySelect: Locator;
  readonly termsCheckbox: Locator;
  readonly placeOrderButton: Locator;
  readonly proceedButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.promoInput = page.getByPlaceholder(/enter promo code/i);
    this.applyPromoButton = page.getByRole('button', { name: /^apply$/i });
    this.countrySelect = page.locator('select');
    this.termsCheckbox = page.locator('input[type="checkbox"]');
    this.placeOrderButton = page.getByRole('button', { name: /place order/i });
    this.proceedButton = page.getByRole('button', { name: /proceed/i });
  }

  async applyPromo(code: string) {
    await this.promoInput.waitFor({ state: 'visible' });
    await this.promoInput.fill(code);
    await this.applyPromoButton.click();
    await expect(this.page.getByText(/code applied/i)).toBeVisible({ timeout: 5000 });
  }

  async cartTotal(): Promise<number> {
    const totalText = await this.page.locator('text=Total Amount').locator('..').textContent();
    const match = totalText?.match(/(\d+)/g);
    return match ? Number(match[match.length - 1]) : 0;
  }

  async selectCountry(country: string) {
    await this.countrySelect.waitFor({ state: 'visible', timeout: 10000 });
    await this.countrySelect.selectOption({ label: country });
  }

  async acceptTerms() {
    await this.termsCheckbox.waitFor({ state: 'visible', timeout: 10000 });
    await this.termsCheckbox.check();
  }

  async placeOrder() {
    await expect(this.placeOrderButton).toBeVisible({ timeout: 10000 });
    await this.placeOrderButton.click();
  }

  async completeOrder(country = 'India') {
    // healed-by: playwright-test-healer
    // healed-at: 2026-08-23
    // reason: GreenKart checkout is cart Place Order → country/terms → Proceed → confirmation
    await this.placeOrder();
    await this.countrySelect.waitFor({ state: 'visible', timeout: 10000 });
    await this.selectCountry(country);
    await this.acceptTerms();
    await expect(this.proceedButton).toBeEnabled({ timeout: 5000 });
    await this.proceedButton.click();
  }

  async expectOrderConfirmation() {
    await expect(
      this.page.locator('.wrapperTwo').getByText(/thank you/i)
    ).toBeVisible({ timeout: 15000 });
  }
}
