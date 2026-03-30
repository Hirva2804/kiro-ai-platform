'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { 
  Plus, 
  Mail, 
  Play, 
  Pause, 
  Edit, 
  Trash2,
  Users,
  TrendingUp,
  Calendar,
  Target
} from 'lucide-react'
import Link from 'next/link'

import { getCampaigns, updateCampaignStatus, deleteCampaign, deleteAllCampaigns, CampaignData } from '@/lib/data'

type Campaign = CampaignData

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)

  useEffect(() => {
    getCampaigns().then(data => { setCampaigns(data); setLoading(false) })
  }, [])

  const getStatusColor = (status: Campaign['status']) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800'
    }
    return colors[status]
  }

  const getTypeIcon = (type: Campaign['type']) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />
      case 'linkedin':
        return <Users className="h-4 w-4" />
      case 'phone':
        return <Target className="h-4 w-4" />
      default:
        return <TrendingUp className="h-4 w-4" />
    }
  }

  const calculateConversionRate = (campaign: Campaign) => {
    return campaign.stats.contacted > 0 
      ? (campaign.stats.converted / campaign.stats.contacted * 100).toFixed(1)
      : '0.0'
  }

  const calculateOpenRate = (campaign: Campaign) => {
    return campaign.stats.contacted > 0 
      ? (campaign.stats.opened / campaign.stats.contacted * 100).toFixed(1)
      : '0.0'
  }

  const toggleCampaignStatus = (campaignId: string) => {
    setCampaigns(campaigns.map(campaign => {
      if (campaign.id === campaignId) {
        const newStatus = campaign.status === 'active' ? 'paused' : 'active'
        updateCampaignStatus(campaignId, newStatus).catch(() => {})
        return { ...campaign, status: newStatus }
      }
      return campaign
    }))
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    if (window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      try {
        await deleteCampaign(campaignId)
        setCampaigns(campaigns.filter(c => c.id !== campaignId))
      } catch (error) {
        console.error('Failed to delete campaign:', error)
        alert('Failed to delete campaign. Please try again.')
      }
    }
  }

  const handleDeleteAllCampaigns = async () => {
    if (campaigns.length === 0) {
      alert('No campaigns to delete.')
      return
    }
    
    if (window.confirm(`Are you sure you want to delete all ${campaigns.length} campaigns? This action cannot be undone.`)) {
      try {
        await deleteAllCampaigns()
        setCampaigns([])
      } catch (error) {
        console.error('Failed to delete all campaigns:', error)
        alert('Failed to delete all campaigns. Please try again.')
      }
    }
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Create and manage automated outreach campaigns
                </p>
              </div>
              <div className="flex space-x-3">
                {campaigns.length > 0 && (
                  <button
                    onClick={handleDeleteAllCampaigns}
                    className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Trash2 className="h-4 w-4 mr-2 inline" />
                    Delete All
                  </button>
                )}
                <Link href="/dashboard/campaigns/new" className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  New Campaign
                </Link>
              </div>
            </div>
          </div>

          {/* Campaign Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Total Campaigns</p>
                  <p className="text-2xl font-semibold text-gray-900">{campaigns.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Play className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Active Campaigns</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {campaigns.filter(c => c.status === 'active').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Mail className="h-8 w-8 text-blue-500" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Total Contacted</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {campaigns.reduce((sum, c) => sum + c.stats.contacted, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-emerald-500" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Total Converted</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {campaigns.reduce((sum, c) => sum + c.stats.converted, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Campaigns List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <li key={campaign.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-4">
                          <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center text-white">
                            {getTypeIcon(campaign.type)}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {campaign.name}
                            </p>
                            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{campaign.description}</p>
                          <div className="mt-2 flex items-center text-xs text-gray-400">
                            <span className="capitalize">{campaign.type} campaign</span>
                            <span className="mx-2">•</span>
                            <span>{campaign.stats.totalTargets} targets</span>
                            <span className="mx-2">•</span>
                            <span>Created {campaign.createdAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        {/* Campaign Stats */}
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {calculateConversionRate(campaign)}% conversion
                          </div>
                          <div className="text-xs text-gray-500">
                            {calculateOpenRate(campaign)}% open rate
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {campaign.stats.contacted}/{campaign.stats.totalTargets}
                          </div>
                          <div className="text-xs text-gray-500">contacted</div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleCampaignStatus(campaign.id)}
                            className={`p-2 rounded-lg ${
                              campaign.status === 'active' 
                                ? 'text-yellow-600 hover:bg-yellow-50' 
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                          >
                            {campaign.status === 'active' ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </button>
                          <Link
                            href={`/dashboard/campaigns/${campaign.id}/edit`}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button 
                            onClick={() => handleDeleteCampaign(campaign.id)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{campaign.stats.contacted}/{campaign.stats.totalTargets}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(campaign.stats.contacted / campaign.stats.totalTargets) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Detailed Stats */}
                    <div className="mt-4 grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-gray-900">{campaign.stats.contacted}</div>
                        <div className="text-xs text-gray-500">Contacted</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">{campaign.stats.opened}</div>
                        <div className="text-xs text-gray-500">Opened</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">{campaign.stats.replied}</div>
                        <div className="text-xs text-gray-500">Replied</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-600">{campaign.stats.converted}</div>
                        <div className="text-xs text-gray-500">Converted</div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {campaigns.length === 0 && (
            <div className="text-center py-12">
              <Mail className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new campaign.</p>
              <div className="mt-6">
                <Link href="/dashboard/campaigns/new" className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  New Campaign
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}