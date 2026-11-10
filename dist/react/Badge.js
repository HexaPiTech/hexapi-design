import { jsx as _jsx } from "react/jsx-runtime";
import { cx } from './cx.js';
export function Badge({ variant = 'soft', tone = 'neutral', size = 'md', className, ...rest }) {
    return (_jsx("span", { ...rest, className: cx('hx-badge', className), "data-variant": variant, "data-tone": tone, "data-size": size }));
}
