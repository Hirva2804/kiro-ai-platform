'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Bot, User, Loader2, MessageCircle, Sparkles, CheckCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

type ChatMode = 'qualifier' | 'agent'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  mode?: ChatMode
  leadContext?: string   // for agent mode — pass lead info
  accentColor?: string  // optional override
}

const QUALIFIER_STARTERS = [
  'I want to learn more',
  'How does pricing work?',
  'Can I see a demo?',
]

const AGENT_STARTERS = [
  'Tell me about your features',
  'How does AI scoring work?',
  'What CRMs do you integrate with?',
]

export default function ChatWidget({ mode = 'qualifier', leadContext = '', accentColor }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: mode === 'qualifier'
        ? `Hi there! 👋 I'm here to help you find out if LeadIQ Pro is the right fit for your team.\n\nWhat's your name and company?`
        : `Hi! I'm here to answer any questions about LeadIQ Pro.\n\nWhat would you like to know?`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [leadSaved, setLeadSaved] = useState(false)
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, mode, leadContext }),
      })
      const data = await res.json()

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Sorry, something went wrong.',
      }
      setMessages(prev => [...prev, assistantMsg])

      if (data.savedLead) setLeadSaved(true)
      if (!isOpen) setUnread(u => u + 1)
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Connection error. Please try again.',
      }])
    } finally {
      setLoading(false)
    }
  }

  const starters = mode === 'qualifier' ? QUALIFIER_STARTERS : AGENT_STARTERS

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      {isOpen && (
        <div className="w-[360px] h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-950">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-gray-950" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">
                  {mode === 'qualifier' ? 'LeadIQ Assistant' : 'Sales Agent'}
                </p>
                <p className="text-gray-400 text-xs">
                  {mode === 'qualifier' ? 'Here to help you get started' : 'Ask me anything'}
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Lead saved banner */}
          {leadSaved && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs text-gray-600">
              <CheckCircle className="h-3.5 w-3.5 text-black flex-shrink-0" />
              Your info has been saved — our team will follow up shortly.
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  msg.role === 'user' ? 'bg-black' : 'bg-gray-100'
                }`}>
                  {msg.role === 'user'
                    ? <User className="h-3 w-3 text-white" />
                    : <Bot className="h-3 w-3 text-gray-500" />}
                </div>
                <div className={`max-w-[82%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-black text-white rounded-tr-sm'
                    : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-sm'
                }`}>
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none prose-p:my-0.5 prose-ul:my-1 prose-li:my-0">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-3 w-3 text-gray-500" />
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl rounded-tl-sm px-3 py-2.5">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick starters */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {starters.map(s => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-full transition-colors">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl focus-within:border-black focus-within:bg-white transition-all">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder={mode === 'qualifier' ? 'Tell us about your team...' : 'Ask a question...'}
                className="flex-1 bg-transparent px-3 py-2.5 text-sm focus:outline-none placeholder-gray-400"
              />
              <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                className="mr-2 w-7 h-7 bg-black text-white rounded-lg flex items-center justify-center disabled:opacity-30 hover:bg-gray-800 transition-colors flex-shrink-0">
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-center text-xs text-gray-300 mt-2">Powered by LeadIQ AI</p>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-13 h-13 bg-black text-white rounded-full shadow-xl hover:bg-gray-800 transition-all flex items-center justify-center relative"
        style={{ width: 52, height: 52 }}
        aria-label="Chat"
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        {!isOpen && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-black text-xs font-bold rounded-full flex items-center justify-center border-2 border-black">
            {unread}
          </span>
        )}
      </button>
    </div>
  )
}
