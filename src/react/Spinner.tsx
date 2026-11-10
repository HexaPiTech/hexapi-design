import type { HTMLAttributes } from 'react';
import { cx } from './cx.js';
import type { Size } from './types.js';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: Size;
  /** Announced to screen readers. Omit when a nearby label already says it. */
  label?: string;
}

/** Loading indicator. Fades instead of turning under reduced motion. */
export function Spinner({ size = 'md', label, className, ...rest }: SpinnerProps) {
  return (
    <span
      role={label ? 'status' : undefined}
      aria-hidden={label ? undefined : true}
      {...rest}
      className={cx('hx-spinner', className)}
      data-size={size}
    >
      {label ? <span className="hx-sr-only">{label}</span> : null}
    </span>
  );
}
