// ✅ Authentication related types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role?: string; // optional user role for admins or staff
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
}


export interface Activity {
  id: string;
  description: string;
  user?: string; // user name or id
  timestamp?: string; // ISO date string
  // optional other fields
}

export interface Deadline {
  id: string;
  title: string;
  type?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string; // ISO date string
  // optional other fields
}

export interface DashboardStats {
  totalClients: number;
  activeEngagements: number;
  pendingInvoices: number;
  totalRevenue: number;
  recentActivity: Activity[];      // matches getRecentActivity
  upcomingDeadlines: Deadline[];   // matches getUpcomingDeadlines
  lastUpdated?: string;
}


// ✅ User type
export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
  password?: string;

  // Optional nested data (for APIs that wrap responses)
  data?: {
    id: string;
    name: string;
    email: string;
    role?: string;
    status?: 'active' | 'inactive';
    createdAt?: string;
    updatedAt?: string;
  };
}

// ✅ Client type (for your app’s client list)
export interface Client {
  company: any;
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  industry?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: 'active' | 'inactive';
}


// ✅ Risk Assessment type (for audit/risk modules)
export interface RiskAssessment {
  id: string;
  clientId: string;
  title: string;
  riskLevel: "high" | "medium" | "low" | "critical";
  engagementId: string;
  score?: number;
  category?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  description: string;
  likelihood: "high" | "medium" | "low";
  impact: "high" | "medium" | "low";
  status: "identified" | "mitigated" | "assessed" | "closed";
  mitigation?: string;
}

// ✅ Engagement type (for client engagements / audit work)
export interface Engagement {
  id: string;
  clientId: string;
  title: string;
  description?: string;
  type?: string;
  startDate: string;
  endDate?: string;
  budget?: number;
  actualCost?: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  assignedTo?: string; // user ID or team
  createdAt?: string;
  updatedAt?: string;
  riskAssessment?: RiskAssessment;
}

// ✅ Generic API response
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

