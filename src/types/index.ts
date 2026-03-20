// src/types/index.ts

// --- Generic API Response ---
export interface ApiResponse<T> {
  data: T;
  message: string;
  timestamp: string;
  path: string;
}

export interface SuccessResponse { 
  message: string | { success: boolean };
}

// --- Auth Types ---
export interface LoginSuccessData {
  access_token: string;
  user: User;
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

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string; // Fallback
  email: string;
  role?: string;
  isActive?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  password?: string;
}

// --- Common Types ---
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

// --- Client & Entity Types ---
export interface Client {
  id: string;
  name: string;
  contactPerson?: string;
  company?: string;
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

// --- Pre-Engagement & Planning Types (NEW) ---

export interface PreEngagement {
  id: string;
  clientId: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  financialFramework: string;
  auditPeriodStart: string;
  auditPeriodEnd: string;
  integrityCheckResult?: string;
  competenceCheckResult?: string;
  ethicalConflictNotes?: string;
  termsAgreed?: boolean;
  agreedFee?: number | string;
  currency?: string;
  engagementLetterUrl?: string;
  managementAcknowledged?: boolean;
  createdById?: string;
  approvedById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Materiality {
  id: string;
  engagementId: string;
  benchmark: string;
  benchmarkValue: number | string;
  rulePercentage: number | string;
  overallMateriality: number | string;
  performanceMateriality: number | string;
  trivialThreshold: number | string;
  rationale: string;
  isFinal: boolean;
  approvedById?: string;
  createdAt: string;
}

export interface AuditStrategy {
  id: string;
  engagementId: string;
  scope: string;
  timing: string;
  direction: string;
  significantChanges?: string;
  resources: string;
  useOfExperts: boolean;
  relianceOnControls: boolean;
  itEnvironmentConsidered: boolean;
  financialStatementLevelRisks?: string;
  significantRiskSummary?: string;
  status: 'DRAFT' | 'FINAL';
  approvedById?: string;
  createdAt: string;
}

export interface FraudBrainstorming {
  id: string;
  engagementId: string;
  discussionDate: string;
  participants: string;
  fraudRisksIdentified: string;
  managementOverride: string;
  revenueFraudPresumption: boolean;
  revenueFraudRationale?: string; // If presumption rejected
  conclusion: string;
  isFinal: boolean;
  approvedById?: string;
  createdAt: string;
}

// Enhanced Risk Type for Planning Phase
export interface PlanningRisk {
  id: string;
  engagementId: string;
  riskDescription: string;
  category: 'FRAUD' | 'ERROR' | 'SIGNIFICANT' | 'OTHER';
  accountArea: string;
  riskLevelType: 'FINANCIAL_STATEMENT_LEVEL' | 'ASSERTION_LEVEL';
  assertion?: 'EXISTENCE' | 'RIGHTS_OBLIGATIONS' | 'COMPLETENESS' | 'ACCURACY_VALUATION' | 'CLASSIFICATION' | 'PRESENTATION';
  inherentRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  controlRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  detectionRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  isSignificant: boolean;
  isFraudRisk: boolean;
  mitigationPlan: string;
  status: 'DRAFT' | 'FINAL';
  assessedBy?: string;
  createdAt: string;
}

// --- Engagement Types ---
export interface Engagement {
  id: string;
  name: string;
  type: 'AUDIT' | 'REVIEW' | 'COMPILATION' | 'TAX' | 'ADVISORY';
  // Updated status to include EXECUTION based on new backend
  status: 'PLANNING' | 'EXECUTION' | 'FIELDWORK' | 'REVIEW' | 'COMPLETED' | 'ARCHIVED'; 
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
  // New Links
  preEngagementId?: string;
  preEngagement?: PreEngagement;
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
  id: string;
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
  engagement?: Engagement;
  documents?: Document[];
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

// --- Risk Assessment Types (Legacy/Simple) ---
export interface RiskAssessment {
  id: string;
  engagementId: string;
  category: string;
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

// --- Trial Balance Types ---
export interface TrialBalanceSummaryData {
  totalAccounts: number;
  totalDebits: number | string;
  totalCredits: number | string;
  isBalanced: boolean;
  accountTypes: Record<string, number>;
}

export interface TrialBalance {
  id: string;
  engagementId: string;
  period: string; // ISO String
  version: number;
  description?: string;
  totalDebits: string | number;  // API returns string "0"
  totalCredits: string | number; // API returns string "0"
  isBalanced: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  engagement?: {
    name: string;
    client?: { name: string };
  };
  accounts?: TrialBalanceAccount[];
  mappings?: any[]; // Placeholder for mappings
  _count?: {
    accounts: number;
  };
}

export interface TrialBalanceAccount {
  id: string;
  trialBalanceId: string;
  accountNumber: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
  balance: number;
  category?: string;
  subCategory?: string;
  isMapped: boolean;
  mappings?: any[];
}

export interface AdjustmentPayload {
  description: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  adjustmentType?: 'CORRECTION' | 'RECLASSIFICATION' | 'PROPOSED';
}

export interface ComparisonResult {
  accountNumber: string;
  accountName: string;
  currentBalance: number;
  previousBalance: number;
  variance: number;
  variancePercentage: number;
}

export interface UpdateAccountPayload {
  accountName?: string;
  category?: string;
  subCategory?: string;
  note?: string;
}

// --- Billing Types ---
export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export interface InvoiceItem {
  id?: string;
  invoiceId?: string;
  description: string;
  quantity: number;
  rate: number | string;
  amount: number | string;
}

export interface Invoice {
  id: string;
  clientId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus | string;
  
  // API returns strings for amounts
  subtotal: string | number;
  tax: string | number;      // Changed from taxAmount
  total: string | number;    // Changed from totalAmount
  
  paidAt?: string | null;
  notes?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  
  // API uses invoiceItems instead of items
  invoiceItems: InvoiceItem[];
  
  client?: {
    id: string;
    name: string;
    email?: string;
    address?: string;
  };
  engagement?: {
    id: string;
    name: string;
    title?: string;
  };
}

export interface CreateInvoicePayload {
  clientId: string;
  engagementId?: string;
  issueDate: string;
  dueDate: string;
  notes?: string;
  taxRate?: number;
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
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
  status: BillableHourStatus;
  isBilled?: boolean; // Can derive from status === INVOICED
  isBillable?: boolean;
  user?: { name?: string; firstName?: string; lastName?: string };
  engagement?: { name: string; title?: string; client: { name: string } };
}

export enum BillableHourStatus { PENDING = 'PENDING', APPROVED = 'APPROVED', REJECTED = 'REJECTED', INVOICED = 'INVOICED' }

export interface CreateInvoicePayload {
  clientId: string;
  engagementId?: string;
  issueDate: string;
  dueDate: string;
  items: Array<{ description: string; quantity: number; rate: number }>;
  notes?: string;
}

export interface CreateInvoiceDto extends CreateInvoicePayload {} 

export interface CreateTimeEntryPayload {
  engagementId: string;
  description: string;
  date: string;
  hours: number;
  isBillable?: boolean;
}

// --- Analytics Types ---
export interface AnalyticsDateParams {
  startDate?: string;
  endDate?: string;
  engagementId?: string;
  userId?: string;
  clientId?: string; // Added clientId
}

export interface EngagementAnalytics {
  totalEngagements: number;
  engagementsByStatus: Record<string, number>;
  engagementsByType: Record<string, number>;
  averageHours: number;
}

export interface UserPerformanceMetric {
  user: {
    firstName: string;
    lastName: string;
    role: string;
  };
  totalHours: number;
  entriesCount: number;
}

export interface BillingAnalytics {
  totalHours: number;
  totalBillableAmount: string | number;
  dailyBreakdown: Array<{
    _sum: {
      hours: number;
    };
    date: string;
  }>;
}

export interface RiskAnalytics {
  totalRisks: number;
  risksByLevel: Record<string, number>;
  risksByCategory: Record<string, number>;
}

export interface EngagementProgress {
  engagement: {
    id: string;
    name: string;
    status: string;
    budgetHours: number;
    actualHours: number;
  };
  progress: {
    workpapers: { completed: number; total: number; percentage: number };
    pbc: { completed: number; total: number; percentage: number };
    overall: { percentage: number };
  };
  counts: {
    workpapers: number;
    pbcRequests: number;
    documents: number;
  };
}

export interface ReportTemplate {
  id: string;
  code: string;
  name: string;
  description: string;
  supportedFormats: string[];
}

export interface ReportHistory {
  id: string;
  templateName: string;
  generatedBy: string;
  generatedAt: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  downloadUrl?: string;
}

// --- Compliance ---
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

// --- PBC Requests ---
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


export interface ClientResponse {
  clients: Client[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}