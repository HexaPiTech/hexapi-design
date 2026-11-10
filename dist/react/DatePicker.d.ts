import { type CalendarLabels } from './Calendar.js';
import { type ISODate, type WeekStart } from './dates.js';
import type { Size } from './types.js';
export interface DatePickerLabels extends CalendarLabels {
    /** Shown while empty. */
    placeholder: string;
    /** Accessible name of the clear button. */
    clear: string;
    /** Accessible name of the open calendar panel. */
    dialog: string;
}
export interface DatePickerProps {
    /** `YYYY-MM-DD`, or empty for none. */
    value?: ISODate | null;
    onChange?: (value: ISODate | '') => void;
    min?: ISODate;
    max?: ISODate;
    isDateDisabled?: (iso: ISODate) => boolean;
    weekStartsOn?: WeekStart;
    /** Always explicit. For an English UI pass `en-GB`. */
    locale?: string;
    /** Shows a clear button while a date is set; `onChange('')` is called. */
    clearable?: boolean;
    disabled?: boolean;
    /** Renders a hidden input with the ISO value so plain forms submit it. */
    name?: string;
    id?: string;
    size?: Size;
    labels?: Partial<DatePickerLabels>;
    /** Overrides "today" (tests, screenshots). */
    today?: ISODate;
    'aria-label'?: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean | 'true' | 'false';
    className?: string;
}
/** Date field: a button that looks like an input and opens a Calendar. Picks up
 *  its id, hint and error wiring from a surrounding <Field>. */
export declare function DatePicker({ value, onChange, min, max, isDateDisabled, weekStartsOn, locale, clearable, disabled, name, size, labels, today, className, ...rest }: DatePickerProps): import("react").JSX.Element;
