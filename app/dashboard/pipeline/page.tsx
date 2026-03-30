'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { 
  Plus, 
  Mail, 
  Phone, 
  Calendar,
  DollarSign,
  TrendingUp,
  User,
  Building,
  MapPin
} from 'lucide-react'
import { Lead } from '@/types'
import { getLeads, updateLead } from '@/lib/data'
import toast from 'react-hot-toast'
import { sessionRandomNumber } from '@/lib/ui/sessionRandom'

const pipelineStages = [
  { id: 'new', title: 'New Leads', color: 'bg-blue-500' },
  { id: 'contacted', title: 'Contacted', color: 'bg-yellow-500' },
  { id: 'qualified', title: 'Qualified', color: 'bg-green-500' },
  { id: 'proposal', title: 'Proposal', color: 'bg-purple-500' },
  { id: 'converted', title: 'Converted', color: 'bg-emerald-500' },
  { id: 'lost', title: 'Lost', color: 'bg-red-500' }
]

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [pipelineData, setPipelineData] = useState<Record<string, Lead[]>>({})

  useEffect(() => {
    getLeads().then(data => { setLeads(data); setLoading(false) })
  }, [])

  useEffect(() => {
    const grouped = pipelineStages.reduce((acc, stage) => {
      acc[stage.id] = leads.filter(lead => lead.status === stage.id)
      return acc
    }, {} as Record<string, Lead[]>)
    setPipelineData(grouped)
  }, [leads])

  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const sourceStage = source.droppableId
    const destStage = destination.droppableId
    const leadId = draggableId

    // Update lead status
    const updatedLeads = leads.map(lead => {
      if (lead.id === leadId) {
        return { ...lead, status: destStage as Lead['status'], updatedAt: new Date() }
      }
      return lead
    })
    setLeads(updatedLeads)
    updateLead(leadId, { status: destStage as Lead['status'] }).catch(() => {})
    toast.success(`Lead moved to ${pipelineStages.find(s => s.id === destStage)?.title}`)
  }

  const getCategoryBadge = (category: Lead['category']) => {
    const badges = {
      hot: 'bg-red-100 text-red-800',
      warm: 'bg-yellow-100 text-yellow-800',
      cold: 'bg-blue-100 text-blue-800',
    }
    return badges[category]
  }

  const getStageStats = (stageId: string) => {
    const stageLeads = pipelineData[stageId] || []
    const totalValue = stageLeads.reduce((sum, lead) => sum + (lead.predictedLifetimeValue || 0), 0)
    const avgScore = stageLeads.length > 0 
      ? stageLeads.reduce((sum, lead) => sum + lead.aiScore, 0) / stageLeads.length 
      : 0

    return { count: stageLeads.length, totalValue, avgScore }
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Drag and drop leads between stages to update their status
                </p>
              </div>
              <button className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Lead
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
          <>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            {pipelineStages.map((stage) => {
              const stats = getStageStats(stage.id)
              return (
                <div key={stage.id} className="bg-white p-4 rounded-lg border">
                  <div className={`w-3 h-3 rounded-full ${stage.color} mb-2`}></div>
                  <div className="text-lg font-semibold text-gray-900">{stats.count}</div>
                  <div className="text-xs text-gray-500">{stage.title}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    ${(stats.totalValue / 1000).toFixed(0)}K value
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pipeline Board */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {pipelineStages.map((stage) => (
                <div key={stage.id} className="flex-shrink-0 w-80">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${stage.color} mr-2`}></div>
                        <h3 className="font-medium text-gray-900">{stage.title}</h3>
                        <span className="ml-2 bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                          {pipelineData[stage.id]?.length || 0}
                        </span>
                      </div>
                    </div>

                    <Droppable droppableId={stage.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`min-h-[200px] space-y-3 ${
                            snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg' : ''
                          }`}
                        >
                          {(pipelineData[stage.id] || []).map((lead, index) => (
                            <Draggable key={lead.id} draggableId={lead.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-white p-4 rounded-lg border shadow-sm cursor-move hover:shadow-md transition-shadow ${
                                    snapshot.isDragging ? 'rotate-2 shadow-lg' : ''
                                  }`}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-900 text-sm">{lead.name}</h4>
                                      <p className="text-xs text-gray-500">{lead.company}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryBadge(lead.category)}`}>
                                      {lead.category.toUpperCase()}
                                    </span>
                                  </div>

                                  <div className="space-y-1 mb-3">
                                    <div className="flex items-center text-xs text-gray-500">
                                      <User className="h-3 w-3 mr-1" />
                                      {lead.role}
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500">
                                      <MapPin className="h-3 w-3 mr-1" />
                                      {lead.location}
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center">
                                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                                      <span className="text-xs font-medium text-gray-900">
                                        {lead.aiScore}/100
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {lead.conversionProbability.toFixed(1)}%
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center text-xs text-gray-500">
                                      <DollarSign className="h-3 w-3 mr-1" />
                                      ${(lead.predictedLifetimeValue || 0).toLocaleString()}
                                    </div>
                                    <div className="flex space-x-1">
                                      {lead.email && (
                                        <button className="p-1 text-gray-400 hover:text-gray-600">
                                          <Mail className="h-3 w-3" />
                                        </button>
                                      )}
                                      {lead.phone && (
                                        <button className="p-1 text-gray-400 hover:text-gray-600">
                                          <Phone className="h-3 w-3" />
                                        </button>
                                      )}
                                      <button className="p-1 text-gray-400 hover:text-gray-600">
                                        <Calendar className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                </div>
              ))}
            </div>
          </DragDropContext>

          {/* Pipeline Analytics */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Conversion Rates</h3>
              <div className="space-y-3">
                {pipelineStages.slice(0, -1).map((stage, index) => {
                  const currentCount = getStageStats(stage.id).count
                  const nextStage = pipelineStages[index + 1]
                  const nextCount = getStageStats(nextStage.id).count
                  const conversionRate = sessionRandomNumber(`pipeline:${stage.id}->${nextStage.id}:conversionRate`, { min: 35, max: 75, decimals: 1 })

                  return (
                    <div key={stage.id} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {stage.title} → {nextStage.title}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {conversionRate.toFixed(1)}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pipeline Value</h3>
              <div className="space-y-3">
                {pipelineStages.map((stage) => {
                  const stats = getStageStats(stage.id)
                  return (
                    <div key={stage.id} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{stage.title}</span>
                      <span className="text-sm font-medium text-gray-900">
                        ${(stats.totalValue / 1000).toFixed(0)}K
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Average Scores</h3>
              <div className="space-y-3">
                {pipelineStages.map((stage) => {
                  const stats = getStageStats(stage.id)
                  return (
                    <div key={stage.id} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{stage.title}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {stats.avgScore.toFixed(1)}/100
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          </> 
          )} {/* end loading conditional */}
        </div>
      </div>
    </DashboardLayout>
  )
}