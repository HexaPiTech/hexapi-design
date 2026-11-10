// Toast: the pure store (stacking, update-by-id, max, dismiss, durations, promise)
// under plain Node, then the Toaster's server render and contract.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup as html } from 'react-dom/server';
import * as ui from '../dist/react/index.js';

const fresh = () => {
  const store = ui.createToastStore();
  return { store, toast: ui.makeToast(store) };
};
const ids = (store) => store.getState().toasts.map((t) => t.id);

test('toast: each call returns an id and stacks oldest-first', () => {
  const { store, toast } = fresh();
  const a = toast('a');
  const b = toast.success('b');
  assert.notEqual(a, b);
  assert.deepEqual(ids(store), [a, b]);
  assert.deepEqual(
    store.getState().toasts.map((t) => t.kind),
    ['default', 'success'],
  );
});

test('toast: an existing id updates in place (no stacking, position kept)', () => {
  const { store, toast } = fresh();
  toast('first');
  toast.error('network', { id: 'net' });
  toast('last');
  const before = store.getState().toasts[1].rev;
  toast.error('network again', { id: 'net' });
  const t = store.getState().toasts;
  assert.equal(t.length, 3);
  assert.equal(t[1].id, 'net');
  assert.equal(t[1].message, 'network again');
  assert.equal(t[1].rev, before + 1); // restarts its timer
});

test('toast: loading then success by id swaps kind and duration', () => {
  const { store, toast } = fresh();
  const id = toast.loading('saving');
  assert.equal(store.getState().toasts[0].duration, null);
  toast.success('saved', { id });
  const [t] = store.getState().toasts;
  assert.equal(t.kind, 'success');
  assert.equal(t.duration, 4000);
});

test('toast: durations by kind, and overrides', () => {
  const { store, toast } = fresh();
  toast('d');
  toast.error('e');
  toast.warning('w');
  toast('custom', { duration: 1000 });
  toast('forever', { duration: Infinity });
  toast.success('none', { duration: null });
  assert.deepEqual(
    store.getState().toasts.map((t) => t.duration),
    [4000, 6000, 6000, 1000, null, null],
  );
});

test('toast: dismiss(id) removes one, dismiss() clears all, unknown id is a no-op', () => {
  const { store, toast } = fresh();
  const a = toast('a');
  const b = toast('b');
  const state = store.getState();
  toast.dismiss('nope');
  assert.equal(store.getState(), state); // same reference: no re-render
  toast.dismiss(a);
  assert.deepEqual(ids(store), [b]);
  toast.dismiss();
  assert.deepEqual(ids(store), []);
});

test('store: subscribers are notified on change only, and can unsubscribe', () => {
  const { store, toast } = fresh();
  let n = 0;
  const off = store.subscribe(() => n++);
  toast('a');
  toast.dismiss('nope');
  assert.equal(n, 1);
  off();
  toast('b');
  assert.equal(n, 1);
});

test('visibleToasts: newest `max` only; older ones collapse out and return when room frees', () => {
  const { store, toast } = fresh();
  const [a, b, c, d] = ['a', 'b', 'c', 'd'].map((m) => toast(m));
  const shown = (max) => ui.visibleToasts(store.getState(), max).map((t) => t.id);
  assert.deepEqual(shown(3), [b, c, d]);
  assert.deepEqual(shown(1), [d]);
  assert.deepEqual(shown(0), [d]); // never zero
  toast.dismiss(d);
  assert.deepEqual(shown(3), [a, b, c]);
});

test('toast.promise: loading, then the same toast becomes success; returns the promise', async () => {
  const { store, toast } = fresh();
  const p = Promise.resolve(42);
  const out = toast.promise(p, { loading: 'wait', success: (v) => `got ${v}`, error: 'no' });
  assert.equal(out, p);
  assert.equal(store.getState().toasts[0].kind, 'loading');
  const id = store.getState().toasts[0].id;
  await p;
  await Promise.resolve();
  const t = store.getState().toasts;
  assert.equal(t.length, 1);
  assert.deepEqual([t[0].id, t[0].kind, t[0].message], [id, 'success', 'got 42']);
});

test('toast.promise: rejection becomes an error toast with the error passed in', async () => {
  const { store, toast } = fresh();
  const p = Promise.reject(new Error('boom'));
  toast
    .promise(p, { loading: 'wait', success: 'ok', error: (e) => `failed: ${e.message}` })
    .catch(() => {});
  await p.catch(() => {});
  await Promise.resolve();
  const [t] = store.getState().toasts;
  assert.deepEqual([t.kind, t.message, t.duration], ['error', 'failed: boom', 6000]);
});

test('toast: description and action are kept', () => {
  const { store, toast } = fresh();
  const action = { label: 'تراجع', onClick() {} };
  toast('x', { description: 'd', action });
  const [t] = store.getState().toasts;
  assert.equal(t.description, 'd');
  assert.equal(t.action, action);
});

test('Toaster renders nothing on the server, even with toasts queued', () => {
  ui.toast('queued');
  assert.equal(html(h(ui.Toaster, null)), '');
  ui.toast.dismiss();
});
