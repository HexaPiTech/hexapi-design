import { type ISODate, type WeekStart } from './dates.js';
export interface CalendarLabels {
    prevMonth: string;
    nextMonth: string;
}
export interface CalendarProps {
    /** Selected date, `YYYY-MM-DD`; empty or invalid means none. */
    value?: ISODate | null;
    onChange?: (value: ISODate) => void;
    min?: ISODate;
    max?: ISODate;
    /** Extra dates to block (holidays, full days). Called with `YYYY-MM-DD`. */
    isDateDisabled?: (iso: ISODate) => boolean;
    /** 0 = Sunday, 1 = Monday (default), 6 = Saturday. */
    weekStartsOn?: WeekStart;
    /** Always explicit. For an English UI pass `en-GB`. */
    locale?: string;
    labels?: Partial<CalendarLabels>;
    /** Move keyboard focus into the grid on mount (the picker does this). */
    autoFocus?: boolean;
    /** Overrides "today" (tests, screenshots). */
    today?: ISODate;
    className?: string;
}
/** Month grid. Arrow keys follow the reading direction, PageUp/PageDown change
 *  month (Shift: year), Home/End jump to the week's edges, Enter/Space choose. */
export declare function Calendar({ value, onChange, min, max, isDateDisabled, weekStartsOn, locale, labels, autoFocus, today: todayProp, className, }: CalendarProps): import("react").JSX.Element;
