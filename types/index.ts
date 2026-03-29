export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'sales_manager' | 'sales_executive';
  createdAt: Date;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  role: string;
  industry: string;
  location: string;
  source: string;
  engagementScore: number;
  aiScore: number;
  conversionProbability: number;
  category: 'hot' | 'warm' | 'cold';
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'converted' | 'lost' | 'archived';
  email?: string;
  phone?: string;
  notes?: string;
  predictedLifetimeValue?: number;
  intentLevel?: 'low' | 'medium' | 'high';
  pageVisits?: Array<{ page: string; timeSpent: number; scrollDepth: number; timestamp: Date }>;
  isPinned?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  type: 'email_open' | 'call' | 'meeting' | 'note' | 'status_change';
  description: string;
  createdAt: Date;
  userId: string;
}

export interface Recommendation {
  id: string;
  leadId: string;
  type: 'contact_priority' | 'best_time' | 'channel' | 'follow_up';
  message: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
}

export interface DashboardStats {
  totalLeads: number;
  highValueLeads: number;
  conversionRate: number;
  pipelineValue: number;
  sourcePerformance: Array<{
    source: string;
    count: number;
    conversionRate: number;
  }>;
}