import { type CSSProperties, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { Checkbox } from './controls.js';
import { cx, flag } from './cx.js';
import { EmptyState } from './EmptyState.js';
import { Skeleton } from './Skeleton.js';

export type RowKey = string | number;

export interface SortState {
  key: string;
  direction: 'asc' | 'desc';
}

export interface DataTableColumn<T> {
  /** Unique within the table; also the sort key and the default cell value. */
  key: string;
  header: ReactNode;
  /** Defaults to `String(row[key])` (empty for null/undefined). */
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  /** Text alignment along the reading direction. Default `start`. */
  align?: 'start' | 'center' | 'end';
  /** CSS length, or a number of pixels. */
  width?: string | number;
  /** Hidden below the container width when there is no `mobileCard`. */
  hideOnMobile?: boolean;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  /** A property name, or a function returning a unique stable key per row. */
  rowKey: keyof T | ((row: T) => RowKey);
  /** Controlled sort. `null` / omitted = unsorted. Rows are NOT sorted here: see `sortRows`. */
  sort?: SortState | null;
  /** Header click cycles ascending → descending → none (`null`). */
  onSortChange?: (sort: SortState | null) => void;
  /** Keys of the selected rows. Giving `onSelectedChange` turns the checkbox column on. */
  selected?: RowKey[];
  onSelectedChange?: (selected: RowKey[]) => void;
  loading?: boolean;
  /** Number of skeleton rows while loading. Default 5. */
  loadingRows?: number;
  /** Shown instead of the body when there are no rows. Default: an EmptyState. */
  empty?: ReactNode;
  /** Makes rows clickable and keyboard-focusable (Enter / Space). */
  onRowClick?: (row: T) => void;
  density?: 'comfortable' | 'compact';
  stickyHeader?: boolean;
  /** Vertical scroll limit; needed for `stickyHeader` to have something to stick in. */
  maxHeight?: string | number;
  /** Visible caption. */
  caption?: ReactNode;
  /** Accessible name when there is no visible caption. */
  label?: string;
  /** Below the container width the table is replaced by a list of these cards. */
  mobileCard?: (row: T) => ReactNode;
  emptyTitle?: string;
  selectAllLabel?: string;
  /** Accessible name of a row's checkbox. Default: «تحديد الصف». */
  selectRowLabel?: (row: T) => string;
  /** Screen-reader text for the sort button state. */
  sortLabels?: { ascending: string; descending: string };
  className?: string;
}

type Accessor<T> = (row: T, key: string) => unknown;

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
const missing = (v: unknown) => v === null || v === undefined || v === '';

function compareValues(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  return collator.compare(String(a), String(b));
}

/** Pure, stable, non-mutating sort for client-side tables. Empty values (null,
 *  undefined, '') always go last, in both directions. `sort` of `null` keeps the
 *  order. The default accessor reads `row[key]`. */
export function sortRows<T>(
  rows: readonly T[],
  sort: SortState | null | undefined,
  accessor: Accessor<T> = (row, key) => (row as Record<string, unknown>)[key],
): T[] {
  const copy = rows.slice();
  if (!sort) return copy;
  const dir = sort.direction === 'desc' ? -1 : 1;
  return copy
    .map((row, i) => ({ row, i, v: accessor(row, sort.key) }))
    .sort((x, y) => {
      const mx = missing(x.v);
      const my = missing(y.v);
      if (mx || my) return mx && my ? x.i - y.i : mx ? 1 : -1;
      return compareValues(x.v, y.v) * dir || x.i - y.i;
    })
    .map((e) => e.row);
}

const SortIcon = () => (
  <svg
    className="hx-sort"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path className="hx-sort-up" d="m8 10 4-4 4 4" />
    <path className="hx-sort-down" d="m8 14 4 4 4-4" />
  </svg>
);

const INTERACTIVE = 'a,button,input,select,textarea,label,summary,[role="button"]';

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  sort = null,
  onSortChange,
  selected,
  onSelectedChange,
  loading = false,
  loadingRows = 5,
  empty,
  onRowClick,
  density = 'comfortable',
  stickyHeader = false,
  maxHeight,
  caption,
  label,
  mobileCard,
  emptyTitle = 'لا توجد بيانات',
  selectAllLabel = 'تحديد الكل',
  selectRowLabel = () => 'تحديد الصف',
  sortLabels = { ascending: 'مرتّب تصاعدياً', descending: 'مرتّب تنازلياً' },
  className,
}: DataTableProps<T>) {
  const keyOf = (row: T): RowKey =>
    typeof rowKey === 'function' ? rowKey(row) : (row[rowKey] as RowKey);
  const selectable = Boolean(onSelectedChange);
  const selectedSet = new Set(selected ?? []);
  const pageKeys = rows.map(keyOf);
  const selectedOnPage = pageKeys.filter((k) => selectedSet.has(k)).length;
  const allSelected = pageKeys.length > 0 && selectedOnPage === pageKeys.length;
  const someSelected = selectedOnPage > 0 && !allSelected;

  const toggleAll = () => {
    if (!onSelectedChange) return;
    const rest = (selected ?? []).filter((k) => !pageKeys.includes(k));
    onSelectedChange(allSelected ? rest : [...rest, ...pageKeys]);
  };
  const toggleRow = (key: RowKey) => {
    if (!onSelectedChange) return;
    const cur = selected ?? [];
    onSelectedChange(cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]);
  };

  const nextSort = (key: string): SortState | null => {
    if (!sort || sort.key !== key) return { key, direction: 'asc' };
    return sort.direction === 'asc' ? { key, direction: 'desc' } : null;
  };

  const cellValue = (col: DataTableColumn<T>, row: T): ReactNode => {
    if (col.cell) return col.cell(row);
    const v = (row as Record<string, unknown>)[col.key];
    return v === null || v === undefined ? '' : String(v);
  };

  const rowHandlers = (row: T) =>
    onRowClick
      ? {
          tabIndex: 0,
          onClick: (e: MouseEvent<HTMLElement>) => {
            if (!(e.target as HTMLElement).closest(INTERACTIVE)) onRowClick(row);
          },
          onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
            if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              onRowClick(row);
            }
          },
        }
      : {};

  const emptyNode = empty ?? <EmptyState title={emptyTitle} />;
  const showEmpty = !loading && rows.length === 0;
  const colSpan = columns.length + (selectable ? 1 : 0);
  const scrollStyle: CSSProperties | undefined =
    maxHeight === undefined ? undefined : { maxBlockSize: maxHeight };

  return (
    <div
      className={cx('hx-table-wrap', className)}
      data-density={density}
      data-cards={flag(Boolean(mobileCard))}
    >
      <div
        className="hx-table-scroll"
        style={scrollStyle}
        tabIndex={maxHeight !== undefined ? 0 : undefined}
      >
        <table
          className="hx-table"
          aria-label={caption ? undefined : label}
          aria-busy={loading || undefined}
          data-sticky={flag(stickyHeader)}
          data-empty={flag(showEmpty)}
        >
          {caption ? <caption className="hx-table-caption">{caption}</caption> : null}
          <thead>
            <tr>
              {selectable ? (
                <th scope="col" className="hx-table-select">
                  <Checkbox
                    aria-label={selectAllLabel}
                    checked={allSelected}
                    disabled={loading || pageKeys.length === 0}
                    onChange={toggleAll}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                  />
                </th>
              ) : null}
              {columns.map((col) => {
                const active = sort?.key === col.key ? sort.direction : null;
                const sortable = Boolean(col.sortable && onSortChange);
                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={cx(col.hideOnMobile && 'hx-col-hide') || undefined}
                    data-align={col.align}
                    style={col.width === undefined ? undefined : { inlineSize: col.width }}
                    aria-sort={
                      col.sortable
                        ? active === 'asc'
                          ? 'ascending'
                          : active === 'desc'
                            ? 'descending'
                            : 'none'
                        : undefined
                    }
                  >
                    {sortable ? (
                      <button
                        type="button"
                        className="hx-sort-btn"
                        data-active={flag(active !== null)}
                        data-direction={active ?? undefined}
                        onClick={() => onSortChange?.(nextSort(col.key))}
                      >
                        {col.header}
                        <SortIcon />
                        {active ? (
                          <span className="hx-sr-only">
                            {active === 'asc' ? sortLabels.ascending : sortLabels.descending}
                          </span>
                        ) : null}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: loadingRows }, (_, i) => (
                <tr key={`sk-${i}`} data-loading="">
                  {selectable ? (
                    <td className="hx-table-select">
                      <Skeleton className="hx-table-skel" style={{ inlineSize: '1rem' }} />
                    </td>
                  ) : null}
                  {columns.map((col, c) => (
                    <td
                      key={col.key}
                      className={cx(col.hideOnMobile && 'hx-col-hide') || undefined}
                      data-align={col.align}
                    >
                      <Skeleton
                        className="hx-table-skel"
                        style={{ inlineSize: `${[70, 50, 85, 60][(i + c) % 4]}%` }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : showEmpty ? (
              <tr data-empty="">
                <td colSpan={colSpan}>{emptyNode}</td>
              </tr>
            ) : (
              rows.map((row) => {
                const key = keyOf(row);
                const isSel = selectedSet.has(key);
                return (
                  <tr
                    key={key}
                    data-selected={flag(isSel)}
                    data-clickable={flag(Boolean(onRowClick))}
                    {...rowHandlers(row)}
                  >
                    {selectable ? (
                      <td className="hx-table-select">
                        <Checkbox
                          aria-label={selectRowLabel(row)}
                          checked={isSel}
                          onChange={() => toggleRow(key)}
                        />
                      </td>
                    ) : null}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cx(col.hideOnMobile && 'hx-col-hide') || undefined}
                        data-align={col.align}
                      >
                        {cellValue(col, row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {mobileCard ? (
        <ul className="hx-table-cards" aria-label={label} aria-busy={loading || undefined}>
          {loading ? (
            Array.from({ length: loadingRows }, (_, i) => (
              <li key={`sk-${i}`} className="hx-table-card" data-loading="">
                <Skeleton className="hx-table-skel" style={{ inlineSize: '60%' }} />
                <Skeleton className="hx-table-skel" style={{ inlineSize: '85%' }} />
              </li>
            ))
          ) : showEmpty ? (
            <li className="hx-table-card-empty">{emptyNode}</li>
          ) : (
            rows.map((row) => {
              const key = keyOf(row);
              const isSel = selectedSet.has(key);
              return (
                <li
                  key={key}
                  className="hx-table-card"
                  data-selected={flag(isSel)}
                  data-clickable={flag(Boolean(onRowClick))}
                  {...rowHandlers(row)}
                >
                  {selectable ? (
                    <Checkbox
                      aria-label={selectRowLabel(row)}
                      checked={isSel}
                      onChange={() => toggleRow(key)}
                    />
                  ) : null}
                  <div className="hx-table-card-body">{mobileCard(row)}</div>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}
