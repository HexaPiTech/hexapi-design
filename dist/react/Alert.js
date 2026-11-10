import { jsx as _jsx } from "react/jsx-runtime";
import { cx } from './cx.js';
/** Callout box. `danger` and `warning` are announced as alerts, the rest as status. */
export function Alert({ tone = 'info', role, className, ...rest }) {
    return (_jsx("div", { role: role ?? (tone === 'danger' || tone === 'warning' ? 'alert' : 'status'), ...rest, className: cx('hx-alert', className), "data-tone": tone }));
}
