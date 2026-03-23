export interface MarketInsight {
  id: string
  title: string
  category: 'industry_trend' | 'competitive_intel' | 'market_data' | 'best_practice'
  industry: string
  content: string
  keyTakeaways: string[]
  actionableAdvice: string[]
  sources: string[]
  publishedDate: Date
  relevanceScore: number
}

export const marketInsights: MarketInsight[] = [
  {
    id: 'saas-growth-2024',
    title: 'SaaS Market Growth Trends 2024: What Sales Teams Need to Know',
    category: 'industry_trend',
    industry: 'SaaS',
    content: `The SaaS market continues its explosive growth trajectory in 2024, with several key trends reshaping how companies buy and implement software solutions.

**Key Market Dynamics:**

1. **Increased Scrutiny on ROI**: With economic uncertainty, buyers are demanding clearer ROI demonstrations. The average evaluation period has increased by 23% compared to 2023.

2. **Multi-Stakeholder Decision Making**: The average SaaS purchase now involves 6.8 stakeholders, up from 5.4 in 2022. This includes technical, financial, and end-user representatives.

3. **Security-First Approach**: 78% of enterprise buyers now list security and compliance as their top evaluation criteria, ahead of functionality and price.

4. **Trial-to-Purchase Expectations**: 89% of SaaS buyers expect a hands-on trial period, with 34% requiring trials longer than 30 days.

**Buyer Behavior Changes:**

- Self-service research phase has extended to 67% of the buying journey
- Buyers consume an average of 13 pieces of content before engaging with sales
- Video content consumption has increased by 156% in the evaluation process
- Peer reviews and case studies influence 84% of final decisions

**Pricing Model Evolution:**

The shift toward usage-based pricing continues, with 43% of new SaaS companies adopting consumption-based models. This creates opportunities for land-and-expand strategies but requires different sales approaches.`,
    keyTakeaways: [
      'ROI demonstration is critical - prepare detailed business cases',
      'Multi-stakeholder selling requires coordinated approach',
      'Security and compliance are table stakes, not differentiators',
      'Extended trial periods are becoming standard expectation',
      'Content marketing significantly influences buyer decisions'
    ],
    actionableAdvice: [
      'Develop ROI calculators specific to different company sizes and use cases',
      'Create stakeholder-specific content and presentations',
      'Lead with security and compliance credentials in initial outreach',
      'Design trial experiences that showcase core value within 7 days',
      'Invest in case studies and video testimonials from similar companies',
      'Implement account-based marketing for enterprise prospects'
    ],
    sources: [
      'SaaS Industry Report 2024 - Bessemer Venture Partners',
      'State of SaaS Buying - ChartIO Research',
      'Enterprise Software Trends - Gartner'
    ],
    publishedDate: new Date('2024-01-15'),
    relevanceScore: 95
  },
  {
    id: 'fintech-compliance-2024',
    title: 'FinTech Compliance Landscape: New Regulations and Sales Opportunities',
    category: 'market_data',
    industry: 'FinTech',
    content: `The FinTech regulatory environment continues to evolve rapidly, creating both challenges and opportunities for solution providers.

**Regulatory Updates:**

1. **Open Banking Expansion**: Open banking regulations are expanding beyond payments to include lending, investments, and insurance products. This creates demand for API management and data security solutions.

2. **AI/ML Governance**: New guidelines for AI usage in financial services require explainable AI models and bias testing. 67% of FinTech companies are actively seeking compliance solutions.

3. **Data Privacy Enhancements**: Enhanced data privacy requirements similar to GDPR are being implemented globally, affecting data handling and customer consent processes.

**Market Opportunities:**

- RegTech market expected to reach $55.28 billion by 2025
- 73% of FinTech companies plan to increase compliance technology spending
- Average compliance cost is 4.7% of revenue for mid-size FinTech companies

**Buyer Priorities:**

1. Automated compliance reporting (mentioned by 89% of prospects)
2. Real-time risk monitoring (76% priority)
3. Audit trail capabilities (71% requirement)
4. Integration with existing systems (68% must-have)`,
    keyTakeaways: [
      'Compliance is a growth driver, not just a cost center',
      'Automation is key to managing increasing regulatory complexity',
      'Integration capabilities are critical for adoption',
      'Real-time monitoring is becoming standard expectation'
    ],
    actionableAdvice: [
      'Position solutions as revenue enablers through faster compliance',
      'Develop regulatory change management messaging',
      'Create compliance ROI calculators showing cost of non-compliance',
      'Partner with regulatory consultants for credibility',
      'Offer compliance-as-a-service models for smaller FinTechs'
    ],
    sources: [
      'FinTech Regulatory Report 2024 - PwC',
      'RegTech Market Analysis - Deloitte',
      'Financial Services Compliance Survey - EY'
    ],
    publishedDate: new Date('2024-01-10'),
    relevanceScore: 88
  },
  {
    id: 'healthcare-digital-transformation',
    title: 'Healthcare Digital Transformation: Post-Pandemic Acceleration',
    category: 'industry_trend',
    industry: 'Healthcare',
    content: `The healthcare industry's digital transformation has accelerated dramatically post-pandemic, with technology adoption rates increasing by 300% in some areas.

**Key Transformation Areas:**

1. **Telemedicine Integration**: 78% of healthcare providers now offer telemedicine services, up from 11% pre-pandemic. This drives demand for integration platforms and patient engagement tools.

2. **AI-Powered Diagnostics**: 45% of healthcare organizations are piloting AI diagnostic tools, with radiology and pathology leading adoption.

3. **Patient Data Platforms**: Unified patient data platforms are becoming critical, with 67% of providers seeking solutions that aggregate data from multiple sources.

4. **Remote Patient Monitoring**: RPM adoption has grown 1,200% since 2020, creating opportunities for IoT and analytics solutions.

**Buying Behavior Changes:**

- Decision cycles have shortened by 35% for proven technologies
- Clinical evidence requirements have increased significantly
- IT and clinical teams now collaborate more closely in vendor selection
- Pilot programs are preferred over large-scale implementations

**Investment Priorities:**

1. Interoperability solutions (89% of organizations)
2. Cybersecurity enhancements (84% priority)
3. Patient engagement platforms (76% focus)
4. Analytics and reporting tools (71% investment)`,
    keyTakeaways: [
      'Clinical evidence is essential for healthcare sales success',
      'Interoperability is the top technical requirement',
      'Pilot-first approach reduces implementation risk',
      'Patient outcomes drive purchasing decisions'
    ],
    actionableAdvice: [
      'Develop clinical outcome studies and peer-reviewed research',
      'Create interoperability compatibility matrices',
      'Offer pilot programs with clear success metrics',
      'Partner with clinical champions for credibility',
      'Focus on patient outcome improvements in messaging',
      'Prepare for longer evaluation cycles with multiple stakeholders'
    ],
    sources: [
      'Healthcare IT Market Report 2024 - HIMSS',
      'Digital Health Trends - McKinsey Health Institute',
      'Healthcare Technology Survey - Accenture'
    ],
    publishedDate: new Date('2024-01-08'),
    relevanceScore: 92
  },
  {
    id: 'b2b-sales-best-practices-2024',
    title: 'B2B Sales Best Practices: What Top Performers Do Differently',
    category: 'best_practice',
    industry: 'General',
    content: `Analysis of top-performing B2B sales teams reveals key practices that drive superior results across industries.

**Top Performer Characteristics:**

1. **Research-Driven Approach**: Top performers spend 43% more time on pre-call research and preparation compared to average performers.

2. **Multi-Channel Engagement**: High performers use an average of 8 touchpoints across 4 channels, while average performers use 5 touchpoints across 2 channels.

3. **Value-First Messaging**: 89% of top performers lead with customer value and outcomes rather than product features.

4. **Systematic Follow-Up**: Top performers have structured follow-up processes with 73% following up within 24 hours of initial contact.

**Technology Usage:**

- CRM adoption: 97% of top performers vs. 78% of average performers
- Sales intelligence tools: 84% vs. 45%
- Video in outreach: 76% vs. 23%
- Social selling: 91% vs. 34%

**Conversion Metrics:**

Top performers achieve:
- 2.3x higher email response rates
- 1.8x better meeting conversion rates
- 1.6x shorter sales cycles
- 2.1x higher average deal sizes

**Key Differentiators:**

1. Consultative selling approach (vs. product-focused)
2. Proactive objection handling
3. Stakeholder mapping and multi-threading
4. Continuous learning and skill development`,
    keyTakeaways: [
      'Research and preparation significantly impact success rates',
      'Multi-channel approach increases engagement effectiveness',
      'Value-based messaging outperforms feature-focused approaches',
      'Technology adoption correlates with performance'
    ],
    actionableAdvice: [
      'Implement mandatory pre-call research protocols',
      'Develop multi-channel outreach sequences',
      'Create value proposition frameworks for different personas',
      'Invest in sales technology stack and training',
      'Establish systematic follow-up processes',
      'Focus on consultative selling skill development'
    ],
    sources: [
      'Sales Performance Study 2024 - Sales Hacker',
      'B2B Sales Benchmark Report - HubSpot',
      'High-Performance Sales Teams Analysis - Salesforce Research'
    ],
    publishedDate: new Date('2024-01-12'),
    relevanceScore: 87
  }
]

export const getInsightsByIndustry = (industry: string) => {
  return marketInsights.filter(insight => 
    insight.industry.toLowerCase() === industry.toLowerCase() || 
    insight.industry.toLowerCase() === 'general'
  ).sort((a, b) => b.relevanceScore - a.relevanceScore)
}

export const getInsightsByCategory = (category: MarketInsight['category']) => {
  return marketInsights.filter(insight => insight.category === category)
}

export const getTopInsights = (limit: number = 5) => {
  return marketInsights
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit)
}