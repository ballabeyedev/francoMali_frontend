import { createContext } from 'react';
export const authContextObject = {
  user: null,
  loading: true,
  menus: [],
  isFirstLogin: false,
  login: async () => {},
  logout: async () => {},
};
export const AuthContext = createContext(authContextObject);
