const USER_KEY = 'fms_user_id';

export const getUserId    = () => localStorage.getItem(USER_KEY);
export const setUserId    = (id) => localStorage.setItem(USER_KEY, String(id));
export const removeUserId = () => localStorage.removeItem(USER_KEY);
export const clearSession = () => { removeUserId(); };
