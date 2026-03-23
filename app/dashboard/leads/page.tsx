'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Search, Plus, Mail, Phone, MapPin, TrendingUp, Eye, Loader2 } from 'lucide-react'
import { Lead } from '@/types'
import { getLeads } from '@/lib/data'
import Link from 'next/link'
import AISmartSearch from '@/components/AISmartSearch'

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [allLeads, setAllLeads] = useState<Lead[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [aiSearchActive, setAiSearchActive] = useState(false)
  const [aiSearchQuery, setAiSearchQuery] = useState('')

  useEffect(() => {
    getLeads().then(data => { setLeads(data); setAllLeads(data); setLoading(false) })
  }, [])

  const handleAIResults = (filtered: Lead[], query: string) => {
    setLeads(filtered)
    setAiSearchActive(true)
    setAiSearchQuery(query)
  }

  const handleAIClear = () => {
    setLeads(allLeads)
    setAiSearchActive(false)
    setAiSearchQuery('')
  }

  const filtered = (aiSearchActive ? leads : leads)
    .filter(l => !aiSearchActive ? (categoryFilter === 'all' || l.category === categoryFilter) : true)
    .filter(l => !aiSearchActive ? (statusFilter === 'all' || l.status === statusFilter) : true)
    .filter(l => !searchTerm || l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.industry.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.aiScore - a.aiScore)

  const categoryBadge = { hot: 'badge-hot', warm: 'badge-warm', cold: 'badge-cold' }
  const statusColor: Record<Lead['status'], string> = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    qualified: 'bg-green-100 text-green-800',
    proposal: 'bg-purple-100 text-purple-800',
    converted: 'bg-emerald-100 text-emerald-800',
    lost: 'bg-red-100 text-red-800',
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
              <p className="mt-1 text-sm text-gray-500">AI-powered lead management</p>
            </div>
            <Link href="/dashboard/upload" className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />Add Leads
            </Link>
          </div>

          {/* AI Smart Search */}
          <AISmartSearch leads={allLeads} onResults={handleAIResults} onClear={handleAIClear} />

          {/* Filters */}
          <div className="mb-5 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Search leads..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm" />
            </div>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm">
              <option value="all">All Categories</option>
              <option value="hot">Hot</option>
              <option value="warm">Warm</option>
              <option value="cold">Cold</option>
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm">
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            {[
              { label: 'Total', value: filtered.length, color: 'text-gray-900' },
              { label: 'Hot', value: filtered.filter(l => l.category === 'hot').length, color: 'text-red-600' },
              { label: 'Warm', value: filtered.filter(l => l.category === 'warm').length, color: 'text-yellow-600' },
              { label: 'Cold', value: filtered.filter(l => l.category === 'cold').length, color: 'text-blue-600' },
            ].map(s => (
              <div key={s.label} className="bg-white p-4 rounded-lg border">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-sm text-gray-500">{s.label} Leads</div>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {filtered.map(lead => (
                  <li key={lead.id}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-white">
                              {lead.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">{lead.name}</span>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${categoryBadge[lead.category]}`}>
                                {lead.category.toUpperCase()}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">{lead.role} at {lead.company}</div>
                            <div className="flex items-center mt-0.5 text-xs text-gray-400">
                              <MapPin className="h-3 w-3 mr-1" />{lead.location}
                              <span className="mx-2">·</span>{lead.industry}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-5">
                          <div className="text-right">
                            <div className="flex items-center justify-end">
                              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                              <span className="text-sm font-medium text-gray-900">{lead.aiScore}/100</span>
                            </div>
                            <div className="text-xs text-gray-500">{lead.conversionProbability.toFixed(1)}% conv.</div>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColor[lead.status]}`}>
                              {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                            </span>
                            <div className="text-xs text-gray-500 mt-0.5">
                              ${(lead.predictedLifetimeValue || 0).toLocaleString()}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {lead.email && <button className="text-gray-400 hover:text-gray-600"><Mail className="h-4 w-4" /></button>}
                            {lead.phone && <button className="text-gray-400 hover:text-gray-600"><Phone className="h-4 w-4" /></button>}
                            <Link href={`/dashboard/leads/${lead.id}`} className="text-gray-400 hover:text-primary">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-500">No leads found.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
