'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Upload, FileText, Download, Plus, X, CheckCircle } from 'lucide-react'
import Papa from 'papaparse'
import toast from 'react-hot-toast'
import { Lead } from '@/types'
import { calculateAIScore, getLeadCategory, getConversionProbability } from '@/lib/leads'
import { createLead } from '@/lib/data'
import Link from 'next/link'

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [allParsedData, setAllParsedData] = useState<any[]>([])
  const [savedCount, setSavedCount] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '', company: '', role: '', industry: '',
    location: '', source: 'Manual Entry', email: '', phone: '',
  })

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0])
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0])
  }

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) { toast.error('Please upload a CSV file'); return }
    setUploading(true)
    setSavedCount(0)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[]
        setAllParsedData(rows)
        setPreviewData(rows.slice(0, 5))
        setUploading(false)
        toast.success(`Parsed ${rows.length} rows — click "Import Leads" to save`)
      },
      error: (error) => {
        toast.error('Error parsing CSV: ' + error.message)
        setUploading(false)
      }
    })
  }

  const buildLead = (row: any) => {
    // engagementScore is optional — default to 50 if not provided
    const engagementScore = parseInt(row.engagementScore || row['Engagement Score'] || row.engagement_score || '0') || 50
    const leadData = {
      name: row.name || row.Name || '',
      company: row.company || row.Company || '',
      role: row.role || row.Role || row.title || row.Title || row.job_title || '',
      industry: row.industry || row.Industry || 'Other',
      location: row.location || row.Location || row.city || '',
      source: row.source || row.Source || 'CSV Upload',
      email: row.email || row.Email || '',
      phone: row.phone || row.Phone || '',
      engagementScore,
    }
    const aiScore = calculateAIScore(leadData)
    const category = getLeadCategory(aiScore)
    const conversionProbability = getConversionProbability(aiScore)
    return {
      ...leadData,
      aiScore,
      category,
      conversionProbability,
      status: 'new' as const,
      predictedLifetimeValue: Math.floor(conversionProbability * 800 + Math.random() * 40000),
      notes: row.notes || row.Notes || '',
    }
  }

  const processLeads = async () => {
    if (!allParsedData.length) return
    setUploading(true)
    setSavedCount(0)
    let saved = 0
    let failed = 0

    for (const row of allParsedData) {
      try {
        const lead = buildLead(row)
        if (!lead.name || !lead.company) { failed++; continue }
        await createLead(lead)
        saved++
        setSavedCount(saved)
      } catch (e) {
        failed++
      }
    }

    setUploading(false)
    setPreviewData([])
    setAllParsedData([])
    if (saved > 0) toast.success(`${saved} leads imported successfully!`)
    if (failed > 0) toast.error(`${failed} rows skipped (missing name or company)`)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const aiScore = calculateAIScore(formData)
      const category = getLeadCategory(aiScore)
      const conversionProbability = getConversionProbability(aiScore)
      await createLead({
        ...formData,
        engagementScore: 50,
        aiScore,
        category,
        conversionProbability,
        status: 'new',
        predictedLifetimeValue: Math.floor(conversionProbability * 800 + Math.random() * 40000),
        notes: '',
      })
      toast.success('Lead added successfully!')
      setShowForm(false)
      setFormData({ name: '', company: '', role: '', industry: '', location: '', source: 'Manual Entry', email: '', phone: '' })
    } catch {
      toast.error('Failed to save lead')
    }
  }

  const downloadTemplate = () => {
    const csv = Papa.unparse([{ name: 'John Doe', company: 'Example Corp', role: 'VP Sales', industry: 'SaaS', location: 'San Francisco, CA', source: 'LinkedIn', email: 'john@example.com', phone: '+1-555-0123', engagementScore: 75 }])
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'lead-template.csv'
    a.click()
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Upload Leads</h1>
              <p className="mt-1 text-sm text-gray-500">Import from CSV or add manually. AI scores each lead automatically.</p>
            </div>
            {savedCount > 0 && (
              <Link href="/dashboard/leads" className="btn-primary flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                View {savedCount} Imported Leads
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* CSV Upload */}
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-4">CSV Upload</h2>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <label htmlFor="file-upload" className="cursor-pointer text-sm text-gray-600">
                  <span className="text-primary font-medium">Click to upload</span> or drag and drop
                  <input id="file-upload" type="file" accept=".csv" className="sr-only" onChange={handleFileInput} />
                </label>
                <p className="text-xs text-gray-500 mt-2">CSV files only — name and company columns required</p>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <button onClick={downloadTemplate} className="btn-secondary text-sm">
                  <Download className="h-4 w-4 mr-2" />Download Template
                </button>
                {allParsedData.length > 0 && (
                  <button onClick={processLeads} disabled={uploading} className="btn-primary text-sm">
                    {uploading ? `Importing... (${savedCount}/${allParsedData.length})` : `Import ${allParsedData.length} Leads`}
                  </button>
                )}
              </div>

              {previewData.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Preview (first 5 rows)</h3>
                  <div className="overflow-x-auto rounded border">
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(previewData[0] || {}).slice(0, 5).map(key => (
                            <th key={key} className="px-2 py-2 text-left font-medium text-gray-500 uppercase">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {previewData.map((row, i) => (
                          <tr key={i}>
                            {Object.values(row).slice(0, 5).map((val: any, j) => (
                              <td key={j} className="px-2 py-2 text-gray-900 truncate max-w-[100px]">{val}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Manual Entry */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Manual Entry</h2>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
                  {showForm ? <X className="h-4 w-4" /> : <><Plus className="h-4 w-4 mr-1 inline" />Add Lead</>}
                </button>
              </div>

              {showForm ? (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Name *', key: 'name', type: 'text', required: true },
                      { label: 'Company *', key: 'company', type: 'text', required: true },
                      { label: 'Role', key: 'role', type: 'text', required: false },
                      { label: 'Location', key: 'location', type: 'text', required: false },
                      { label: 'Email', key: 'email', type: 'email', required: false },
                      { label: 'Phone', key: 'phone', type: 'tel', required: false },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                        <input type={f.type} required={f.required} value={(formData as any)[f.key]}
                          onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                    <select value={formData.industry} onChange={e => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm">
                      <option value="">Select Industry</option>
                      {['SaaS', 'FinTech', 'Healthcare', 'E-commerce', 'Manufacturing', 'Retail', 'EdTech', 'Other'].map(i => <option key={i}>{i}</option>)}
                    </select>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary">Save Lead</button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-sm">Click "Add Lead" to manually enter lead information</p>
                </div>
              )}
            </div>
          </div>

          {/* Integration Options */}
          <div className="mt-8 card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">More Import Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: '📊', title: 'Google Sheets', desc: 'Import directly from Google Sheets', href: '/dashboard/integrations' },
                { icon: '🔗', title: 'CRM Integration', desc: 'Connect Salesforce or HubSpot', href: '/dashboard/integrations' },
                { icon: '⚡', title: 'API Access', desc: 'POST to /api/leads for programmatic import', href: '#' },
              ].map(opt => (
                <div key={opt.title} className="border rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">{opt.icon}</div>
                  <h3 className="font-medium text-gray-900">{opt.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{opt.desc}</p>
                  <Link href={opt.href} className="mt-3 btn-secondary text-sm inline-block">Go</Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
