import api from '../services/api';

const ADMIN_API = '/francomaliship/admin';

export const servicePriceAPI = {
  // Get all service prices
  getAllServicePrices: async (filters = {}) => {
    try {
      const query = new URLSearchParams();
      if (filters.countryId) {
        query.append('countryId', filters.countryId);
      }
      if (filters.serviceType) {
        query.append('serviceType', filters.serviceType);
      }

      const response = await api.get(
        `${ADMIN_API}/service-prices${query.toString() ? '?' + query.toString() : ''}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get service price by ID
  getServicePriceById: async (id) => {
    try {
      const response = await api.get(`${ADMIN_API}/service-prices/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create service price
  createServicePrice: async (data) => {
    try {
      const response = await api.post(`${ADMIN_API}/service-prices`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update service price
  updateServicePrice: async (id, data) => {
    try {
      const response = await api.put(`${ADMIN_API}/service-prices/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete service price
  deleteServicePrice: async (id) => {
    try {
      const response = await api.delete(`${ADMIN_API}/service-prices/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default servicePriceAPI;
