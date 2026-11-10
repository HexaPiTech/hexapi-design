import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useId, useRef, useState, } from 'react';
import { cx, flag } from './cx.js';
/** Open state shared by Menu and Popover: closes on an outside press and on
 *  Escape, and Escape hands focus back to the trigger. */
function usePop(kind) {
    const [open, setOpen] = useState(false);
    const hostRef = useRef(null);
    const triggerRef = useRef(null);
    const id = useId();
    useEffect(() => {
        if (!open)
            return;
        const onPress = (e) => {
            if (!hostRef.current?.contains(e.target))
                setOpen(false);
        };
        const onKey = (e) => {
            if (e.key !== 'Escape')
                return;
            setOpen(false);
            triggerRef.current?.focus();
        };
        document.addEventListener('pointerdown', onPress);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('pointerdown', onPress);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);
    const trigger = {
        ref: triggerRef,
        id: `${id}-trigger`,
        'aria-haspopup': kind,
        'aria-expanded': open,
        'aria-controls': open ? `${id}-pop` : undefined,
        onClick: () => setOpen((o) => !o),
    };
    return { open, setOpen, hostRef, triggerRef, popId: `${id}-pop`, trigger };
}
/** Action menu: arrows move, Enter/Space choose, Escape closes. The panel is
 *  positioned inside its host, so an `overflow: hidden` ancestor clips it. */
export function Menu({ trigger, items, align = 'start', side = 'bottom', className }) {
    const pop = usePop('menu');
    const menuRef = useRef(null);
    useEffect(() => {
        if (pop.open)
            menuRef.current?.querySelector('button:not(:disabled)')?.focus();
    }, [pop.open]);
    const onKeyDown = (e) => {
        const els = [...e.currentTarget.querySelectorAll('button:not(:disabled)')];
        const at = els.indexOf(document.activeElement);
        const next = e.key === 'ArrowDown'
            ? els[(at + 1) % els.length]
            : e.key === 'ArrowUp'
                ? els[(at - 1 + els.length) % els.length]
                : e.key === 'Home'
                    ? els[0]
                    : e.key === 'End'
                        ? els[els.length - 1]
                        : undefined;
        if (e.key === 'Tab')
            pop.setOpen(false);
        if (!next)
            return;
        e.preventDefault();
        next.focus();
    };
    return (_jsxs("span", { ref: pop.hostRef, className: "hx-pop-host", children: [trigger(pop.trigger), pop.open ? (_jsx("div", { ref: menuRef, id: pop.popId, role: "menu", "aria-labelledby": pop.trigger.id, className: cx('hx-pop', className), "data-align": align, "data-side": side, onKeyDown: onKeyDown, children: items.map(({ id, label, icon: Icon, tone, disabled, onSelect }) => (_jsxs("button", { type: "button", role: "menuitem", tabIndex: -1, disabled: disabled, className: "hx-menu-item", "data-tone": tone, onClick: () => {
                        pop.setOpen(false);
                        pop.triggerRef.current?.focus();
                        onSelect();
                    }, children: [Icon ? _jsx(Icon, { "aria-hidden": "true" }) : null, label] }, id))) })) : null] }));
}
/** A small non-modal panel anchored to its trigger: filters, quick forms. */
export function Popover({ trigger, label, children, align = 'start', side = 'bottom', padded = true, className, }) {
    const pop = usePop('dialog');
    return (_jsxs("span", { ref: pop.hostRef, className: "hx-pop-host", children: [trigger(pop.trigger), pop.open ? (_jsx("div", { id: pop.popId, role: "dialog", "aria-label": label, className: cx('hx-pop', className), "data-align": align, "data-side": side, "data-padded": flag(padded), children: typeof children === 'function' ? children(() => pop.setOpen(false)) : children })) : null] }));
}
