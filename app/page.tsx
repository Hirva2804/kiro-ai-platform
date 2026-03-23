import Link from 'next/link'
import { ArrowRight, Target, Brain, TrendingUp, Users, Zap, Shield, BarChart3 } from 'lucide-react'
import ChatWidget from '@/components/ChatWidget'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
              <Target className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-sm tracking-tight">LeadIQ Pro</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium px-3 py-1.5">
              Sign in
            </Link>
            <Link href="/auth/signup" className="btn-primary text-sm px-4 py-2">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 text-xs font-medium text-gray-600 mb-8">
            <Zap className="h-3 w-3" />
            Powered by Gemini AI
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-gray-900 leading-tight mb-6">
            Close more deals with<br />
            <span className="text-black">AI-driven intelligence</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            LeadIQ Pro scores, enriches, and prioritizes your B2B leads automatically — so your team focuses on prospects that actually convert.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth/signup" className="btn-primary px-6 py-3 text-sm gap-2">
              Start free trial <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/auth/login" className="btn-secondary px-6 py-3 text-sm">
              View demo
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-4">No credit card required · Setup in 2 minutes</p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-gray-100 bg-gray-50 py-10">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '3×', label: 'Higher conversion rate' },
            { value: '85%', label: 'AI scoring accuracy' },
            { value: '500+', label: 'Sales teams' },
            { value: '2min', label: 'Setup time' },
          ].map(stat => (
            <div key={stat.label}>
              <div className="text-2xl font-bold text-black">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-3">Everything your sales team needs</h2>
            <p className="text-gray-500 text-base">Built for modern B2B sales — from lead capture to close.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Brain, title: 'AI Lead Scoring', desc: 'Analyzes 50+ signals to predict conversion probability with 85% accuracy. Know who to call before you pick up the phone.' },
              { icon: TrendingUp, title: 'Revenue Forecast', desc: 'AI-powered pipeline forecasting with confidence intervals. Predict your quarter before it happens.' },
              { icon: Users, title: 'Deal Coach', desc: 'Real-time objection handling, meeting prep briefs, and risk detection for every lead in your pipeline.' },
              { icon: BarChart3, title: 'Deep Analytics', desc: 'Conversion funnels, source attribution, team performance — all in one clean dashboard.' },
              { icon: Shield, title: 'Risk Detection', desc: 'Automatically flags leads going cold, stalled deals, and churn signals before they cost you revenue.' },
              { icon: Zap, title: 'CRM Integrations', desc: 'Sync with Salesforce, HubSpot, and Google Sheets. Import leads in seconds, export anywhere.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-4.5 w-4.5 text-white h-4 w-4" />
                </div>
                <h3 className="font-semibold text-sm mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-black">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Ready to grow faster?</h2>
          <p className="text-gray-400 mb-8 text-base">Join 500+ sales teams closing more deals with AI-powered lead intelligence.</p>
          <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors">
            Start your free trial <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-500 py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                <Target className="h-3.5 w-3.5 text-black" />
              </div>
              <span className="text-white font-semibold text-sm">LeadIQ Pro</span>
            </div>
            <p className="text-xs text-gray-600 max-w-xs">AI-powered lead intelligence for modern B2B sales teams.</p>
          </div>
          <div className="grid grid-cols-3 gap-8 text-xs">
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Demo'] },
              { title: 'Company', links: ['About', 'Contact', 'Support'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security'] },
            ].map(col => (
              <div key={col.title}>
                <p className="text-white font-medium mb-3">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map(l => <li key={l} className="hover:text-gray-300 cursor-pointer transition-colors">{l}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-10 pt-6 border-t border-white/5 text-xs text-gray-600">
          © 2025 LeadIQ Pro. All rights reserved.
        </div>
      </footer>

      {/* Lead qualifier chatbot for website visitors */}
      <ChatWidget mode="qualifier" />
    </div>
  )
}
