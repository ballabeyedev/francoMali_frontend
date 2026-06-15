import axios from 'axios';
import { clearSession, getToken } from '../utils/storage';
import { logger } from '../utils/logger';

if (!import.meta.env.VITE_API_BASE_URL) {
  throw new Error('[nanei] VITE_API_BASE_URL manquante — build invalide');
}

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
});

instance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  config._t0 = Date.now();
  logger.info('API:req', `${config.method?.toUpperCase()} ${config.url}`, {
    body: config.data,
    baseURL: config.baseURL,
  });
  return config;
});

instance.interceptors.response.use(
  (res) => {
    const ms = Date.now() - (res.config._t0 || 0);
    logger.info('API:res', `${res.status} ${res.config.method?.toUpperCase()} ${res.config.url} (${ms}ms)`, res.data);
    return res;
  },
  (error) => {
    const cfg = error.config || {};
    const ms = Date.now() - (cfg._t0 || 0);
    logger.error('API:err', `${error.response?.status ?? 'NET'} ${cfg.method?.toUpperCase()} ${cfg.url} (${ms}ms)`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({ ...error, userMessage: 'Le serveur met trop de temps à répondre. Réessayez.' });
    }
    if (error.response?.status === 401) {
      clearSession();
      window.location.href = '/nanei/login';
    }
    return Promise.reject(error);
  }
);

export default instance;
