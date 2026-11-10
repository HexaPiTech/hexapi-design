# @hexapi/design

One source of design tokens for every HexaPi app (club staff app, parent and student
portals, raffle, kiosk, LMS, simulator, Learn, website). Plan: club repo
`plans/113-shared-design-system.md`.

`src/tokens.mjs` is the only file to edit. `npm run build` regenerates `dist/`, which is
committed so consumers install from a git tag with no build step.

| Output | Use |
|---|---|
| `dist/tokens.css` | `--hx-*` variables, light + dark, two brands. Variables only — linking it changes nothing by itself |
| `dist/theme.css` | Tailwind 4: `@import '@hexapi/design/theme.css'` after `@import 'tailwindcss'` → `bg-surface`, `text-ink`, `border-line`, `bg-warning-soft`, `text-2xs`, `shadow-card`… |
| `dist/tokens.json`, `dist/tokens.js` | Same values for charts, PDFs, Blockly, non-CSS consumers |
| `dist/prefs.js` | The shared theme/language preference module (keys and `hexapi:prefs` event unchanged) |
| `dist/preview.html` | Today vs candidate, both themes, both brands, Arabic and English — open in a browser |

## Rules

- Dark mode: `class="dark"` or `data-theme="dark"` on `<html>`. Brand: default is the club
  cyan; `data-hx-brand="lms"` on `<html>` selects the navy ramp.
- Every selector is inside `:where()` (zero specificity). Keep the dark block after the
  light block; never wrap the file in a higher-specificity selector.
- Colour names are semantic (`canvas`, `surface`, `raised`, `sunken`, `line`, `ink`,
  `brand`, and `solid` / `soft` / `ink` / `line` per tone and entity). Dark `soft` and
  `line` are the bright hue at low alpha, never a `-900` shade.
- `npm test` enforces contrast: text ≥ 4.5:1, primary ink ≥ 7:1, field borders ≥ 3:1, in
  both themes and both brands. A token change that fails it does not ship.
- `npm run check` = build + test + "dist is committed".

## Not in 0.1.0

Component classes (`.hx-*`) and React components (plan phases 3+), and the `/bar/tokens.css`
hand-over: the bar's current `--hx-surface` means "tinted well" while here it means "card",
so the bar is moved onto these names in the same change that links this file.
