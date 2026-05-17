import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

console.log('API_BASE_URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

/* ========================= AUTH STORAGE ========================= */

// Sauvegarder auth
export const setAuth = (token, user) => {
  const data = {
    token,
    user,
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24h
  };

  localStorage.setItem('auth', JSON.stringify(data));
};

// Récupérer auth
export const getAuth = () => {
  try {
    const data = JSON.parse(localStorage.getItem('auth'));

    if (!data) return null;

    // expiration locale
    if (Date.now() > data.expiresAt) {
      clearAuth();
      return null;
    }

    return data;

  } catch {
    clearAuth();
    return null;
  }
};

// Supprimer auth
export const clearAuth = () => {
  localStorage.removeItem('auth');
};

// Vérifier connecté
export const isAuthenticated = () => {
  return !!getAuth();
};

/* ========================= REQUEST INTERCEPTOR ========================= */

api.interceptors.request.use((config) => {

  const auth = getAuth();

  console.log("TOKEN UTILISÉ:", auth?.token);

  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }

  return config;
});

/* ========================= RESPONSE INTERCEPTOR ========================= */

api.interceptors.response.use(
  (response) => response,

  (error) => {

    if (error.response) {

      const status = error.response.status;

      // Token expiré, accès refusé, ou erreur serveur critique (500)
      if (status === 401 || status === 403 || status === 500) {

        console.log(`⛔ Session expirée ou erreur ${status}. Déconnexion et redirection...`);

        clearAuth();

        window.location.href = "/francomaliship/auth/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;