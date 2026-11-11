// Splits src/components.css into one stylesheet per component family, so an app
// can load only what it renders (`@hexapi/design/components/button.css`).
//
// The source stays one hand-written file. A rule goes into every part that owns
// a class its selector names, in source order, so each part cascades exactly as
// the full sheet does. A shared rule (`:where(.hx-btn, .hx-badge) { … }`) is
// copied whole into each of its parts: the extra selectors match nothing there.

/** part → the classes it owns. Every `.hx-*` class in the sheet is in exactly one. */
export const PARTS = {
  button: ['hx-btn', 'hx-icon-btn'],
  badge: ['hx-badge', 'hx-count'],
  alert: ['hx-alert'],
  card: ['hx-card'],
  field: [
    'hx-field',
    'hx-label',
    'hx-hint',
    'hx-input',
    'hx-check',
    'hx-choice',
    'hx-switch',
    'hx-file',
    'hx-range',
  ],
  spinner: ['hx-spinner'],
  skeleton: ['hx-skeleton'],
  utilities: ['hx-sr-only', 'hx-flip-rtl'],
  dialog: [
    'hx-dialog',
    'hx-dialog-header',
    'hx-dialog-title',
    'hx-dialog-body',
    'hx-dialog-footer',
  ],
  tabs: ['hx-tabs', 'hx-tab'],
  segmented: ['hx-segmented'],
  pagination: ['hx-pagination', 'hx-page-btn', 'hx-page-gap'],
  popover: ['hx-pop', 'hx-pop-host', 'hx-menu-item'],
  tooltip: ['hx-tip', 'hx-tip-host'],
  avatar: ['hx-avatar'],
  empty: ['hx-empty', 'hx-empty-title', 'hx-empty-text'],
  table: [
    'hx-table',
    'hx-table-wrap',
    'hx-table-scroll',
    'hx-table-caption',
    'hx-table-select',
    'hx-table-skel',
    'hx-table-cards',
    'hx-table-card',
    'hx-table-card-body',
    'hx-table-card-empty',
    'hx-col-hide',
    'hx-sort',
    'hx-sort-btn',
    'hx-sort-up',
    'hx-sort-down',
  ],
  toast: [
    'hx-toaster',
    'hx-toast-list',
    'hx-toast-item',
    'hx-toast',
    'hx-toast-icon',
    'hx-toast-body',
    'hx-toast-message',
    'hx-toast-desc',
  ],
  calendar: [
    'hx-calendar',
    'hx-cal-head',
    'hx-cal-title',
    'hx-cal-grid',
    'hx-cal-dow',
    'hx-cal-day',
    'hx-datepicker',
    'hx-datepicker-trigger',
    'hx-datepicker-icon',
    'hx-datepicker-value',
    'hx-datepicker-clear',
  ],
};

const OWNER = new Map();
for (const [part, classes] of Object.entries(PARTS)) {
  for (const c of classes) {
    if (OWNER.has(c)) throw new Error(`split: .${c} is listed in two parts`);
    OWNER.set(c, part);
  }
}

/** Top-level items of a CSS text: `{ prelude, body }` for a block, comments dropped. */
export function blocks(css) {
  const items = [];
  let i = 0;
  let start = 0;
  let depth = 0;
  let open = -1;
  while (i < css.length) {
    const ch = css[i];
    if (ch === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2);
      if (end < 0) throw new Error('split: unclosed comment');
      if (depth === 0) {
        // a comment between blocks is not part of the next prelude
        if (css.slice(start, i).trim() === '') start = end + 2;
      }
      i = end + 2;
      continue;
    }
    if (ch === '"' || ch === "'") {
      i++;
      while (i < css.length && css[i] !== ch) i += css[i] === '\\' ? 2 : 1;
      i++;
      continue;
    }
    if (ch === '{') {
      if (depth === 0) open = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth < 0) throw new Error('split: unbalanced }');
      if (depth === 0) {
        items.push({
          prelude: css.slice(start, open).trim(),
          body: css.slice(open + 1, i),
        });
        start = i + 1;
      }
    }
    i++;
  }
  if (depth !== 0) throw new Error('split: unclosed block');
  if (css.slice(start).trim() !== '') throw new Error('split: text outside a block');
  return items;
}

const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');

function partsOf(selector) {
  const found = new Set();
  for (const [, cls] of stripComments(selector).matchAll(/\.(hx-[a-z0-9-]+)/g)) {
    const part = OWNER.get(cls);
    if (!part) throw new Error(`split: .${cls} is not listed in PARTS (scripts/split.mjs)`);
    found.add(part);
  }
  return found;
}

const indent = (s) =>
  s
    .split('\n')
    .map((l) => (l ? `  ${l}` : l))
    .join('\n');

/** components.css text → { part: css }. Throws on a rule no part owns. */
export function split(css) {
  const out = Object.fromEntries(Object.keys(PARTS).map((p) => [p, []]));
  const keyframes = new Map();

  const place = (item, wrap) => {
    const { prelude, body } = item;
    if (/^@keyframes\s/.test(prelude)) {
      keyframes.set(prelude.split(/\s+/)[1], `${prelude} {${body}}`);
      return;
    }
    if (/^@(media|supports|container)\b/.test(prelude)) {
      // one wrapper per part, holding only that part's inner rules
      const inner = Object.fromEntries(Object.keys(PARTS).map((p) => [p, []]));
      for (const child of blocks(body)) {
        if (child.prelude.startsWith('@')) throw new Error(`split: nested ${child.prelude}`);
        const parts = partsOf(child.prelude);
        if (parts.size === 0) throw new Error(`split: no part owns "${child.prelude}"`);
        for (const p of parts) inner[p].push(`${child.prelude} {${child.body}}`);
      }
      for (const [p, rules] of Object.entries(inner)) {
        if (rules.length) out[p].push(`${prelude} {\n${indent(rules.join('\n'))}\n}`);
      }
      return;
    }
    if (prelude.startsWith('@')) throw new Error(`split: unsupported ${prelude}`);
    const parts = partsOf(prelude);
    if (parts.size === 0) throw new Error(`split: no part owns "${prelude}"`);
    for (const p of parts) out[p].push(`${prelude} {${body}}`);
  };

  for (const item of blocks(css)) place(item);

  const result = {};
  for (const [part, rules] of Object.entries(out)) {
    if (rules.length === 0) throw new Error(`split: part "${part}" is empty`);
    let text = rules.join('\n');
    // Animations a part uses travel with it. Identical @keyframes in two parts
    // are harmless: the last definition wins and they are the same.
    for (const [name, block] of keyframes) {
      if (new RegExp(`\\b${name}\\b`).test(text)) text += `\n${block}`;
    }
    result[part] = `${text}\n`;
  }
  return result;
}
