import type { HTMLAttributes } from 'react';
import type { Size, Tone } from './types.js';
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'soft' | 'solid' | 'outline';
    tone?: Tone;
    size?: Size;
}
export declare function Badge({ variant, tone, size, className, ...rest }: BadgeProps): import("react").JSX.Element;
