export interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  category: 'cold_outreach' | 'follow_up' | 'nurture' | 'proposal' | 'closing'
  variables: string[]
  industry?: string
  useCase: string
}

export const emailTemplates: EmailTemplate[] = [
  {
    id: 'saas-cold-1',
    name: 'SaaS Cold Outreach - Value Proposition',
    subject: 'Quick question about {{company_name}}\'s {{pain_point}}',
    content: `Hi {{first_name}},

I noticed {{company_name}} is in the {{industry}} space and likely dealing with {{pain_point}}.

We've helped similar companies like {{competitor_example}} reduce their {{metric}} by {{improvement_percentage}}% in just {{timeframe}}.

Would you be open to a 15-minute conversation about how we could help {{company_name}} achieve similar results?

Best regards,
{{sender_name}}

P.S. Here's a quick case study showing how {{case_study_company}} saved {{savings_amount}} annually: {{case_study_link}}`,
    category: 'cold_outreach',
    variables: ['first_name', 'company_name', 'pain_point', 'industry', 'competitor_example', 'metric', 'improvement_percentage', 'timeframe', 'sender_name', 'case_study_company', 'savings_amount', 'case_study_link'],
    industry: 'SaaS',
    useCase: 'Initial outreach to SaaS companies focusing on specific pain points and quantifiable results'
  },
  {
    id: 'fintech-follow-up-1',
    name: 'FinTech Follow-up - Compliance Focus',
    subject: 'Re: {{company_name}} compliance requirements',
    content: `Hi {{first_name}},

Following up on our previous conversation about {{company_name}}'s compliance needs.

I wanted to share how we've helped other FinTech companies like yours navigate:
• {{regulation_1}} requirements
• {{regulation_2}} compliance
• Risk management protocols

Our solution has helped clients reduce compliance costs by {{cost_reduction}}% while improving audit readiness.

Are you available for a brief call this week to discuss your specific requirements?

Best,
{{sender_name}}

{{compliance_whitepaper_link}}`,
    category: 'follow_up',
    variables: ['first_name', 'company_name', 'regulation_1', 'regulation_2', 'cost_reduction', 'sender_name', 'compliance_whitepaper_link'],
    industry: 'FinTech',
    useCase: 'Follow-up email for FinTech prospects emphasizing compliance and regulatory benefits'
  },
  {
    id: 'healthcare-nurture-1',
    name: 'Healthcare Nurture - Patient Outcomes',
    subject: 'New research: Improving patient outcomes with {{solution_type}}',
    content: `Hi {{first_name}},

I thought you'd be interested in this recent study showing how healthcare organizations are improving patient outcomes using {{solution_type}}.

Key findings:
• {{outcome_1}}: {{improvement_1}}% improvement
• {{outcome_2}}: {{improvement_2}}% better results
• Patient satisfaction increased by {{satisfaction_increase}}%

The study included {{study_size}} patients across {{facility_count}} facilities similar to {{company_name}}.

Would you like me to send you the full research report?

Best regards,
{{sender_name}}

P.S. We're hosting a webinar on this topic next week. Would you be interested in attending?`,
    category: 'nurture',
    variables: ['first_name', 'solution_type', 'outcome_1', 'improvement_1', 'outcome_2', 'improvement_2', 'satisfaction_increase', 'study_size', 'facility_count', 'company_name', 'sender_name'],
    industry: 'Healthcare',
    useCase: 'Educational nurture email for healthcare prospects focusing on patient outcomes and research'
  },
  {
    id: 'manufacturing-proposal-1',
    name: 'Manufacturing Proposal Follow-up',
    subject: 'Proposal for {{company_name}} - {{solution_name}} Implementation',
    content: `Hi {{first_name}},

Thank you for taking the time to review our proposal for implementing {{solution_name}} at {{company_name}}.

As discussed, our solution will help you achieve:

📈 Efficiency Gains:
• {{efficiency_metric_1}}: {{efficiency_improvement_1}}% improvement
• {{efficiency_metric_2}}: {{efficiency_improvement_2}}% reduction

💰 Cost Savings:
• Annual savings: ${{annual_savings}}
• ROI timeline: {{roi_timeline}} months
• Payback period: {{payback_period}}

🔧 Implementation:
• Go-live date: {{go_live_date}}
• Training included: {{training_hours}} hours
• Dedicated support: {{support_level}}

I'm available to discuss any questions you might have about the proposal. Would you prefer a call or in-person meeting?

Best regards,
{{sender_name}}

{{proposal_document_link}}`,
    category: 'proposal',
    variables: ['first_name', 'company_name', 'solution_name', 'efficiency_metric_1', 'efficiency_improvement_1', 'efficiency_metric_2', 'efficiency_improvement_2', 'annual_savings', 'roi_timeline', 'payback_period', 'go_live_date', 'training_hours', 'support_level', 'sender_name', 'proposal_document_link'],
    industry: 'Manufacturing',
    useCase: 'Proposal follow-up email for manufacturing prospects with detailed ROI and implementation details'
  },
  {
    id: 'closing-urgency-1',
    name: 'Closing - Limited Time Offer',
    subject: 'Final decision needed by {{deadline_date}} - {{company_name}}',
    content: `Hi {{first_name}},

I wanted to reach out regarding the {{solution_name}} proposal we discussed for {{company_name}}.

As mentioned, our Q{{quarter}} pricing expires on {{deadline_date}}, which includes:
• {{discount_percentage}}% discount on implementation
• Free {{bonus_feature}} (valued at ${{bonus_value}})
• Extended {{warranty_period}} warranty
• Priority support queue access

After {{deadline_date}}, the investment will increase to ${{regular_price}}.

I understand this is an important decision for {{company_name}}. I'm here to address any final questions or concerns you might have.

Can we schedule a brief call before {{deadline_date}} to finalize the details?

Best regards,
{{sender_name}}

P.S. {{reference_customer}} just implemented our solution and saw {{reference_result}} in their first month. Happy to connect you if helpful.`,
    category: 'closing',
    variables: ['first_name', 'deadline_date', 'company_name', 'solution_name', 'quarter', 'discount_percentage', 'bonus_feature', 'bonus_value', 'warranty_period', 'regular_price', 'sender_name', 'reference_customer', 'reference_result'],
    useCase: 'Closing email with urgency and social proof to encourage final decision'
  }
]

export const getTemplatesByCategory = (category: EmailTemplate['category']) => {
  return emailTemplates.filter(template => template.category === category)
}

export const getTemplatesByIndustry = (industry: string) => {
  return emailTemplates.filter(template => 
    !template.industry || template.industry.toLowerCase() === industry.toLowerCase()
  )
}

export const personalizeTemplate = (template: EmailTemplate, variables: Record<string, string>) => {
  let personalizedSubject = template.subject
  let personalizedContent = template.content

  // Replace variables in subject
  template.variables.forEach(variable => {
    const value = variables[variable] || `{{${variable}}}`
    personalizedSubject = personalizedSubject.replace(new RegExp(`{{${variable}}}`, 'g'), value)
    personalizedContent = personalizedContent.replace(new RegExp(`{{${variable}}}`, 'g'), value)
  })

  return {
    subject: personalizedSubject,
    content: personalizedContent
  }
}