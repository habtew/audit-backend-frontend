// src/utils/api.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as Types from '../types';

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
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        if (error.response?.status === 401 && !error.config._retry) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic Helpers
  // Generic Helpers
async get<T>(url: string, params?: any, config?: any): Promise<T> {
  return (await this.client.get<T>(url, { params, ...config })).data;
}

async post<T>(url: string, data?: any, config?: any): Promise<T> {
  return (await this.client.post<T>(url, data, config)).data;
}

async put<T>(url: string, data?: any, config?: any): Promise<T> {
  return (await this.client.put<T>(url, data, config)).data;
}

async patch<T>(url: string, data?: any, config?: any): Promise<T> {
  return (await this.client.patch<T>(url, data, config)).data;
}

async delete<T>(url: string, config?: any): Promise<T> {
  return (await this.client.delete<T>(url, config)).data;
}


  async uploadFile(data: FormData) {
  const response = await this.client.post('/files/upload', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
}
  // ==========================================
  // 0. CORE & FIRM OPERATIONS
  // ==========================================
  async login(credentials: any) { return this.post<Types.ApiResponse<any>>('/auth/login', credentials); }
  
  // Dashboard Endpoints
  async getDashboardOverview() { return this.get<Types.ApiResponse<Types.DashboardOverview>>('/dashboard/overview'); }
  async getRecentActivity() { return this.get<Types.ApiResponse<Types.DashboardActivity[]>>('/dashboard/activity'); }
  async getUpcomingDeadlines() { return this.get<Types.ApiResponse<{ engagements: Types.DashboardDeadline[], pbcRequests: any[] }>>('/dashboard/deadlines'); }
  async getWorkload() { return this.get<Types.ApiResponse<Types.DashboardWorkload[]>>('/dashboard/workload'); }
  async getKPIs() { return this.get<Types.ApiResponse<Types.DashboardKPIs>>('/dashboard/kpis'); }
  async getEngagementStatus() { return this.get<Types.ApiResponse<Record<string, number>>>('/dashboard/engagement-status'); }

  // Analytics Endpoints
  async getAnalyticsEngagements() { return this.get<Types.ApiResponse<Types.AnalyticsEngagements>>('/analytics/engagements'); }
  async getAnalyticsUserPerformance() { return this.get<Types.ApiResponse<any[]>>('/analytics/users/performance'); }
  async getAnalyticsBillingHours() { return this.get<Types.ApiResponse<Types.AnalyticsBillingHours>>('/analytics/billing/hours'); }
  async getAnalyticsRisk() { return this.get<Types.ApiResponse<Types.AnalyticsRisk>>('/analytics/risk'); }
  async getAnalyticsPartnerDashboard() { return this.get<Types.ApiResponse<Types.AnalyticsPartnerDashboard>>('/analytics/partner-dashboard'); }
  async getAnalyticsEngagementProgress(engagementId: string) { return this.get<Types.ApiResponse<Types.AnalyticsEngagementProgress>>(`/analytics/engagements/${engagementId}/progress`); }

  // Clients & Contacts
  async getClients() { return this.get<Types.ApiResponse<{ clients: Types.Client[] }>>('/clients'); }
  async createClient(data: any) { return this.post<Types.ApiResponse<Types.Client>>('/clients', data); }
  async addClientContact(clientId: string, data: any) { return this.post<Types.ApiResponse<Types.ClientContact>>(`/clients/${clientId}/contacts`, data); }

  // Engagements
  async getEngagements() { return this.get<Types.ApiResponse<{ engagements: Types.Engagement[] }>>('/engagements'); }
  async getEngagementById(id: string) { return this.get<Types.ApiResponse<Types.Engagement>>(`/engagements/${id}`); }

  // ==========================================
  // 1. PRE-ENGAGEMENT PHASE
  // ==========================================
  async initiatePreEngagement(data: any) { return this.post<Types.ApiResponse<Types.PreEngagement>>('/pre-engagements', data); }
  async submitIndependence(preId: string, data: any) { return this.post<Types.ApiResponse<Types.IndependenceDeclaration>>(`/pre-engagements/${preId}/independence`, data); }
  async updateComplianceCheck(preId: string, data: any) { return this.patch<Types.ApiResponse<Types.ComplianceCheck>>(`/pre-engagements/${preId}/compliance-check`, data); }
  async updateTerms(preId: string, data: any) { 
    return this.patch<Types.ApiResponse<any>>(`/pre-engagements/${preId}/terms`, data); 
  }
  async signOffPreEngagement(preId: string, data: any) { return this.post<Types.ApiResponse<any>>(`/pre-engagements/${preId}/sign-off`, data); }
  async getPreEngagements() { return this.get<Types.ApiResponse<any[]>>('/pre-engagements'); }
  async getPreEngagementById(preId: string) { return this.get<Types.ApiResponse<any>>(`/pre-engagements/${preId}`); }
  
  // 👇 FIXED: Matches your class method syntax
  async answerProcedure(preEngagementId: string, procedureId: string, data: FormData) {
    return this.patch<Types.ApiResponse<any>>(`/pre-engagements/${preEngagementId}/procedures/${procedureId}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
 // ==========================================
  // 2. PLANNING & RISK PHASE
  // ==========================================
  async getPlanningDashboard(engagementId: string) { return this.get<Types.ApiResponse<any>>(`/planning/${engagementId}/dashboard`); }
  
  // Entity & Special Considerations
  async updateEntityUnderstanding(engagementId: string, data: any) { return this.patch<Types.ApiResponse<any>>(`/planning/${engagementId}/entity-understanding`, data); }
  async updateSpecialConsiderations(engagementId: string, data: any) { return this.patch<Types.ApiResponse<any>>(`/planning/${engagementId}/special-considerations`, data); }
  
  // Materiality
  async createMateriality(data: any) { return this.post<Types.ApiResponse<any>>('/planning/materiality', data); }
  async approveMateriality(engagementId: string, data: any) { return this.patch<Types.ApiResponse<any>>(`/planning/materiality/${engagementId}/approve`, data); }
  
  // Fraud
  async submitFraudBrainstorming(data: any) { return this.post<Types.ApiResponse<any>>('/planning/fraud', data); }
  async approveFraudBrainstorming(engagementId: string, data: any) { return this.patch<Types.ApiResponse<any>>(`/planning/fraud/${engagementId}/approve`, data); }
  
  // Strategy
  async createAuditStrategy(data: any) { return this.post<Types.ApiResponse<any>>('/planning/strategy', data); }
  async approveAuditStrategy(engagementId: string, data: any) { return this.patch<Types.ApiResponse<any>>(`/planning/strategy/${engagementId}/approve`, data); }
  
  // Risks
  async createPlanningRisk(data: any) { return this.post<Types.ApiResponse<any>>('/planning/risks', data); }
  async approvePlanningRisk(engagementId: string, data: any) { return this.patch<Types.ApiResponse<any>>(`/planning/risks/${engagementId}/approve`, data); } // Assuming this exists based on your prompt sequence
  async approveRiskRegister(
  engagementId: string
) {
  return this.patch(
    `/planning/risks/${engagementId}/approve`
  );
}

// --- Planning File Uploads ---
  // In src/utils/api.ts
  async uploadPlanningEvidence(formData: FormData) {
    // 👇 Points directly to the @Post('upload') route in PlanningController
    return this.post<Types.ApiResponse<any>>(`/planning/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
  // Complete Phase
  async completePlanning(engagementId: string) { return this.post<Types.ApiResponse<any>>(`/planning/${engagementId}/complete`); }

  // ==========================================
  // 3. DATA ACQUISITION & TRIAL BALANCE
  // ==========================================
  // Imports & History
  async importTrialBalance(data: FormData) { 
    return this.post<Types.ApiResponse<any>>('/data-import/trial-balance', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      transformRequest: [(d) => d] 
    }); 
  }
  async importLedger(engagementId: string, data: FormData) { 
    return this.post<Types.ApiResponse<any>>(`/data-import/${engagementId}/ledger`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      transformRequest: [(d) => d] 
    }); 
  }
  async getImportHistory() { return this.get<Types.ApiResponse<any>>('/data-import/history'); }

  // Trial Balance Core
  async getTrialBalances() { return this.get<Types.ApiResponse<any>>('/trial-balances'); }
  async getTrialBalanceById(tbId: string) { return this.get<Types.ApiResponse<any>>(`/trial-balances/${tbId}`); }
  async deleteTrialBalance(tbId: string) { return this.delete<Types.ApiResponse<any>>(`/trial-balances/${tbId}`); }
  async exportTrialBalance(tbId: string) { return this.get<Types.ApiResponse<any>>(`/trial-balances/${tbId}/export`); }
  
  // Account Management & Adjustments
  async updateTrialBalanceAccount(tbId: string, accountId: string, data: any) { return this.patch<Types.ApiResponse<any>>(`/trial-balances/${tbId}/accounts/${accountId}`, data); }
  async addAdjustment(tbId: string, accountId: string, data: any) { return this.post<Types.ApiResponse<any>>(`/trial-balances/${tbId}/accounts/${accountId}/adjustments`, data); }
  
  // Reconciliations & Statements
  async getTrialBalanceSummary(tbId: string) { return this.get<Types.ApiResponse<any>>(`/trial-balances/${tbId}/summary`); }
  async getLeadSchedules(engagementId: string) { return this.get<Types.ApiResponse<any>>(`/trial-balances/${engagementId}/lead-schedules`); }
  async getReconciliation(engagementId: string) { return this.get<Types.ApiResponse<any>>(`/trial-balances/${engagementId}/reconciliation`); }
  async getDraftStatements(engagementId: string) { return this.get<Types.ApiResponse<any>>(`/trial-balances/${engagementId}/statements`); }


// ==========================================
  // 4. ACCOUNT MAPPING
  // ==========================================
  async getTaxonomy() { return this.get<Types.ApiResponse<any>>('/mapping/taxonomy'); }
  async getMappingStats(tbId: string) { return this.get<Types.ApiResponse<any>>(`/mapping/trial-balance/${tbId}/stats`); }
  async getMappingsForTrialBalance(tbId: string, status?: string) { 
    return this.get<Types.ApiResponse<any>>(`/mapping/trial-balance/${tbId}${status ? `?status=${status}` : ''}`); 
  }
  async getMappingSuggestions(accountId: string) { 
    return this.get<Types.ApiResponse<any>>(`/mapping/suggestions/${accountId}`); 
  }
  async validateMappings(tbId: string, engagementId: string) { 
    return this.get<Types.ApiResponse<any>>(`/mapping/trial-balance/${tbId}/validate?engagementId=${engagementId}`); 
  }
  async autoMapTrialBalance(tbId: string) { return this.post<Types.ApiResponse<any>>(`/mapping/trial-balance/${tbId}/auto-map`, {}); }
  async manualMapAccount(data: { accountId: string; taxonomyNodeId: string; overrideReason?: string }) { 
    return this.post<Types.ApiResponse<any>>('/mapping/manual', data); 
  }
  async approveMapping(mappingId: string) { return this.patch<Types.ApiResponse<any>>(`/mapping/${mappingId}/approve`, {}); }
  async exportMappings(tbId: string) { return this.get<Types.ApiResponse<any>>(`/mapping/trial-balance/${tbId}/export`); }
  
  // ==========================================
  // 5. INTEGRATIONS & EXTERNAL DATA
  // ==========================================
  async getAvailableIntegrations() { return this.get<Types.ApiResponse<any>>('/integrations/available'); }
  async getIntegrationStatus(clientId: string) { return this.get<Types.ApiResponse<any>>(`/integrations/status/${clientId}`); }
  async connectQuickBooks() { return this.post<Types.ApiResponse<any>>('/integrations/quickbooks/connect', {}); }
  async connectXero() { return this.post<Types.ApiResponse<any>>('/integrations/xero/connect', {}); }
  async syncIntegrationData(engagementId: string) { return this.post<Types.ApiResponse<any>>(`/integrations/sync/${engagementId}`, {}); }
  async importBankTransactions(data: FormData) { 
    return this.post<Types.ApiResponse<any>>('/integrations/bank/import', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      transformRequest: [(d) => d] 
    }); 
  }
  
  // ==========================================
  // 6. EXECUTION PHASE
  // ==========================================
  // Dashboards & Generation
  async getExecutionDashboard(engagementId: string) { return this.get<Types.ApiResponse<any>>(`/execution/${engagementId}/dashboard`); }
  async getProcedures(engagementId: string) { return this.get<Types.ApiResponse<any>>(`/execution/${engagementId}/procedures`); }
  async generateProcedures(engagementId: string) { return this.post<Types.ApiResponse<any>>(`/execution/${engagementId}/procedures/generate`, {}); }
  
  // Procedure Management
  async getProcedureById(procedureId: string) { return this.get<Types.ApiResponse<any>>(`/execution/procedures/${procedureId}`); }
  async updateProcedure(procedureId: string, data: any) { return this.patch<Types.ApiResponse<any>>(`/execution/procedures/${procedureId}`, data); }
  async submitProcedureEvidence(procedureId: string, data: FormData) { 
    return this.post<Types.ApiResponse<any>>(`/execution/procedures/${procedureId}/submit`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      transformRequest: [(d) => d] 
    }); 
  }
  async downloadEvidence(evidenceId: string) { return this.get<Blob>(`/execution/evidence/${evidenceId}/download`, { responseType: 'blob' }); }
  async logAnalyticalProcedure(procedureId: string, data: any) { return this.post<Types.ApiResponse<any>>(`/execution/procedures/${procedureId}/analytical`, data); }
  
  // Manager Review
  async reviewProcedure(procedureId: string, data: any) { return this.post<Types.ApiResponse<any>>(`/execution/procedures/${procedureId}/review`, data); }
  async resolveReviewNote(noteId: string) { return this.patch<Types.ApiResponse<any>>(`/execution/review-notes/${noteId}/resolve`, {}); }
  // Exceptions & AJEs
  async logException(procedureId: string, data: any) { return this.post<Types.ApiResponse<any>>(`/execution/procedures/${procedureId}/exceptions`, data); }
  async updateException(procedureId: string, exceptionId: string, data: any) { return this.patch<Types.ApiResponse<any>>(`/execution/procedures/${procedureId}/exceptions/${exceptionId}`, data); }
  async proposeAje(engagementId: string, exceptionId: string, data: any) { return this.post<Types.ApiResponse<any>>(`/execution/${engagementId}/exceptions/${exceptionId}/ajes`, data); }

  // ==========================================
  // 7. COMPLETION PHASE
  // ==========================================
  async postAje(ajeId: string) { return this.post<Types.ApiResponse<any>>(`/completion/aje/${ajeId}/post`, {}); }
  async reconcileFs(engagementId: string, data: any) { return this.post<Types.ApiResponse<any>>(`/completion/fs-reconciliation/${engagementId}`, data); }
  async getMisstatements(engagementId: string) { return this.get<Types.ApiResponse<any>>(`/completion/${engagementId}/misstatements`); }
  async getCompletionChecklist(engagementId: string) { return this.get<Types.ApiResponse<any>>(`/completion/${engagementId}/checklist`); }
  async issueOpinion(engagementId: string, data: any) { return this.post<Types.ApiResponse<any>>(`/completion/${engagementId}/opinion`, data); }
  async downloadAuditReport(engagementId: string) { 
    return this.client.get(`/completion/${engagementId}/report/download`, { 
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf'
      }
    }); 
  }
  async archiveEngagement(engagementId: string) { return this.post<Types.ApiResponse<any>>(`/completion/${engagementId}/archive`, {}); }


  // ==========================================
  // 8. WORKPAPERS
  // ==========================================

  // 1. Get all workpapers
  async getWorkpapers() { 
    return this.client.get('/workpapers'); 
  }

  // 2. Create work paper
  async createWorkpaper(data: any) { 
    return this.client.post('/workpapers', data); 
  }

  // 3. Get work paper by id
  async getWorkpaperById(wpId: string) { 
    return this.client.get(`/workpapers/${wpId}`); 
  }

  // 4. Update workpaper (PUT)
  async updateWorkpaper(wpId: string, data: any) { 
    return this.client.put(`/workpapers/${wpId}`, data); 
  }

  // 5. Delete work paper
  async deleteWorkpaper(wpId: string) { 
    return this.client.delete(`/workpapers/${wpId}`); 
  }

  // 6. Upload work paper document (FormData for PDF)
  async uploadWorkpaperDocument(wpId: string, formData: FormData) {
    return this.client.post(`/workpapers/${wpId}/documents`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data' 
      },
      // CRITICAL: This stops Axios from converting the PDF binary into a JSON string
      transformRequest: [(data) => data] 
    });
  }

  // 7. Review work paper (PUT)
  async reviewWorkpaper(wpId: string) { 
    return this.client.put(`/workpapers/${wpId}/review`, {}); 
  }

  // 8. Get work paper templates
  async getWorkpaperTemplates() { 
    return this.client.get('/workpapers/templates/list'); 
  }

  // ==========================================
  // 9. PBC (PROVIDED BY CLIENT) REQUESTS
  // ==========================================
  async getPbcRequests() { return this.client.get('/pbc-requests'); }
  async getPbcTemplates() { return this.client.get('/pbc-requests/templates/list'); }
  async createPbcRequest(data: any) { return this.client.post('/pbc-requests', data); }
  async getPbcRequestById(pbcId: string) { return this.client.get(`/pbc-requests/${pbcId}`); }
  async updatePbcRequest(pbcId: string, data: any) { return this.client.put(`/pbc-requests/${pbcId}`, data); }
  async completePbcRequest(pbcId: string) { return this.client.put(`/pbc-requests/${pbcId}/complete`, {}); }
  async deletePbcRequest(pbcId: string) { return this.client.delete(`/pbc-requests/${pbcId}`); }
  
  // ==========================================
  // 10. ENTITIES
  // ==========================================
  async getEntities() { return this.client.get('/entities'); }
  async createEntity(data: any) { return this.client.post('/entities', data); }
  async getEntityById(entityId: string) { return this.client.get(`/entities/${entityId}`); }
  async updateEntity(entityId: string, data: any) { return this.client.patch(`/entities/${entityId}`, data); }
  async deleteEntity(entityId: string) { return this.client.delete(`/entities/${entityId}`); }
  async getEntitiesByClient(clientId: string) { return this.client.get(`/entities/client/${clientId}`); }
  async getEntityEngagements(entityId: string) { return this.client.get(`/entities/${entityId}/engagements`); }

  // ==========================================
  // 11. USERS
  // ==========================================
  async getUsers() { return this.client.get('/users'); }
  async createUser(data: any) { return this.client.post('/users', data); }
  async getUserProfile() { return this.client.get('/users/profile'); }
  async getUserById(userId: string) { return this.client.get(`/users/${userId}`); }
  async updateUser(userId: string, data: any) { return this.client.patch(`/users/${userId}`, data); } 
  async deleteUser(userId: string) { return this.client.delete(`/users/${userId}`); }
  async toggleUserStatus(userId: string) { return this.client.put(`/users/${userId}/toggle-status`, {}); }
}

export const apiClient = new ApiClient();
export default apiClient;