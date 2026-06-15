/** Extrait un tableau de données depuis n'importe quelle forme de réponse */
export const extractList = (res, ...keys) => {
  const d = res?.data ?? res;
  for (const k of keys) { if (Array.isArray(d?.[k])) return d[k]; }
  if (Array.isArray(d)) return d;
  return [];
};

/** Extrait un total depuis la réponse */
export const extractTotal = (res, list) => {
  const d = res?.data ?? res;
  return d?.total ?? d?.count ?? d?.nombre ?? list?.length ?? 0;
};

/** Normalise un message d'erreur Axios */
export const extractError = (e) =>
  e?.response?.data?.message ?? e?.userMessage ?? e?.message ?? 'Une erreur est survenue';
