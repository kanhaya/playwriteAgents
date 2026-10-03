// spec: specs/test.plan.md
// seed: tests/seed.spec.ts
// generated-by: manual
// generated-at: 2026-08-23

import { test, expect } from '../framework/test';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';

test('Product detail opens from listing (scaffold)', async ({ page }) => {
  if (typeof HomePage !== 'function') {
    const mod = await import('./pages/HomePage');
    throw new Error(`HomePage is not a constructor. Exports: ${Object.keys(mod).join(', ')}`);
  }
  if (typeof ProductPage !== 'function') {
    const mod = await import('./pages/ProductPage');
    throw new Error(`ProductPage is not a constructor. Exports: ${Object.keys(mod).join(', ')}`);
  }

  const home = new HomePage(page);
  const product = new ProductPage(page);

  await home.goto();
  await home.search('tomato');
  await product.openByName('Tomato');
  expect(await product.isVisible()).toBeTruthy();
});
