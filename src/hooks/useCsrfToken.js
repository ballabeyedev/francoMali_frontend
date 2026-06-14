import { useCallback } from 'react';
import api, { setCsrfToken, getCsrfToken } from '../services/api';

/**
 * Hook de gestion du token CSRF.
 *
 * fetchCsrfToken() demande un nouveau token au backend (POST /auth/csrf-token),
 * dépose le cookie csrf_token et mémorise la valeur côté client (sessionStorage)
 * pour qu'elle soit rejouée dans l'en-tête X-CSRF-Token par l'intercepteur axios.
 */
export function useCsrfToken() {
  const fetchCsrfToken = useCallback(async () => {
    try {
      const res = await api.post('/auth/csrf-token');
      const token = res.data?.csrfToken;
      if (token) setCsrfToken(token);
      return token;
    } catch {
      return null;
    }
  }, []);

  const ensureCsrfToken = useCallback(async () => {
    const existing = getCsrfToken();
    if (existing) return existing;
    return fetchCsrfToken();
  }, [fetchCsrfToken]);

  return { fetchCsrfToken, ensureCsrfToken, csrfToken: getCsrfToken() };
}

export default useCsrfToken;
