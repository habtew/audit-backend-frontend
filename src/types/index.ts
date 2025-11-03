
export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
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
  role: 'ADMIN' | 'USER';
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface Engagement {
  id: string;
  title: string;
  clientId: string;
  createdAt: string;
}

export interface RiskAssessment {
  id: string;
  title: string;
  description: string;
  engagementId: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  status: 'identified' | 'assessed' | 'mitigated' | 'closed';
  mitigation?: string;
  createdAt: string;
}