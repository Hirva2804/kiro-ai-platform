'use client'

import { useState, useEffect } from 'react'
import { 
  Brain, Zap, TrendingUp, AlertCircle, CheckCircle, 
  Clock, Phone, Mail, Linkedin, ChevronDown, ChevronUp,
  Loader2, Copy, RefreshCw, Target
} from 'lucide-react'
import { Lead } from '@/types'
import { ScoringSignal, ExplainedScore } from '@/lib/ai/explainableScoring'
import { NextBestAction } from '@/lib/ai/nextBestAction'
import toast from 'react-hot-toast'

interface Props {
  lead: Lead
}

const INTENT_COLORS = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
}

const URGENCY_COLORS = {
  immediate: 'bg-red-500',
  today: 'bg-orange-500',
  this_week: 'bg-yellow-500',
  next_week: 'bg-gray-400'
}

export default function LeadIntelligencePanel({ lead }: Props) {
  const [loading, setLoading] = useState(true)
  const [scoreData, setScoreData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'score' | 'action' | 'generate'>('score')
  const [generating, setGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<any>(null)
  const [contentType, setContentType] = useState<'email' | 'call_script' | 'linkedin'>('email')
  const [emailType, setEmailType] = useState('cold_outreach')
  const [expandedSignals, setExpandedSignals] = useState(false)

  useEffect(() => {
    fetchScoreData()
  }, [lead.id])

  const fetchScoreData = async () => {
    setLoading(true)
    try {
      // Mock page visits for demo
      const mockPageVisits = lead.aiScore >= 80 ? [
        { page: '/pricing', timeSpent: 180, scrollDepth: 85, timestamp: new Date() },
        { page: '/demo', timeSpent: 120, scrollDepth: 70, timestamp: new Date() }
      ] : []

      const res = await fetch('/api/ai/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead, pageVisits: mockPageVisits })
      })
      const data = await res.json()
      setScoreData(data)
    } catch {
      // Fallback to basic data
      setScoreData({
        aiScore: lead.aiScore,
        conversionProbability: lead.conversionProbability,
        confidence: 0.75,
        category: lead.category,
        signals: [],
        explanation: 'Score based on industry, role, source, and engagement analysis.',
        topReasons: ['Industry match', 'Role seniority', 'Source quality'],
        intentLevel: 'medium',
        nextBestAction: {
          action: 'send_email',
          label: '📧 Send Email',
          urgency: 'today',
          reasoning: 'Personalized outreach recommended.',
          pitchAngle: 'Focus on business outcomes.',
          bestTimeToContact: 'Tuesday–Thursday, 10 AM–12 PM',
          confidence: 0.75
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const generateContent = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: contentType, lead, emailType })
      })
      const data = await res.json()
      setGeneratedContent(data.result)
    } catch {
      toast.error('Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied!')
  }

  if (loading) {
    return (
      <div className="card flex items-center justify-center h-48">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Analyzing lead with AI...</p>
        </div>
      </div>
    )
  }

  const nba: NextBestAction = scoreData?.nextBestAction
  const signals: ScoringSignal[] = scoreData?.signals || []
  const visibleSignals = expandedSignals ? signals : signals.slice(0, 3)

  return (
    <div className="space-y-4">
      {/* Score Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Brain className="h-5 w-5 text-primary mr-2" />
            <h3 className="font-semibold text-gray-900">AI Intelligence</h3>
          </div>
          <button onClick={fetchScoreData} className="text-gray-400 hover:text-gray-600">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 mb-4">
          {(['score', 'action', 'generate'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'score' ? '🧠 Score' : tab === 'action' ? '⚡ Next Action' : '✍️ Generate'}
            </button>
          ))}
        </div>

        {/* Score Tab */}
        {activeTab === 'score' && (
          <div className="space-y-4">
            {/* Score Display */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold text-primary">{scoreData.aiScore}</div>
                <div className="text-xs text-gray-500">AI Score / 100</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-gray-900">
                  {scoreData.conversionProbability?.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">Conversion probability</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  {Math.round((scoreData.confidence || 0.75) * 100)}%
                </div>
                <div className="text-xs text-gray-500">Confidence</div>
              </div>
            </div>

            {/* Score Bar */}
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  scoreData.aiScore >= 80 ? 'bg-red-500' :
                  scoreData.aiScore >= 60 ? 'bg-yellow-500' : 'bg-blue-400'
                }`}
                style={{ width: `${scoreData.aiScore}%` }}
              />
            </div>

            {/* Intent Level */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Buying Intent</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${INTENT_COLORS[scoreData.intentLevel as keyof typeof INTENT_COLORS] || INTENT_COLORS.low}`}>
                {(scoreData.intentLevel || 'low').toUpperCase()} INTENT
              </span>
            </div>

            {/* Gemini Explanation */}
            {scoreData.explanation && (
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-800 mb-1 flex items-center">
                  <Brain className="h-3 w-3 mr-1" /> Why this score?
                </p>
                <p className="text-xs text-blue-700">{scoreData.explanation}</p>
              </div>
            )}

            {/* Top Reasons */}
            {scoreData.topReasons?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Key Signals:</p>
                <ul className="space-y-1">
                  {scoreData.topReasons.map((reason: string, i: number) => (
                    <li key={i} className="flex items-start text-xs text-gray-600">
                      <CheckCircle className="h-3 w-3 text-green-500 mr-1.5 mt-0.5 flex-shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Scoring Signals */}
            {signals.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Scoring Breakdown:</p>
                <div className="space-y-2">
                  {visibleSignals.map((signal, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center flex-1 mr-2">
                        <div className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${
                          signal.impact === 'positive' ? 'bg-green-500' :
                          signal.impact === 'negative' ? 'bg-red-500' : 'bg-gray-400'
                        }`} />
                        <span className="text-xs text-gray-600 truncate">{signal.factor}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5 mr-2">
                          <div
                            className={`h-1.5 rounded-full ${
                              signal.impact === 'positive' ? 'bg-green-500' :
                              signal.impact === 'negative' ? 'bg-red-400' : 'bg-gray-400'
                            }`}
                            style={{ width: `${signal.weight}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700 w-8 text-right">{signal.weight}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {signals.length > 3 && (
                  <button
                    onClick={() => setExpandedSignals(!expandedSignals)}
                    className="mt-2 text-xs text-primary flex items-center"
                  >
                    {expandedSignals ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                    {expandedSignals ? 'Show less' : `Show ${signals.length - 3} more signals`}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Next Best Action Tab */}
        {activeTab === 'action' && nba && (
          <div className="space-y-4">
            {/* Primary Action */}
            <div className={`rounded-lg p-4 ${
              nba.urgency === 'immediate' ? 'bg-red-50 border border-red-200' :
              nba.urgency === 'today' ? 'bg-orange-50 border border-orange-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-gray-900">{nba.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs text-white font-medium ${URGENCY_COLORS[nba.urgency]}`}>
                  {nba.urgency.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-3">{nba.reasoning}</p>
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                Best time: {nba.bestTimeToContact}
              </div>
            </div>

            {/* Pitch Angle */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                <Target className="h-3 w-3 mr-1" /> Pitch Angle
              </p>
              <p className="text-xs text-gray-600">{nba.pitchAngle}</p>
            </div>

            {/* Confidence */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>AI Confidence</span>
              <span className="font-medium text-gray-700">{Math.round(nba.confidence * 100)}%</span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button className="flex flex-col items-center p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <Mail className="h-4 w-4 text-blue-600 mb-1" />
                <span className="text-xs text-blue-700">Email</span>
              </button>
              <button className="flex flex-col items-center p-2 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <Phone className="h-4 w-4 text-green-600 mb-1" />
                <span className="text-xs text-green-700">Call</span>
              </button>
              <button className="flex flex-col items-center p-2 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <Linkedin className="h-4 w-4 text-purple-600 mb-1" />
                <span className="text-xs text-purple-700">LinkedIn</span>
              </button>
            </div>
          </div>
        )}

        {/* Generate Content Tab */}
        {activeTab === 'generate' && (
          <div className="space-y-4">
            {/* Content Type Selector */}
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-2">Content Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['email', 'call_script', 'linkedin'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => { setContentType(type); setGeneratedContent(null) }}
                    className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors ${
                      contentType === type
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type === 'email' ? '📧 Email' : type === 'call_script' ? '📞 Call Script' : '💼 LinkedIn'}
                  </button>
                ))}
              </div>
            </div>

            {contentType === 'email' && (
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-2">Email Type</label>
                <select
                  value={emailType}
                  onChange={(e) => setEmailType(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                >
                  <option value="cold_outreach">Cold Outreach</option>
                  <option value="follow_up">Follow Up</option>
                  <option value="nurture">Nurture</option>
                  <option value="proposal">Proposal</option>
                  <option value="closing">Closing</option>
                </select>
              </div>
            )}

            <button
              onClick={generateContent}
              disabled={generating}
              className="w-full btn-primary text-sm flex items-center justify-center"
            >
              {generating ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
              ) : (
                <><Zap className="h-4 w-4 mr-2" /> Generate with AI</>
              )}
            </button>

            {/* Generated Content */}
            {generatedContent && (
              <div className="space-y-3">
                {contentType === 'email' && (
                  <>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-700">Subject</span>
                        <button onClick={() => copyToClipboard(generatedContent.subject)}>
                          <Copy className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-800">{generatedContent.subject}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-700">Email Body</span>
                        <button onClick={() => copyToClipboard(generatedContent.body)}>
                          <Copy className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-700 whitespace-pre-line max-h-40 overflow-y-auto">
                        {generatedContent.body}
                      </p>
                    </div>
                  </>
                )}

                {contentType === 'call_script' && (
                  <div className="space-y-2">
                    {[
                      { label: 'Opener', key: 'opener' },
                      { label: 'Value Prop', key: 'valueProposition' },
                      { label: 'Voicemail', key: 'voicemail' },
                      { label: 'Closing Line', key: 'closingLine' }
                    ].map(({ label, key }) => (
                      <div key={key} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-gray-700">{label}</span>
                          <button onClick={() => copyToClipboard(generatedContent[key])}>
                            <Copy className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-700">{generatedContent[key]}</p>
                      </div>
                    ))}
                    {generatedContent.discoveryQuestions?.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <span className="text-xs font-medium text-gray-700 block mb-2">Discovery Questions</span>
                        {generatedContent.discoveryQuestions.map((q: string, i: number) => (
                          <p key={i} className="text-xs text-gray-700 mb-1">• {q}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {contentType === 'linkedin' && (
                  <div className="space-y-2">
                    {[
                      { label: 'Connection Request', key: 'connectionRequest' },
                      { label: 'Follow-up Message', key: 'followUpMessage' },
                      { label: 'InMail Subject', key: 'inMailSubject' },
                      { label: 'InMail Body', key: 'inMailBody' }
                    ].map(({ label, key }) => (
                      <div key={key} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-gray-700">{label}</span>
                          <button onClick={() => copyToClipboard(generatedContent[key])}>
                            <Copy className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-700">{generatedContent[key]}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}