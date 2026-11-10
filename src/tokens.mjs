/**
 * The ONE source of every HexaPi design token. `npm run build` turns this
 * file into dist/tokens.css, dist/theme.css (Tailwind 4), dist/tokens.json,
 * dist/tokens.js and dist/preview.html. Never edit dist/ by hand.
 *
 * Colour tokens are semantic: a name says what a colour is FOR, and each has a
 * light and a dark value. Apps never pick a palette step for chrome.
 */

/** Neutrals: page, cards, borders, text. */
export const neutral = {
  sunken: { light: '#eef2f7', dark: '#070d19', note: 'wells, table headers, inset areas' },
  canvas: { light: '#f4f7fb', dark: '#0a1120', note: 'the page behind everything' },
  surface: { light: '#ffffff', dark: '#111b2e', note: 'cards, panels, dialogs' },
  raised: { light: '#ffffff', dark: '#18253c', note: 'menus, popovers, hovered rows' },
  line: { light: '#e2e8f0', dark: '#24344f', note: 'dividers, card borders' },
  'line-strong': { light: '#7f8ea5', dark: '#5a7198', note: 'field borders (3:1 on surface)' },
  ink: { light: '#0f172a', dark: '#e8eef7', note: 'primary text' },
  'ink-soft': { light: '#475569', dark: '#b4c2d6', note: 'secondary text' },
  'ink-muted': { light: '#5b6b82', dark: '#8b9cb5', note: 'hints, placeholders, captions' },
};

/**
 * Brand ramps (owner decision 1, default): two named brands on the SAME token
 * names. `club` is the default; an app opts into another with
 * `data-hx-brand="lms"` on <html>.
 */
export const brands = {
  club: {
    brand: { light: '#0a7d99', dark: '#22d3ee', note: 'primary buttons, active states' },
    'brand-strong': { light: '#0e6680', dark: '#67e8f9', note: 'hover / pressed' },
    'brand-soft': { light: '#ecfeff', dark: 'rgba(34, 211, 238, 0.12)', note: 'selected rows, chips' },
    'brand-ink': { light: '#0e7490', dark: '#67e8f9', note: 'brand-coloured text and links' },
    'brand-line': { light: '#a5f3fc', dark: 'rgba(34, 211, 238, 0.3)', note: 'brand borders' },
    'on-brand': { light: '#ffffff', dark: '#06202a', note: 'text on a brand fill' },
  },
  lms: {
    brand: { light: '#3c65a7', dark: '#6a98d6' },
    'brand-strong': { light: '#2f5188', dark: '#8fb3e2' },
    'brand-soft': { light: '#eef4fc', dark: 'rgba(106, 152, 214, 0.14)' },
    'brand-ink': { light: '#2f5188', dark: '#8fb3e2' },
    'brand-line': { light: '#b6cfee', dark: 'rgba(106, 152, 214, 0.3)' },
    'on-brand': { light: '#ffffff', dark: '#0a1120' },
  },
};

/**
 * Tones. Each has four roles: `solid` (a fill that carries white/dark text),
 * `soft` (a tinted background), `ink` (text on surface or on soft) and `line`
 * (a border). Dark `soft`/`line` are the BRIGHT hue at low alpha — never a
 * -900 shade, which is what made dark callouts look brown.
 */
const tone = (lSolid, lSoft, lInk, lLine, d, dInk) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(d.slice(i, i + 2), 16));
  return {
    solid: { light: lSolid, dark: d },
    soft: { light: lSoft, dark: `rgba(${r}, ${g}, ${b}, 0.12)` },
    ink: { light: lInk, dark: dInk },
    line: { light: lLine, dark: `rgba(${r}, ${g}, ${b}, 0.3)` },
  };
};

export const status = {
  success: tone('#15803d', '#f0fdf4', '#166534', '#bbf7d0', '#4ade80', '#86efac'),
  warning: tone('#b45309', '#fffbeb', '#92400e', '#fde68a', '#fbbf24', '#fcd34d'),
  danger: tone('#dc2626', '#fef2f2', '#991b1b', '#fecaca', '#f87171', '#fca5a5'),
  info: tone('#2563eb', '#eff6ff', '#1e40af', '#bfdbfe', '#60a5fa', '#93c5fd'),
};

/** Entity colours: the same four roles, one hue per kind of record. */
export const entity = {
  student: tone('#9333ea', '#faf5ff', '#7e22ce', '#e9d5ff', '#c084fc', '#d8b4fe'),
  instructor: tone('#4f46e5', '#eef2ff', '#4338ca', '#c7d2fe', '#818cf8', '#a5b4fc'),
  course: tone('#c2410c', '#fff7ed', '#c2410c', '#fed7aa', '#fb923c', '#fdba74'),
  group: tone('#0f766e', '#f0fdfa', '#0f766e', '#99f6e4', '#2dd4bf', '#5eead4'),
};

/** Text that sits on any `-solid` fill. */
export const onSolid = { light: '#ffffff', dark: '#0a1120' };

/** Non-colour tokens (same in both themes unless given as {light, dark}). */
export const scale = {
  font: "'Cairo', 'Segoe UI', Tahoma, system-ui, -apple-system, sans-serif",
  'font-mono': "ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace",

  'radius-sm': '8px',
  radius: '12px',
  'radius-lg': '16px',
  'radius-pill': '999px',

  'text-2xs': '0.6875rem', // 11px — the floor; replaces text-[10px]/text-[11px]
  'text-2xs-leading': '1rem',

  'control-sm': '2rem',
  control: '2.5rem',
  'control-lg': '3rem',

  'focus-ring': '0 0 0 2px var(--hx-surface), 0 0 0 4px var(--hx-brand)',
  'disabled-opacity': '0.55',

  'shadow-card': {
    light: '0 1px 2px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04)',
    dark: '0 0 0 1px rgba(255, 255, 255, 0.02)',
  },
  'shadow-raised': {
    light: '0 4px 16px rgba(15, 23, 42, 0.08)',
    dark: '0 8px 24px rgba(0, 0, 0, 0.45)',
  },
  'shadow-overlay': {
    light: '0 20px 48px rgba(15, 23, 42, 0.18)',
    dark: '0 24px 56px rgba(0, 0, 0, 0.6)',
  },

  'z-base': '0',
  'z-sticky': '20',
  'z-dropdown': '30',
  'z-overlay': '40',
  'z-modal': '50',
  'z-toast': '60',
};

/**
 * Contrast contract, checked by scripts/contrast.test.mjs for every theme and
 * brand: [foreground, background, minimum ratio].
 */
export const contrastPairs = [
  ['ink', 'surface', 7],
  ['ink', 'canvas', 7],
  ['ink-soft', 'surface', 4.5],
  ['ink-soft', 'canvas', 4.5],
  ['ink-muted', 'surface', 4.5],
  ['ink-muted', 'canvas', 4.5],
  ['ink-muted', 'raised', 4.5],
  ['line-strong', 'surface', 3],
  ['on-brand', 'brand', 4.5],
  ['on-brand', 'brand-strong', 4.5],
  ['brand-ink', 'surface', 4.5],
  ['brand-ink', 'brand-soft', 4.5],
  ...['success', 'warning', 'danger', 'info', 'student', 'instructor', 'course', 'group'].flatMap(
    (t) => [
      ['on-solid', `${t}-solid`, 4.5],
      [`${t}-ink`, 'surface', 4.5],
      [`${t}-ink`, `${t}-soft`, 4.5],
    ]
  ),
];

/** What each app uses today — shown on the preview page next to the candidate. */
export const today = {
  club: {
    light: { sunken: '#f1f5f9', canvas: '#f8fafc', surface: '#ffffff', raised: '#ffffff', line: '#e2e8f0', 'line-strong': '#cbd5e1', ink: '#0f172a', 'ink-soft': '#475569', 'ink-muted': '#64748b' },
    dark: { sunken: '#0f172a', canvas: '#0f172a', surface: '#1e293b', raised: '#334155', line: '#334155', 'line-strong': '#475569', ink: '#f1f5f9', 'ink-soft': '#cbd5e1', 'ink-muted': '#94a3b8' },
  },
  lms: {
    light: { sunken: '#eef4fc', canvas: '#f5f7fa', surface: '#ffffff', raised: '#ffffff', line: '#dde6f1', 'line-strong': '#c2cfe0', ink: '#1e3a5f', 'ink-soft': '#5d6f87', 'ink-muted': '#5d6f87' },
    dark: { sunken: '#0b1426', canvas: '#0b1426', surface: '#11203a', raised: '#182c4d', line: '#1f3357', 'line-strong': '#2f4a78', ink: '#eaf1fb', 'ink-soft': '#8fa3c2', 'ink-muted': '#8fa3c2' },
  },
};
