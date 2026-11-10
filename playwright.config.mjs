// Visual regression over dist/gallery.html. Not part of `npm test`: run
// `npm run test:visual` (compare) or `npm run test:visual:update` (re-baseline).
import { defineConfig } from '@playwright/test';

const use = { reducedMotion: 'reduce', colorScheme: 'light', deviceScaleFactor: 1 };

export default defineConfig({
  testDir: 'visual',
  testMatch: '*.spec.mjs',
  snapshotPathTemplate: 'visual/__snapshots__/{projectName}/{arg}{ext}',
  fullyParallel: true,
  reporter: 'list',
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: 'disabled' } },
  projects: [
    { name: 'desktop-1500', use: { ...use, viewport: { width: 1500, height: 900 } } },
    { name: 'mobile-380', use: { ...use, viewport: { width: 380, height: 800 } } },
  ],
});
