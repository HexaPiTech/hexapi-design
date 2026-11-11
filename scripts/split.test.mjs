// The per-component stylesheets must together say exactly what components.css
// says, each part in the same order, so loading parts never changes a cascade.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { PARTS, blocks, split } from './split.mjs';

const src = readFileSync(new URL('../src/components.css', import.meta.url), 'utf8');
const parts = split(src);
const norm = (s) =>
  s
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .trim();

/** Flat list of `[wrapper, selector, body]` for a sheet, @keyframes apart. */
function rules(css) {
  const list = [];
  const frames = [];
  for (const b of blocks(css)) {
    if (/^@keyframes/.test(b.prelude)) frames.push(norm(`${b.prelude}{${b.body}}`));
    else if (b.prelude.startsWith('@'))
      for (const c of blocks(b.body)) list.push(norm(`${b.prelude} | ${c.prelude} {${c.body}}`));
    else list.push(norm(`${b.prelude} {${b.body}}`));
  }
  return { list, frames };
}

test('split: every rule of components.css is in at least one part, and nothing else is', () => {
  const full = rules(src);
  const seen = new Set();
  for (const text of Object.values(parts)) for (const r of rules(text).list) seen.add(r);
  assert.deepEqual([...seen].sort(), [...new Set(full.list)].sort());
});

test('split: each part keeps the source order of its rules', () => {
  const order = new Map(rules(src).list.map((r, i) => [r, i]));
  for (const [part, text] of Object.entries(parts)) {
    const idx = rules(text).list.map((r) => order.get(r));
    assert.deepEqual(
      idx,
      [...idx].sort((a, b) => a - b),
      part,
    );
  }
});

test('split: a part carries the @keyframes it animates with, unchanged', () => {
  const full = new Set(rules(src).frames);
  for (const [part, text] of Object.entries(parts)) {
    const { frames } = rules(text);
    for (const f of frames) assert.ok(full.has(f), `${part}: altered keyframes`);
    const names = frames.map((f) => f.split(/[ {]/)[1]);
    for (const [, name] of norm(text).matchAll(/animation(?:-name)?:\s*(hx-[a-z-]+)/g))
      assert.ok(names.includes(name), `${part} uses ${name} without defining it`);
  }
});

test('split: every part names only its own classes outside shared rules, and is built', () => {
  const built = readdirSync(new URL('../dist/components', import.meta.url)).sort();
  assert.deepEqual(
    built,
    Object.keys(PARTS)
      .map((p) => `${p}.css`)
      .sort(),
  );
  for (const p of Object.keys(PARTS)) {
    const dist = readFileSync(new URL(`../dist/components/${p}.css`, import.meta.url), 'utf8');
    assert.ok(dist.endsWith(parts[p]), p);
    for (const c of PARTS[p]) assert.ok(dist.includes(`.${c}`), `${p}: .${c} has no rule`);
  }
});

test('split: an unknown class fails the build instead of vanishing', () => {
  assert.throws(() => split(':where(.hx-nope) { color: red; }'), /not listed in PARTS/);
  assert.throws(() => split(':where(button) { color: red; }'), /no part owns/);
});
