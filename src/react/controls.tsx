import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cx } from './cx.js';
import { useFieldControl } from './Field.js';
import type { Size } from './types.js';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: Size;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { size = 'md', className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      {...rest}
      {...useFieldControl(rest)}
      className={cx('hx-input', className)}
      data-size={size}
    />
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      {...rest}
      {...useFieldControl(rest)}
      className={cx('hx-input', className)}
    />
  );
});

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: Size;
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { size = 'md', className, ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      {...rest}
      {...useFieldControl(rest)}
      className={cx('hx-input', className)}
      data-size={size}
    />
  );
});

type ChoiceProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  /** Visible text beside the control; without it pass `aria-label`. */
  label?: ReactNode;
};
const choice = (type: 'checkbox' | 'radio', name: string) =>
  forwardRef<HTMLInputElement, ChoiceProps>(function Choice({ label, className, ...rest }, ref) {
    const input = (
      <input
        ref={ref}
        type={type}
        {...rest}
        className={cx('hx-check', label ? undefined : className)}
      />
    );
    return label ? (
      <label className={cx('hx-choice', className)} data-kind={name}>
        {input}
        <span>{label}</span>
      </label>
    ) : (
      input
    );
  });

export type CheckboxProps = ChoiceProps;
export const Checkbox = choice('checkbox', 'checkbox');
export type RadioProps = ChoiceProps;
export const Radio = choice('radio', 'radio');

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode;
}
/** On/off toggle: a real checkbox with role="switch", so forms and Space work. */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, className, ...rest },
  ref,
) {
  const input = (
    <input
      ref={ref}
      type="checkbox"
      role="switch"
      {...rest}
      className={cx('hx-switch', label ? undefined : className)}
    />
  );
  return label ? (
    <label className={cx('hx-choice', className)} data-kind="switch">
      {input}
      <span>{label}</span>
    </label>
  ) : (
    input
  );
});

export interface FileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {}
/** Native file picker, themed. The button text comes from the browser. */
export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(function FileInput(
  { className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      {...rest}
      {...useFieldControl(rest)}
      type="file"
      className={cx('hx-file', className)}
    />
  );
});

export interface RangeProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {}
export const Range = forwardRef<HTMLInputElement, RangeProps>(function Range(
  { className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      {...rest}
      {...useFieldControl(rest)}
      type="range"
      className={cx('hx-range', className)}
    />
  );
});
