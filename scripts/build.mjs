// Generates everything in dist/ from src/tokens.mjs. No dependencies.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { neutral, brands, status, entity, scale, today } from '../src/tokens.mjs';
import { resolveColors } from './lib.mjs';
import { renderPreview } from './preview.mjs';
import { renderGallery } from './gallery.mjs';

const root = new URL('..', import.meta.url);
const out = (name, text) => writeFileSync(new URL(`dist/${name}`, root), text);
mkdirSync(new URL('dist', root), { recursive: true });
const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));
const banner = `/* @hexapi/design ${pkg.version} — GENERATED from src/tokens.mjs. Do not edit. */\n`;

const decl = (obj) =>
  Object.entries(obj)
    .map(([k, v]) => `  --hx-${k}: ${v};`)
    .join('\n');
const themed = (theme) =>
  Object.fromEntries(
    Object.entries(scale)
      .filter(([, v]) => typeof v === 'object')
      .map(([k, v]) => [k, v[theme]]),
  );
const flat = Object.fromEntries(Object.entries(scale).filter(([, v]) => typeof v === 'string'));
const brandOnly = (theme, brand) =>
  Object.fromEntries(Object.entries(brands[brand]).map(([k, v]) => [k, v[theme]]));

// ── tokens.css ─────────────────────────────────────────────────────────────
// Variables only: linking this file never changes a page by itself. Every
// selector is inside :where(), so its specificity is zero and source order
// alone decides — the dark block must stay after the light one. The theme
// switch and the brand attribute both live on <html>.
const DARK = ":where(.dark, [data-theme='dark'])";
let css = banner;
css += `:where(:root) {\n${decl(flat)}\n${decl(resolveColors('light'))}\n${decl(themed('light'))}\n}\n\n`;
css += `${DARK} {\n${decl(resolveColors('dark'))}\n${decl(themed('dark'))}\n}\n`;
for (const brand of Object.keys(brands).filter((b) => b !== 'club')) {
  css += `\n:where([data-hx-brand='${brand}']) {\n${decl(brandOnly('light', brand))}\n}\n`;
  css += `:where(.dark[data-hx-brand='${brand}'], [data-theme='dark'][data-hx-brand='${brand}']) {\n${decl(brandOnly('dark', brand))}\n}\n`;
}
out('tokens.css', css);

// ── theme.css (Tailwind 4) ─────────────────────────────────────────────────
// `@import '@hexapi/design/theme.css'` after `@import 'tailwindcss'` gives
// bg-surface, text-ink, border-line, bg-warning-soft, text-2xs, rounded-hx…
const colorNames = Object.keys(resolveColors('light'));
let theme = banner + "@import './tokens.css';\n\n@theme inline {\n";
theme += colorNames.map((n) => `  --color-${n}: var(--hx-${n});`).join('\n');
theme += `
  --font-hx: var(--hx-font);
  --radius-hx-sm: var(--hx-radius-sm);
  --radius-hx: var(--hx-radius);
  --radius-hx-lg: var(--hx-radius-lg);
  --shadow-card: var(--hx-shadow-card);
  --shadow-raised: var(--hx-shadow-raised);
  --shadow-overlay: var(--hx-shadow-overlay);
  --text-2xs: var(--hx-text-2xs);
  --text-2xs--line-height: var(--hx-text-2xs-leading);
}
`;
out('theme.css', theme);

// ── tokens.json / tokens.js / tokens.d.ts ──────────────────────────────────
const data = {
  version: pkg.version,
  light: Object.fromEntries(Object.keys(brands).map((b) => [b, resolveColors('light', b)])),
  dark: Object.fromEntries(Object.keys(brands).map((b) => [b, resolveColors('dark', b)])),
  scale: { ...flat, light: themed('light'), dark: themed('dark') },
};
out('tokens.json', JSON.stringify(data, null, 2) + '\n');
out(
  'tokens.js',
  `// @hexapi/design ${pkg.version} — GENERATED. Do not edit.\nexport const tokens = ${JSON.stringify(data, null, 2)};\nexport default tokens;\n`,
);
const union = (keys) => keys.map((k) => `'${k}'`).join(' | ');
out(
  'tokens.d.ts',
  `// @hexapi/design ${pkg.version} — GENERATED. Do not edit.
export type HxTheme = 'light' | 'dark';
export type HxBrand = ${union(Object.keys(brands))};
export type HxColor = ${union(colorNames)};
export type HxTone = ${union(Object.keys(status))};
export type HxEntity = ${union(Object.keys(entity))};
export interface HxTokens {
  version: string;
  light: Record<HxBrand, Record<HxColor, string>>;
  dark: Record<HxBrand, Record<HxColor, string>>;
  scale: Record<string, string> & { light: Record<string, string>; dark: Record<string, string> };
}
export declare const tokens: HxTokens;
export default tokens;
`,
);

// ── prefs ──────────────────────────────────────────────────────────────────
const prefsTs = readFileSync(new URL('src/prefs.ts', root), 'utf8');
out('prefs.js', stripTypeScriptTypes(prefsTs, { mode: 'strip' }));
out('prefs.d.ts', readFileSync(new URL('src/prefs.d.ts', root), 'utf8'));

// ── components.css ─────────────────────────────────────────────────────────
// Hand-written source, shipped as is. It must stay framework-free: only --hx-*
// variables, every selector inside :where().
const componentsCss = readFileSync(new URL('src/components.css', root), 'utf8');
out(
  'components.css',
  banner.replace('GENERATED from src/tokens.mjs', 'copied from src/components.css') + componentsCss,
);

// ── react/ ─────────────────────────────────────────────────────────────────
rmSync(new URL('dist/react', root), { recursive: true, force: true });
execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.json'], {
  cwd: root,
  stdio: 'inherit',
});

// ── preview.html ───────────────────────────────────────────────────────────
out('preview.html', renderPreview({ version: pkg.version, neutral, brands, today, resolveColors }));
out('gallery.html', await renderGallery({ version: pkg.version, root }));
console.log(`@hexapi/design ${pkg.version}: dist/ written (${colorNames.length} colour tokens)`);
