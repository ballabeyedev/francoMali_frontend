/**
 * Bus de notifications — supporte { title, description } ou string simple.
 * toast.success('Titre', 'Description optionnelle')
 * toast.error({ title: 'Titre', description: 'Description' })
 */

let listener = null;

export const _subscribe = (fn) => { listener = fn; return () => { listener = null; }; };

const emit = (titleOrObj, description, type) => {
  if (!listener) return;
  const payload = typeof titleOrObj === 'object' && titleOrObj !== null
    ? titleOrObj
    : { title: titleOrObj, description };
  listener(payload, type);
};

export const toast = {
  success: (t, d) => emit(t, d, 'success'),
  error:   (t, d) => emit(t, d, 'error'),
  info:    (t, d) => emit(t, d, 'info'),
  warning: (t, d) => emit(t, d, 'warning'),
};
