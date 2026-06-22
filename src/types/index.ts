// src/types/index.ts

// ==========================================
// ENUMS (Mapped from Prisma)
// ==========================================
export type PreEngagementStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
// Add this to src/types/index.ts (replacing the old UserRole)

export type UserRole = 
  | 'ASSOCIATE' // Prepares workpapers, runs procedures
  | 'SENIOR'    // Reviews associate work, handles complex sections
  | 'MANAGER'   // Engagement runner, reviews all work, proposes AJEs
  | 'PARTNER'   // Signs off on phases, generates opinion
  | 'EQCR'      // Engagement Quality Control Reviewer (read-only/review-only for high risk)
  | 'ADMIN';    // Firm setup, billing, user management
export type EngagementType = 'AUDIT' | 'REVIEW' | 'COMPILATION' | 'TAX' | 'ADVISORY';
export type EngagementStatus = 'PLANNING' | 'EXECUTION' | 'FIELDWORK' | 'REVIEW' | 'COMPLETED' | 'ARCHIVED';
export type DocumentType = 'TRIAL_BALANCE' | 'PBC_REQUEST' | 'WORKPAPER' | 'EVIDENCE' | 'REPORT' | 'CORRESPONDENCE';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TransactionType = 'DEBIT' | 'CREDIT';
export type OpinionType = 'UNMODIFIED' | 'QUALIFIED' | 'ADVERSE' | 'DISCLAIMER';
export type BasisType = 'MISSTATEMENT' | 'SCOPE_LIMITATION';
export type OpinionStatus = 'DRAFT' | 'FINAL';
export type ParagraphType = 'EMPHASIS_OF_MATTER' | 'OTHER_MATTER' | 'GOING_CONCERN';

// ==========================================
// CORE RESPONSES
// ==========================================
export interface ApiResponse<T> {
  data: T;
  message: string;
  timestamp: string;
  path: string;
}

export interface SuccessResponse { 
  message: string | { success: boolean };
}

// dashboard operations

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

export interface DashboardDeadline {
  id: string;
  name: string;
  client?: string;
  deadline: string;
  type: string;
  status: string;
}

export interface DashboardWorkload {
  user: {
    firstName: string;
    lastName: string;
    role: string;
  };
  activeEngagements: number;
  hoursThisWeek: number;
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

// ==========================================
// 0. CORE & FIRM MODELS
// ==========================================
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface ClientContact {
  id: string;
  clientId: string;
  name: string;
  position: string;
  email: string;
  isPrimary: boolean;
}

export interface Client {
  id: string;
  name: string;
  industry?: string;
  address?: string;
  principalPlaceOfBusiness?: string;
  countryOfIncorporation?: string;
  dateOfIncorporation?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  taxId?: string;
  shareholdersList?: string;
  isActive: boolean;
  contacts?: ClientContact[];
}

export interface Entity {
  id: string;
  name: string;
  type: string;
  taxId?: string;
  yearEnd: string;
  clientId: string;
  isActive: boolean;
}

export interface Engagement {
  id: string;
  name: string;
  type: EngagementType;
  status: EngagementStatus;
  description?: string;
  startDate: string;
  endDate: string;
  budgetHours?: number;
  actualHours: number;
  yearEnd: string;
  clientId: string;
  entityId?: string;
  preEngagementId?: string;
  overallMateriality?: number;
  performanceMateriality?: number;
  trivialThreshold?: number;
  isLocked: boolean;
  client?: Client;
  entity?: Entity;
}

// ==========================================
// 1. PRE-ENGAGEMENT PHASE (ISA 210/220)
// ==========================================
export interface PreEngagement {
  id: string;
  clientId: string;
  status: PreEngagementStatus;
  financialFramework: string;
  managementAcknowledged: boolean;
  engagementLetterUrl?: string;
  engagementLetterDate?: string;
  agreedFee?: number;
  currency?: string;
  termsAgreed: boolean;
  auditPeriodStart: string;
  auditPeriodEnd: string;
  integrityCheckResult?: string;
  competenceCheckResult?: string;
  ethicalConflictNotes?: string;
  approvedById?: string;
  complianceCheck?: ComplianceCheck;
}

export interface IndependenceDeclaration {
  id: string;
  preEngagementId: string;
  userId: string;
  isIndependent: boolean;
  threatsIdentified?: string;
  safeguardsApplied?: string;
  declaredAt: string;
}

export interface ComplianceCheck {
  id: string;
  preEngagementId: string;
  // Independence
  hasFinancialInterest: boolean;
  hasConflictOfInterests: boolean;
  independenceNotes?: string;
  independenceConclusion?: string;
  // Competence
  firmHasTechnicalExpertise: boolean;
  specialistsAvailable: boolean;
  timeConstraintsManageable: boolean;
  competenceNotes?: string;
  competenceConclusion?: string;
  // Integrity
  backgroundChecksClear: boolean;
  noKnownFraudOrDisputes: boolean;
  goodEthicalCulture: boolean;
  integrityNotes?: string;
  integrityConclusion?: string;
  // Predecessor
  clientGrantedPermission: boolean;
  predecessorCommunicated: boolean;
  predecessorNotes?: string;
  predecessorConclusion?: string;
  // Understanding
  operationsUnderstood: boolean;
  industryRisksAssessed: boolean;
  financialStabilityAssessed: boolean;
  understandingConclusion?: string;
  
  isAccepted: boolean;
}

// ==========================================
// 2. PLANNING & RISK PHASE
// ==========================================
export interface Materiality {
  id: string;
  engagementId: string;
  benchmark: string;
  benchmarkValue: number;
  rulePercentage: number;
  overallMateriality: number;
  performanceMateriality: number;
  trivialThreshold: number;
  rationale?: string;
  isFinal: boolean;
}

export interface EntityUnderstanding {
  id: string;
  engagementId: string;
  businessModel?: string;
  governanceStructure?: string;
  industryConditions?: string;
  regulatoryFramework?: string;
  itSystems?: string;
  internalControls?: string;
}

export interface SpecialAuditConsiderations {
  id: string;
  engagementId: string;
  lawsAndRegulations?: string;
  noclarIdentified: boolean;
  relatedParties?: string;
  unusualTransactions: boolean;
  goingConcernAssessment?: string;
  goingConcernDoubt: boolean;
  serviceOrganizations?: string;
  type2ReportAvailable: boolean;
}

export interface RiskAssessment {
  id: string;
  engagementId: string;
  riskDescription: string;
  category: string;
  accountArea: string;
  riskLevelType: string;
  isSignificant: boolean;
  isFraudRisk: boolean;
  assertion?: string;
  inherentRisk: string;
  controlRisk: string;
  detectionRisk: string;
  mitigationPlan?: string;
  status: string;
}

export interface FraudBrainstorming {
  id: string;
  engagementId: string;
  discussionDate: string;
  participants: string;
  fraudRisksIdentified?: string;
  managementOverride?: string;
  revenueFraudPresumption: boolean;
  revenueFraudRationale?: string;
  conclusion?: string;
  isFinal: boolean;
}

export interface AuditStrategy {
  id: string;
  engagementId: string;
  scope: string;
  timing: string;
  direction: string;
  significantChanges?: string;
  resources?: string;
  useOfExperts: boolean;
  relianceOnControls: boolean;
  itEnvironmentConsidered: boolean;
  financialStatementLevelRisks?: string;
  significantRiskSummary?: string;
  status: string;
}

// ==========================================
// 3. DATA ACQUISITION & TB
// ==========================================
export interface TrialBalance {
  id: string;
  engagementId: string;
  period: string;
  version: number;
  description?: string;
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
}

export interface Account {
  id: string;
  trialBalanceId: string;
  accountNumber: string;
  accountName: string;
  accountType: string;
  debitAmount?: number;
  creditAmount?: number;
  balance: number;
  adjustedDebit?: number;
  adjustedCredit?: number;
  adjustedBalance?: number;
  isAdjusted: boolean;
}

export interface AccountMapping {
  id: string;
  trialBalanceId: string;
  accountId: string;
  mappedCategory: string;
  mappedSubcategory?: string;
  confidence: number;
  isManual: boolean;
}

export interface Transaction {
  id: string;
  accountId: string;
  date: string;
  description: string;
  type: TransactionType;
  amount: number;
  reference?: string;
  isReconciled: boolean;
}

// ==========================================
// 4. EXECUTION PHASE (ISA 330, 500, 520, 530)
// ==========================================
export interface AuditProcedure {
  id: string;
  engagementId: string;
  riskId?: string;
  refNumber: string;
  procedureText: string;
  auditorResponse?: string;
  accountArea: string;
  assertion: string;
  procedureType: string;
  evidenceMethod: string;
  samplingMethod?: string;
  sampleSize?: number;
  populationSize?: number;
  samplingJustification?: string;
  status: string;
  priority: string;
  exceptionsFound: boolean;
  assignedToId?: string;
  preparedById?: string;
  reviewedById?: string;
}

export interface AuditEvidence {
  id: string;
  procedureId: string;
  fileUrl: string;
  fileName: string;
  evidenceType: string;
  uploadedById: string;
  uploadedAt: string;
}

export interface ReviewNote {
  id: string;
  procedureId: string;
  note: string;
  status: 'OPEN' | 'CLEARED';
  createdById: string;
  resolvedById?: string;
}

export interface AssertionCoverage {
  id: string;
  engagementId: string;
  accountArea: string;
  assertion: string;
  isCovered: boolean;
  coveredByProcId?: string;
}

export interface AuditException {
  id: string;
  procedureId: string;
  description: string;
  financialImpact?: number;
  isMaterial: boolean;
  resolutionType: string;
  resolutionReason?: string;
}

export interface ProposedAJE {
  id: string;
  exceptionId: string;
  debitAccountId: string;
  creditAccountId: string;
  amount: number;
  description: string;
  status: string;
  rejectionReason?: string;
}

export interface AnalyticalProcedure {
  id: string;
  procedureId: string;
  analyticalType: string;
  expectationBasis: string;
  expectedAmount: number;
  actualAmount: number;
  varianceThreshold: number;
  varianceAmount: number;
  isVarianceBreached: boolean;
  isMaterialVariance: boolean;
  managementExplanation?: string;
  auditorCorroboration?: string;
  requiresSubstantiveTest: boolean;
  followUpProcedureId?: string;
}

// ==========================================
// 5. COMPLETION & REPORTING (ISA 450, 700, 701)
// ==========================================
export interface Adjustment {
  id: string;
  accountId: string;
  proposedAjeId?: string;
  amount: number;
  type: string;
  description: string;
  postedById: string;
}

export interface FinancialStatement {
  id: string;
  engagementId: string;
  lineItem: string;
  amount: number;
  source: string;
}

export interface FSReconciliation {
  id: string;
  engagementId: string;
  fsLineItem: string;
  tbAccountArea: string;
  fsAmount: number;
  tbAmount: number;
  difference: number;
  isReconciled: boolean;
  explanation?: string;
}

export interface AuditSummary {
  id: string;
  engagementId: string;
  totalMisstatements: number;
  correctedAmount: number;
  uncorrectedAmount: number;
  materiality: number;
  performanceMateriality: number;
  isMaterialBreached: boolean;
}

export interface Opinion {
  id: string;
  engagementId: string;
  opinionType: OpinionType;
  basisType?: BasisType;
  customBasisText?: string;
  templateVersion: string;
  generatedContent: any;
  status: OpinionStatus;
  isLocked: boolean;
  paragraphs?: OpinionParagraph[];
  keyAuditMatters?: KeyAuditMatter[];
}

export interface OpinionParagraph {
  id: string;
  opinionId: string;
  type: ParagraphType;
  content: string;
}

export interface KeyAuditMatter {
  id: string;
  opinionId: string;
  title: string;
  description: string;
  auditResponse: string;
  order: number;
}

export interface CompletionChecklist {
  id: string;
  engagementId: string;
  assertionsCovered: boolean;
  reviewNotesCleared: boolean;
  evidenceComplete: boolean;
  fsReconciled: boolean;
  ajesPosted: boolean;
  isReadyForOpinion: boolean;
}

// ==========================================
// FIRM ANALYTICS TYPES
// ==========================================
export interface AnalyticsEngagements {
  totalEngagements: number;
  engagementsByStatus: Record<string, number>;
  engagementsByType: Record<string, number>;
  averageHours: number;
}

export interface AnalyticsBillingHours {
  totalHours: number;
  totalBillableAmount: number;
  dailyBreakdown: any[];
}

export interface AnalyticsRisk {
  totalRisks: number;
  risksByLevel: Record<string, number>;
  risksByCategory: Record<string, number>;
}

export interface PartnerAttentionItem {
  engagementId: string;
  clientName: string;
  status: string;
  dueDate: string;
  isOverdue: boolean;
  hasMaterialExceptions: boolean;
  pendingExceptions: number;
  unadjustedMisstatements: number;
}

export interface AnalyticsPartnerDashboard {
  overview: {
    totalActiveEngagements: number;
    firmWideUncorrectedMisstatements: number;
    pipeline: Record<string, number>;
  };
  attentionRequired: PartnerAttentionItem[];
}

export interface AnalyticsEngagementProgress {
  engagement: {
    id: string; name: string; status: string; budgetHours: number | null; actualHours: number;
  };
  progress: {
    workpapers: { completed: number; total: number; percentage: number; };
    pbc: { completed: number; total: number; percentage: number; };
    overall: { percentage: number; };
  };
  counts: { workpapers: number; pbcRequests: number; documents: number; };
}