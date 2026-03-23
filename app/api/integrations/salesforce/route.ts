import { NextRequest, NextResponse } from 'next/server'

// Salesforce REST API integration
// Docs: https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/

interface SalesforceConfig {
  instanceUrl: string
  accessToken: string
}

interface SFLead {
  Id?: string
  FirstName: string
  LastName: string
  Company: string
  Title: string
  Industry: string
  Email: string
  Phone: string
  LeadSource: string
  Status: string
  Description: string
}

async function sfRequest(config: SalesforceConfig, path: string, method = 'GET', body?: any) {
  const res = await fetch(`${config.instanceUrl}/services/data/v59.0${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Salesforce API error: ${res.status} ${err}`)
  }
  return method === 'DELETE' ? null : res.json()
}

// GET /api/integrations/salesforce?action=leads
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action') || 'leads'
  const instanceUrl = req.headers.get('x-sf-instance') || process.env.SALESFORCE_INSTANCE_URL || ''
  const accessToken = req.headers.get('x-sf-token') || process.env.SALESFORCE_ACCESS_TOKEN || ''

  if (!instanceUrl || !accessToken) {
    // Return mock data when not configured
    return NextResponse.json({ leads: getMockSFLeads(), source: 'mock' })
  }

  try {
    const config: SalesforceConfig = { instanceUrl, accessToken }

    if (action === 'leads') {
      const query = `SELECT Id,FirstName,LastName,Company,Title,Industry,Email,Phone,LeadSource,Status,CreatedDate FROM Lead ORDER BY CreatedDate DESC LIMIT 100`
      const data = await sfRequest(config, `/query?q=${encodeURIComponent(query)}`)
      return NextResponse.json({ leads: data.records, totalSize: data.totalSize, source: 'salesforce' })
    }

    if (action === 'contacts') {
      const query = `SELECT Id,FirstName,LastName,Account.Name,Title,Email,Phone,CreatedDate FROM Contact ORDER BY CreatedDate DESC LIMIT 100`
      const data = await sfRequest(config, `/query?q=${encodeURIComponent(query)}`)
      return NextResponse.json({ contacts: data.records, source: 'salesforce' })
    }

    if (action === 'opportunities') {
      const query = `SELECT Id,Name,StageName,Amount,CloseDate,Probability,Account.Name FROM Opportunity ORDER BY CreatedDate DESC LIMIT 50`
      const data = await sfRequest(config, `/query?q=${encodeURIComponent(query)}`)
      return NextResponse.json({ opportunities: data.records, source: 'salesforce' })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, leads: getMockSFLeads(), source: 'mock' })
  }
}

// POST /api/integrations/salesforce — push lead to Salesforce
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { lead, action, instanceUrl, accessToken } = body

  if (!instanceUrl || !accessToken) {
    return NextResponse.json({ success: true, id: 'mock-sf-' + Date.now(), source: 'mock' })
  }

  try {
    const config: SalesforceConfig = { instanceUrl, accessToken }

    if (action === 'create_lead') {
      const sfLead: SFLead = {
        FirstName: lead.name.split(' ')[0] || lead.name,
        LastName: lead.name.split(' ').slice(1).join(' ') || 'Unknown',
        Company: lead.company,
        Title: lead.role,
        Industry: lead.industry,
        Email: lead.email || '',
        Phone: lead.phone || '',
        LeadSource: lead.source || 'Web',
        Status: 'Open - Not Contacted',
        Description: `AI Score: ${lead.aiScore}/100 | Conversion Probability: ${lead.conversionProbability}% | Category: ${lead.category}`,
      }
      const result = await sfRequest(config, '/sobjects/Lead', 'POST', sfLead)
      return NextResponse.json({ success: true, id: result.id, source: 'salesforce' })
    }

    if (action === 'update_lead' && lead.sfId) {
      await sfRequest(config, `/sobjects/Lead/${lead.sfId}`, 'PATCH', {
        Status: mapStatusToSF(lead.status),
        Description: `AI Score: ${lead.aiScore}/100 | Updated: ${new Date().toISOString()}`,
      })
      return NextResponse.json({ success: true, source: 'salesforce' })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function mapStatusToSF(status: string): string {
  const map: Record<string, string> = {
    new: 'Open - Not Contacted',
    contacted: 'Working - Contacted',
    qualified: 'Closed - Converted',
    proposal: 'Working - Contacted',
    converted: 'Closed - Converted',
    lost: 'Closed - Not Converted',
  }
  return map[status] || 'Open - Not Contacted'
}

function getMockSFLeads() {
  return [
    { Id: 'sf001', FirstName: 'James', LastName: 'Wilson', Company: 'TechCorp Inc', Title: 'VP Engineering', Industry: 'Technology', Email: 'james@techcorp.com', LeadSource: 'Web', Status: 'Open - Not Contacted' },
    { Id: 'sf002', FirstName: 'Emma', LastName: 'Davis', Company: 'FinanceHub', Title: 'CFO', Industry: 'Finance', Email: 'emma@financehub.com', LeadSource: 'Partner Referral', Status: 'Working - Contacted' },
    { Id: 'sf003', FirstName: 'Carlos', LastName: 'Rodriguez', Company: 'HealthPlus', Title: 'CTO', Industry: 'Healthcare', Email: 'carlos@healthplus.com', LeadSource: 'Trade Show', Status: 'Closed - Converted' },
  ]
}
