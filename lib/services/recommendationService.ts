import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

type RecommendationInsert = Database['public']['Tables']['recommendations']['Insert']

export class RecommendationService {
  static async generateRecommendations(leadId: string, leadData: any) {
    const recommendations: RecommendationInsert[] = []

    // High-value lead priority recommendation
    if (leadData.ai_score >= 80) {
      recommendations.push({
        lead_id: leadId,
        type: 'contact_priority',
        message: `High-value ${leadData.industry} lead with ${leadData.conversion_probability}% conversion probability. Contact within 24 hours for optimal results.`,
        priority: 'high',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
    }

    // Industry-specific timing recommendations
    const industryTimings: Record<string, string> = {
      'Healthcare': 'Healthcare contacts respond best on Tuesday-Thursday, 10-11 AM EST.',
      'FinTech': 'FinTech professionals are most responsive on weekdays, 2-4 PM EST.',
      'SaaS': 'SaaS decision makers prefer early morning (8-10 AM) or late afternoon (4-6 PM) contacts.',
      'Manufacturing': 'Manufacturing contacts are best reached mid-week, 9 AM-12 PM EST.'
    }

    if (industryTimings[leadData.industry]) {
      recommendations.push({
        lead_id: leadId,
        type: 'best_time',
        message: industryTimings[leadData.industry],
        priority: 'medium'
      })
    }

    // Channel preference recommendations
    const roleChannels: Record<string, string> = {
      'CTO': 'CTOs prefer LinkedIn messages over cold calls. Try personalized connection request.',
      'CEO': 'CEOs respond well to brief, value-focused emails. Keep initial contact under 100 words.',
      'VP': 'VPs appreciate phone calls during business hours. Follow up with email summary.',
      'Director': 'Directors prefer detailed emails with clear ROI information.',
      'Manager': 'Managers respond well to LinkedIn InMail with relevant case studies.'
    }

    const roleMatch = Object.keys(roleChannels).find(role => 
      leadData.role.toLowerCase().includes(role.toLowerCase())
    )

    if (roleMatch) {
      recommendations.push({
        lead_id: leadId,
        type: 'channel_preference',
        message: roleChannels[roleMatch],
        priority: 'medium'
      })
    }

    // Follow-up recommendations based on engagement
    if (leadData.engagement_score < 30) {
      recommendations.push({
        lead_id: leadId,
        type: 'follow_up',
        message: 'Low engagement score detected. Consider sending educational content before sales pitch.',
        priority: 'low'
      })
    } else if (leadData.engagement_score > 70) {
      recommendations.push({
        lead_id: leadId,
        type: 'follow_up',
        message: 'High engagement detected. Lead is ready for direct sales conversation.',
        priority: 'high'
      })
    }

    // Content suggestions
    const contentSuggestions: Record<string, string> = {
      'SaaS': 'Share ROI calculator and implementation timeline for SaaS solutions.',
      'FinTech': 'Provide compliance and security documentation for FinTech prospects.',
      'Healthcare': 'Include HIPAA compliance information and patient outcome case studies.',
      'Manufacturing': 'Focus on efficiency gains and cost reduction metrics.'
    }

    if (contentSuggestions[leadData.industry]) {
      recommendations.push({
        lead_id: leadId,
        type: 'content_suggestion',
        message: contentSuggestions[leadData.industry],
        priority: 'low'
      })
    }

    // Insert recommendations
    if (recommendations.length > 0) {
      const { data, error } = await supabase
        .from('recommendations')
        .insert(recommendations)
        .select()

      if (error) throw error
      return data
    }

    return []
  }

  static async getLeadRecommendations(leadId: string) {
    const { data, error } = await supabase
      .from('recommendations')
      .select('*')
      .eq('lead_id', leadId)
      .eq('is_read', false)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  static async markRecommendationRead(recommendationId: string) {
    const { data, error } = await supabase
      .from('recommendations')
      .update({ is_read: true })
      .eq('id', recommendationId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getUnreadRecommendationsCount(userId?: string) {
    let query = supabase
      .from('recommendations')
      .select('id', { count: 'exact' })
      .eq('is_read', false)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())

    const { count, error } = await query

    if (error) throw error
    return count || 0
  }
}