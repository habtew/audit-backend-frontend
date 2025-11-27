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
  EngagementResponse, // Import the new interface
  EngagementTeamUser,
  AssignUserDto,
  RiskAssessment, 
  DashboardOverview, 
  DashboardActivity, 
  DashboardDeadlines, 
  DashboardKPIs, 
  DashboardWorkload,
  Entity, // Import Entity
  Workpaper,
  RiskMatrix,
  RiskReport
} from '../types';

// Placeholder types (replace with actual types from your src/types.ts)
type Entity = any;
type AssignUserDto = { userId: string; role: string };
type EngagementTeamUser = any; 
type SuccessResponse = { message: string | { success: boolean } };


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  
  const responseData = error?.response?.data;
  
  if (responseData) {
    // Check if 'message' is nested (NestJS standard filter)
    if (typeof responseData.message === 'object' && responseData.message !== null && 'message' in responseData.message) {
       // Recursive extraction: { message: { message: "Error" } }
       const inner = responseData.message;
       if (Array.isArray(inner.message)) return inner.message.join(', ');
       return inner.message || 'Unknown error';
    }

    if (responseData.message) {
      if (Array.isArray(responseData.message)) return responseData.message.join(', ');
      if (typeof responseData.message === 'string') return responseData.message;
    }
    
    // If responseData itself is the object causing the crash, fallback
    if (typeof responseData === 'string') return responseData;
  }
  
  return error?.message || 'An unexpected error occurred';
};

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
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
            return Promise.reject(error);
          } catch {
            localStorage.removeItem('token');
            window.location.href = '/login';
            return Promise.reject(error);
          }
        }
        if (error.response?.status !== 401) {
            const isDashboard = error.config?.url?.includes('dashboard');
            if (!isDashboard) {
                const message = getErrorMessage(error);
                toast.error(message);
            }
        }
        return Promise.reject(error);
      }
    );
  }

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

  // 🔐 Auth
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginSuccessData>> {
    return this.post<ApiResponse<LoginSuccessData>>('/auth/login', credentials);
  }
  async register(data: RegisterData): Promise<ApiResponse<LoginSuccessData>> {
    return this.post<ApiResponse<LoginSuccessData>>('/auth/register', data);
  }
  async getUserProfile(): Promise<ApiResponse<User>> {
    return this.get<ApiResponse<User>>('/users/profile');
  }

  // 📈 Dashboard
  async getDashboardOverview(): Promise<ApiResponse<DashboardOverview>> {
    return this.get<ApiResponse<DashboardOverview>>('/dashboard/overview');
  }
  async getRecentActivity(): Promise<ApiResponse<DashboardActivity[]>> {
    return this.get<ApiResponse<DashboardActivity[]>>('/dashboard/activity', { limit: 10 });
  }
  async getUpcomingDeadlines(): Promise<ApiResponse<DashboardDeadlines>> {
    return this.get<ApiResponse<DashboardDeadlines>>('/dashboard/deadlines');
  }
  async getKPIs(): Promise<ApiResponse<DashboardKPIs>> {
    return this.get<ApiResponse<DashboardKPIs>>('/dashboard/kpis', { limit: 10 });
  }
  async getEngagementStatus(): Promise<ApiResponse<Record<string, number>>> {
     return this.get<ApiResponse<Record<string, number>>>('/dashboard/engagement-status');
  }
  async getWorkload(): Promise<ApiResponse<DashboardWorkload[]>> {
    return this.get<ApiResponse<DashboardWorkload[]>>('/dashboard/workload');
  }

  // 🧑‍💼 Clients
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
  async getClientEngagements(clientId: string): Promise<ApiResponse<Engagement[]>> {
    return this.get<ApiResponse<Engagement[]>>(`/clients/${clientId}/engagements`);
  }

  // 👤 Users
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

// 📊 ENGAGEMENTS (Expanded)
  // Note: API returns { data: { engagements: [], pagination: {} } }
  async getEngagements(params?: any): Promise<ApiResponse<EngagementResponse>> {
    return this.get<ApiResponse<EngagementResponse>>('/engagements', params);
  }
  async getEngagementById(id: string): Promise<ApiResponse<Engagement>> {
    return this.get<ApiResponse<Engagement>>(`/engagements/${id}`);
  }
  async createEngagement(data: Partial<Engagement>): Promise<ApiResponse<Engagement>> {
    return this.post<ApiResponse<Engagement>>('/engagements', data);
  }
  async updateEngagement(id: string, data: Partial<Engagement>): Promise<ApiResponse<Engagement>> {
    return this.put<ApiResponse<Engagement>>(`/engagements/${id}`, data);
  }
  async deleteEngagement(id: string): Promise<ApiResponse<SuccessResponse>> { 
    return this.delete<ApiResponse<SuccessResponse>>(`/engagements/${id}`);
  }
  
  // Engagement Team Management
  async assignUserToEngagement(id: string, data: AssignUserDto): Promise<ApiResponse<EngagementTeamUser>> { 
    return this.post<ApiResponse<EngagementTeamUser>>(`/engagements/${id}/assign-user`, data);
  }
  async removeUserFromEngagement(id: string, userId: string): Promise<ApiResponse<SuccessResponse>> {
    return this.delete<ApiResponse<SuccessResponse>>(`/engagements/${id}/users/${userId}`);
  }
  async getEngagementTeam(id: string): Promise<ApiResponse<EngagementTeamUser[]>> {
    return this.get<ApiResponse<EngagementTeamUser[]>>(`/engagements/${id}/team`);
  }

  // Engagement Status
  async updateEngagementStatus(id: string, status: string): Promise<ApiResponse<Engagement>> {
    return this.put<ApiResponse<Engagement>>(`/engagements/${id}/status`, { status });
  }

  // 🏛️ ENTITIES (New Section)
  async getEntities(params?: any): Promise<ApiResponse<Entity[]>> {
    return this.get<ApiResponse<Entity[]>>('/entities', params);
  }
  async createEntity(data: Partial<Entity>): Promise<ApiResponse<Entity>> {
    return this.post<ApiResponse<Entity>>('/entities', data);
  }
  async getEntityById(id: string): Promise<ApiResponse<Entity>> {
    return this.get<ApiResponse<Entity>>(`/entities/${id}`);
  }
  async updateEntity(id: string, data: Partial<Entity>): Promise<ApiResponse<Entity>> {
    return this.put<ApiResponse<Entity>>(`/entities/${id}`, data);
  }
  async deleteEntity(id: string): Promise<ApiResponse<SuccessResponse>> {
    return this.delete<ApiResponse<SuccessResponse>>(`/entities/${id}`);
  }
  async getEntitiesByClient(clientId: string): Promise<ApiResponse<Entity[]>> {
    return this.get<ApiResponse<Entity[]>>(`/entities/client/${clientId}`);
  }
  async getEntityEngagements(id: string): Promise<ApiResponse<Engagement[]>> {
    return this.get<ApiResponse<Engagement[]>>(`/entities/${id}/engagements`);
  }

  // ... existing code ...

  // 📂 WORKPAPERS
  async getWorkpapers(params?: any): Promise<ApiResponse<Workpaper[]>> {
    return this.get<ApiResponse<Workpaper[]>>('/workpapers', params);
  }

  async createWorkpaper(data: any): Promise<ApiResponse<Workpaper>> {
    return this.post<ApiResponse<Workpaper>>('/workpapers', data);
  }

  async getWorkpaperById(id: string): Promise<ApiResponse<Workpaper>> {
    return this.get<ApiResponse<Workpaper>>(`/workpapers/${id}`);
  }

  async updateWorkpaper(id: string, data: any): Promise<ApiResponse<Workpaper>> {
    return this.put<ApiResponse<Workpaper>>(`/workpapers/${id}`, data);
  }

  async deleteWorkpaper(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.delete<ApiResponse<{ message: string }>>(`/workpapers/${id}`);
  }

  async uploadWorkpaperDocument(id: string, file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Direct axios post to ensure headers are set correctly for FormData
    const response = await this.client.post<ApiResponse<any>>(`/workpapers/${id}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async reviewWorkpaper(id: string, data: { status: string; notes?: string }): Promise<ApiResponse<Workpaper>> {
    return this.put<ApiResponse<Workpaper>>(`/workpapers/${id}/review`, data);
  }

  async getWorkpaperTemplates(): Promise<ApiResponse<any[]>> {
    return this.get<ApiResponse<any[]>>('/workpapers/templates/list');
  }

  async createWorkpaperFromTemplate(templateId: string, data: any): Promise<ApiResponse<Workpaper>> {
    return this.post<ApiResponse<Workpaper>>(`/workpapers/templates/${templateId}`, data);
  }


  // ⚠️ Risk Assessment
  async getRiskAssessments(params?: any): Promise<ApiResponse<any>> {
    // API returns { data: { riskAssessments: [], pagination: {} } }
    return this.get<ApiResponse<any>>('/risk-assessments', params);
  }

  async getRiskAssessmentById(id: string): Promise<ApiResponse<RiskAssessment>> {
    return this.get<ApiResponse<RiskAssessment>>(`/risk-assessments/${id}`);
  }

  async createRiskAssessment(data: Partial<RiskAssessment>): Promise<ApiResponse<RiskAssessment>> {
    return this.post<ApiResponse<RiskAssessment>>('/risk-assessments', data);
  }

  async updateRiskAssessment(id: string, data: Partial<RiskAssessment>): Promise<ApiResponse<RiskAssessment>> {
    return this.put<ApiResponse<RiskAssessment>>(`/risk-assessments/${id}`, data);
  }

  async deleteRiskAssessment(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.delete<ApiResponse<{ message: string }>>(`/risk-assessments/${id}`);
  }

  // New Endpoints for Matrix & Report
  async getRiskMatrix(engagementId: string): Promise<ApiResponse<RiskMatrix>> {
    return this.get<ApiResponse<RiskMatrix>>(`/risk-assessments/engagements/${engagementId}/matrix`);
  }

  async getRiskReport(engagementId: string): Promise<ApiResponse<RiskReport>> {
    return this.get<ApiResponse<RiskReport>>(`/risk-assessments/engagements/${engagementId}/report`);
  }
}

export const apiClient = new ApiClient();
export default apiClient;