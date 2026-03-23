'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Bot, User, Loader2, Sparkles, ChevronDown } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const QUICK_PROMPTS = [
  'Who should I contact first today?',
  'Show me hot leads',
  'What\'s my pipeline value?',
  'Which source converts best?',
  'Leads at risk of going cold?',
]

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: `Hi! I'm your AI Sales Copilot. I have live access to your pipeline.\n\nAsk me anything — leads, performance, what to do next.`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100)
  }, [isOpen])

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msg, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, mode: 'copilot' }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.error || 'Sorry, something went wrong.',
        timestamp: new Date(),
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Connection error. Please try again.',
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center group"
        aria-label="AI Assistant"
      >
        {isOpen ? <ChevronDown className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
        {!isOpen && (
          <span className="absolute right-14 bg-gray-900 text-white text-xs px-2.5 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            AI Copilot
          </span>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-22 right-6 z-50 w-[380px] h-[560px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          style={{ bottom: '5rem' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-black">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Sales Copilot</p>
                <p className="text-gray-400 text-xs">Live pipeline access</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  msg.role === 'user' ? 'bg-black' : 'bg-gray-100'
                }`}>
                  {msg.role === 'user'
                    ? <User className="h-3.5 w-3.5 text-white" />
                    : <Bot className="h-3.5 w-3.5 text-gray-500" />}
                </div>
                <div className={`max-w-[82%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-black text-white rounded-tr-sm'
                    : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-sm'
                }`}>
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none prose-p:my-0.5 prose-ul:my-1 prose-li:my-0 prose-headings:text-sm">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-3.5 w-3.5 text-gray-500" />
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl rounded-tl-sm px-3.5 py-2.5">
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

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map(q => (
                  <button key={q} onClick={() => sendMessage(q)}
                    className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-full transition-colors">
                    {q}
                  </button>
                ))}
              </div>
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
                placeholder="Ask about your pipeline..."
                className="flex-1 bg-transparent px-3.5 py-2.5 text-sm focus:outline-none placeholder-gray-400"
              />
              <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                className="mr-2 w-7 h-7 bg-black text-white rounded-lg flex items-center justify-center disabled:opacity-30 hover:bg-gray-800 transition-colors flex-shrink-0">
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
