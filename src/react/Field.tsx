import { createContext, useContext, useId, type LabelHTMLAttributes, type ReactNode } from 'react';
import { cx } from './cx.js';

interface FieldContextValue {
  id: string;
  describedBy?: string;
  invalid: boolean;
  required: boolean;
}
const FieldContext = createContext<FieldContextValue | null>(null);

/** Props a control picks up when it sits inside a <Field>. */
export function useFieldControl(own: {
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling';
  required?: boolean;
}) {
  const field = useContext(FieldContext);
  const fallbackId = useId();
  return {
    id: own.id ?? field?.id ?? fallbackId,
    'aria-describedby':
      [own['aria-describedby'], field?.describedBy].filter(Boolean).join(' ') || undefined,
    'aria-invalid': own['aria-invalid'] ?? (field?.invalid || undefined),
    required: own.required ?? (field?.required || undefined),
  };
}

export function Label({
  className,
  children,
  required,
  ...rest
}: LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label {...rest} className={cx('hx-label', className)}>
      {children}
      {required ? (
        <span data-required="" aria-hidden="true">
          *
        </span>
      ) : null}
    </label>
  );
}

export interface FieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  /** Replaces the hint and marks the control invalid. */
  error?: ReactNode;
  required?: boolean;
  /** Use when the control's id must be a known value. */
  id?: string;
  className?: string;
  children: ReactNode;
}

/** Label + control + hint or error, wired together for assistive tech. */
export function Field({
  label,
  hint,
  error,
  required = false,
  id,
  className,
  children,
}: FieldProps) {
  const autoId = useId();
  const controlId = id ?? autoId;
  const note = error || hint;
  const noteId = note ? `${controlId}-note` : undefined;
  return (
    <FieldContext.Provider
      value={{ id: controlId, describedBy: noteId, invalid: Boolean(error), required }}
    >
      <div className={cx('hx-field', className)}>
        {label ? (
          <Label htmlFor={controlId} required={required}>
            {label}
          </Label>
        ) : null}
        {children}
        {note ? (
          <p
            id={noteId}
            className="hx-hint"
            data-error={error ? '' : undefined}
            role={error ? 'alert' : undefined}
          >
            {note}
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}
