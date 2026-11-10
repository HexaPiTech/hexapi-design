import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cloneElement, useId, useState } from 'react';
import { flag } from './cx.js';
/** Extra description on hover and keyboard focus; Escape hides it. Not for
 *  essential information — touch users never see it. */
export function Tooltip({ text, side = 'top', children }) {
    const id = useId();
    const [dismissed, setDismissed] = useState(false);
    const describedBy = [children.props['aria-describedby'], id].filter(Boolean).join(' ');
    return (_jsxs("span", { className: "hx-tip-host", "data-dismissed": flag(dismissed), onKeyDown: (e) => e.key === 'Escape' && setDismissed(true), onMouseLeave: () => setDismissed(false), onBlur: () => setDismissed(false), children: [cloneElement(children, { 'aria-describedby': describedBy }), _jsx("span", { role: "tooltip", id: id, className: "hx-tip", "data-side": side, children: text })] }));
}
