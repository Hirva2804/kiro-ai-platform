import { NextRequest, NextResponse } from 'next/server'
import { handleObjection } from '@/lib/ai/objectionHandler'

export async function POST(request: NextRequest) {
  try {
    const { objection, lead } = await request.json()
    const result = await handleObjection(objection, lead)
    return NextResponse.json({ result })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
