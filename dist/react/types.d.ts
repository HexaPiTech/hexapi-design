import type { ComponentType } from 'react';
export type Tone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';
export type Size = 'sm' | 'md' | 'lg';
/** Any icon component that accepts a class name — lucide-react icons fit. */
export type IconType = ComponentType<{
    className?: string;
    'aria-hidden'?: boolean | 'true';
}>;
