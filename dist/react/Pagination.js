import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cx } from './cx.js';
import { ChevronEndIcon, ChevronStartIcon } from './icons.js';
/** Page numbers to show, with `'gap'` where numbers are skipped.
 *  Always the first and last page plus `siblings` around the current one. */
export function pageItems(page, pageCount, siblings = 1) {
    const keep = new Set([1, pageCount]);
    for (let p = page - siblings; p <= page + siblings; p++) {
        if (p >= 1 && p <= pageCount)
            keep.add(p);
    }
    const out = [];
    let prev = 0;
    for (const p of [...keep].sort((a, b) => a - b)) {
        if (p - prev === 2)
            out.push(prev + 1); // a one-page hole is shown, not hidden
        else if (p - prev > 2)
            out.push('gap');
        out.push(p);
        prev = p;
    }
    return out;
}
export function Pagination({ page, pageCount, onChange, siblings = 1, label = 'الصفحات', previousLabel = 'السابق', nextLabel = 'التالي', className, }) {
    if (pageCount <= 1)
        return null;
    return (_jsx("nav", { "aria-label": label, className: className, children: _jsxs("ul", { className: cx('hx-pagination'), children: [_jsx("li", { children: _jsx("button", { type: "button", className: "hx-page-btn", "aria-label": previousLabel, disabled: page <= 1, onClick: () => onChange(page - 1), children: _jsx(ChevronStartIcon, { "aria-hidden": "true" }) }) }), pageItems(page, pageCount, siblings).map((item, i) => item === 'gap' ? (_jsx("li", { className: "hx-page-gap", "aria-hidden": "true", children: "\u2026" }, `gap-${i}`)) : (_jsx("li", { children: _jsx("button", { type: "button", className: "hx-page-btn", "aria-current": item === page ? 'page' : undefined, onClick: () => onChange(item), children: item }) }, item))), _jsx("li", { children: _jsx("button", { type: "button", className: "hx-page-btn", "aria-label": nextLabel, disabled: page >= pageCount, onClick: () => onChange(page + 1), children: _jsx(ChevronEndIcon, { "aria-hidden": "true" }) }) })] }) }));
}
