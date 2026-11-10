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
 * This module is dependency-free on purpose: the bar build, the student
 * portal and the staff app import it, and the other repos keep a tiny copy so
 * they still work when the bar does not load.
 */

                                      
                                     
                        
                
              
 

export const THEME_KEY = 'theme';
export const LANG_KEY = 'hexapi:lang';
export const LMS_THEME_KEY = 'hexapi-lms:theme';
export const LMS_LANG_KEY = 'hexapi-lms:lang';
export const PREFS_EVENT = 'hexapi:prefs';

function isLms()          {
  try {
    return /^\/lms(\/|$)/.test(window.location.pathname);
  } catch {
    return false;
  }
}

/** The theme key of the app this page belongs to. */
export function themeKey()         {
  return isLms() ? LMS_THEME_KEY : THEME_KEY;
}

/** The language key of the app this page belongs to. */
export function langKey()         {
  return isLms() ? LMS_LANG_KEY : LANG_KEY;
}

const LANGS                  = ['ar', 'en', 'fr'];

export function parseLang(value         )              {
  return typeof value === 'string' && (LANGS                     ).includes(value)
    ? (value        )
    : null;
}

export function parseTheme(value         )               {
  return value === 'light' || value === 'dark' ? value : null;
}

function storage()                 {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

function read(key        )                {
  try {
    return storage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function write(key        , value        )          {
  try {
    const s = storage();
    if (!s) return false;
    s.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function getLang()              {
  return parseLang(read(langKey()));
}

export function getTheme()               {
  return parseTheme(read(themeKey()));
}

export function getPrefs()        {
  const out        = {};
  const theme = getTheme();
  const lang = getLang();
  if (theme) out.theme = theme;
  if (lang) out.lang = lang;
  return out;
}

/**
 * Store the given preferences and tell this tab. Only the keys that actually
 * changed are announced, so a component that re-applies its current value
 * does not set off a loop of listeners.
 */
export function setPrefs(next       )       {
  const changed        = {};
  const theme = parseTheme(next.theme);
  const lang = parseLang(next.lang);
  if (theme && read(themeKey()) !== theme) {
    write(themeKey(), theme);
    changed.theme = theme;
  }
  if (lang && read(langKey()) !== lang) {
    write(langKey(), lang);
    changed.lang = lang;
  }
  if (!changed.theme && !changed.lang) return;
  try {
    window.dispatchEvent(new CustomEvent       (PREFS_EVENT, { detail: changed }));
  } catch {
    /* no window / no CustomEvent — nothing to tell */
  }
}

/**
 * Contract 2, one-time key migration: when the language key is unset, copy the
 * app's own old language key into it. The old key is left in place, never
 * deleted. Returns the language now in effect (null: nothing set anywhere —
 * the app keeps its own default; the first explicit choice sets the key).
 */
export function migrateLangKey(
  oldKey        ,
  map                           = (v) => v,
)              {
  const current = getLang();
  if (current) return current;
  const raw = read(oldKey);
  const old = raw === null ? null : parseLang(map(raw));
  if (old) write(langKey(), old);
  return old;
}

/**
 * Follow preference changes from this tab (`hexapi:prefs`) and from other
 * tabs of the same app (`storage` on this scope's keys). Returns the
 * unsubscribe function.
 */
export function onPrefsChange(listener                        )             {
  if (typeof window === 'undefined') return () => {};
  const onLocal = (event       ) => {
    const detail = (event                      ).detail ?? {};
    listener(detail);
  };
  const onStorage = (event              ) => {
    if (event.key === themeKey()) {
      const theme = parseTheme(event.newValue);
      if (theme) listener({ theme });
    } else if (event.key === langKey()) {
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
