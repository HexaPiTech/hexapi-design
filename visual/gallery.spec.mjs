import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

// Panel order is fixed by scripts/gallery.mjs.
const panels = [
  ['light-rtl', 0],
  ['dark-rtl', 1],
  ['light-ltr', 2],
  ['dark-ltr', 3],
];

const url = pathToFileURL(resolve('dist/gallery.html')).href;

for (const [name, index] of panels) {
  test(`gallery ${name}`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto(url);
    await page.evaluate(() => document.fonts.ready);
    const panel = page.locator('.g-panel').nth(index);
    await expect(panel).toBeVisible();
    await expect(panel).toHaveScreenshot(`${name}.png`);
    expect(errors).toEqual([]);
  });
}

test('gallery has no horizontal overflow', async ({ page }) => {
  await page.goto(url);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
