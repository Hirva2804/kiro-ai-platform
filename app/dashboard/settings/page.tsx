'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import {
  User, Bell, Shield, CreditCard, Users, Link2, Database,
  Save, Eye, EyeOff, CheckCircle, AlertCircle, Loader2,
  Trash2, Plus, RefreshCw, ExternalLink, Key, Globe, Mail,
  Slack, Chrome, FileSpreadsheet, Building
} from 'lucide-react'
import toast from 'react-hot-toast'

type SettingsTab = 'profile' | 'notifications' | 'integrations' | 'team' | 'security' | 'billing'

const TABS: { id: SettingsTab; label: string; icon: any }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'integrations', label: 'Integrations', icon: Link2 },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'billing', label: 'Billing', icon: CreditCard },
]

const MOCK_TEAM = [
  { id: '1', name: 'Hirvraj Gohil', email: 'hirvraj@company.com', role: 'admin', status: 'active', avatar: 'HG' },
  { id: '2', name: 'Raunak Bhandari', email: 'raunak@company.com', role: 'sales_manager', status: 'active', avatar: 'RB' },
  { id: '3', name: 'Jayesh Garg', email: 'jayesh@company.com', role: 'sales_executive', status: 'active', avatar: 'JG' },
  { id: '4', name: 'Himanshu shah', email: 'himanshu@company.com', role: 'sales_executive', status: 'invited', avatar: 'HS' },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Profile state
  const [profile, setProfile] = useState({ name: 'Hirvraj Gohil', email: 'hirvraj@company.com', company: 'Acme Corp', role: 'admin', phone: '+1 (555) 000-0000', timezone: 'America/New_York' })

  // Notifications state
  const [notifications, setNotifications] = useState({
    hotLeadAlert: true, scoreChange: true, newLead: false, weeklyReport: true,
    teamActivity: false, emailDigest: true, browserPush: true, slackAlerts: false,
  })

  // Integrations state
  const [integrations, setIntegrations] = useState({
    salesforce: { connected: false, apiKey: '', instanceUrl: '' },
    hubspot: { connected: false, apiKey: '' },
    googleSheets: { connected: false, spreadsheetId: '', sheetName: 'Leads' },
    slack: { connected: false, webhookUrl: '' },
    gmail: { connected: false },
  })

  // Security state
  const [security, setSecurity] = useState({ currentPassword: '', newPassword: '', confirmPassword: '', twoFactor: false })

  // Team state
  const [team, setTeam] = useState(MOCK_TEAM)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('sales_executive')

  const save = async (section: string) => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    toast.success(`${section} saved successfully`)
  }

  const connectIntegration = async (name: string) => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 1200))
    setSaving(false)
    setIntegrations(prev => ({ ...prev, [name]: { ...prev[name as keyof typeof prev], connected: true } }))
    toast.success(`${name} connected successfully`)
  }

  const disconnectIntegration = (name: string) => {
    setIntegrations(prev => ({ ...prev, [name]: { ...prev[name as keyof typeof prev], connected: false } }))
    toast.success(`${name} disconnected`)
  }

  const sendInvite = () => {
    if (!inviteEmail) return
    setTeam(prev => [...prev, {
      id: Date.now().toString(), name: inviteEmail.split('@')[0], email: inviteEmail,
      role: inviteRole, status: 'invited', avatar: inviteEmail.substring(0, 2).toUpperCase()
    }])
    setInviteEmail('')
    toast.success(`Invite sent to ${inviteEmail}`)
  }

  const removeTeamMember = (id: string) => {
    setTeam(prev => prev.filter(m => m.id !== id))
    toast.success('Team member removed')
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your account, integrations, and team</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:w-56 flex-shrink-0">
              <nav className="space-y-1">
                {TABS.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}>
                    <tab.icon className="h-4 w-4 mr-3" />{tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="card space-y-5">
                  <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                  <div className="flex items-center gap-4 pb-4 border-b">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
                      {profile.name.charAt(0)}
                    </div>
                    <div>
                      <button className="btn-secondary text-sm">Change Photo</button>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 2MB</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Full Name', key: 'name', type: 'text' },
                      { label: 'Email Address', key: 'email', type: 'email' },
                      { label: 'Company', key: 'company', type: 'text' },
                      { label: 'Phone', key: 'phone', type: 'tel' },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                        <input type={field.type} value={profile[field.key as keyof typeof profile]}
                          onChange={e => setProfile(prev => ({ ...prev, [field.key]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm" />
                      </div>
                    ))}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select value={profile.role} onChange={e => setProfile(prev => ({ ...prev, role: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm">
                        <option value="admin">Admin</option>
                        <option value="sales_manager">Sales Manager</option>
                        <option value="sales_executive">Sales Executive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                      <select value={profile.timezone} onChange={e => setProfile(prev => ({ ...prev, timezone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm">
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Asia/Kolkata">India (IST)</option>
                        <option value="Asia/Dubai">Dubai (GST)</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button onClick={() => save('Profile')} disabled={saving} className="btn-primary flex items-center">
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="card space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
                  {[
                    { section: 'Lead Alerts', items: [
                      { key: 'hotLeadAlert', label: 'Hot lead detected', desc: 'When a lead score exceeds 80' },
                      { key: 'scoreChange', label: 'Score change', desc: 'When a lead score changes significantly' },
                      { key: 'newLead', label: 'New lead added', desc: 'When a new lead is imported or created' },
                    ]},
                    { section: 'Reports', items: [
                      { key: 'weeklyReport', label: 'Weekly performance report', desc: 'Summary of pipeline and conversions' },
                      { key: 'emailDigest', label: 'Daily email digest', desc: 'Morning summary of top leads' },
                    ]},
                    { section: 'Team', items: [
                      { key: 'teamActivity', label: 'Team activity', desc: 'When teammates update leads' },
                      { key: 'slackAlerts', label: 'Slack notifications', desc: 'Send alerts to Slack channel' },
                    ]},
                    { section: 'Browser', items: [
                      { key: 'browserPush', label: 'Browser push notifications', desc: 'Real-time alerts in browser' },
                    ]},
                  ].map(group => (
                    <div key={group.section}>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">{group.section}</h3>
                      <div className="space-y-3">
                        {group.items.map(item => (
                          <div key={item.key} className="flex items-center justify-between py-2">
                            <div>
                              <p className="text-sm font-medium text-gray-800">{item.label}</p>
                              <p className="text-xs text-gray-500">{item.desc}</p>
                            </div>
                            <button onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications[item.key as keyof typeof notifications] ? 'bg-primary' : 'bg-gray-200'}`}>
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications[item.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end pt-2">
                    <button onClick={() => save('Notifications')} disabled={saving} className="btn-primary flex items-center">
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}

              {/* Integrations Tab */}
              {activeTab === 'integrations' && (
                <div className="space-y-4">
                  <div className="card">
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">Integrations</h2>
                    <p className="text-sm text-gray-500 mb-5">Connect your CRM, spreadsheets, and communication tools</p>

                    {/* Salesforce */}
                    <IntegrationCard
                      name="Salesforce"
                      description="Sync leads, contacts, and opportunities with Salesforce CRM"
                      icon={<Building className="h-6 w-6 text-blue-600" />}
                      color="bg-blue-50"
                      connected={integrations.salesforce.connected}
                      onDisconnect={() => disconnectIntegration('salesforce')}
                      badge="CRM"
                    >
                      {!integrations.salesforce.connected && (
                        <div className="space-y-3 mt-4">
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">Instance URL</label>
                            <input type="text" placeholder="https://yourorg.salesforce.com"
                              value={integrations.salesforce.instanceUrl}
                              onChange={e => setIntegrations(prev => ({ ...prev, salesforce: { ...prev.salesforce, instanceUrl: e.target.value } }))}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">API Key / Access Token</label>
                            <input type="password" placeholder="Enter your Salesforce access token"
                              value={integrations.salesforce.apiKey}
                              onChange={e => setIntegrations(prev => ({ ...prev, salesforce: { ...prev.salesforce, apiKey: e.target.value } }))}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                          </div>
                          <button onClick={() => connectIntegration('salesforce')} disabled={saving || !integrations.salesforce.instanceUrl || !integrations.salesforce.apiKey}
                            className="btn-primary text-sm flex items-center disabled:opacity-50">
                            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Link2 className="h-4 w-4 mr-2" />}
                            Connect Salesforce
                          </button>
                        </div>
                      )}
                    </IntegrationCard>

                    {/* HubSpot */}
                    <IntegrationCard
                      name="HubSpot"
                      description="Two-way sync with HubSpot contacts, deals, and pipelines"
                      icon={<Globe className="h-6 w-6 text-orange-500" />}
                      color="bg-orange-50"
                      connected={integrations.hubspot.connected}
                      onDisconnect={() => disconnectIntegration('hubspot')}
                      badge="CRM"
                    >
                      {!integrations.hubspot.connected && (
                        <div className="space-y-3 mt-4">
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">HubSpot API Key</label>
                            <input type="password" placeholder="pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                              value={integrations.hubspot.apiKey}
                              onChange={e => setIntegrations(prev => ({ ...prev, hubspot: { ...prev.hubspot, apiKey: e.target.value } }))}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                          </div>
                          <button onClick={() => connectIntegration('hubspot')} disabled={saving || !integrations.hubspot.apiKey}
                            className="btn-primary text-sm flex items-center disabled:opacity-50">
                            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Link2 className="h-4 w-4 mr-2" />}
                            Connect HubSpot
                          </button>
                        </div>
                      )}
                    </IntegrationCard>

                    {/* Google Sheets */}
                    <IntegrationCard
                      name="Google Sheets"
                      description="Import leads from Google Sheets and export data automatically"
                      icon={<FileSpreadsheet className="h-6 w-6 text-green-600" />}
                      color="bg-green-50"
                      connected={integrations.googleSheets.connected}
                      onDisconnect={() => disconnectIntegration('googleSheets')}
                      badge="Import/Export"
                    >
                      {!integrations.googleSheets.connected && (
                        <div className="space-y-3 mt-4">
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">Spreadsheet ID</label>
                            <input type="text" placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
                              value={integrations.googleSheets.spreadsheetId}
                              onChange={e => setIntegrations(prev => ({ ...prev, googleSheets: { ...prev.googleSheets, spreadsheetId: e.target.value } }))}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                            <p className="text-xs text-gray-400 mt-1">Found in the URL: docs.google.com/spreadsheets/d/<strong>ID</strong>/edit</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">Sheet Name</label>
                            <input type="text" placeholder="Leads"
                              value={integrations.googleSheets.sheetName}
                              onChange={e => setIntegrations(prev => ({ ...prev, googleSheets: { ...prev.googleSheets, sheetName: e.target.value } }))}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => connectIntegration('googleSheets')} disabled={saving || !integrations.googleSheets.spreadsheetId}
                              className="btn-primary text-sm flex items-center disabled:opacity-50">
                              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Link2 className="h-4 w-4 mr-2" />}
                              Connect Google Sheets
                            </button>
                            <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer"
                              className="btn-secondary text-sm flex items-center">
                              <ExternalLink className="h-4 w-4 mr-1.5" />Get API Key
                            </a>
                          </div>
                        </div>
                      )}
                    </IntegrationCard>

                    {/* Slack */}
                    <IntegrationCard
                      name="Slack"
                      description="Get real-time lead alerts and notifications in your Slack workspace"
                      icon={<Slack className="h-6 w-6 text-purple-600" />}
                      color="bg-purple-50"
                      connected={integrations.slack.connected}
                      onDisconnect={() => disconnectIntegration('slack')}
                      badge="Notifications"
                    >
                      {!integrations.slack.connected && (
                        <div className="space-y-3 mt-4">
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">Webhook URL</label>
                            <input type="text" placeholder="https://hooks.slack.com/services/T.../B.../..."
                              value={integrations.slack.webhookUrl}
                              onChange={e => setIntegrations(prev => ({ ...prev, slack: { ...prev.slack, webhookUrl: e.target.value } }))}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                          </div>
                          <button onClick={() => connectIntegration('slack')} disabled={saving || !integrations.slack.webhookUrl}
                            className="btn-primary text-sm flex items-center disabled:opacity-50">
                            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Link2 className="h-4 w-4 mr-2" />}
                            Connect Slack
                          </button>
                        </div>
                      )}
                    </IntegrationCard>

                    {/* Gmail */}
                    <IntegrationCard
                      name="Gmail"
                      description="Track email opens, clicks, and replies from your Gmail account"
                      icon={<Mail className="h-6 w-6 text-red-500" />}
                      color="bg-red-50"
                      connected={integrations.gmail.connected}
                      onDisconnect={() => disconnectIntegration('gmail')}
                      badge="Email"
                    >
                      {!integrations.gmail.connected && (
                        <div className="mt-4">
                          <button onClick={() => connectIntegration('gmail')} className="btn-primary text-sm flex items-center">
                            <Chrome className="h-4 w-4 mr-2" />Connect with Google
                          </button>
                        </div>
                      )}
                    </IntegrationCard>
                  </div>

                  {/* API Keys */}
                  <div className="card">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">API Keys</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Gemini API Key', key: 'GEMINI_API_KEY', hint: 'Get from aistudio.google.com', link: 'https://aistudio.google.com' },
                        { label: 'Supabase URL', key: 'NEXT_PUBLIC_SUPABASE_URL', hint: 'Your Supabase project URL' },
                        { label: 'Supabase Anon Key', key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', hint: 'From Supabase project settings' },
                      ].map(item => (
                        <div key={item.key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Key className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800">{item.label}</p>
                            <p className="text-xs text-gray-400">{item.hint}</p>
                          </div>
                          {item.link && (
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs flex items-center">
                              Get key <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          )}
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">.env.local</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-3">Add these keys to your <code className="bg-gray-100 px-1 rounded">.env.local</code> file and restart the server.</p>
                  </div>
                </div>
              )}

              {/* Team Tab */}
              {activeTab === 'team' && (
                <div className="space-y-4">
                  <div className="card">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h2>
                    <div className="space-y-3 mb-6">
                      {team.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                              {member.avatar}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{member.name}</p>
                              <p className="text-xs text-gray-500">{member.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>{member.status}</span>
                            <select value={member.role}
                              onChange={e => setTeam(prev => prev.map(m => m.id === member.id ? { ...m, role: e.target.value } : m))}
                              className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:ring-primary focus:border-primary">
                              <option value="admin">Admin</option>
                              <option value="sales_manager">Sales Manager</option>
                              <option value="sales_executive">Sales Executive</option>
                            </select>
                            <button onClick={() => removeTeamMember(member.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Invite Team Member</h3>
                      <div className="flex gap-3">
                        <input type="email" placeholder="colleague@company.com" value={inviteEmail}
                          onChange={e => setInviteEmail(e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                        <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
                          <option value="sales_executive">Sales Executive</option>
                          <option value="sales_manager">Sales Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button onClick={sendInvite} disabled={!inviteEmail} className="btn-primary text-sm flex items-center disabled:opacity-50">
                          <Plus className="h-4 w-4 mr-1.5" />Invite
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-4">
                  <div className="card">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
                    <div className="space-y-4 max-w-md">
                      {[
                        { label: 'Current Password', key: 'currentPassword' },
                        { label: 'New Password', key: 'newPassword' },
                        { label: 'Confirm New Password', key: 'confirmPassword' },
                      ].map(field => (
                        <div key={field.key}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                          <div className="relative">
                            <input type={showPassword ? 'text' : 'password'}
                              value={security[field.key as keyof typeof security] as string}
                              onChange={e => setSecurity(prev => ({ ...prev, [field.key]: e.target.value }))}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm" />
                            <button onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      ))}
                      <button onClick={() => save('Password')} disabled={saving} className="btn-primary flex items-center">
                        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
                        Update Password
                      </button>
                    </div>
                  </div>
                  <div className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-500 mt-1">Add an extra layer of security to your account</p>
                      </div>
                      <button onClick={() => { setSecurity(prev => ({ ...prev, twoFactor: !prev.twoFactor })); toast.success(security.twoFactor ? '2FA disabled' : '2FA enabled') }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${security.twoFactor ? 'bg-primary' : 'bg-gray-200'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${security.twoFactor ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                  <div className="card">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">Active Sessions</h3>
                    {[
                      { device: 'Chrome on Windows', location: 'New York, US', time: 'Active now', current: true },
                      { device: 'Safari on iPhone', location: 'New York, US', time: '2 hours ago', current: false },
                    ].map((session, i) => (
                      <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{session.device}</p>
                          <p className="text-xs text-gray-500">{session.location} · {session.time}</p>
                        </div>
                        {session.current ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Current</span>
                        ) : (
                          <button className="text-xs text-red-500 hover:underline">Revoke</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <div className="space-y-4">
                  <div className="card bg-gradient-to-r from-primary to-blue-700 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Current Plan</p>
                        <h2 className="text-2xl font-bold mt-1">Pro Plan</h2>
                        <p className="text-blue-100 text-sm mt-1">$49/month · Renews Jan 1, 2027</p>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-100 text-sm">Seats used</p>
                        <p className="text-2xl font-bold">{team.length}/10</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button className="bg-white text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50">Upgrade to Enterprise</button>
                      <button className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-30">Manage Plan</button>
                    </div>
                  </div>
                  <div className="card">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Plan Features</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {['Up to 10 team members', 'Unlimited leads', 'AI lead scoring', 'Gemini AI integration',
                        'CRM sync (Salesforce, HubSpot)', 'Google Sheets import', 'Advanced analytics', 'Priority support'].map(f => (
                        <div key={f} className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />{f}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="card">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Billing History</h3>
                    <div className="space-y-2">
                      {[
                        { date: 'Jan 1, 2026', amount: '$49.00', status: 'Paid' },
                        { date: 'Dec 1, 2025', amount: '$49.00', status: 'Paid' },
                        { date: 'Nov 1, 2025', amount: '$49.00', status: 'Paid' },
                      ].map((inv, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div>
                            <p className="text-sm font-medium text-gray-800">Pro Plan - {inv.date}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-900">{inv.amount}</span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{inv.status}</span>
                            <button className="text-xs text-primary hover:underline">Download</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function IntegrationCard({ name, description, icon, color, connected, onDisconnect, badge, children }: {
  name: string; description: string; icon: React.ReactNode; color: string;
  connected: boolean; onDisconnect: () => void; badge: string; children?: React.ReactNode
}) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="border border-gray-200 rounded-xl p-4 mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>{icon}</div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">{name}</h3>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{badge}</span>
            </div>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {connected ? (
            <>
              <span className="flex items-center text-xs text-green-600 font-medium">
                <CheckCircle className="h-3.5 w-3.5 mr-1" />Connected
              </span>
              <button onClick={onDisconnect} className="text-xs text-red-500 hover:underline ml-2">Disconnect</button>
            </>
          ) : (
            <button onClick={() => setExpanded(!expanded)} className="btn-secondary text-sm py-1.5">
              {expanded ? 'Cancel' : 'Connect'}
            </button>
          )}
        </div>
      </div>
      {expanded && !connected && children}
    </div>
  )
}
