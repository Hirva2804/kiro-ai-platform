/* eslint-disable react/no-unescaped-entities */
'use client'

import { useMemo, useState } from 'react'
import { X, Wand2, Send, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

type EmailType = 'cold_outreach' | 'follow_up' | 'nurture' | 'proposal' | 'closing'

export function LeadEmailComposer(props: {
  open: boolean
  onClose: () => void
  leadId: string
  leadName: string
  leadEmail: string
  leadCompany: string
  onSent?: () => void
}) {
  const { open, onClose, leadId, leadName, leadEmail, leadCompany, onSent } = props
  const [emailType, setEmailType] = useState<EmailType>('cold_outreach')
  const [prompt, setPrompt] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState(false)

  const canGenerate = prompt.trim().length > 0 && !generating && !sending
  const canSend = subject.trim().length > 0 && body.trim().length > 0 && !sending && !generating

  const title = useMemo(() => `Email ${leadName} (${leadCompany})`, [leadCompany, leadName])

  if (!open) return null

  const generate = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/email/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, emailType, prompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to generate email')
      setSubject(data.subject || '')
      setBody(data.body || '')
      toast.success('Draft generated')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to generate email')
    } finally {
      setGenerating(false)
    }
  }

  const send = async () => {
    setSending(true)
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, to: leadEmail, subject, body }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to send email')
      toast.success('Email sent')
      onSent?.()
      onClose()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to send email')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-[min(720px,92vw)] max-h-[90vh] overflow-auto rounded-2xl bg-white shadow-2xl border">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500">To: {leadEmail}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="text-xs font-medium text-gray-600 block mb-1">Type</label>
              <select
                value={emailType}
                onChange={e => setEmailType(e.target.value as EmailType)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              >
                <option value="cold_outreach">Cold outreach</option>
                <option value="follow_up">Follow up</option>
                <option value="nurture">Nurture</option>
                <option value="proposal">Proposal</option>
                <option value="closing">Closing</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-gray-600 block mb-1">Prompt (what you want the AI to do)</label>
              <input
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Example: Mention our AI lead scoring, highlight 1-2 industry pains, ask for a 15 min call this week."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={generate}
              disabled={!canGenerate}
              className="btn-secondary text-sm flex items-center disabled:opacity-50"
            >
              {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
              Generate draft
            </button>
            <button
              onClick={send}
              disabled={!canSend}
              className="btn-primary text-sm flex items-center disabled:opacity-50"
            >
              {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Approve & send
            </button>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Subject</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Email body (editable before send)</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={10}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Tip: Keep it short. The AI uses the lead's industry and email domain to tailor the draft.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

