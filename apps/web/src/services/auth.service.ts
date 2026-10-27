import { api } from '@/lib/axios';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
  profilePicture?: string;
}

export const AuthService = {
  getProfile: async (): Promise<UserProfile> => {
    // Ubah kembali menjadi /auth/me
    const response = await api.get('/auth/me'); 
    return response.data;
  },

  register: async (data: { name: string; email: string; password: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  verifyEmail: async (token: string) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },
  resendVerification: async (email: string) => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },
  requestPasswordReset: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (token: string, password: string) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },
  exchangeOAuthCode: async (code: string) => {
    const response = await api.post('/auth/exchange', { code });
    return response.data;
  },
  updateProfile: async (data: { name: string; profilePicture?: string }) => {
    const response = await api.patch('/auth/profile', data);
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};