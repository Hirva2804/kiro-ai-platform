'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { ArrowLeft, Mail, Users, Target, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createCampaign, CampaignData } from '@/lib/data'

export default function NewCampaignPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'email' as CampaignData['type'],
    targetCriteria: {
      industry: '',
      companySize: '',
      location: ''
    }
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const campaignTypes = [
    { value: 'email', label: 'Email Campaign', icon: Mail },
    { value: 'linkedin', label: 'LinkedIn Campaign', icon: Users },
    { value: 'phone', label: 'Phone Campaign', icon: Target },
    { value: 'multi', label: 'Multi-channel Campaign', icon: TrendingUp }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const campaignData = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        status: 'draft' as CampaignData['status'],
        targetCriteria: formData.targetCriteria
      }

      await createCampaign(campaignData)
      router.push('/dashboard/campaigns')
    } catch (error) {
      console.error('Failed to create campaign:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCriteriaChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      targetCriteria: {
        ...prev.targetCriteria,
        [field]: value
      }
    }))
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center">
              <Link
                href="/dashboard/campaigns"
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Campaign</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Set up a new automated outreach campaign
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Campaign Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="e.g., Q4 SaaS Outreach"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="Describe your campaign goals and target audience"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Campaign Type */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Type</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {campaignTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <label
                        key={type.value}
                        className={`
                          relative rounded-lg border p-4 cursor-pointer transition-all
                          ${formData.type === type.value
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-gray-300 hover:border-gray-400'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name="type"
                          value={type.value}
                          checked={formData.type === type.value}
                          onChange={(e) => handleInputChange('type', e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex items-center">
                          <Icon className="h-6 w-6 text-primary" />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{type.label}</p>
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Target Criteria */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Target Criteria</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                      Industry
                    </label>
                    <select
                      id="industry"
                      name="industry"
                      value={formData.targetCriteria.industry}
                      onChange={(e) => handleCriteriaChange('industry', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                    >
                      <option value="">All Industries</option>
                      <option value="technology">Technology</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="finance">Finance</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="retail">Retail</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="companySize" className="block text-sm font-medium text-gray-700">
                      Company Size
                    </label>
                    <select
                      id="companySize"
                      name="companySize"
                      value={formData.targetCriteria.companySize}
                      onChange={(e) => handleCriteriaChange('companySize', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                    >
                      <option value="">All Sizes</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="500+">500+ employees</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.targetCriteria.location}
                      onChange={(e) => handleCriteriaChange('location', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="e.g., United States, Europe"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Link
                href="/dashboard/campaigns"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || !formData.name}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Campaign'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
