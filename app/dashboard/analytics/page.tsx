'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  DollarSign,
  Calendar,
  Filter,
  Download
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts'

const conversionTrendData = [
  { month: 'Jul', leads: 156, conversions: 23, revenue: 145000 },
  { month: 'Aug', leads: 189, conversions: 31, revenue: 198000 },
  { month: 'Sep', leads: 167, conversions: 28, revenue: 167000 },
  { month: 'Oct', leads: 203, conversions: 42, revenue: 287000 },
  { month: 'Nov', leads: 234, conversions: 38, revenue: 245000 },
  { month: 'Dec', leads: 267, conversions: 51, revenue: 334000 },
  { month: 'Jan', leads: 298, conversions: 67, revenue: 445000 }
]

const sourcePerformanceData = [
  { source: 'LinkedIn', leads: 324, conversions: 89, conversionRate: 27.5, avgScore: 78 },
  { source: 'Website', leads: 456, conversions: 98, conversionRate: 21.5, avgScore: 65 },
  { source: 'Referral', leads: 180, conversions: 67, conversionRate: 37.2, avgScore: 85 },
  { source: 'Email Campaign', leads: 287, conversions: 45, conversionRate: 15.7, avgScore: 58 },
  { source: 'Cold Outreach', leads: 123, conversions: 18, conversionRate: 14.6, avgScore: 52 }
]

const industryData = [
  { name: 'SaaS', value: 35, color: '#2563eb' },
  { name: 'FinTech', value: 28, color: '#7c3aed' },
  { name: 'Healthcare', value: 22, color: '#059669' },
  { name: 'Manufacturing', value: 10, color: '#dc2626' },
  { name: 'Retail', value: 5, color: '#ea580c' }
]

const scoreDistributionData = [
  { scoreRange: '0-20', count: 45, category: 'Cold' },
  { scoreRange: '21-40', count: 123, category: 'Cold' },
  { scoreRange: '41-60', count: 234, category: 'Warm' },
  { scoreRange: '61-80', count: 189, category: 'Warm' },
  { scoreRange: '81-100', count: 87, category: 'Hot' }
]

const leadVelocityData = [
  { stage: 'New', avgDays: 0, leads: 234 },
  { stage: 'Contacted', avgDays: 2.3, leads: 189 },
  { stage: 'Qualified', avgDays: 5.7, leads: 145 },
  { stage: 'Proposal', avgDays: 12.4, leads: 89 },
  { stage: 'Converted', avgDays: 18.9, leads: 67 }
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedMetric, setSelectedMetric] = useState('conversions')

  const totalLeads = conversionTrendData.reduce((sum, item) => sum + item.leads, 0)
  const totalConversions = conversionTrendData.reduce((sum, item) => sum + item.conversions, 0)
  const totalRevenue = conversionTrendData.reduce((sum, item) => sum + item.revenue, 0)
  const overallConversionRate = (totalConversions / totalLeads * 100).toFixed(1)

  const exportData = () => {
    // In a real app, this would generate and download a comprehensive report
    console.log('Exporting analytics data...')
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Deep insights into your lead generation and conversion performance
                </p>
              </div>
              <div className="flex space-x-3">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
                <button onClick={exportData} className="btn-secondary">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Leads</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {totalLeads.toLocaleString()}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <TrendingUp className="h-4 w-4 flex-shrink-0 self-center" />
                        <span className="sr-only">Increased by</span>
                        23%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Conversions</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{totalConversions}</div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <TrendingUp className="h-4 w-4 flex-shrink-0 self-center" />
                        18%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Conversion Rate</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{overallConversionRate}%</div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-red-600">
                        <TrendingDown className="h-4 w-4 flex-shrink-0 self-center" />
                        2%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-emerald-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Revenue</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        ${(totalRevenue / 1000000).toFixed(1)}M
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <TrendingUp className="h-4 w-4 flex-shrink-0 self-center" />
                        31%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Conversion Trends */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Conversion Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={conversionTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="conversions" stroke="#2563eb" fill="#2563eb" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="leads" stroke="#64748b" fill="#64748b" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Growth */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Growth</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={conversionTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${(value as number).toLocaleString()}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Industry Distribution */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Industry Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={industryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {industryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Lead Score Distribution */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Score Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scoreDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="scoreRange" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Source Performance Table */}
          <div className="bg-white rounded-lg border mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Source Performance Analysis</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Leads
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversion Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg AI Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sourcePerformanceData.map((source) => (
                    <tr key={source.source} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {source.source}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {source.leads.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {source.conversions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {source.conversionRate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {source.avgScore}/100
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className={`h-2 rounded-full ${
                                source.conversionRate > 30 ? 'bg-green-500' :
                                source.conversionRate > 20 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(source.conversionRate * 2.5, 100)}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm ${
                            source.conversionRate > 30 ? 'text-green-600' :
                            source.conversionRate > 20 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {source.conversionRate > 30 ? 'Excellent' : 
                             source.conversionRate > 20 ? 'Good' : 'Needs Improvement'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lead Velocity */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Velocity Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {leadVelocityData.map((stage, index) => (
                <div key={stage.stage} className="text-center">
                  <div className="bg-primary text-white rounded-lg p-4 mb-2">
                    <div className="text-2xl font-bold">{stage.leads}</div>
                    <div className="text-sm opacity-90">{stage.stage}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Avg: {stage.avgDays} days
                  </div>
                  {index < leadVelocityData.length - 1 && (
                    <div className="hidden md:block absolute mt-8 ml-16 w-8 h-0.5 bg-gray-300"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}