import type { HTMLAttributes } from 'react';
import type { Size } from './types.js';
export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
    size?: Size;
    /** Announced to screen readers. Omit when a nearby label already says it. */
    label?: string;
}
/** Loading indicator. Fades instead of turning under reduced motion. */
export declare function Spinner({ size, label, className, ...rest }: SpinnerProps): import("react").JSX.Element;
