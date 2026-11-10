import type { HTMLAttributes } from 'react';
import type { Tone } from './types.js';
export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
    tone?: Tone;
}
/** Callout box. `danger` and `warning` are announced as alerts, the rest as status. */
export declare function Alert({ tone, role, className, ...rest }: AlertProps): import("react").JSX.Element;
