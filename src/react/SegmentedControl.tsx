import { useId, type ReactNode } from 'react';
import { cx, flag } from './cx.js';

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name of the group. */
  label: string;
  name?: string;
  fullWidth?: boolean;
  className?: string;
}

/** Pick exactly one of a few options. Real radios, so arrows and forms work. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  name,
  fullWidth = false,
  className,
}: SegmentedControlProps<T>) {
  const fallback = useId();
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cx('hx-segmented', className)}
      data-full={flag(fullWidth)}
    >
      {options.map((o) => (
        <label key={o.value}>
          <input
            type="radio"
            name={name ?? fallback}
            value={o.value}
            checked={o.value === value}
            disabled={o.disabled}
            onChange={() => onChange(o.value)}
          />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  );
}
