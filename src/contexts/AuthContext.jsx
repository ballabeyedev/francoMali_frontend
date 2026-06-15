import { createContext, useState, useEffect, useCallback } from 'react';
import { getMe, loginApi, logoutApi } from '../api/auth.api';
import { getUserId, setUserId, setToken, removeToken, clearSession } from '../utils/storage';
import { authContextObject } from './authContextObject';
import { logger } from '../utils/logger';

export const AuthContext = createContext(authContextObject);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menus, setMenus] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fms_menus') || '[]'); } catch { return []; }
  });

  const fetchMe = useCallback(async () => {
    if (!getUserId()) { setLoading(false); return; }
    try {
      const res = await getMe();
      const userData = res.data?.utilisateur ?? res.data?.user ?? res.data;
      setUser(userData);
    } catch {
      clearSession();
      localStorage.removeItem('fms_menus');
      setUser(null);
      setMenus([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = useCallback(async (identifiant, motDePasse) => {
    const res = await loginApi(identifiant, motDePasse);

    logger.info('Auth:raw', 'res.data reçu', {
      keys: res.data ? Object.keys(res.data) : null,
      hasUtilisateur: !!res.data?.utilisateur,
      role: res.data?.utilisateur?.role,
      status: res.status,
    });

    const token = res.data?.accessToken;
    if (token) setToken(token);

    const userData = res.data?.utilisateur ?? res.data?.user ?? res.data;
    if (!userData || typeof userData !== 'object' || Array.isArray(userData)) {
      throw Object.assign(new Error('Réponse serveur invalide — utilisateur manquant'), { response: res });
    }

    const menusData = res.data?.menus || [];
    setUserId(userData.id ?? userData._id ?? '');
    setUser(userData);
    localStorage.setItem('fms_menus', JSON.stringify(menusData));
    setMenus(menusData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try { await logoutApi(); } catch { /* ignore */ }
    clearSession();
    localStorage.removeItem('fms_menus');
    removeToken();
    setUser(null);
    setMenus([]);
  }, []);

  const isFirstLogin = user?.isFirstLogin === true;

  return (
    <AuthContext.Provider value={{ user, loading, menus, isFirstLogin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
