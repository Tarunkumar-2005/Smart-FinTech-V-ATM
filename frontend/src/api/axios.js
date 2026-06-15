import axios from 'axios';

// In dev, use /api (proxied by Vite to http://localhost:5000). Set VITE_API_URL to override.
const baseURL = import.meta.env.VITE_API_URL
  || (import.meta.env.DEV ? '/api' : 'http://localhost:5000/api');

const API = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    // Don't redirect on auth failures for login/register/change-pin (wrong credentials)
    const isAuthAttempt =
      err.config?.url?.includes('/auth/login') ||
      err.config?.url?.includes('/auth/register') ||
      err.config?.url?.includes('/account/change-pin');
    if (err.response?.status === 401 && !isAuthAttempt) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/dashboard';
    }
    return Promise.reject(err);
  }
);

export default API;
