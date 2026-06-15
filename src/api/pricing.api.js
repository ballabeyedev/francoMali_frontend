import api from './axiosInstance';
import { ENDPOINTS } from '../constants/endpoints';
export const calculatePrice = (data) => api.post(ENDPOINTS.PRICING.CALCULATE, data);
