'use client'

import { useState } from 'react'
import { Brain, ChevronDown, ChevronUp, Loader2, Copy, Shield, Calendar, AlertTriangle, Zap } from 'lucide-react'
import { Lead } from '@/types'
import { assessLeadRisk, RISK_COLORS, RISK_BADGE, RiskLevel } from '@/lib/ai/riskDetector'
import toast from 'react-hot-toast'

interface Props {
  lead: Lead
}

type ActiveTool = 'objection' | 'meeting' | 'enrich' | 'risk' | null

export default function AIDealCoach({ lead }: Props) {
  const [activeTool, setActiveTool] = useState<ActiveTool>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [objectionInput, setObjectionInput] = useState('')
  const [customObjection, setCustomObjection] = useState('')

  const QUICK_OBJECTIONS = [
    "It's too expensive",
    "We already have a solution",
    "Not the right time",
    "Need to talk to my team",
    "Send me more information",
  ]

  const riskAssessment = assessLeadRisk(lead)

  const toggle = (tool: ActiveTool) => {
    if (activeTool === tool) { setActiveTool(null); setResult(null); return }
    setActiveTool(tool)
    setResult(null)
    if (tool === 'risk') setResult(riskAssessment)
  }

  const runTool = async (tool: ActiveTool, extra?: any) => {
    setLoading(true)
    try {
      const endpoints: Record<string, string> = {
        objection: '/api/ai/objection',
        meeting: '/api/ai/meeting-prep',
        enrich: '/api/ai/enrich',
      }
      const bodies: Record<string, any> = {
        objection: { objection: extra || objectionInput || customObjection, lead },
        meeting: { lead },
        enrich: { lead },
      }
      const res = await fetch(endpoints[tool!], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodies[tool!]),
      })
      const data = await res.json()
      setResult(data.result)
    } catch {
      toast.error('AI request failed')
    } finally {
      setLoading(false)
    }
  }

  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success('Copied!') }

  const toolButtons = [
    { id: 'objection' as ActiveTool, icon: Shield, label: 'Objection Handler', color: 'text-purple-600 bg-purple-50 hover:bg-purple-100', badge: null },
    { id: 'meeting' as ActiveTool, icon: Calendar, label: 'Meeting Prep', color: 'text-blue-600 bg-blue-50 hover:bg-blue-100', badge: null },
    { id: 'enrich' as ActiveTool, icon: Zap, label: 'Enrich Lead', color: 'text-green-600 bg-green-50 hover:bg-green-100', badge: null },
    { id: 'risk' as ActiveTool, icon: AlertTriangle, label: 'Risk Assessment', color: `${RISK_COLORS[riskAssessment.overallRisk]}`, badge: riskAssessment.overallRisk !== 'low' ? riskAssessment.overallRisk : null },
  ]

  return (
    <div className="card">
      <div className="flex items-center mb-4">
        <Brain className="h-5 w-5 text-primary mr-2" />
        <h3 className="font-semibold text-gray-900">AI Deal Coach</h3>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {toolButtons.map(({ id, icon: Icon, label, color, badge }) => (
          <button
            key={id}
            onClick={() => toggle(id)}
            className={`relative flex items-center p-3 rounded-lg border transition-all text-left ${color} ${activeTool === id ? 'ring-2 ring-primary' : 'border-transparent'}`}
          >
            <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-xs font-medium">{label}</span>
            {badge && (
              <span className={`absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${RISK_BADGE[riskAssessment.overallRisk]}`}>
                {badge}
              </span>
            )}
            {activeTool === id ? <ChevronUp className="h-3 w-3 ml-auto" /> : <ChevronDown className="h-3 w-3 ml-auto" />}
          </button>
        ))}
      </div>

      {/* Objection Handler */}
      {activeTool === 'objection' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">Select a common objection or type your own:</p>
          <div className="flex flex-wrap gap-1">
            {QUICK_OBJECTIONS.map(obj => (
              <button key={obj} onClick={() => { setObjectionInput(obj); runTool('objection', obj) }}
                className="text-xs bg-gray-100 hover:bg-purple-100 hover:text-purple-700 px-2 py-1 rounded-full transition-colors">
                {obj}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={customObjection} onChange={e => setCustomObjection(e.target.value)}
              placeholder="Or type a custom objection..."
              className="flex-1 text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
            <button onClick={() => runTool('objection', customObjection)} disabled={!customObjection || loading}
              className="btn-primary text-xs px-3 disabled:opacity-50">Go</button>
          </div>
          {loading && <div className="flex items-center text-xs text-gray-500"><Loader2 className="h-3 w-3 animate-spin mr-2" />Generating response...</div>}
          {result && !loading && (
            <div className="space-y-2">
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-semibold text-purple-800">Your Response</span>
                  <button onClick={() => copy(result.response)}><Copy className="h-3 w-3 text-purple-400" /></button>
                </div>
                <p className="text-xs text-purple-900">{result.response}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <span className="text-xs font-semibold text-blue-800 block mb-1">Follow-up Question</span>
                <p className="text-xs text-blue-900 italic">"{result.followUpQuestion}"</p>
              </div>
              {result.talkingPoints?.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-xs font-semibold text-gray-700 block mb-1">Talking Points</span>
                  {result.talkingPoints.map((p: string, i: number) => (
                    <p key={i} className="text-xs text-gray-600">• {p}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Meeting Prep */}
      {activeTool === 'meeting' && (
        <div className="space-y-3">
          {!result && !loading && (
            <button onClick={() => runTool('meeting')} className="w-full btn-primary text-sm">
              <Calendar className="h-4 w-4 mr-2" />Generate Meeting Brief
            </button>
          )}
          {loading && <div className="flex items-center text-xs text-gray-500"><Loader2 className="h-3 w-3 animate-spin mr-2" />Preparing your brief...</div>}
          {result && !loading && (
            <div className="space-y-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <span className="text-xs font-semibold text-blue-800 block mb-1">Meeting Goal</span>
                <p className="text-xs text-blue-900">{result.meetingGoal}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-xs font-semibold text-gray-700 block mb-1">Executive Summary</span>
                <p className="text-xs text-gray-700">{result.executiveSummary}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-xs font-semibold text-gray-700 block mb-2">Discovery Questions</span>
                {result.discoveryQuestions?.map((q: string, i: number) => (
                  <div key={i} className="flex justify-between items-start mb-1">
                    <p className="text-xs text-gray-600 flex-1">• {q}</p>
                    <button onClick={() => copy(q)} className="ml-1 flex-shrink-0"><Copy className="h-3 w-3 text-gray-400" /></button>
                  </div>
                ))}
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <span className="text-xs font-semibold text-yellow-800 block mb-1">Ice Breaker</span>
                <p className="text-xs text-yellow-900 italic">"{result.personalIcebreaker}"</p>
              </div>
              {result.redFlags?.length > 0 && (
                <div className="bg-red-50 rounded-lg p-3">
                  <span className="text-xs font-semibold text-red-800 block mb-1">⚠️ Watch Out For</span>
                  {result.redFlags.map((f: string, i: number) => (
                    <p key={i} className="text-xs text-red-700">• {f}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Lead Enrichment */}
      {activeTool === 'enrich' && (
        <div className="space-y-3">
          {!result && !loading && (
            <button onClick={() => runTool('enrich')} className="w-full btn-primary text-sm">
              <Zap className="h-4 w-4 mr-2" />Enrich with AI
            </button>
          )}
          {loading && <div className="flex items-center text-xs text-gray-500"><Loader2 className="h-3 w-3 animate-spin mr-2" />Enriching lead data...</div>}
          {result && !loading && (
            <div className="space-y-2">
              {[
                { label: 'Company Size', value: result.estimatedCompanySize },
                { label: 'Est. Revenue', value: result.estimatedRevenue },
                { label: 'Funding Stage', value: result.fundingStage },
                { label: 'Decision Process', value: result.decisionMakingProcess },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className="text-xs font-medium text-gray-900">{value}</span>
                </div>
              ))}
              {result.techStack?.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-xs font-semibold text-gray-700 block mb-2">Tech Stack</span>
                  <div className="flex flex-wrap gap-1">
                    {result.techStack.map((t: string) => (
                      <span key={t} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {result.painPoints?.length > 0 && (
                <div className="bg-red-50 rounded-lg p-3">
                  <span className="text-xs font-semibold text-red-800 block mb-1">Pain Points</span>
                  {result.painPoints.map((p: string, i: number) => (
                    <p key={i} className="text-xs text-red-700">• {p}</p>
                  ))}
                </div>
              )}
              {result.buyingSignals?.length > 0 && (
                <div className="bg-green-50 rounded-lg p-3">
                  <span className="text-xs font-semibold text-green-800 block mb-1">Buying Signals</span>
                  {result.buyingSignals.map((s: string, i: number) => (
                    <p key={i} className="text-xs text-green-700">• {s}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Risk Assessment */}
      {activeTool === 'risk' && result && (
        <div className="space-y-3">
          <div className={`rounded-lg p-3 border ${RISK_COLORS[result.overallRisk as RiskLevel]}`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-semibold capitalize">{result.overallRisk} Risk</span>
              <span className="text-sm font-bold">{result.riskScore}/100</span>
            </div>
            {result.daysUntilChurn && (
              <p className="text-xs">Estimated {result.daysUntilChurn} days until lead goes cold</p>
            )}
          </div>
          {result.signals?.length > 0 && (
            <div className="space-y-2">
              {result.signals.map((signal: any, i: number) => (
                <div key={i} className={`rounded-lg p-2 border text-xs ${RISK_COLORS[signal.severity as RiskLevel]}`}>
                  <div className="font-semibold mb-0.5">{signal.type}</div>
                  <div className="mb-1">{signal.description}</div>
                  <div className="opacity-80">→ {signal.recommendation}</div>
                </div>
              ))}
            </div>
          )}
          {result.recoveryActions?.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs font-semibold text-gray-700 block mb-1">Recovery Actions</span>
              {result.recoveryActions.map((a: string, i: number) => (
                <p key={i} className="text-xs text-gray-600">• {a}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
