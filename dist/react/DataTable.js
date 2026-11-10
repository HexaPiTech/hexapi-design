import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Checkbox } from './controls.js';
import { cx, flag } from './cx.js';
import { EmptyState } from './EmptyState.js';
import { Skeleton } from './Skeleton.js';
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
const missing = (v) => v === null || v === undefined || v === '';
function compareValues(a, b) {
    if (typeof a === 'number' && typeof b === 'number')
        return a - b;
    if (a instanceof Date && b instanceof Date)
        return a.getTime() - b.getTime();
    if (typeof a === 'boolean' && typeof b === 'boolean')
        return Number(a) - Number(b);
    return collator.compare(String(a), String(b));
}
/** Pure, stable, non-mutating sort for client-side tables. Empty values (null,
 *  undefined, '') always go last, in both directions. `sort` of `null` keeps the
 *  order. The default accessor reads `row[key]`. */
export function sortRows(rows, sort, accessor = (row, key) => row[key]) {
    const copy = rows.slice();
    if (!sort)
        return copy;
    const dir = sort.direction === 'desc' ? -1 : 1;
    return copy
        .map((row, i) => ({ row, i, v: accessor(row, sort.key) }))
        .sort((x, y) => {
        const mx = missing(x.v);
        const my = missing(y.v);
        if (mx || my)
            return mx && my ? x.i - y.i : mx ? 1 : -1;
        return compareValues(x.v, y.v) * dir || x.i - y.i;
    })
        .map((e) => e.row);
}
const SortIcon = () => (_jsxs("svg", { className: "hx-sort", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [_jsx("path", { className: "hx-sort-up", d: "m8 10 4-4 4 4" }), _jsx("path", { className: "hx-sort-down", d: "m8 14 4 4 4-4" })] }));
const INTERACTIVE = 'a,button,input,select,textarea,label,summary,[role="button"]';
export function DataTable({ columns, rows, rowKey, sort = null, onSortChange, selected, onSelectedChange, loading = false, loadingRows = 5, empty, onRowClick, density = 'comfortable', stickyHeader = false, maxHeight, caption, label, mobileCard, emptyTitle = 'لا توجد بيانات', selectAllLabel = 'تحديد الكل', selectRowLabel = () => 'تحديد الصف', sortLabels = { ascending: 'مرتّب تصاعدياً', descending: 'مرتّب تنازلياً' }, className, }) {
    const keyOf = (row) => typeof rowKey === 'function' ? rowKey(row) : row[rowKey];
    const selectable = Boolean(onSelectedChange);
    const selectedSet = new Set(selected ?? []);
    const pageKeys = rows.map(keyOf);
    const selectedOnPage = pageKeys.filter((k) => selectedSet.has(k)).length;
    const allSelected = pageKeys.length > 0 && selectedOnPage === pageKeys.length;
    const someSelected = selectedOnPage > 0 && !allSelected;
    const toggleAll = () => {
        if (!onSelectedChange)
            return;
        const rest = (selected ?? []).filter((k) => !pageKeys.includes(k));
        onSelectedChange(allSelected ? rest : [...rest, ...pageKeys]);
    };
    const toggleRow = (key) => {
        if (!onSelectedChange)
            return;
        const cur = selected ?? [];
        onSelectedChange(cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]);
    };
    const nextSort = (key) => {
        if (!sort || sort.key !== key)
            return { key, direction: 'asc' };
        return sort.direction === 'asc' ? { key, direction: 'desc' } : null;
    };
    const cellValue = (col, row) => {
        if (col.cell)
            return col.cell(row);
        const v = row[col.key];
        return v === null || v === undefined ? '' : String(v);
    };
    const rowHandlers = (row) => onRowClick
        ? {
            tabIndex: 0,
            onClick: (e) => {
                if (!e.target.closest(INTERACTIVE))
                    onRowClick(row);
            },
            onKeyDown: (e) => {
                if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onRowClick(row);
                }
            },
        }
        : {};
    const emptyNode = empty ?? _jsx(EmptyState, { title: emptyTitle });
    const showEmpty = !loading && rows.length === 0;
    const colSpan = columns.length + (selectable ? 1 : 0);
    const scrollStyle = maxHeight === undefined ? undefined : { maxBlockSize: maxHeight };
    return (_jsxs("div", { className: cx('hx-table-wrap', className), "data-density": density, "data-cards": flag(Boolean(mobileCard)), children: [_jsx("div", { className: "hx-table-scroll", style: scrollStyle, tabIndex: maxHeight !== undefined ? 0 : undefined, children: _jsxs("table", { className: "hx-table", "aria-label": caption ? undefined : label, "aria-busy": loading || undefined, "data-sticky": flag(stickyHeader), "data-empty": flag(showEmpty), children: [caption ? _jsx("caption", { className: "hx-table-caption", children: caption }) : null, _jsx("thead", { children: _jsxs("tr", { children: [selectable ? (_jsx("th", { scope: "col", className: "hx-table-select", children: _jsx(Checkbox, { "aria-label": selectAllLabel, checked: allSelected, disabled: loading || pageKeys.length === 0, onChange: toggleAll, ref: (el) => {
                                                if (el)
                                                    el.indeterminate = someSelected;
                                            } }) })) : null, columns.map((col) => {
                                        const active = sort?.key === col.key ? sort.direction : null;
                                        const sortable = Boolean(col.sortable && onSortChange);
                                        return (_jsx("th", { scope: "col", className: cx(col.hideOnMobile && 'hx-col-hide') || undefined, "data-align": col.align, style: col.width === undefined ? undefined : { inlineSize: col.width }, "aria-sort": col.sortable
                                                ? active === 'asc'
                                                    ? 'ascending'
                                                    : active === 'desc'
                                                        ? 'descending'
                                                        : 'none'
                                                : undefined, children: sortable ? (_jsxs("button", { type: "button", className: "hx-sort-btn", "data-active": flag(active !== null), "data-direction": active ?? undefined, onClick: () => onSortChange?.(nextSort(col.key)), children: [col.header, _jsx(SortIcon, {}), active ? (_jsx("span", { className: "hx-sr-only", children: active === 'asc' ? sortLabels.ascending : sortLabels.descending })) : null] })) : (col.header) }, col.key));
                                    })] }) }), _jsx("tbody", { children: loading ? (Array.from({ length: loadingRows }, (_, i) => (_jsxs("tr", { "data-loading": "", children: [selectable ? (_jsx("td", { className: "hx-table-select", children: _jsx(Skeleton, { className: "hx-table-skel", style: { inlineSize: '1rem' } }) })) : null, columns.map((col, c) => (_jsx("td", { className: cx(col.hideOnMobile && 'hx-col-hide') || undefined, "data-align": col.align, children: _jsx(Skeleton, { className: "hx-table-skel", style: { inlineSize: `${[70, 50, 85, 60][(i + c) % 4]}%` } }) }, col.key)))] }, `sk-${i}`)))) : showEmpty ? (_jsx("tr", { "data-empty": "", children: _jsx("td", { colSpan: colSpan, children: emptyNode }) })) : (rows.map((row) => {
                                const key = keyOf(row);
                                const isSel = selectedSet.has(key);
                                return (_jsxs("tr", { "data-selected": flag(isSel), "data-clickable": flag(Boolean(onRowClick)), ...rowHandlers(row), children: [selectable ? (_jsx("td", { className: "hx-table-select", children: _jsx(Checkbox, { "aria-label": selectRowLabel(row), checked: isSel, onChange: () => toggleRow(key) }) })) : null, columns.map((col) => (_jsx("td", { className: cx(col.hideOnMobile && 'hx-col-hide') || undefined, "data-align": col.align, children: cellValue(col, row) }, col.key)))] }, key));
                            })) })] }) }), mobileCard ? (_jsx("ul", { className: "hx-table-cards", "aria-label": label, "aria-busy": loading || undefined, children: loading ? (Array.from({ length: loadingRows }, (_, i) => (_jsxs("li", { className: "hx-table-card", "data-loading": "", children: [_jsx(Skeleton, { className: "hx-table-skel", style: { inlineSize: '60%' } }), _jsx(Skeleton, { className: "hx-table-skel", style: { inlineSize: '85%' } })] }, `sk-${i}`)))) : showEmpty ? (_jsx("li", { className: "hx-table-card-empty", children: emptyNode })) : (rows.map((row) => {
                    const key = keyOf(row);
                    const isSel = selectedSet.has(key);
                    return (_jsxs("li", { className: "hx-table-card", "data-selected": flag(isSel), "data-clickable": flag(Boolean(onRowClick)), ...rowHandlers(row), children: [selectable ? (_jsx(Checkbox, { "aria-label": selectRowLabel(row), checked: isSel, onChange: () => toggleRow(key) })) : null, _jsx("div", { className: "hx-table-card-body", children: mobileCard(row) })] }, key));
                })) })) : null] }));
}
