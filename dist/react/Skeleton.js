import { jsx as _jsx } from "react/jsx-runtime";
import { cx } from './cx.js';
/** Placeholder block while content loads. Size it with a class or style. */
export function Skeleton({ className, ...rest }) {
    return _jsx("span", { "aria-hidden": "true", ...rest, className: cx('hx-skeleton', className) });
}
