// Renders the compiled components to static HTML and checks the contract every
// consumer relies on: class names, data attributes, accessible names, wiring.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement as h } from 'react';
import { renderToStaticMarkup as html } from 'react-dom/server';
import * as ui from '../dist/react/index.js';

const Icon = (props) => h('svg', props);

test('Button: defaults, type=button, tone/variant/size as data attributes', () => {
  const out = html(h(ui.Button, null, 'حفظ'));
  assert.match(
    out,
    /^<button type="button" class="hx-btn" data-variant="solid" data-tone="brand" data-size="md">حفظ<\/button>$/,
  );
});

test('Button: loading disables, marks busy and swaps the icon for a spinner', () => {
  const out = html(h(ui.Button, { loading: true, icon: Icon }, 'x'));
  assert.match(out, /disabled=""/);
  assert.match(out, /aria-busy="true"/);
  assert.match(out, /hx-spinner/);
  assert.doesNotMatch(out, /<svg/);
});

test('Button: consumer class is appended, not replaced', () => {
  assert.match(html(h(ui.Button, { className: 'mt-4' }, 'x')), /class="hx-btn mt-4"/);
});

test('IconButton: label is the accessible name and the tooltip; icon is hidden', () => {
  const out = html(h(ui.IconButton, { icon: Icon, label: 'حذف', tone: 'danger' }));
  assert.match(out, /aria-label="حذف"/);
  assert.match(out, /title="حذف"/);
  assert.match(out, /<svg aria-hidden="true">/);
  assert.match(out, /data-tone="danger"/);
});

test('Card: plain is a div; with onClick it is a real button', () => {
  assert.match(html(h(ui.Card, null, 'a')), /^<div class="hx-card" data-padding="md">a<\/div>$/);
  const out = html(h(ui.Card, { onClick() {} }, 'a'));
  assert.match(out, /^<button type="button"/);
  assert.match(out, /data-interactive=""/);
});

test('Field: label, control and note are wired by id', () => {
  const out = html(
    h(ui.Field, { label: 'الاسم', hint: 'كما في الهوية', id: 'n' }, h(ui.Input, null)),
  );
  assert.match(out, /<label for="n" class="hx-label">الاسم<\/label>/);
  assert.match(out, /<input id="n" aria-describedby="n-note" class="hx-input" data-size="md"\/>/);
  assert.match(out, /<p id="n-note" class="hx-hint">كما في الهوية<\/p>/);
});

test('Field: an error replaces the hint, is announced, and marks the control invalid', () => {
  const out = html(
    h(
      ui.Field,
      { label: 'x', hint: 'تلميح', error: 'مطلوب', required: true, id: 'e' },
      h(ui.Select, null),
    ),
  );
  assert.match(out, /aria-invalid="true"/);
  assert.match(out, /required=""/);
  assert.match(out, /data-error="" role="alert">مطلوب/);
  assert.doesNotMatch(out, /تلميح/);
  assert.match(out, /data-required=""/);
});

test('Input outside a Field still gets an id and keeps its own attributes', () => {
  const out = html(h(ui.Input, { 'aria-invalid': true, placeholder: 'p' }));
  assert.match(out, /aria-invalid="true"/);
  assert.match(out, / id="/);
});

test('Checkbox / Radio / Switch: native inputs, label wraps the control', () => {
  assert.match(
    html(h(ui.Checkbox, { label: 'أوافق' })),
    /^<label class="hx-choice" data-kind="checkbox"><input type="checkbox" class="hx-check"\/><span>أوافق<\/span><\/label>$/,
  );
  assert.match(
    html(h(ui.Radio, { 'aria-label': 'a' })),
    /^<input type="radio" aria-label="a" class="hx-check"\/>$/,
  );
  assert.match(html(h(ui.Switch, { 'aria-label': 'a' })), /type="checkbox" role="switch"/);
});

test('Spinner: decorative by default, a status with text when labelled', () => {
  assert.match(html(h(ui.Spinner, null)), /aria-hidden="true"/);
  const out = html(h(ui.Spinner, { label: 'جارٍ التحميل' }));
  assert.match(out, /role="status"/);
  assert.match(out, /hx-sr-only">جارٍ التحميل/);
});

test('Alert: danger and warning interrupt, the rest are polite', () => {
  assert.match(html(h(ui.Alert, { tone: 'danger' }, 'x')), /role="alert"/);
  assert.match(html(h(ui.Alert, null, 'x')), /role="status"/);
});

// ── stylesheet rules that keep it safe to drop into any app ────────────────
const css = readFileSync(new URL('../dist/components.css', import.meta.url), 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
);

test('components.css: every selector is inside :where() (zero specificity)', () => {
  const bad = [];
  for (const m of css.matchAll(/(^|[}{;])\s*([^{}@;]+)\{/g)) {
    const sel = m[2].trim();
    if (/^(to|from|\d+%)$/.test(sel)) continue;
    const stripped = sel
      .replace(/:where\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\)/g, '')
      .replace(/::(before|after|placeholder)/g, '');
    if (/[.#\[a-zA-Z]/.test(stripped.replace(/[\s>,+~]/g, ''))) bad.push(sel);
  }
  assert.deepEqual(bad, []);
});

test('components.css: logical properties only, tokens only', () => {
  assert.doesNotMatch(
    css,
    /\b(margin|padding|border|inset)-(left|right)\b|\b(left|right)\s*:|text-align:\s*(left|right)/,
  );
  const hex = [...css.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0]);
  assert.deepEqual(hex, ['#fff']); // the switch thumb, white in both themes
});

test('components.css: reduced-motion block exists', () => {
  assert.match(css, /prefers-reduced-motion: reduce/);
});
