import { NextRequest, NextResponse } from 'next/server'
import { generateMeetingBrief } from '@/lib/ai/meetingPrep'

export async function POST(request: NextRequest) {
  try {
    const { lead } = await request.json()
    const result = await generateMeetingBrief(lead)
    return NextResponse.json({ result })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
