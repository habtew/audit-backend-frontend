// src/types.ts

export interface ApiResponse<T> {
  data: T;
  message: string;
  timestamp: string;
  path: string;
}

export interface LoginSuccessData {
  access_token: string;
  user: User;
}

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string; 
  email: string;
  role?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  password?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

// --- Dashboard Types ---
export interface DashboardOverview {
  engagements: { total: number; active: number; completed: number; };
  clients: { total: number; };
  workload: { pendingPBCs: number; overdueWorkpapers: number; };
  billing: { totalUnbilledHours: number; unbilledAmount: number; };
}

export interface DashboardActivity {
  id: string;
  action: string;
  entityType: string;
  user: string;
  timestamp: string;
  description: string;
}

export interface DashboardDeadlines {
  engagements: any[];
  pbcRequests: any[];
}

export interface DashboardKPIs {
  period: { start: string; end: string; };
  kpis: {
    newEngagements: number;
    completedEngagements: number;
    avgEngagementDuration: number;
    clientSatisfaction: number;
    revenueGenerated: number;
    utilizationRate: number;
  };
}

export interface DashboardWorkload {
  user: { firstName: string; lastName: string; role: string; };
  activeEngagements: number;
  hoursThisWeek: number;
}

// --- Entity Types ---

export interface Client {
  id: string;
  name: string; // Company Name
  contactPerson?: string;
  company?: string; // Optional fallback
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  industry?: string;
  isActive?: boolean; // Important for toggle
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Engagement {
  id: string;
  title: string;
  clientId: string;
  status: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  actualCost?: number;
  description?: string;
  createdAt?: string;
}

export interface RiskAssessment {
  id: string;
  title: string;
  engagementId: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'identified' | 'assessed' | 'mitigated' | 'closed';
  likelihood?: 'low' | 'medium' | 'high';
  impact?: 'low' | 'medium' | 'high';
  mitigation?: string;
  description: string;
  createdAt?: string;
}

export interface AdjustmentPayload {
  description: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  adjustmentType: 'RECLASSIFICATION' | 'CORRECTION' | 'PROPOSED';
}

export interface Adjustment {
  id: string;
  description: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  createdAt: string;
}

// --- Comparison ---
export interface ComparisonResult {
  accountId: string;
  accountName: string;
  accountNumber: string;
  currentAmount: number;
  previousAmount: number;
  variance: number;
  percentageChange: number;
}

// --- Import History ---
export interface ImportHistory {
  id: string;
  fileName: string;
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  recordCount: number;
  importedAt: string;
  importedBy: string;
}

// --- Validation ---
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  previewData?: any[];
}

export interface ManualTrialBalancePayload {
  engagementId: string;
  period: string;
  description?: string;
  name: string;
}