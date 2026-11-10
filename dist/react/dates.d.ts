export type ISODate = string;
export type WeekStart = 0 | 1 | 6;
/** Gregorian calendar and Latin digits, spelled out because Apple's ICU turns a
 *  bare Arabic locale into the Islamic calendar with Eastern-Arabic digits. */
export declare const DEFAULT_LOCALE = "ar-LB-u-ca-gregory-nu-latn";
/** Pins the calendar and digits of an Arabic locale that carries no Unicode
 *  extension; every other locale (en-GB, fr-FR…) is returned untouched. */
export declare function safeLocale(locale: string): string;
export interface DateParts {
    year: number;
    /** 1–12 */
    month: number;
    day: number;
}
/** A UTC date from y/m/d; month is 1–12. Handles years below 100 and overflow. */
export declare function utcDate(year: number, month: number, day: number): Date;
/** Builds `YYYY-MM-DD`. Out-of-range parts roll over: (2026, 13, 1) → 2027-01-01. */
export declare function toISODate(year: number, month: number, day: number): ISODate;
/** Splits `YYYY-MM-DD`; null unless it is a real calendar date (no 2026-02-30). */
export declare function parseISODate(value: unknown): DateParts | null;
export declare const isISODate: (value: unknown) => value is ISODate;
/** Days in a month; month is 1–12. */
export declare const daysInMonth: (year: number, month: number) => number;
/** 0 = Sunday … 6 = Saturday. */
export declare const weekdayOf: (iso: ISODate) => number;
export declare function addDays(iso: ISODate, days: number): ISODate;
/** Moves by whole months and keeps the day, clamped to the target month's length
 *  (Jan 31 + 1 month = Feb 28/29). */
export declare function addMonths(iso: ISODate, months: number): ISODate;
/** First day of the week containing `iso`. */
export declare function startOfWeek(iso: ISODate, weekStartsOn?: WeekStart): ISODate;
export declare const endOfWeek: (iso: ISODate, weekStartsOn?: WeekStart) => ISODate;
/** Negative, zero or positive. ISO dates sort as strings. */
export declare const compareISO: (a: ISODate, b: ISODate) => number;
/** Pulls `iso` into [min, max]; either bound may be absent. */
export declare function clampISO(iso: ISODate, min?: ISODate, max?: ISODate): ISODate;
export declare const isSameMonth: (a: ISODate, b: ISODate) => boolean;
/** Today in the user's own time zone, as `YYYY-MM-DD`. */
export declare const todayISO: (now?: Date) => ISODate;
/** Six rows of seven dates covering a month, starting on `weekStartsOn`; days of
 *  the neighbouring months fill the edges. Always six rows, so the height is
 *  stable while paging. `month` is 1–12. */
export declare function monthGrid(year: number, month: number, weekStartsOn?: WeekStart): ISODate[][];
/** Formats an ISO date with an explicit locale (never the machine default). */
export declare function formatISODate(iso: ISODate, locale: string, options: Intl.DateTimeFormatOptions): string;
