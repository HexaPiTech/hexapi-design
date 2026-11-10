import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { cx } from './cx.js';
import {
  DEFAULT_LOCALE,
  addDays,
  addMonths,
  clampISO,
  endOfWeek,
  isISODate,
  parseISODate,
  safeLocale,
  startOfWeek,
  todayISO,
  monthGrid,
  utcDate,
  type ISODate,
  type WeekStart,
} from './dates.js';
import { IconButton } from './IconButton.js';
import { ChevronEndIcon, ChevronStartIcon } from './icons.js';

export interface CalendarLabels {
  prevMonth: string;
  nextMonth: string;
}
const DEFAULT_LABELS: CalendarLabels = { prevMonth: 'الشهر السابق', nextMonth: 'الشهر التالي' };

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

const DAY_REF = [2023, 1, 1]; // a Sunday, used only to get weekday names

/** Month grid. Arrow keys follow the reading direction, PageUp/PageDown change
 *  month (Shift: year), Home/End jump to the week's edges, Enter/Space choose. */
export function Calendar({
  value,
  onChange,
  min,
  max,
  isDateDisabled,
  weekStartsOn = 1,
  locale = DEFAULT_LOCALE,
  labels,
  autoFocus = false,
  today: todayProp,
  className,
}: CalendarProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const titleId = useId();
  const gridRef = useRef<HTMLTableElement>(null);
  const today = todayProp && isISODate(todayProp) ? todayProp : todayISO();
  const selected = value && isISODate(value) ? value : undefined;
  const lo = min && isISODate(min) ? min : undefined;
  const hi = max && isISODate(max) ? max : undefined;

  // The focused date is the one tab stop; the visible month always contains it.
  const [focus, setFocus] = useState<ISODate>(() => clampISO(selected ?? today, lo, hi));
  const [seenValue, setSeenValue] = useState(selected);
  if (selected !== seenValue) {
    setSeenValue(selected);
    if (selected) setFocus(clampISO(selected, lo, hi));
  }
  const keyboard = useRef(autoFocus);
  useEffect(() => {
    if (!keyboard.current) return;
    keyboard.current = false;
    gridRef.current?.querySelector<HTMLElement>(`[data-iso="${focus}"]`)?.focus();
  }, [focus]);

  const fmt = useMemo(() => {
    const loc = safeLocale(locale);
    const opts = (o: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(loc, { ...o, timeZone: 'UTC' });
    return {
      title: opts({ month: 'long', year: 'numeric' }),
      short: opts({ weekday: 'short' }),
      narrow: opts({ weekday: 'narrow' }),
      long: opts({ weekday: 'long' }),
      full: opts({ dateStyle: 'full' }),
      num: new Intl.NumberFormat(loc, { useGrouping: false }),
    };
  }, [locale]);

  const { year, month } = parseISODate(focus)!;
  const weeks = monthGrid(year, month, weekStartsOn);
  const dayName = (f: Intl.DateTimeFormat, offset: number) =>
    f.format(utcDate(DAY_REF[0]!, DAY_REF[1]!, DAY_REF[2]! + ((weekStartsOn + offset) % 7)));

  // Arabic short weekday names are full words; one letter fits the cell and `abbr`
  // carries the full name.
  const dayLabel = (i: number) => {
    const short = dayName(fmt.short, i);
    return short.length > 3 ? dayName(fmt.narrow, i) : short;
  };

  const blocked = (iso: ISODate) =>
    Boolean((lo && iso < lo) || (hi && iso > hi) || isDateDisabled?.(iso));
  const prevMonthEnd = addDays(`${focus.slice(0, 7)}-01`, -1);
  const nextMonthStart = addMonths(`${focus.slice(0, 7)}-01`, 1);

  const go = (target: ISODate, fromKeyboard: boolean) => {
    const next = clampISO(target, lo, hi);
    if (next === focus) return;
    keyboard.current = fromKeyboard;
    setFocus(next);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTableElement>) => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const target =
      e.key === 'ArrowRight'
        ? addDays(focus, rtl ? -1 : 1)
        : e.key === 'ArrowLeft'
          ? addDays(focus, rtl ? 1 : -1)
          : e.key === 'ArrowDown'
            ? addDays(focus, 7)
            : e.key === 'ArrowUp'
              ? addDays(focus, -7)
              : e.key === 'PageDown'
                ? addMonths(focus, e.shiftKey ? 12 : 1)
                : e.key === 'PageUp'
                  ? addMonths(focus, e.shiftKey ? -12 : -1)
                  : e.key === 'Home'
                    ? startOfWeek(focus, weekStartsOn)
                    : e.key === 'End'
                      ? endOfWeek(focus, weekStartsOn)
                      : undefined;
    if (!target) return;
    e.preventDefault();
    go(target, true);
  };

  return (
    <div className={cx('hx-calendar', className)}>
      <div className="hx-cal-head">
        <IconButton
          icon={ChevronStartIcon}
          label={text.prevMonth}
          size="sm"
          disabled={Boolean(lo && prevMonthEnd < lo)}
          onClick={() => go(addMonths(focus, -1), false)}
        />
        <div id={titleId} className="hx-cal-title" aria-live="polite">
          {fmt.title.format(utcDate(year, month, 1))}
        </div>
        <IconButton
          icon={ChevronEndIcon}
          label={text.nextMonth}
          size="sm"
          disabled={Boolean(hi && nextMonthStart > hi)}
          onClick={() => go(addMonths(focus, 1), false)}
        />
      </div>
      <table
        ref={gridRef}
        role="grid"
        aria-labelledby={titleId}
        className="hx-cal-grid"
        onKeyDown={onKeyDown}
      >
        <thead>
          <tr>
            {Array.from({ length: 7 }, (_, i) => (
              <th key={i} scope="col" abbr={dayName(fmt.long, i)} className="hx-cal-dow">
                {dayLabel(i)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week[0]}>
              {week.map((iso) => {
                const p = parseISODate(iso)!;
                const off = blocked(iso);
                return (
                  <td key={iso} role="gridcell" aria-selected={iso === selected}>
                    <button
                      type="button"
                      tabIndex={iso === focus ? 0 : -1}
                      data-iso={iso}
                      className="hx-cal-day"
                      data-outside={p.month !== month ? '' : undefined}
                      data-selected={iso === selected ? '' : undefined}
                      aria-current={iso === today ? 'date' : undefined}
                      aria-disabled={off || undefined}
                      aria-label={fmt.full.format(utcDate(p.year, p.month, p.day))}
                      onClick={() => {
                        if (off) return;
                        setFocus(iso);
                        onChange?.(iso);
                      }}
                    >
                      {fmt.num.format(p.day)}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
