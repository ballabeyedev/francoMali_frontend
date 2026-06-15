import api from './axiosInstance';
import { ENDPOINTS } from '../constants/endpoints';
const E = ENDPOINTS.SERVICE_PRICES;
export const getServicePrices   = ()           => api.get(E.LISTE);
export const createServicePrice = (data)       => api.post(E.LISTE, data);
export const updateServicePrice = (id, data)   => api.put(E.BY_ID(id), data);
export const deleteServicePrice = (id)         => api.delete(E.BY_ID(id));
