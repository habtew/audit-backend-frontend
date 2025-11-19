// src/types.ts

// Generic API Response wrapper matches your backend structure
export interface ApiResponse<T> {
  data: T;
  message: string;
  timestamp: string;
  path: string;
}

// Login specific data structure
export interface LoginSuccessData {
  access_token: string;
  user: User;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
}

export interface User {
  id: string;
  name?: string;       
  firstName?: string;  
  lastName?: string;   
  email: string;
  role?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  password?: string; // Optional for forms
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

export interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  industry?: string;
  status?: 'active' | 'inactive'; // Matches your usage
  createdAt?: string;
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

export interface Activity {
  id: string;
  description: string;
  user?: string;
  timestamp?: string;
}

export interface Deadline {
  id: string;
  title: string;
  type?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface DashboardStats {
  totalClients: number;
  activeEngagements: number;
  pendingInvoices: number;
  totalRevenue: number;
  recentActivity: Activity[];
  upcomingDeadlines: Deadline[];
}