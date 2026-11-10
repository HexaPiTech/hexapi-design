import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from 'react';
import { cx, flag } from './cx.js';
/** Tab list with roving focus; arrow keys follow the reading direction. */
export function Tabs({ tabs, value, onChange, variant = 'pills', fullWidth = false, label, id, className, }) {
    const listRef = useRef(null);
    const onKeyDown = (e) => {
        const enabled = tabs.filter((t) => !t.disabled);
        const at = enabled.findIndex((t) => t.id === value);
        if (at < 0)
            return;
        const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
        const step = e.key === 'ArrowRight' ? (rtl ? -1 : 1) : e.key === 'ArrowLeft' ? (rtl ? 1 : -1) : 0;
        const next = e.key === 'Home'
            ? enabled[0]
            : e.key === 'End'
                ? enabled[enabled.length - 1]
                : step
                    ? enabled[(at + step + enabled.length) % enabled.length]
                    : undefined;
        if (!next)
            return;
        e.preventDefault();
        onChange(next.id);
        listRef.current?.querySelector(`[data-tab="${CSS.escape(next.id)}"]`)?.focus();
    };
    return (_jsx("div", { ref: listRef, role: "tablist", "aria-label": label, className: cx('hx-tabs', className), "data-variant": variant, "data-full": flag(fullWidth), onKeyDown: onKeyDown, children: tabs.map(({ id: tabId, label: text, icon: Icon, count, disabled }) => {
            const selected = tabId === value;
            return (_jsxs("button", { type: "button", role: "tab", id: id ? `${id}-tab-${tabId}` : undefined, "aria-controls": id ? `${id}-panel-${tabId}` : undefined, "aria-selected": selected, tabIndex: selected ? 0 : -1, disabled: disabled, "data-tab": tabId, className: "hx-tab", onClick: () => onChange(tabId), children: [Icon ? _jsx(Icon, { "aria-hidden": "true" }) : null, text, count !== undefined ? _jsx("span", { className: "hx-count", children: count }) : null] }, tabId));
        }) }));
}
/** The panel of one tab; `tabs` is the `id` given to `<Tabs>`. */
export function TabPanel({ tabs, tab, active, className, children, }) {
    return (_jsx("div", { role: "tabpanel", id: `${tabs}-panel-${tab}`, "aria-labelledby": `${tabs}-tab-${tab}`, hidden: !active, tabIndex: 0, className: className, children: active ? children : null }));
}
