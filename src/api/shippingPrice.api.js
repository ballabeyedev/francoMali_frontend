import api from '../services/api';

const ADMIN_API = '/francomaliship/admin';

export const shippingPriceAPI = {
  // Get all shipping prices
  getAllShippingPrices: async (filters = {}) => {
    try {
      const query = new URLSearchParams();
      if (filters.countryId) {
        query.append('countryId', filters.countryId);
      }
      if (filters.type) {
        query.append('type', filters.type);
      }

      const response = await api.get(
        `${ADMIN_API}/shipping-prices${query.toString() ? '?' + query.toString() : ''}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get shipping price by ID
  getShippingPriceById: async (id) => {
    try {
      const response = await api.get(`${ADMIN_API}/shipping-prices/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create shipping price
  createShippingPrice: async (data) => {
    try {
      const response = await api.post(`${ADMIN_API}/shipping-prices`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update shipping price
  updateShippingPrice: async (id, data) => {
    try {
      const response = await api.put(`${ADMIN_API}/shipping-prices/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete shipping price
  deleteShippingPrice: async (id) => {
    try {
      const response = await api.delete(`${ADMIN_API}/shipping-prices/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default shippingPriceAPI;
