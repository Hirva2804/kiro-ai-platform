import { supabase } from '@/lib/supabase'
import { Lead } from '@/types'
import { Database } from '@/types/supabase'

type LeadRow = Database['public']['Tables']['leads']['Row']
type LeadInsert = Database['public']['Tables']['leads']['Insert']
type LeadUpdate = Database['public']['Tables']['leads']['Update']

export class LeadService {
  static async getLeads(filters?: {
    category?: string
    status?: string
    assignedTo?: string
    search?: string
  }) {
    let query = supabase
      .from('leads')
      .select(`
        *,
        assigned_user:assigned_to(name, email),
        created_user:created_by(name, email)
      `)
      .order('ai_score', { ascending: false })

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category)
    }

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    if (filters?.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo)
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,company.ilike.%${filters.search}%,industry.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  }

  static async getLeadById(id: string) {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        assigned_user:assigned_to(name, email),
        created_user:created_by(name, email),
        activities:lead_activities(
          id,
          type,
          description,
          metadata,
          created_at,
          user:user_id(name, email)
        ),
        recommendations(
          id,
          type,
          message,
          priority,
          is_read,
          metadata,
          created_at,
          expires_at
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async createLead(leadData: LeadInsert) {
    const { data, error } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateLead(id: string, updates: LeadUpdate) {
    const { data, error } = await supabase
      .from('leads')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteLead(id: string) {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  static async bulkCreateLeads(leads: LeadInsert[]) {
    const { data, error } = await supabase
      .from('leads')
      .insert(leads)
      .select()

    if (error) throw error
    return data
  }

  static async getLeadStats(userId?: string) {
    let query = supabase
      .from('leads')
      .select('category, status, ai_score, predicted_lifetime_value, created_at')

    if (userId) {
      query = query.or(`created_by.eq.${userId},assigned_to.eq.${userId}`)
    }

    const { data, error } = await query

    if (error) throw error

    const stats = {
      totalLeads: data.length,
      hotLeads: data.filter(l => l.category === 'hot').length,
      warmLeads: data.filter(l => l.category === 'warm').length,
      coldLeads: data.filter(l => l.category === 'cold').length,
      newLeads: data.filter(l => l.status === 'new').length,
      qualifiedLeads: data.filter(l => l.status === 'qualified').length,
      convertedLeads: data.filter(l => l.status === 'converted').length,
      averageScore: data.reduce((sum, l) => sum + l.ai_score, 0) / data.length || 0,
      totalPipelineValue: data.reduce((sum, l) => sum + (l.predicted_lifetime_value || 0), 0),
      conversionRate: data.length > 0 ? (data.filter(l => l.status === 'converted').length / data.length) * 100 : 0
    }

    return stats
  }

  static async assignLead(leadId: string, userId: string) {
    return this.updateLead(leadId, { assigned_to: userId })
  }

  static async updateLeadStatus(leadId: string, status: LeadRow['status'], userId: string) {
    // Update lead status
    const lead = await this.updateLead(leadId, { status })

    // Add activity
    await supabase
      .from('lead_activities')
      .insert({
        lead_id: leadId,
        user_id: userId,
        type: 'status_changed',
        description: `Status changed to ${status}`,
        metadata: { previous_status: lead.status, new_status: status }
      })

    return lead
  }
}