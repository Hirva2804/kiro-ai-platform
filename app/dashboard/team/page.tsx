'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Users, TrendingUp, Award, Target, Phone, Mail, Star, Brain } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'

const teamMembers = [
  {
    id: '1',
    name: 'Alex Rivera',
    role: 'Sales Executive',
    avatar: 'AR',
    stats: {
      leadsAssigned: 87,
      contacted: 72,
      qualified: 45,
      converted: 18,
      conversionRate: 25.0,
      avgResponseTime: 1.2,
      emailOpenRate: 38.5,
      callConnectRate: 22.1,
      avgDealSize: 42000,
      aiScore: 88
    },
    trend: 'up',
    rank: 1
  },
  {
    id: '2',
    name: 'Jordan Kim',
    role: 'Sales Executive',
    avatar: 'JK',
    stats: {
      leadsAssigned: 94,
      contacted: 68,
      qualified: 38,
      converted: 14,
      conversionRate: 20.6,
      avgResponseTime: 2.8,
      emailOpenRate: 31.2,
      callConnectRate: 18.4,
      avgDealSize: 38000,
      aiScore: 74
    },
    trend: 'up',
    rank: 2
  },
  {
    id: '3',
    name: 'Sam Patel',
    role: 'Sales Manager',
    avatar: 'SP',
    stats: {
      leadsAssigned: 45,
      contacted: 40,
      qualified: 28,
      converted: 12,
      conversionRate: 30.0,
      avgResponseTime: 0.8,
      emailOpenRate: 44.1,
      callConnectRate: 28.7,
      avgDealSize: 67000,
      aiScore: 95
    },
    trend: 'up',
    rank: 0
  },
  {
    id: '4',
    name: 'Casey Morgan',
    role: 'Sales Executive',
    avatar: 'CM',
    stats: {
      leadsAssigned: 76,
      contacted: 51,
      qualified: 29,
      converted: 9,
      conversionRate: 17.6,
      avgResponseTime: 4.1,
      emailOpenRate: 27.8,
      callConnectRate: 15.2,
      avgDealSize: 31000,
      aiScore: 61
    },
    trend: 'down',
    rank: 3
  }
]

const monthlyPerformance = [
  { month: 'Apr', alex: 14, jordan: 11, sam: 9, casey: 7 },
  { month: 'May', alex: 16, jordan: 12, sam: 10, casey: 8 },
  { month: 'Jun', alex: 18, jordan: 14, sam: 12, casey: 9 },
]

export default function TeamPage() {
  const [selectedMember, setSelectedMember] = useState(teamMembers[2])

  const radarData = [
    { metric: 'Conversion', value: Math.round(selectedMember.stats.conversionRate * 3) },
    { metric: 'Response Time', value: Math.round((5 - selectedMember.stats.avgResponseTime) * 20) },
    { metric: 'Email Opens', value: Math.round(selectedMember.stats.emailOpenRate * 2) },
    { metric: 'Call Connect', value: Math.round(selectedMember.stats.callConnectRate * 3) },
    { metric: 'Deal Size', value: Math.round(selectedMember.stats.avgDealSize / 1000) },
    { metric: 'AI Score', value: selectedMember.stats.aiScore },
  ]

  const getAICoachingTip = (member: typeof teamMembers[0]) => {
    if (member.stats.avgResponseTime > 3) return `⚡ ${member.name.split(' ')[0]}'s response time is ${member.stats.avgResponseTime}h avg. Faster follow-up could increase conversion by ~15%.`
    if (member.stats.emailOpenRate < 30) return `📧 ${member.name.split(' ')[0]}'s email open rate is below average. Try A/B testing subject lines.`
    if (member.stats.conversionRate > 25) return `🏆 ${member.name.split(' ')[0]} is a top performer. Consider having them mentor the team on their approach.`
    return `📈 ${member.name.split(' ')[0]} shows steady improvement. Focus on increasing qualified lead rate from ${Math.round(member.stats.qualified / member.stats.contacted * 100)}% to 60%+.`
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Team Performance</h1>
            <p className="mt-1 text-sm text-gray-500">AI-powered insights into individual and team sales performance</p>
          </div>

          {/* Leaderboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {teamMembers.sort((a, b) => b.stats.conversionRate - a.stats.conversionRate).map((member, index) => (
              <div
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className={`bg-white p-5 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  selectedMember.id === member.id ? 'border-primary ring-2 ring-primary ring-opacity-20' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3 ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-blue-400'
                    }`}>
                      {member.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                  </div>
                  {index === 0 && <Award className="h-5 w-5 text-yellow-500" />}
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900">{member.stats.converted}</div>
                    <div className="text-xs text-gray-500">Converted</div>
                  </div>
                  <div>
                    <div className={`text-lg font-bold ${member.stats.conversionRate >= 25 ? 'text-green-600' : member.stats.conversionRate >= 20 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {member.stats.conversionRate}%
                    </div>
                    <div className="text-xs text-gray-500">Conv. Rate</div>
                  </div>
                </div>
                <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${member.stats.aiScore >= 85 ? 'bg-green-500' : member.stats.aiScore >= 70 ? 'bg-yellow-500' : 'bg-red-400'}`}
                    style={{ width: `${member.stats.aiScore}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1 text-right">AI Score: {member.stats.aiScore}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Detailed Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Monthly Performance Chart */}
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Conversions by Rep</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="alex" fill="#2563eb" name="Alex" />
                    <Bar dataKey="jordan" fill="#7c3aed" name="Jordan" />
                    <Bar dataKey="sam" fill="#059669" name="Sam" />
                    <Bar dataKey="casey" fill="#f59e0b" name="Casey" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Selected Member Detail */}
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-semibold mr-4">
                    {selectedMember.avatar}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedMember.name}</h3>
                    <p className="text-sm text-gray-500">{selectedMember.role}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Leads Assigned', value: selectedMember.stats.leadsAssigned, icon: Users },
                    { label: 'Contacted', value: selectedMember.stats.contacted, icon: Phone },
                    { label: 'Qualified', value: selectedMember.stats.qualified, icon: Target },
                    { label: 'Converted', value: selectedMember.stats.converted, icon: Award },
                    { label: 'Conv. Rate', value: `${selectedMember.stats.conversionRate}%`, icon: TrendingUp },
                    { label: 'Avg Response', value: `${selectedMember.stats.avgResponseTime}h`, icon: Star },
                    { label: 'Email Opens', value: `${selectedMember.stats.emailOpenRate}%`, icon: Mail },
                    { label: 'Avg Deal', value: `$${(selectedMember.stats.avgDealSize / 1000).toFixed(0)}K`, icon: Target },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-gray-50 rounded-lg p-3 text-center">
                      <stat.icon className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                      <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Radar Chart + AI Coaching */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Performance Radar</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                    <Radar name={selectedMember.name} dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* AI Coaching Tips */}
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center mb-4">
                  <Brain className="h-5 w-5 text-primary mr-2" />
                  <h3 className="text-sm font-medium text-gray-900">AI Sales Coach</h3>
                </div>
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-800">{getAICoachingTip(member)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}