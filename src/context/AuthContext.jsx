import { createContext, useState, useEffect, useCallback } from 'react';
import api, {
  setStoredUser,
  getStoredUser,
  clearStoredUser,
  setCsrfToken,
  clearCsrfToken,
} from '../services/api';

/**
 * Contexte d'authentification basé sur les cookies httpOnly.
 *
 * - Aucun token n'est stocké en JavaScript : l'access/refresh token vivent
 *   dans des cookies httpOnly envoyés automatiquement (withCredentials).
 * - Seules des informations d'affichage minimales (nom, email, rôle) sont
 *   conservées en state + localStorage.
 * - Au montage, on appelle GET /auth/me pour valider la session côté serveur.
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(true);

  // Valide la session au montage
  const refreshSession = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      const u = res.data?.utilisateur || null;
      setUser(u);
      setStoredUser(u);
      // Récupère un token CSRF frais pour les actions mutantes post-rechargement
      try {
        const csrfRes = await api.post('/auth/csrf-token');
        if (csrfRes.data?.csrfToken) setCsrfToken(csrfRes.data.csrfToken);
      } catch {
        // non bloquant
      }
      return u;
    } catch {
      setUser(null);
      clearStoredUser();
      return null;
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refreshSession();
      setLoading(false);
    })();
  }, [refreshSession]);

  // Connexion : le backend pose les cookies, renvoie l'utilisateur + csrf token
  const login = useCallback(async ({ email, mot_de_passe }) => {
    const res = await api.post('/auth/login', {
      identifiant: email,
      mot_de_passe,
    });
    const u = res.data?.utilisateur || null;
    if (res.data?.csrfToken) setCsrfToken(res.data.csrfToken);
    setUser(u);
    setStoredUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // on nettoie côté client quoi qu'il arrive
    }
    setUser(null);
    clearStoredUser();
    clearCsrfToken();
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshSession,
    setUser: (u) => {
      setUser(u);
      setStoredUser(u);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
