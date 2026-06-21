import type { Page } from '@playwright/test';

export default class BasePage {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  async gotoHash(path = '/') {
    // build URL from configured base (config exports BASE_URL ending with /#/) and append path
    const cfg = (await import('../../config')).default;
    const base = String(cfg.BASE_URL).replace(/\/+$/, '');
    const url = base + path;
    await this.page.goto(url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async fill(selector: string, value: string) {
    const el = this.page.locator(selector);
    await el.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    try {
      await el.fill(value);
    } catch {
      // JS fallback for stubborn inputs
      await this.page.evaluate(({ sel, val }) => {
        const e = document.querySelector(sel) as any;
        if (e) e.value = val;
      }, { sel: selector, val: value });
    }
  }

  async click(selector: string) {
    const el = this.page.locator(selector);
    await el.waitFor({ state: 'attached', timeout: 10000 }).catch(() => {});
    await el.click();
  }

  async waitForSelector(selector: string, timeout = 5000) {
    await this.page.waitForSelector(selector, { timeout }).catch(() => {});
  }
}
