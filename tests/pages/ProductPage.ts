import type { Page, Locator } from '@playwright/test';

export default class ProductPage {
  readonly page: Page;
  readonly productDetail: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productDetail = page.locator('.product-detail, .product-modal, .product-info');
  }

  async openByName(name: string) {
    // click the product card scoped by name
    await this.page.locator('.products .product', { hasText: name }).first().click();

    // wait for either a details panel/modal to appear or a URL change
    try {
      await Promise.race([
        this.productDetail.waitFor({ state: 'visible', timeout: 4000 }),
        this.page.locator('role=dialog, .modal, .product-modal').waitFor({ state: 'visible', timeout: 4000 }),
        this.page.waitForURL(/.*/, { timeout: 4000 })
      ]);
    } catch {
      // tolerant fallback: short delay to allow inline UI updates
      await this.page.waitForTimeout(300);
    }
  }

  async isVisible() {
    // consider multiple ways the detail could be shown (panel, dialog, modal)
    const detailVisible = await this.productDetail.isVisible().catch(() => false);
    if (detailVisible) return true;
    const dialogVisible = await this.page.locator('role=dialog, .modal, .product-modal').isVisible().catch(() => false);
    return !!dialogVisible;
  }
}
