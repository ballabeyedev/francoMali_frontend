const USER_KEY  = 'fms_user_id';
const TOKEN_KEY = 'fms_token';

export const getUserId    = () => localStorage.getItem(USER_KEY);
export const setUserId    = (id) => localStorage.setItem(USER_KEY, String(id));
export const removeUserId = () => localStorage.removeItem(USER_KEY);

export const getToken    = () => localStorage.getItem(TOKEN_KEY);
export const setToken    = (t) => localStorage.setItem(TOKEN_KEY, t);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const clearSession = () => { removeUserId(); removeToken(); };
