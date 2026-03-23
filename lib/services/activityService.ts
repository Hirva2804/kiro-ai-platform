import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

type ActivityInsert = Database['public']['Tables']['lead_activities']['Insert']

export class ActivityService {
  static async addActivity(activity: ActivityInsert) {
    const { data, error } = await supabase
      .from('lead_activities')
      .insert(activity)
      .select(`
        *,
        user:user_id(name, email)
      `)
      .single()

    if (error) throw error
    return data
  }

  static async getLeadActivities(leadId: string) {
    const { data, error } = await supabase
      .from('lead_activities')
      .select(`
        *,
        user:user_id(name, email)
      `)
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  static async addNote(leadId: string, userId: string, note: string) {
    return this.addActivity({
      lead_id: leadId,
      user_id: userId,
      type: 'note_added',
      description: note
    })
  }

  static async logEmailSent(leadId: string, userId: string, emailData: {
    subject: string
    recipient: string
    templateId?: string
  }) {
    return this.addActivity({
      lead_id: leadId,
      user_id: userId,
      type: 'email_sent',
      description: `Email sent: ${emailData.subject}`,
      metadata: emailData
    })
  }

  static async logCall(leadId: string, userId: string, callData: {
    duration?: number
    outcome: string
    notes?: string
  }) {
    return this.addActivity({
      lead_id: leadId,
      user_id: userId,
      type: 'call_made',
      description: `Call made - ${callData.outcome}`,
      metadata: callData
    })
  }

  static async logMeeting(leadId: string, userId: string, meetingData: {
    scheduledFor: string
    type: string
    notes?: string
  }) {
    return this.addActivity({
      lead_id: leadId,
      user_id: userId,
      type: 'meeting_scheduled',
      description: `Meeting scheduled for ${new Date(meetingData.scheduledFor).toLocaleDateString()}`,
      metadata: meetingData
    })
  }
}