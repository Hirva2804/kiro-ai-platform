import { geminiGenerate } from './gemini'
import { Lead } from '@/types'

export interface MeetingBrief {
  executiveSummary: string
  keyTalkingPoints: string[]
  anticipatedObjections: string[]
  discoveryQuestions: string[]
  successMetrics: string[]
  competitorContext: string
  personalIcebreaker: string
  redFlags: string[]
  recommendedDuration: string
  meetingGoal: string
}

export async function generateMeetingBrief(lead: Lead): Promise<MeetingBrief> {
  const prompt = `You are a senior B2B sales strategist preparing a rep for a meeting.

Lead Profile:
- Name: ${lead.name}, ${lead.role} at ${lead.company}
- Industry: ${lead.industry}
- Location: ${lead.location}
- Source: ${lead.source}
- AI Score: ${lead.aiScore}/100
- Status: ${lead.status}
- Engagement: ${lead.engagementScore}/100
- Notes: ${lead.notes || 'None'}

Generate a pre-meeting intelligence brief in EXACTLY this JSON format:
{
  "executiveSummary": "2-sentence summary of who this person is and why this meeting matters",
  "keyTalkingPoints": ["Point 1", "Point 2", "Point 3", "Point 4"],
  "anticipatedObjections": ["Likely objection 1", "Likely objection 2"],
  "discoveryQuestions": ["Question 1", "Question 2", "Question 3", "Question 4"],
  "successMetrics": ["What success looks like 1", "What success looks like 2"],
  "competitorContext": "Brief note on likely competitors they're evaluating",
  "personalIcebreaker": "A relevant, non-creepy conversation starter",
  "redFlags": ["Watch out for this", "Be careful about this"],
  "recommendedDuration": "30 minutes",
  "meetingGoal": "Single clear goal for this meeting"
}`

  try {
    const response = await geminiGenerate(prompt)
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
    throw new Error('parse failed')
  } catch {
    return getFallbackBrief(lead)
  }
}

function getFallbackBrief(lead: Lead): MeetingBrief {
  return {
    executiveSummary: `${lead.name} is a ${lead.role} at ${lead.company}, a ${lead.industry} company. This meeting is an opportunity to understand their lead management challenges and demonstrate how our AI-powered platform can drive measurable results.`,
    keyTalkingPoints: [
      `${lead.industry}-specific ROI metrics and case studies`,
      'AI scoring accuracy and how it reduces time-to-contact',
      'Integration with their existing CRM stack',
      'Implementation timeline and onboarding support'
    ],
    anticipatedObjections: [
      'Budget constraints or competing priorities',
      'Already using a competitor solution'
    ],
    discoveryQuestions: [
      'What does your current lead qualification process look like?',
      'How are you prioritizing which leads to contact first?',
      `What's your biggest challenge converting ${lead.industry} leads?`,
      'What would a successful outcome look like for you in 90 days?'
    ],
    successMetrics: [
      'Agreement to a follow-up demo or trial',
      'Clear understanding of their decision-making process and timeline'
    ],
    competitorContext: `Likely evaluating generic CRM tools or manual spreadsheet processes. Emphasize AI differentiation.`,
    personalIcebreaker: `Ask about recent developments in the ${lead.industry} space or their experience at ${lead.company}.`,
    redFlags: [
      'If they mention budget freeze — pivot to ROI conversation',
      'If they seem distracted — ask for a reschedule rather than rushing'
    ],
    recommendedDuration: '30 minutes',
    meetingGoal: `Qualify budget and timeline, and secure agreement for a product demo`
  }
}
