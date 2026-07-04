import type { Page, Locator } from '@playwright/test';

export default class HomePage {
  readonly page: Page;
  readonly products: Locator;
  readonly searchInput: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.products = page.locator('.products .product');
    // Updated selector - try input[type="text"] with more flexible matching
    this.searchInput = page.locator('input[type="text"]').first();
    this.cartBadge = page.locator('.cart-icon .badge');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async search(query: string) {
    // Ensure the search input is visible and ready before filling
    await this.searchInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.searchInput.click();
    await this.searchInput.fill(query);
    // Wait for product results to appear / update
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('.products .product', { timeout: 8000 });
  }

  getProducts(): Locator {
    return this.products;
  }

  getProductByName(name: string): Locator {
    return this.products.filter({ hasText: name });
  }

  async addProductToCart(name: string) {
    const product = this.getProductByName(name);
    // Click the Add to cart button inside the matched product
    await product.locator('button:has-text("ADD TO CART")').first().click();
  }

  async cartCount(): Promise<number> {
    const text = await this.cartBadge.textContent();
    return text ? Number(text.trim()) : 0;
  }
}
