import { API_BASE_URL } from './utils'

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(url, config)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'API request failed')
    }

    return response.json()
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.post<{ token: string; user: any }>('/auth/login', {
      email,
      password,
    })
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.token)
    }
    
    return response
  }

  async register(name: string, email: string, password: string, role: string) {
    return this.post('/auth/register', { name, email, password, role })
  }

  async logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
  }

  // DSA Questions
  async getDSAQuestions(filters?: any) {
    return this.get('/dsa/questions' + (filters ? `?${new URLSearchParams(filters)}` : ''))
  }

  async getQuestion(id: string) {
    return this.get(`/dsa/questions/${id}`)
  }

  async submitSolution(questionId: string, code: string, language: string) {
    return this.post('/dsa/submit', { questionId, code, language })
  }

  // Resume Analysis
  async analyzeResume(file: File) {
    const formData = new FormData()
    formData.append('resume', file)
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    
    const response = await fetch(`${this.baseURL}/resume/analyze`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Resume analysis failed')
    }

    return response.json()
  }

  // Interview Sessions
  async startInterview(type: string) {
    return this.post('/interview/start', { type })
  }

  async submitAnswer(sessionId: string, answer: string) {
    return this.post(`/interview/${sessionId}/answer`, { answer })
  }

  // User Stats
  async getUserStats() {
    return this.get('/user/stats')
  }

  async getLeaderboard() {
    return this.get('/user/leaderboard')
  }
}

export const api = new ApiClient(API_BASE_URL)
