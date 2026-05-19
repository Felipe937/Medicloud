import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // As we set up a proxy in vite.config.js
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to inject the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medicloud_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
