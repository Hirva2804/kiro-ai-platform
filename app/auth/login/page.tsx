'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Target, Mail, Lock, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('token', data.token)
        toast.success('Welcome back')
        router.push('/dashboard')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Login failed')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-950 flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
            <Target className="h-4 w-4 text-black" />
          </div>
          <span className="text-white font-semibold text-sm">LeadIQ Pro</span>
        </div>
        <div>
          <blockquote className="text-white text-xl font-medium leading-relaxed mb-6">
            "LeadIQ Pro helped us increase our conversion rate by 3× in just 90 days."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white text-sm font-semibold">S</div>
            <div>
              <p className="text-white text-sm font-medium">Sarah Chen</p>
              <p className="text-gray-500 text-xs">VP Sales, TechFlow Inc</p>
            </div>
          </div>
        </div>
        <p className="text-gray-600 text-xs">© 2025 LeadIQ Pro</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16">
        <div className="max-w-sm w-full mx-auto">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
              <Target className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-sm">LeadIQ Pro</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h1>
          <p className="text-sm text-gray-500 mb-8">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-black font-medium hover:underline">Sign up</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black" />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              {loading ? 'Signing in...' : <><span>Sign in</span><ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">Demo accounts</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            <div className="space-y-2">
              {[
                { label: 'Admin', email: 'admin@demo.com', pass: 'demo123' },
                { label: 'Sales Manager', email: 'manager@demo.com', pass: 'demo123' },
              ].map(d => (
                <button key={d.email} onClick={() => { setEmail(d.email); setPassword(d.pass) }}
                  className="w-full text-left px-3 py-2.5 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-100">
                  <span className="font-medium text-gray-700">{d.label}</span>
                  <span className="text-gray-400 ml-2">{d.email} / {d.pass}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
