export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'sales_manager' | 'sales_executive'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role: 'admin' | 'sales_manager' | 'sales_executive'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'sales_manager' | 'sales_executive'
          avatar_url?: string | null
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          name: string
          company: string
          role: string
          industry: string
          location: string
          source: string
          engagement_score: number
          ai_score: number
          conversion_probability: number
          category: 'hot' | 'warm' | 'cold'
          status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'converted' | 'lost'
          email: string | null
          phone: string | null
          notes: string | null
          predicted_lifetime_value: number | null
          intent_level: 'high' | 'medium' | 'low' | null
          assigned_to: string | null
          tags: string[] | null
          custom_fields: Json | null
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          name: string
          company: string
          role: string
          industry: string
          location: string
          source: string
          engagement_score?: number
          ai_score?: number
          conversion_probability?: number
          category: 'hot' | 'warm' | 'cold'
          status?: 'new' | 'contacted' | 'qualified' | 'proposal' | 'converted' | 'lost'
          email?: string | null
          phone?: string | null
          notes?: string | null
          predicted_lifetime_value?: number | null
          intent_level?: 'high' | 'medium' | 'low' | null
          assigned_to?: string | null
          tags?: string[] | null
          custom_fields?: Json | null
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          name?: string
          company?: string
          role?: string
          industry?: string
          location?: string
          source?: string
          engagement_score?: number
          ai_score?: number
          conversion_probability?: number
          category?: 'hot' | 'warm' | 'cold'
          status?: 'new' | 'contacted' | 'qualified' | 'proposal' | 'converted' | 'lost'
          email?: string | null
          phone?: string | null
          notes?: string | null
          predicted_lifetime_value?: number | null
          intent_level?: 'high' | 'medium' | 'low' | null
          assigned_to?: string | null
          tags?: string[] | null
          custom_fields?: Json | null
          updated_at?: string
          created_by?: string
        }
      }
      lead_activities: {
        Row: {
          id: string
          lead_id: string
          user_id: string
          type: string
          description: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          user_id: string
          type: string
          description: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          user_id?: string
          type?: string
          description?: string
          metadata?: Json | null
          created_at?: string
        }
      }
      recommendations: {
        Row: {
          id: string
          lead_id: string
          type: string
          message: string
          priority: 'high' | 'medium' | 'low'
          is_read: boolean
          metadata: Json | null
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          lead_id: string
          type: string
          message: string
          priority: 'high' | 'medium' | 'low'
          is_read?: boolean
          metadata?: Json | null
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          lead_id?: string
          type?: string
          message?: string
          priority?: 'high' | 'medium' | 'low'
          is_read?: boolean
          metadata?: Json | null
          expires_at?: string | null
        }
      }
      email_templates: {
        Row: {
          id: string
          name: string
          subject: string
          content: string
          category: string
          variables: string[] | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          subject: string
          content: string
          category: string
          variables?: string[] | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          subject?: string
          content?: string
          category?: string
          variables?: string[] | null
          created_by?: string
          updated_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          name: string
          description: string | null
          type: 'email' | 'linkedin' | 'phone' | 'mixed'
          status: 'draft' | 'active' | 'paused' | 'completed'
          target_criteria: Json
          stats: Json | null
          template_id: string | null
          scheduled_at: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type: 'email' | 'linkedin' | 'phone' | 'mixed'
          status?: 'draft' | 'active' | 'paused' | 'completed'
          target_criteria: Json
          stats?: Json | null
          template_id?: string | null
          scheduled_at?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: 'email' | 'linkedin' | 'phone' | 'mixed'
          status?: 'draft' | 'active' | 'paused' | 'completed'
          target_criteria?: Json
          stats?: Json | null
          template_id?: string | null
          scheduled_at?: string | null
          created_by?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
