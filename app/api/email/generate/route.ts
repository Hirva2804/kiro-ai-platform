import { NextRequest, NextResponse } from 'next/server'
import { generateEmailWithPrompt } from '@/lib/ai/contentGenerator'
import { supabaseAdmin } from '@/lib/supabase'
import { Lead } from '@/types'

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
    category: r.category,
    status: r.status,
    email: r.email ?? undefined,
    phone: r.phone ?? undefined,
    notes: r.notes ?? undefined,
    predictedLifetimeValue: r.predicted_lifetime_value ?? undefined,
    intentLevel: r.intent_level ?? undefined,
    isPinned: false,
    createdAt: new Date(r.created_at),
    updatedAt: new Date(r.updated_at),
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const leadId = String(body.leadId || '')
    const prompt = String(body.prompt || '')
    const emailType = (body.emailType || 'cold_outreach') as
      | 'cold_outreach'
      | 'follow_up'
      | 'nurture'
      | 'proposal'
      | 'closing'

    if (!leadId) return NextResponse.json({ message: 'leadId is required' }, { status: 400 })

    const { data: leadRow, error } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (error || !leadRow) {
      return NextResponse.json({ message: 'Lead not found' }, { status: 404 })
    }

    const lead = rowToLead(leadRow)
    const generated = await generateEmailWithPrompt(lead, emailType, prompt, 'LeadIQ Pro')

    return NextResponse.json({
      subject: generated.subject,
      body: generated.body,
    })
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Internal server error' }, { status: 500 })
  }
}

