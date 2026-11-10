import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { cx, flag } from './cx.js';
import { Calendar } from './Calendar.js';
import { DEFAULT_LOCALE, formatISODate, isISODate } from './dates.js';
import { useFieldControl } from './Field.js';
import { IconButton } from './IconButton.js';
import { CloseIcon } from './icons.js';
import { Popover } from './Menu.js';
const CalendarIcon = (props) => (_jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", ...props, children: _jsx("path", { d: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" }) }));
const DEFAULT_LABELS = {
    placeholder: 'اختر التاريخ',
    clear: 'مسح التاريخ',
    dialog: 'اختيار التاريخ',
};
/** Date field: a button that looks like an input and opens a Calendar. Picks up
 *  its id, hint and error wiring from a surrounding <Field>. */
export function DatePicker({ value, onChange, min, max, isDateDisabled, weekStartsOn, locale = DEFAULT_LOCALE, clearable = false, disabled = false, name, size = 'md', labels, today, className, ...rest }) {
    const text = { ...DEFAULT_LABELS, ...labels };
    const field = useFieldControl(rest);
    const iso = value && isISODate(value) ? value : '';
    const shown = useMemo(() => iso ? formatISODate(iso, locale, { day: 'numeric', month: 'long', year: 'numeric' }) : '', [iso, locale]);
    const valueId = `${field.id}-value`;
    const describedBy = [field['aria-describedby'], iso ? valueId : undefined]
        .filter(Boolean)
        .join(' ');
    return (_jsxs("div", { className: cx('hx-datepicker', className), children: [_jsx(Popover, { label: text.dialog, padded: true, trigger: (p) => (_jsxs("button", { ...p, id: field.id, type: "button", disabled: disabled, "aria-label": rest['aria-label'], "aria-describedby": describedBy || undefined, "aria-invalid": field['aria-invalid'], className: "hx-input hx-datepicker-trigger", "data-size": size, "data-empty": flag(!iso), "data-clearable": flag(clearable && Boolean(iso) && !disabled), children: [_jsx("span", { id: valueId, className: "hx-datepicker-value", children: shown || text.placeholder }), _jsx(CalendarIcon, { className: "hx-datepicker-icon", "aria-hidden": "true" })] })), children: (close) => (_jsx(Calendar, { autoFocus: true, value: iso, min: min, max: max, isDateDisabled: isDateDisabled, weekStartsOn: weekStartsOn, locale: locale, labels: labels, today: today, onChange: (next) => {
                        onChange?.(next);
                        close();
                        document.getElementById(field.id)?.focus();
                    } })) }), clearable && iso && !disabled ? (_jsx(IconButton, { icon: CloseIcon, label: text.clear, size: "sm", className: "hx-datepicker-clear", onClick: () => {
                    onChange?.('');
                    document.getElementById(field.id)?.focus();
                } })) : null, name ? _jsx("input", { type: "hidden", name: name, value: iso, disabled: disabled }) : null] }));
}
