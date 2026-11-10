/** Page numbers to show, with `'gap'` where numbers are skipped.
 *  Always the first and last page plus `siblings` around the current one. */
export declare function pageItems(page: number, pageCount: number, siblings?: number): Array<number | 'gap'>;
export interface PaginationProps {
    /** 1-based. */
    page: number;
    pageCount: number;
    onChange: (page: number) => void;
    siblings?: number;
    label?: string;
    previousLabel?: string;
    nextLabel?: string;
    className?: string;
}
export declare function Pagination({ page, pageCount, onChange, siblings, label, previousLabel, nextLabel, className, }: PaginationProps): import("react").JSX.Element | null;
