import type { HTMLAttributes } from 'react';
import { cx } from './cx.js';

/** Placeholder block while content loads. Size it with a class or style. */
export function Skeleton({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span aria-hidden="true" {...rest} className={cx('hx-skeleton', className)} />;
}
