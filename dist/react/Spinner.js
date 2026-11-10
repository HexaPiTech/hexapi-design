import { jsx as _jsx } from "react/jsx-runtime";
import { cx } from './cx.js';
/** Loading indicator. Fades instead of turning under reduced motion. */
export function Spinner({ size = 'md', label, className, ...rest }) {
    return (_jsx("span", { role: label ? 'status' : undefined, "aria-hidden": label ? undefined : true, ...rest, className: cx('hx-spinner', className), "data-size": size, children: label ? _jsx("span", { className: "hx-sr-only", children: label }) : null }));
}
