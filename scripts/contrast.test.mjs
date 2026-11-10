import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contrastPairs, brands } from '../src/tokens.mjs';
import { resolveColors, contrast } from './lib.mjs';

for (const theme of ['light', 'dark'])
  for (const brand of Object.keys(brands))
    test(`contrast — ${theme} / ${brand}`, () => {
      const c = resolveColors(theme, brand);
      const failures = [];
      for (const [fg, bg, min] of contrastPairs) {
        const ratio = contrast(c[fg], c[bg], c.surface);
        if (ratio < min) failures.push(`${fg} on ${bg}: ${ratio.toFixed(2)} < ${min}`);
      }
      assert.deepEqual(failures, []);
    });
