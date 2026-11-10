import assert from 'node:assert/strict';
import { test, beforeEach } from 'node:test';

const store = new Map();
const listeners = new Map();
globalThis.window = {
  location: { pathname: '/system/' },
  localStorage: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => void store.set(k, String(v)),
  },
  addEventListener: (t, f) => void listeners.set(f, t),
  removeEventListener: (t, f) => void listeners.delete(f),
  dispatchEvent: (e) => {
    for (const [f, t] of listeners) if (t === e.type) f(e);
    return true;
  },
};
globalThis.CustomEvent = class {
  constructor(type, init) {
    this.type = type;
    this.detail = init?.detail;
  }
};

const prefs = await import('../dist/prefs.js');

beforeEach(() => {
  store.clear();
  listeners.clear();
  window.location.pathname = '/system/';
});

test('path scope: club keys outside /lms, LMS keys under it', () => {
  prefs.setPrefs({ theme: 'dark', lang: 'ar' });
  assert.equal(store.get('theme'), 'dark');
  assert.equal(store.get('hexapi:lang'), 'ar');
  window.location.pathname = '/lms/courses';
  assert.equal(prefs.getTheme(), null);
  prefs.setPrefs({ theme: 'light' });
  assert.equal(store.get('hexapi-lms:theme'), 'light');
  assert.equal(store.get('theme'), 'dark');
});

test('createPrefs: fixed keys whatever the path', () => {
  const lms = prefs.createPrefs({ themeKey: 'hexapi-lms:theme', langKey: 'hexapi-lms:lang' });
  lms.setPrefs({ theme: 'dark', lang: 'fr' });
  assert.equal(store.get('hexapi-lms:theme'), 'dark');
  assert.equal(store.get('hexapi-lms:lang'), 'fr');
  assert.equal(store.has('theme'), false);
  assert.deepEqual(lms.getPrefs(), { theme: 'dark', lang: 'fr' });
  assert.deepEqual(prefs.getPrefs(), {});
});

test('createPrefs: announces only what changed, rejects junk', () => {
  const lms = prefs.createPrefs({ themeKey: 't', langKey: 'l' });
  const seen = [];
  const off = lms.onPrefsChange((p) => seen.push(p));
  lms.setPrefs({ theme: 'dark' });
  lms.setPrefs({ theme: 'dark' });
  lms.setPrefs({ theme: 'purple', lang: 'de' });
  off();
  lms.setPrefs({ theme: 'light' });
  assert.deepEqual(seen, [{ theme: 'dark' }]);
});

test('createPrefs: migrateLangKey copies once and keeps the old key', () => {
  const lms = prefs.createPrefs({ themeKey: 't', langKey: 'l' });
  store.set('old', 'en');
  assert.equal(lms.migrateLangKey('old'), 'en');
  store.set('old', 'fr');
  assert.equal(lms.migrateLangKey('old'), 'en');
  assert.equal(store.get('old'), 'fr');
});
