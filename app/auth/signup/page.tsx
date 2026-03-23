'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Target, Mail, Lock, User, Briefcase, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'sales_executive' as const })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        toast.success('Account created!')
        router.push('/auth/login')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Signup failed')
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
        <div className="space-y-6">
          {[
            { value: '3×', label: 'Higher conversion rate' },
            { value: '85%', label: 'AI scoring accuracy' },
            { value: '2 min', label: 'Average setup time' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-4">
              <span className="text-3xl font-bold text-white">{s.value}</span>
              <span className="text-gray-400 text-sm">{s.label}</span>
            </div>
          ))}
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

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create account</h1>
          <p className="text-sm text-gray-500 mb-8">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-black font-medium hover:underline">Sign in</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full name', key: 'name', type: 'text', icon: User, placeholder: 'John Smith' },
              { label: 'Email', key: 'email', type: 'email', icon: Mail, placeholder: 'you@company.com' },
              { label: 'Password', key: 'password', type: 'password', icon: Lock, placeholder: '••••••••' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">{f.label}</label>
                <div className="relative">
                  <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type={f.type} required value={(formData as any)[f.key]}
                    onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black" />
                </div>
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Role</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black appearance-none bg-white">
                  <option value="sales_executive">Sales Executive</option>
                  <option value="sales_manager">Sales Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              {loading ? 'Creating account...' : <><span>Create account</span><ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
