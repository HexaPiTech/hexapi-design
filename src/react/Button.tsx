import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cx, flag } from './cx.js';
import { Spinner } from './Spinner.js';
import type { IconType, Size, Tone } from './types.js';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'soft' | 'outline' | 'ghost' | 'link';
  tone?: Tone;
  size?: Size;
  /** Shown before the label (inline-start: the right edge in Arabic). */
  icon?: IconType;
  /** Shown after the label. */
  iconEnd?: IconType;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'solid',
    tone = 'brand',
    size = 'md',
    icon: Icon,
    iconEnd: IconEnd,
    loading = false,
    fullWidth = false,
    type = 'button',
    disabled,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      {...rest}
      className={cx('hx-btn', className)}
      data-variant={variant}
      data-tone={tone}
      data-size={size}
      data-full={flag(fullWidth)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <Spinner size={size === 'lg' ? 'md' : 'sm'} />
      ) : Icon ? (
        <Icon aria-hidden="true" />
      ) : null}
      {children}
      {!loading && IconEnd ? <IconEnd aria-hidden="true" /> : null}
    </button>
  );
});
