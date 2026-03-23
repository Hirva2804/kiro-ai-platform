import { NextRequest, NextResponse } from 'next/server'

// Google Sheets API v4 integration
// Docs: https://developers.google.com/sheets/api/reference/rest
// Auth: Service Account or OAuth2 — this uses API key for read, OAuth for write

const SHEETS_BASE = 'https://sheets.googleapis.com/v4/spreadsheets'

// Expected column headers in the Google Sheet
const EXPECTED_HEADERS = ['name', 'company', 'role', 'industry', 'location', 'source', 'email', 'phone', 'engagementScore', 'notes']

async function sheetsRequest(apiKey: string, spreadsheetId: string, path: string, method = 'GET', body?: any) {
  const url = `${SHEETS_BASE}/${spreadsheetId}${path}${path.includes('?') ? '&' : '?'}key=${apiKey}`
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Google Sheets API error: ${res.status} ${err}`)
  }
  return res.json()
}

// GET /api/integrations/google-sheets?spreadsheetId=xxx&sheetName=Leads
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const spreadsheetId = searchParams.get('spreadsheetId') || process.env.GOOGLE_SHEETS_ID || ''
  const sheetName = searchParams.get('sheetName') || 'Leads'
  const apiKey = searchParams.get('apiKey') || process.env.GOOGLE_SHEETS_API_KEY || ''

  if (!spreadsheetId || !apiKey) {
    // Return mock data for demo
    return NextResponse.json({ leads: getMockSheetLeads(), headers: EXPECTED_HEADERS, source: 'mock', rowCount: 5 })
  }

  try {
    // Fetch sheet data
    const range = `${sheetName}!A1:Z1000`
    const data = await sheetsRequest(apiKey, spreadsheetId, `/values/${encodeURIComponent(range)}`)

    if (!data.values || data.values.length < 2) {
      return NextResponse.json({ leads: [], headers: [], source: 'google_sheets', rowCount: 0 })
    }

    const headers: string[] = data.values[0].map((h: string) => h.toLowerCase().trim().replace(/\s+/g, '_'))
    const rows = data.values.slice(1)

    const leads = rows
      .filter((row: string[]) => row.some(cell => cell?.trim()))
      .map((row: string[], index: number) => {
        const lead: Record<string, any> = { id: `sheet-${index + 2}` }
        headers.forEach((header, i) => {
          lead[header] = row[i] || ''
        })
        return normalizeSheetLead(lead)
      })

    return NextResponse.json({ leads, headers, source: 'google_sheets', rowCount: leads.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, leads: getMockSheetLeads(), source: 'mock' })
  }
}

// POST /api/integrations/google-sheets — append leads to sheet
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { leads, spreadsheetId, sheetName = 'Leads', accessToken } = body

  if (!spreadsheetId || !accessToken) {
    return NextResponse.json({ success: true, updatedRows: leads?.length || 0, source: 'mock' })
  }

  try {
    // Build rows from leads
    const rows = leads.map((lead: any) => [
      lead.name || '',
      lead.company || '',
      lead.role || '',
      lead.industry || '',
      lead.location || '',
      lead.source || '',
      lead.email || '',
      lead.phone || '',
      lead.engagementScore || 0,
      lead.notes || '',
      lead.aiScore || 0,
      lead.category || '',
      lead.status || 'new',
      new Date().toISOString(),
    ])

    const range = `${sheetName}!A:N`
    const url = `${SHEETS_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: rows }),
    })

    if (!res.ok) throw new Error(`Sheets write error: ${res.status}`)
    const result = await res.json()

    return NextResponse.json({
      success: true,
      updatedRows: result.updates?.updatedRows || rows.length,
      source: 'google_sheets',
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Normalize raw sheet row to Lead format
function normalizeSheetLead(raw: Record<string, any>) {
  const score = parseInt(raw.engagementscore || raw.engagement_score || raw.score || '50') || 50
  return {
    id: raw.id || `sheet-${Date.now()}`,
    name: raw.name || raw.full_name || 'Unknown',
    company: raw.company || raw.company_name || '',
    role: raw.role || raw.title || raw.job_title || '',
    industry: raw.industry || '',
    location: raw.location || raw.city || '',
    source: raw.source || raw.lead_source || 'Google Sheets',
    email: raw.email || '',
    phone: raw.phone || raw.phone_number || '',
    engagementScore: Math.min(100, Math.max(0, score)),
    notes: raw.notes || raw.description || '',
    aiScore: 0,
    conversionProbability: 0,
    category: 'cold' as const,
    status: 'new' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

function getMockSheetLeads() {
  return [
    { id: 'sheet-1', name: 'Rachel Green', company: 'StartupXYZ', role: 'Founder', industry: 'SaaS', location: 'Austin, TX', source: 'Google Sheets', email: 'rachel@startupxyz.com', phone: '', engagementScore: 72, notes: 'Met at SaaStr conference', aiScore: 0, conversionProbability: 0, category: 'warm', status: 'new', createdAt: new Date(), updatedAt: new Date() },
    { id: 'sheet-2', name: 'Tom Bradley', company: 'MegaCorp', role: 'VP Sales', industry: 'Manufacturing', location: 'Chicago, IL', source: 'Google Sheets', email: 'tom@megacorp.com', phone: '+1 312 555 0100', engagementScore: 88, notes: 'Interested in enterprise plan', aiScore: 0, conversionProbability: 0, category: 'hot', status: 'contacted', createdAt: new Date(), updatedAt: new Date() },
    { id: 'sheet-3', name: 'Nina Patel', company: 'HealthFirst', role: 'CTO', industry: 'Healthcare', location: 'Boston, MA', source: 'Google Sheets', email: 'nina@healthfirst.com', phone: '', engagementScore: 55, notes: '', aiScore: 0, conversionProbability: 0, category: 'cold', status: 'new', createdAt: new Date(), updatedAt: new Date() },
  ]
}
