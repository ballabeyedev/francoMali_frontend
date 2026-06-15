import api from './axiosInstance';
import { ENDPOINTS } from '../constants/endpoints';
const E = ENDPOINTS.AUTH;
export const login  = (email, motDePasse) => api.post(E.LOGIN, { email, motDePasse });
export const logout = ()                  => api.post(E.LOGOUT);
export const getMe  = ()                  => api.get(E.ME);
