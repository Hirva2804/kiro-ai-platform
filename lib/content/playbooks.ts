export interface SalesPlaybook {
  id: string
  title: string
  description: string
  industry: string
  targetRole: string
  stages: PlaybookStage[]
  successMetrics: string[]
  tips: string[]
}

export interface PlaybookStage {
  id: string
  name: string
  description: string
  duration: string
  actions: PlaybookAction[]
  successCriteria: string[]
}

export interface PlaybookAction {
  id: string
  type: 'email' | 'call' | 'linkedin' | 'meeting' | 'follow_up'
  title: string
  description: string
  templateId?: string
  timing: string
  priority: 'high' | 'medium' | 'low'
}

export const salesPlaybooks: SalesPlaybook[] = [
  {
    id: 'saas-enterprise',
    title: 'Enterprise SaaS Sales Playbook',
    description: 'Comprehensive playbook for selling to enterprise SaaS companies with complex decision-making processes',
    industry: 'SaaS',
    targetRole: 'VP, Director, C-Level',
    stages: [
      {
        id: 'research',
        name: 'Research & Qualification',
        description: 'Deep research into prospect company, pain points, and decision-making process',
        duration: '1-2 days',
        actions: [
          {
            id: 'company-research',
            type: 'follow_up',
            title: 'Company Research',
            description: 'Research company background, recent news, funding, competitors, and tech stack',
            timing: 'Before first contact',
            priority: 'high'
          },
          {
            id: 'stakeholder-mapping',
            type: 'follow_up',
            title: 'Stakeholder Mapping',
            description: 'Identify key decision makers, influencers, and potential champions',
            timing: 'Day 1',
            priority: 'high'
          },
          {
            id: 'pain-point-analysis',
            type: 'follow_up',
            title: 'Pain Point Analysis',
            description: 'Analyze industry trends and company-specific challenges',
            timing: 'Day 1-2',
            priority: 'medium'
          }
        ],
        successCriteria: [
          'Complete company profile created',
          'Key stakeholders identified',
          'Primary pain points documented',
          'Competitive landscape understood'
        ]
      },
      {
        id: 'initial-outreach',
        name: 'Initial Outreach',
        description: 'First contact with personalized value proposition',
        duration: '3-5 days',
        actions: [
          {
            id: 'cold-email',
            type: 'email',
            title: 'Personalized Cold Email',
            description: 'Send highly personalized email focusing on specific pain points',
            templateId: 'saas-cold-1',
            timing: 'Day 1',
            priority: 'high'
          },
          {
            id: 'linkedin-connect',
            type: 'linkedin',
            title: 'LinkedIn Connection',
            description: 'Send personalized LinkedIn connection request',
            timing: 'Day 2',
            priority: 'medium'
          },
          {
            id: 'follow-up-email',
            type: 'email',
            title: 'Follow-up Email',
            description: 'Send follow-up with case study or relevant content',
            timing: 'Day 5',
            priority: 'high'
          }
        ],
        successCriteria: [
          'Email delivered and opened',
          'LinkedIn connection accepted',
          'Response received or meeting scheduled'
        ]
      },
      {
        id: 'discovery',
        name: 'Discovery & Needs Analysis',
        description: 'Deep dive into requirements and decision criteria',
        duration: '1-2 weeks',
        actions: [
          {
            id: 'discovery-call',
            type: 'call',
            title: 'Discovery Call',
            description: 'Conduct comprehensive needs analysis call',
            timing: 'Week 1',
            priority: 'high'
          },
          {
            id: 'stakeholder-interviews',
            type: 'meeting',
            title: 'Stakeholder Interviews',
            description: 'Interview key stakeholders to understand requirements',
            timing: 'Week 1-2',
            priority: 'high'
          },
          {
            id: 'technical-assessment',
            type: 'meeting',
            title: 'Technical Assessment',
            description: 'Assess technical requirements and integration needs',
            timing: 'Week 2',
            priority: 'medium'
          }
        ],
        successCriteria: [
          'Complete requirements document',
          'Decision criteria identified',
          'Budget range confirmed',
          'Timeline established'
        ]
      },
      {
        id: 'solution-design',
        name: 'Solution Design & Proposal',
        description: 'Create customized solution and formal proposal',
        duration: '1-2 weeks',
        actions: [
          {
            id: 'solution-workshop',
            type: 'meeting',
            title: 'Solution Design Workshop',
            description: 'Collaborative session to design optimal solution',
            timing: 'Week 1',
            priority: 'high'
          },
          {
            id: 'proposal-creation',
            type: 'follow_up',
            title: 'Proposal Creation',
            description: 'Create detailed proposal with ROI analysis',
            timing: 'Week 1-2',
            priority: 'high'
          },
          {
            id: 'proposal-presentation',
            type: 'meeting',
            title: 'Proposal Presentation',
            description: 'Present solution and proposal to decision committee',
            timing: 'Week 2',
            priority: 'high'
          }
        ],
        successCriteria: [
          'Solution approved by technical team',
          'Proposal presented to decision makers',
          'Objections addressed',
          'Next steps agreed upon'
        ]
      },
      {
        id: 'negotiation',
        name: 'Negotiation & Closing',
        description: 'Handle objections, negotiate terms, and close the deal',
        duration: '2-4 weeks',
        actions: [
          {
            id: 'objection-handling',
            type: 'call',
            title: 'Objection Handling',
            description: 'Address concerns and objections systematically',
            timing: 'Week 1',
            priority: 'high'
          },
          {
            id: 'reference-calls',
            type: 'call',
            title: 'Reference Customer Calls',
            description: 'Arrange calls with existing customers',
            timing: 'Week 1-2',
            priority: 'medium'
          },
          {
            id: 'contract-negotiation',
            type: 'meeting',
            title: 'Contract Negotiation',
            description: 'Negotiate contract terms and pricing',
            timing: 'Week 2-3',
            priority: 'high'
          },
          {
            id: 'final-approval',
            type: 'meeting',
            title: 'Final Approval Meeting',
            description: 'Present to final decision maker for approval',
            timing: 'Week 3-4',
            priority: 'high'
          }
        ],
        successCriteria: [
          'All objections resolved',
          'Contract terms agreed',
          'Legal approval obtained',
          'Deal closed and signed'
        ]
      }
    ],
    successMetrics: [
      'Email open rate > 40%',
      'Response rate > 15%',
      'Meeting conversion > 25%',
      'Proposal to close rate > 30%',
      'Average deal size > $50K',
      'Sales cycle < 90 days'
    ],
    tips: [
      'Focus on business outcomes, not features',
      'Involve technical stakeholders early',
      'Create urgency with limited-time offers',
      'Use social proof and case studies',
      'Map solution to specific pain points',
      'Maintain regular follow-up cadence'
    ]
  },
  {
    id: 'fintech-smb',
    title: 'FinTech SMB Sales Playbook',
    description: 'Streamlined playbook for selling to small-medium FinTech companies',
    industry: 'FinTech',
    targetRole: 'Founder, CEO, CTO',
    stages: [
      {
        id: 'qualification',
        name: 'Quick Qualification',
        description: 'Rapid qualification of FinTech SMB prospects',
        duration: '1 day',
        actions: [
          {
            id: 'bant-qualification',
            type: 'call',
            title: 'BANT Qualification',
            description: 'Qualify Budget, Authority, Need, and Timeline',
            timing: 'Day 1',
            priority: 'high'
          }
        ],
        successCriteria: ['BANT criteria met', 'Decision maker identified']
      },
      {
        id: 'demo',
        name: 'Product Demo',
        description: 'Customized product demonstration',
        duration: '3-5 days',
        actions: [
          {
            id: 'demo-prep',
            type: 'follow_up',
            title: 'Demo Preparation',
            description: 'Customize demo based on specific use case',
            timing: 'Day 1',
            priority: 'high'
          },
          {
            id: 'live-demo',
            type: 'meeting',
            title: 'Live Demo',
            description: 'Conduct interactive product demonstration',
            timing: 'Day 3',
            priority: 'high'
          }
        ],
        successCriteria: ['Demo completed', 'Technical fit confirmed']
      },
      {
        id: 'trial',
        name: 'Trial & Evaluation',
        description: 'Hands-on trial period with support',
        duration: '1-2 weeks',
        actions: [
          {
            id: 'trial-setup',
            type: 'follow_up',
            title: 'Trial Environment Setup',
            description: 'Set up trial environment with sample data',
            timing: 'Day 1',
            priority: 'high'
          },
          {
            id: 'trial-support',
            type: 'call',
            title: 'Trial Support Calls',
            description: 'Regular check-ins during trial period',
            timing: 'Weekly',
            priority: 'medium'
          }
        ],
        successCriteria: ['Trial activated', 'Key features tested', 'Value demonstrated']
      },
      {
        id: 'closing',
        name: 'Fast Close',
        description: 'Quick decision and contract signing',
        duration: '1 week',
        actions: [
          {
            id: 'trial-review',
            type: 'call',
            title: 'Trial Review Call',
            description: 'Review trial results and address questions',
            timing: 'Day 1',
            priority: 'high'
          },
          {
            id: 'proposal',
            type: 'email',
            title: 'Proposal Delivery',
            description: 'Send simple, clear proposal',
            timing: 'Day 2',
            priority: 'high'
          },
          {
            id: 'close-call',
            type: 'call',
            title: 'Closing Call',
            description: 'Final objection handling and close',
            timing: 'Day 5',
            priority: 'high'
          }
        ],
        successCriteria: ['Proposal accepted', 'Contract signed', 'Implementation scheduled']
      }
    ],
    successMetrics: [
      'Qualification to demo rate > 60%',
      'Demo to trial rate > 40%',
      'Trial to close rate > 50%',
      'Average deal size > $15K',
      'Sales cycle < 30 days'
    ],
    tips: [
      'Keep process simple and fast',
      'Focus on immediate ROI',
      'Leverage compliance requirements',
      'Offer flexible pricing options',
      'Provide hands-on trial experience'
    ]
  }
]

export const getPlaybookByIndustry = (industry: string) => {
  return salesPlaybooks.filter(playbook => 
    playbook.industry.toLowerCase() === industry.toLowerCase()
  )
}

export const getPlaybookById = (id: string) => {
  return salesPlaybooks.find(playbook => playbook.id === id)
}