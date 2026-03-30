import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { supabaseAdmin } from '@/lib/supabase'

function getSmtpConfig() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM

  if (!host || !user || !pass || !from) {
    throw new Error('SMTP is not configured (set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM)')
  }
  return { host, port, user, pass, from }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const leadId = String(body.leadId || '')
    const to = String(body.to || '')
    const subject = String(body.subject || '')
    const message = String(body.body || '')

    if (!leadId || !to || !subject || !message) {
      return NextResponse.json({ message: 'leadId, to, subject, body are required' }, { status: 400 })
    }

    const smtp = getSmtpConfig()
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: { user: smtp.user, pass: smtp.pass },
    })

    const info = await transporter.sendMail({
      from: smtp.from,
      to,
      subject,
      text: message,
    })

    // Log activity (best-effort)
    await supabaseAdmin.from('lead_activities').insert({
      lead_id: leadId,
      user_id: '00000000-0000-0000-0000-000000000001',
      type: 'email_sent',
      description: `Email sent to ${to}: ${subject}`,
      metadata: { messageId: info.messageId, to, subject },
    })

    return NextResponse.json({ ok: true, messageId: info.messageId })
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Internal server error' }, { status: 500 })
  }
}

