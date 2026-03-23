'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  Target,
  LayoutDashboard,
  Users,
  Upload,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Mail,
  TrendingUp,
  GitBranch,
  UserCheck,
  Link2,
  HelpCircle,
} from 'lucide-react'
import { User } from '@/types'
import NotificationCenter from './NotificationCenter'
import OnboardingTour from './OnboardingTour'
import AIAssistant from './AIAssistant'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/auth/login'); return }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUser({ id: payload.userId, email: payload.email, name: payload.name || payload.email, role: payload.role, createdAt: new Date() })
    } catch {
      localStorage.removeItem('token')
      router.push('/auth/login')
    }
  }, [router])

  const handleLogout = () => { localStorage.removeItem('token'); router.push('/') }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Leads', href: '/dashboard/leads', icon: Users },
    { name: 'Pipeline', href: '/dashboard/pipeline', icon: GitBranch },
    { name: 'Campaigns', href: '/dashboard/campaigns', icon: Mail },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Forecast', href: '/dashboard/forecast', icon: TrendingUp },
    { name: 'Team', href: '/dashboard/team', icon: UserCheck },
    { name: 'Integrations', href: '/dashboard/integrations', icon: Link2 },
    { name: 'Upload', href: '/dashboard/upload', icon: Upload },
    { name: 'Help', href: '/dashboard/help', icon: HelpCircle },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-400 tracking-wide">Loading</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex flex-col max-w-xs w-full h-full bg-gray-950 z-50">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <SidebarContent navigation={navigation} pathname={pathname} onLogout={handleLogout} user={user} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 bg-gray-950">
        <SidebarContent navigation={navigation} pathname={pathname} onLogout={handleLogout} user={user} />
      </div>

      {/* Main content */}
      <div className="lg:pl-60 flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-10 h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-gray-600">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <NotificationCenter />
        </header>

        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      <AIAssistant />
    </div>
  )
}

function SidebarContent({ navigation, pathname, onLogout, user }: {
  navigation: any[]
  pathname: string
  onLogout: () => void
  user: User
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-white/5 flex-shrink-0">
        <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
          <Target className="h-4 w-4 text-black" />
        </div>
        <span className="text-white font-semibold text-sm tracking-tight">LeadIQ Pro</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-100 ${
                isActive
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-black' : ''}`} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-white">{user.name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize truncate">{user.role.replace('_', ' ')}</p>
          </div>
          <button onClick={onLogout} className="text-gray-500 hover:text-white transition-colors flex-shrink-0">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
