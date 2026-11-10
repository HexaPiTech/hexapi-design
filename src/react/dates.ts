// Pure ISO-date helpers (YYYY-MM-DD) for Calendar and DatePicker. No Date
// objects cross the public API and nothing depends on the machine's time zone:
// every calculation runs on UTC y/m/d parts, so a date never shifts by a day.

export type ISODate = string;
export type WeekStart = 0 | 1 | 6;

/** Gregorian calendar and Latin digits, spelled out because Apple's ICU turns a
 *  bare Arabic locale into the Islamic calendar with Eastern-Arabic digits. */
export const DEFAULT_LOCALE = 'ar-LB-u-ca-gregory-nu-latn';

/** Pins the calendar and digits of an Arabic locale that carries no Unicode
 *  extension; every other locale (en-GB, fr-FR…) is returned untouched. */
export function safeLocale(locale: string): string {
  return /^ar(-|$)/i.test(locale) && !/-u-/i.test(locale)
    ? `${locale}-u-ca-gregory-nu-latn`
    : locale;
}

export interface DateParts {
  year: number;
  /** 1–12 */
  month: number;
  day: number;
}

/** A UTC date from y/m/d; month is 1–12. Handles years below 100 and overflow. */
export function utcDate(year: number, month: number, day: number): Date {
  const d = new Date(0);
  d.setUTCFullYear(year, month - 1, day);
  return d;
}

const pad = (n: number, width: number) => String(n).padStart(width, '0');

/** Builds `YYYY-MM-DD`. Out-of-range parts roll over: (2026, 13, 1) → 2027-01-01. */
export function toISODate(year: number, month: number, day: number): ISODate {
  const d = utcDate(year, month, day);
  return `${pad(d.getUTCFullYear(), 4)}-${pad(d.getUTCMonth() + 1, 2)}-${pad(d.getUTCDate(), 2)}`;
}

/** Splits `YYYY-MM-DD`; null unless it is a real calendar date (no 2026-02-30). */
export function parseISODate(value: unknown): DateParts | null {
  if (typeof value !== 'string') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const parts = { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
  return toISODate(parts.year, parts.month, parts.day) === value ? parts : null;
}

export const isISODate = (value: unknown): value is ISODate => parseISODate(value) !== null;

function need(iso: ISODate): DateParts {
  const p = parseISODate(iso);
  if (!p) throw new RangeError(`Not an ISO date (YYYY-MM-DD): ${String(iso)}`);
  return p;
}

/** Days in a month; month is 1–12. */
export const daysInMonth = (year: number, month: number): number =>
  utcDate(year, month + 1, 0).getUTCDate();

/** 0 = Sunday … 6 = Saturday. */
export const weekdayOf = (iso: ISODate): number => {
  const { year, month, day } = need(iso);
  return utcDate(year, month, day).getUTCDay();
};

export function addDays(iso: ISODate, days: number): ISODate {
  const { year, month, day } = need(iso);
  return toISODate(year, month, day + days);
}

/** Moves by whole months and keeps the day, clamped to the target month's length
 *  (Jan 31 + 1 month = Feb 28/29). */
export function addMonths(iso: ISODate, months: number): ISODate {
  const { year, month, day } = need(iso);
  const first = utcDate(year, month + months, 1);
  const y = first.getUTCFullYear();
  const m = first.getUTCMonth() + 1;
  return toISODate(y, m, Math.min(day, daysInMonth(y, m)));
}

/** First day of the week containing `iso`. */
export function startOfWeek(iso: ISODate, weekStartsOn: WeekStart = 1): ISODate {
  return addDays(iso, -((weekdayOf(iso) - weekStartsOn + 7) % 7));
}
export const endOfWeek = (iso: ISODate, weekStartsOn: WeekStart = 1): ISODate =>
  addDays(startOfWeek(iso, weekStartsOn), 6);

/** Negative, zero or positive. ISO dates sort as strings. */
export const compareISO = (a: ISODate, b: ISODate): number => (a < b ? -1 : a > b ? 1 : 0);

/** Pulls `iso` into [min, max]; either bound may be absent. */
export function clampISO(iso: ISODate, min?: ISODate, max?: ISODate): ISODate {
  if (min && iso < min) return min;
  if (max && iso > max) return max;
  return iso;
}

export const isSameMonth = (a: ISODate, b: ISODate): boolean => a.slice(0, 7) === b.slice(0, 7);

/** Today in the user's own time zone, as `YYYY-MM-DD`. */
export const todayISO = (now: Date = new Date()): ISODate =>
  toISODate(now.getFullYear(), now.getMonth() + 1, now.getDate());

/** Six rows of seven dates covering a month, starting on `weekStartsOn`; days of
 *  the neighbouring months fill the edges. Always six rows, so the height is
 *  stable while paging. `month` is 1–12. */
export function monthGrid(year: number, month: number, weekStartsOn: WeekStart = 1): ISODate[][] {
  const first = toISODate(year, month, 1);
  const start = startOfWeek(first, weekStartsOn);
  return Array.from({ length: 6 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => addDays(start, w * 7 + d)),
  );
}

/** Formats an ISO date with an explicit locale (never the machine default). */
export function formatISODate(
  iso: ISODate,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): string {
  const { year, month, day } = need(iso);
  return new Intl.DateTimeFormat(safeLocale(locale), { ...options, timeZone: 'UTC' }).format(
    utcDate(year, month, day),
  );
}
