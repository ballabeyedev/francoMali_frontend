import axios from 'axios';
import { clearSession } from '../utils/storage';

if (!import.meta.env.VITE_API_BASE_URL) {
  throw new Error('[nanei] VITE_API_BASE_URL manquante — build invalide');
}

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

// CSRF : injecter le token stocké en mémoire sur les mutations
let csrfToken = null;
export const setCsrfToken = (t) => { csrfToken = t; };

instance.interceptors.request.use((config) => {
  const mutativeMethods = ['post', 'put', 'patch', 'delete'];
  if (csrfToken && mutativeMethods.includes(config.method?.toLowerCase())) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((p) => error ? p.reject(error) : p.resolve());
  failedQueue = [];
};

instance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({ ...error, userMessage: 'Le serveur met trop de temps à répondre. Réessayez.' });
    }
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
          .then(() => instance(original))
          .catch((e) => Promise.reject(e));
      }
      original._retry = true;
      isRefreshing = true;
      try {
        await instance.post('/auth/refresh');
        processQueue(null);
        return instance(original);
      } catch {
        processQueue(new Error('Session expirée'));
        clearSession();
        window.location.href = '/nanei/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
