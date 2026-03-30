/**
 * Data layer — tries Supabase first, falls back to mock data.
 * Pages import from here, never directly from lib/leads or supabase.
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — Supabase generic types are resolved at runtime; suppress stale inference errors
import { Lead, LeadActivity, Recommendation, DashboardStats } from '@/types'
import { mockLeads, mockRecommendations } from '@/lib/leads'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// True only when real keys are present (not placeholder text)
export const isSupabaseConfigured =
  SUPABASE_URL.startsWith('https://') && SUPABASE_KEY.length > 20

// ─── Leads ────────────────────────────────────────────────────────────────────

export async function getLeads(filters?: {
  category?: string
  status?: string
  search?: string
}): Promise<Lead[]> {
  if (isSupabaseConfigured) {
    try {
      const { supabase } = await import('@/lib/supabase')
      let query = supabase
        .from('leads')
        .select('*')
        .order('ai_score', { ascending: false })

      if (filters?.category && filters.category !== 'all')
        query = query.eq('category', filters.category)
      if (filters?.status && filters.status !== 'all')
        query = query.eq('status', filters.status)
      if (filters?.search)
        query = query.or(
          `name.ilike.%${filters.search}%,company.ilike.%${filters.search}%,industry.ilike.%${filters.search}%`
        )

      const { data, error } = await query
      if (error) throw error
      return (data || []).map(rowToLead)
    } catch (e) {
      console.warn('[data] Supabase getLeads failed, using mock:', e)
    }
  }

  let leads = [...mockLeads]
  if (filters?.category && filters.category !== 'all')
    leads = leads.filter(l => l.category === filters.category)
  if (filters?.status && filters.status !== 'all')
    leads = leads.filter(l => l.status === filters.status)
  if (filters?.search) {
    const s = filters.search.toLowerCase()
    leads = leads.filter(
      l =>
        l.name.toLowerCase().includes(s) ||
        l.company.toLowerCase().includes(s) ||
        l.industry.toLowerCase().includes(s)
    )
  }
  return leads.sort((a, b) => b.aiScore - a.aiScore)
}

export async function getLeadById(id: string): Promise<Lead | null> {
  if (isSupabaseConfigured) {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data ? rowToLead(data) : null
    } catch (e) {
      console.warn('[data] Supabase getLeadById failed, using mock:', e)
    }
  }
  return mockLeads.find(l => l.id === id) || null
}

export async function createLead(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
  // When called from the browser, do inserts via a server route so we can use the service role key safely.
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/leads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to create lead')
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      } as Lead
    } catch (e: any) {
      // Surface the error to the UI so it doesn't "succeed" with mock data.
      console.warn('[data] Browser createLead failed:', e)
      throw e
    }
  }

  if (isSupabaseConfigured) {
    try {
      const { supabaseAdmin } = await import('@/lib/supabase')

      const demoUserId = '00000000-0000-0000-0000-000000000001'
      await supabaseAdmin
        .from('users')
        .upsert(
          {
            id: demoUserId,
            email: 'hirvraj.gohil@gmail.com',
            name: 'Hirvraj Gohil',
            role: 'admin',
          },
          { onConflict: 'id' }
        )

      const { data, error } = await supabaseAdmin
        .from('leads')
        .insert({
          name: lead.name,
          company: lead.company,
          role: lead.role,
          industry: lead.industry,
          location: lead.location,
          source: lead.source,
          engagement_score: lead.engagementScore,
          ai_score: lead.aiScore,
          conversion_probability: lead.conversionProbability,
          category: lead.category,
          status: lead.status,
          email: lead.email,
          phone: lead.phone,
          notes: lead.notes,
          predicted_lifetime_value: lead.predictedLifetimeValue,
          intent_level: lead.intentLevel,
          assigned_to: lead.assigned_to,
          tags: lead.tags,
          custom_fields: lead.custom_fields,
          created_by: demoUserId,
        })
        .select()
        .single()

      if (error) throw error
      return rowToLead(data)
    } catch (e) {
      console.warn('[data] Supabase createLead failed:', e)
      throw e
    }
  }

  // Mock fallback only when Supabase isn't configured at all.
  const now = new Date()
  return { ...lead, id: `mock-${Date.now()}`, createdAt: now, updatedAt: now }
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
  if (isSupabaseConfigured) {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('leads')
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.status && { status: updates.status }),
          ...(updates.category && { category: updates.category }),
          ...(updates.aiScore !== undefined && { ai_score: updates.aiScore }),
          ...(updates.notes !== undefined && { notes: updates.notes }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return rowToLead(data)
    } catch (e) {
      console.warn('[data] Supabase updateLead failed:', e)
    }
  }
  const lead = mockLeads.find(l => l.id === id)
  return lead ? { ...lead, ...updates, updatedAt: new Date() } : null
}

export async function deleteLead(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase.from('leads').delete().eq('id', id)
      if (error) throw error
      return
    } catch (e) {
      console.warn('[data] Supabase deleteLead failed:', e)
    }
  }
  // Mock: no-op (in-memory array not mutated here — pages handle local state)
}

// ─── Activities ───────────────────────────────────────────────────────────────

export async function getActivities(leadId: string): Promise<LeadActivity[]> {
  if (isSupabaseConfigured) {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('lead_activities')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data || []).map(r => ({
        id: r.id,
        leadId: r.lead_id,
        type: r.type as LeadActivity['type'],
        description: r.description,
        createdAt: new Date(r.created_at),
        userId: r.user_id,
      }))
    } catch (e) {
      console.warn('[data] Supabase getActivities failed:', e)
    }
  }
  return [
    { id: '1', leadId, type: 'email_open', description: 'Opened welcome email', createdAt: new Date('2024-01-16T10:30:00'), userId: '1' },
    { id: '2', leadId, type: 'note', description: 'Initial contact made via LinkedIn', createdAt: new Date('2024-01-15T14:20:00'), userId: '1' },
  ]
}

export async function addActivity(activity: Omit<LeadActivity, 'id' | 'createdAt'>): Promise<LeadActivity> {
  if (isSupabaseConfigured) {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('lead_activities')
        .insert({
          lead_id: activity.leadId,
          user_id: activity.userId,
          type: activity.type,
          description: activity.description,
        })
        .select()
        .single()
      if (error) throw error
      return { id: data.id, leadId: data.lead_id, type: data.type, description: data.description, createdAt: new Date(data.created_at), userId: data.user_id }
    } catch (e) {
      console.warn('[data] Supabase addActivity failed:', e)
    }
  }
  return { ...activity, id: Date.now().toString(), createdAt: new Date() }
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export async function getRecommendations(leadId: string): Promise<Recommendation[]> {
  if (isSupabaseConfigured) {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data || []).map(r => ({
        id: r.id,
        leadId: r.lead_id,
        type: r.type as Recommendation['type'],
        message: r.message,
        priority: r.priority as Recommendation['priority'],
        createdAt: new Date(r.created_at),
      }))
    } catch (e) {
      console.warn('[data] Supabase getRecommendations failed:', e)
    }
  }
  return mockRecommendations.filter(r => r.leadId === leadId)
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  if (isSupabaseConfigured) {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('leads')
        .select('category, status, ai_score, predicted_lifetime_value, source')
      if (error) throw error

      const leads = data || []
      const converted = leads.filter(l => l.status === 'converted')
      const sourceMap: Record<string, { count: number; converted: number }> = {}
      leads.forEach(l => {
        if (!sourceMap[l.source]) sourceMap[l.source] = { count: 0, converted: 0 }
        sourceMap[l.source].count++
        if (l.status === 'converted') sourceMap[l.source].converted++
      })

      return {
        totalLeads: leads.length,
        highValueLeads: leads.filter(l => l.category === 'hot').length,
        conversionRate: leads.length > 0 ? (converted.length / leads.length) * 100 : 0,
        pipelineValue: leads.reduce((s, l) => s + (l.predicted_lifetime_value || 0), 0),
        sourcePerformance: Object.entries(sourceMap).map(([source, v]) => ({
          source,
          count: v.count,
          conversionRate: v.count > 0 ? (v.converted / v.count) * 100 : 0,
        })),
      }
    } catch (e) {
      console.warn('[data] Supabase getDashboardStats failed:', e)
    }
  }

  // Mock stats
  const leads = mockLeads
  return {
    totalLeads: 1247,
    highValueLeads: leads.filter(l => l.category === 'hot').length,
    conversionRate: 23.5,
    pipelineValue: leads.reduce((s, l) => s + (l.predictedLifetimeValue || 0), 0),
    sourcePerformance: [
      { source: 'Website', count: 456, conversionRate: 28.2 },
      { source: 'LinkedIn', count: 324, conversionRate: 31.5 },
      { source: 'Email Campaign', count: 287, conversionRate: 18.9 },
      { source: 'Referral', count: 180, conversionRate: 42.1 },
    ],
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rowToLead(r: any): Lead {
  return {
    id: r.id,
    name: r.name,
    company: r.company,
    role: r.role,
    industry: r.industry,
    location: r.location,
    source: r.source,
    engagementScore: r.engagement_score ?? 0,
    aiScore: r.ai_score ?? 0,
    conversionProbability: parseFloat(r.conversion_probability ?? 0),
    category: r.category as Lead['category'],
    status: r.status as Lead['status'],
    email: r.email,
    phone: r.phone,
    notes: r.notes,
    predictedLifetimeValue: r.predicted_lifetime_value,
    intentLevel: r.intent_level,
    createdAt: new Date(r.created_at),
    updatedAt: new Date(r.updated_at),
  }
}

// ─── Campaigns ────────────────────────────────────────────────────────────────

export interface CampaignData {
  id: string
  name: string
  description: string
  type: 'email' | 'linkedin' | 'phone' | 'mixed'
  status: 'draft' | 'active' | 'paused' | 'completed'
  targetCriteria: Record<string, any>
  stats: { totalTargets: number; contacted: number; opened: number; replied: number; converted: number }
  scheduledAt?: Date
  createdAt: Date
}

const mockCampaigns: CampaignData[] = [
  {
    id: '1', name: 'SaaS High-Value Outreach',
    description: 'Target high-scoring SaaS leads with personalized value proposition',
    type: 'email', status: 'active',
    targetCriteria: { categories: ['hot', 'warm'], industries: ['SaaS'], minScore: 70 },
    stats: { totalTargets: 45, contacted: 32, opened: 18, replied: 7, converted: 2 },
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2', name: 'FinTech LinkedIn Sequence',
    description: 'Multi-touch LinkedIn campaign for FinTech decision makers',
    type: 'linkedin', status: 'paused',
    targetCriteria: { industries: ['FinTech'], minScore: 60 },
    stats: { totalTargets: 28, contacted: 15, opened: 12, replied: 4, converted: 1 },
    scheduledAt: new Date('2024-01-20'), createdAt: new Date('2024-01-10'),
  },
  {
    id: '3', name: 'Healthcare Nurture Campaign',
    description: 'Educational content series for healthcare prospects',
    type: 'email', status: 'draft',
    targetCriteria: { industries: ['Healthcare'], categories: ['warm', 'cold'] },
    stats: { totalTargets: 67, contacted: 0, opened: 0, replied: 0, converted: 0 },
    createdAt: new Date('2024-01-18'),
  },
]

export async function getCampaigns(): Promise<CampaignData[]> {
  if (isSupabaseConfigured) {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data || []).map(r => ({
        id: r.id,
        name: r.name,
        description: r.description || '',
        type: r.type as CampaignData['type'],
        status: r.status as CampaignData['status'],
        targetCriteria: r.target_criteria || {},
        stats: r.stats || { totalTargets: 0, contacted: 0, opened: 0, replied: 0, converted: 0 },
        scheduledAt: r.scheduled_at ? new Date(r.scheduled_at) : undefined,
        createdAt: new Date(r.created_at),
      }))
    } catch (e) {
      console.warn('[data] Supabase getCampaigns failed, using mock:', e)
    }
  }
  return mockCampaigns
}

export async function updateCampaignStatus(id: string, status: CampaignData['status']): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase.from('campaigns').update({ status }).eq('id', id)
      if (error) throw error
      return
    } catch (e) {
      console.warn('[data] Supabase updateCampaignStatus failed:', e)
    }
  }
  // mock: no-op, local state handles it
}

export async function createCampaign(campaign: Omit<CampaignData, 'id' | 'createdAt' | 'stats'>): Promise<CampaignData> {
  if (isSupabaseConfigured) {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          name: campaign.name,
          description: campaign.description,
          type: campaign.type,
          status: campaign.status,
          target_criteria: campaign.targetCriteria,
          scheduled_at: campaign.scheduledAt,
          stats: { totalTargets: 0, contacted: 0, opened: 0, replied: 0, converted: 0 }
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        type: data.type as CampaignData['type'],
        status: data.status as CampaignData['status'],
        targetCriteria: data.target_criteria || {},
        stats: data.stats || { totalTargets: 0, contacted: 0, opened: 0, replied: 0, converted: 0 },
        scheduledAt: data.scheduled_at ? new Date(data.scheduled_at) : undefined,
        createdAt: new Date(data.created_at)
      }
    } catch (e) {
      console.warn('[data] Supabase createCampaign failed, using mock:', e)
    }
  }

  // Mock implementation
  const newCampaign: CampaignData = {
    id: Date.now().toString(),
    ...campaign,
    stats: { totalTargets: 0, contacted: 0, opened: 0, replied: 0, converted: 0 },
    createdAt: new Date()
  }
  mockCampaigns.push(newCampaign)
  return newCampaign
}

export async function deleteCampaign(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase.from('campaigns').delete().eq('id', id)
      if (error) throw error
      return
    } catch (e) {
      console.warn('[data] Supabase deleteCampaign failed:', e)
    }
  }

  // Mock implementation
  const index = mockCampaigns.findIndex(c => c.id === id)
  if (index !== -1) {
    mockCampaigns.splice(index, 1)
  }
}

export async function deleteAllCampaigns(): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase.from('campaigns').delete().neq('id', 'impossible')
      if (error) throw error
      return
    } catch (e) {
      console.warn('[data] Supabase deleteAllCampaigns failed:', e)
    }
  }

  // Mock implementation
  mockCampaigns.length = 0
}
