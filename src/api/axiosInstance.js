import axios from 'axios';
import { clearSession, getToken } from '../utils/storage';

if (!import.meta.env.VITE_API_BASE_URL) {
  throw new Error('[nanei] VITE_API_BASE_URL manquante — build invalide');
}

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
});

// Injecter le Bearer token sur chaque requête
instance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// Sur 401 : vider la session et laisser React Router gérer la redirection
instance.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      clearSession();
      // Dispatcher un événement pour que AuthProvider mette user à null
      window.dispatchEvent(new Event('nanei:logout'));
    }
    return Promise.reject(error);
  }
);

export default instance;
