/**
 * Theme + language preferences for the HexaPi apps on hexapi.club (plan 091,
 * contracts 1–2). One origin means one `localStorage`, so the keys are
 * scoped: the club apps (system, student portal, simulator, Learn) share one
 * pair and the LMS keeps its own, so changing either side never changes the
 * other (owner, 2026-11-05):
 *
 *   club  localStorage.theme                'light' | 'dark'
 *         localStorage['hexapi:lang']       'ar' | 'en' | 'fr'
 *   LMS   localStorage['hexapi-lms:theme']  'light' | 'dark'
 *         localStorage['hexapi-lms:lang']   'ar' | 'en' | 'fr'
 *
 * The scope follows the page's path (`/lms/…` → LMS), so the bar drawn inside
 * the LMS reads and writes the LMS pair.
 *
 * Writing either key also fires the window event `hexapi:prefs` with
 * `{ theme?, lang? }` for this tab; other tabs see the native `storage` event.
 *
 * Every read and write is wrapped: Learn's LMS copy runs in a sandboxed iframe
 * where touching `localStorage` throws, and a private window can refuse writes.
 * A failure means "no stored preference", never an exception.
 *
 * An app whose keys must not depend on the path (the LMS dev server and its
 * tests run at `/`, not `/lms/`) calls `createPrefs({ themeKey, langKey })`
 * and gets the same functions bound to those two keys.
 *
 * This module is dependency-free on purpose: the bar build, the student
 * portal and the staff app import it, and the other repos keep a tiny copy so
 * they still work when the bar does not load.
 */

export type Lang = 'ar' | 'en' | 'fr';
export type Theme = 'light' | 'dark';
export interface Prefs {
  theme?: Theme;
  lang?: Lang;
}

export const THEME_KEY = 'theme';
export const LANG_KEY = 'hexapi:lang';
export const LMS_THEME_KEY = 'hexapi-lms:theme';
export const LMS_LANG_KEY = 'hexapi-lms:lang';
export const PREFS_EVENT = 'hexapi:prefs';

function isLms(): boolean {
  try {
    return /^\/lms(\/|$)/.test(window.location.pathname);
  } catch {
    return false;
  }
}

/** The theme key of the app this page belongs to. */
export function themeKey(): string {
  return isLms() ? LMS_THEME_KEY : THEME_KEY;
}

/** The language key of the app this page belongs to. */
export function langKey(): string {
  return isLms() ? LMS_LANG_KEY : LANG_KEY;
}

const LANGS: readonly Lang[] = ['ar', 'en', 'fr'];

export function parseLang(value: unknown): Lang | null {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value)
    ? (value as Lang)
    : null;
}

export function parseTheme(value: unknown): Theme | null {
  return value === 'light' || value === 'dark' ? value : null;
}

function storage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

function read(key: string): string | null {
  try {
    return storage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function write(key: string, value: string): boolean {
  try {
    const s = storage();
    if (!s) return false;
    s.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export interface PrefsKeys {
  themeKey: string;
  langKey: string;
}

export interface PrefsApi {
  themeKey(): string;
  langKey(): string;
  getLang(): Lang | null;
  getTheme(): Theme | null;
  getPrefs(): Prefs;
  setPrefs(next: Prefs): void;
  migrateLangKey(oldKey: string, map?: (raw: string) => unknown): Lang | null;
  onPrefsChange(listener: (prefs: Prefs) => void): () => void;
}

function build(tKey: () => string, lKey: () => string): PrefsApi {
  const getLang = (): Lang | null => parseLang(read(lKey()));
  const getTheme = (): Theme | null => parseTheme(read(tKey()));

  function getPrefs(): Prefs {
    const out: Prefs = {};
    const theme = getTheme();
    const lang = getLang();
    if (theme) out.theme = theme;
    if (lang) out.lang = lang;
    return out;
  }

  function setPrefs(next: Prefs): void {
    const changed: Prefs = {};
    const theme = parseTheme(next?.theme);
    const lang = parseLang(next?.lang);
    if (theme && read(tKey()) !== theme) {
      write(tKey(), theme);
      changed.theme = theme;
    }
    if (lang && read(lKey()) !== lang) {
      write(lKey(), lang);
      changed.lang = lang;
    }
    if (!changed.theme && !changed.lang) return;
    try {
      window.dispatchEvent(new CustomEvent<Prefs>(PREFS_EVENT, { detail: changed }));
    } catch {
      /* no window / no CustomEvent — nothing to tell */
    }
  }

  function migrateLangKey(oldKey: string, map: (raw: string) => unknown = (v) => v): Lang | null {
    const current = getLang();
    if (current) return current;
    const raw = read(oldKey);
    const old = raw === null ? null : parseLang(map(raw));
    if (old) write(lKey(), old);
    return old;
  }

  function onPrefsChange(listener: (prefs: Prefs) => void): () => void {
    if (typeof window === 'undefined') return () => {};
    const onLocal = (event: Event) => {
      const detail = (event as CustomEvent<Prefs>).detail ?? {};
      listener(detail);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === tKey()) {
        const theme = parseTheme(event.newValue);
        if (theme) listener({ theme });
      } else if (event.key === lKey()) {
        const lang = parseLang(event.newValue);
        if (lang) listener({ lang });
      }
    };
    window.addEventListener(PREFS_EVENT, onLocal);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(PREFS_EVENT, onLocal);
      window.removeEventListener('storage', onStorage);
    };
  }

  return {
    themeKey: tKey,
    langKey: lKey,
    getLang,
    getTheme,
    getPrefs,
    setPrefs,
    migrateLangKey,
    onPrefsChange,
  };
}

/**
 * The same functions bound to two fixed keys, whatever the page's path. The
 * `hexapi:prefs` event is shared, so a listener still hears only its own keys'
 * changes from other tabs and every in-tab change.
 */
export function createPrefs(keys: PrefsKeys): PrefsApi {
  return build(
    () => keys.themeKey,
    () => keys.langKey,
  );
}

const scoped = build(themeKey, langKey);

export const getLang = scoped.getLang;
export const getTheme = scoped.getTheme;
export const getPrefs = scoped.getPrefs;
/**
 * Store the given preferences and tell this tab. Only the keys that actually
 * changed are announced, so a component that re-applies its current value
 * does not set off a loop of listeners.
 */
export const setPrefs = scoped.setPrefs;
/**
 * Contract 2, one-time key migration: when the language key is unset, copy the
 * app's own old language key into it. The old key is left in place, never
 * deleted. Returns the language now in effect (null: nothing set anywhere —
 * the app keeps its own default; the first explicit choice sets the key).
 */
export const migrateLangKey = scoped.migrateLangKey;
/**
 * Follow preference changes from this tab (`hexapi:prefs`) and from other
 * tabs of the same app (`storage` on this scope's keys). Returns the
 * unsubscribe function.
 */
export const onPrefsChange = scoped.onPrefsChange;
