import type { HTMLAttributes } from 'react';
import { cx } from './cx.js';
import type { Size, Tone } from './types.js';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'soft' | 'solid' | 'outline';
  tone?: Tone;
  size?: Size;
}

export function Badge({
  variant = 'soft',
  tone = 'neutral',
  size = 'md',
  className,
  ...rest
}: BadgeProps) {
  return (
    <span
      {...rest}
      className={cx('hx-badge', className)}
      data-variant={variant}
      data-tone={tone}
      data-size={size}
    />
  );
}
