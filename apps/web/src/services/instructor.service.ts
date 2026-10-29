import { api } from '@/lib/axios';

export type CreateClassPayload = {
  title: string;
  description?: string;
  level?: string;
  price?: number;
  categoryId?: string;
};

export type CreateModulePayload = {
  title: string;
  videoUrl?: string | null;
  content?: string | null;
  isFreePreview?: boolean;
};

export type QuizOption = {
  id: string;
  text: string;
};

export type QuizQuestionPayload = {
  question: string;
  options: QuizOption[];
  correctAnswer: string;
};

export type CreateQuizPayload = {
  type: 'FINAL' | 'MODULE';
  passingGrade: number;
  maxAttempts: number;
  moduleId?: string;
  questions: QuizQuestionPayload[];
};

export const InstructorService = {
  getMyClasses: async () => {
    const response = await api.get('/courses/instructor/my-classes');
    return response.data;
  },
  createClass: async (data: CreateClassPayload) => {
    const response = await api.post('/courses/instructor/classes', data);
    return response.data;
  },
  getClassById: async (id: string) => {
    const response = await api.get(`/courses/instructor/classes/${id}`);
    return response.data;
  },
  createModule: async (classId: string, data: CreateModulePayload) => {
    const response = await api.post(`/modules/class/${classId}`, data);
    return response.data;
  },
  deleteModule: async (moduleId: string) => {
    const response = await api.delete(`/modules/${moduleId}`);
    return response.data;
  },
  createQuiz: async (classId: string, data: CreateQuizPayload) => {
    const response = await api.post(`/quizzes/instructor/class/${classId}`, data);
    return response.data;
  },
  getQuiz: async (classId: string, type: 'FINAL' | 'MODULE', moduleId?: string) => {
    const response = await api.get(`/quizzes/instructor/class/${classId}`, {
      params: { type, ...(moduleId ? { moduleId } : {}) },
    });
    return response.data;
  },
};

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
  getQuiz: async (classId: string) => {
    const response = await api.get(`/quizzes/class/${classId}`);
    return response.data;
  },
  submitQuiz: async (quizId: string, answers: { questionId: string, answer: string }[]) => {
    const response = await api.post(`/quizzes/${quizId}/submit`, { answers });
    return response.data;
  },
};
