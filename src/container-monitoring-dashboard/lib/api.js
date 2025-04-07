import axios from 'axios';

const API_URL = 'http://localhost:3000';

const api = {
  // Container endpoints
  getContainers: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/containers`);
      return response.data;
    } catch (error) {
      console.error('Error fetching containers:', error);
      throw error;
    }
  },
  
  getContainerHistory: async (params) => {
    try {
      const response = await axios.get(`${API_URL}/api/containers/history`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching container history:', error);
      throw error;
    }
  },
  
  refreshContainers: async () => {
    try {
      const response = await axios.post(`${API_URL}/api/containers/refresh`);
      return response.data;
    } catch (error) {
      console.error('Error refreshing containers:', error);
      throw error;
    }
  },
  
  deleteHistory: async () => {
    try {
      const response = await axios.delete(`${API_URL}/api/containers/delete-history`);
      return response.data;
    } catch (error) {
      console.error('Error deleting history:', error);
      throw error;
    }
  }
};

export default api;