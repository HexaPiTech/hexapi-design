export const DEFAULT_DURATION = 4000;
export const ERROR_DURATION = 6000;
export function durationFor(kind, duration) {
    if (duration === null || duration === Infinity)
        return null;
    if (typeof duration === 'number')
        return duration;
    if (kind === 'loading')
        return null;
    return kind === 'error' || kind === 'warning' ? ERROR_DURATION : DEFAULT_DURATION;
}
export const emptyState = { toasts: [] };
export function reduce(state, event) {
    if (event.type === 'dismiss') {
        if (event.id === undefined)
            return state.toasts.length ? emptyState : state;
        const toasts = state.toasts.filter((t) => t.id !== event.id);
        return toasts.length === state.toasts.length ? state : { toasts };
    }
    const i = state.toasts.findIndex((t) => t.id === event.toast.id);
    if (i < 0)
        return { toasts: [...state.toasts, { ...event.toast, rev: 0 }] };
    // Same id: replace in place (keeps its position) and restart its timer.
    const toasts = state.toasts.slice();
    toasts[i] = { ...event.toast, rev: state.toasts[i].rev + 1 };
    return { toasts };
}
/** The newest `max` toasts; older ones collapse out of view. */
export function visibleToasts(state, max) {
    return state.toasts.slice(Math.max(0, state.toasts.length - Math.max(1, max)));
}
export function createToastStore() {
    let state = emptyState;
    let counter = 0;
    const listeners = new Set();
    const dispatch = (event) => {
        const next = reduce(state, event);
        if (next === state)
            return;
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
/** Callable from anywhere, no provider needed: `toast.success('تم الحفظ')`. */
export function makeToast(store) {
    const fire = (kind) => (message, opts) => store.show(kind, message, opts);
    const api = fire('default');
    api.success = fire('success');
    api.error = fire('error');
    api.warning = fire('warning');
    api.info = fire('info');
    api.loading = fire('loading');
    api.dismiss = (id) => store.dismiss(id);
    api.promise = (promise, messages, opts) => {
        const id = store.show('loading', messages.loading, opts);
        // Updates reuse the id and drop the loading-only options (duration is re-derived).
        const rest = { ...opts, id, duration: undefined };
        promise.then((value) => {
            const m = messages.success;
            store.show('success', typeof m === 'function' ? m(value) : m, rest);
        }, (error) => {
            const m = messages.error;
            store.show('error', typeof m === 'function' ? m(error) : m, rest);
        });
        return promise;
    };
    return api;
}
export const toast = makeToast(toastStore);
