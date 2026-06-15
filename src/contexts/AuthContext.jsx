import { createContext, useState, useCallback } from 'react';
import { loginApi, logoutApi } from '../api/auth.api';
import { setToken, removeToken, clearSession } from '../utils/storage';
import { authContextObject } from './authContextObject';

// Décode le payload JWT sans vérification (côté client, usage affichage uniquement)
function parseJwt(token) {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(b64));
  } catch {
    return null;
  }
}

export const AuthContext = createContext(authContextObject);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [loading]         = useState(false);   // plus de fetchMe bloquant
  const [menus, setMenus] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fms_menus') || '[]'); } catch { return []; }
  });

  const login = useCallback(async (identifiant, motDePasse) => {
    const res = await loginApi(identifiant, motDePasse);

    const token = res.data?.accessToken;
    if (!token) throw new Error('Token manquant dans la réponse serveur');

    // Stocker le token pour les requêtes suivantes
    setToken(token);

    // Lire les infos utilisateur depuis le payload JWT (fiable, pas de formatUser)
    const payload = parseJwt(token);
    if (!payload?.id) throw new Error('Token JWT invalide ou incomplet');

    const userData = {
      id:       payload.id,
      nom:      payload.nom,
      prenom:   payload.prenom,
      email:    payload.email,
      role:     payload.role,
      adresse:  payload.adresse,
      telephone:payload.telephone,
    };

    const menusData = res.data?.menus || [];
    localStorage.setItem('fms_menus', JSON.stringify(menusData));
    setMenus(menusData);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try { await logoutApi(); } catch { /* ignore */ }
    clearSession();
    removeToken();
    localStorage.removeItem('fms_menus');
    setUser(null);
    setMenus([]);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading: false, menus, isFirstLogin: false, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
