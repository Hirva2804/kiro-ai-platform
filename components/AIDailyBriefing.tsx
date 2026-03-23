'use client'

import { useState, useEffect } from 'react'
import { Brain, RefreshCw, Loader2, ChevronRight, Zap, AlertCircle, Trophy, Lightbulb } from 'lucide-react'
import { DailyBriefing } from '@/lib/ai/dailyBriefing'
import Link from 'next/link'

const URGENCY_COLORS = {
  immediate: 'border-l-red-500 bg-red-50',
  today: 'border-l-orange-500 bg-orange-50',
  this_week: 'border-l-blue-500 bg-blue-50',
}

const URGENCY_BADGE = {
  immediate: 'bg-red-500 text-white',
  today: 'bg-orange-500 text-white',
  this_week: 'bg-blue-500 text-white',
}

export default function AIDailyBriefing() {
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null)
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => { fetchBriefing() }, [])

  const fetchBriefing = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: 'there' }),
      })
      const data = await res.json()
      setBriefing(data.result)
    } catch {
      setBriefing(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl p-6 mb-8 text-white">
        <div className="flex items-center">
          <Loader2 className="h-5 w-5 animate-spin mr-3" />
          <span className="text-blue-100 text-sm">Generating your AI daily briefing...</span>
        </div>
      </div>
    )
  }

  if (!briefing) return null

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl mb-8 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start flex-1">
            <Brain className="h-6 w-6 text-white mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <h3 className="text-white font-semibold mr-2">AI Daily Briefing</h3>
                <span className="px-2 py-0.5 bg-white bg-opacity-20 text-white text-xs rounded-full">
                  {new Date(briefing.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-blue-100 text-sm">{briefing.greeting}</p>
              <p className="text-blue-200 text-xs mt-1">{briefing.summary}</p>
            </div>
          </div>
          <div className="flex items-center ml-4">
            <button onClick={fetchBriefing} className="text-blue-200 hover:text-white mr-3 transition-colors">
              <RefreshCw className="h-4 w-4" />
            </button>
            <button onClick={() => setCollapsed(!collapsed)} className="text-blue-200 hover:text-white transition-colors">
              <ChevronRight className={`h-4 w-4 transition-transform ${collapsed ? '' : 'rotate-90'}`} />
            </button>
          </div>
        </div>
      </div>

      {!collapsed && (
        <div className="px-6 pb-6 space-y-4">
          {/* Top Priorities */}
          {briefing.topPriorities?.length > 0 && (
            <div>
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mb-2">Today's Priorities</p>
              <div className="space-y-2">
                {briefing.topPriorities.map((p, i) => (
                  <div key={i} className={`border-l-4 rounded-r-lg p-3 ${URGENCY_COLORS[p.urgency]}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <span className="text-sm font-semibold text-gray-900">{p.leadName}</span>
                        <span className="text-xs text-gray-500 ml-1">· {p.company}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${URGENCY_BADGE[p.urgency]}`}>
                        {p.urgency.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 font-medium">{p.action}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{p.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {briefing.pipelineAlert && (
              <div className="bg-white bg-opacity-10 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <AlertCircle className="h-3.5 w-3.5 text-yellow-300 mr-1.5" />
                  <span className="text-white text-xs font-semibold">Pipeline Alert</span>
                </div>
                <p className="text-blue-100 text-xs">{briefing.pipelineAlert}</p>
              </div>
            )}
            {briefing.winOfTheDay && (
              <div className="bg-white bg-opacity-10 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <Trophy className="h-3.5 w-3.5 text-yellow-300 mr-1.5" />
                  <span className="text-white text-xs font-semibold">Win of the Day</span>
                </div>
                <p className="text-blue-100 text-xs">{briefing.winOfTheDay}</p>
              </div>
            )}
            {briefing.focusTip && (
              <div className="bg-white bg-opacity-10 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <Lightbulb className="h-3.5 w-3.5 text-yellow-300 mr-1.5" />
                  <span className="text-white text-xs font-semibold">Focus Tip</span>
                </div>
                <p className="text-blue-100 text-xs">{briefing.focusTip}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Link href="/dashboard/leads" className="text-blue-200 hover:text-white text-xs flex items-center transition-colors">
              View all leads <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
