import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cx, flag } from './cx.js';
import type { IconType, Size, Tone } from './types.js';

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'aria-label'
> {
  icon: IconType;
  /** Required accessible name; also the hover tooltip unless `title` is set. */
  label: string;
  /** Colour on hover (and at rest when `tinted`). */
  tone?: Tone;
  /** Show the tone colour at rest instead of muted grey. */
  tinted?: boolean;
  size?: Size;
}

/** Icon-only action: edit, delete, close, pin. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    icon: Icon,
    label,
    tone = 'neutral',
    tinted = false,
    size = 'md',
    type = 'button',
    title,
    className,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      {...rest}
      aria-label={label}
      title={title ?? label}
      className={cx('hx-icon-btn', className)}
      data-tone={tone}
      data-size={size}
      data-tinted={flag(tinted)}
    >
      <Icon aria-hidden="true" />
    </button>
  );
});
