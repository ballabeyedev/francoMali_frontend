import api from '../services/api';

const PUBLIC_API = '/francomaliship/pricing';

export const pricingAPI = {
  // Calculate price
  calculatePrice: async (data) => {
    try {
      const response = await api.post(`${PUBLIC_API}/calculate`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default pricingAPI;
