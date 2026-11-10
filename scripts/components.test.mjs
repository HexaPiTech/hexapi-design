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

test('Dialog: closed renders an empty native dialog; open renders title, body, footer', () => {
  const closed = html(h(ui.Dialog, { open: false, onClose() {}, title: 'عنوان' }, 'x'));
  assert.match(
    closed,
    /^<dialog class="hx-dialog" data-size="md" data-placement="center"[^>]*><\/dialog>$/,
  );
  const out = html(
    h(ui.Dialog, { open: true, onClose() {}, title: 'عنوان', footer: 'ف', size: 'lg' }, 'نص'),
  );
  const id = out.match(/aria-labelledby="([^"]+)"/)[1];
  assert.ok(out.includes(`<h2 id="${id}" class="hx-dialog-title">عنوان</h2>`));
  assert.match(out, /aria-label="إغلاق"/);
  assert.match(
    out,
    /<div class="hx-dialog-body">نص<\/div><footer class="hx-dialog-footer">ف<\/footer>/,
  );
});

test('Dialog: without a title the label names it; Drawer docks to the end edge', () => {
  const out = html(h(ui.Dialog, { open: true, onClose() {}, label: 'تأكيد', showClose: false }));
  assert.match(out, /aria-label="تأكيد"/);
  assert.doesNotMatch(out, /hx-dialog-header/);
  assert.match(html(h(ui.Drawer, { open: false, onClose() {} })), /data-placement="end"/);
});

test('Tabs: tablist with roving tabindex, selected state and panel wiring', () => {
  const tabs = [
    { id: 'a', label: 'أ', count: 3 },
    { id: 'b', label: 'ب', icon: Icon },
  ];
  const out = html(h(ui.Tabs, { tabs, value: 'b', onChange() {}, id: 't', label: 'أقسام' }));
  assert.match(
    out,
    /^<div role="tablist" aria-label="أقسام" class="hx-tabs" data-variant="pills">/,
  );
  assert.match(out, /id="t-tab-a" aria-controls="t-panel-a" aria-selected="false" tabindex="-1"/);
  assert.match(out, /id="t-tab-b" aria-controls="t-panel-b" aria-selected="true" tabindex="0"/);
  assert.match(out, /<span class="hx-count">3<\/span>/);
  const panel = html(h(ui.TabPanel, { tabs: 't', tab: 'a', active: false }, 'سر'));
  assert.match(panel, /role="tabpanel" id="t-panel-a" aria-labelledby="t-tab-a" hidden=""/);
  assert.doesNotMatch(panel, /سر/);
});

test('Tabs: without an id there is no dangling aria-controls', () => {
  const out = html(h(ui.Tabs, { tabs: [{ id: 'a', label: 'أ' }], value: 'a', onChange() {} }));
  assert.doesNotMatch(out, /aria-controls|id="/);
});

test('SegmentedControl: a named radio group sharing one name', () => {
  const options = [
    { value: 'w', label: 'أسبوع' },
    { value: 'm', label: 'شهر' },
  ];
  const out = html(
    h(ui.SegmentedControl, { options, value: 'm', onChange() {}, label: 'المدة', name: 'p' }),
  );
  assert.match(out, /^<div role="radiogroup" aria-label="المدة" class="hx-segmented">/);
  assert.equal(out.match(/name="p"/g).length, 2);
  assert.match(out, /checked="" value="m"/);
});

test('pageItems: first, last, neighbours; gaps only when two or more are skipped', () => {
  assert.deepEqual(ui.pageItems(1, 1), [1]);
  assert.deepEqual(ui.pageItems(1, 5), [1, 2, 3, 4, 5].slice(0, 2).concat(['gap', 5]));
  assert.deepEqual(ui.pageItems(3, 5), [1, 2, 3, 4, 5]);
  assert.deepEqual(ui.pageItems(10, 20), [1, 'gap', 9, 10, 11, 'gap', 20]);
  assert.deepEqual(ui.pageItems(4, 20), [1, 2, 3, 4, 5, 'gap', 20]);
});

test('Pagination: nothing for one page; current page marked; ends disabled', () => {
  assert.equal(html(h(ui.Pagination, { page: 1, pageCount: 1, onChange() {} })), '');
  const out = html(h(ui.Pagination, { page: 1, pageCount: 3, onChange() {} }));
  assert.match(out, /^<nav aria-label="الصفحات">/);
  assert.match(out, /aria-label="السابق" disabled=""/);
  assert.match(out, /aria-current="page">1</);
  assert.doesNotMatch(out, /aria-label="التالي" disabled/);
});

test('Menu and Popover: closed by default, trigger gets the popup wiring', () => {
  const trigger = (p) => h(ui.Button, p, 'خيارات');
  const menu = html(h(ui.Menu, { trigger, items: [{ id: 'd', label: 'حذف', onSelect() {} }] }));
  assert.match(menu, /aria-haspopup="menu" aria-expanded="false"/);
  assert.doesNotMatch(menu, /role="menu"|aria-controls/);
  const pop = html(h(ui.Popover, { trigger, label: 'تصفية' }, 'x'));
  assert.match(pop, /aria-haspopup="dialog" aria-expanded="false"/);
});

test('Tooltip: the child is described by the tooltip, keeping its own description', () => {
  const out = html(h(ui.Tooltip, { text: 'نسخ' }, h('button', { 'aria-describedby': 'own' }, 'x')));
  const id = out.match(/role="tooltip" id="([^"]+)"/)[1];
  assert.ok(out.includes(`aria-describedby="own ${id}"`));
});

test('Avatar: initials are a labelled image; a photo carries the name as alt', () => {
  assert.equal(ui.initialsOf('  أحمد علي حسن '), 'أح');
  assert.equal(ui.initialsOf('sara'), 'S');
  assert.equal(ui.initialsOf(''), '');
  const out = html(h(ui.Avatar, { name: 'Sara Ali', tone: 'student' }));
  assert.match(out, /role="img" aria-label="Sara Ali">SA<\/span>$/);
  const img = html(h(ui.Avatar, { name: 'Sara Ali', src: '/a.jpg' }));
  assert.match(img, /<img src="\/a.jpg" alt="Sara Ali"/);
  assert.doesNotMatch(img, /role="img"/);
});

test('EmptyState, FileInput, Range render their native shapes', () => {
  const out = html(
    h(ui.EmptyState, { title: 'لا نتائج', description: 'جرّب بحثاً آخر', icon: Icon }),
  );
  assert.match(out, /<p class="hx-empty-title">لا نتائج<\/p><p class="hx-empty-text">/);
  assert.match(
    html(h(ui.FileInput, { id: 'f' })),
    /^<input id="f" type="file" class="hx-file"\/>$/,
  );
  assert.match(html(h(ui.Range, { id: 'r', min: 0 })), /type="range" class="hx-range"/);
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
      .replace(/::(before|after|placeholder|backdrop|file-selector-button)/g, '');
    if (/[.#\[a-zA-Z]/.test(stripped.replace(/[\s>,+~]/g, ''))) bad.push(sel);
  }
  assert.deepEqual(bad, []);
});

test('components.css: logical properties only, tokens only', () => {
  assert.doesNotMatch(
    css,
    /(?<!safe-area-)\b(margin|padding|border|inset)-(left|right)\b|\b(left|right)\s*:|text-align:\s*(left|right)/,
  );
  const hex = [...css.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0]);
  assert.deepEqual(hex, ['#fff']); // the switch thumb, white in both themes
});

test('components.css: reduced-motion block exists', () => {
  assert.match(css, /prefers-reduced-motion: reduce/);
});
