import { type ButtonHTMLAttributes } from 'react';
import type { IconType, Size, Tone } from './types.js';
export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> {
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
export declare const IconButton: import("react").ForwardRefExoticComponent<IconButtonProps & import("react").RefAttributes<HTMLButtonElement>>;
