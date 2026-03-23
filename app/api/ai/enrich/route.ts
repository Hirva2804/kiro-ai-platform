import { NextRequest, NextResponse } from 'next/server'
import { enrichLead } from '@/lib/ai/enrichment'

export async function POST(request: NextRequest) {
  try {
    const { lead } = await request.json()
    const result = await enrichLead(lead)
    return NextResponse.json({ result })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
