'use client'

import { useState, useEffect } from 'react'
import { X, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface OnboardingStep {
  id: string
  title: string
  description: string
  target: string
  position: 'top' | 'bottom' | 'left' | 'right'
  action?: {
    text: string
    onClick: () => void
  }
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to LeadIQ Pro! 🎉',
    description: 'Let\'s take a quick tour to help you get the most out of your AI-powered lead intelligence platform.',
    target: 'dashboard-header',
    position: 'bottom'
  },
  {
    id: 'ai-scoring',
    title: 'AI Lead Scoring',
    description: 'Our AI analyzes 50+ data points to score leads from 0-100, helping you prioritize your outreach efforts.',
    target: 'lead-score-card',
    position: 'bottom'
  },
  {
    id: 'smart-recommendations',
    title: 'Smart Recommendations',
    description: 'Get personalized AI recommendations on who to contact, when to reach out, and what message to send.',
    target: 'recommendations-section',
    position: 'left'
  },
  {
    id: 'pipeline-management',
    title: 'Visual Pipeline',
    description: 'Drag and drop leads between stages to update their status and track your sales progress.',
    target: 'pipeline-link',
    position: 'right'
  },
  {
    id: 'content-library',
    title: 'Content Library',
    description: 'Access proven email templates, sales playbooks, and market insights to accelerate your sales process.',
    target: 'content-link',
    position: 'right'
  },
  {
    id: 'upload-leads',
    title: 'Import Your Leads',
    description: 'Upload leads via CSV, add them manually, or connect your CRM. Our AI will automatically score each lead.',
    target: 'upload-link',
    position: 'right',
    action: {
      text: 'Upload Leads Now',
      onClick: () => window.location.href = '/dashboard/upload'
    }
  }
]

export default function OnboardingTour() {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false)

  useEffect(() => {
    // Check if user has seen onboarding
    const seen = localStorage.getItem('hasSeenOnboarding')
    if (!seen) {
      setIsActive(true)
    } else {
      setHasSeenOnboarding(true)
    }
  }, [])

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeOnboarding = () => {
    setIsActive(false)
    setHasSeenOnboarding(true)
    localStorage.setItem('hasSeenOnboarding', 'true')
  }

  const skipOnboarding = () => {
    completeOnboarding()
  }

  const restartOnboarding = () => {
    setCurrentStep(0)
    setIsActive(true)
    setHasSeenOnboarding(false)
  }

  if (!isActive) {
    return hasSeenOnboarding ? (
      <button
        onClick={restartOnboarding}
        className="fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors z-50"
      >
        Take Tour Again
      </button>
    ) : null
  }

  const step = onboardingSteps[currentStep]

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
          
          {/* Tour Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="flex space-x-1 mr-3">
                  {onboardingSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index <= currentStep ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {currentStep + 1} of {onboardingSteps.length}
                </span>
              </div>
              <button
                onClick={skipOnboarding}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600">
                {step.description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Previous
              </button>

              <div className="flex space-x-2">
                {step.action && (
                  <button
                    onClick={step.action.onClick}
                    className="btn-secondary text-sm"
                  >
                    {step.action.text}
                  </button>
                )}
                
                <button
                  onClick={nextStep}
                  className="btn-primary text-sm flex items-center"
                >
                  {currentStep === onboardingSteps.length - 1 ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Get Started
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Skip Option */}
            <div className="mt-4 text-center">
              <button
                onClick={skipOnboarding}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Skip tour
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}