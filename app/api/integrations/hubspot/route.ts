import { NextRequest, NextResponse } from 'next/server'

// HubSpot CRM API v3 integration
// Docs: https://developers.hubspot.com/docs/api/crm/contacts

const HS_BASE = 'https://api.hubapi.com'

async function hsRequest(apiKey: string, path: string, method = 'GET', body?: any) {
  const res = await fetch(`${HS_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`HubSpot API error: ${res.status} ${err}`)
  }
  return res.json()
}

// GET /api/integrations/hubspot?action=contacts
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action') || 'contacts'
  const apiKey = req.headers.get('x-hs-token') || process.env.HUBSPOT_API_KEY || ''

  if (!apiKey) {
    return NextResponse.json({ contacts: getMockHSContacts(), deals: getMockHSDeals(), source: 'mock' })
  }

  try {
    if (action === 'contacts') {
      const data = await hsRequest(apiKey, '/crm/v3/objects/contacts?limit=100&properties=firstname,lastname,company,jobtitle,industry,email,phone,hs_lead_status,createdate')
      return NextResponse.json({ contacts: data.results, source: 'hubspot' })
    }

    if (action === 'deals') {
      const data = await hsRequest(apiKey, '/crm/v3/objects/deals?limit=50&properties=dealname,dealstage,amount,closedate,pipeline')
      return NextResponse.json({ deals: data.results, source: 'hubspot' })
    }

    if (action === 'pipelines') {
      const data = await hsRequest(apiKey, '/crm/v3/pipelines/deals')
      return NextResponse.json({ pipelines: data.results, source: 'hubspot' })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, contacts: getMockHSContacts(), source: 'mock' })
  }
}

// POST /api/integrations/hubspot — push lead to HubSpot
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { lead, action, apiKey } = body

  const key = apiKey || process.env.HUBSPOT_API_KEY || ''

  if (!key) {
    return NextResponse.json({ success: true, id: 'mock-hs-' + Date.now(), source: 'mock' })
  }

  try {
    if (action === 'create_contact') {
      const nameParts = lead.name.split(' ')
      const result = await hsRequest(key, '/crm/v3/objects/contacts', 'POST', {
        properties: {
          firstname: nameParts[0] || lead.name,
          lastname: nameParts.slice(1).join(' ') || '',
          company: lead.company,
          jobtitle: lead.role,
          industry: lead.industry,
          email: lead.email || '',
          phone: lead.phone || '',
          hs_lead_status: mapStatusToHS(lead.status),
          leadsource: lead.source || 'OTHER',
          notes_last_updated: new Date().toISOString(),
        }
      })
      return NextResponse.json({ success: true, id: result.id, source: 'hubspot' })
    }

    if (action === 'create_deal') {
      const result = await hsRequest(key, '/crm/v3/objects/deals', 'POST', {
        properties: {
          dealname: `${lead.company} - ${lead.name}`,
          dealstage: mapStatusToDealStage(lead.status),
          amount: lead.predictedLifetimeValue || 0,
          closedate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          pipeline: 'default',
        }
      })
      return NextResponse.json({ success: true, id: result.id, source: 'hubspot' })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function mapStatusToHS(status: string): string {
  const map: Record<string, string> = {
    new: 'NEW',
    contacted: 'OPEN',
    qualified: 'IN_PROGRESS',
    proposal: 'OPEN',
    converted: 'CONNECTED',
    lost: 'UNQUALIFIED',
  }
  return map[status] || 'NEW'
}

function mapStatusToDealStage(status: string): string {
  const map: Record<string, string> = {
    new: 'appointmentscheduled',
    contacted: 'qualifiedtobuy',
    qualified: 'presentationscheduled',
    proposal: 'decisionmakerboughtin',
    converted: 'closedwon',
    lost: 'closedlost',
  }
  return map[status] || 'appointmentscheduled'
}

function getMockHSContacts() {
  return [
    { id: 'hs001', properties: { firstname: 'Lisa', lastname: 'Park', company: 'CloudBase', jobtitle: 'Head of Sales', email: 'lisa@cloudbase.io', hs_lead_status: 'IN_PROGRESS' } },
    { id: 'hs002', properties: { firstname: 'David', lastname: 'Kim', company: 'DataFlow', jobtitle: 'CEO', email: 'david@dataflow.com', hs_lead_status: 'NEW' } },
  ]
}

function getMockHSDeals() {
  return [
    { id: 'deal001', properties: { dealname: 'CloudBase - Enterprise', dealstage: 'presentationscheduled', amount: '45000', closedate: '2026-04-01' } },
    { id: 'deal002', properties: { dealname: 'DataFlow - Pro Plan', dealstage: 'qualifiedtobuy', amount: '12000', closedate: '2026-03-15' } },
  ]
}
