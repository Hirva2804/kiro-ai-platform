import { geminiGenerate } from './gemini'
import { Lead } from '@/types'

export interface GeneratedEmail {
  subject: string
  body: string
  followUpSubject: string
  followUpBody: string
}

export interface GeneratedCallScript {
  opener: string
  valueProposition: string
  discoveryQuestions: string[]
  objectionHandlers: Record<string, string>
  closingLine: string
  voicemail: string
}

export interface GeneratedLinkedInMessage {
  connectionRequest: string
  followUpMessage: string
  inMailSubject: string
  inMailBody: string
}

// Feature 4: AI Email Generator
export async function generateEmail(
  lead: Lead,
  emailType: 'cold_outreach' | 'follow_up' | 'nurture' | 'proposal' | 'closing',
  senderName: string = 'Your Name'
): Promise<GeneratedEmail> {
  const typeInstructions: Record<string, string> = {
    cold_outreach: 'First contact. Be brief (under 100 words), lead with a pain point, end with a soft CTA.',
    follow_up: 'Following up on no response. Add new value, reference previous email, be even shorter.',
    nurture: 'Educational content. Share an insight or stat relevant to their industry. No hard sell.',
    proposal: 'They are qualified. Summarize the solution, ROI, and next steps clearly.',
    closing: 'Create urgency. Reference a deadline or limited offer. Include social proof.'
  }

  const prompt = `You are an expert B2B sales copywriter. Generate a ${emailType} email for this lead.

Lead Profile:
- Name: ${lead.name}
- Role: ${lead.role} at ${lead.company}
- Industry: ${lead.industry}
- Location: ${lead.location}
- Source: ${lead.source}
- AI Score: ${lead.aiScore}/100

Sender: ${senderName}
Email Type: ${emailType}
Instructions: ${typeInstructions[emailType]}

Output EXACTLY in this format (no extra text):
SUBJECT: [subject line here]
BODY:
[email body here]
FOLLOWUP_SUBJECT: [follow-up subject line]
FOLLOWUP_BODY:
[follow-up email body]`

  try {
    const response = await geminiGenerate(prompt)
    const lines = response.split('\n')

    const subjectLine = lines.find(l => l.startsWith('SUBJECT:'))?.replace('SUBJECT:', '').trim() || `Quick question for ${lead.name?.split(' ')[0]}`
    const followUpSubjectLine = lines.find(l => l.startsWith('FOLLOWUP_SUBJECT:'))?.replace('FOLLOWUP_SUBJECT:', '').trim() || `Re: ${subjectLine}`

    const bodyStart = lines.findIndex(l => l.startsWith('BODY:')) + 1
    const followUpStart = lines.findIndex(l => l.startsWith('FOLLOWUP_BODY:')) + 1
    const followUpEnd = lines.length

    const body = lines.slice(bodyStart, lines.findIndex(l => l.startsWith('FOLLOWUP_SUBJECT:'))).join('\n').trim()
    const followUpBody = lines.slice(followUpStart, followUpEnd).join('\n').trim()

    return {
      subject: subjectLine,
      body: body || getFallbackEmail(lead, emailType, senderName),
      followUpSubject: followUpSubjectLine,
      followUpBody: followUpBody || `Hi ${lead.name?.split(' ')[0]}, just following up on my previous email. Would love to connect!`
    }
  } catch {
    return {
      subject: `Quick question for ${lead.name?.split(' ')[0]}`,
      body: getFallbackEmail(lead, emailType, senderName),
      followUpSubject: `Following up — ${lead.company}`,
      followUpBody: `Hi ${lead.name?.split(' ')[0]},\n\nJust following up on my previous email. Would a quick 15-minute call this week work?\n\nBest,\n${senderName}`
    }
  }
}

// Feature 4: AI Call Script Generator
export async function generateCallScript(lead: Lead): Promise<GeneratedCallScript> {
  const prompt = `You are a top B2B sales trainer. Create a call script for this lead.

Lead:
- Name: ${lead.name}
- Role: ${lead.role} at ${lead.company}
- Industry: ${lead.industry}
- AI Score: ${lead.aiScore}/100

Output EXACTLY in this format:
OPENER: [2-sentence opener]
VALUE_PROP: [1-sentence value proposition]
QUESTIONS:
- [discovery question 1]
- [discovery question 2]
- [discovery question 3]
OBJECTION_PRICE: [response to "too expensive"]
OBJECTION_TIMING: [response to "not the right time"]
OBJECTION_COMPETITOR: [response to "we use a competitor"]
CLOSING: [closing line]
VOICEMAIL: [30-second voicemail script]`

  try {
    const response = await geminiGenerate(prompt)
    const lines = response.split('\n')

    const get = (key: string) => lines.find(l => l.startsWith(key + ':'))?.replace(key + ':', '').trim() || ''
    const questions = lines.filter(l => l.trim().startsWith('- ')).map(l => l.replace('- ', '').trim())

    return {
      opener: get('OPENER'),
      valueProposition: get('VALUE_PROP'),
      discoveryQuestions: questions.slice(0, 3),
      objectionHandlers: {
        price: get('OBJECTION_PRICE'),
        timing: get('OBJECTION_TIMING'),
        competitor: get('OBJECTION_COMPETITOR')
      },
      closingLine: get('CLOSING'),
      voicemail: get('VOICEMAIL')
    }
  } catch {
    return getFallbackCallScript(lead)
  }
}

// Feature 4: LinkedIn Message Generator
export async function generateLinkedInMessage(lead: Lead): Promise<GeneratedLinkedInMessage> {
  const prompt = `Write LinkedIn outreach messages for this B2B lead.

Lead: ${lead.name}, ${lead.role} at ${lead.company} (${lead.industry})

Output EXACTLY:
CONNECTION: [300 char max connection request]
FOLLOWUP: [short follow-up after connecting]
INMAIL_SUBJECT: [InMail subject line]
INMAIL_BODY: [InMail body, 150 words max]`

  try {
    const response = await geminiGenerate(prompt)
    const lines = response.split('\n')
    const get = (key: string) => lines.find(l => l.startsWith(key + ':'))?.replace(key + ':', '').trim() || ''

    return {
      connectionRequest: get('CONNECTION'),
      followUpMessage: get('FOLLOWUP'),
      inMailSubject: get('INMAIL_SUBJECT'),
      inMailBody: get('INMAIL_BODY')
    }
  } catch {
    return {
      connectionRequest: `Hi ${lead.name?.split(' ')[0]}, I work with ${lead.industry} companies on AI-powered lead intelligence. Would love to connect!`,
      followUpMessage: `Thanks for connecting! I'd love to share how we've helped similar ${lead.industry} companies. Open to a quick chat?`,
      inMailSubject: `${lead.industry} companies are seeing 30%+ conversion improvements`,
      inMailBody: `Hi ${lead.name?.split(' ')[0]},\n\nI noticed you're leading ${lead.role.toLowerCase()} at ${lead.company}. We've helped similar ${lead.industry} companies significantly improve their sales conversion rates.\n\nWould a 15-minute call make sense this week?\n\nBest regards`
    }
  }
}

function getFallbackEmail(lead: Lead, type: string, sender: string): string {
  const firstName = lead.name?.split(' ')[0] || 'there'
  return `Hi ${firstName},\n\nI noticed ${lead.company} is in the ${lead.industry} space and likely dealing with lead conversion challenges.\n\nWe've helped similar companies improve their conversion rates by 30%+ using AI-powered lead intelligence.\n\nWould a 15-minute call this week make sense?\n\nBest,\n${sender}`
}

function getFallbackCallScript(lead: Lead): GeneratedCallScript {
  const firstName = lead.name?.split(' ')[0] || 'there'
  return {
    opener: `Hi ${firstName}, this is [Your Name] from LeadIQ Pro. I'm reaching out because we work with ${lead.industry} companies on improving their sales conversion rates. Do you have 2 minutes?`,
    valueProposition: `We help ${lead.industry} companies like ${lead.company} increase lead conversion by 30%+ using AI-powered scoring and recommendations.`,
    discoveryQuestions: [
      `What does your current lead qualification process look like?`,
      `How are you currently prioritizing which leads to contact first?`,
      `What's your biggest challenge with converting leads to customers right now?`
    ],
    objectionHandlers: {
      price: `I understand budget is always a consideration. Most of our clients see ROI within 60 days — would it help if I shared a quick ROI calculation based on your current lead volume?`,
      timing: `That makes sense. When would be a better time? In the meantime, I can send you a case study from a similar ${lead.industry} company — would that be helpful?`,
      competitor: `I respect that. What I'd love to understand is what's working well and what gaps you're still seeing — we often complement existing tools rather than replace them.`
    },
    closingLine: `Based on what you've shared, it sounds like there's a real fit here. Can we schedule a 30-minute demo this week to show you exactly how it would work for ${lead.company}?`,
    voicemail: `Hi ${firstName}, this is [Your Name] from LeadIQ Pro. I'm calling because we help ${lead.industry} companies improve lead conversion by 30%+. I'd love to share how — please call me back at [number] or I'll try you again Thursday. Thanks!`
  }
}