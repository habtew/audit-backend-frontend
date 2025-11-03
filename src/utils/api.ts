
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';
import { AuthResponse, User, LoginCredentials, RegisterData, Client, Engagement, RiskAssessment,DashboardStats, Activity, Deadline } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await this.client.post('/auth/refresh', { refreshToken });
              const { token } = response.data;
              localStorage.setItem('token', token);
              return this.client(originalRequest);
            }
          } catch {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
          }
        }
        const message = error.response?.data?.message || 'An error occurred';
        toast.error(message);
        return Promise.reject(error);
      }
    );
  }

  // Generic helpers
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  // =====================
  // 🔐 AUTH METHODS
  // =====================
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/login', credentials);
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/register', data);
  }

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    return this.post<{ token: string }>('/auth/refresh', { refreshToken });
  }

  async getUserProfile(): Promise<User> {
    return this.get<User>('/users/profile');
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.post<{ message: string }>('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return this.post<{ message: string }>('/auth/reset-password', { token, password });
  }

  // =====================
  // 👤 USER MANAGEMENT
  // =====================
  async getUsers(params?: any): Promise<User[]> {
    return this.get<User[]>('/users', params);
  }

  async createUser(data: Partial<User>): Promise<User> {
    return this.post<User>('/users', data);
  }

  async getUserById(id: string): Promise<User> {
    return this.get<User>(`/users/${id}`);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return this.put<User>(`/users/${id}`, data);
  }

  async deleteUser(id: string): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(`/users/${id}`);
  }

  async toggleUserStatus(id: string): Promise<User> {
    return this.put<User>(`/users/${id}/toggle-status`, {});
  }

  // =====================
  // 🧑‍💼 CLIENTS
  // =====================
  async getClients(params?: any): Promise<Client[]> {
    return this.get<Client[]>('/clients', params);
  }

  async createClient(data: Partial<Client>): Promise<Client> {
    return this.post<Client>('/clients', data);
  }

  async updateClient(id: string, data: Partial<Client>): Promise<Client> {
    return this.put<Client>(`/clients/${id}`, data);
  }

  async deleteClient(id: string): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(`/clients/${id}`);
  }

  // =====================
  // 📊 ENGAGEMENTS
  // =====================
  // In ApiClient class

  async createEngagement(data: Partial<Engagement>): Promise<Engagement> {
    return this.post<Engagement>('/engagements', data);
  }

  async getEngagements(params?: any): Promise<Engagement[]> {
    return this.get<Engagement[]>('/engagements', params);
  }

  async updateEngagement(id: string, data: Partial<Engagement>): Promise<Engagement> {
    return this.put<Engagement>(`/engagements/${id}`, data);
  }

  async deleteEngagement(id: string): Promise<void> {
    return this.delete<void>(`/engagements/${id}`);
  }



  // =====================
  // ⚠️ RISK ASSESSMENTS
  // =====================
  async getRiskAssessments(params?: any): Promise<RiskAssessment[]> {
    return this.get<RiskAssessment[]>('/risk-assessments', params);
  }

  async createRiskAssessment(data: Partial<RiskAssessment>): Promise<RiskAssessment> {
    return this.post<RiskAssessment>('/risk-assessments', data);
  }

  async updateRiskAssessment(id: string, data: Partial<RiskAssessment>): Promise<RiskAssessment> {
    return this.put<RiskAssessment>(`/risk-assessments/${id}`, data);
  }

  async deleteRiskAssessment(id: string): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(`/risk-assessments/${id}`);
  }

  // =====================
  // 📈 DASHBOARD DATA
  // =====================
  async getDashboardOverview(): Promise<{ data: DashboardStats }> {
    return this.get<{ data: DashboardStats }>('/dashboard/overview');
  }

  async getRecentActivity(): Promise<{ data: Activity[] }> {
    return this.get<{ data: Activity[] }>('/dashboard/activity');
  }

  async getUpcomingDeadlines(): Promise<{ data: Deadline[] }> {
    return this.get<{ data: Deadline[] }>('/dashboard/deadlines');
  }

  async getKPIs(): Promise<{ data: any }> {
    return this.get<{ data: any }>('/dashboard/kpis');
  }
}

export const apiClient = new ApiClient();
export default apiClient;