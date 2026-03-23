import { NextRequest, NextResponse } from 'next/server'
import { geminiChat } from '@/lib/ai/gemini'
import { getLeads, createLead } from '@/lib/data'
import { calculateAIScore, getLeadCategory, getConversionProbability } from '@/lib/leads'

// ─── System prompts per mode ──────────────────────────────────────────────────

function getSalesCopilotPrompt(dataContext: string) {
  return `You are an expert B2B sales intelligence assistant embedded inside LeadIQ Pro dashboard.
You have real-time access to the user's pipeline data below. Be concise, data-driven, and actionable.
Use bullet points for lists. Reference specific names and numbers. Suggest next actions.

${dataContext}`
}

function getLeadQualifierPrompt() {
  return `You are a friendly B2B lead qualification assistant for LeadIQ Pro — an AI-powered sales intelligence platform.
Your job is to qualify website visitors as potential customers through natural conversation.

QUALIFICATION FLOW (follow this order, one question at a time):
1. Greet warmly and ask their name and company
2. Ask about their team size / number of sales reps
3. Ask about their current lead management process (CRM? spreadsheets? nothing?)
4. Ask about their biggest sales challenge right now
5. Ask about budget range (under $500/mo, $500-2000/mo, $2000+/mo)
6. Ask about timeline to implement a solution

After collecting all info, give a personalized summary of how LeadIQ Pro solves their specific challenges.
Then ask if they'd like to start a free trial or book a demo.

RULES:
- Ask ONE question at a time
- Be conversational, not robotic
- If they ask about features/pricing, answer briefly then continue qualifying
- When you have enough info, output a JSON block at the end of your message (hidden from display):
  LEAD_DATA:{"name":"...","company":"...","role":"...","industry":"...","source":"Website Chat","notes":"...","qualified":true}
- Keep responses under 3 sentences unless explaining a feature`
}

function getSalesAgentPrompt(leadContext: string) {
  return `You are a skilled B2B sales agent having a conversation with a prospect on behalf of LeadIQ Pro.
Your goal is to understand their needs, handle objections, and move them toward booking a demo or starting a trial.

Lead context:
${leadContext}

CAPABILITIES:
- Answer product questions confidently
- Handle objections with empathy + evidence
- Suggest relevant case studies based on their industry
- Push toward conversion: free trial, demo booking, or pricing discussion
- If they want to book a meeting, say: "I'll have our team reach out within 1 business day to schedule a demo."

TONE: Professional, helpful, consultative — never pushy.
Keep responses concise (2-4 sentences max unless explaining something complex).`
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const { messages, mode = 'copilot', leadContext, context } = await request.json()

    let systemPrompt = ''

    if (mode === 'copilot') {
      // Build live pipeline data context
      const leads = await getLeads()
      const hot = leads.filter(l => l.category === 'hot')
      const warm = leads.filter(l => l.category === 'warm')
      const cold = leads.filter(l => l.category === 'cold')
      const totalValue = leads.reduce((s, l) => s + (l.predictedLifetimeValue || 0), 0)
      const avgScore = leads.length > 0 ? leads.reduce((s, l) => s + l.aiScore, 0) / leads.length : 0
      const converted = leads.filter(l => l.status === 'converted')
      const bySource = leads.reduce((acc: Record<string, number>, l) => {
        acc[l.source] = (acc[l.source] || 0) + 1; return acc
      }, {})
      const topSource = Object.entries(bySource).sort((a, b) => b[1] - a[1])[0]

      // Full lead details for individual lookups
      const leadDetails = leads.map(l =>
        `• ${l.name} | ${l.company} | ${l.role} | ${l.industry} | ${l.location} | ` +
        `Email: ${l.email || 'N/A'} | Phone: ${l.phone || 'N/A'} | ` +
        `Score: ${l.aiScore}/100 | Category: ${l.category} | Status: ${l.status} | ` +
        `Source: ${l.source} | Value: $${(l.predictedLifetimeValue || 0).toLocaleString()} | ` +
        `Conversion: ${l.conversionProbability?.toFixed(1)}% | Notes: ${l.notes || 'none'}`
      ).join('\n')

      const dataContext = `LIVE PIPELINE SUMMARY:
- Total leads: ${leads.length} (Hot: ${hot.length}, Warm: ${warm.length}, Cold: ${cold.length})
- Average AI score: ${avgScore.toFixed(1)}/100
- Total pipeline value: $${totalValue.toLocaleString()}
- Converted: ${converted.length} | Needs contact: ${leads.filter(l => l.status === 'new').length}
- Top source: ${topSource ? `${topSource[0]} (${topSource[1]} leads)` : 'N/A'}
- Industries: ${[...new Set(leads.map(l => l.industry))].join(', ')}

FULL LEAD DATABASE (${leads.length} leads):
${leadDetails}
${context ? `\nExtra context: ${context}` : ''}`

      systemPrompt = getSalesCopilotPrompt(dataContext)

    } else if (mode === 'qualifier') {
      systemPrompt = getLeadQualifierPrompt()

    } else if (mode === 'agent') {
      systemPrompt = getSalesAgentPrompt(leadContext || 'No specific lead context provided.')
    }

    // Map messages to Gemini format
    const history = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      content: m.content
    }))

    const response = await geminiChat(history, systemPrompt)

    // Auto-extract and save lead data from qualifier mode
    let savedLead = null
    if (mode === 'qualifier' && response.includes('LEAD_DATA:')) {
      try {
        const match = response.match(/LEAD_DATA:(\{.*?\})/s)
        if (match) {
          const raw = JSON.parse(match[1])
          if (raw.qualified && raw.name && raw.company) {
            const aiScore = calculateAIScore({ industry: raw.industry, role: raw.role, source: raw.source })
            savedLead = await createLead({
              name: raw.name,
              company: raw.company || '',
              role: raw.role || 'Unknown',
              industry: raw.industry || 'Other',
              location: raw.location || '',
              source: 'Website Chat',
              email: raw.email || '',
              phone: raw.phone || '',
              engagementScore: 65,
              aiScore,
              category: getLeadCategory(aiScore),
              conversionProbability: getConversionProbability(aiScore),
              status: 'new',
              notes: raw.notes || '',
              predictedLifetimeValue: Math.floor(getConversionProbability(aiScore) * 800),
            })
          }
        }
      } catch (e) {
        console.warn('[chat] Lead extraction failed:', e)
      }
    }

    // Strip the hidden LEAD_DATA block from the visible response
    const cleanResponse = response.replace(/LEAD_DATA:\{.*?\}/s, '').trim()

    return NextResponse.json({ response: cleanResponse, savedLead })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'AI service error' }, { status: 500 })
  }
}
