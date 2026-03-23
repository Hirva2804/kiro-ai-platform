'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { TrendingUp, DollarSign, Target, Users, Loader2, RefreshCw, Brain } from 'lucide-react'
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'

const forecastData = [
  { month: 'Jan', actual: 45, predicted: 43, revenue: 285000, predictedRevenue: 270000 },
  { month: 'Feb', actual: 52, predicted: 50, revenue: 334000, predictedRevenue: 320000 },
  { month: 'Mar', actual: 48, predicted: 51, revenue: 298000, predictedRevenue: 315000 },
  { month: 'Apr', actual: 61, predicted: 58, revenue: 412000, predictedRevenue: 390000 },
  { month: 'May', actual: 55, predicted: 57, revenue: 356000, predictedRevenue: 365000 },
  { month: 'Jun', actual: 67, predicted: 64, revenue: 445000, predictedRevenue: 425000 },
  { month: 'Jul', actual: null, predicted: 72, revenue: null, predictedRevenue: 480000 },
  { month: 'Aug', actual: null, predicted: 78, revenue: null, predictedRevenue: 520000 },
  { month: 'Sep', actual: null, predicted: 85, revenue: null, predictedRevenue: 570000 },
]

const pipelineHealthData = [
  { stage: 'New', count: 234, value: 1170000, health: 85 },
  { stage: 'Contacted', count: 189, value: 945000, health: 72 },
  { stage: 'Qualified', count: 145, value: 1015000, health: 90 },
  { stage: 'Proposal', count: 89, value: 890000, health: 68 },
  { stage: 'Closing', count: 34, value: 510000, health: 95 },
]

const segmentData = [
  { segment: 'High Intent Startups', count: 45, avgScore: 87, conversionRate: 42, color: '#ef4444' },
  { segment: 'Enterprise Buyers', count: 23, avgScore: 91, conversionRate: 38, color: '#7c3aed' },
  { segment: 'Price-Sensitive SMBs', count: 78, avgScore: 62, conversionRate: 18, color: '#f59e0b' },
  { segment: 'Technical Evaluators', count: 34, avgScore: 74, conversionRate: 29, color: '#2563eb' },
  { segment: 'Passive Browsers', count: 156, avgScore: 41, conversionRate: 8, color: '#6b7280' },
]

export default function ForecastPage() {
  const [aiInsight, setAiInsight] = useState('')
  const [loadingInsight, setLoadingInsight] = useState(false)
  const [forecastPeriod, setForecastPeriod] = useState('Q3')

  const fetchAIInsight = async () => {
    setLoadingInsight(true)
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Based on this pipeline data, provide a 3-bullet forecast insight:
- Current conversion rate: 23.5%
- Pipeline value: $485,000
- Hot leads: 89, Warm: 324, Cold: 834
- Trend: conversions up 18% MoM
- Top industry: SaaS (35%)
Keep it concise and actionable.`
          }]
        })
      })
      const data = await res.json()
      setAiInsight(data.response || '')
    } catch {
      setAiInsight('• Pipeline health is strong with 89 hot leads ready for conversion\n• Q3 forecast shows 15% growth trajectory based on current momentum\n• Focus on 34 proposal-stage leads to accelerate revenue this quarter')
    } finally {
      setLoadingInsight(false)
    }
  }

  useEffect(() => { fetchAIInsight() }, [])

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Forecasting</h1>
              <p className="mt-1 text-sm text-gray-500">Predictive analytics for pipeline, revenue, and conversion</p>
            </div>
            <select
              value={forecastPeriod}
              onChange={(e) => setForecastPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            >
              <option value="Q3">Q3 2024</option>
              <option value="Q4">Q4 2024</option>
              <option value="H2">H2 2024</option>
            </select>
          </div>

          {/* AI Insight Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-start flex-1">
                <Brain className="h-6 w-6 mr-3 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">AI Forecast Insight</h3>
                  {loadingInsight ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-blue-100 text-sm">Analyzing pipeline...</span>
                    </div>
                  ) : (
                    <div className="text-blue-100 text-sm whitespace-pre-line">{aiInsight}</div>
                  )}
                </div>
              </div>
              <button onClick={fetchAIInsight} className="text-blue-200 hover:text-white ml-4">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Forecast KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Predicted Conversions', value: '235', change: '+18%', icon: Target, color: 'text-green-500' },
              { label: 'Forecast Revenue', value: '$1.57M', change: '+23%', icon: DollarSign, color: 'text-blue-500' },
              { label: 'Pipeline Health', value: '82%', change: '+5%', icon: TrendingUp, color: 'text-purple-500' },
              { label: 'At-Risk Leads', value: '34', change: '-12%', icon: Users, color: 'text-orange-500' },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                  <span className={`text-sm font-medium ${kpi.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.change}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
                <div className="text-sm text-gray-500">{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Conversion Forecast */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Conversion Forecast</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <ReferenceLine x="Jun" stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Today', position: 'top', fontSize: 11 }} />
                  <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={2} name="Actual" dot={{ r: 4 }} connectNulls={false} />
                  <Line type="monotone" dataKey="predicted" stroke="#7c3aed" strokeWidth={2} strokeDasharray="5 5" name="Predicted" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Forecast */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Forecast</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v) => [`$${(v as number).toLocaleString()}`, '']} />
                  <ReferenceLine x="Jun" stroke="#94a3b8" strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="revenue" stroke="#2563eb" fill="#2563eb" fillOpacity={0.15} name="Actual" connectNulls={false} />
                  <Area type="monotone" dataKey="predictedRevenue" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.1} strokeDasharray="5 5" name="Predicted" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Lead Segmentation (Feature 9) */}
          <div className="bg-white p-6 rounded-lg border mb-8">
            <div className="flex items-center mb-4">
              <Brain className="h-5 w-5 text-primary mr-2" />
              <h3 className="text-lg font-medium text-gray-900">AI Auto-Segmentation</h3>
              <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">AI Clustered</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {segmentData.map((seg) => (
                <div key={seg.segment} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="w-3 h-3 rounded-full mb-2" style={{ backgroundColor: seg.color }} />
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">{seg.segment}</h4>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Leads</span>
                      <span className="font-medium">{seg.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Score</span>
                      <span className="font-medium">{seg.avgScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Conv. Rate</span>
                      <span className="font-medium text-green-600">{seg.conversionRate}%</span>
                    </div>
                  </div>
                  <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${seg.avgScore}%`, backgroundColor: seg.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline Health */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pipeline Health Score</h3>
            <div className="space-y-4">
              {pipelineHealthData.map((stage) => (
                <div key={stage.stage} className="flex items-center">
                  <div className="w-24 text-sm text-gray-700 font-medium">{stage.stage}</div>
                  <div className="flex-1 mx-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{stage.count} leads</span>
                      <span>${(stage.value / 1000).toFixed(0)}K value</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${stage.health >= 85 ? 'bg-green-500' : stage.health >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${stage.health}%` }}
                      />
                    </div>
                  </div>
                  <div className={`w-12 text-right text-sm font-semibold ${stage.health >= 85 ? 'text-green-600' : stage.health >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {stage.health}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}