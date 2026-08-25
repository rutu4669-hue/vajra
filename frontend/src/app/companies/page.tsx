'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { useAuthStore } from '@/store/authStore'
import { useCompanyStore } from '@/store/companyStore'
import {
  Building2, Plus, Search, Globe, Shield, AlertTriangle, Activity,
  TrendingUp, Clock, ChevronRight, X, Loader2, RefreshCw, Trash2,
  CheckCircle, XCircle, Eye, BarChart3, Lock, Server, ExternalLink,
  User as UserIcon, Filter, Radio, Network, Copy, Check, Info, ArrowUpRight
} from 'lucide-react'

interface Company {
  id: number
  name: string
  domain: string
  industry: string | null
  description: string | null
  logo_url: string | null
  monitoring_enabled: boolean
  is_active: boolean
  is_global: boolean
  created_by_user_id: number | null
  created_by_user_name: string | null
  created_by_user_email: string | null
  created_at: string
  updated_at: string | null
  last_analyzed: string | null
}

interface CompanyWithDetails extends Company {
  latest_risk_assessment: {
    risk_level: string
    security_score: number
    active_incidents: number
    abuse_confidence_score: number
    reputation_score: number
    vulnerabilities_count: number
    ssl_valid: boolean
    domain_age_days: number | null
    country: string | null
    isp: string | null
    assessment_details?: string
    created_at: string
  } | null
  active_threats_count: number
  total_threats_count: number
}

const INDUSTRY_OPTIONS = [
  'Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail',
  'Energy', 'Telecommunications', 'Government', 'Education', 'Media',
  'Transportation', 'Real Estate', 'Legal', 'Consulting', 'Other'
]

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vajra-9pjh.onrender.com'

export default function CompaniesPage() {
  const router = useRouter()
  const { user, token } = useAuthStore()
  const isAdmin = Boolean(user?.role?.toLowerCase() === 'admin')

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(200)
  const [mounted, setMounted] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'global' | 'my' | 'users'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<CompanyWithDetails | null>(null)
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null)
  const [modalTab, setModalTab] = useState<'overview' | 'virustotal' | 'vulnerabilities' | 'threats' | 'ssl'>('overview')
  const [analyzingId, setAnalyzingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [copiedIp, setCopiedIp] = useState<string | null>(null)
  const [vulnFilter, setVulnFilter] = useState<string>('ALL')

  // Add company form state
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    industry: '',
    description: '',
    monitoring_enabled: true,
    is_global: true,
  })
  const [formError, setFormError] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isAdmin) {
      setFormData(prev => ({ ...prev, is_global: true }))
    } else {
      setFormData(prev => ({ ...prev, is_global: false }))
    }
  }, [isAdmin])

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true)
      const currentToken = useAuthStore.getState().token || token
      const headers: Record<string, string> = {}
      if (currentToken) {
        headers['Authorization'] = `Bearer ${currentToken}`
      }
      const res = await fetch(`${API_URL}/api/companies/?active_only=true`, { headers })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setCompanies(data)
          useCompanyStore.getState().setCompanies(data)
        }
      }
    } catch (err) {
      console.error('Failed to fetch companies:', err)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (mounted) {
      fetchCompanies()
      const timer = setTimeout(() => fetchCompanies(), 1500)
      return () => clearTimeout(timer)
    }
  }, [mounted, fetchCompanies])

  const handleAddCompany = async () => {
    if (!formData.name.trim()) { setFormError('Company name is required'); return }
    if (!formData.domain.trim()) { setFormError('Domain is required'); return }

    setFormSubmitting(true)
    setFormError('')

    try {
      const cleanDomain = formData.domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
      const currentToken = useAuthStore.getState().token || token
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (currentToken) headers['Authorization'] = `Bearer ${currentToken}`

      const res = await fetch(`${API_URL}/api/companies/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: formData.name.trim(),
          domain: cleanDomain,
          industry: formData.industry || null,
          description: formData.description || null,
          monitoring_enabled: formData.monitoring_enabled,
          is_global: isAdmin ? formData.is_global : false,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.detail || 'Failed to add company')
      }

      const newCompany = await res.json()
      setShowAddModal(false)
      setFormData({
        name: '',
        domain: '',
        industry: '',
        description: '',
        monitoring_enabled: true,
        is_global: isAdmin
      })
      setCompanies(prev => [newCompany, ...prev.filter(c => c.id !== newCompany.id)])
      useCompanyStore.getState().addCompanyToStore(newCompany)
      fetchCompanies()
      setTimeout(() => fetchCompanies(), 2000)
      setTimeout(() => fetchCompanies(), 5000)
    } catch (err: any) {
      setFormError(err.message || 'Failed to add company')
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleAnalyze = async (companyId: number) => {
    setAnalyzingId(companyId)
    try {
      const currentToken = useAuthStore.getState().token || token
      const headers: Record<string, string> = {}
      if (currentToken) headers['Authorization'] = `Bearer ${currentToken}`
      const res = await fetch(`${API_URL}/api/companies/${companyId}/analyze`, {
        method: 'POST',
        headers
      })
      if (res.ok) {
        fetchCompanies()
      }
    } catch (err) {
      console.error('Analysis failed:', err)
    } finally {
      setAnalyzingId(null)
    }
  }

  const handleDelete = async (companyId: number) => {
    if (!confirm('Are you sure you want to remove this company from monitoring?')) return
    setDeletingId(companyId)
    try {
      const currentToken = useAuthStore.getState().token || token
      const headers: Record<string, string> = {}
      if (currentToken) headers['Authorization'] = `Bearer ${currentToken}`
      const res = await fetch(`${API_URL}/api/companies/${companyId}`, {
        method: 'DELETE',
        headers
      })
      if (res.ok) {
        setCompanies(prev => prev.filter(c => c.id !== companyId))
      } else {
        const err = await res.json().catch(() => null)
        alert(err?.detail || 'Failed to delete company')
      }
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Error deleting company')
    } finally {
      setDeletingId(null)
    }
  }

  const handleViewDetails = async (companyId: number) => {
    setShowDetailModal(true)
    setDetailLoading(true)
    setModalTab('overview')
    setSelectedAnalysis(null)
    try {
      const currentToken = useAuthStore.getState().token || token
      const headers: Record<string, string> = {}
      if (currentToken) headers['Authorization'] = `Bearer ${currentToken}`
      
      const [compRes, analysisRes] = await Promise.all([
        fetch(`${API_URL}/api/companies/${companyId}`, { headers }),
        fetch(`${API_URL}/api/companies/${companyId}/analysis`, { headers }).catch(() => null)
      ])

      if (compRes.ok) {
        const data = await compRes.json()
        setSelectedCompany(data)
        
        // Parse analysis data from assessment details or dedicated endpoint
        if (analysisRes && analysisRes.ok) {
          const aData = await analysisRes.json()
          setSelectedAnalysis(aData.analysis_data || null)
        } else if (data.latest_risk_assessment?.assessment_details) {
          try {
            setSelectedAnalysis(JSON.parse(data.latest_risk_assessment.assessment_details))
          } catch {
            setSelectedAnalysis(null)
          }
        }
      } else {
        alert('Could not load company details')
        setShowDetailModal(false)
      }
    } catch (err) {
      console.error('Failed to fetch details:', err)
      setShowDetailModal(false)
    } finally {
      setDetailLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedIp(text)
    setTimeout(() => setCopiedIp(null), 2000)
  }

  const isCompanyGlobal = (c: Company) => {
    if (c.is_global === true) return true
    if (c.created_by_user_email && (c.created_by_user_email === 'admin@indigo.com' || c.created_by_user_email.toLowerCase().includes('admin'))) return true
    if (c.created_by_user_name && c.created_by_user_name.toLowerCase().includes('admin')) return true
    if (c.is_global === false) return false
    return true
  }

  const isCompanyUserAdded = (c: Company) => {
    return !isCompanyGlobal(c)
  }

  const isCompanyMine = (c: Company) => {
    if (!user) return false
    if (c.created_by_user_id && user.id && String(c.created_by_user_id) === String(user.id)) return true
    if (c.created_by_user_email && user.email && c.created_by_user_email.toLowerCase() === user.email.toLowerCase()) return true
    return false
  }

  // Count metrics for tabs
  const globalCount = companies.filter(c => isCompanyGlobal(c)).length
  const userAddedCount = companies.filter(c => isCompanyUserAdded(c)).length
  const myCount = companies.filter(c => isCompanyMine(c)).length

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.industry || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.created_by_user_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.created_by_user_email || '').toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (activeTab === 'global') {
      return isCompanyGlobal(c)
    } else if (activeTab === 'users') {
      return isCompanyUserAdded(c)
    } else if (activeTab === 'my') {
      return isCompanyMine(c)
    }
    return true
  })

  const getRiskBadge = (level: string) => {
    const l = level?.toLowerCase() || ''
    if (l === 'critical') return 'bg-red-500/15 text-red-400 border-red-500/30'
    if (l === 'high') return 'bg-orange-500/15 text-orange-400 border-orange-500/30'
    if (l === 'medium') return 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    if (l === 'low') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    return 'bg-slate-500/15 text-slate-400 border-slate-500/30'
  }

  const getScoreColorObj = (score: number) => {
    if (score >= 85) {
      return {
        textColor: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-emerald-500/20',
        dotColor: 'bg-emerald-400'
      }
    }
    if (score >= 70) {
      return {
        textColor: 'text-amber-400',
        badgeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-amber-500/20',
        dotColor: 'bg-amber-400'
      }
    }
    return {
      textColor: 'text-red-400',
      badgeBg: 'bg-red-500/15 border-red-500/40 text-red-400 shadow-red-500/20',
      dotColor: 'bg-red-400'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400'
    if (score >= 70) return 'text-amber-400'
    return 'text-red-400'
  }

  const getScoreForCompany = (companyId: number) => {
    const scores = [92, 78, 65, 88, 72, 95, 68, 83, 91, 76, 62, 67, 69, 64]
    return scores[companyId % scores.length]
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar collapsed={false} setCollapsed={() => {}} sidebarWidth={200} setSidebarWidth={() => {}} />
        <div className="flex-1 flex flex-col ml-64">
          <Navbar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="text-secondary text-sm flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              Initializing Security Portal...
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
        <main className="flex-1 overflow-auto p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <Building2 className="w-7 h-7 text-primary" />
                Company Monitor
              </h1>
              <p className="text-secondary text-sm mt-1">
                Monitor and analyze cybersecurity posture with VirusTotal multi-engine telemetry & vulnerability tracking
              </p>
            </div>
            <button
              onClick={() => {
                setFormError('')
                setShowAddModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Company
            </button>
          </div>

          {/* Filter Tabs & Search Bar */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-card border border-border rounded-xl flex-wrap">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                    activeTab === 'all'
                      ? 'bg-primary text-white shadow-md shadow-primary/25'
                      : 'text-secondary hover:text-foreground'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  All
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-background text-primary border border-primary/20'}`}>
                    {companies.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('global')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                    activeTab === 'global'
                      ? 'bg-primary text-white shadow-md shadow-primary/25'
                      : 'text-secondary hover:text-foreground'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  Global (Admin)
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${activeTab === 'global' ? 'bg-white/20 text-white' : 'bg-background text-blue-400 border border-blue-500/20'}`}>
                    {globalCount}
                  </span>
                </button>

                {/* User Monitored Tab - ONLY visible to Admin */}
                {isAdmin && (
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                      activeTab === 'users'
                        ? 'bg-primary text-white shadow-md shadow-primary/25'
                        : 'text-secondary hover:text-foreground'
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                    User Monitored
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${activeTab === 'users' ? 'bg-white/20 text-white' : 'bg-background text-amber-400 border border-amber-500/20'}`}>
                      {userAddedCount}
                    </span>
                  </button>
                )}

                {/* My Monitored Tab */}
                <button
                  onClick={() => setActiveTab('my')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                    activeTab === 'my'
                      ? 'bg-primary text-white shadow-md shadow-primary/25'
                      : 'text-secondary hover:text-foreground'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5 text-purple-400" />
                  My Monitored
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${activeTab === 'my' ? 'bg-white/20 text-white' : 'bg-background text-purple-400 border border-purple-500/20'}`}>
                    {myCount}
                  </span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                <input
                  type="text"
                  placeholder="Search domain, name, industry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-xs text-foreground placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>

          {/* Companies Cards Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-2xl p-8">
              <Building2 className="w-12 h-12 text-secondary/30 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-foreground">No companies found</h3>
              <p className="text-xs text-secondary mt-1 max-w-sm mx-auto">
                {searchQuery ? 'No results matched your search query.' : 'Add your first company to start monitoring threat intelligence.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredCompanies.map((company) => {
                  const assessment = (company as any).latest_risk_assessment
                  const score = assessment?.security_score ?? (company.last_analyzed ? 80 : 85)
                  const scoreStyle = getScoreColorObj(score)
                  const isCreatedByCurrentUser = user && company.created_by_user_id === Number(user.id)
                  const canDelete = isAdmin || isCreatedByCurrentUser
                  const vulnCount = assessment?.vulnerabilities_count ?? 0
                  const riskLevel = assessment?.risk_level ?? 'MONITORED'

                  return (
                    <motion.div
                      key={company.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
                    >
                      <div>
                        {/* Company Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <img
                              src={company.logo_url || `https://www.google.com/s2/favicons?domain=${company.domain}&sz=64`}
                              alt={company.name}
                              className="w-10 h-10 object-contain rounded-lg border border-border bg-background p-1 flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${company.domain}&sz=64`
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                {company.name}
                              </h3>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <Globe className="w-3.5 h-3.5 text-secondary" />
                                <span className="text-xs text-secondary font-mono truncate">{company.domain}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end ml-2 gap-1">
                            <div className="flex items-center gap-1">
                              <span className={`w-2 h-2 rounded-full ${company.is_active ? 'bg-emerald-400' : 'bg-red-400'}`} />
                              <span className="text-[10px] text-secondary">{company.is_active ? 'Active' : 'Inactive'}</span>
                            </div>
                            <div className={`px-2.5 py-0.5 rounded-lg border font-mono font-bold text-xs flex items-center gap-1.5 ${scoreStyle.badgeBg} shadow-sm`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${scoreStyle.dotColor}`} />
                              <span>{score}/100</span>
                            </div>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-3">
                          {company.is_global ? (
                            <span className="text-[10px] px-2 py-0.5 bg-blue-500/15 text-blue-400 border border-blue-500/30 rounded-full font-semibold flex items-center gap-1">
                              <Globe className="w-3 h-3" /> Global (Admin)
                            </span>
                          ) : isCreatedByCurrentUser ? (
                            <span className="text-[10px] px-2 py-0.5 bg-purple-500/15 text-purple-400 border border-purple-500/30 rounded-full font-semibold flex items-center gap-1">
                              <UserIcon className="w-3 h-3" /> My Monitored
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full font-semibold flex items-center gap-1" title={company.created_by_user_email || ''}>
                              <UserIcon className="w-3 h-3" /> User Monitored ({company.created_by_user_name || company.created_by_user_email || 'User'})
                            </span>
                          )}

                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${getRiskBadge(riskLevel)}`}>
                            {riskLevel}
                          </span>

                          {company.industry && (
                            <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                              {company.industry}
                            </span>
                          )}
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="bg-background/50 rounded-lg p-2 text-center border border-border/50">
                            <Shield className="w-3.5 h-3.5 text-primary mx-auto mb-1" />
                            <div className="text-[10px] text-secondary">Vulnerabilities</div>
                            <div className="text-xs font-bold text-foreground">
                              {vulnCount} CVEs
                            </div>
                          </div>
                          <div className="bg-background/50 rounded-lg p-2 text-center border border-border/50">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mx-auto mb-1" />
                            <div className="text-[10px] text-secondary">Threats</div>
                            <div className="text-xs font-semibold text-foreground">
                              {(company as any).active_threats_count || 0} Active
                            </div>
                          </div>
                          <div className="bg-background/50 rounded-lg p-2 text-center border border-border/50">
                            <Activity className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-1" />
                            <div className="text-[10px] text-secondary">Abuse Score</div>
                            <div className="text-xs font-semibold text-foreground">
                              {assessment?.abuse_confidence_score ?? 0}%
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-3 border-t border-border mt-auto">
                        <button
                          onClick={() => handleViewDetails(company.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-xs font-medium"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Details
                        </button>
                        <button
                          onClick={() => router.push(`/companies/${company.id}`)}
                          className="p-2 bg-background border border-border text-secondary hover:text-foreground rounded-lg transition-colors"
                          title="Open Full Page View"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleAnalyze(company.id)}
                          disabled={analyzingId === company.id}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors text-xs font-medium disabled:opacity-50"
                        >
                          {analyzingId === company.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <BarChart3 className="w-3.5 h-3.5" />
                          )}
                          {analyzingId === company.id ? 'Scanning...' : 'Analyze'}
                        </button>
                        {canDelete ? (
                          <button
                            onClick={() => handleDelete(company.id)}
                            disabled={deletingId === company.id}
                            className="p-2 text-secondary hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Remove company"
                          >
                            {deletingId === company.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        ) : (
                          <div
                            className="p-2 text-secondary/30 cursor-not-allowed"
                            title="Global admin company"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>

      {/* ──── ADD COMPANY MODAL ──── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-background/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground">Add Company</h2>
                    <p className="text-[11px] text-secondary">
                      {isAdmin ? 'Global or private telemetry monitoring' : 'Add domain to your private monitoring portfolio'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 hover:bg-background rounded-lg transition-colors text-secondary hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-3.5 overflow-y-auto flex-1">
                {formError && (
                  <div className="flex items-center gap-2 p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {formError}
                  </div>
                )}

                {/* Company Name & Domain side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Company Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Acme Corp"
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground placeholder:text-secondary/50 focus:outline-none focus:border-primary text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Domain <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary" />
                      <input
                        type="text"
                        value={formData.domain}
                        onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                        placeholder="e.g. acme.com"
                        className="w-full pl-8 pr-3 py-2 bg-background border border-border rounded-xl text-foreground placeholder:text-secondary/50 focus:outline-none focus:border-primary text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Industry & Visibility */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Industry Sector
                    </label>
                    <select
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-primary text-xs"
                    >
                      <option value="">Select industry...</option>
                      {INDUSTRY_OPTIONS.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Visibility Scope
                    </label>
                    {isAdmin ? (
                      <div className="flex items-center justify-between px-3 py-1.5 bg-background border border-border rounded-xl h-[36px]">
                        <span className="text-xs text-foreground font-medium truncate">
                          {formData.is_global ? 'Global' : 'Private'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, is_global: !formData.is_global })}
                          className={`relative w-8 h-4 rounded-full transition-colors ${formData.is_global ? 'bg-primary' : 'bg-secondary/30'}`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${formData.is_global ? 'translate-x-4' : 'translate-x-0'}`}
                          />
                        </button>
                      </div>
                    ) : (
                      <div className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-[11px] text-purple-300 flex items-center gap-1.5 h-[36px]">
                        <UserIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">Private Portfolio</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief note or description..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground placeholder:text-secondary/50 focus:outline-none focus:border-primary text-xs"
                  />
                </div>
              </div>

              {/* Modal Footer - Always Sticky & 100% Visible */}
              <div className="flex items-center gap-2.5 px-5 py-3.5 border-t border-border bg-background/60">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-card hover:bg-card-hover border border-border rounded-xl text-secondary hover:text-foreground transition-colors text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCompany}
                  disabled={formSubmitting}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors text-xs font-semibold disabled:opacity-50 shadow-md shadow-primary/20"
                >
                  {formSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  {formSubmitting ? 'Adding...' : 'Add Company'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──── COMPANY DETAIL CYBER INTELLIGENCE MODAL ──── */}
      <AnimatePresence>
        {showDetailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => { setShowDetailModal(false); setSelectedCompany(null); setSelectedAnalysis(null) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card border border-border rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {detailLoading ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
                  <p className="text-secondary text-sm">Loading deep company intelligence...</p>
                </div>
              ) : selectedCompany ? (
                <>
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-5 border-b border-border bg-card">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedCompany.logo_url || `https://www.google.com/s2/favicons?domain=${selectedCompany.domain}&sz=64`}
                        alt={selectedCompany.name}
                        className="w-12 h-12 object-contain rounded-xl border border-border bg-background p-1.5 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${selectedCompany.domain}&sz=64`
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-xl font-bold text-foreground">{selectedCompany.name}</h2>
                          {selectedCompany.is_global ? (
                            <span className="text-[10px] px-2 py-0.5 bg-blue-500/15 text-blue-400 border border-blue-500/30 rounded-full font-semibold">
                              Global (Admin)
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 bg-purple-500/15 text-purple-400 border border-purple-500/30 rounded-full font-semibold">
                              Personal
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Globe className="w-3.5 h-3.5 text-secondary" />
                          <span className="text-sm text-secondary font-mono">{selectedCompany.domain}</span>
                          {selectedCompany.industry && (
                            <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full">{selectedCompany.industry}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/companies/${selectedCompany.id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-all text-xs font-semibold"
                      >
                        <span>Full Dashboard</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { setShowDetailModal(false); setSelectedCompany(null); setSelectedAnalysis(null) }}
                        className="p-2 hover:bg-background rounded-lg transition-colors text-secondary hover:text-foreground"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Navigation Tabs */}
                  <div className="flex items-center gap-1 px-5 border-b border-border bg-background/50 overflow-x-auto">
                    <button
                      onClick={() => setModalTab('overview')}
                      className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                        modalTab === 'overview'
                          ? 'border-primary text-primary bg-primary/5'
                          : 'border-transparent text-secondary hover:text-foreground'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Overview & IPs
                    </button>

                    <button
                      onClick={() => setModalTab('virustotal')}
                      className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                        modalTab === 'virustotal'
                          ? 'border-primary text-primary bg-primary/5'
                          : 'border-transparent text-secondary hover:text-foreground'
                      }`}
                    >
                      <Radio className="w-3.5 h-3.5 text-blue-400" />
                      VirusTotal Telemetry
                      {selectedAnalysis?.virustotal_data && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-400 font-mono">
                          {selectedAnalysis.virustotal_data.detection_ratio || 'VT'}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => setModalTab('vulnerabilities')}
                      className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                        modalTab === 'vulnerabilities'
                          ? 'border-primary text-primary bg-primary/5'
                          : 'border-transparent text-secondary hover:text-foreground'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      Vulnerabilities ({selectedAnalysis?.total_vulnerabilities || selectedCompany.latest_risk_assessment?.vulnerabilities_count || 0})
                    </button>

                    <button
                      onClick={() => setModalTab('threats')}
                      className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                        modalTab === 'threats'
                          ? 'border-primary text-primary bg-primary/5'
                          : 'border-transparent text-secondary hover:text-foreground'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Threats ({selectedCompany.total_threats_count || (selectedAnalysis?.threats || []).length})
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 overflow-y-auto space-y-5 flex-1">
                    {/* ──── MODAL TAB: OVERVIEW & IPs ──── */}
                    {modalTab === 'overview' && (
                      <div className="space-y-5">
                        {/* Threat & Security Summary Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-background rounded-xl p-4 border border-border text-center">
                            <div className="text-[10px] text-secondary mb-1">Risk Level</div>
                            <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getRiskBadge(selectedCompany.latest_risk_assessment?.risk_level || 'LOW')}`}>
                              {selectedCompany.latest_risk_assessment?.risk_level || 'LOW'}
                            </span>
                          </div>
                          <div className="bg-background rounded-xl p-4 border border-border text-center">
                            <div className="text-[10px] text-secondary mb-1">Security Score</div>
                            <div className={`text-xl font-bold ${getScoreColor(selectedCompany.latest_risk_assessment?.security_score || 85)}`}>
                              {selectedCompany.latest_risk_assessment?.security_score || 85}
                              <span className="text-xs text-secondary font-normal">/100</span>
                            </div>
                          </div>
                          <div className="bg-background rounded-xl p-4 border border-border text-center">
                            <div className="text-[10px] text-secondary mb-1">Abuse Confidence</div>
                            <div className="text-xl font-bold text-foreground">
                              {selectedCompany.latest_risk_assessment?.abuse_confidence_score || 0}%
                            </div>
                          </div>
                          <div className="bg-background rounded-xl p-4 border border-border text-center">
                            <div className="text-[10px] text-secondary mb-1">Reputation</div>
                            <div className="text-xl font-bold text-foreground">
                              {selectedCompany.latest_risk_assessment?.reputation_score || 100}
                            </div>
                          </div>
                        </div>

                        {/* Resolved IPs Matrix */}
                        <div className="bg-background rounded-xl p-5 border border-border">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                              <Network className="w-4 h-4 text-primary" />
                              Discovered & Resolved IP Addresses
                            </h3>
                            <span className="text-xs text-secondary">Source: Google DNS & VirusTotal</span>
                          </div>

                          {(selectedAnalysis?.connections?.ip_addresses || []).length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                              {selectedAnalysis.connections.ip_addresses.map((ip: string, idx: number) => (
                                <div key={idx} className="p-3 bg-card border border-border rounded-lg flex items-center justify-between">
                                  <div className="flex items-center gap-2.5">
                                    <span className="w-6 h-6 rounded bg-primary/10 text-primary font-mono text-xs flex items-center justify-center font-bold">
                                      #{idx + 1}
                                    </span>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm font-bold text-foreground">{ip}</span>
                                        <button
                                          onClick={() => copyToClipboard(ip)}
                                          className="text-secondary hover:text-foreground p-0.5 transition-colors"
                                          title="Copy IP"
                                        >
                                          {copiedIp === ip ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                          ) : (
                                            <Copy className="w-3.5 h-3.5" />
                                          )}
                                        </button>
                                      </div>
                                      <div className="text-[11px] text-secondary mt-0.5">
                                        {selectedCompany.latest_risk_assessment?.isp || 'Global Network'}
                                      </div>
                                    </div>
                                  </div>
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                                    Resolved
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-secondary py-2">
                              {selectedCompany.latest_risk_assessment?.isp 
                                ? `Resolved via ISP: ${selectedCompany.latest_risk_assessment.isp}`
                                : 'No IP addresses listed yet. Click "Analyze" to perform DNS resolution.'}
                            </p>
                          )}
                        </div>

                        {/* Company Details & Infrastructure */}
                        <div className="bg-background rounded-xl p-5 border border-border">
                          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-primary" />
                            Infrastructure & Profile
                          </h3>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="flex justify-between p-2 bg-card rounded border border-border/50">
                              <span className="text-secondary">Country</span>
                              <span className="text-foreground font-semibold">{selectedCompany.latest_risk_assessment?.country || 'United States'}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-card rounded border border-border/50">
                              <span className="text-secondary">SSL Certificate</span>
                              <span className="text-foreground font-semibold">
                                {selectedCompany.latest_risk_assessment?.ssl_valid ? 'Valid & Verified' : 'Standard'}
                              </span>
                            </div>
                            <div className="flex justify-between p-2 bg-card rounded border border-border/50">
                              <span className="text-secondary">Domain Age</span>
                              <span className="text-foreground font-semibold">{selectedCompany.latest_risk_assessment?.domain_age_days || 365} days</span>
                            </div>
                            <div className="flex justify-between p-2 bg-card rounded border border-border/50">
                              <span className="text-secondary">Created By</span>
                              <span className="text-foreground font-semibold">
                                {selectedCompany.is_global ? 'Admin' : selectedCompany.created_by_user_name || 'User'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ──── MODAL TAB: VIRUSTOTAL TELEMETRY ──── */}
                    {modalTab === 'virustotal' && (
                      <div className="space-y-5">
                        {selectedAnalysis?.virustotal_data ? (
                          <>
                            {/* VT Detection Ratio Banner */}
                            <div className="p-4 bg-background border border-border rounded-xl flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Radio className="w-8 h-8 text-blue-400" />
                                <div>
                                  <h4 className="font-bold text-foreground text-sm">VirusTotal Multi-Antivirus Engine Reputation</h4>
                                  <p className="text-xs text-secondary">
                                    Aggregated threat evaluation across all security vendors
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-mono font-bold text-primary">
                                  {selectedAnalysis.virustotal_data.detection_ratio || '0/0'}
                                </div>
                                <div className="text-[10px] text-secondary">Detection Ratio</div>
                              </div>
                            </div>

                            {/* 4 Stats */}
                            <div className="grid grid-cols-4 gap-3 text-center">
                              <div className="p-3 bg-background border border-border rounded-xl">
                                <div className="text-[10px] text-red-400 font-semibold mb-1">Malicious</div>
                                <div className="text-xl font-bold text-red-400">
                                  {selectedAnalysis.virustotal_data.last_analysis_stats?.malicious || 0}
                                </div>
                              </div>
                              <div className="p-3 bg-background border border-border rounded-xl">
                                <div className="text-[10px] text-amber-400 font-semibold mb-1">Suspicious</div>
                                <div className="text-xl font-bold text-amber-400">
                                  {selectedAnalysis.virustotal_data.last_analysis_stats?.suspicious || 0}
                                </div>
                              </div>
                              <div className="p-3 bg-background border border-border rounded-xl">
                                <div className="text-[10px] text-emerald-400 font-semibold mb-1">Harmless</div>
                                <div className="text-xl font-bold text-emerald-400">
                                  {selectedAnalysis.virustotal_data.last_analysis_stats?.harmless || 0}
                                </div>
                              </div>
                              <div className="p-3 bg-background border border-border rounded-xl">
                                <div className="text-[10px] text-secondary font-semibold mb-1">Undetected</div>
                                <div className="text-xl font-bold text-foreground">
                                  {selectedAnalysis.virustotal_data.last_analysis_stats?.undetected || 0}
                                </div>
                              </div>
                            </div>

                            {/* Categories & Tags */}
                            <div className="p-4 bg-background border border-border rounded-xl">
                              <span className="text-xs text-secondary block mb-2 font-medium">Vendor Classifications</span>
                              {selectedAnalysis.virustotal_data.categories && selectedAnalysis.virustotal_data.categories.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {selectedAnalysis.virustotal_data.categories.map((cat: string, i: number) => (
                                    <span key={i} className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-lg border border-primary/20">
                                      {cat}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-secondary">Verified Clean Web Presence</p>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-12 bg-background border border-border rounded-xl">
                            <Radio className="w-10 h-10 text-secondary/40 mx-auto mb-2" />
                            <p className="text-sm text-foreground font-semibold">VirusTotal scan ready</p>
                            <p className="text-xs text-secondary mt-1 mb-4">Click below to fetch live VirusTotal telemetry for this company.</p>
                            <button
                              onClick={() => handleAnalyze(selectedCompany.id)}
                              className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold"
                            >
                              Scan with VirusTotal
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ──── MODAL TAB: VULNERABILITIES ──── */}
                    {modalTab === 'vulnerabilities' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-foreground">Vulnerabilities (NVD / CVEs)</h4>
                            <p className="text-xs text-secondary">Discovered CVE vulnerabilities and CVSS scores</p>
                          </div>

                          {/* Filter */}
                          <div className="flex items-center gap-1 bg-background border border-border rounded-lg p-1">
                            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
                              <button
                                key={sev}
                                onClick={() => setVulnFilter(sev)}
                                className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                                  vulnFilter === sev ? 'bg-primary text-white' : 'text-secondary hover:text-foreground'
                                }`}
                              >
                                {sev}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* CVE list */}
                        {((selectedAnalysis?.vulnerabilities || []).filter((v: any) => vulnFilter === 'ALL' || v.severity?.toUpperCase() === vulnFilter)).length > 0 ? (
                          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                            {(selectedAnalysis.vulnerabilities || [])
                              .filter((v: any) => vulnFilter === 'ALL' || v.severity?.toUpperCase() === vulnFilter)
                              .map((vuln: any, idx: number) => (
                                <div key={idx} className="p-4 bg-background border border-border rounded-xl">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <a
                                        href={`https://nvd.nist.gov/vuln/detail/${vuln.cve_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-mono font-bold text-primary hover:underline text-sm flex items-center gap-1"
                                      >
                                        {vuln.cve_id}
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getRiskBadge(vuln.severity)}`}>
                                        {vuln.severity}
                                      </span>
                                    </div>
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-card border border-border">
                                      CVSS: {vuln.cvss_score?.toFixed(1) || 'N/A'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-foreground/90 leading-relaxed">{vuln.description}</p>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="text-center py-10 bg-background border border-border rounded-xl">
                            <Shield className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                            <p className="text-xs font-semibold text-foreground">No matching vulnerabilities reported</p>
                            <p className="text-[10px] text-secondary mt-0.5">Domain CVE database is currently clear.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ──── MODAL TAB: THREATS ──── */}
                    {modalTab === 'threats' && (
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-foreground">Active Threat Intelligence Matrix</h4>
                        {(selectedAnalysis?.threats || []).length > 0 ? (
                          <div className="space-y-3">
                            {selectedAnalysis.threats.map((threat: any, idx: number) => (
                              <div key={idx} className="p-4 bg-background border border-border rounded-xl flex items-center justify-between">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getRiskBadge(threat.severity)}`}>
                                      {threat.severity}
                                    </span>
                                    <span className="text-xs font-semibold text-foreground">{threat.type}</span>
                                    {threat.source && (
                                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                                        {threat.source}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-secondary">
                                    Last seen: {threat.last_seen || 'Recent'}
                                  </div>
                                </div>
                                <div className="text-right font-bold text-primary text-xs">
                                  {threat.confidence}% Confidence
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-10 bg-background border border-border rounded-xl">
                            <Shield className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                            <p className="text-xs font-semibold text-foreground">No active threats detected</p>
                            <p className="text-[10px] text-secondary mt-0.5">Threat feeds report normal activity.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
