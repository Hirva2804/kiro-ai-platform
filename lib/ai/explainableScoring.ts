import { geminiGenerate } from './gemini'
import { Lead } from '@/types'

export interface ScoringSignal {
  factor: string
  impact: 'positive' | 'negative' | 'neutral'
  weight: number        // 0-100
  description: string
  value: string
}

export interface ExplainedScore {
  aiScore: number
  conversionProbability: number
  confidence: number
  category: 'hot' | 'warm' | 'cold'
  signals: ScoringSignal[]
  explanation: string       // Gemini-generated human reasoning
  topReasons: string[]      // "Why this lead is hot/cold"
  scoreHistory: ScoreEvent[]
  intentLevel: 'low' | 'medium' | 'high'
}

export interface ScoreEvent {
  timestamp: Date
  scoreDelta: number
  reason: string
  newScore: number
}

// Deterministic signal extraction — no AI needed for this part
export function extractSignals(lead: Partial<Lead> & { pageVisits?: PageVisit[] }): ScoringSignal[] {
  const signals: ScoringSignal[] = []

  // Industry signal
  const industryScores: Record<string, number> = {
    SaaS: 92, FinTech: 88, Healthcare: 85, EdTech: 80,
    Consulting: 75, Manufacturing: 65, Retail: 62, Other: 50
  }
  const industryScore = industryScores[lead.industry || ''] ?? 50
  signals.push({
    factor: 'Industry',
    impact: industryScore >= 80 ? 'positive' : industryScore >= 65 ? 'neutral' : 'negative',
    weight: industryScore,
    description: `${lead.industry || 'Unknown'} industry has ${industryScore >= 80 ? 'high' : industryScore >= 65 ? 'moderate' : 'low'} conversion rates`,
    value: lead.industry || 'Unknown'
  })

  // Role / seniority signal
  const role = (lead.role || '').toLowerCase()
  let roleScore = 40
  let roleLabel = 'Individual Contributor'
  if (/ceo|cto|coo|cfo|founder|president/.test(role)) { roleScore = 95; roleLabel = 'C-Suite Executive' }
  else if (/vp|vice president/.test(role)) { roleScore = 88; roleLabel = 'VP Level' }
  else if (/director/.test(role)) { roleScore = 82; roleLabel = 'Director Level' }
  else if (/manager|head of/.test(role)) { roleScore = 70; roleLabel = 'Manager Level' }
  else if (/senior|lead/.test(role)) { roleScore = 60; roleLabel = 'Senior Individual' }
  signals.push({
    factor: 'Decision Authority',
    impact: roleScore >= 80 ? 'positive' : roleScore >= 60 ? 'neutral' : 'negative',
    weight: roleScore,
    description: `${roleLabel} — ${roleScore >= 80 ? 'high' : roleScore >= 60 ? 'moderate' : 'low'} budget authority`,
    value: lead.role || 'Unknown'
  })

  // Source signal
  const sourceScores: Record<string, number> = {
    Referral: 95, Partner: 90, LinkedIn: 82, Website: 75,
    Webinar: 78, 'Email Campaign': 55, 'Cold Outreach': 45, Other: 40
  }
  const sourceScore = sourceScores[lead.source || ''] ?? 40
  signals.push({
    factor: 'Lead Source',
    impact: sourceScore >= 80 ? 'positive' : sourceScore >= 60 ? 'neutral' : 'negative',
    weight: sourceScore,
    description: `${lead.source || 'Unknown'} source — ${sourceScore >= 80 ? 'high' : sourceScore >= 60 ? 'moderate' : 'low'} quality channel`,
    value: lead.source || 'Unknown'
  })

  // Engagement signal
  const eng = lead.engagementScore ?? 0
  signals.push({
    factor: 'Engagement Score',
    impact: eng >= 70 ? 'positive' : eng >= 40 ? 'neutral' : 'negative',
    weight: eng,
    description: eng >= 70 ? 'High engagement — actively interacting with content' :
                 eng >= 40 ? 'Moderate engagement — some interest shown' :
                 'Low engagement — minimal interaction detected',
    value: `${eng}/100`
  })

  // Page visit intent signals
  const visits = lead.pageVisits || []
  if (visits.length > 0) {
    const pricingVisits = visits.filter(v => v.page.includes('pricing')).length
    const demoVisits = visits.filter(v => v.page.includes('demo')).length
    const totalTime = visits.reduce((sum, v) => sum + v.timeSpent, 0)

    if (pricingVisits > 0) {
      signals.push({
        factor: 'Pricing Page Visit',
        impact: 'positive',
        weight: Math.min(60 + pricingVisits * 15, 95),
        description: `Visited pricing page ${pricingVisits} time(s) — strong buying intent signal`,
        value: `${pricingVisits} visit(s)`
      })
    }

    if (demoVisits > 0) {
      signals.push({
        factor: 'Demo Page Visit',
        impact: 'positive',
        weight: Math.min(55 + demoVisits * 10, 90),
        description: `Visited demo page ${demoVisits} time(s) — evaluating solution`,
        value: `${demoVisits} visit(s)`
      })
    }

    if (totalTime > 300) {
      signals.push({
        factor: 'Time on Site',
        impact: 'positive',
        weight: Math.min(50 + Math.floor(totalTime / 60) * 5, 85),
        description: `Spent ${Math.floor(totalTime / 60)} minutes on site — high interest level`,
        value: `${Math.floor(totalTime / 60)} min`
      })
    }
  }

  // Recency signal
  if (lead.createdAt) {
    const daysSince = (Date.now() - new Date(lead.createdAt).getTime()) / 86400000
    const recencyScore = daysSince <= 1 ? 95 : daysSince <= 3 ? 85 : daysSince <= 7 ? 70 : daysSince <= 14 ? 55 : 40
    signals.push({
      factor: 'Lead Freshness',
      impact: recencyScore >= 80 ? 'positive' : recencyScore >= 60 ? 'neutral' : 'negative',
      weight: recencyScore,
      description: daysSince <= 1 ? 'Created today — strike while interest is hot' :
                   daysSince <= 7 ? `Created ${Math.floor(daysSince)} days ago — still fresh` :
                   `Created ${Math.floor(daysSince)} days ago — follow up urgently`,
      value: daysSince <= 1 ? 'Today' : `${Math.floor(daysSince)}d ago`
    })
  }

  return signals
}

// Compute final score from signals
export function computeScore(signals: ScoringSignal[]): {
  aiScore: number
  conversionProbability: number
  confidence: number
  category: 'hot' | 'warm' | 'cold'
} {
  const weights = {
    'Industry': 0.20,
    'Decision Authority': 0.22,
    'Lead Source': 0.15,
    'Engagement Score': 0.18,
    'Pricing Page Visit': 0.10,
    'Demo Page Visit': 0.07,
    'Time on Site': 0.04,
    'Lead Freshness': 0.04
  }

  let weightedSum = 0
  let totalWeight = 0

  for (const signal of signals) {
    const w = weights[signal.factor as keyof typeof weights] ?? 0.03
    weightedSum += signal.weight * w
    totalWeight += w
  }

  const rawScore = totalWeight > 0 ? weightedSum / totalWeight : 50
  const aiScore = Math.round(Math.min(Math.max(rawScore, 0), 100))
  const conversionProbability = parseFloat((aiScore * 0.85 + Math.random() * 5).toFixed(1))
  const confidence = Math.min(0.5 + signals.length * 0.07, 0.97)
  const category: 'hot' | 'warm' | 'cold' = aiScore >= 80 ? 'hot' : aiScore >= 60 ? 'warm' : 'cold'

  return { aiScore, conversionProbability, confidence, category }
}

// Gemini-powered explanation (Feature 2 — "Why this lead?")
export async function generateScoreExplanation(
  lead: Partial<Lead>,
  signals: ScoringSignal[],
  score: number
): Promise<{ explanation: string; topReasons: string[] }> {
  const signalSummary = signals
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5)
    .map(s => `- ${s.factor}: ${s.value} (${s.description})`)
    .join('\n')

  const prompt = `You are an expert B2B sales intelligence analyst. Explain why this lead scored ${score}/100.

Lead Profile:
- Name: ${lead.name || 'Unknown'}
- Company: ${lead.company || 'Unknown'}
- Role: ${lead.role || 'Unknown'}
- Industry: ${lead.industry || 'Unknown'}
- Source: ${lead.source || 'Unknown'}

Top Scoring Signals:
${signalSummary}

Provide:
1. A 2-3 sentence plain-English explanation of why this lead scored ${score}/100
2. Exactly 3 bullet points starting with "•" explaining the top reasons

Be specific, actionable, and concise. No fluff.`

  try {
    const response = await geminiGenerate(prompt)
    const lines = response.split('\n').filter(l => l.trim())
    const bulletLines = lines.filter(l => l.trim().startsWith('•'))
    const explanationLines = lines.filter(l => !l.trim().startsWith('•') && l.trim().length > 20)

    return {
      explanation: explanationLines.slice(0, 2).join(' ').trim() || response.substring(0, 200),
      topReasons: bulletLines.slice(0, 3).map(l => l.replace('•', '').trim())
    }
  } catch {
    const topSignals = signals.sort((a, b) => b.weight - a.weight).slice(0, 3)
    return {
      explanation: `This lead scored ${score}/100 based on ${topSignals.map(s => s.factor.toLowerCase()).join(', ')} analysis.`,
      topReasons: topSignals.map(s => `${s.factor}: ${s.description}`)
    }
  }
}

// Detect buying intent from page behavior (Feature 5)
export function detectIntent(pageVisits: PageVisit[]): 'low' | 'medium' | 'high' {
  if (!pageVisits || pageVisits.length === 0) return 'low'

  let intentScore = 0
  const highIntentPages = ['pricing', 'demo', 'trial', 'buy', 'checkout', 'contact']
  const mediumIntentPages = ['features', 'solutions', 'case-studies', 'integrations']

  for (const visit of pageVisits) {
    const page = visit.page.toLowerCase()
    if (highIntentPages.some(p => page.includes(p))) intentScore += 30
    else if (mediumIntentPages.some(p => page.includes(p))) intentScore += 15
    else intentScore += 5

    if (visit.timeSpent > 120) intentScore += 10
    if (visit.scrollDepth > 75) intentScore += 5
  }

  if (intentScore >= 80) return 'high'
  if (intentScore >= 40) return 'medium'
  return 'low'
}

export interface PageVisit {
  page: string
  timeSpent: number   // seconds
  scrollDepth: number // 0-100
  timestamp: Date
}