import { createContext } from 'react';
export const authContextObject = { user: null, loading: true, login: async () => {}, logout: async () => {} };
export const AuthContext = createContext(authContextObject);
