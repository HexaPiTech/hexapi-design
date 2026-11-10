export { createToastStore, makeToast, reduce as toastReducer, toast, toastStore, visibleToasts, type PromiseMessages, type ToastAction, type ToastApi, type ToastEvent, type ToastItem, type ToastKind, type ToastOptions, type ToastState, type ToastStore, } from './toastStore.js';
export type ToastPosition = 'top-center' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end';
export interface ToasterProps {
    /** Logical edges: `start` is the right side in Arabic. */
    position?: ToastPosition;
    /** How many show at once; older ones collapse out. */
    max?: number;
    /** Accessible name of the notification regions. */
    label?: string;
    closeLabel?: string;
    className?: string;
}
/**
 * Render once per app. Errors and warnings go to an assertive live region,
 * everything else to a polite one. It never takes focus. Timers pause while the
 * pointer or focus is inside, and while the tab is hidden.
 */
export declare function Toaster({ position, max, label, closeLabel, className, }: ToasterProps): import("react").JSX.Element | null;
