import { neutral, brands, status, entity, onSolid } from '../src/tokens.mjs';

/** Flat { name: value } colour map for one theme + brand. */
export function resolveColors(theme, brand = 'club') {
  const out = {};
  for (const [k, v] of Object.entries(neutral)) out[k] = v[theme];
  for (const [k, v] of Object.entries(brands[brand])) out[k] = v[theme];
  for (const group of [status, entity])
    for (const [name, roles] of Object.entries(group))
      for (const [role, v] of Object.entries(roles)) out[`${name}-${role}`] = v[theme];
  out['on-solid'] = onSolid[theme];
  return out;
}

export function parseColor(c) {
  if (c.startsWith('#')) {
    const n = c.slice(1);
    return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16)).concat(1);
  }
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (!m) throw new Error(`Unsupported colour: ${c}`);
  const p = m[1].split(',').map((x) => parseFloat(x));
  return [p[0], p[1], p[2], p[3] ?? 1];
}

/** Flatten a possibly translucent colour onto an opaque backdrop. */
export function over(fg, bg) {
  const [r, g, b, a] = parseColor(fg);
  const [R, G, B] = parseColor(bg);
  return [r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a), 1];
}

function luminance([r, g, b]) {
  const f = (v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/** WCAG contrast of fg on bg; translucent colours are composited on `backdrop`. */
export function contrast(fg, bg, backdrop) {
  const b = over(bg, backdrop);
  const f = over(fg, `rgb(${b[0]}, ${b[1]}, ${b[2]})`);
  const [hi, lo] = [luminance(f), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
