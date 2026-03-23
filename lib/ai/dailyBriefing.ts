import { geminiGenerate } from './gemini'
import { Lead } from '@/types'

export interface DailyBriefing {
  greeting: string
  summary: string
  topPriorities: Array<{
    leadName: string
    company: string
    action: string
    reason: string
    urgency: 'immediate' | 'today' | 'this_week'
  }>
  pipelineAlert: string
  winOfTheDay: string
  focusTip: string
  generatedAt: Date
}

export async function generateDailyBriefing(
  leads: Lead[],
  userName: string = 'there'
): Promise<DailyBriefing> {
  const hotLeads = leads.filter(l => l.category === 'hot').slice(0, 5)
  const newLeads = leads.filter(l => l.status === 'new').slice(0, 3)
  const proposalLeads = leads.filter(l => l.status === 'proposal')
  const totalValue = leads.reduce((s, l) => s + (l.predictedLifetimeValue || 0), 0)

  const prompt = `You are an AI sales coach generating a morning briefing for a sales rep.

Pipeline Snapshot:
- Total leads: ${leads.length}
- Hot leads: ${hotLeads.length} (${hotLeads.map(l => `${l.name} at ${l.company}`).join(', ')})
- New leads today: ${newLeads.length}
- In proposal stage: ${proposalLeads.length}
- Pipeline value: $${(totalValue / 1000).toFixed(0)}K
- Rep name: ${userName}

Generate a morning briefing in EXACTLY this JSON format:
{
  "greeting": "Personalized good morning message (1 sentence, mention their name)",
  "summary": "2-sentence pipeline summary with specific numbers",
  "topPriorities": [
    {
      "leadName": "${hotLeads[0]?.name || 'Top Lead'}",
      "company": "${hotLeads[0]?.company || 'Company'}",
      "action": "Specific action to take",
      "reason": "Why this is priority #1 today",
      "urgency": "immediate"
    },
    {
      "leadName": "${hotLeads[1]?.name || 'Second Lead'}",
      "company": "${hotLeads[1]?.company || 'Company'}",
      "action": "Specific action to take",
      "reason": "Why this matters today",
      "urgency": "today"
    }
  ],
  "pipelineAlert": "One specific risk or opportunity to watch today",
  "winOfTheDay": "An encouraging observation about the pipeline",
  "focusTip": "One tactical sales tip relevant to today's pipeline"
}`

  try {
    const response = await geminiGenerate(prompt)
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return { ...parsed, generatedAt: new Date() }
    }
    throw new Error('parse failed')
  } catch {
    return getFallbackBriefing(leads, userName, hotLeads, proposalLeads, totalValue)
  }
}

function getFallbackBriefing(
  leads: Lead[],
  userName: string,
  hotLeads: Lead[],
  proposalLeads: Lead[],
  totalValue: number
): DailyBriefing {
  const hour = new Date().getHours()
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return {
    greeting: `${timeGreeting}, ${userName}! Ready to close some deals today?`,
    summary: `You have ${hotLeads.length} hot leads requiring attention and ${proposalLeads.length} proposals in flight. Your pipeline value stands at $${(totalValue / 1000).toFixed(0)}K.`,
    topPriorities: hotLeads.slice(0, 2).map((lead, i) => ({
      leadName: lead.name,
      company: lead.company,
      action: i === 0 ? 'Send personalized follow-up email' : 'Schedule discovery call',
      reason: `AI score ${lead.aiScore}/100 — high conversion probability`,
      urgency: i === 0 ? 'immediate' as const : 'today' as const
    })),
    pipelineAlert: proposalLeads.length > 0
      ? `${proposalLeads.length} proposal(s) need follow-up — deals in this stage close 3x faster with same-day follow-up`
      : `${leads.filter(l => l.status === 'new').length} new leads haven't been contacted yet`,
    winOfTheDay: `Your hot lead pipeline has ${hotLeads.length} qualified opportunities worth $${(hotLeads.reduce((s, l) => s + (l.predictedLifetimeValue || 0), 0) / 1000).toFixed(0)}K in potential value.`,
    focusTip: 'Focus on your top 3 leads before checking email — your best work happens in the first 2 hours.',
    generatedAt: new Date()
  }
}
