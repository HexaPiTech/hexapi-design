import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useId, useRef, } from 'react';
import { cx } from './cx.js';
import { CloseIcon } from './icons.js';
import { IconButton } from './IconButton.js';
/**
 * Modal dialog on the native `<dialog>` element: the browser traps focus,
 * makes the page behind inert, restores focus on close and handles Escape.
 * Children mount only while open, so form state resets between openings.
 */
export function Dialog({ open, onClose, title, children, footer, size = 'md', placement = 'center', showClose = true, closeLabel = 'إغلاق', closeOnBackdrop = true, closeOnEscape = true, label, className, }) {
    const ref = useRef(null);
    const pressedBackdrop = useRef(false);
    const titleId = useId();
    useEffect(() => {
        const el = ref.current;
        if (!el)
            return;
        if (open && !el.open)
            el.showModal();
        else if (!open && el.open)
            el.close();
    }, [open]);
    const onCancel = (e) => {
        e.preventDefault(); // the parent owns `open`
        if (closeOnEscape)
            onClose();
    };
    // A press that starts AND ends on the backdrop closes; a text selection
    // dragged out of the dialog does not.
    const onMouseDown = (e) => {
        pressedBackdrop.current = e.target === ref.current;
    };
    const onClick = (e) => {
        if (closeOnBackdrop && pressedBackdrop.current && e.target === ref.current)
            onClose();
        pressedBackdrop.current = false;
    };
    return (_jsx("dialog", { ref: ref, className: cx('hx-dialog', className), "data-size": size, "data-placement": placement, "aria-labelledby": title ? titleId : undefined, "aria-label": title ? undefined : label, onCancel: onCancel, onClose: () => open && onClose(), onMouseDown: onMouseDown, onClick: onClick, children: open ? (_jsxs(_Fragment, { children: [title || showClose ? (_jsxs("header", { className: "hx-dialog-header", children: [_jsx("h2", { id: titleId, className: "hx-dialog-title", children: title }), showClose ? (_jsx(IconButton, { icon: CloseIcon, label: closeLabel, onClick: onClose })) : null] })) : null, _jsx("div", { className: "hx-dialog-body", children: children }), footer ? _jsx("footer", { className: "hx-dialog-footer", children: footer }) : null] })) : null }));
}
/** A dialog docked to the inline-end edge (or `start` / `bottom`). */
export function Drawer({ placement = 'end', ...rest }) {
    return _jsx(Dialog, { ...rest, placement: placement });
}
