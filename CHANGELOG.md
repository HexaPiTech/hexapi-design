# Changelog

Versions follow semver. A **major** renames or removes a token, a class or a component
prop; a **minor** adds one; a **patch** changes no name. Apps pin a tag
(`github:HexaPiTech/hexapi-design#vX.Y.Z`), so nothing changes in an app until its pin
moves.

## Releasing

1. `npm run check` (build, tests, `dist/` committed) and `npm run test:visual`.
2. Add the entry below, bump `version` in `package.json`, commit, tag `vX.Y.Z`, push the
   tag.
3. Bump the pin in each app that should get it — club, LMS, simulator — following the
   "design-package bump" section of that repo's ship skill. The club website carries a
   copy of `dist/tokens.css` (`assets/hexapi-tokens.css`): re-copy it when a token it
   reads changes.

## 1.2.0 — 2026-11-11

- One stylesheet per component family: `@hexapi/design/components/<part>.css` (19 parts,
  0.4–5 KB each). `components.css` is unchanged and still the whole set. Which parts each
  React component needs: README § "One stylesheet per component".

## 1.1.1 — 2026-11-11

- Fix: `dialog.hx-dialog` states `margin: auto`, so an app's CSS reset cannot pin the
  dialog to a corner.

## 1.1.0 — 2026-11-11

- `createPrefs()` — the theme and language preference module with fixed storage keys.
- `auth-shell.css` — the shared sign-in screen styles.

## 1.0.2 — 2026-11-10

- Tokens: `z-popover` and `z-banner` levels; `z-*` utilities in `theme.css`.

## 1.0.1 — 2026-11-10

- Fix: three unclosed blocks in `components.css` nested the toast and calendar rules
  under a media query.

## 1.0.0 — 2026-11-10

- Components v1: buttons, fields, card, badge, dialog, drawer, tabs, segmented control,
  pagination, menu, popover, tooltip, avatar, empty state, file input, range, DataTable,
  calendar and date picker, Toast — as `.hx-*` classes and React components.
- Playwright gallery regression (light/dark, RTL/LTR, 1500 and 380 px).

## 0.1.1 — 2026-11-10

- `tokens.css` is variables only: `color-scheme` removed.

## 0.1.0 — 2026-11-10

- Design tokens: `tokens.css`, the Tailwind 4 `theme.css`, `tokens.json`, JS tokens, the
  preference module and the preview page.
