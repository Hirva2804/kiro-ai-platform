import { Lead, Recommendation } from '@/types'

// Mock lead data with AI scoring
export const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    company: 'TechCorp Inc',
    role: 'VP of Sales',
    industry: 'SaaS',
    location: 'San Francisco, CA',
    source: 'LinkedIn',
    engagementScore: 85,
    aiScore: 92,
    conversionProbability: 87.5,
    category: 'hot',
    status: 'new',
    email: 'sarah.johnson@techcorp.com',
    phone: '+1-555-0123',
    predictedLifetimeValue: 125000,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Michael Chen',
    company: 'DataFlow Systems',
    role: 'CTO',
    industry: 'FinTech',
    location: 'New York, NY',
    source: 'Website',
    engagementScore: 72,
    aiScore: 78,
    conversionProbability: 65.2,
    category: 'warm',
    status: 'contacted',
    email: 'mchen@dataflow.com',
    predictedLifetimeValue: 89000,
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-16'),
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    company: 'Healthcare Plus',
    role: 'Director of Operations',
    industry: 'Healthcare',
    location: 'Austin, TX',
    source: 'Referral',
    engagementScore: 91,
    aiScore: 95,
    conversionProbability: 92.1,
    category: 'hot',
    status: 'qualified',
    email: 'e.rodriguez@healthcareplus.com',
    phone: '+1-555-0456',
    predictedLifetimeValue: 156000,
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-17'),
  },
  {
    id: '4',
    name: 'David Kim',
    company: 'Manufacturing Co',
    role: 'Plant Manager',
    industry: 'Manufacturing',
    location: 'Detroit, MI',
    source: 'Email Campaign',
    engagementScore: 45,
    aiScore: 42,
    conversionProbability: 28.7,
    category: 'cold',
    status: 'new',
    email: 'dkim@manufacturing.com',
    predictedLifetimeValue: 34000,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    company: 'RetailMax',
    role: 'Marketing Director',
    industry: 'Retail',
    location: 'Los Angeles, CA',
    source: 'LinkedIn',
    engagementScore: 68,
    aiScore: 71,
    conversionProbability: 58.9,
    category: 'warm',
    status: 'proposal',
    email: 'lthompson@retailmax.com',
    phone: '+1-555-0789',
    predictedLifetimeValue: 67000,
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-18'),
  },
]

export const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    leadId: '1',
    type: 'contact_priority',
    message: 'High-value SaaS lead with 87.5% conversion probability. Contact within 24 hours for optimal results.',
    priority: 'high',
    createdAt: new Date(),
  },
  {
    id: '2',
    leadId: '3',
    type: 'best_time',
    message: 'Healthcare sector contacts respond best on Tuesday-Thursday, 10-11 AM EST.',
    priority: 'medium',
    createdAt: new Date(),
  },
  {
    id: '3',
    leadId: '2',
    type: 'channel',
    message: 'FinTech CTOs prefer LinkedIn messages over cold calls. Try personalized connection request.',
    priority: 'medium',
    createdAt: new Date(),
  },
]

// AI scoring algorithm (simplified)
export function calculateAIScore(lead: Partial<Lead>): number {
  let score = 50 // Base score

  // Industry scoring
  const industryScores: Record<string, number> = {
    'SaaS': 20,
    'FinTech': 18,
    'Healthcare': 15,
    'Manufacturing': 8,
    'Retail': 12,
  }
  score += industryScores[lead.industry || ''] || 5

  // Role scoring
  if (lead.role?.includes('VP') || lead.role?.includes('Director')) score += 15
  if (lead.role?.includes('CTO') || lead.role?.includes('CEO')) score += 20
  if (lead.role?.includes('Manager')) score += 10

  // Source scoring
  const sourceScores: Record<string, number> = {
    'Referral': 15,
    'LinkedIn': 12,
    'Website': 10,
    'Email Campaign': 5,
  }
  score += sourceScores[lead.source || ''] || 3

  // Engagement scoring
  if (lead.engagementScore) {
    score += Math.floor(lead.engagementScore / 5)
  }

  return Math.min(Math.max(score, 0), 100)
}

export function getLeadCategory(aiScore: number): Lead['category'] {
  if (aiScore >= 80) return 'hot'
  if (aiScore >= 60) return 'warm'
  return 'cold'
}

export function getConversionProbability(aiScore: number): number {
  // Simplified conversion probability based on AI score
  return Math.min(aiScore * 0.9 + Math.random() * 10, 95)
}