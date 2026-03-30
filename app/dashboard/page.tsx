'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { 
  Users, 
  TrendingUp, 
  Target, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { getDashboardStats } from '@/lib/data'
import { DashboardStats } from '@/types'
import AIDailyBriefing from '@/components/AIDailyBriefing'
import { sessionRandomNumber } from '@/lib/ui/sessionRandom'

const mockStats = {
  totalLeads: 1247,
  highValueLeads: 89,
  conversionRate: 23.5,
  pipelineValue: 485000,
  sourcePerformance: [
    { source: 'Website', count: 456, conversionRate: 28.2 },
    { source: 'LinkedIn', count: 324, conversionRate: 31.5 },
    { source: 'Email Campaign', count: 287, conversionRate: 18.9 },
    { source: 'Referral', count: 180, conversionRate: 42.1 },
  ]
}

const conversionData = [
  { month: 'Jan', conversions: 45, leads: 198 },
  { month: 'Feb', conversions: 52, leads: 234 },
  { month: 'Mar', conversions: 48, leads: 187 },
  { month: 'Apr', conversions: 61, leads: 245 },
  { month: 'May', conversions: 55, leads: 221 },
  { month: 'Jun', conversions: 67, leads: 267 },
]

const leadCategoryData = [
  { name: 'Hot', value: 89, color: '#ef4444' },
  { name: 'Warm', value: 324, color: '#f59e0b' },
  { name: 'Cold', value: 834, color: '#3b82f6' },
]

export default function DashboardPage() {
  const [stats, setStats] = useState(mockStats)
  const [ui, setUi] = useState<{
    conversionRate?: number
    sourceConversionRate: Record<string, number>
    sourcePerformance: Record<string, number>
  }>({ sourceConversionRate: {}, sourcePerformance: {} })

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const data = await getDashboardStats()
      if (cancelled) return
      setStats(data)
    }
    load()
    const id = window.setInterval(load, 12000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  useEffect(() => {
    // Random-but-stable per session; keeps UI “live” without flickering each render.
    const conversionRate = sessionRandomNumber('dashboard:conversionRate', { min: 32, max: 58, decimals: 1 })
    const sourceConversionRate: Record<string, number> = {}
    const sourcePerformance: Record<string, number> = {}
    stats.sourcePerformance.forEach(s => {
      sourceConversionRate[s.source] = sessionRandomNumber(`dashboard:source:${s.source}:conversionRate`, { min: 28, max: 62, decimals: 1 })
      sourcePerformance[s.source] = sessionRandomNumber(`dashboard:source:${s.source}:performance`, { min: 70, max: 98, decimals: 0 })
    })
    setUi({ conversionRate, sourceConversionRate, sourcePerformance })
  }, [stats.sourcePerformance])

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back! Here's what's happening with your leads today.
            </p>
          </div>

          {/* AI Daily Briefing */}
          <AIDailyBriefing />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Leads</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.totalLeads.toLocaleString()}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <ArrowUpRight className="h-4 w-4 flex-shrink-0 self-center" />
                        <span className="sr-only">Increased by</span>
                        12%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="h-8 w-8 text-hot" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">High-Value Leads</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.highValueLeads}</div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <ArrowUpRight className="h-4 w-4 flex-shrink-0 self-center" />
                        8%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Conversion Rate</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{(ui.conversionRate ?? stats.conversionRate)}%</div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <ArrowUpRight className="h-4 w-4 flex-shrink-0 self-center" />
                        2.1%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pipeline Value</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        ${(stats.pipelineValue / 1000).toFixed(0)}K
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-red-600">
                        <ArrowDownRight className="h-4 w-4 flex-shrink-0 self-center" />
                        3%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Conversion Trends */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Conversion Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={conversionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="conversions" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Lead Categories */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Categories</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={leadCategoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {leadCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Source Performance */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Source Performance</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leads
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversion Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.sourcePerformance.map((source) => (
                    <tr key={source.source}>
                      {(() => {
                        const displayConversionRate = ui.sourceConversionRate[source.source] ?? source.conversionRate
                        const performance = ui.sourcePerformance[source.source]
                        const barWidth = performance ?? Math.min(displayConversionRate * 2, 100)
                        const label = displayConversionRate > 30 ? 'Excellent' : displayConversionRate > 20 ? 'Good' : 'Needs Improvement'
                        return (
                          <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {source.source}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {source.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {displayConversionRate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${Math.min(barWidth, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {label}
                          </span>
                        </div>
                      </td>
                          </>
                        )
                      })()}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}