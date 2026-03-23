'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import {
  Building, Globe, FileSpreadsheet, RefreshCw, Download, Upload,
  CheckCircle, AlertCircle, Loader2, ExternalLink, ArrowRight,
  Users, TrendingUp, Database, Link2, Zap
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Lead } from '@/types'
import { createLead } from '@/lib/data'
import { calculateAIScore, getLeadCategory, getConversionProbability } from '@/lib/leads'

type CRM = 'salesforce' | 'hubspot' | 'googleSheets'

interface SyncResult {
  source: string
  leads?: any[]
  contacts?: any[]
  rowCount?: number
  error?: string
}

export default function IntegrationsPage() {
  const [syncing, setSyncing] = useState<CRM | null>(null)
  const [syncResults, setSyncResults] = useState<Record<string, SyncResult>>({})
  const [importedLeads, setImportedLeads] = useState<Lead[]>([])
  const [pushing, setPushing] = useState(false)
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())

  // Config state (in production, load from settings/env)
  const [sfConfig, setSfConfig] = useState({ instanceUrl: '', accessToken: '' })
  const [hsConfig, setHsConfig] = useState({ apiKey: '' })
  const [gsConfig, setGsConfig] = useState({ spreadsheetId: '', sheetName: 'Leads', apiKey: '' })

  const syncFromSalesforce = async () => {
    setSyncing('salesforce')
    try {
      const res = await fetch('/api/integrations/salesforce?action=leads', {
        headers: {
          'x-sf-instance': sfConfig.instanceUrl,
          'x-sf-token': sfConfig.accessToken,
        }
      })
      const data = await res.json()
      setSyncResults(prev => ({ ...prev, salesforce: data }))
      const leads = (data.leads || []).map(mapSFLeadToLead)
      setImportedLeads(prev => mergeLeads(prev, leads))
      toast.success(`Synced ${data.leads?.length || 0} leads from Salesforce`)
    } catch (e: any) {
      toast.error('Salesforce sync failed: ' + e.message)
    } finally {
      setSyncing(null)
    }
  }

  const syncFromHubSpot = async () => {
    setSyncing('hubspot')
    try {
      const res = await fetch('/api/integrations/hubspot?action=contacts', {
        headers: { 'x-hs-token': hsConfig.apiKey }
      })
      const data = await res.json()
      setSyncResults(prev => ({ ...prev, hubspot: data }))
      const leads = (data.contacts || []).map(mapHSContactToLead)
      setImportedLeads(prev => mergeLeads(prev, leads))
      toast.success(`Synced ${data.contacts?.length || 0} contacts from HubSpot`)
    } catch (e: any) {
      toast.error('HubSpot sync failed: ' + e.message)
    } finally {
      setSyncing(null)
    }
  }

  const syncFromGoogleSheets = async () => {
    setSyncing('googleSheets')
    try {
      const params = new URLSearchParams({
        spreadsheetId: gsConfig.spreadsheetId,
        sheetName: gsConfig.sheetName,
        apiKey: gsConfig.apiKey,
      })
      const res = await fetch(`/api/integrations/google-sheets?${params}`)
      const data = await res.json()
      setSyncResults(prev => ({ ...prev, googleSheets: data }))
      setImportedLeads(prev => mergeLeads(prev, data.leads || []))
      toast.success(`Imported ${data.rowCount || data.leads?.length || 0} leads from Google Sheets`)
    } catch (e: any) {
      toast.error('Google Sheets sync failed: ' + e.message)
    } finally {
      setSyncing(null)
    }
  }

  const pushToSalesforce = async () => {
    const leads = importedLeads.filter(l => selectedLeads.has(l.id))
    if (!leads.length) { toast.error('Select leads to push'); return }
    setPushing(true)
    let success = 0
    for (const lead of leads) {
      try {
        await fetch('/api/integrations/salesforce', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lead, action: 'create_lead', instanceUrl: sfConfig.instanceUrl, accessToken: sfConfig.accessToken })
        })
        success++
      } catch {}
    }
    setPushing(false)
    toast.success(`Pushed ${success} leads to Salesforce`)
  }

  const pushToHubSpot = async () => {
    const leads = importedLeads.filter(l => selectedLeads.has(l.id))
    if (!leads.length) { toast.error('Select leads to push'); return }
    setPushing(true)
    let success = 0
    for (const lead of leads) {
      try {
        await fetch('/api/integrations/hubspot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lead, action: 'create_contact', apiKey: hsConfig.apiKey })
        })
        success++
      } catch {}
    }
    setPushing(false)
    toast.success(`Pushed ${success} contacts to HubSpot`)
  }

  const toggleLead = (id: string) => {
    setSelectedLeads(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const saveToDatabase = async () => {
    const leadsToSave = selectedLeads.size > 0
      ? importedLeads.filter(l => selectedLeads.has(l.id))
      : importedLeads
    if (!leadsToSave.length) { toast.error('No leads to save'); return }
    setPushing(true)
    let saved = 0
    let failed = 0
    for (const lead of leadsToSave) {
      try {
        const aiScore = calculateAIScore(lead)
        const category = getLeadCategory(aiScore)
        const conversionProbability = getConversionProbability(aiScore)
        await createLead({
          ...lead,
          aiScore,
          category,
          conversionProbability,
          status: lead.status || 'new',
          predictedLifetimeValue: Math.floor(conversionProbability * 800 + Math.random() * 40000),
        })
        saved++
      } catch {
        failed++
      }
    }
    setPushing(false)
    if (saved > 0) toast.success(`${saved} leads saved to your pipeline!`)
    if (failed > 0) toast.error(`${failed} leads failed to save`)
  }

  const toggleAll = () => {
    if (selectedLeads.size === importedLeads.length) {
      setSelectedLeads(new Set())
    } else {
      setSelectedLeads(new Set(importedLeads.map(l => l.id)))
    }
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">CRM & Integrations</h1>
            <p className="text-sm text-gray-500 mt-1">Sync leads from Salesforce, HubSpot, and Google Sheets</p>
          </div>

          {/* Integration Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {/* Salesforce */}
            <div className="card border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Building className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Salesforce</h3>
                  <p className="text-xs text-gray-500">CRM sync</p>
                </div>
                {syncResults.salesforce && (
                  <span className="ml-auto flex items-center text-xs text-green-600">
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />Synced
                  </span>
                )}
              </div>
              <div className="space-y-2 mb-4">
                <input type="text" placeholder="Instance URL" value={sfConfig.instanceUrl}
                  onChange={e => setSfConfig(p => ({ ...p, instanceUrl: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                <input type="password" placeholder="Access Token" value={sfConfig.accessToken}
                  onChange={e => setSfConfig(p => ({ ...p, accessToken: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
              </div>
              <button onClick={syncFromSalesforce} disabled={syncing === 'salesforce'}
                className="w-full btn-primary text-sm flex items-center justify-center">
                {syncing === 'salesforce' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                {syncing === 'salesforce' ? 'Syncing...' : 'Import from Salesforce'}
              </button>
              {syncResults.salesforce && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {syncResults.salesforce.leads?.length} leads · {syncResults.salesforce.source}
                </p>
              )}
            </div>

            {/* HubSpot */}
            <div className="card border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Globe className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">HubSpot</h3>
                  <p className="text-xs text-gray-500">CRM sync</p>
                </div>
                {syncResults.hubspot && (
                  <span className="ml-auto flex items-center text-xs text-green-600">
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />Synced
                  </span>
                )}
              </div>
              <div className="space-y-2 mb-4">
                <input type="password" placeholder="HubSpot API Key (pat-na1-...)" value={hsConfig.apiKey}
                  onChange={e => setHsConfig(p => ({ ...p, apiKey: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                <a href="https://app.hubspot.com/api-key" target="_blank" rel="noopener noreferrer"
                  className="text-xs text-primary flex items-center hover:underline">
                  Get API key <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
              <button onClick={syncFromHubSpot} disabled={syncing === 'hubspot'}
                className="w-full btn-primary text-sm flex items-center justify-center">
                {syncing === 'hubspot' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                {syncing === 'hubspot' ? 'Syncing...' : 'Import from HubSpot'}
              </button>
              {syncResults.hubspot && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {syncResults.hubspot.contacts?.length} contacts · {syncResults.hubspot.source}
                </p>
              )}
            </div>

            {/* Google Sheets */}
            <div className="card border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Google Sheets</h3>
                  <p className="text-xs text-gray-500">Import / Export</p>
                </div>
                {syncResults.googleSheets && (
                  <span className="ml-auto flex items-center text-xs text-green-600">
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />Synced
                  </span>
                )}
              </div>
              <div className="space-y-2 mb-4">
                <input type="text" placeholder="Spreadsheet ID" value={gsConfig.spreadsheetId}
                  onChange={e => setGsConfig(p => ({ ...p, spreadsheetId: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                <input type="text" placeholder="Sheet name (e.g. Leads)" value={gsConfig.sheetName}
                  onChange={e => setGsConfig(p => ({ ...p, sheetName: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                <input type="password" placeholder="Google Sheets API Key" value={gsConfig.apiKey}
                  onChange={e => setGsConfig(p => ({ ...p, apiKey: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
              </div>
              <button onClick={syncFromGoogleSheets} disabled={syncing === 'googleSheets'}
                className="w-full btn-primary text-sm flex items-center justify-center">
                {syncing === 'googleSheets' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                {syncing === 'googleSheets' ? 'Importing...' : 'Import from Sheets'}
              </button>
              {syncResults.googleSheets && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {syncResults.googleSheets.rowCount || syncResults.googleSheets.leads?.length} rows · {syncResults.googleSheets.source}
                </p>
              )}
            </div>
          </div>

          {/* Imported Leads Table */}
          {importedLeads.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Imported Leads</h2>
                  <p className="text-sm text-gray-500">{importedLeads.length} leads ready to import · {selectedLeads.size} selected</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={pushToSalesforce} disabled={pushing || selectedLeads.size === 0}
                    className="btn-secondary text-sm flex items-center disabled:opacity-50">
                    {pushing ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Upload className="h-4 w-4 mr-1.5" />}
                    Push to Salesforce
                  </button>
                  <button onClick={pushToHubSpot} disabled={pushing || selectedLeads.size === 0}
                    className="btn-secondary text-sm flex items-center disabled:opacity-50">
                    {pushing ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Upload className="h-4 w-4 mr-1.5" />}
                    Push to HubSpot
                  </button>
                  <button onClick={saveToDatabase} disabled={pushing}
                    className="btn-primary text-sm flex items-center">
                    {pushing ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Zap className="h-4 w-4 mr-1.5" />}
                    {pushing ? 'Saving...' : `Save ${selectedLeads.size || importedLeads.length} to Pipeline`}
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input type="checkbox" checked={selectedLeads.size === importedLeads.length}
                          onChange={toggleAll} className="rounded border-gray-300 text-primary focus:ring-primary" />
                      </th>
                      {['Name', 'Company', 'Role', 'Industry', 'Email', 'Source', 'Score'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {importedLeads.map(lead => (
                      <tr key={lead.id} className={`hover:bg-gray-50 ${selectedLeads.has(lead.id) ? 'bg-blue-50' : ''}`}>
                        <td className="px-4 py-3">
                          <input type="checkbox" checked={selectedLeads.has(lead.id)} onChange={() => toggleLead(lead.id)}
                            className="rounded border-gray-300 text-primary focus:ring-primary" />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{lead.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{lead.company}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{lead.role}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{lead.industry}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{lead.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{lead.source}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            lead.engagementScore >= 80 ? 'bg-red-100 text-red-800' :
                            lead.engagementScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-700'
                          }`}>{lead.engagementScore}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty state */}
          {importedLeads.length === 0 && (
            <div className="card text-center py-16">
              <Database className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No leads imported yet</h3>
              <p className="text-sm text-gray-500 mb-6">Connect a CRM or Google Sheets above to import leads, or click below to use demo data</p>
              <button onClick={() => {
                syncFromSalesforce()
              }} className="btn-primary">
                Load Demo Data
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

// Map Salesforce lead to internal Lead format
function mapSFLeadToLead(sf: any): Lead {
  return {
    id: sf.Id || `sf-${Date.now()}-${Math.random()}`,
    name: `${sf.FirstName || ''} ${sf.LastName || ''}`.trim(),
    company: sf.Company || '',
    role: sf.Title || '',
    industry: sf.Industry || '',
    location: sf.City ? `${sf.City}, ${sf.State || ''}` : '',
    source: sf.LeadSource || 'Salesforce',
    email: sf.Email || '',
    phone: sf.Phone || '',
    engagementScore: 50,
    aiScore: 0,
    conversionProbability: 0,
    category: 'cold',
    status: 'new',
    createdAt: new Date(sf.CreatedDate || Date.now()),
    updatedAt: new Date(),
  }
}

// Map HubSpot contact to internal Lead format
function mapHSContactToLead(hs: any): Lead {
  const p = hs.properties || {}
  return {
    id: hs.id || `hs-${Date.now()}-${Math.random()}`,
    name: `${p.firstname || ''} ${p.lastname || ''}`.trim(),
    company: p.company || '',
    role: p.jobtitle || '',
    industry: p.industry || '',
    location: p.city ? `${p.city}, ${p.state || ''}` : '',
    source: 'HubSpot',
    email: p.email || '',
    phone: p.phone || '',
    engagementScore: 50,
    aiScore: 0,
    conversionProbability: 0,
    category: 'cold',
    status: 'new',
    createdAt: new Date(p.createdate || Date.now()),
    updatedAt: new Date(),
  }
}

// Merge leads, avoiding duplicates by email
function mergeLeads(existing: Lead[], incoming: Lead[]): Lead[] {
  const emails = new Set(existing.map(l => l.email).filter(Boolean))
  const newLeads = incoming.filter(l => !l.email || !emails.has(l.email))
  return [...existing, ...newLeads]
}
