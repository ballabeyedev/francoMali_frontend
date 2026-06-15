import api from './axiosInstance';
import { ENDPOINTS } from '../constants/endpoints';
const E = ENDPOINTS.COUNTRIES;
export const getCountries    = ()           => api.get(E.LISTE);
export const getCountryById  = (id)         => api.get(E.BY_ID(id));
export const createCountry   = (data)       => api.post(E.LISTE, data);
export const updateCountry   = (id, data)   => api.put(E.BY_ID(id), data);
export const deleteCountry   = (id)         => api.delete(E.BY_ID(id));
