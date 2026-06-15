import { createContext, useState, useCallback, useEffect } from 'react';
import { loginApi, logoutApi } from '../api/auth.api';
import { setToken, removeToken, getToken, clearSession } from '../utils/storage';
import { authContextObject } from './authContextObject';

function parseJwt(token) {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(b64));
  } catch {
    return null;
  }
}

function userFromToken(token) {
  const p = parseJwt(token);
  if (!p?.id || !p?.role) return null;
  return { id: p.id, nom: p.nom, prenom: p.prenom, email: p.email, role: p.role, adresse: p.adresse, telephone: p.telephone };
}

export const AuthContext = createContext(authContextObject);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(() => userFromToken(getToken()));
  const [menus, setMenus] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fms_menus') || '[]'); } catch { return []; }
  });

  // Écouter l'événement 401 déclenché par l'intercepteur axios
  useEffect(() => {
    const handle = () => { setUser(null); setMenus([]); };
    window.addEventListener('nanei:logout', handle);
    return () => window.removeEventListener('nanei:logout', handle);
  }, []);

  const login = useCallback(async (identifiant, motDePasse) => {
    const res = await loginApi(identifiant, motDePasse);
    const token = res.data?.accessToken;
    if (!token) throw new Error('Token manquant dans la réponse serveur');
    setToken(token);
    const userData = userFromToken(token);
    if (!userData) throw new Error('Token JWT invalide ou incomplet');
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
