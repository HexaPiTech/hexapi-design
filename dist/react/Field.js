import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useId } from 'react';
import { cx } from './cx.js';
const FieldContext = createContext(null);
/** Props a control picks up when it sits inside a <Field>. */
export function useFieldControl(own) {
    const field = useContext(FieldContext);
    const fallbackId = useId();
    return {
        id: own.id ?? field?.id ?? fallbackId,
        'aria-describedby': [own['aria-describedby'], field?.describedBy].filter(Boolean).join(' ') || undefined,
        'aria-invalid': own['aria-invalid'] ?? (field?.invalid || undefined),
        required: own.required ?? (field?.required || undefined),
    };
}
export function Label({ className, children, required, ...rest }) {
    return (_jsxs("label", { ...rest, className: cx('hx-label', className), children: [children, required ? (_jsx("span", { "data-required": "", "aria-hidden": "true", children: "*" })) : null] }));
}
/** Label + control + hint or error, wired together for assistive tech. */
export function Field({ label, hint, error, required = false, id, className, children, }) {
    const autoId = useId();
    const controlId = id ?? autoId;
    const note = error || hint;
    const noteId = note ? `${controlId}-note` : undefined;
    return (_jsx(FieldContext.Provider, { value: { id: controlId, describedBy: noteId, invalid: Boolean(error), required }, children: _jsxs("div", { className: cx('hx-field', className), children: [label ? (_jsx(Label, { htmlFor: controlId, required: required, children: label })) : null, children, note ? (_jsx("p", { id: noteId, className: "hx-hint", "data-error": error ? '' : undefined, role: error ? 'alert' : undefined, children: note })) : null] }) }));
}
