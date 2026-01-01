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
  RiskReport,
  EngagementAnalytics, 
  UserPerformanceMetric, 
  RiskAnalytics, 
  BillingAnalytics,
  ReportTemplate, 
  ReportHistory,
  AuditLog, 
  UserAccessLog,
  
} from '../types';
import { BillingAnalytics } from '../types';
import { ReportTemplate } from '../types';
import { RiskAnalytics } from '../types';
import { ReportHistory } from '../types';
import { UserPerformanceMetric } from '../types';
import { PBCRequest } from '../types';
import { UpdatePBCRequestDto } from '../types';
import { CreatePBCRequestDto } from '../types';

// Placeholder types (replace with actual types from your src/types.ts)
type Entity = any;
type AssignUserDto = { userId: string; role: string };
type EngagementTeamUser = any; 
type SuccessResponse = { message: string | { success: boolean } };
interface AnalyticsQueryParams {
  startDate?: string;
  endDate?: string;
  engagementId?: string;
  userId?: string;
}

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


  // trial balance endpoints would go here
  // 1. Upload/Import Trial Balance (Uses DataImportController)
  // async importTrialBalance(data: ImportTrialBalancePayload): Promise<ApiResponse<TrialBalance>> {
  //   const formData = new FormData();
  //   formData.append('file', data.file);
  //   formData.append('engagementId', data.engagementId);
  //   formData.append('period', data.period);
  //   if (data.description) formData.append('description', data.description);

  //   const response = await this.client.post<ApiResponse<TrialBalance>>('/data-import/trial-balance', formData, {
  //     headers: {
  //       'Content-Type': 'multipart/form-data',
  //     },
  //   });
  //   return response.data;
  // }


  async importTrialBalance(data: { file: File; engagementId: string; period: string; description?: string }): Promise<any> {
    const formData = new FormData();
    
    // 1. Append File
    formData.append('file', data.file);
    
    // 2. Append required DTO fields
    formData.append('engagementId', data.engagementId);
    
    // Ensure Date is sent as ISO String (Backend DTO likely expects @IsDateString)
    formData.append('period', data.period); 
    
    if (data.description) {
      formData.append('description', data.description);
    }

    // 3. Send to the CORRECT endpoint (based on your 400 vs 404 logs)
    return this.post('/data-import/trial-balance', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // 2. Get List of Trial Balances
  async getTrialBalances(params?: { engagementId?: string; page?: number; limit?: number }): Promise<ApiResponse<{ trialBalances: TrialBalance[]; pagination: any }>> {
    return this.get('/trial-balances', params);
  }

  // 3. Get Single Trial Balance Details (with accounts)
  async getTrialBalanceById(id: string): Promise<ApiResponse<TrialBalance>> {
    return this.get<ApiResponse<TrialBalance>>(`/trial-balances/${id}`);
  }

  // 4. Update a specific Account (Mapping)
  async updateTrialBalanceAccount(
    trialBalanceId: string, 
    accountId: string, 
    data: UpdateAccountPayload
  ): Promise<ApiResponse<TrialBalanceAccount>> {
    return this.put<ApiResponse<TrialBalanceAccount>>(
      `/trial-balances/${trialBalanceId}/accounts/${accountId}`, 
      data
    );
  }

  // 5. Delete Trial Balance
  async deleteTrialBalance(id: string): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/trial-balances/${id}`);
  }
  
  // 6. Get Summary
  async getTrialBalanceSummary(id: string): Promise<ApiResponse<any>> {
    return this.get(`/trial-balances/${id}/summary`);
  }

  // src/utils/api.ts

// ... inside ApiClient class

  // --- Advanced Trial Balance Features ---

  // 7. Manual Creation
  async createTrialBalance(data: ManualTrialBalancePayload): Promise<ApiResponse<TrialBalance>> {
    return this.post<ApiResponse<TrialBalance>>('/trial-balances', data);
  }

  // 8. Add Adjustment (Journal Entry)
  async addAdjustment(
    trialBalanceId: string, 
    accountId: string, 
    data: AdjustmentPayload
  ): Promise<ApiResponse<void>> {
    return this.post<ApiResponse<void>>(
      `/trial-balances/${trialBalanceId}/accounts/${accountId}/adjustments`, 
      data
    );
  }

  // 9. Compare Versions
  async compareTrialBalances(
    currentId: string, 
    previousId: string
  ): Promise<ApiResponse<ComparisonResult[]>> {
    return this.get<ApiResponse<ComparisonResult[]>>(
      `/trial-balances/${currentId}/compare/${previousId}`
    );
  }

  // 10. Export to Excel
  async exportTrialBalance(id: string): Promise<Blob> {
    const response = await this.client.get(`/trial-balances/${id}/export`, {
      responseType: 'blob', // Important for file downloads
    });
    return response.data;
  }

  // 11. Get Import History
  async getImportHistory(engagementId: string): Promise<ApiResponse<ImportHistory[]>> {
    return this.get<ApiResponse<ImportHistory[]>>(`/data-import/history?engagementId=${engagementId}`);
  }

  // 12. Validate File (Pre-check)
  async validateImportFile(file: File): Promise<ApiResponse<ValidationResult>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.post<ApiResponse<ValidationResult>>('/data-import/validate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  // 13. Download Template
  async getImportTemplate(type: string = 'trial-balance'): Promise<Blob> {
    const response = await this.client.get(`/data-import/template/${type}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // --- Billing: Invoices ---

  async getInvoices(params?: { status?: string; clientId?: string }): Promise<ApiResponse<Invoice[]>> {
    return this.get<ApiResponse<Invoice[]>>('/invoices', params);
  }

  async getInvoiceById(id: string): Promise<ApiResponse<Invoice>> {
    return this.get<ApiResponse<Invoice>>(`/invoices/${id}`);
  }

  async createInvoice(data: CreateInvoicePayload): Promise<ApiResponse<Invoice>> {
    return this.post<ApiResponse<Invoice>>('/invoices', data);
  }

  // Auto-generate based on unbilled hours
  async generateInvoice(engagementId: string): Promise<ApiResponse<Invoice>> {
    return this.post<ApiResponse<Invoice>>(`/invoices/generate/${engagementId}`);
  }

  async updateInvoice(id: string, data: Partial<CreateInvoicePayload>): Promise<ApiResponse<Invoice>> {
    return this.put<ApiResponse<Invoice>>(`/invoices/${id}`, data);
  }

  async markInvoicePaid(id: string): Promise<ApiResponse<Invoice>> {
    return this.put<ApiResponse<Invoice>>(`/invoices/${id}/pay`, {});
  }

  async sendInvoice(id: string): Promise<ApiResponse<void>> {
    return this.post<ApiResponse<void>>(`/invoices/${id}/send`, {});
  }

  async deleteInvoice(id: string): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/invoices/${id}`);
  }

  async getInvoicePreview(id: string): Promise<Blob> {
    const response = await this.client.get(`/invoices/${id}/preview`, { responseType: 'blob' });
    return response.data;
  }

  // --- Billing: Billable Hours ---

  async getBillableHours(params?: { isBilled?: boolean; engagementId?: string }): Promise<ApiResponse<BillableHour[]>> {
    return this.get<ApiResponse<BillableHour[]>>('/billable-hours', params);
  }

  async createTimeEntry(data: CreateTimeEntryPayload): Promise<ApiResponse<BillableHour>> {
    return this.post<ApiResponse<BillableHour>>('/billable-hours', data);
  }

  async getUnbilledSummary(engagementId: string): Promise<ApiResponse<{ totalHours: number; totalAmount: number; count: number }>> {
    return this.get(`/billable-hours/summary/engagement/${engagementId}`);
  }


  // =================================================================
  // 📊 ANALYTICS MODULE
  // =================================================================

  // --- 1. Core Analytics (New Endpoints) ---

  /**
   * Get detailed engagement statistics (counts, duration, status distribution).
   * Endpoint: GET /analytics/engagements
   */
  async getEngagementAnalytics(params?: AnalyticsDateParams): Promise<ApiResponse<EngagementAnalytics>> {
    return this.get<ApiResponse<EngagementAnalytics>>('/analytics/engagements', params);
  }

  /**
   * Get metrics on user productivity and task completion.
   * Endpoint: GET /analytics/users/performance
   */
  // async getUserPerformance(params?: AnalyticsDateParams): Promise<ApiResponse<UserPerformanceMetrics[]>> {
  //   return this.get<ApiResponse<UserPerformanceMetrics[]>>('/analytics/users/performance', params);
  // }

  /**
   * Analysis of billable vs. non-billable hours.
   * Endpoint: GET /analytics/billing/hours
   */
  async getBillingAnalytics(params?: AnalyticsDateParams): Promise<ApiResponse<BillingAnalytics>> {
    return this.get<ApiResponse<BillingAnalytics>>('/analytics/billing/hours', params);
  }

  /**
   * Get real-time progress percentage for a specific engagement.
   * Endpoint: GET /analytics/engagements/:id/progress
   */
  async getEngagementProgress(id: string): Promise<ApiResponse<EngagementProgress>> {
    return this.get<ApiResponse<EngagementProgress>>(`/analytics/engagements/${id}/progress`);
  }

  /**
   * Get aggregate risk data (heatmap data, high/low counts).
   * Endpoint: GET /analytics/risk
   */
  // async getRiskAnalytics(params?: AnalyticsDateParams): Promise<ApiResponse<RiskAnalytics>> {
  //   return this.get<ApiResponse<RiskAnalytics>>('/analytics/risk', params);
  // }


  // ... existing methods

  // ------------------------------------------------
  // 📊 Analytics Module
  // ------------------------------------------------

  // General Analytics
  // async getEngagementAnalytics(params?: AnalyticsQueryParams): Promise<ApiResponse<EngagementAnalytics>> {
  //   return this.get<ApiResponse<EngagementAnalytics>>('/analytics/engagements', params);
  // }

  async getUserPerformance(params?: AnalyticsQueryParams): Promise<ApiResponse<UserPerformanceMetric[]>> {
    return this.get<ApiResponse<UserPerformanceMetric[]>>('/analytics/users/performance', params);
  }

  async getRiskAnalytics(params?: AnalyticsQueryParams): Promise<ApiResponse<RiskAnalytics>> {
    return this.get<ApiResponse<RiskAnalytics>>('/analytics/risk', params);
  }



  // Reports
  async getReportTemplates(): Promise<ApiResponse<ReportTemplate[]>> {
    return this.get<ApiResponse<ReportTemplate[]>>('/reports/templates');
  }

  async getReportHistory(): Promise<ApiResponse<ReportHistory[]>> {
    return this.get<ApiResponse<ReportHistory[]>>('/reports/history');
  }

  async generateReport(code: string, params: any): Promise<ApiResponse<any>> {
    const { engagementId, ...dto } = params;

    // Map template codes to specific endpoints
    switch (code) {
      case 'FINANCIAL_SUMMARY':
      case 'financial-summary':
        return this.post('/reports/financial-summary', dto);
      
      case 'UTILIZATION':
      case 'utilization':
        return this.post('/reports/utilization', dto);
      
      case 'ENGAGEMENT':
      case 'engagement':
        if (!engagementId) throw new Error('Engagement ID is required for this report');
        return this.post(`/reports/engagement/${engagementId}`, dto);
        
      default:
        // Fallback or throw error if template is unknown
        throw new Error(`Unknown report template code: ${code}`);
    }
  }

  async downloadReport(reportId: string): Promise<Blob> {
    const response = await this.client.get(`/reports/export/${reportId}`, { 
      responseType: 'blob' 
    });
    return response.data;
  }

  // Compliance
  async getAuditTrail(entityType: string, entityId: string): Promise<ApiResponse<AuditLog[]>> {
    return this.get<ApiResponse<AuditLog[]>>(`/compliance/audit-trail/${entityType}/${entityId}`);
  }

  async getUserAccessLogs(params: { startDate: string; endDate: string }): Promise<ApiResponse<UserAccessLog[]>> {
    return this.get<ApiResponse<UserAccessLog[]>>('/compliance/user-access', params);
  }

  // pbc requests

  // ==========================================
  // 📋 PBC REQUESTS
  // ==========================================

  /**
   * Get all PBC requests for a specific engagement
   */
  async getPBCRequests(engagementId: string, status?: PBCStatus): Promise<ApiResponse<PBCRequest[]>> {
    return this.get<ApiResponse<PBCRequest[]>>(`/engagements/${engagementId}/pbc-requests`, { 
      params: { status } 
    });
  }

  /**
   * Create a new PBC request
   */
  async createPBCRequest(engagementId: string, data: Omit<CreatePBCRequestDto, 'engagementId'>): Promise<ApiResponse<PBCRequest>> {
    return this.post<ApiResponse<PBCRequest>>(`/engagements/${engagementId}/pbc-requests`, {
      ...data,
      engagementId // Ensure ID is passed in body if backend requires it in DTO
    });
  }

  /**
   * Update a PBC request (Status, Assignee)
   */
  async updatePBCRequest(engagementId: string, requestId: string, data: UpdatePBCRequestDto): Promise<ApiResponse<PBCRequest>> {
    return this.patch<ApiResponse<PBCRequest>>(`/engagements/${engagementId}/pbc-requests/${requestId}`, data);
  }

  /**
   * Delete a PBC request
   */
  async deletePBCRequest(engagementId: string, requestId: string): Promise<ApiResponse<void>> {
    return this.delete(`/engagements/${engagementId}/pbc-requests/${requestId}`);
  }

  /**
   * Upload a file to a PBC request (Client or Auditor side)
   */
  async uploadPBCFile(engagementId: string, requestId: string, file: File): Promise<ApiResponse<PBCRequest>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.post<ApiResponse<PBCRequest>>(
      `/engagements/${engagementId}/pbc-requests/${requestId}/upload`, 
      formData, 
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
  }


}

export const apiClient = new ApiClient();
export default apiClient;