import { api } from '@/lib/axios';

export const EnrollmentService = {
  enroll: async (classId: string) => {
    const response = await api.post(`/enrollments/${classId}`);
    return response.data;
  },
  getMyEnrollments: async () => {
    const response = await api.get('/enrollments/my');
    return response.data;
  },
  getEnrollmentDetails: async (classId: string) => {
    const response = await api.get(`/enrollments/my/${classId}`);
    return response.data;
  },
  updateProgress: async (enrollmentId: string, moduleId: string, status: 'IN_PROGRESS' | 'COMPLETED') => {
    const response = await api.patch(`/enrollments/${enrollmentId}/modules/${moduleId}`, { status });
    return response.data;
  },
  // --- Fungsi Kuis yang sebelumnya hilang ---
  getQuiz: async (classId: string) => {
    const response = await api.get(`/quizzes/class/${classId}`);
    return response.data;
  },
  getModuleQuiz: async (moduleId: string) => {
    const response = await api.get(`/quizzes/module/${moduleId}`);
    return response.data;
  },
  submitQuiz: async (quizId: string, answers: { questionId: string, answer: string }[]) => {
    const response = await api.post(`/quizzes/${quizId}/submit`, { answers });
    return response.data;
  },
  downloadCertificate: async (certificateId: string) => {
    const response = await api.get(`/enrollments/certificates/${certificateId}/pdf`, {
      responseType: 'blob',
    });
    return response.data as Blob;
  },
  revokeCertificate: async (certificateId: string, reason: string) => {
    const response = await api.post(`/enrollments/certificates/${certificateId}/revoke`, { reason });
    return response.data;
  },
  getCertificatesForAdmin: async () => {
    const response = await api.get('/enrollments/certificates');
    return response.data;
  },
  getMyCertificates: async () => {
    const response = await api.get('/enrollments/certificates/me');
    return response.data;
  }
};