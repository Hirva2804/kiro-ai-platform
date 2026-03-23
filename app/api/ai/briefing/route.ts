import { NextRequest, NextResponse } from 'next/server'
import { generateDailyBriefing } from '@/lib/ai/dailyBriefing'
import { getLeads } from '@/lib/data'

export async function POST(request: NextRequest) {
  try {
    const { userName } = await request.json()
    const leads = await getLeads()
    const result = await generateDailyBriefing(leads, userName || 'there')
    return NextResponse.json({ result })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
