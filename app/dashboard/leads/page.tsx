'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Search, Plus, Mail, Pin, MapPin, TrendingUp, Eye, Loader2, Archive, Undo2 } from 'lucide-react'
import { Lead } from '@/types'
import { getLeads } from '@/lib/data'
import Link from 'next/link'
import AISmartSearch from '@/components/AISmartSearch'
import toast from 'react-hot-toast'

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [allLeads, setAllLeads] = useState<Lead[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [aiSearchActive, setAiSearchActive] = useState(false)
  const [aiSearchQuery, setAiSearchQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [pinAnimating, setPinAnimating] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const data = await getLeads()
      if (cancelled) return
      setLeads(data)
      setAllLeads(data)
      setLoading(false)
    }
    load()
    const id = window.setInterval(load, 8000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
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

  const handlePinLead = (leadId: string, leadName: string) => {
    setPinAnimating(leadId)
    setTimeout(() => {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, isPinned: true, status: 'archived' as Lead['status'] } : l))
      setAllLeads(prev => prev.map(l => l.id === leadId ? { ...l, isPinned: true, status: 'archived' as Lead['status'] } : l))
      setPinAnimating(null)
      toast.success(`📌 ${leadName} pinned & archived`, {
        style: { background: '#1e1b4b', color: '#e0e7ff', borderRadius: '12px' },
        icon: '📌',
      })
    }, 600)
  }

  const handleUnpinLead = (leadId: string, leadName: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, isPinned: false, status: 'new' as Lead['status'] } : l))
    setAllLeads(prev => prev.map(l => l.id === leadId ? { ...l, isPinned: false, status: 'new' as Lead['status'] } : l))
    toast.success(`${leadName} restored`, {
      style: { background: '#065f46', color: '#d1fae5', borderRadius: '12px' },
      icon: '✅',
    })
  }

  const filtered = (aiSearchActive ? leads : leads)
    .filter(l => showArchived ? l.status === 'archived' : l.status !== 'archived')
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
    archived: 'bg-indigo-100 text-indigo-800',
  }

  const archivedCount = (aiSearchActive ? leads : allLeads).filter(l => l.status === 'archived').length

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{showArchived ? 'Archived Leads' : 'Leads'}</h1>
              <p className="mt-1 text-sm text-gray-500">{showArchived ? 'Pinned & archived leads' : 'AI-powered lead management'}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowArchived(!showArchived)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  showArchived
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700'
                }`}
              >
                <Archive className="h-4 w-4" />
                {showArchived ? 'Show Active' : 'Archived'}
                {archivedCount > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                    showArchived ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
                  }`}>{archivedCount}</span>
                )}
              </button>
              <Link href="/dashboard/upload" className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />Add Leads
              </Link>
            </div>
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
                  <li key={lead.id} className={`transition-all duration-500 ${
                    pinAnimating === lead.id ? 'opacity-0 scale-95 -translate-x-4' : 'opacity-100 scale-100'
                  } ${lead.isPinned ? 'bg-indigo-50/50' : ''}`}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 relative">
                      {lead.isPinned && (
                        <div className="absolute top-2 right-2">
                          <Pin className="h-3 w-3 text-indigo-400 fill-indigo-400" />
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                            lead.isPinned ? 'bg-indigo-400' : 'bg-primary'
                          }`}>
                            <span className="text-sm font-medium text-white">
                              {lead.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${lead.isPinned ? 'text-gray-500' : 'text-gray-900'}`}>{lead.name}</span>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${categoryBadge[lead.category]}`}>
                                {lead.category.toUpperCase()}
                              </span>
                              {lead.isPinned && (
                                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700 flex items-center gap-1">
                                  <Archive className="h-2.5 w-2.5" /> Archived
                                </span>
                              )}
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
                            {lead.isPinned ? (
                              <button
                                onClick={(e) => { e.preventDefault(); handleUnpinLead(lead.id, lead.name) }}
                                className="group relative p-1.5 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-green-100 hover:text-green-600 transition-all duration-200"
                                title="Unpin & restore lead"
                              >
                                <Undo2 className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={(e) => { e.preventDefault(); handlePinLead(lead.id, lead.name) }}
                                className="group relative p-1.5 rounded-lg text-gray-400 hover:bg-indigo-100 hover:text-indigo-600 transition-all duration-200"
                                title="Pin & archive lead"
                              >
                                <Pin className={`h-4 w-4 transition-transform duration-200 group-hover:rotate-45`} />
                              </button>
                            )}
                            <Link href={`/dashboard/leads/${lead.id}`} className="text-gray-400 hover:text-primary p-1.5 rounded-lg hover:bg-blue-50 transition-all duration-200">
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
