import { type ButtonHTMLAttributes } from 'react';
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
export declare const Button: import("react").ForwardRefExoticComponent<ButtonProps & import("react").RefAttributes<HTMLButtonElement>>;
