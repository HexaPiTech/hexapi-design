import { type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import type { Size } from './types.js';
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    size?: Size;
}
export declare const Input: import("react").ForwardRefExoticComponent<InputProps & import("react").RefAttributes<HTMLInputElement>>;
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
}
export declare const Textarea: import("react").ForwardRefExoticComponent<TextareaProps & import("react").RefAttributes<HTMLTextAreaElement>>;
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
    size?: Size;
}
export declare const Select: import("react").ForwardRefExoticComponent<SelectProps & import("react").RefAttributes<HTMLSelectElement>>;
type ChoiceProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
    /** Visible text beside the control; without it pass `aria-label`. */
    label?: ReactNode;
};
export type CheckboxProps = ChoiceProps;
export declare const Checkbox: import("react").ForwardRefExoticComponent<Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> & {
    /** Visible text beside the control; without it pass `aria-label`. */
    label?: ReactNode;
} & import("react").RefAttributes<HTMLInputElement>>;
export type RadioProps = ChoiceProps;
export declare const Radio: import("react").ForwardRefExoticComponent<Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> & {
    /** Visible text beside the control; without it pass `aria-label`. */
    label?: ReactNode;
} & import("react").RefAttributes<HTMLInputElement>>;
export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
    label?: ReactNode;
}
/** On/off toggle: a real checkbox with role="switch", so forms and Space work. */
export declare const Switch: import("react").ForwardRefExoticComponent<SwitchProps & import("react").RefAttributes<HTMLInputElement>>;
export interface FileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
}
/** Native file picker, themed. The button text comes from the browser. */
export declare const FileInput: import("react").ForwardRefExoticComponent<FileInputProps & import("react").RefAttributes<HTMLInputElement>>;
export interface RangeProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
}
export declare const Range: import("react").ForwardRefExoticComponent<RangeProps & import("react").RefAttributes<HTMLInputElement>>;
export {};
