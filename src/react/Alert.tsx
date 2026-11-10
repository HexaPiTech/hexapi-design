import type { HTMLAttributes } from 'react';
import { cx } from './cx.js';
import type { Tone } from './types.js';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
}

/** Callout box. `danger` and `warning` are announced as alerts, the rest as status. */
export function Alert({ tone = 'info', role, className, ...rest }: AlertProps) {
  return (
    <div
      role={role ?? (tone === 'danger' || tone === 'warning' ? 'alert' : 'status')}
      {...rest}
      className={cx('hx-alert', className)}
      data-tone={tone}
    />
  );
}
