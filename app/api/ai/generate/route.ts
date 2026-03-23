import { NextRequest, NextResponse } from 'next/server'
import { generateEmail, generateCallScript, generateLinkedInMessage } from '@/lib/ai/contentGenerator'

export async function POST(request: NextRequest) {
  try {
    const { type, lead, emailType, senderName } = await request.json()

    if (!lead) {
      return NextResponse.json({ error: 'Lead data required' }, { status: 400 })
    }

    switch (type) {
      case 'email':
        const email = await generateEmail(lead, emailType || 'cold_outreach', senderName)
        return NextResponse.json({ result: email })

      case 'call_script':
        const script = await generateCallScript(lead)
        return NextResponse.json({ result: script })

      case 'linkedin':
        const linkedin = await generateLinkedInMessage(lead)
        return NextResponse.json({ result: linkedin })

      default:
        return NextResponse.json({ error: 'Invalid generation type' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}