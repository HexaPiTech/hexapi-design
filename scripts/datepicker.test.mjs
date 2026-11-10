// Calendar and DatePicker: pure date helpers, rendered contract, and the locale
// rule (a bare Arabic tag becomes the Islamic calendar with Eastern-Arabic digits
// on Apple's ICU, so the source must never use one or call Intl without a locale).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { createElement as h } from 'react';
import { renderToStaticMarkup as html } from 'react-dom/server';
import * as ui from '../dist/react/index.js';

test('parseISODate / toISODate: strict, round-trips, no day shift', () => {
  assert.deepEqual(ui.parseISODate('2026-11-10'), { year: 2026, month: 11, day: 10 });
  assert.equal(ui.parseISODate('2026-02-30'), null);
  assert.equal(ui.parseISODate('2026-2-3'), null);
  assert.equal(ui.parseISODate('2026-11-10T00:00:00Z'), null);
  assert.equal(ui.parseISODate(20261110), null);
  assert.equal(ui.parseISODate('2028-02-29')?.day, 29);
  assert.equal(ui.parseISODate('2027-02-29'), null);
  assert.equal(ui.toISODate(2026, 1, 5), '2026-01-05');
  assert.equal(ui.toISODate(2026, 13, 1), '2027-01-01');
  assert.equal(ui.toISODate(2026, 3, 0), '2026-02-28');
  assert.equal(ui.toISODate(50, 1, 1), '0050-01-01');
});

test('dates never shift with the process time zone', () => {
  for (const tz of ['UTC', 'Pacific/Kiritimati', 'Pacific/Pago_Pago', 'Asia/Beirut']) {
    const out = process.execPath;
    const code = `import * as ui from ${JSON.stringify(new URL('../dist/react/index.js', import.meta.url).href)};
      console.log([ui.addDays('2026-03-28', 1), ui.addDays('2026-10-25', 1), ui.addMonths('2026-01-31', 1), ui.weekdayOf('2026-11-10'), ui.startOfWeek('2026-11-10', 1)].join());`;
    const res = spawnSync(out, ['--input-type=module', '-e', code], {
      env: { ...process.env, TZ: tz },
      encoding: 'utf8',
    });
    assert.equal(res.stdout.trim(), '2026-03-29,2026-10-26,2026-02-28,2,2026-11-09', tz);
  }
});
import { spawnSync } from 'node:child_process';

test('addDays / addMonths: month ends clamp, years roll', () => {
  assert.equal(ui.addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(ui.addDays('2028-03-01', -1), '2028-02-29');
  assert.equal(ui.addMonths('2026-01-31', 1), '2026-02-28');
  assert.equal(ui.addMonths('2028-01-31', 1), '2028-02-29');
  assert.equal(ui.addMonths('2026-03-31', -1), '2026-02-28');
  assert.equal(ui.addMonths('2026-12-15', 1), '2027-01-15');
  assert.equal(ui.addMonths('2026-01-15', -1), '2025-12-15');
  assert.equal(ui.addMonths('2026-11-10', 12), '2027-11-10');
  assert.throws(() => ui.addDays('nope', 1), RangeError);
});

test('weekdayOf / startOfWeek / endOfWeek follow weekStartsOn', () => {
  assert.equal(ui.weekdayOf('2026-11-10'), 2); // Tuesday
  assert.equal(ui.startOfWeek('2026-11-10', 1), '2026-11-09');
  assert.equal(ui.startOfWeek('2026-11-10', 0), '2026-11-08');
  assert.equal(ui.startOfWeek('2026-11-10', 6), '2026-11-07');
  assert.equal(ui.startOfWeek('2026-11-09', 1), '2026-11-09');
  assert.equal(ui.startOfWeek('2026-11-08', 1), '2026-11-02'); // Sunday belongs to the week before
  assert.equal(ui.endOfWeek('2026-11-10', 1), '2026-11-15');
});

test('monthGrid: six weeks of seven, starts on weekStartsOn, contains the month once', () => {
  for (const ws of [0, 1, 6]) {
    for (const [y, m] of [
      [2026, 11],
      [2026, 2],
      [2028, 2],
      [2026, 1],
      [2026, 12],
    ]) {
      const grid = ui.monthGrid(y, m, ws);
      assert.equal(grid.length, 6);
      assert.ok(grid.every((w) => w.length === 7));
      assert.ok(grid.every((w) => ui.weekdayOf(w[0]) === ws));
      const flat = grid.flat();
      assert.equal(new Set(flat).size, 42);
      assert.deepEqual([...flat].sort(), flat);
      const inMonth = flat.filter((d) => d.startsWith(ui.toISODate(y, m, 1).slice(0, 7)));
      assert.equal(inMonth.length, ui.daysInMonth(y, m));
    }
  }
  assert.equal(ui.monthGrid(2026, 11, 1)[0][0], '2026-10-26');
  assert.equal(ui.monthGrid(2026, 11, 1)[0][6], '2026-11-01');
  assert.equal(ui.monthGrid(2026, 11, 0)[0][0], '2026-11-01');
});

test('compareISO / clampISO', () => {
  assert.equal(ui.compareISO('2026-01-01', '2026-01-02'), -1);
  assert.equal(ui.compareISO('2026-01-02', '2026-01-02'), 0);
  assert.equal(ui.compareISO('2027-01-01', '2026-12-31'), 1);
  assert.equal(ui.clampISO('2026-05-01', '2026-06-01', '2026-07-01'), '2026-06-01');
  assert.equal(ui.clampISO('2026-08-01', '2026-06-01', '2026-07-01'), '2026-07-01');
  assert.equal(ui.clampISO('2026-06-15', '2026-06-01', '2026-07-01'), '2026-06-15');
  assert.equal(ui.clampISO('2026-06-15'), '2026-06-15');
});

test('locale: Arabic gets the Gregorian calendar and Latin digits, English is untouched', () => {
  assert.equal(ui.DEFAULT_LOCALE, 'ar-LB-u-ca-gregory-nu-latn');
  assert.equal(ui.safeLocale('ar-EG'), 'ar-EG-u-ca-gregory-nu-latn');
  assert.equal(ui.safeLocale(ui.DEFAULT_LOCALE), ui.DEFAULT_LOCALE);
  assert.equal(ui.safeLocale('en-GB'), 'en-GB');
  const ar = ui.formatISODate('2026-11-10', ui.DEFAULT_LOCALE, { dateStyle: 'medium' });
  assert.match(ar, /2026/);
  assert.doesNotMatch(ar, /[٠-٩]/);
  assert.match(ui.formatISODate('2026-11-10', 'ar', { dateStyle: 'medium' }), /2026/);
  assert.equal(ui.formatISODate('2026-11-10', 'en-GB', { dateStyle: 'medium' }), '10 Nov 2026');
});

const files = ['dates.ts', 'Calendar.tsx', 'DatePicker.tsx'];
const src = (f) => readFileSync(new URL(`../src/react/${f}`, import.meta.url), 'utf8');

test('source: no bare Arabic locale tag anywhere in the React layer', () => {
  const bad = [];
  for (const f of readdirSync(new URL('../src/react/', import.meta.url))) {
    for (const m of src(f).matchAll(/['"`](ar(?:-[A-Za-z0-9]{2,4})?)['"`]/g))
      bad.push(`${f}: ${m[0]}`);
  }
  assert.deepEqual(bad, []);
});

test('source: no locale-less Intl or toLocale* call in the date files', () => {
  const bad = [];
  for (const f of files) {
    const code = src(f).replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
    for (const m of code.matchAll(/toLocale\w*\(\s*(\)|undefined|\[\s*\])/g))
      bad.push(`${f}: ${m[0]}`);
    for (const m of code.matchAll(/Intl\.(DateTimeFormat|NumberFormat)\(\s*(\)|undefined)/g))
      bad.push(`${f}: ${m[0]}`);
    for (const m of code.matchAll(/new Intl\.\w+\(\s*(\w+)/g))
      if (!/^(loc|safeLocale)$/.test(m[1])) bad.push(`${f}: ${m[0]}`);
    assert.doesNotMatch(code, /toLocale\w*\(/, `${f} must format through Intl with a locale`);
  }
  assert.deepEqual(bad, []);
});

test('Calendar: grid roles, today, selected, disabled, week start', () => {
  const out = html(
    h(ui.Calendar, {
      value: '2026-11-10',
      today: '2026-11-04',
      min: '2026-11-02',
      max: '2026-11-27',
      isDateDisabled: (d) => d === '2026-11-13',
    }),
  );
  assert.match(out, /<table role="grid" aria-labelledby="[^"]+" class="hx-cal-grid">/);
  assert.equal((out.match(/role="gridcell"/g) ?? []).length, 42);
  assert.equal((out.match(/<th /g) ?? []).length, 7);
  assert.equal((out.match(/ aria-selected="true"/g) ?? []).length, 1);
  assert.match(out, /data-iso="2026-11-10"[^>]*data-selected=""/);
  assert.match(out, /tabindex="0"[^>]*data-iso="2026-11-10"/);
  assert.equal((out.match(/tabindex="0"/g) ?? []).length, 1); // roving: one tab stop
  assert.match(out, /data-iso="2026-11-04"[^>]*aria-current="date"/);
  assert.match(out, /data-iso="2026-11-13"[^>]*aria-disabled="true"/);
  assert.match(out, /data-iso="2026-11-01"[^>]*aria-disabled="true"/); // before min
  assert.match(out, /data-iso="2026-11-28"[^>]*aria-disabled="true"/); // after max
  assert.match(out, /data-iso="2026-10-26"[^>]*data-outside=""/);
  assert.match(out, /aria-label="الشهر السابق"/);
  assert.match(out, /aria-label="الشهر التالي"/);
  assert.match(out, /hx-flip-rtl/);
  // Monday first: the first cell is Monday 26 Oct
  assert.ok(out.indexOf('data-iso="2026-10-26"') < out.indexOf('data-iso="2026-11-01"'));
  const sun = html(h(ui.Calendar, { value: '2026-11-10', weekStartsOn: 0 }));
  assert.ok(sun.indexOf('data-iso="2026-11-01"') < sun.indexOf('data-iso="2026-11-02"'));
  assert.match(sun, /<tr><td role="gridcell"[^>]*><button[^>]*data-iso="2026-11-01"/);
});

test('Calendar: no Eastern-Arabic digits or Islamic month names by default', () => {
  const out = html(h(ui.Calendar, { value: '2026-11-10', today: '2026-11-10' }));
  assert.doesNotMatch(out, /[٠-٩]/);
  assert.match(out, /class="hx-cal-title"[^>]*>[^<]*2026/);
  assert.doesNotMatch(out, /رمضان|محرم|صفر|جمادى|شوال|رجب|شعبان/);
});

test('Calendar: prev is disabled when the month before min is out of range', () => {
  const out = html(h(ui.Calendar, { value: '2026-11-10', min: '2026-11-01' }));
  assert.match(out, /<button type="button" disabled="" aria-label="الشهر السابق"/);
  assert.doesNotMatch(out, /aria-label="الشهر التالي"[^>]*disabled/);
});

test('DatePicker: closed shape, Field wiring, hidden input, placeholder', () => {
  const out = html(
    h(
      ui.Field,
      { label: 'تاريخ الميلاد', hint: 'اختياري', id: 'dob' },
      h(ui.DatePicker, { name: 'dob', value: '2026-11-10' }),
    ),
  );
  assert.match(out, /<label for="dob" class="hx-label">/);
  assert.match(out, /<button id="dob" [^>]*aria-describedby="dob-note dob-value"/);
  assert.match(out, /aria-haspopup="dialog" aria-expanded="false"/);
  assert.match(out, /class="hx-input hx-datepicker-trigger" data-size="md"/);
  assert.match(out, /<input type="hidden" name="dob" value="2026-11-10"\/>/);
  assert.doesNotMatch(out, /role="dialog"|role="grid"/);
  const empty = html(h(ui.DatePicker, { value: '' }));
  assert.match(empty, /data-empty=""/);
  assert.match(empty, />اختر التاريخ</);
  assert.doesNotMatch(empty, /type="hidden"/);
  assert.match(html(h(ui.DatePicker, { value: 'garbage', name: 'x' })), /name="x" value=""/);
});

test('DatePicker: clear button only while set; disabled blocks everything', () => {
  assert.match(
    html(h(ui.DatePicker, { value: '2026-11-10', clearable: true })),
    /hx-datepicker-clear/,
  );
  assert.match(
    html(h(ui.DatePicker, { value: '2026-11-10', clearable: true })),
    /aria-label="مسح التاريخ"/,
  );
  assert.doesNotMatch(html(h(ui.DatePicker, { clearable: true })), /hx-datepicker-clear/);
  const off = html(
    h(ui.DatePicker, { value: '2026-11-10', clearable: true, disabled: true, name: 'n' }),
  );
  assert.doesNotMatch(off, /hx-datepicker-clear/);
  assert.match(off, /<button[^>]*disabled=""/);
});

test('DatePicker: English labels and locale are overridable', () => {
  const out = html(
    h(ui.DatePicker, { locale: 'en-GB', value: '2026-11-10', labels: { placeholder: 'Pick' } }),
  );
  assert.match(out, />10 November 2026</);
  assert.match(
    html(h(ui.DatePicker, { locale: 'en-GB', labels: { placeholder: 'Pick' } })),
    />Pick</,
  );
});
