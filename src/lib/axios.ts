import axios from 'axios';
import { getItemAsync } from '@/lib/storage';

const API_URL = 'https://saparu-backend-go-six.vercel.app/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach the token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getItemAsync('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token from storage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
