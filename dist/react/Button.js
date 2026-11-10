import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cx, flag } from './cx.js';
import { Spinner } from './Spinner.js';
export const Button = forwardRef(function Button({ variant = 'solid', tone = 'brand', size = 'md', icon: Icon, iconEnd: IconEnd, loading = false, fullWidth = false, type = 'button', disabled, className, children, ...rest }, ref) {
    return (_jsxs("button", { ref: ref, type: type, ...rest, className: cx('hx-btn', className), "data-variant": variant, "data-tone": tone, "data-size": size, "data-full": flag(fullWidth), disabled: disabled || loading, "aria-busy": loading || undefined, children: [loading ? (_jsx(Spinner, { size: size === 'lg' ? 'md' : 'sm' })) : Icon ? (_jsx(Icon, { "aria-hidden": "true" })) : null, children, !loading && IconEnd ? _jsx(IconEnd, { "aria-hidden": "true" }) : null] }));
});
