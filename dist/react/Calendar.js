import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { cx } from './cx.js';
import { DEFAULT_LOCALE, addDays, addMonths, clampISO, endOfWeek, isISODate, parseISODate, safeLocale, startOfWeek, todayISO, monthGrid, utcDate, } from './dates.js';
import { IconButton } from './IconButton.js';
import { ChevronEndIcon, ChevronStartIcon } from './icons.js';
const DEFAULT_LABELS = { prevMonth: 'الشهر السابق', nextMonth: 'الشهر التالي' };
const DAY_REF = [2023, 1, 1]; // a Sunday, used only to get weekday names
/** Month grid. Arrow keys follow the reading direction, PageUp/PageDown change
 *  month (Shift: year), Home/End jump to the week's edges, Enter/Space choose. */
export function Calendar({ value, onChange, min, max, isDateDisabled, weekStartsOn = 1, locale = DEFAULT_LOCALE, labels, autoFocus = false, today: todayProp, className, }) {
    const text = { ...DEFAULT_LABELS, ...labels };
    const titleId = useId();
    const gridRef = useRef(null);
    const today = todayProp && isISODate(todayProp) ? todayProp : todayISO();
    const selected = value && isISODate(value) ? value : undefined;
    const lo = min && isISODate(min) ? min : undefined;
    const hi = max && isISODate(max) ? max : undefined;
    // The focused date is the one tab stop; the visible month always contains it.
    const [focus, setFocus] = useState(() => clampISO(selected ?? today, lo, hi));
    const [seenValue, setSeenValue] = useState(selected);
    if (selected !== seenValue) {
        setSeenValue(selected);
        if (selected)
            setFocus(clampISO(selected, lo, hi));
    }
    const keyboard = useRef(autoFocus);
    useEffect(() => {
        if (!keyboard.current)
            return;
        keyboard.current = false;
        gridRef.current?.querySelector(`[data-iso="${focus}"]`)?.focus();
    }, [focus]);
    const fmt = useMemo(() => {
        const loc = safeLocale(locale);
        const opts = (o) => new Intl.DateTimeFormat(loc, { ...o, timeZone: 'UTC' });
        return {
            title: opts({ month: 'long', year: 'numeric' }),
            short: opts({ weekday: 'short' }),
            narrow: opts({ weekday: 'narrow' }),
            long: opts({ weekday: 'long' }),
            full: opts({ dateStyle: 'full' }),
            num: new Intl.NumberFormat(loc, { useGrouping: false }),
        };
    }, [locale]);
    const { year, month } = parseISODate(focus);
    const weeks = monthGrid(year, month, weekStartsOn);
    const dayName = (f, offset) => f.format(utcDate(DAY_REF[0], DAY_REF[1], DAY_REF[2] + ((weekStartsOn + offset) % 7)));
    // Arabic short weekday names are full words; one letter fits the cell and `abbr`
    // carries the full name.
    const dayLabel = (i) => {
        const short = dayName(fmt.short, i);
        return short.length > 3 ? dayName(fmt.narrow, i) : short;
    };
    const blocked = (iso) => Boolean((lo && iso < lo) || (hi && iso > hi) || isDateDisabled?.(iso));
    const prevMonthEnd = addDays(`${focus.slice(0, 7)}-01`, -1);
    const nextMonthStart = addMonths(`${focus.slice(0, 7)}-01`, 1);
    const go = (target, fromKeyboard) => {
        const next = clampISO(target, lo, hi);
        if (next === focus)
            return;
        keyboard.current = fromKeyboard;
        setFocus(next);
    };
    const onKeyDown = (e) => {
        if (e.ctrlKey || e.altKey || e.metaKey)
            return;
        const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
        const target = e.key === 'ArrowRight'
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
        if (!target)
            return;
        e.preventDefault();
        go(target, true);
    };
    return (_jsxs("div", { className: cx('hx-calendar', className), children: [_jsxs("div", { className: "hx-cal-head", children: [_jsx(IconButton, { icon: ChevronStartIcon, label: text.prevMonth, size: "sm", disabled: Boolean(lo && prevMonthEnd < lo), onClick: () => go(addMonths(focus, -1), false) }), _jsx("div", { id: titleId, className: "hx-cal-title", "aria-live": "polite", children: fmt.title.format(utcDate(year, month, 1)) }), _jsx(IconButton, { icon: ChevronEndIcon, label: text.nextMonth, size: "sm", disabled: Boolean(hi && nextMonthStart > hi), onClick: () => go(addMonths(focus, 1), false) })] }), _jsxs("table", { ref: gridRef, role: "grid", "aria-labelledby": titleId, className: "hx-cal-grid", onKeyDown: onKeyDown, children: [_jsx("thead", { children: _jsx("tr", { children: Array.from({ length: 7 }, (_, i) => (_jsx("th", { scope: "col", abbr: dayName(fmt.long, i), className: "hx-cal-dow", children: dayLabel(i) }, i))) }) }), _jsx("tbody", { children: weeks.map((week) => (_jsx("tr", { children: week.map((iso) => {
                                const p = parseISODate(iso);
                                const off = blocked(iso);
                                return (_jsx("td", { role: "gridcell", "aria-selected": iso === selected, children: _jsx("button", { type: "button", tabIndex: iso === focus ? 0 : -1, "data-iso": iso, className: "hx-cal-day", "data-outside": p.month !== month ? '' : undefined, "data-selected": iso === selected ? '' : undefined, "aria-current": iso === today ? 'date' : undefined, "aria-disabled": off || undefined, "aria-label": fmt.full.format(utcDate(p.year, p.month, p.day)), onClick: () => {
                                            if (off)
                                                return;
                                            setFocus(iso);
                                            onChange?.(iso);
                                        }, children: fmt.num.format(p.day) }) }, iso));
                            }) }, week[0]))) })] })] }));
}
