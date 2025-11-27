// src/types/index.ts

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
  name?: string; // Optional fallback
  email: string;
  role?: string;
  isActive?: boolean; // Matches backend boolean
  status?: string;    // Deprecated string status (optional)
  createdAt?: string;
  updatedAt?: string;
  password?: string;
}

export interface Document {
  id: string;
  name: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  uploader?: {
    firstName: string;
    lastName: string;
  };
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

// --- Entity Types ---

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
  name: string;
  type: 'AUDIT' | 'REVIEW' | 'COMPILATION' | 'TAX' | 'ADVISORY';
  status: 'PLANNING' | 'FIELDWORK' | 'REVIEW' | 'COMPLETED' | 'ARCHIVED';
  description?: string;
  startDate?: string;
  endDate?: string;
  yearEnd?: string;
  clientId: string;
  entityId: string;
  budgetHours: number;
  actualHours?: number;
  createdAt?: string;
  updatedAt?: string;
  client?: { id: string; name: string };
  entity?: { id: string; name: string };
  creator?: { firstName: string; lastName: string; email: string };
}

export interface EngagementResponse {
  engagements: Engagement[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AssignUserDto {
  userId: string;
  role: string;
}

export interface EngagementTeamUser {
  id: string; // Assignment ID
  engagementId: string;
  userId: string;
  role: string;
  assignedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

// --- Workpaper Types ---

export interface Workpaper {
  id: string;
  engagementId: string;
  reference: string;
  title: string;
  description?: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'REVIEWED' | 'COMPLETED' | 'DRAFT';
  content?: any;
  assignedTo?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  // Relations
  engagement?: Engagement;
  documents?: Document[]; // Array of documents
  _count?: {
    documents: number;
  };
}

export interface WorkpaperTemplate {
  templateId: string;
  name: string;
  category: string;
  description?: string;
}

// --- Risk Assessment Types ---
// ... existing types ...

// --- Risk Assessment Types (Updated) ---

export interface RiskAssessment {
  id: string;
  engagementId: string;
  category: string;       // e.g. "REVENUE", "ASSETS"
  riskDescription: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  likelihood: 'LOW' | 'MEDIUM' | 'HIGH';
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  mitigationPlan?: string;
  assessedBy?: string;
  assessedAt?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Relations
  engagement?: {
    id?: string;
    name: string;
    client?: { name: string };
  };
}

export interface RiskMatrix {
  engagementId: string;
  matrix: {
    HIGH: { HIGH: RiskAssessment[]; MEDIUM: RiskAssessment[]; LOW: RiskAssessment[] };
    MEDIUM: { HIGH: RiskAssessment[]; MEDIUM: RiskAssessment[]; LOW: RiskAssessment[] };
    LOW: { HIGH: RiskAssessment[]; MEDIUM: RiskAssessment[]; LOW: RiskAssessment[] };
  };
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface RiskReport {
  engagement: {
    name: string;
    client: string;
    entity: string;
  };
  summary: {
    totalRisks: number;
    highRisks: number;
    categoriesAssessed: number;
  };
  risksByCategory: Record<string, RiskAssessment[]>;
  highPriorityRisks: RiskAssessment[];
  recommendations: {
    priority: string;
    message: string;
  }[];
  generatedAt: string;
  generatedBy: string;
}