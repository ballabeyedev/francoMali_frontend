import { useState, useEffect, useCallback } from 'react';
import { getMe, loginApi, logoutApi } from '../api/auth.api';
import { getUserId, setUserId, clearSession } from '../utils/storage';
import { setCsrfToken } from '../api/axiosInstance';
import { AuthContext } from './authContextObject';

export { AuthContext };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    if (!getUserId()) { setLoading(false); return; }
    try {
      const res = await getMe();
      setUser(res.data?.utilisateur ?? res.data?.user ?? res.data);
    } catch {
      clearSession();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = useCallback(async (email, motDePasse) => {
    const res = await loginApi(email, motDePasse);
    const userData = res.data?.utilisateur ?? res.data?.user ?? res.data;
    const csrfT = res.data?.csrfToken ?? res.headers?.['x-csrf-token'];
    if (csrfT) setCsrfToken(csrfT);
    setUserId(userData?.id ?? userData?._id ?? '1');
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try { await logoutApi(); } catch { /* ignore */ }
    setCsrfToken(null);
    clearSession();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
