import { api } from '@/lib/axios';

export const PaymentService = {
  getMyPayments: async () => {
    const response = await api.get('/enrollments/payments/me');
    return response.data;
  },
  uploadProof: async (paymentId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.patch(
      `/enrollments/payments/${paymentId}/proof`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );
    return response.data;
  },
  getForAdmin: async () => {
    const response = await api.get('/enrollments/payments/admin');
    return response.data;
  },
  review: async (paymentId: string, approved: boolean, reason = '') => {
    const response = await api.patch(`/enrollments/payments/admin/${paymentId}/review`, {
      approved,
      reason,
    });
    return response.data;
  },
};