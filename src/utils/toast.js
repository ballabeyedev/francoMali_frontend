/**
 * Bus de notifications léger (sans dépendance externe).
 * Le ToastProvider s'abonne via subscribe(); toast.* émet les messages.
 */

let listener = null;

export const _subscribe = (fn) => { listener = fn; return () => { listener = null; }; };

const emit = (message, type) => { if (listener) listener(message, type); };

export const toast = {
  success: (msg) => emit(msg, 'success'),
  error:   (msg) => emit(msg, 'error'),
  info:    (msg) => emit(msg, 'info'),
};
