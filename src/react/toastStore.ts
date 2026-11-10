// Pure toast state: a reducer plus a tiny external store. No React and no DOM,
// so stacking, update-by-id, `max` and dismiss are testable under plain Node.
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

export type ToastEvent =
  { type: 'upsert'; toast: Omit<ToastItem, 'rev'> } | { type: 'dismiss'; id?: string };

export const DEFAULT_DURATION = 4000;
export const ERROR_DURATION = 6000;

export function durationFor(kind: ToastKind, duration?: number | null): number | null {
  if (duration === null || duration === Infinity) return null;
  if (typeof duration === 'number') return duration;
  if (kind === 'loading') return null;
  return kind === 'error' || kind === 'warning' ? ERROR_DURATION : DEFAULT_DURATION;
}

export const emptyState: ToastState = { toasts: [] };

export function reduce(state: ToastState, event: ToastEvent): ToastState {
  if (event.type === 'dismiss') {
    if (event.id === undefined) return state.toasts.length ? emptyState : state;
    const toasts = state.toasts.filter((t) => t.id !== event.id);
    return toasts.length === state.toasts.length ? state : { toasts };
  }
  const i = state.toasts.findIndex((t) => t.id === event.toast.id);
  if (i < 0) return { toasts: [...state.toasts, { ...event.toast, rev: 0 }] };
  // Same id: replace in place (keeps its position) and restart its timer.
  const toasts = state.toasts.slice();
  toasts[i] = { ...event.toast, rev: state.toasts[i].rev + 1 };
  return { toasts };
}

/** The newest `max` toasts; older ones collapse out of view. */
export function visibleToasts(state: ToastState, max: number): ToastItem[] {
  return state.toasts.slice(Math.max(0, state.toasts.length - Math.max(1, max)));
}

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

export function createToastStore(): ToastStore {
  let state = emptyState;
  let counter = 0;
  const listeners = new Set<() => void>();
  const dispatch = (event: ToastEvent) => {
    const next = reduce(state, event);
    if (next === state) return;
    state = next;
    listeners.forEach((l) => l());
  };
  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    dispatch,
    show(kind, message, opts = {}) {
      const id = opts.id ?? `hx-toast-${++counter}`;
      dispatch({
        type: 'upsert',
        toast: {
          id,
          kind,
          message,
          description: opts.description,
          action: opts.action,
          duration: durationFor(kind, opts.duration),
        },
      });
      return id;
    },
    dismiss: (id) => dispatch({ type: 'dismiss', id }),
  };
}

/** The shared store behind `toast()` and `<Toaster />`. */
export const toastStore = createToastStore();

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
  promise: <T>(
    promise: Promise<T>,
    messages: PromiseMessages<T>,
    opts?: ToastOptions,
  ) => Promise<T>;
}

/** Callable from anywhere, no provider needed: `toast.success('تم الحفظ')`. */
export function makeToast(store: ToastStore): ToastApi {
  const fire =
    (kind: ToastKind): Fire =>
    (message, opts) =>
      store.show(kind, message, opts);
  const api = fire('default') as ToastApi;
  api.success = fire('success');
  api.error = fire('error');
  api.warning = fire('warning');
  api.info = fire('info');
  api.loading = fire('loading');
  api.dismiss = (id) => store.dismiss(id);
  api.promise = <T>(promise: Promise<T>, messages: PromiseMessages<T>, opts?: ToastOptions) => {
    const id = store.show('loading', messages.loading, opts);
    // Updates reuse the id and drop the loading-only options (duration is re-derived).
    const rest = { ...opts, id, duration: undefined };
    promise.then(
      (value) => {
        const m = messages.success;
        store.show(
          'success',
          typeof m === 'function' ? (m as (v: T) => ReactNode)(value) : m,
          rest,
        );
      },
      (error: unknown) => {
        const m = messages.error;
        store.show(
          'error',
          typeof m === 'function' ? (m as (e: unknown) => ReactNode)(error) : m,
          rest,
        );
      },
    );
    return promise;
  };
  return api;
}

export const toast: ToastApi = makeToast(toastStore);
