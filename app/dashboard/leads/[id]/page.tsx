'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import LeadIntelligencePanel from '@/components/LeadIntelligencePanel'
import AIDealCoach from '@/components/AIDealCoach'
import ChatWidget from '@/components/ChatWidget'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building,
  User,
  Clock,
  MessageSquare,
  Calendar,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { Lead, LeadActivity, Recommendation } from '@/types'
import { getLeadById, getActivities, getRecommendations, addActivity } from '@/lib/data'

export default function LeadProfilePage() {
  const params = useParams()
  const [lead, setLead] = useState<Lead | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [activities, setActivities] = useState<LeadActivity[]>([])
  const [newNote, setNewNote] = useState('')

  useEffect(() => {
    const leadId = params.id as string
    Promise.all([
      getLeadById(leadId),
      getRecommendations(leadId),
      getActivities(leadId),
    ]).then(([foundLead, recs, acts]) => {
      setLead(foundLead)
      setRecommendations(recs)
      setActivities(acts)
    })
  }, [params.id])

  if (!lead) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Lead not found</h1>
            <Link href="/dashboard/leads" className="text-primary hover:underline">Back to leads</Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const getCategoryBadge = (category: Lead['category']) => ({
    hot: 'badge-hot', warm: 'badge-warm', cold: 'badge-cold'
  }[category])

  const getStatusColor = (status: Lead['status']): string => {
    const colors: Record<Lead['status'], string> = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800',
      proposal: 'bg-purple-100 text-purple-800',
      converted: 'bg-emerald-100 text-emerald-800',
      lost: 'bg-red-100 text-red-800',
    }
    return colors[status]
  }

  const getPriorityIcon = (priority: string) => {
    if (priority === 'high') return <AlertCircle className="h-4 w-4 text-red-500" />
    if (priority === 'medium') return <Clock className="h-4 w-4 text-yellow-500" />
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const addNote = async () => {
    if (!newNote.trim() || !lead) return
    const activity = await addActivity({
      leadId: lead.id,
      type: 'note',
      description: newNote,
      userId: '1',
    })
    setActivities([activity, ...activities])
    setNewNote('')
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Link href="/dashboard/leads" className="mr-4">
                <ArrowLeft className="h-5 w-5 text-gray-500 hover:text-gray-700" />
              </Link>
              <div className="flex-1">
                <div className="flex items-center flex-wrap gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryBadge(lead.category)}`}>
                    {lead.category.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}>
                    {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-500">{lead.role} at {lead.company}</p>
              </div>
              <div className="flex space-x-2">
                {lead.email && (
                  <button className="btn-secondary">
                    <Mail className="h-4 w-4 mr-2" />Email
                  </button>
                )}
                {lead.phone && (
                  <button className="btn-secondary">
                    <Phone className="h-4 w-4 mr-2" />Call
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* AI Recommendations */}
              {recommendations.length > 0 && (
                <div className="card">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">AI Recommendations</h2>
                  <div className="space-y-3">
                    {recommendations.map((rec) => (
                      <div key={rec.id} className="flex items-start p-3 bg-blue-50 rounded-lg">
                        <div className="flex-shrink-0 mr-3">{getPriorityIcon(rec.priority)}</div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{rec.message}</p>
                          <p className="text-xs text-gray-500 mt-1 capitalize">
                            {rec.type.replace('_', ' ')} • {rec.priority} priority
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity Timeline */}
              <div className="card">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Activity Timeline</h2>
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex space-x-3">
                    <div className="flex-1">
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a note about this lead..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        rows={2}
                      />
                    </div>
                    <button onClick={addNote} disabled={!newNote.trim()} className="btn-primary disabled:opacity-50">
                      Add Note
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                          {activity.type === 'email_open' && <Mail className="h-4 w-4 text-white" />}
                          {activity.type === 'note' && <MessageSquare className="h-4 w-4 text-white" />}
                          {activity.type === 'call' && <Phone className="h-4 w-4 text-white" />}
                          {activity.type === 'meeting' && <Calendar className="h-4 w-4 text-white" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          {activity.createdAt.toLocaleDateString()} at {activity.createdAt.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Intelligence Panel */}
              <LeadIntelligencePanel lead={lead} />

              {/* AI Deal Coach */}
              <AIDealCoach lead={lead} />

              {/* Contact Information */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{lead.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{lead.company}</span>
                  </div>
                  {lead.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">{lead.email}</span>
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">{lead.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{lead.location}</span>
                  </div>
                </div>
              </div>

              {/* Lead Details */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Industry</span>
                    <p className="text-sm text-gray-900">{lead.industry}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Source</span>
                    <p className="text-sm text-gray-900">{lead.source}</p>
                  </div>
                  {lead.predictedLifetimeValue && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Predicted LTV</span>
                      <p className="text-sm text-gray-900 font-semibold text-green-700">
                        ${lead.predictedLifetimeValue.toLocaleString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-500">Engagement Score</span>
                    <div className="flex items-center mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${lead.engagementScore}%` }} />
                      </div>
                      <span className="text-sm text-gray-900">{lead.engagementScore}/100</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Created</span>
                    <p className="text-sm text-gray-900">{lead.createdAt.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Last Updated</span>
                    <p className="text-sm text-gray-900">{lead.updatedAt.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Sales agent chatbot for lead conversations */}
      <ChatWidget
        mode="agent"
        leadContext={`Lead: ${lead.name} | Company: ${lead.company} | Role: ${lead.role} | Industry: ${lead.industry} | AI Score: ${lead.aiScore}/100 | Status: ${lead.status} | Category: ${lead.category}`}
      />
    </DashboardLayout>
  )
}
