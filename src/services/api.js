import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Instance axios centralisée.
 *
 * - `withCredentials: true` : les cookies httpOnly (access/refresh) sont
 *   envoyés automatiquement avec chaque requête cross-site. Aucun token
 *   n'est stocké en JavaScript / localStorage (protection XSS).
 * - Le token CSRF (lisible) est injecté dans l'en-tête X-CSRF-Token sur
 *   chaque requête mutante.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
});

/* ========================= CSRF ========================= */

const CSRF_STORAGE_KEY = 'csrf_token';

export const setCsrfToken = (token) => {
  if (token) sessionStorage.setItem(CSRF_STORAGE_KEY, token);
};

export const getCsrfToken = () => sessionStorage.getItem(CSRF_STORAGE_KEY);

export const clearCsrfToken = () => sessionStorage.removeItem(CSRF_STORAGE_KEY);

/* ========================= USER (non sensible) ========================= */
/* On ne stocke QUE des infos d'affichage (nom/email/role), jamais de token. */

const USER_KEY = 'user';

export const setStoredUser = (user) => {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null;
  } catch {
    return null;
  }
};

export const clearStoredUser = () => localStorage.removeItem(USER_KEY);

/* ========================= REQUEST INTERCEPTOR ========================= */

api.interceptors.request.use((config) => {
  const method = (config.method || 'get').toUpperCase();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrf = getCsrfToken();
    if (csrf) config.headers['X-CSRF-Token'] = csrf;
  }
  return config;
});

/* ========================= RESPONSE INTERCEPTOR ========================= */

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401 || status === 403) {
        clearStoredUser();
        clearCsrfToken();
        if (!window.location.pathname.includes('/auth/login')) {
          window.location.href = '/francomaliship/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
