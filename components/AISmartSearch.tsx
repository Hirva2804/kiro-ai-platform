'use client'

import { useState } from 'react'
import { Sparkles, Loader2, X } from 'lucide-react'
import { Lead } from '@/types'

interface Props {
  leads: Lead[]
  onResults: (filtered: Lead[], query: string) => void
  onClear: () => void
}

// Parse natural language query into filters — no API needed
function parseNaturalQuery(query: string, leads: Lead[]): Lead[] {
  const q = query.toLowerCase()

  return leads.filter(lead => {
    // Score filters
    if (q.includes('hot') || q.includes('high score') || q.includes('top leads')) {
      if (lead.category !== 'hot') return false
    }
    if (q.includes('warm')) {
      if (lead.category !== 'warm') return false
    }
    if (q.includes('cold')) {
      if (lead.category !== 'cold') return false
    }

    // Score threshold
    const scoreMatch = q.match(/score (?:above|over|>)\s*(\d+)/)
    if (scoreMatch && lead.aiScore < parseInt(scoreMatch[1])) return false

    const scoreBelow = q.match(/score (?:below|under|<)\s*(\d+)/)
    if (scoreBelow && lead.aiScore > parseInt(scoreBelow[1])) return false

    // Industry filters
    const industries = ['saas', 'fintech', 'healthcare', 'retail', 'manufacturing', 'edtech', 'e-commerce']
    for (const ind of industries) {
      if (q.includes(ind) && !lead.industry.toLowerCase().includes(ind)) return false
    }

    // Status filters
    const statuses = ['new', 'contacted', 'qualified', 'proposal', 'converted', 'lost']
    for (const status of statuses) {
      if (q.includes(status) && lead.status !== status) return false
    }

    // Role filters
    if (q.includes('ceo') || q.includes('founder')) {
      if (!lead.role.toLowerCase().match(/ceo|founder|president/)) return false
    }
    if (q.includes('cto') || q.includes('technical')) {
      if (!lead.role.toLowerCase().match(/cto|technical|engineer|developer/)) return false
    }
    if (q.includes('vp') || q.includes('vice president')) {
      if (!lead.role.toLowerCase().includes('vp') && !lead.role.toLowerCase().includes('vice')) return false
    }
    if (q.includes('director')) {
      if (!lead.role.toLowerCase().includes('director')) return false
    }

    // Source filters
    if (q.includes('linkedin')) {
      if (!lead.source.toLowerCase().includes('linkedin')) return false
    }
    if (q.includes('referral')) {
      if (!lead.source.toLowerCase().includes('referral')) return false
    }
    if (q.includes('website')) {
      if (!lead.source.toLowerCase().includes('website')) return false
    }

    // Value filters
    if (q.includes('high value') || q.includes('big deal')) {
      if ((lead.predictedLifetimeValue || 0) < 50000) return false
    }

    // Location
    const locationMatch = q.match(/(?:from|in)\s+([a-z\s]+?)(?:\s+with|\s+who|\s+and|$)/)
    if (locationMatch) {
      const loc = locationMatch[1].trim()
      if (!lead.location.toLowerCase().includes(loc)) return false
    }

    // Contact info
    if (q.includes('no email') || q.includes('missing email')) {
      if (lead.email) return false
    }
    if (q.includes('has email') || q.includes('with email')) {
      if (!lead.email) return false
    }

    return true
  })
}

const EXAMPLE_QUERIES = [
  'Hot leads from SaaS',
  'VPs with score above 70',
  'Qualified leads from LinkedIn',
  'High value FinTech leads',
  'New leads with email',
]

export default function AISmartSearch({ leads, onResults, onClear }: Props) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(false)

  const runSearch = async (q: string) => {
    if (!q.trim()) { onClear(); setActive(false); return }
    setLoading(true)
    setActive(true)
    // Small delay for UX feel
    await new Promise(r => setTimeout(r, 300))
    const results = parseNaturalQuery(q, leads)
    onResults(results, q)
    setLoading(false)
  }

  const clear = () => {
    setQuery('')
    setActive(false)
    onClear()
  }

  return (
    <div className="mb-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 text-primary" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); if (!e.target.value) clear() }}
          onKeyDown={e => e.key === 'Enter' && runSearch(query)}
          placeholder='AI Search: "Hot SaaS leads" or "VPs with score above 70"...'
          className="w-full pl-10 pr-10 py-2.5 border border-primary border-opacity-40 rounded-xl bg-blue-50 focus:ring-2 focus:ring-primary focus:border-primary text-sm placeholder-blue-400 transition-all"
        />
        {query && (
          <button onClick={clear} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Example queries */}
      {!active && (
        <div className="flex flex-wrap gap-1 mt-2">
          {EXAMPLE_QUERIES.map(q => (
            <button key={q} onClick={() => { setQuery(q); runSearch(q) }}
              className="text-xs bg-blue-50 text-primary px-2 py-1 rounded-full hover:bg-blue-100 transition-colors border border-blue-200">
              {q}
            </button>
          ))}
        </div>
      )}

      {active && !loading && (
        <div className="flex items-center mt-1.5">
          <span className="text-xs text-primary font-medium">AI filter active</span>
          <button onClick={clear} className="ml-2 text-xs text-gray-400 hover:text-gray-600 underline">clear</button>
        </div>
      )}
    </div>
  )
}
