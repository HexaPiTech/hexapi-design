import { cx } from './cx.js';
import { ChevronEndIcon, ChevronStartIcon } from './icons.js';

/** Page numbers to show, with `'gap'` where numbers are skipped.
 *  Always the first and last page plus `siblings` around the current one. */
export function pageItems(page: number, pageCount: number, siblings = 1): Array<number | 'gap'> {
  const keep = new Set<number>([1, pageCount]);
  for (let p = page - siblings; p <= page + siblings; p++) {
    if (p >= 1 && p <= pageCount) keep.add(p);
  }
  const out: Array<number | 'gap'> = [];
  let prev = 0;
  for (const p of [...keep].sort((a, b) => a - b)) {
    if (p - prev === 2)
      out.push(prev + 1); // a one-page hole is shown, not hidden
    else if (p - prev > 2) out.push('gap');
    out.push(p);
    prev = p;
  }
  return out;
}

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

export function Pagination({
  page,
  pageCount,
  onChange,
  siblings = 1,
  label = 'الصفحات',
  previousLabel = 'السابق',
  nextLabel = 'التالي',
  className,
}: PaginationProps) {
  if (pageCount <= 1) return null;
  return (
    <nav aria-label={label} className={className}>
      <ul className={cx('hx-pagination')}>
        <li>
          <button
            type="button"
            className="hx-page-btn"
            aria-label={previousLabel}
            disabled={page <= 1}
            onClick={() => onChange(page - 1)}
          >
            <ChevronStartIcon aria-hidden="true" />
          </button>
        </li>
        {pageItems(page, pageCount, siblings).map((item, i) =>
          item === 'gap' ? (
            <li key={`gap-${i}`} className="hx-page-gap" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                className="hx-page-btn"
                aria-current={item === page ? 'page' : undefined}
                onClick={() => onChange(item)}
              >
                {item}
              </button>
            </li>
          ),
        )}
        <li>
          <button
            type="button"
            className="hx-page-btn"
            aria-label={nextLabel}
            disabled={page >= pageCount}
            onClick={() => onChange(page + 1)}
          >
            <ChevronEndIcon aria-hidden="true" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
