'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import { 
  Users, Settings, Activity, Shield, Building2, Globe, 
  AlertTriangle, Lock, User as UserIcon, ArrowUpRight, 
  RefreshCw, Loader2, Search, ExternalLink, Filter
} from 'lucide-react'

interface AdminStats {
  total_users: number
  active_users: number
  total_roles: string[]
  recent_logins: number
  system_status: string
  total_companies?: number
  global_companies?: number
  user_companies?: number
  total_threats?: number
}

interface CompanyItem {
  id: number
  name: string
  domain: string
  industry: string | null
  logo_url: string | null
  is_global: boolean
  is_active: boolean
  created_by_user_name: string | null
  created_by_user_email: string | null
  created_at: string
  latest_risk_assessment?: {
    risk_level: string
    security_score: number
    vulnerabilities_count: number
    abuse_confidence_score: number
    isp: string | null
    country: string | null
  } | null
  active_threats_count?: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, token } = useAuthStore()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [companies, setCompanies] = useState<CompanyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [companiesLoading, setCompaniesLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterScope, setFilterScope] = useState<'all' | 'global' | 'users'>('all')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(200)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vajra-9pjh.onrender.com'

  const fetchStats = useCallback(async () => {
    try {
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const response = await fetch(`${API_URL}/api/admin/stats`, { headers })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        setStats({
          total_users: 3,
          active_users: 3,
          total_roles: ['Admin', 'User'],
          recent_logins: 5,
          system_status: 'Healthy',
          total_companies: 0,
          global_companies: 0,
          user_companies: 0
        })
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    } finally {
      setLoading(false)
    }
  }, [token, API_URL])

  const fetchAllCompanies = useCallback(async () => {
    try {
      setCompaniesLoading(true)
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const response = await fetch(`${API_URL}/api/companies/?active_only=true`, { headers })
      if (response.ok) {
        const data = await response.json()
        setCompanies(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching all companies:', error)
    } finally {
      setCompaniesLoading(false)
    }
  }, [token, API_URL])

  useEffect(() => {
    if (!isAuthenticated || user?.role?.toLowerCase() !== 'admin') {
      router.push('/')
      return
    }
    fetchStats()
    fetchAllCompanies()
  }, [isAuthenticated, user, router, fetchStats, fetchAllCompanies])

  const getRiskBadge = (level?: string) => {
    const l = level?.toLowerCase() || ''
    if (l === 'critical') return 'bg-red-500/15 text-red-400 border-red-500/30'
    if (l === 'high') return 'bg-orange-500/15 text-orange-400 border-orange-500/30'
    if (l === 'medium') return 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    if (l === 'low') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    return 'bg-slate-500/15 text-slate-400 border-slate-500/30'
  }

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.created_by_user_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.created_by_user_email || '').toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (filterScope === 'global') return c.is_global
    if (filterScope === 'users') return !c.is_global
    return true
  })

  const globalCount = companies.filter(c => c.is_global).length
  const userCount = companies.filter(c => !c.is_global).length

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar collapsed={false} setCollapsed={() => {}} sidebarWidth={200} setSidebarWidth={() => {}} />
        <div className="flex-1 flex flex-col ml-64">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-sm text-secondary flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              Loading admin control center...
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed}
        sidebarWidth={sidebarWidth}
        setSidebarWidth={setSidebarWidth}
      />
      <div 
        className="flex-1 flex flex-col transition-all duration-300 overflow-hidden"
        style={{ marginLeft: sidebarCollapsed ? '64px' : `${sidebarWidth}px` }}
      >
        <Navbar />
        <main className="flex-1 overflow-auto p-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Admin Control Center</h1>
                  <p className="text-xs text-secondary mt-0.5">Platform-wide domain monitoring, user access, and threat intelligence audit</p>
                </div>
              </div>

              <button
                onClick={() => { fetchStats(); fetchAllCompanies() }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border text-secondary hover:text-foreground rounded-lg transition-colors text-xs font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>

            {/* 4 Stat KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2.5 mb-2">
                  <Users className="w-4 h-4 text-primary" />
                  <h3 className="text-xs text-secondary font-medium">Total Registered Users</h3>
                </div>
                <p className="text-2xl font-bold text-foreground">{stats?.total_users || 0}</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2.5 mb-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <h3 className="text-xs text-secondary font-medium">Total Monitored Domains</h3>
                </div>
                <p className="text-2xl font-bold text-primary">{companies.length || stats?.total_companies || 0}</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2.5 mb-2">
                  <UserIcon className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs text-secondary font-medium">User-Monitored Domains</h3>
                </div>
                <p className="text-2xl font-bold text-purple-400">{userCount}</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2.5 mb-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs text-secondary font-medium">Global Portfolio Domains</h3>
                </div>
                <p className="text-2xl font-bold text-blue-400">{globalCount}</p>
              </div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/admin/users" className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-all shadow-sm group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">User Management</h3>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-secondary group-hover:text-primary transition-colors" />
                </div>
                <p className="text-xs text-secondary">Manage analysts, roles, password resets, and account statuses</p>
              </Link>

              <Link href="/companies" className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-all shadow-sm group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Company Threat Monitor</h3>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-secondary group-hover:text-primary transition-colors" />
                </div>
                <p className="text-xs text-secondary">Deep multi-engine telemetry, vulnerability assessments, and live scanning</p>
              </Link>

              <Link href="/admin/activity-logs" className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-all shadow-sm group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">User Activity Logs</h3>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-secondary group-hover:text-primary transition-colors" />
                </div>
                <p className="text-xs text-secondary">Real-time audit log of user logins, company additions, and actions</p>
              </Link>
            </div>

            {/* Platform-Wide Monitored Companies Table */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    Platform-Wide Monitored Domains ({companies.length})
                  </h2>
                  <p className="text-xs text-secondary mt-0.5">
                    All domains monitored across all users, with creator attribution and live vulnerability telemetry
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Scope filter */}
                  <div className="flex items-center gap-1 bg-background border border-border rounded-lg p-1">
                    <button
                      onClick={() => setFilterScope('all')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                        filterScope === 'all' ? 'bg-primary text-white' : 'text-secondary hover:text-foreground'
                      }`}
                    >
                      All ({companies.length})
                    </button>
                    <button
                      onClick={() => setFilterScope('global')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                        filterScope === 'global' ? 'bg-primary text-white' : 'text-secondary hover:text-foreground'
                      }`}
                    >
                      Global ({globalCount})
                    </button>
                    <button
                      onClick={() => setFilterScope('users')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                        filterScope === 'users' ? 'bg-primary text-white' : 'text-secondary hover:text-foreground'
                      }`}
                    >
                      User Added ({userCount})
                    </button>
                  </div>

                  {/* Search box */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary" />
                    <input
                      type="text"
                      placeholder="Search company or user..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              {companiesLoading ? (
                <div className="py-12 text-center text-secondary text-xs flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  Loading platform domains...
                </div>
              ) : filteredCompanies.length === 0 ? (
                <div className="py-12 text-center text-secondary bg-background rounded-xl border border-border">
                  <Building2 className="w-8 h-8 mx-auto mb-2 text-secondary/40" />
                  <p className="text-sm font-semibold text-foreground">No monitored domains found</p>
                  <p className="text-xs text-secondary mt-1">Companies added by any user will appear here with creator attribution.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border text-secondary font-semibold">
                        <th className="py-3 px-4">Domain & Company</th>
                        <th className="py-3 px-4">Visibility Scope</th>
                        <th className="py-3 px-4">Added / Monitored By</th>
                        <th className="py-3 px-4">Security Score</th>
                        <th className="py-3 px-4">Vulnerabilities</th>
                        <th className="py-3 px-4">ISP / Network</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredCompanies.map((comp) => {
                        const assessment = comp.latest_risk_assessment
                        const score = assessment?.security_score ?? 85
                        const vulns = assessment?.vulnerabilities_count ?? 0
                        const riskLevel = assessment?.risk_level ?? 'MONITORED'

                        return (
                          <tr key={comp.id} className="hover:bg-background/50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={comp.logo_url || `https://www.google.com/s2/favicons?domain=${comp.domain}&sz=64`}
                                  alt={comp.name}
                                  className="w-7 h-7 object-contain rounded-md border border-border bg-background p-0.5"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${comp.domain}&sz=64`
                                  }}
                                />
                                <div>
                                  <span className="font-bold text-foreground block">{comp.name}</span>
                                  <span className="text-[11px] text-secondary font-mono">{comp.domain}</span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              {comp.is_global ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                                  Global Portfolio
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                                  User Private
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              <div>
                                <span className="font-semibold text-foreground block">
                                  {comp.is_global ? 'System Admin' : comp.created_by_user_name || 'User'}
                                </span>
                                <span className="text-[10px] text-secondary">
                                  {comp.is_global ? 'admin@indigo.com' : comp.created_by_user_email || 'user'}
                                </span>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className={`font-mono font-bold ${
                                  score >= 85 ? 'text-emerald-400' : score >= 70 ? 'text-amber-400' : 'text-red-400'
                                }`}>
                                  {score}/100
                                </span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${getRiskBadge(riskLevel)}`}>
                                  {riskLevel}
                                </span>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <span className="font-semibold text-foreground">{vulns} CVEs</span>
                            </td>

                            <td className="py-3 px-4 text-secondary truncate max-w-[150px]">
                              {assessment?.isp || 'Global Network'}
                            </td>

                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => router.push(`/companies/${comp.id}`)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md hover:bg-primary/20 transition-colors text-xs font-semibold"
                              >
                                View Details
                                <ArrowUpRight className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
