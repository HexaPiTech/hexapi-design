import { jsx as _jsx } from "react/jsx-runtime";
import { cx, flag } from './cx.js';
/** A surface. With `onClick` it renders a real <button>, so it is focusable
 *  and works from the keyboard. */
export function Card({ padding = 'md', flat = false, className, ...rest }) {
    const shared = {
        className: cx('hx-card', className),
        'data-padding': padding,
        'data-flat': flag(flat),
    };
    if (rest.onClick) {
        const { type = 'button', ...button } = rest;
        return _jsx("button", { type: type, ...button, ...shared, "data-interactive": "" });
    }
    return _jsx("div", { ...rest, ...shared });
}
