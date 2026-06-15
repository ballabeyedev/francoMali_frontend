import { useState, useEffect, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout, getMe } from '../api/auth.api';
import { getToken, setToken, setUser, getUser, clearSession } from '../utils/storage';
import { AuthContext } from './authContextObject';

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => getUser());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = getToken();
      if (!token) { setIsLoading(false); return; }
      try {
        const res = await getMe();
        const u = res.data?.utilisateur || res.data;
        setUser(u);
        setUserState(u);
      } catch {
        clearSession();
        setUserState(null);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const login = useCallback(async (email, motDePasse) => {
    const res = await apiLogin(email, motDePasse);
    const { token, utilisateur } = res.data;
    setToken(token);
    setUser(utilisateur);
    setUserState(utilisateur);
    return utilisateur;
  }, []);

  const logout = useCallback(async () => {
    try { await apiLogout(); } catch { /* ignore */ }
    clearSession();
    setUserState(null);
    window.location.href = '/francomaliship/auth/login';
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
