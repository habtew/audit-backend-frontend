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

// trial balancce

export interface TrialBalance {
  id: string;
  engagementId: string;
  period: string; // ISO Date
  description?: string;
  status: 'DRAFT' | 'IMPORTED' | 'MAPPED' | 'REVIEWED' | 'FINAL';
  totalDebit: number;
  totalCredit: number;
  createdAt: string;
  updatedAt: string;
  engagement?: {
    name: string;
    client: { name: string };
  };
  accounts?: TrialBalanceAccount[];
  _count?: {
    accounts: number;
  };
}

export interface TrialBalanceAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
  balance: number;
  category?: string;
  subCategory?: string;
  isMapped: boolean;
  mappings?: any[]; // Define specific mapping type if needed
}

export interface ImportTrialBalancePayload {
  file: File;
  engagementId: string;
  period: string;
  description?: string;
}

export interface UpdateAccountPayload {
  accountName?: string;
  category?: string;
  subCategory?: string;
  note?: string;
}


// inovice types
export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  engagementId?: string;
  issueDate: string;
  dueDate: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  items: InvoiceItem[];
  client?: { name: string; email: string };
  engagement?: { name: string };
  createdAt: string;
}

export interface BillableHour {
  id: string;
  userId: string;
  engagementId: string;
  taskId?: string;
  description: string;
  date: string;
  hours: number;
  rate: number;
  amount: number;
  isBilled: boolean;
  user?: { name: string };
  engagement?: { name: string; client: { name: string } };
}

export interface CreateInvoicePayload {
  clientId: string;
  engagementId?: string;
  issueDate: string;
  dueDate: string;
  items: Array<{ description: string; quantity: number; rate: number }>;
}

export interface GenerateInvoicePayload {
  engagementId: string;
  issueDate: string;
  dueDate: string;
}

export interface CreateTimeEntryPayload {
  engagementId: string;
  description: string;
  date: string;
  hours: number;
}


// --- Core Analytics Types ---

export interface AnalyticsDateParams {
  startDate?: string;
  endDate?: string;
  engagementId?: string;
  userId?: string;
}

export interface EngagementAnalytics {
  totalEngagements: number;
  completedEngagements: number;
  activeEngagements: number;
  averageDurationDays: number;
  statusDistribution: Record<string, number>;
  engagementsOverTime: Array<{ date: string; count: number }>;
}

export interface UserPerformanceMetrics {
  userId: string;
  userName: string;
  tasksCompleted: number;
  tasksOverdue: number;
  averageCompletionTimeHours: number;
  efficiencyScore: number; // e.g., 0-100
}

export interface BillingAnalytics {
  totalBillableHours: number;
  totalNonBillableHours: number;
  billableAmount: number;
  utilizationRate: number; // percentage
  breakdownByEngagement: Array<{ engagementName: string; hours: number; amount: number }>;
}

export interface EngagementProgress {
  engagementId: string;
  percentageComplete: number;
  completedTasks: number;
  totalTasks: number;
  remainingTasks: number;
  expectedCompletionDate: string;
  status: string;
}

export interface RiskAnalytics {
  totalRisks: number;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
  riskHeatmapData: Array<{ impact: string; likelihood: string; count: number }>;
  topRiskAreas: Array<{ category: string; count: number }>;
}


// --- Analytics & Reporting Types ---

export interface EngagementAnalytics {
  total: number;
  active: number;
  completed: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  averageDurationDays: number;
}

export interface UserPerformanceMetric {
  userId: string;
  userName: string;
  assignedEngagements: number;
  completedWorkpapers: number;
  billableHours: number;
}

export interface RiskAnalytics {
  totalRisks: number;
  byLevel: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  topRisks: Array<{
    id: string;
    title: string;
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    likelihood: number;
    impact: number;
  }>;
}

export interface BillingAnalytics {
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  utilizationRate: number;
  revenueByClient: Array<{ clientName: string; amount: number }>;
}

export interface ReportTemplate {
  id: string;
  code: string;
  name: string;
  description: string;
  supportedFormats: string[]; // e.g. ['PDF', 'EXCEL']
}

export interface ReportHistory {
  id: string;
  templateName: string;
  generatedBy: string;
  generatedAt: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  downloadUrl?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userEmail: string;
  timestamp: string;
  details: any;
}

export interface UserAccessLog {
  userId: string;
  userName: string;
  role: string;
  lastLogin: string;
  status: 'ACTIVE' | 'INACTIVE';
}


// billing types
// src/types/billing.ts

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export enum BillableHourStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  INVOICED = 'INVOICED'
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  engagementId: string;
  clientId: string;
  amount: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  client?: {
    name: string;
    email: string;
  };
  engagement?: {
    title: string;
  };
}

export interface BillableHour {
  id: string;
  userId: string;
  engagementId: string;
  hours: number;
  rate: number;
  amount: number;
  description: string;
  date: string;
  status: BillableHourStatus;
  isBillable: boolean;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
  };
  engagement?: {
    title: string;
    client: {
      name: string;
    };
  };
}

// --- DTOs ---

export interface CreateInvoiceDto {
  engagementId: string;
  items: Omit<InvoiceItem, 'amount'>[]; // Amount is usually calculated backend, but structure depends on logic
  dueDate: string;
  notes?: string;
}

export interface UpdateInvoiceDto {
  status?: InvoiceStatus;
  items?: InvoiceItem[];
  notes?: string;
  dueDate?: string;
}

export interface QueryInvoicesDto {
  page?: number;
  limit?: number;
  clientId?: string;
  status?: InvoiceStatus;
  startDate?: string;
  endDate?: string;
}

export interface CreateTimeEntryDto {
  engagementId: string;
  hours: number;
  description: string;
  date: string;
  isBillable?: boolean;
}

export interface BulkTimeEntryDto {
  entries: CreateTimeEntryDto[];
}

export interface QueryBillableHoursDto {
  page?: number;
  limit?: number;
  userId?: string;
  engagementId?: string;
  startDate?: string;
  endDate?: string;
  status?: BillableHourStatus;
}

// pbc
// src/types/pbc.ts

export enum PBCStatus {
  OPEN = 'OPEN',
  SUBMITTED = 'SUBMITTED',
  REVIEWED = 'REVIEWED',
  RETURNED = 'RETURNED'
}

export interface PBCRequest {
  id: string;
  engagementId: string;
  title: string;
  description?: string;
  dueDate: string;
  status: PBCStatus;
  assigneeId?: string;
  files: Array<{ 
    id: string; 
    url: string; 
    originalName: string; 
    uploadedAt: string 
  }>;
  createdAt: string;
  updatedAt: string;
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreatePBCRequestDto {
  engagementId: string;
  title: string;
  description?: string;
  dueDate: string;
  assigneeId?: string;
}

export interface UpdatePBCRequestDto {
  status?: PBCStatus;
  assigneeId?: string;
  comments?: string;
}