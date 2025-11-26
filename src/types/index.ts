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

// --- Client Types ---

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
  isActive?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

// --- Entity Types (NEW) ---

export interface Entity {
  id: string;
  name: string;
  type: string;
  taxId?: string;
  yearEnd?: string; // ISO Date string
  clientId: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// --- Engagement Types (UPDATED) ---

export interface Engagement {
  id: string;
  title: string; // or 'name' depending on API consistency
  name?: string; // Handling both potential API fields
  clientId: string;
  entityId?: string;
  status: string; // 'PLANNING' | 'FIELDWORK' | 'REVIEW' | 'COMPLETED' | 'ARCHIVED'
  type?: string; // 'AUDIT' | 'REVIEW' | 'COMPILATION' | 'TAX' | 'ADVISORY'
  startDate?: string;
  endDate?: string;
  budget?: number;
  budgetHours?: number;
  actualCost?: number;
  description?: string;
  createdAt?: string;
}

export interface AssignUserDto {
  userId: string;
  role: string;
}

export interface EngagementTeamUser {
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
}

// --- Workpaper Types (NEW) ---

export interface Workpaper {
  id: string;
  engagementId: string;
  reference: string;
  title: string;
  description?: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'REVIEWED' | 'COMPLETED';
  content?: any; // Flexible JSON content (OrderedMap etc.)
  assignedTo?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkpaperTemplate {
  templateId: string;
  name: string;
  category: string;
}

// --- Risk Assessment Types ---

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
// export interface AuthResponse {
//   token: string;
//   refreshToken: string;
//   user: User;
// }

// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: 'ADMIN' | 'USER';
//   status: 'ACTIVE' | 'INACTIVE';
//   createdAt: string;
//   password?: string;
// }

// export interface LoginCredentials {
//   email: string;
//   password: string;
// }

// export interface RegisterData {
//   name: string;
//   email: string;
//   password: string;
//   role: 'ADMIN' | 'USER';
// }

// export interface Client {
//   id: string;
//   name: string;
//   email: string;
//   phone: string;
//   company: string;
//   status: 'ACTIVE' | 'INACTIVE';
//   createdAt: string;
// }

// export interface Engagement {
//   id: string;
//   title: string;
//   clientId: string;
//   createdAt: string;
// }

// export interface RiskAssessment {
//   id: string;
//   title: string;
//   description: string;
//   engagementId: string;
//   riskLevel: 'low' | 'medium' | 'high' | 'critical';
//   likelihood: 'low' | 'medium' | 'high';
//   impact: 'low' | 'medium' | 'high';
//   status: 'identified' | 'assessed' | 'mitigated' | 'closed';
//   mitigation?: string;
//   createdAt: string;
// }