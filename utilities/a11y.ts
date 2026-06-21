import type { Page } from '@playwright/test';

export async function runA11y(page: Page, options = {}) {
  // Inject axe-core from CDN to avoid additional install steps. If you prefer a package, add axe-core to devDependencies.
  await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.6.3/axe.min.js' });
  // Run axe in the page context
  const result = await page.evaluate(async (opts) => {
    // @ts-ignore - axe is injected into window
    if (!(window as any).axe) throw new Error('axe not available');
    // run against document
    return await (window as any).axe.run(document, opts);
  }, options);
  return result as any;
}
