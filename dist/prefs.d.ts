export type Lang = 'ar' | 'en' | 'fr';
export type Theme = 'light' | 'dark';
export interface Prefs {
  theme?: Theme;
  lang?: Lang;
}
export declare const THEME_KEY: 'theme';
export declare const LANG_KEY: 'hexapi:lang';
export declare const LMS_THEME_KEY: 'hexapi-lms:theme';
export declare const LMS_LANG_KEY: 'hexapi-lms:lang';
export declare const PREFS_EVENT: 'hexapi:prefs';
export declare function themeKey(): string;
export declare function langKey(): string;
export declare function parseLang(value: unknown): Lang | null;
export declare function parseTheme(value: unknown): Theme | null;
export declare function getLang(): Lang | null;
export declare function getTheme(): Theme | null;
export declare function getPrefs(): Prefs;
export declare function setPrefs(next: Prefs): void;
export declare function migrateLangKey(oldKey: string, map?: (raw: string) => unknown): Lang | null;
export declare function onPrefsChange(listener: (prefs: Prefs) => void): () => void;
