import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, } from 'react';
import { Button } from './Button.js';
import { cx } from './cx.js';
import { CloseIcon } from './icons.js';
import { IconButton } from './IconButton.js';
import { Spinner } from './Spinner.js';
import { emptyState, toastStore, visibleToasts, } from './toastStore.js';
export { createToastStore, makeToast, reduce as toastReducer, toast, toastStore, visibleToasts, } from './toastStore.js';
const glyph = (props, d) => (_jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", ...props, children: _jsx("path", { d: d }) }));
const ICONS = {
    success: 'M20 6 9 17l-5-5',
    error: 'M12 8v5M12 16.5v.01M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z',
    warning: 'M12 9v4M12 17v.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
    info: 'M12 11v5M12 8v.01M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z',
};
const isAssertive = (k) => k === 'error' || k === 'warning';
const ACTION_TONE = {
    error: 'danger',
    warning: 'warning',
    success: 'success',
    info: 'info',
};
function ToastView({ toast, paused, closeLabel, }) {
    const { id, kind, rev, duration } = toast;
    const timer = useRef({ rev: -1, left: 0 });
    useEffect(() => {
        const t = timer.current;
        if (t.rev !== rev) {
            t.rev = rev;
            t.left = duration ?? 0;
        }
        if (duration === null || paused)
            return;
        const started = Date.now();
        const handle = setTimeout(() => toastStore.dismiss(id), Math.max(0, t.left));
        return () => {
            clearTimeout(handle);
            t.left -= Date.now() - started; // resumes with what was left
        };
    }, [id, rev, duration, paused]);
    const Icon = ICONS[kind];
    return (_jsx("div", { className: "hx-toast-item", children: _jsxs("div", { className: "hx-toast", "data-kind": kind, children: [_jsx("span", { className: "hx-toast-icon", children: kind === 'loading' ? _jsx(Spinner, { size: "sm" }) : Icon ? glyph({}, Icon) : null }), _jsxs("div", { className: "hx-toast-body", children: [_jsx("p", { className: "hx-toast-message", children: toast.message }), toast.description ? _jsx("p", { className: "hx-toast-desc", children: toast.description }) : null] }), toast.action ? (_jsx(Button, { size: "sm", variant: "outline", tone: ACTION_TONE[kind] ?? 'neutral', onClick: () => {
                        toast.action?.onClick();
                        toastStore.dismiss(id);
                    }, children: toast.action.label })) : null, _jsx(IconButton, { icon: CloseIcon, label: closeLabel, size: "sm", onClick: () => toastStore.dismiss(id) })] }) }));
}
const subscribe = toastStore.subscribe;
const getSnapshot = toastStore.getState;
const getServerSnapshot = () => emptyState;
const noopSubscribe = () => () => { };
/**
 * Render once per app. Errors and warnings go to an assertive live region,
 * everything else to a polite one. It never takes focus. Timers pause while the
 * pointer or focus is inside, and while the tab is hidden.
 */
export function Toaster({ position = 'top-center', max = 3, label = 'الإشعارات', closeLabel = 'إغلاق', className, }) {
    const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [hidden, setHidden] = useState(false);
    const root = useRef(null);
    const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
    useEffect(() => {
        const sync = () => setHidden(document.hidden);
        sync();
        document.addEventListener('visibilitychange', sync);
        return () => document.removeEventListener('visibilitychange', sync);
    }, []);
    // Top layer, so a toast is not hidden behind an open modal <dialog>. Shown
    // again when a toast arrives so it sits above a dialog opened since.
    const count = state.toasts.length;
    useEffect(() => {
        const el = root.current;
        if (!el || typeof el.showPopover !== 'function')
            return;
        try {
            if (el.matches(':popover-open'))
                el.hidePopover();
            el.showPopover();
        }
        catch {
            /* unsupported: falls back to z-index */
        }
    }, [count, mounted]);
    // Removing the hovered or focused toast fires no leave/blur event, so reset.
    useEffect(() => {
        if (count === 0)
            setHovered(false);
        if (!root.current?.contains(document.activeElement))
            setFocused(false);
    }, [count]);
    const onBlur = useCallback((e) => {
        if (!e.currentTarget.contains(e.relatedTarget))
            setFocused(false);
    }, []);
    // False on the server and during hydration, so both render nothing.
    if (!mounted)
        return null;
    const shown = visibleToasts(state, max);
    const top = position.startsWith('top');
    // Newest sits nearest the screen edge it appears from.
    const ordered = top ? shown.slice().reverse() : shown;
    const paused = hovered || focused || hidden;
    const list = (assertive) => (_jsx("div", { className: "hx-toast-list", role: assertive ? 'alert' : 'status', "aria-live": assertive ? 'assertive' : 'polite', "aria-label": label, children: ordered
            .filter((t) => isAssertive(t.kind) === assertive)
            .map((t) => (_jsx(ToastView, { toast: t, paused: paused, closeLabel: closeLabel }, t.id))) }));
    return (_jsxs("div", { ref: root, popover: "manual", className: cx('hx-toaster', className), "data-position": position, onPointerEnter: () => setHovered(true), onPointerLeave: () => setHovered(false), onFocus: () => setFocused(true), onBlur: onBlur, children: [list(true), list(false)] }));
}
