import { geminiGenerate } from './gemini'
import { Lead } from '@/types'

export type ActionType = 'call_now' | 'send_email' | 'send_linkedin' | 'wait' | 'schedule_demo' | 'send_proposal' | 'follow_up'

export interface NextBestAction {
  action: ActionType
  label: string
  urgency: 'immediate' | 'today' | 'this_week' | 'next_week'
  reasoning: string
  pitchAngle: string
  bestTimeToContact: string
  suggestedMessage?: string
  confidence: number
}

const ACTION_LABELS: Record<ActionType, string> = {
  call_now: '📞 Call Now',
  send_email: '📧 Send Email',
  send_linkedin: '💼 LinkedIn Message',
  wait: '⏳ Wait & Nurture',
  schedule_demo: '🖥️ Schedule Demo',
  send_proposal: '📄 Send Proposal',
  follow_up: '🔁 Follow Up'
}

// Rule-based NBA engine (fast, no API cost)
export function computeNextBestAction(
  lead: Lead & { pageVisits?: any[]; intentLevel?: string }
): NextBestAction {
  const score = lead.aiScore
  const status = lead.status
  const intent = lead.intentLevel || 'low'
  const industry = lead.industry || ''
  const role = (lead.role || '').toLowerCase()

  // High-score + high-intent = call now
  if (score >= 80 && intent === 'high') {
    return {
      action: 'call_now',
      label: ACTION_LABELS.call_now,
      urgency: 'immediate',
      reasoning: `Score ${score}/100 with high buying intent detected. Pricing page visited recently.`,
      pitchAngle: getPitchAngle(industry, role),
      bestTimeToContact: getBestTime(industry),
      confidence: 0.92
    }
  }

  // Qualified + proposal stage
  if (status === 'qualified' && score >= 70) {
    return {
      action: 'send_proposal',
      label: ACTION_LABELS.send_proposal,
      urgency: 'today',
      reasoning: `Lead is qualified with strong score. Ready for formal proposal.`,
      pitchAngle: `Focus on ROI and implementation timeline for ${industry}`,
      bestTimeToContact: getBestTime(industry),
      confidence: 0.88
    }
  }

  // New hot lead
  if (status === 'new' && score >= 75) {
    return {
      action: 'send_email',
      label: ACTION_LABELS.send_email,
      urgency: 'today',
      reasoning: `Fresh high-scoring lead. Personalized email within 24h increases response rate by 3x.`,
      pitchAngle: getPitchAngle(industry, role),
      bestTimeToContact: getBestTime(industry),
      confidence: 0.85
    }
  }

  // Contacted but no response
  if (status === 'contacted' && score >= 60) {
    return {
      action: 'send_linkedin',
      label: ACTION_LABELS.send_linkedin,
      urgency: 'today',
      reasoning: `Email sent but no response. LinkedIn has 3x higher response rate for ${role.includes('cto') || role.includes('vp') ? 'technical decision makers' : 'this role'}.`,
      pitchAngle: `Short, value-focused message referencing their ${industry} challenges`,
      bestTimeToContact: 'Tuesday–Thursday, 10–11 AM',
      confidence: 0.78
    }
  }

  // Medium intent, warm lead
  if (score >= 60 && intent === 'medium') {
    return {
      action: 'schedule_demo',
      label: ACTION_LABELS.schedule_demo,
      urgency: 'this_week',
      reasoning: `Warm lead showing product interest. Demo converts warm leads at 40% higher rate.`,
      pitchAngle: `Offer a tailored demo focused on ${industry}-specific use cases`,
      bestTimeToContact: getBestTime(industry),
      confidence: 0.75
    }
  }

  // Cold lead
  if (score < 60) {
    return {
      action: 'wait',
      label: ACTION_LABELS.wait,
      urgency: 'next_week',
      reasoning: `Score ${score}/100 — lead needs nurturing before direct outreach. Send educational content first.`,
      pitchAngle: `Share industry insights and case studies to build awareness`,
      bestTimeToContact: 'After 2–3 nurture touchpoints',
      confidence: 0.70
    }
  }

  // Default follow-up
  return {
    action: 'follow_up',
    label: ACTION_LABELS.follow_up,
    urgency: 'this_week',
    reasoning: `Regular follow-up recommended to maintain engagement.`,
    pitchAngle: getPitchAngle(industry, role),
    bestTimeToContact: getBestTime(industry),
    confidence: 0.72
  }
}

function getPitchAngle(industry: string, role: string): string {
  const pitches: Record<string, string> = {
    SaaS: 'Focus on reducing churn and improving activation rates with AI-driven insights',
    FinTech: 'Lead with compliance automation and risk reduction — their top pain points',
    Healthcare: 'Emphasize patient outcome improvements and HIPAA-compliant data handling',
    Manufacturing: 'Highlight operational efficiency gains and cost reduction metrics',
    Retail: 'Focus on customer acquisition cost reduction and lifetime value improvement'
  }

  const rolePitch = role.includes('cto') || role.includes('technical')
    ? 'Lead with technical architecture, API capabilities, and integration ease'
    : role.includes('cfo') || role.includes('finance')
    ? 'Lead with ROI, payback period, and cost savings data'
    : ''

  return rolePitch || pitches[industry] || 'Focus on measurable business outcomes and quick time-to-value'
}

function getBestTime(industry: string): string {
  const times: Record<string, string> = {
    Healthcare: 'Tuesday–Thursday, 10–11 AM EST',
    FinTech: 'Monday–Wednesday, 2–4 PM EST',
    SaaS: 'Tuesday–Thursday, 8–10 AM or 4–6 PM EST',
    Manufacturing: 'Wednesday–Friday, 9 AM–12 PM EST',
    Retail: 'Tuesday–Thursday, 11 AM–1 PM EST'
  }
  return times[industry] || 'Tuesday–Thursday, 10 AM–12 PM EST'
}

// Gemini-powered personalized pitch (Feature 3 upgrade)
export async function generatePersonalizedPitch(lead: Lead): Promise<string> {
  const prompt = `You are a top B2B sales expert. Write a 3-sentence personalized pitch for this lead.

Lead:
- Name: ${lead.name}
- Role: ${lead.role} at ${lead.company}
- Industry: ${lead.industry}
- Source: ${lead.source}
- AI Score: ${lead.aiScore}/100

Requirements:
- Address their likely pain point as a ${lead.role} in ${lead.industry}
- Mention a specific, relevant outcome (with a number if possible)
- End with a soft, low-friction call to action
- Tone: confident but not pushy, conversational

Output only the pitch, no labels or headers.`

  try {
    return await geminiGenerate(prompt)
  } catch {
    return `Hi ${lead.name?.split(' ')[0]}, I noticed ${lead.company} is in the ${lead.industry} space. We've helped similar companies improve their conversion rates by 30%+ using AI-powered lead intelligence. Would a 15-minute call this week make sense?`
  }
}