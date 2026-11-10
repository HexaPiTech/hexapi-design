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

## Components (in progress — phase 3 of plan 113)

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
