import { Lead } from '@/types'

interface ScoringFactors {
  industry: number
  role: number
  source: number
  engagement: number
  company: number
  location: number
  timing: number
}

interface MLFeatures {
  industryScore: number
  roleScore: number
  sourceScore: number
  engagementScore: number
  companySize: number
  locationScore: number
  timingScore: number
  behaviorScore: number
}

export class AILeadScoring {
  // Industry scoring based on conversion data
  private static industryWeights: Record<string, number> = {
    'SaaS': 0.92,
    'FinTech': 0.88,
    'Healthcare': 0.85,
    'E-commerce': 0.82,
    'EdTech': 0.80,
    'Manufacturing': 0.65,
    'Retail': 0.62,
    'Real Estate': 0.58,
    'Consulting': 0.75,
    'Other': 0.50
  }

  // Role scoring based on decision-making power
  private static roleWeights: Record<string, number> = {
    'CEO': 0.95,
    'CTO': 0.92,
    'VP': 0.88,
    'Director': 0.82,
    'Manager': 0.70,
    'Senior': 0.65,
    'Lead': 0.60,
    'Specialist': 0.45,
    'Coordinator': 0.35,
    'Other': 0.30
  }

  // Source quality scoring
  private static sourceWeights: Record<string, number> = {
    'Referral': 0.95,
    'Partner': 0.90,
    'LinkedIn': 0.82,
    'Website': 0.75,
    'Webinar': 0.78,
    'Content Download': 0.72,
    'Email Campaign': 0.55,
    'Cold Outreach': 0.45,
    'Social Media': 0.50,
    'Other': 0.40
  }

  // Location scoring based on market maturity
  private static locationWeights: Record<string, number> = {
    'San Francisco': 0.95,
    'New York': 0.92,
    'Seattle': 0.90,
    'Boston': 0.88,
    'Austin': 0.85,
    'Chicago': 0.82,
    'Los Angeles': 0.80,
    'Denver': 0.78,
    'Atlanta': 0.75,
    'Other': 0.60
  }

  static calculateAdvancedScore(leadData: Partial<Lead>): {
    aiScore: number
    conversionProbability: number
    confidence: number
    factors: ScoringFactors
  } {
    const features = this.extractFeatures(leadData)
    const factors = this.calculateFactors(features)
    
    // Weighted scoring algorithm
    const weights = {
      industry: 0.25,
      role: 0.20,
      source: 0.15,
      engagement: 0.20,
      company: 0.10,
      location: 0.05,
      timing: 0.05
    }

    const rawScore = 
      factors.industry * weights.industry +
      factors.role * weights.role +
      factors.source * weights.source +
      factors.engagement * weights.engagement +
      factors.company * weights.company +
      factors.location * weights.location +
      factors.timing * weights.timing

    // Apply ML-like transformations
    const aiScore = Math.round(this.sigmoid(rawScore) * 100)
    const conversionProbability = this.calculateConversionProbability(aiScore, features)
    const confidence = this.calculateConfidence(features)

    return {
      aiScore,
      conversionProbability,
      confidence,
      factors
    }
  }

  private static extractFeatures(leadData: Partial<Lead>): MLFeatures {
    return {
      industryScore: this.getIndustryScore(leadData.industry),
      roleScore: this.getRoleScore(leadData.role),
      sourceScore: this.getSourceScore(leadData.source),
      engagementScore: (leadData.engagementScore || 0) / 100,
      companySize: this.estimateCompanySize(leadData.company),
      locationScore: this.getLocationScore(leadData.location),
      timingScore: this.getTimingScore(leadData.createdAt),
      behaviorScore: this.calculateBehaviorScore(leadData)
    }
  }

  private static calculateFactors(features: MLFeatures): ScoringFactors {
    return {
      industry: features.industryScore * 100,
      role: features.roleScore * 100,
      source: features.sourceScore * 100,
      engagement: features.engagementScore * 100,
      company: features.companySize * 100,
      location: features.locationScore * 100,
      timing: features.timingScore * 100
    }
  }

  private static getIndustryScore(industry?: string): number {
    if (!industry) return 0.5
    
    const normalizedIndustry = Object.keys(this.industryWeights).find(key =>
      industry.toLowerCase().includes(key.toLowerCase())
    )
    
    return this.industryWeights[normalizedIndustry || 'Other']
  }

  private static getRoleScore(role?: string): number {
    if (!role) return 0.3
    
    const normalizedRole = Object.keys(this.roleWeights).find(key =>
      role.toLowerCase().includes(key.toLowerCase())
    )
    
    return this.roleWeights[normalizedRole || 'Other']
  }

  private static getSourceScore(source?: string): number {
    if (!source) return 0.4
    
    const normalizedSource = Object.keys(this.sourceWeights).find(key =>
      source.toLowerCase().includes(key.toLowerCase())
    )
    
    return this.sourceWeights[normalizedSource || 'Other']
  }

  private static getLocationScore(location?: string): number {
    if (!location) return 0.6
    
    const normalizedLocation = Object.keys(this.locationWeights).find(key =>
      location.toLowerCase().includes(key.toLowerCase())
    )
    
    return this.locationWeights[normalizedLocation || 'Other']
  }

  private static estimateCompanySize(company?: string): number {
    if (!company) return 0.5
    
    // Simple heuristics for company size estimation
    const companyName = company.toLowerCase()
    
    if (companyName.includes('inc') || companyName.includes('corp') || companyName.includes('ltd')) {
      return 0.8 // Likely larger company
    }
    
    if (companyName.includes('startup') || companyName.includes('labs')) {
      return 0.6 // Likely smaller but innovative
    }
    
    return 0.7 // Default assumption
  }

  private static getTimingScore(createdAt?: Date): number {
    if (!createdAt) return 0.5
    
    const now = new Date()
    const daysSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    
    // Fresher leads score higher
    if (daysSinceCreated <= 1) return 0.95
    if (daysSinceCreated <= 3) return 0.85
    if (daysSinceCreated <= 7) return 0.75
    if (daysSinceCreated <= 14) return 0.65
    if (daysSinceCreated <= 30) return 0.55
    
    return 0.45
  }

  private static calculateBehaviorScore(leadData: Partial<Lead>): number {
    let score = 0.5
    
    // Email engagement
    if (leadData.email) score += 0.1
    
    // Phone availability
    if (leadData.phone) score += 0.1
    
    // Notes indicate interaction
    if (leadData.notes && leadData.notes.length > 0) score += 0.2
    
    return Math.min(score, 1.0)
  }

  private static calculateConversionProbability(aiScore: number, features: MLFeatures): number {
    // Advanced probability calculation using multiple factors
    let baseProbability = aiScore * 0.8 // Base conversion rate correlation
    
    // Industry multipliers
    if (features.industryScore > 0.85) baseProbability *= 1.2
    if (features.roleScore > 0.85) baseProbability *= 1.15
    if (features.sourceScore > 0.80) baseProbability *= 1.1
    if (features.engagementScore > 0.70) baseProbability *= 1.25
    
    // Apply sigmoid to keep probability realistic
    return Math.min(this.sigmoid(baseProbability / 100) * 100, 95)
  }

  private static calculateConfidence(features: MLFeatures): number {
    // Confidence based on data completeness and quality
    let confidence = 0.5
    
    if (features.industryScore > 0) confidence += 0.15
    if (features.roleScore > 0) confidence += 0.15
    if (features.sourceScore > 0) confidence += 0.10
    if (features.engagementScore > 0) confidence += 0.10
    if (features.locationScore > 0) confidence += 0.05
    if (features.behaviorScore > 0.5) confidence += 0.05
    
    return Math.min(confidence, 0.95)
  }

  private static sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x))
  }

  // Generate personalized recommendations based on scoring factors
  static generateRecommendations(leadData: Partial<Lead>, scoringResult: any): string[] {
    const recommendations: string[] = []
    const { aiScore, factors } = scoringResult

    if (aiScore >= 80) {
      recommendations.push('🔥 High-priority lead - Contact within 24 hours')
    }

    if (factors.engagement < 50) {
      recommendations.push('📧 Send educational content before sales pitch')
    }

    if (factors.timing > 80) {
      recommendations.push('⏰ Fresh lead - Strike while interest is hot')
    }

    if (factors.role > 80) {
      recommendations.push('👑 Decision maker identified - Direct approach recommended')
    }

    if (factors.source > 80) {
      recommendations.push('🎯 High-quality source - Leverage referral context')
    }

    if (factors.industry > 80) {
      recommendations.push('🏢 Target industry - Use industry-specific messaging')
    }

    return recommendations
  }

  // Batch scoring for multiple leads
  static batchScore(leads: Partial<Lead>[]): Array<{
    leadId: string
    aiScore: number
    conversionProbability: number
    confidence: number
    recommendations: string[]
  }> {
    return leads.map(lead => {
      const scoringResult = this.calculateAdvancedScore(lead)
      const recommendations = this.generateRecommendations(lead, scoringResult)
      
      return {
        leadId: lead.id || '',
        ...scoringResult,
        recommendations
      }
    })
  }
}