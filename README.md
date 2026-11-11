# @hexapi/design

One source of design tokens for every HexaPi app (club staff app, parent and student
portals, raffle, kiosk, LMS, simulator, Learn, website). Plan: club repo
`plans/113-shared-design-system.md`.

`src/tokens.mjs` is the only file to edit. `npm run build` regenerates `dist/`, which is
committed so consumers install from a git tag with no build step.

| Output                               | Use                                                                                                                                                                     |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dist/tokens.css`                    | `--hx-*` variables, light + dark, two brands. Variables only — linking it changes nothing by itself                                                                     |
| `dist/theme.css`                     | Tailwind 4: `@import '@hexapi/design/theme.css'` after `@import 'tailwindcss'` → `bg-surface`, `text-ink`, `border-line`, `bg-warning-soft`, `text-2xs`, `shadow-card`… |
| `dist/tokens.json`, `dist/tokens.js` | Same values for charts, PDFs, Blockly, non-CSS consumers                                                                                                                |
| `dist/prefs.js`                      | The shared theme/language preference module (keys and `hexapi:prefs` event unchanged)                                                                                   |
| `dist/auth-shell.css`                | The shared sign-in screen styles (`.hx-auth*`), self-contained; `createPrefs({ themeKey, langKey })` in `prefs` binds the preference functions to fixed keys            |
| `dist/preview.html`                  | Today vs candidate, both themes, both brands, Arabic and English — open in a browser                                                                                    |

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

## Not in 1.0.0

The `/bar/tokens.css` hand-over: the bar's current `--hx-surface` means "tinted well" while
here it means "card", so the bar is moved onto these names in the same change that links
this file.

## Components

Two more layers, each usable without the next:

```css
@import '@hexapi/design/tokens.css';
@import '@hexapi/design/components.css'; /* .hx-btn, .hx-card, .hx-field, .hx-input, .hx-badge… */
```

```tsx
import { Button, Field, Input } from '@hexapi/design/react';

<Field label="الاسم" error={errors.name} required>
  <Input value={name} onChange={…} />
</Field>
<Button tone="danger" variant="soft" loading={saving}>حذف</Button>
```

- One vocabulary: `variant` (solid, soft, outline, ghost, link), `tone` (brand, neutral,
  success, warning, danger, info), `size` (sm, md, lg), `loading`, `disabled`.
- Every selector is inside `:where()`: any class from the app wins without `!important`.
- Logical properties only, so RTL needs no overrides. Reduced motion is handled.
- `dist/gallery.html` shows every component in light/dark × RTL/LTR.

### One stylesheet per component

`components.css` is the whole set (41 KB). An app that renders only a few components can
load their parts instead; each part is self-contained and the result is identical in any
load order:

```css
@import '@hexapi/design/tokens.css';
@import '@hexapi/design/components/button.css';
@import '@hexapi/design/components/spinner.css';
@import '@hexapi/design/components/utilities.css';
```

Parts: `alert` `avatar` `badge` `button` `calendar` `card` `dialog` `empty` `field`
`pagination` `popover` `segmented` `skeleton` `spinner` `table` `tabs` `toast` `tooltip`
`utilities`. A React component that renders another needs that one's part too:

| Component                                       | Parts                                              |
| ----------------------------------------------- | -------------------------------------------------- |
| `Button`                                        | button, spinner, utilities                         |
| `IconButton`                                    | button                                             |
| `Spinner`                                       | spinner, utilities                                 |
| `Field`, `Input`, `Checkbox`, `Radio`, `Switch` | field                                              |
| `Tabs`                                          | tabs, badge                                        |
| `Dialog`                                        | dialog, button, utilities                          |
| `Menu`                                          | popover                                            |
| `Pagination`                                    | pagination, utilities                              |
| `DataTable`                                     | table, field, empty, skeleton, utilities           |
| `Calendar`                                      | calendar, button, utilities                        |
| `DatePicker`                                    | calendar, field, button, popover, utilities        |
| `Toaster`                                       | toast, button, spinner, utilities                  |
| the rest                                        | its own part (`alert`, `avatar`, `badge`, `card`…) |

The source stays one file, `src/components.css`; `scripts/split.mjs` lists which classes
each part owns, and the build fails on a class that is in no part.

Done: Button, IconButton, Badge, Alert, Card, Field, Label, Input, Textarea, Select,
Checkbox, Radio, Switch, FileInput, Range, Spinner, Skeleton, Dialog, Drawer, Tabs,
TabPanel, SegmentedControl, Pagination, Menu, Popover, Tooltip, Avatar, EmptyState, Toast,
DataTable (+ `sortRows`; composes with Pagination, cards below a container width),
Calendar, DatePicker (ISO `YYYY-MM-DD` strings, default locale `ar-LB-u-ca-gregory-nu-latn`, pass `en-GB` for English).

Dialog and Drawer use the native `<dialog>` element (focus trap, Escape and the inert page
come from the browser). Menu and Popover are positioned inside their own wrapper, so an
ancestor with `overflow: hidden` clips them.

Toast is `toast(msg)` / `toast.success|error|warning|info|loading|promise|dismiss` (a module
store, so it works from an axios interceptor) plus one `<Toaster position max />` per app.

Migrating from react-hot-toast:

1. Swap the import for `import { toast, Toaster } from '@hexapi/design/react'` and render `<Toaster />` once; the call sites stay as they are.
2. `toast.success/error/loading/dismiss(id)` and `toast.promise(p, { loading, success, error })` are the same (promise returns `p`; messages may be functions).
3. Pass `{ id }` to update in place, so a repeated network error does not stack; `duration`, `description`, `action: { label, onClick }` are options.
4. `toast.custom`, `toast.remove`, `Toaster toastOptions` and `reverseOrder` are not supported; `position` takes `top-start`/`top-end`/`bottom-*` (logical), not left/right.
5. Under a modal `<dialog>` toasts show but are inert (the browser disables the page outside the dialog).

## Visual regression

`npm run test:visual` screenshots each gallery panel (light/dark × RTL/LTR) at 1500px and
380px with Playwright (`@playwright/test`, a devDependency only; nothing ships to consumers),
and fails on console errors or horizontal overflow. It is not part of `npm test` or
`npm run check`. One-time setup: `npx playwright install chromium`. Run `npm run build`
first, since it reads `dist/gallery.html`.

After an intentional visual change: `npm run build && npm run test:visual:update`, look at
the changed PNGs in `visual/__snapshots__/`, and commit them with the change. Baselines
depend on the machine's fonts, so regenerate them on the same machine that compares them.

## z-index scale

`theme.css` ships the scale as Tailwind utilities: `z-sticky` (20), `z-dropdown` (30), `z-overlay` (40), `z-modal` (50), `z-toast` (60), `z-popover` (70 — a picker or menu opened from inside a dialog) and `z-banner` (100 — app-wide bars). Use these instead of raw `z-50` / `z-[9999]` for anything `fixed`; small local numbers (`z-10`) inside a positioned parent are fine.
