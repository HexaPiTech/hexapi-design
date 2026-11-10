import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef, } from 'react';
import { cx } from './cx.js';
import { useFieldControl } from './Field.js';
export const Input = forwardRef(function Input({ size = 'md', className, ...rest }, ref) {
    return (_jsx("input", { ref: ref, ...rest, ...useFieldControl(rest), className: cx('hx-input', className), "data-size": size }));
});
export const Textarea = forwardRef(function Textarea({ className, ...rest }, ref) {
    return (_jsx("textarea", { ref: ref, ...rest, ...useFieldControl(rest), className: cx('hx-input', className) }));
});
export const Select = forwardRef(function Select({ size = 'md', className, ...rest }, ref) {
    return (_jsx("select", { ref: ref, ...rest, ...useFieldControl(rest), className: cx('hx-input', className), "data-size": size }));
});
const choice = (type, name) => forwardRef(function Choice({ label, className, ...rest }, ref) {
    const input = (_jsx("input", { ref: ref, type: type, ...rest, className: cx('hx-check', label ? undefined : className) }));
    return label ? (_jsxs("label", { className: cx('hx-choice', className), "data-kind": name, children: [input, _jsx("span", { children: label })] })) : (input);
});
export const Checkbox = choice('checkbox', 'checkbox');
export const Radio = choice('radio', 'radio');
/** On/off toggle: a real checkbox with role="switch", so forms and Space work. */
export const Switch = forwardRef(function Switch({ label, className, ...rest }, ref) {
    const input = (_jsx("input", { ref: ref, type: "checkbox", role: "switch", ...rest, className: cx('hx-switch', label ? undefined : className) }));
    return label ? (_jsxs("label", { className: cx('hx-choice', className), "data-kind": "switch", children: [input, _jsx("span", { children: label })] })) : (input);
});
