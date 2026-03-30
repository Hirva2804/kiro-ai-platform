import { NextRequest, NextResponse } from 'next/server'
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
    // First check if leads table exists
    const { error: tableCheckError } = await supabaseAdmin
      .from('leads')
      .select('id')
      .limit(1)
    
    if (tableCheckError && tableCheckError.code === 'PGRST116') {
      return NextResponse.json(
        { 
          message: 'Database tables not found. Please run schema.sql in your Supabase SQL Editor first.',
          hint: 'Go to your Supabase project → SQL Editor → paste schema.sql → Run'
        },
        { status: 500 }
      )
    }

    const lead = await req.json()

    const demoUserId = '00000000-0000-0000-0000-000000000001'
    // Insert profile so FK constraints pass (needed when user is not authenticated).
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

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { 
          message: 'Database error: ' + (error.message || 'Unknown error'),
          details: error,
          hint: 'Make sure you have run schema.sql in your Supabase database'
        },
        { status: 500 }
      )
    }

    const created = rowToLead(data)
    return NextResponse.json({
      ...created,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    })
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message || 'Failed to create lead' },
      { status: 500 }
    )
  }
}

