// DataTable contract: semantics, sorting, selection, states, and sortRows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement as h } from 'react';
import { renderToStaticMarkup as html } from 'react-dom/server';
import * as ui from '../dist/react/index.js';

const rows = [
  { id: 1, name: 'b', n: 10 },
  { id: 2, name: 'a', n: 2 },
  { id: 3, name: 'c', n: null },
];
const columns = [
  { key: 'name', header: 'الاسم', sortable: true },
  { key: 'n', header: 'العدد', sortable: true, align: 'end', width: '5rem', hideOnMobile: true },
];
const base = { columns, rows, rowKey: 'id', label: 'الطلاب' };

test('sortRows: strings, numbers (numeric, not lexical), desc, null sort', () => {
  assert.deepEqual(
    ui.sortRows(rows, { key: 'name', direction: 'asc' }).map((r) => r.id),
    [2, 1, 3],
  );
  assert.deepEqual(
    ui.sortRows(rows, { key: 'name', direction: 'desc' }).map((r) => r.id),
    [3, 1, 2],
  );
  const nums = [{ n: 10 }, { n: 9 }, { n: 100 }];
  assert.deepEqual(
    ui.sortRows(nums, { key: 'n', direction: 'asc' }).map((r) => r.n),
    [9, 10, 100],
  );
  assert.deepEqual(ui.sortRows(rows, null), rows);
});

test('sortRows: empty values last in both directions, stable, never mutates', () => {
  assert.deepEqual(
    ui.sortRows(rows, { key: 'n', direction: 'asc' }).map((r) => r.id),
    [2, 1, 3],
  );
  assert.deepEqual(
    ui.sortRows(rows, { key: 'n', direction: 'desc' }).map((r) => r.id),
    [1, 2, 3],
  );
  const ties = [
    { id: 1, k: 1 },
    { id: 2, k: 1 },
    { id: 3, k: 0 },
  ];
  assert.deepEqual(
    ui.sortRows(ties, { key: 'k', direction: 'asc' }).map((r) => r.id),
    [3, 1, 2],
  );
  assert.deepEqual(
    ui.sortRows(ties, { key: 'k', direction: 'desc' }).map((r) => r.id),
    [1, 2, 3],
  );
  assert.deepEqual(
    rows.map((r) => r.id),
    [1, 2, 3],
  );
});

test('sortRows: dates, booleans, numeric strings, custom accessor', () => {
  const d = [{ v: new Date(2025, 1, 1) }, { v: new Date(2024, 1, 1) }];
  assert.equal(ui.sortRows(d, { key: 'v', direction: 'asc' })[0], d[1]);
  assert.deepEqual(
    ui.sortRows([{ v: true }, { v: false }], { key: 'v', direction: 'asc' }).map((r) => r.v),
    [false, true],
  );
  assert.deepEqual(
    ui.sortRows([{ v: 'a10' }, { v: 'a9' }], { key: 'v', direction: 'asc' }).map((r) => r.v),
    ['a9', 'a10'],
  );
  const nested = [{ x: { y: 2 } }, { x: { y: 1 } }];
  assert.equal(ui.sortRows(nested, { key: 'y', direction: 'asc' }, (r, k) => r.x[k])[0], nested[1]);
});

test('DataTable: semantic table, scope=col, aria-label, cell text and alignment', () => {
  const out = html(h(ui.DataTable, base));
  assert.match(out, /<table class="hx-table" aria-label="الطلاب">/);
  assert.equal(out.match(/<th scope="col"/g).length, 2);
  assert.match(out, /<td>b<\/td>/);
  assert.match(out, /data-align="end" style="inline-size:5rem"/);
  assert.match(out, /class="hx-col-hide"/);
  assert.doesNotMatch(out, /hx-table-cards/); // no mobileCard: it scrolls instead
});

test('DataTable: a caption names the table instead of aria-label', () => {
  const out = html(h(ui.DataTable, { ...base, caption: 'قائمة' }));
  assert.match(out, /<caption class="hx-table-caption">قائمة<\/caption>/);
  assert.doesNotMatch(out, /aria-label="الطلاب"/);
});

test('DataTable: sortable headers are buttons; aria-sort follows the controlled sort', () => {
  const out = html(
    h(ui.DataTable, { ...base, sort: { key: 'name', direction: 'desc' }, onSortChange() {} }),
  );
  assert.match(out, /aria-sort="descending"[^>]*><button type="button" class="hx-sort-btn"/);
  assert.match(out, /aria-sort="none"/);
  assert.match(out, /hx-sr-only">مرتّب تنازلياً/);
  // without a handler the header is plain text: no dead buttons
  assert.doesNotMatch(html(h(ui.DataTable, base)), /<button/);
});

test('DataTable: selection column, checked rows, header checkbox state', () => {
  const props = { ...base, selected: [1], onSelectedChange() {} };
  const out = html(h(ui.DataTable, props));
  assert.equal(out.match(/class="hx-check"/g).length, 4); // header + 3 rows
  assert.match(out, /aria-label="تحديد الكل"/);
  assert.equal(out.match(/checked=""/g).length, 1);
  assert.match(out, /<tr data-selected="">/);
  const all = html(h(ui.DataTable, { ...props, selected: [1, 2, 3] }));
  assert.equal(all.match(/checked=""/g).length, 4);
});

test('DataTable: loading renders skeleton rows and marks the table busy', () => {
  const out = html(h(ui.DataTable, { ...base, loading: true, loadingRows: 3 }));
  assert.match(out, /aria-busy="true"/);
  assert.equal(out.match(/<tr data-loading=""/g).length, 3);
  assert.match(out, /hx-skeleton hx-table-skel/);
  assert.doesNotMatch(out, /<td>b<\/td>/);
});

test('DataTable: empty shows the default EmptyState or the slot, spanning all columns', () => {
  const out = html(h(ui.DataTable, { ...base, rows: [], selected: [], onSelectedChange() {} }));
  assert.match(out, /<td colSpan="3">|<td colspan="3">/);
  assert.match(out, /hx-empty-title">لا توجد بيانات/);
  assert.match(html(h(ui.DataTable, { ...base, rows: [], empty: 'فارغ تماماً' })), />فارغ تماماً</);
});

test('DataTable: onRowClick makes rows focusable and marks them clickable', () => {
  const out = html(h(ui.DataTable, { ...base, onRowClick() {} }));
  assert.equal(out.match(/<tr data-clickable="" tabindex="0">/g).length, 3);
});

test('DataTable: mobileCard adds a card list and data-cards on the wrapper', () => {
  const out = html(
    h(ui.DataTable, { ...base, mobileCard: (r) => h('b', null, r.name), density: 'compact' }),
  );
  assert.match(out, /^<div class="hx-table-wrap" data-density="compact" data-cards="">/);
  assert.match(out, /<ul class="hx-table-cards" aria-label="الطلاب">/);
  assert.match(out, /<div class="hx-table-card-body"><b>a<\/b><\/div>/);
});

test('DataTable: rowKey as a function; sticky + maxHeight', () => {
  const out = html(
    h(ui.DataTable, { ...base, rowKey: (r) => `k${r.id}`, stickyHeader: true, maxHeight: '20rem' }),
  );
  assert.match(out, /data-sticky=""/);
  assert.match(out, /style="max-block-size:20rem"/);
});

test('components.css: DataTable block is the last block and uses a container query', () => {
  const css = readFileSync(new URL('../dist/components.css', import.meta.url), 'utf8');
  assert.match(css, /@container \(max-inline-size: 40rem\)/);
});
