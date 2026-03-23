import { geminiGenerate } from './gemini'
import { Lead } from '@/types'

export interface ObjectionResponse {
  objection: string
  response: string
  followUpQuestion: string
  talkingPoints: string[]
  doNotSay: string[]
}

const COMMON_OBJECTIONS = [
  "It's too expensive",
  "We already have a solution",
  "Not the right time",
  "Need to talk to my team",
  "We're happy with what we have",
  "Send me more information",
  "Call me back next quarter",
  "We don't have budget right now",
]

export async function handleObjection(
  objection: string,
  lead: Lead
): Promise<ObjectionResponse> {
  const prompt = `You are an expert B2B sales coach. Provide a response to this sales objection.

Lead Context:
- Name: ${lead.name}, ${lead.role} at ${lead.company}
- Industry: ${lead.industry}
- AI Score: ${lead.aiScore}/100

Objection: "${objection}"

Respond in EXACTLY this JSON format:
{
  "objection": "${objection}",
  "response": "2-3 sentence empathetic, non-pushy response that reframes the objection",
  "followUpQuestion": "A question to keep the conversation going",
  "talkingPoints": ["Point 1", "Point 2", "Point 3"],
  "doNotSay": ["Avoid saying this", "Don't say this either"]
}`

  try {
    const response = await geminiGenerate(prompt)
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
    throw new Error('parse failed')
  } catch {
    return getFallbackResponse(objection, lead)
  }
}

function getFallbackResponse(objection: string, lead: Lead): ObjectionResponse {
  const responses: Record<string, Partial<ObjectionResponse>> = {
    'expensive': {
      response: `I completely understand — budget is always a consideration. Most of our ${lead.industry} clients see full ROI within 60 days. Would it help if I put together a quick ROI calculation based on your current lead volume?`,
      followUpQuestion: 'What does your current cost per qualified lead look like?',
      talkingPoints: ['ROI within 60 days', 'Pay-as-you-grow pricing', 'Free trial available'],
      doNotSay: ["It's actually cheap", "You can't afford not to"]
    },
    'solution': {
      response: `That's great to hear — it means you're already investing in this area. Many of our best customers came from similar tools. What I'd love to understand is what gaps you're still seeing, because we often complement existing solutions rather than replace them.`,
      followUpQuestion: 'What's the one thing your current solution doesn't do well?',
      talkingPoints: ['Integrates with existing tools', 'Fills gaps in current stack', 'No rip-and-replace needed'],
      doNotSay: ["Your current solution is bad", "We're way better"]
    },
    'time': {
      response: `Timing is everything in sales — I respect that. Can I ask what would need to change for this to become a priority? In the meantime, I can send you a case study from a similar ${lead.industry} company so you have it when the time is right.`,
      followUpQuestion: 'When do you typically revisit vendor decisions?',
      talkingPoints: ['Quick 2-week implementation', 'No long-term contract required', 'Start small and scale'],
      doNotSay: ["There's never a perfect time", "You're losing money every day"]
    }
  }

  const key = objection.toLowerCase().includes('expens') ? 'expensive'
    : objection.toLowerCase().includes('solution') || objection.toLowerCase().includes('have') ? 'solution'
    : 'time'

  return {
    objection,
    response: responses[key]?.response || `I understand your concern. Let me address that directly — ${lead.company} could see significant value from our solution. Can we explore this further?`,
    followUpQuestion: responses[key]?.followUpQuestion || 'What would need to be true for this to make sense for you?',
    talkingPoints: responses[key]?.talkingPoints || ['Proven ROI', 'Easy implementation', 'Dedicated support'],
    doNotSay: responses[key]?.doNotSay || ["Don't be defensive", "Avoid pressure tactics"]
  }
}

export { COMMON_OBJECTIONS }
