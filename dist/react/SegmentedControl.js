import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from 'react';
import { cx, flag } from './cx.js';
/** Pick exactly one of a few options. Real radios, so arrows and forms work. */
export function SegmentedControl({ options, value, onChange, label, name, fullWidth = false, className, }) {
    const fallback = useId();
    return (_jsx("div", { role: "radiogroup", "aria-label": label, className: cx('hx-segmented', className), "data-full": flag(fullWidth), children: options.map((o) => (_jsxs("label", { children: [_jsx("input", { type: "radio", name: name ?? fallback, value: o.value, checked: o.value === value, disabled: o.disabled, onChange: () => onChange(o.value) }), _jsx("span", { children: o.label })] }, o.value))) }));
}
