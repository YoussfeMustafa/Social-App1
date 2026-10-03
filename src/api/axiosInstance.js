import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'https://route-posts.routemisr.com';

const axiosInstance = axios.create({
  baseURL,
  timeout: 30000,
});

// Request interceptor to attach Bearer token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('social_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors (especially 401 unauthorized)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const currentPath = window.location.pathname;

    if (status === 401) {
      localStorage.removeItem('social_auth_token');
      localStorage.removeItem('social_auth_user');

      // Dispatch custom event so AuthContext can update reactively
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));

      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
