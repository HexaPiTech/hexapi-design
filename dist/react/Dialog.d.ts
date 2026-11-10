import { type ReactNode } from 'react';
export interface DialogProps {
    open: boolean;
    onClose: () => void;
    title?: ReactNode;
    children?: ReactNode;
    /** Action row, pinned under the scrolling body. */
    footer?: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    /** `center` becomes a bottom sheet on phones; the others dock to an edge. */
    placement?: 'center' | 'start' | 'end' | 'bottom';
    showClose?: boolean;
    closeLabel?: string;
    closeOnBackdrop?: boolean;
    closeOnEscape?: boolean;
    /** Accessible name when there is no visible `title`. */
    label?: string;
    className?: string;
}
/**
 * Modal dialog on the native `<dialog>` element: the browser traps focus,
 * makes the page behind inert, restores focus on close and handles Escape.
 * Children mount only while open, so form state resets between openings.
 */
export declare function Dialog({ open, onClose, title, children, footer, size, placement, showClose, closeLabel, closeOnBackdrop, closeOnEscape, label, className, }: DialogProps): import("react").JSX.Element;
/** A dialog docked to the inline-end edge (or `start` / `bottom`). */
export declare function Drawer({ placement, ...rest }: Omit<DialogProps, 'placement' | 'size'> & {
    placement?: 'start' | 'end' | 'bottom';
}): import("react").JSX.Element;
