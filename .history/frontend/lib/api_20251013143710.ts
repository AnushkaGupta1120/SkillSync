import axios from 'axios'
import { API_BASE_URL } from './utils'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

export { api }

// API functions
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: { name: string; email: string; password: string; role: string }) =>
    api.post('/auth/register', userData),
  profile: () => api.get('/auth/profile'),
}

export const dsaAPI = {
  getQuestions: (filters?: { difficulty?: string; category?: string }) =>
    api.get('/dsa/questions', { params: filters }),
  submitCode: (questionId: string, code: string, language: string) =>
    api.post('/dsa/submit', { questionId, code, language }),
  getHint: (questionId: string) =>
    api.post('/dsa/hint', { questionId }),
  generateQuestion: (weakAreas: string[]) =>
    api.post('/dsa/generate', { weakAreas }),
}

export const interviewAPI = {
  startSession: (type: 'coding' | 'behavioral') =>
    api.post('/interview/start', { type }),
  submitAnswer: (sessionId: string, answer: string) =>
    api.post('/interview/answer', { sessionId, answer }),
  getFeedback: (sessionId: string) =>
    api.get(`/interview/feedback/${sessionId}`),
}

export const resumeAPI = {
  upload: (file: File) => {
    const formData = new FormData()
    formData.append('resume', file)
    return api.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  analyze: (resumeId: string) =>
    api.get(`/resume/analyze/${resumeId}`),
}