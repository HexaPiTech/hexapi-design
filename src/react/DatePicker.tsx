import { useMemo, type SVGProps } from 'react';
import { cx, flag } from './cx.js';
import { Calendar, type CalendarLabels } from './Calendar.js';
import { DEFAULT_LOCALE, formatISODate, isISODate, type ISODate, type WeekStart } from './dates.js';
import { useFieldControl } from './Field.js';
import { IconButton } from './IconButton.js';
import { CloseIcon } from './icons.js';
import { Popover } from './Menu.js';
import type { Size } from './types.js';

const CalendarIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
  </svg>
);

export interface DatePickerLabels extends CalendarLabels {
  /** Shown while empty. */
  placeholder: string;
  /** Accessible name of the clear button. */
  clear: string;
  /** Accessible name of the open calendar panel. */
  dialog: string;
}
const DEFAULT_LABELS: Pick<DatePickerLabels, 'placeholder' | 'clear' | 'dialog'> = {
  placeholder: 'اختر التاريخ',
  clear: 'مسح التاريخ',
  dialog: 'اختيار التاريخ',
};

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
export function DatePicker({
  value,
  onChange,
  min,
  max,
  isDateDisabled,
  weekStartsOn,
  locale = DEFAULT_LOCALE,
  clearable = false,
  disabled = false,
  name,
  size = 'md',
  labels,
  today,
  className,
  ...rest
}: DatePickerProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const field = useFieldControl(rest);
  const iso = value && isISODate(value) ? value : '';
  const shown = useMemo(
    () =>
      iso ? formatISODate(iso, locale, { day: 'numeric', month: 'long', year: 'numeric' }) : '',
    [iso, locale],
  );
  const valueId = `${field.id}-value`;
  const describedBy = [field['aria-describedby'], iso ? valueId : undefined]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cx('hx-datepicker', className)}>
      <Popover
        label={text.dialog}
        padded
        trigger={(p) => (
          <button
            {...p}
            id={field.id}
            type="button"
            disabled={disabled}
            aria-label={rest['aria-label']}
            aria-describedby={describedBy || undefined}
            aria-invalid={field['aria-invalid']}
            className="hx-input hx-datepicker-trigger"
            data-size={size}
            data-empty={flag(!iso)}
            data-clearable={flag(clearable && Boolean(iso) && !disabled)}
          >
            <span id={valueId} className="hx-datepicker-value">
              {shown || text.placeholder}
            </span>
            <CalendarIcon className="hx-datepicker-icon" aria-hidden="true" />
          </button>
        )}
      >
        {(close) => (
          <Calendar
            autoFocus
            value={iso}
            min={min}
            max={max}
            isDateDisabled={isDateDisabled}
            weekStartsOn={weekStartsOn}
            locale={locale}
            labels={labels}
            today={today}
            onChange={(next) => {
              onChange?.(next);
              close();
              document.getElementById(field.id)?.focus();
            }}
          />
        )}
      </Popover>
      {clearable && iso && !disabled ? (
        <IconButton
          icon={CloseIcon}
          label={text.clear}
          size="sm"
          className="hx-datepicker-clear"
          onClick={() => {
            onChange?.('');
            document.getElementById(field.id)?.focus();
          }}
        />
      ) : null}
      {name ? <input type="hidden" name={name} value={iso} disabled={disabled} /> : null}
    </div>
  );
}
