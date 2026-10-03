// spec: specs/test.plan.md
// seed: tests/seed.spec.ts
// generated-by: manual
// generated-at: 2026-08-23

import { test, expect } from '../framework/test';
import HomePage from './pages/HomePage';

test('Search & add flow on mobile viewport (scaffold)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  if (typeof HomePage !== 'function') {
    const mod = await import('./pages/HomePage');
    throw new Error(`HomePage is not a constructor. Exports: ${Object.keys(mod).join(', ')}`);
  }
  const home = new HomePage(page);
  await home.goto();
  await home.search('apple');
  // ensure at least one product shows
  const products = home.getProducts();
  await expect(products).toHaveCountGreaterThan(0);
});
