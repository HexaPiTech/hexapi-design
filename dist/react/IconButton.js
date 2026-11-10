import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cx, flag } from './cx.js';
/** Icon-only action: edit, delete, close, pin. */
export const IconButton = forwardRef(function IconButton({ icon: Icon, label, tone = 'neutral', tinted = false, size = 'md', type = 'button', title, className, ...rest }, ref) {
    return (_jsx("button", { ref: ref, type: type, ...rest, "aria-label": label, title: title ?? label, className: cx('hx-icon-btn', className), "data-tone": tone, "data-size": size, "data-tinted": flag(tinted), children: _jsx(Icon, { "aria-hidden": "true" }) }));
});
