import type { ReactNode } from 'react';
export type ToastKind = 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading';
export interface ToastAction {
    label: string;
    onClick: () => void;
}
export interface ToastOptions {
    /** Reuse an id to update that toast in place instead of stacking a new one. */
    id?: string;
    /** Milliseconds. `Infinity` or `null` keeps it until dismissed. */
    duration?: number | null;
    description?: ReactNode;
    action?: ToastAction;
}
export interface ToastItem {
    id: string;
    kind: ToastKind;
    message: ReactNode;
    description?: ReactNode;
    action?: ToastAction;
    /** `null` = stays until dismissed. */
    duration: number | null;
    /** Bumped on every update of the same id; restarts the auto-dismiss timer. */
    rev: number;
}
export interface ToastState {
    /** Oldest first. */
    toasts: readonly ToastItem[];
}
export type ToastEvent = {
    type: 'upsert';
    toast: Omit<ToastItem, 'rev'>;
} | {
    type: 'dismiss';
    id?: string;
};
export declare const DEFAULT_DURATION = 4000;
export declare const ERROR_DURATION = 6000;
export declare function durationFor(kind: ToastKind, duration?: number | null): number | null;
export declare const emptyState: ToastState;
/** Most toasts kept at once, shown or collapsed; the oldest are dropped. */
export declare const MAX_QUEUE = 50;
export declare function reduce(state: ToastState, event: ToastEvent): ToastState;
/** The newest `max` toasts; older ones collapse out of view. */
export declare function visibleToasts(state: ToastState, max: number): ToastItem[];
export interface PromiseMessages<T> {
    loading: ReactNode;
    success: ReactNode | ((value: T) => ReactNode);
    error: ReactNode | ((error: unknown) => ReactNode);
}
export interface ToastStore {
    getState(): ToastState;
    subscribe(listener: () => void): () => void;
    dispatch(event: ToastEvent): void;
    /** Fire a toast of `kind`; returns its id. */
    show(kind: ToastKind, message: ReactNode, opts?: ToastOptions): string;
    dismiss(id?: string): void;
}
export declare function createToastStore(): ToastStore;
/** The shared store behind `toast()` and `<Toaster />`. */
export declare const toastStore: ToastStore;
type Fire = (message: ReactNode, opts?: ToastOptions) => string;
export interface ToastApi extends Fire {
    success: Fire;
    error: Fire;
    warning: Fire;
    info: Fire;
    /** Stays until dismissed or updated by id. */
    loading: Fire;
    dismiss: (id?: string) => void;
    /** Shows `loading`, then turns the same toast into success or error. Returns the promise. */
    promise: <T>(promise: Promise<T>, messages: PromiseMessages<T>, opts?: ToastOptions) => Promise<T>;
}
/** Callable from anywhere, no provider needed: `toast.success('تم الحفظ')`. */
export declare function makeToast(store: ToastStore): ToastApi;
export declare const toast: ToastApi;
export {};
