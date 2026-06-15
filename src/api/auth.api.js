import api from './axiosInstance';
import { ENDPOINTS } from '../constants/endpoints';
const E = ENDPOINTS.AUTH;
export const loginApi  = (identifiant, mot_de_passe) => api.post(E.LOGIN, { identifiant, mot_de_passe });
export const logoutApi = ()                  => api.post(E.LOGOUT);
export const getMe     = ()                  => api.get(E.ME);

// Aliases for backward compat
export const login  = loginApi;
export const logout = logoutApi;
