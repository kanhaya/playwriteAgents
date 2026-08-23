import type { Page, Locator } from '@playwright/test';

export default class HomePage {
  readonly page: Page;
  readonly products: Locator;
  readonly searchInput: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.products = page.locator('.products .product');
    this.searchInput = page.getByRole('searchbox', { name: /search for vegetables/i });
    this.cartBadge = page.locator('td').filter({ hasText: /^Items$/ }).locator('..').locator('strong').first();
  }

  async goto() {
    // Use empty string so Playwright resolves to baseURL (not domain root via '/')
    await this.page.goto('');
    await this.page.waitForLoadState('domcontentloaded');
    await this.dismissOverlays();
    await this.searchInput.waitFor({ state: 'visible', timeout: 15000 });
  }

  /** Dismiss marketing banners/popups when they appear on the practice app */
  async dismissOverlays() {
    const dismissBanner = this.page.getByRole('button', { name: /dismiss banner/i });
    if (await dismissBanner.isVisible().catch(() => false)) {
      await dismissBanner.click();
    }
    const dismissPopup = this.page.getByRole('button', { name: /dismiss popup/i });
    if (await dismissPopup.isVisible().catch(() => false)) {
      await dismissPopup.click();
    }
  }

  async search(query: string) {
    await this.searchInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.searchInput.click();
    await this.searchInput.fill(query);
    await this.page.waitForSelector('.products .product', { timeout: 8000 });
  }

  getProducts(): Locator {
    return this.products;
  }

  getProductByName(name: string): Locator {
    return this.products.filter({ hasText: new RegExp(name, 'i') });
  }

  async addProductToCart(name: string) {
    const product = this.getProductByName(name);
    const addButton = product.getByRole('button', { name: 'ADD TO CART' });
    await addButton.waitFor({ state: 'visible', timeout: 10000 });
    await addButton.click();
    await this.cartBadge.waitFor({ state: 'visible', timeout: 10000 });
  }

  async cartCount(): Promise<number> {
    const text = await this.cartBadge.textContent();
    return text ? Number(text.trim()) : 0;
  }

  async headerTotal(): Promise<number> {
    const priceCell = this.page.locator('td').filter({ hasText: /^Price$/ }).locator('..').locator('strong').first();
    const text = await priceCell.textContent();
    return text ? Number(text.trim()) : 0;
  }

  async ensureUnderBudget(maxBudget: number) {
    let total = await this.headerTotal();
    while (total >= maxBudget) {
      const decrement = this.page.locator('.product').first().getByRole('link', { name: '–' });
      if (!(await decrement.isVisible().catch(() => false))) break;
      await decrement.click();
      total = await this.headerTotal();
    }
    return total;
  }
}
