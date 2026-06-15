import api from './axiosInstance';
import { ENDPOINTS } from '../constants/endpoints';
const E = ENDPOINTS.SHIPPING_PRICES;
export const getShippingPrices   = ()           => api.get(E.LISTE);
export const createShippingPrice = (data)       => api.post(E.LISTE, data);
export const updateShippingPrice = (id, data)   => api.put(E.BY_ID(id), data);
export const deleteShippingPrice = (id)         => api.delete(E.BY_ID(id));
