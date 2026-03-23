import { geminiGenerate } from './gemini'
import { Lead } from '@/types'

export interface EnrichmentResult {
  estimatedCompanySize: string
  estimatedRevenue: string
  techStack: string[]
  painPoints: string[]
  buyingSignals: string[]
  competitorsUsed: string[]
  linkedinUrl: string
  twitterUrl: string
  companyDescription: string
  fundingStage: string
  decisionMakingProcess: string
}

export async function enrichLead(lead: Partial<Lead>): Promise<EnrichmentResult> {
  const prompt = `You are a B2B sales intelligence analyst. Based on the company and role information, provide realistic enrichment data.

Company: ${lead.company}
Role: ${lead.role}
Industry: ${lead.industry}
Location: ${lead.location}

Provide enrichment in EXACTLY this JSON format (no markdown, just JSON):
{
  "estimatedCompanySize": "51-200 employees",
  "estimatedRevenue": "$10M-$50M ARR",
  "techStack": ["Salesforce", "HubSpot", "Slack"],
  "painPoints": ["Manual lead qualification", "Poor CRM data quality"],
  "buyingSignals": ["Recently hired VP Sales", "Expanding to new markets"],
  "competitorsUsed": ["Competitor A", "Competitor B"],
  "linkedinUrl": "https://linkedin.com/company/example",
  "twitterUrl": "https://twitter.com/example",
  "companyDescription": "Brief 1-sentence description",
  "fundingStage": "Series B",
  "decisionMakingProcess": "Committee-based, 3-4 stakeholders, 30-60 day cycle"
}`

  try {
    const response = await geminiGenerate(prompt)
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('No JSON found')
  } catch {
    return getFallbackEnrichment(lead)
  }
}

function getFallbackEnrichment(lead: Partial<Lead>): EnrichmentResult {
  const sizeMap: Record<string, string> = {
    SaaS: '51-200 employees', FinTech: '201-500 employees',
    Healthcare: '501-1000 employees', Manufacturing: '1000+ employees',
    Retail: '201-500 employees', Other: '11-50 employees'
  }
  return {
    estimatedCompanySize: sizeMap[lead.industry || ''] || '51-200 employees',
    estimatedRevenue: '$5M-$20M ARR',
    techStack: ['Salesforce', 'Slack', 'Google Workspace'],
    painPoints: ['Manual processes', 'Data silos', 'Poor lead visibility'],
    buyingSignals: ['Active hiring in sales', 'Recent funding'],
    competitorsUsed: ['Generic CRM', 'Spreadsheets'],
    linkedinUrl: `https://linkedin.com/company/${(lead.company || '').toLowerCase().replace(/\s+/g, '-')}`,
    twitterUrl: '',
    companyDescription: `${lead.company} is a ${lead.industry} company based in ${lead.location}.`,
    fundingStage: 'Series A',
    decisionMakingProcess: '2-3 stakeholders, 30-45 day cycle'
  }
}
