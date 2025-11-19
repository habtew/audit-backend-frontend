import axios, { AxiosInstance, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';
import { 
  ApiResponse, 
  LoginSuccessData, 
  LoginCredentials, 
  RegisterData, 
  User, 
  Client, 
  Engagement, 
  RiskAssessment, 
  DashboardStats, 
  Activity, 
  Deadline 
} from '../types';

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
            localStorage.removeItem('token');
            window.location.href = '/login';
          } catch {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
        }
        const message = error.response?.data?.message || 'An error occurred';
        if (error.response?.status !== 401) {
            // Suppress toast for dashboard 404s to allow graceful empty state
            if(error.config?.url?.includes('dashboard')) {
                console.warn("Dashboard data fetch failed", message);
            } else {
                toast.error(message);
            }
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic helpers - returns response.data (the body)
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

  // 🔐 AUTH METHODS
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginSuccessData>> {
    return this.post<ApiResponse<LoginSuccessData>>('/auth/login', credentials);
  }

  async register(data: RegisterData): Promise<ApiResponse<LoginSuccessData>> {
    return this.post<ApiResponse<LoginSuccessData>>('/auth/register', data);
  }

  async getUserProfile(): Promise<ApiResponse<User>> {
    return this.get<ApiResponse<User>>('/users/profile');
  }

  // ... (User, Client, Engagement methods from previous response remain the same) ...

  // 📈 DASHBOARD DATA
  // Using 'any' for return type allows Dashboard to handle both { data: ... } and direct ... 
  // but ideally we use the specific type. Since we are safeExtract-ing, we can return the specific type.
  async getDashboardOverview(): Promise<ApiResponse<DashboardStats>> {
    return this.get<ApiResponse<DashboardStats>>('/dashboard/overview');
  }

  async getRecentActivity(): Promise<ApiResponse<Activity[]>> {
    return this.get<ApiResponse<Activity[]>>('/dashboard/activity');
  }

  async getUpcomingDeadlines(): Promise<ApiResponse<Deadline[]>> {
    return this.get<ApiResponse<Deadline[]>>('/dashboard/deadlines');
  }

  async getKPIs(): Promise<ApiResponse<any>> {
    return this.get<ApiResponse<any>>('/dashboard/kpis');
  }
  
  // ... (Rest of the file) ...
    async getUsers(params?: any): Promise<ApiResponse<User[]>> {
    return this.get<ApiResponse<User[]>>('/users', params);
  }

  async createUser(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.post<ApiResponse<User>>('/users', data);
  }

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    return this.put<ApiResponse<User>>(`/users/${id}`, data);
  }

  async deleteUser(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.delete<ApiResponse<{ success: boolean }>>(`/users/${id}`);
  }

  async toggleUserStatus(id: string): Promise<ApiResponse<User>> {
    return this.put<ApiResponse<User>>(`/users/${id}/toggle-status`, {});
  }

  async getClients(params?: any): Promise<ApiResponse<Client[]>> {
    return this.get<ApiResponse<Client[]>>('/clients', params);
  }

  async createClient(data: Partial<Client>): Promise<ApiResponse<Client>> {
    return this.post<ApiResponse<Client>>('/clients', data);
  }

  async updateClient(id: string, data: Partial<Client>): Promise<ApiResponse<Client>> {
    return this.put<ApiResponse<Client>>(`/clients/${id}`, data);
  }

  async deleteClient(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.delete<ApiResponse<{ success: boolean }>>(`/clients/${id}`);
  }

  async createEngagement(data: Partial<Engagement>): Promise<ApiResponse<Engagement>> {
    return this.post<ApiResponse<Engagement>>('/engagements', data);
  }

  async getEngagements(params?: any): Promise<ApiResponse<Engagement[]>> {
    return this.get<ApiResponse<Engagement[]>>('/engagements', params);
  }

  async updateEngagement(id: string, data: Partial<Engagement>): Promise<ApiResponse<Engagement>> {
    return this.put<ApiResponse<Engagement>>(`/engagements/${id}`, data);
  }

  async deleteEngagement(id: string): Promise<void> {
    return this.delete<void>(`/engagements/${id}`);
  }

  async getRiskAssessments(params?: any): Promise<ApiResponse<RiskAssessment[]>> {
    return this.get<ApiResponse<RiskAssessment[]>>('/risk-assessments', params);
  }

  async createRiskAssessment(data: Partial<RiskAssessment>): Promise<ApiResponse<RiskAssessment>> {
    return this.post<ApiResponse<RiskAssessment>>('/risk-assessments', data);
  }

  async updateRiskAssessment(id: string, data: Partial<RiskAssessment>): Promise<ApiResponse<RiskAssessment>> {
    return this.put<ApiResponse<RiskAssessment>>(`/risk-assessments/${id}`, data);
  }

  async deleteRiskAssessment(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.delete<ApiResponse<{ success: boolean }>>(`/risk-assessments/${id}`);
  }
}

export const apiClient = new ApiClient();
export default apiClient;