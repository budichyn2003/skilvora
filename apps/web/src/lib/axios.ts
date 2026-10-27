import axios from 'axios';
import Cookies from 'js-cookie';

type RetriableRequest = {
  url?: string;
  _retry?: boolean;
  headers: { Authorization?: string };
};

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config as RetriableRequest | undefined;
    const noRefresh = new Set([
      '/auth/login',
      '/auth/register',
      '/auth/refresh',
      '/auth/exchange',
      '/auth/logout',
      '/auth/verify-email',
      '/auth/resend-verification',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/google',
    ]);
    const isAuthRequest = !!request?.url && noRefresh.has(request.url);
    if (error.response?.status !== 401 || !request || request._retry || isAuthRequest) {
      return Promise.reject(error);
    }

    request._retry = true;
    try {
      const { data } = await api.post('/auth/refresh');
      const isSecure = window.location.protocol === 'https:';
      Cookies.set('token', data.access_token, {
        expires: 1 / 24,
        sameSite: isSecure ? 'None' : 'Lax',
        secure: isSecure,
      });
      request.headers.Authorization = `Bearer ${data.access_token}`;
      return api(request);
    } catch (refreshError) {
      Cookies.remove('token');
      return Promise.reject(refreshError);
    }
  },
);
