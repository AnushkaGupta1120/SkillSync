import axios from 'axios';

const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiry
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: { name: string; email: string; password: string; role: string }) =>
    apiClient.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),
  getCurrentUser: () => apiClient.get('/auth/me'),
};

export const dsaAPI = {
  getQuestions: (params?: any) => apiClient.get('/dsa/questions', { params }),
  getQuestion: (questionId: string) => apiClient.get(`/dsa/questions/${questionId}`),
  submitSolution: (data: any) => apiClient.post('/dsa/submit', data),
  getSubmissions: (params?: any) => apiClient.get('/dsa/submissions', { params }),
  getHint: (questionId: string) => apiClient.post('/dsa/hint', { questionId }),
};

export const interviewAPI = {
  startInterview: (sessionType: string) =>
    apiClient.post('/interview/start', { sessionType }),
  submitAnswer: (sessionId: string, data: any) =>
    apiClient.post(`/interview/${sessionId}/answer`, data),
  completeInterview: (sessionId: string) =>
    apiClient.post(`/interview/${sessionId}/complete`),
  getHistory: (params?: any) => apiClient.get('/interview/history', { params }),
  getDetails: (sessionId: string) => apiClient.get(`/interview/${sessionId}`),
};

export const resumeAPI = {
  analyzeResume: (formData: FormData) =>
    apiClient.post('/resume/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getHistory: (params?: any) => apiClient.get('/resume/history', { params }),
  getDetails: (analysisId: string) => apiClient.get(`/resume/analysis/${analysisId}`),
};

export default apiClient;
 