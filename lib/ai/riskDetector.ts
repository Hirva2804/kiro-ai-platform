import { Lead } from '@/types'

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low'

export interface RiskSignal {
  type: string
  description: string
  severity: RiskLevel
  daysSince?: number
  recommendation: string
}

export interface RiskAssessment {
  overallRisk: RiskLevel
  riskScore: number // 0-100, higher = more at risk
  signals: RiskSignal[]
  daysUntilChurn: number | null
  recoveryActions: string[]
}

export function assessLeadRisk(
  lead: Lead,
  lastActivityDate?: Date,
  activityCount?: number
): RiskAssessment {
  const signals: RiskSignal[] = []
  let riskScore = 0

  const now = new Date()
  const daysSinceCreated = (now.getTime() - new Date(lead.createdAt).getTime()) / 86400000
  const daysSinceActivity = lastActivityDate
    ? (now.getTime() - lastActivityDate.getTime()) / 86400000
    : daysSinceCreated

  // No activity signal
  if (daysSinceActivity > 14) {
    const severity: RiskLevel = daysSinceActivity > 30 ? 'critical' : daysSinceActivity > 21 ? 'high' : 'medium'
    riskScore += daysSinceActivity > 30 ? 40 : daysSinceActivity > 21 ? 25 : 15
    signals.push({
      type: 'Inactivity',
      description: `No activity for ${Math.floor(daysSinceActivity)} days`,
      severity,
      daysSince: Math.floor(daysSinceActivity),
      recommendation: 'Send a re-engagement email with new value proposition'
    })
  }

  // Low engagement
  if (lead.engagementScore < 30) {
    riskScore += 25
    signals.push({
      type: 'Low Engagement',
      description: `Engagement score is ${lead.engagementScore}/100 — well below average`,
      severity: 'high',
      recommendation: 'Switch to educational nurture content before direct outreach'
    })
  } else if (lead.engagementScore < 50) {
    riskScore += 10
    signals.push({
      type: 'Declining Engagement',
      description: `Engagement score ${lead.engagementScore}/100 is below average`,
      severity: 'medium',
      recommendation: 'Increase touchpoint frequency with personalized content'
    })
  }

  // Stalled status
  const stalledDays: Record<string, number> = {
    contacted: 7, qualified: 14, proposal: 10
  }
  const maxDays = stalledDays[lead.status]
  if (maxDays && daysSinceCreated > maxDays) {
    riskScore += 20
    signals.push({
      type: 'Stalled Pipeline',
      description: `Lead has been in "${lead.status}" stage for ${Math.floor(daysSinceCreated)} days`,
      severity: daysSinceCreated > maxDays * 2 ? 'critical' : 'high',
      recommendation: `Move forward or disqualify — stalled leads rarely convert after ${maxDays * 2} days`
    })
  }

  // Low AI score
  if (lead.aiScore < 40) {
    riskScore += 15
    signals.push({
      type: 'Low AI Score',
      description: `AI score ${lead.aiScore}/100 indicates poor fit`,
      severity: 'medium',
      recommendation: 'Consider deprioritizing or moving to long-term nurture sequence'
    })
  }

  // No contact info
  if (!lead.email && !lead.phone) {
    riskScore += 20
    signals.push({
      type: 'Missing Contact Info',
      description: 'No email or phone number on file',
      severity: 'high',
      recommendation: 'Enrich contact data via LinkedIn or data enrichment tools'
    })
  }

  // Low activity count
  if (activityCount !== undefined && activityCount === 0) {
    riskScore += 15
    signals.push({
      type: 'No Touchpoints',
      description: 'Zero recorded interactions with this lead',
      severity: 'high',
      recommendation: 'Initiate first contact immediately — fresh leads go cold fast'
    })
  }

  const overallRisk: RiskLevel =
    riskScore >= 70 ? 'critical' :
    riskScore >= 45 ? 'high' :
    riskScore >= 20 ? 'medium' : 'low'

  const daysUntilChurn = riskScore >= 70 ? 3 : riskScore >= 45 ? 7 : riskScore >= 20 ? 14 : null

  const recoveryActions = signals
    .sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 }
      return order[a.severity] - order[b.severity]
    })
    .slice(0, 3)
    .map(s => s.recommendation)

  return { overallRisk, riskScore: Math.min(riskScore, 100), signals, daysUntilChurn, recoveryActions }
}

export const RISK_COLORS: Record<RiskLevel, string> = {
  critical: 'text-red-700 bg-red-100 border-red-200',
  high: 'text-orange-700 bg-orange-100 border-orange-200',
  medium: 'text-yellow-700 bg-yellow-100 border-yellow-200',
  low: 'text-green-700 bg-green-100 border-green-200'
}

export const RISK_BADGE: Record<RiskLevel, string> = {
  critical: 'bg-red-500 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-white',
  low: 'bg-green-500 text-white'
}
