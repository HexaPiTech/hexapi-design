import { type ReactNode } from 'react';
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
    sortLabels?: {
        ascending: string;
        descending: string;
    };
    className?: string;
}
type Accessor<T> = (row: T, key: string) => unknown;
/** Pure, stable, non-mutating sort for client-side tables. Empty values (null,
 *  undefined, '') always go last, in both directions. `sort` of `null` keeps the
 *  order. The default accessor reads `row[key]`. */
export declare function sortRows<T>(rows: readonly T[], sort: SortState | null | undefined, accessor?: Accessor<T>): T[];
export declare function DataTable<T>({ columns, rows, rowKey, sort, onSortChange, selected, onSelectedChange, loading, loadingRows, empty, onRowClick, density, stickyHeader, maxHeight, caption, label, mobileCard, emptyTitle, selectAllLabel, selectRowLabel, sortLabels, className, }: DataTableProps<T>): import("react").JSX.Element;
export {};
