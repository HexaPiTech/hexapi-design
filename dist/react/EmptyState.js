import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cx } from './cx.js';
/** What a list, table or page shows when it has nothing to show. */
export function EmptyState({ icon: Icon, title, description, action, className }) {
    return (_jsxs("div", { className: cx('hx-empty', className), children: [Icon ? _jsx(Icon, { "aria-hidden": "true" }) : null, _jsx("p", { className: "hx-empty-title", children: title }), description ? _jsx("p", { className: "hx-empty-text", children: description }) : null, action] }));
}
