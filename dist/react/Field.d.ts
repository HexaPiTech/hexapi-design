import { type LabelHTMLAttributes, type ReactNode } from 'react';
/** Props a control picks up when it sits inside a <Field>. */
export declare function useFieldControl(own: {
    id?: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling';
    required?: boolean;
}): {
    id: string;
    'aria-describedby': string | undefined;
    'aria-invalid': boolean | "true" | "false" | "grammar" | "spelling" | undefined;
    required: boolean | undefined;
};
export declare function Label({ className, children, required, ...rest }: LabelHTMLAttributes<HTMLLabelElement> & {
    required?: boolean;
}): import("react").JSX.Element;
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
export declare function Field({ label, hint, error, required, id, className, children, }: FieldProps): import("react").JSX.Element;
