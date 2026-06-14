import api from '../services/api';

const ADMIN_API = '/francomaliship/admin';

export const countryAPI = {
  // Get all countries
  getAllCountries: async (filters = {}) => {
    try {
      const query = new URLSearchParams();
      if (filters.isActive !== undefined) {
        query.append('isActive', filters.isActive);
      }

      const response = await api.get(
        `${ADMIN_API}/countries${query.toString() ? '?' + query.toString() : ''}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get country by ID
  getCountryById: async (id) => {
    try {
      const response = await api.get(`${ADMIN_API}/countries/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create country
  createCountry: async (data) => {
    try {
      const response = await api.post(`${ADMIN_API}/countries`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update country
  updateCountry: async (id, data) => {
    try {
      const response = await api.put(`${ADMIN_API}/countries/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete country
  deleteCountry: async (id) => {
    try {
      const response = await api.delete(`${ADMIN_API}/countries/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default countryAPI;
