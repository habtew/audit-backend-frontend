import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  LoginSuccessData, 
  LoginCredentials, 
  RegisterData, 
  User, 
  Client, 
  Engagement, 
  EngagementResponse, 
  EngagementTeamUser,
  AssignUserDto,
  RiskAssessment, 
  DashboardOverview, 
  DashboardActivity, 
  DashboardDeadlines, 
  DashboardKPIs, 
  DashboardWorkload,
  Entity, 
  Workpaper,
  RiskMatrix,
  RiskReport,
  EngagementAnalytics, 
  UserPerformanceMetric, 
  RiskAnalytics, 
  BillingAnalytics,
  ReportTemplate, 
  AuditLog, 
  UserAccessLog,
  TrialBalance,
  TrialBalanceAccount,
  ImportTrialBalancePayload,
  ManualTrialBalancePayload,
  UpdateAccountPayload,
  AdjustmentPayload,
  ComparisonResult,
  ImportHistory,
  ValidationResult,
  Invoice,
  CreateInvoicePayload,
  BillableHour,
  CreateTimeEntryPayload,
  EngagementProgress,
  PBCRequest,
  CreatePBCRequestDto,
  UpdatePBCRequestDto,
  PBCStatus,
  SuccessResponse,
  AnalyticsDateParams,
  TrialBalanceSummaryData,
  // NEW TYPES
  PreEngagement,
  Materiality,
  AuditStrategy,
  PlanningRisk,
  FraudBrainstorming,
  ClientResponse,
  UserResponse
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

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
        if (error.response?.status === 401 && !error.config._retry) {
          error.config._retry = true;
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic Helpers
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }
  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }
  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }
  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data);
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

  // 📋 PHASE 1: PRE-ENGAGEMENT
  async createPreEngagement(data: any): Promise<ApiResponse<PreEngagement>> {
    return this.post<ApiResponse<PreEngagement>>('/pre-engagements', data);
  }
  async getPreEngagement(id: string): Promise<ApiResponse<PreEngagement>> {
    return this.get<ApiResponse<PreEngagement>>(`/pre-engagements/${id}`);
  }
  async declareIndependence(id: string, data: any): Promise<ApiResponse<any>> {
    return this.post<ApiResponse<any>>(`/pre-engagements/${id}/independence`, data);
  }
  async patchPreEngagementAssessment(id: string, data: any): Promise<ApiResponse<PreEngagement>> {
    return this.patch<ApiResponse<PreEngagement>>(`/pre-engagements/${id}/assessment`, data);
  }
  async updatePreEngagementTerms(id: string, data: any): Promise<ApiResponse<PreEngagement>> {
    return this.patch<ApiResponse<PreEngagement>>(`/pre-engagements/${id}/terms`, data);
  }
  async reviewPreEngagement(id: string, status: string): Promise<ApiResponse<PreEngagement>> {
    return this.patch<ApiResponse<PreEngagement>>(`/pre-engagements/${id}/review`, { status });
  }

  // 🏗️ PHASE 2: PLANNING
  // Materiality
  async saveMateriality(data: any): Promise<ApiResponse<Materiality>> {
    return this.post<ApiResponse<Materiality>>('/planning/materiality', data);
  }
  async getMateriality(engagementId: string): Promise<ApiResponse<Materiality>> {
    // Backend: @Get('materiality/:id')
    return this.get<ApiResponse<Materiality>>(`/planning/materiality/${engagementId}`);
  }
  async approveMateriality(engagementId: string): Promise<ApiResponse<Materiality>> {
    return this.patch<ApiResponse<Materiality>>(`/planning/materiality/${engagementId}/approve`, {});
  }

  // Strategy
  async saveStrategy(data: any): Promise<ApiResponse<AuditStrategy>> {
    return this.post<ApiResponse<AuditStrategy>>('/planning/strategy', data);
  }
  async getStrategy(engagementId: string): Promise<ApiResponse<AuditStrategy>> {
    // Backend: @Get('strategy/:id')
    return this.get<ApiResponse<AuditStrategy>>(`/planning/strategy/${engagementId}`);
  }
  async approveStrategy(engagementId: string): Promise<ApiResponse<AuditStrategy>> {
    return this.patch<ApiResponse<AuditStrategy>>(`/planning/strategy/${engagementId}/approve`, {});
  }

  // Risks
  async addPlanningRisk(data: any): Promise<ApiResponse<PlanningRisk>> {
    return this.post<ApiResponse<PlanningRisk>>('/planning/risks', data);
  }
  async getPlanningRisks(engagementId: string): Promise<ApiResponse<PlanningRisk[]>> {
    // Backend: @Get('risks/:id')
    return this.get<ApiResponse<PlanningRisk[]>>(`/planning/risks/${engagementId}`);
  }
  async approveRiskRegister(engagementId: string): Promise<ApiResponse<any>> {
    return this.patch<ApiResponse<any>>(`/planning/risks/${engagementId}/approve`, {});
  }

  // Fraud
  async saveFraudBrainstorming(data: any): Promise<ApiResponse<FraudBrainstorming>> {
    return this.post<ApiResponse<FraudBrainstorming>>('/planning/fraud', data);
  }
  async getFraudBrainstorming(engagementId: string): Promise<ApiResponse<FraudBrainstorming>> {
    // Backend: @Get('fraud/:id')
    return this.get<ApiResponse<FraudBrainstorming>>(`/planning/fraud/${engagementId}`);
  }
  async approveFraudBrainstorming(engagementId: string): Promise<ApiResponse<FraudBrainstorming>> {
    return this.patch<ApiResponse<FraudBrainstorming>>(`/planning/fraud/${engagementId}/approve`, {});
  }

  // Complete Planning Phase
  async completePlanningPhase(engagementId: string): Promise<ApiResponse<{ status: string }>> {
    return this.post<ApiResponse<{ status: string }>>(`/planning/${engagementId}/complete`, {});
  }

  // 📊 ENGAGEMENTS
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
  async assignUserToEngagement(id: string, data: AssignUserDto): Promise<ApiResponse<EngagementTeamUser>> { 
    return this.post<ApiResponse<EngagementTeamUser>>(`/engagements/${id}/assign-user`, data);
  }
  async removeUserFromEngagement(id: string, userId: string): Promise<ApiResponse<SuccessResponse>> {
    return this.delete<ApiResponse<SuccessResponse>>(`/engagements/${id}/users/${userId}`);
  }
  async getEngagementTeam(id: string): Promise<ApiResponse<EngagementTeamUser[]>> {
    return this.get<ApiResponse<EngagementTeamUser[]>>(`/engagements/${id}/team`);
  }
  async updateEngagementStatus(id: string, status: string): Promise<ApiResponse<Engagement>> {
    return this.put<ApiResponse<Engagement>>(`/engagements/${id}/status`, { status });
  }

  // 🧑‍💼 Clients
  async getClients(params?: any): Promise<ApiResponse<ClientResponse>> {
    return this.get<ApiResponse<ClientResponse>>('/clients', params);
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
  async getUsers(params?: any): Promise<ApiResponse<UserResponse>> {
    return this.get<ApiResponse<UserResponse>>('/users', params);
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

  // 🏛️ ENTITIES
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
    return this.post<ApiResponse<any>>(`/workpapers/${id}/documents`, formData);
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

  // ⚠️ Risk Assessment (Legacy/Other)
  async getRiskAssessments(params?: any): Promise<ApiResponse<{ riskAssessments: RiskAssessment[]; pagination: any }>> {
    return this.get<ApiResponse<{ riskAssessments: RiskAssessment[]; pagination: any }>>('/risk-assessments', params);
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
  async getRiskMatrix(engagementId: string): Promise<ApiResponse<RiskMatrix>> {
    return this.get<ApiResponse<RiskMatrix>>(`/risk-assessments/engagements/${engagementId}/matrix`);
  }
  async getRiskReport(engagementId: string): Promise<ApiResponse<RiskReport>> {
    return this.get<ApiResponse<RiskReport>>(`/risk-assessments/engagements/${engagementId}/report`);
  }

  // ⚖️ Trial Balance
  async getTrialBalances(params?: { engagementId?: string; page?: number; limit?: number }): Promise<ApiResponse<{ trialBalances: TrialBalance[]; pagination: any }>> {
    return this.get<ApiResponse<{ trialBalances: TrialBalance[]; pagination: any }>>('/trial-balances', params);
  }
  async getTrialBalanceById(id: string): Promise<ApiResponse<TrialBalance>> {
    return this.get<ApiResponse<TrialBalance>>(`/trial-balances/${id}`);
  }
  async deleteTrialBalance(id: string): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/trial-balances/${id}`);
  }
  async createTrialBalance(data: ManualTrialBalancePayload): Promise<ApiResponse<TrialBalance>> {
    return this.post<ApiResponse<TrialBalance>>('/trial-balances', data);
  }
  async importTrialBalance(data: ImportTrialBalancePayload): Promise<ApiResponse<TrialBalance>> {
    const formData = new FormData();
    formData.append('engagementId', data.engagementId);
    formData.append('period', data.period);
    if (data.description) formData.append('description', data.description);
    formData.append('file', data.file);
    return this.post<ApiResponse<TrialBalance>>('/data-import/trial-balance', formData);
  }
  async getTrialBalanceSummary(id: string): Promise<ApiResponse<{ trialBalance: Partial<TrialBalance>; summary: TrialBalanceSummaryData }>> {
    return this.get(`/trial-balances/${id}/summary`);
  }
  async exportTrialBalance(id: string): Promise<ApiResponse<any>> {
    return this.get(`/trial-balances/${id}/export`);
  }
  async updateTrialBalanceAccount(trialBalanceId: string, accountId: string, data: UpdateAccountPayload): Promise<ApiResponse<TrialBalanceAccount>> {
    return this.put(`/trial-balances/${trialBalanceId}/accounts/${accountId}`, data);
  }
  async compareTrialBalances(currentId: string, previousId: string): Promise<ApiResponse<ComparisonResult[]>> {
    return this.get(`/trial-balances/${currentId}/compare/${previousId}`);
  }
  async addAdjustment(trialBalanceId: string, accountId: string, data: AdjustmentPayload): Promise<ApiResponse<void>> {
    return this.post(`/trial-balances/${trialBalanceId}/accounts/${accountId}/adjustments`, data);
  }
  async getImportHistory(engagementId: string): Promise<ApiResponse<ImportHistory[]>> {
    return this.get<ApiResponse<ImportHistory[]>>(`/data-import/history?engagementId=${engagementId}`);
  }
  async validateImportFile(file: File): Promise<ApiResponse<ValidationResult>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.post<ApiResponse<ValidationResult>>('/data-import/validate', formData);
  }
  async getImportTemplate(type: string = 'trial-balance'): Promise<Blob> {
    const response = await this.client.get(`/data-import/template/${type}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // 💰 Billing
  async getInvoices(params?: { page?: number; limit?: number; status?: string; clientId?: string }): Promise<ApiResponse<{ invoices: Invoice[]; pagination: any }>> {
    return this.get<ApiResponse<{ invoices: Invoice[]; pagination: any }>>('/invoices', params);
  }
  async getInvoiceById(id: string): Promise<ApiResponse<Invoice>> {
    return this.get<ApiResponse<Invoice>>(`/invoices/${id}`);
  }
  async createInvoice(data: CreateInvoicePayload): Promise<ApiResponse<Invoice>> {
    return this.post<ApiResponse<Invoice>>('/invoices', data);
  }
  async generateInvoice(engagementId: string): Promise<ApiResponse<Invoice>> {
    return this.post<ApiResponse<Invoice>>(`/invoices/generate/${engagementId}`);
  }
  async updateInvoice(id: string, data: any): Promise<ApiResponse<Invoice>> {
    return this.put<ApiResponse<Invoice>>(`/invoices/${id}`, data);
  }
  async markInvoicePaid(id: string): Promise<ApiResponse<Invoice>> {
    return this.put<ApiResponse<Invoice>>(`/invoices/${id}/pay`, {});
  }
  async sendInvoice(id: string): Promise<ApiResponse<{ message: string; sentTo: string }>> {
    return this.post<ApiResponse<{ message: string; sentTo: string }>>(`/invoices/${id}/send`, {});
  }
  async deleteInvoice(id: string): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/invoices/${id}`);
  }
  async getInvoicePreviewData(id: string): Promise<ApiResponse<{ invoice: Invoice; previewUrl: string }>> {
    return this.get<ApiResponse<{ invoice: Invoice; previewUrl: string }>>(`/invoices/${id}/preview`);
  }
  async downloadInvoicePdf(id: string): Promise<Blob> {
    const response = await this.client.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
    return response.data;
  }
  async getBillableHours(params?: { isBilled?: boolean; engagementId?: string }): Promise<ApiResponse<BillableHour[]>> {
    return this.get<ApiResponse<BillableHour[]>>('/billable-hours', params);
  }
  async createTimeEntry(data: CreateTimeEntryPayload): Promise<ApiResponse<BillableHour>> {
    return this.post<ApiResponse<BillableHour>>('/billable-hours', data);
  }
  async getUnbilledSummary(engagementId: string): Promise<ApiResponse<{ 
    totalHours: number; 
    unbilledAmount: number; 
    totalBillableAmount: number; 
  }>> {
    const res = await this.get<ApiResponse<any>>('/billing/summary', { engagementId });
    return { ...res, data: res.data.summary };
  }
  async getBillingSummary(params?: { engagementId?: string; userId?: string; startDate?: string; endDate?: string; }): Promise<ApiResponse<any>> {
    return this.get('/billing/summary', params);
  }

  // 📊 Analytics
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
  async getRiskAnalytics(params?: AnalyticsDateParams): Promise<ApiResponse<RiskAnalytics>> {
    return this.get<ApiResponse<RiskAnalytics>>('/analytics/risk', params);
  }
  async getEngagementAnalytics(params?: AnalyticsDateParams): Promise<ApiResponse<EngagementAnalytics>> {
    return this.get<ApiResponse<EngagementAnalytics>>('/analytics/engagements', params);
  }
  async getUserPerformance(params?: AnalyticsDateParams): Promise<ApiResponse<UserPerformanceMetric[]>> {
    return this.get<ApiResponse<UserPerformanceMetric[]>>('/analytics/users/performance', params);
  }
  async getBillingAnalytics(params?: AnalyticsDateParams): Promise<ApiResponse<BillingAnalytics>> {
    return this.get<ApiResponse<BillingAnalytics>>('/analytics/billing/hours', params);
  }
  async getEngagementProgress(id: string): Promise<ApiResponse<EngagementProgress>> {
    return this.get<ApiResponse<EngagementProgress>>(`/analytics/engagements/${id}/progress`);
  }

  // 📄 Reports
  async getReportTemplates(): Promise<ApiResponse<ReportTemplate[]>> {
    return this.get<ApiResponse<ReportTemplate[]>>('/reports/templates');
  }
  async generateReport(templateId: string, params: any): Promise<ApiResponse<any>> {
    const { engagementId, ...dto } = params;
    switch (templateId) {
      case 'engagement-summary':
        if (!engagementId) throw new Error('Engagement ID is required');
        return this.post(`/reports/engagement/${engagementId}`, dto);
      case 'financial-dashboard':
        return this.post('/reports/financial-summary', dto);
      case 'utilization-analysis':
        return this.post('/reports/utilization', dto);
      default:
        return this.post(`/reports/generate/${templateId}`, params);
    }
  }
  async exportReport(reportId: string): Promise<ApiResponse<{ downloadUrl: string }>> {
    return this.post(`/reports/export/${reportId}`, {});
  }
  async downloadReportFile(path: string): Promise<Blob> {
    const response = await this.client.get(path, { responseType: 'blob' });
    return response.data;
  }

  // 🛡️ Compliance
  async getAuditTrail(entityType: string, entityId: string): Promise<ApiResponse<AuditLog[]>> {
    return this.get<ApiResponse<AuditLog[]>>(`/compliance/audit-trail/${entityType}/${entityId}`);
  }
  async getUserAccessLogs(params: { startDate: string; endDate: string }): Promise<ApiResponse<UserAccessLog[]>> {
    return this.get<ApiResponse<UserAccessLog[]>>('/compliance/user-access', params);
  }

  // 📋 PBC Requests
  async getPBCRequests(engagementId: string, status?: PBCStatus): Promise<ApiResponse<PBCRequest[]>> {
    return this.get<ApiResponse<PBCRequest[]>>(`/engagements/${engagementId}/pbc-requests`, { 
      params: { status } 
    });
  }
  async createPBCRequest(engagementId: string, data: Omit<CreatePBCRequestDto, 'engagementId'>): Promise<ApiResponse<PBCRequest>> {
    return this.post<ApiResponse<PBCRequest>>(`/engagements/${engagementId}/pbc-requests`, {
      ...data,
      engagementId 
    });
  }
  async updatePBCRequest(engagementId: string, requestId: string, data: UpdatePBCRequestDto): Promise<ApiResponse<PBCRequest>> {
    return this.patch<ApiResponse<PBCRequest>>(`/engagements/${engagementId}/pbc-requests/${requestId}`, data);
  }
  async deletePBCRequest(engagementId: string, requestId: string): Promise<ApiResponse<void>> {
    return this.delete(`/engagements/${engagementId}/pbc-requests/${requestId}`);
  }
  async uploadPBCFile(engagementId: string, requestId: string, file: File): Promise<ApiResponse<PBCRequest>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.post<ApiResponse<PBCRequest>>(
      `/engagements/${engagementId}/pbc-requests/${requestId}/upload`, 
      formData
    );
  }
}

export const apiClient = new ApiClient();
export default apiClient;