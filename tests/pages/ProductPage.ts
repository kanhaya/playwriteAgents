import type { Page, Locator } from '@playwright/test';

export default class ProductPage {
  readonly page: Page;
  readonly productDetail: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productDetail = page.locator('.product-detail');
  }

  async openByName(name: string) {
    await this.page.locator('.products .product', { hasText: name }).first().click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async isVisible() {
    return await this.productDetail.isVisible();
  }
}
