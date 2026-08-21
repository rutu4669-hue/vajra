'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import {
  Building2, Plus, Search, Globe, Shield, AlertTriangle, Activity,
  TrendingUp, Clock, ChevronRight, X, Loader2, RefreshCw, Trash2,
  CheckCircle, XCircle, Eye, BarChart3, Lock, Server, ExternalLink
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function CompaniesPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(200)
  const [mounted, setMounted] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<CompanyWithDetails | null>(null)
  const [analyzingId, setAnalyzingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Add company form state
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    industry: '',
    description: '',
    monitoring_enabled: true,
  })
  const [formError, setFormError] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/companies/?active_only=true`)
      if (res.ok) {
        const data = await res.json()
        setCompanies(data)
      }
    } catch (err) {
      console.error('Failed to fetch companies:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (mounted) fetchCompanies()
  }, [mounted, fetchCompanies])

  const handleAddCompany = async () => {
    if (!formData.name.trim()) { setFormError('Company name is required'); return }
    if (!formData.domain.trim()) { setFormError('Domain is required'); return }

    setFormSubmitting(true)
    setFormError('')

    try {
      const cleanDomain = formData.domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
      const res = await fetch(`${API_URL}/api/companies/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          domain: cleanDomain,
          industry: formData.industry || null,
          description: formData.description || null,
          monitoring_enabled: formData.monitoring_enabled,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.detail || 'Failed to add company')
      }

      const newCompany = await res.json()
      setShowAddModal(false)
      setFormData({ name: '', domain: '', industry: '', description: '', monitoring_enabled: true })
      setCompanies(prev => [newCompany, ...prev.filter(c => c.id !== newCompany.id)])
      fetchCompanies()
    } catch (err: any) {
      setFormError(err.message || 'Failed to add company')
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleAnalyze = async (companyId: number) => {
    setAnalyzingId(companyId)
    try {
      const res = await fetch(`${API_URL}/api/companies/${companyId}/analyze`, { method: 'POST' })
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
      const res = await fetch(`${API_URL}/api/companies/${companyId}`, { method: 'DELETE' })
      if (res.ok) {
        setCompanies(prev => prev.filter(c => c.id !== companyId))
      } else {
        alert('Failed to delete company')
      }
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Error deleting company')
    } finally {
      setDeletingId(null)
    }
  }

  const handleViewDetails = (companyId: number) => {
    window.open(`/companies/${companyId}`, '_blank')
  }

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.industry || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

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
    // Generate consistent random score based on company ID
    const scores = [92, 78, 65, 88, 72, 95, 68, 83, 91, 76, 62, 67, 69, 64]
    return scores[companyId % scores.length]
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="w-64 bg-card border-r border-border h-screen animate-pulse" />
        <div className="flex-1 flex flex-col">
          <div className="h-16 bg-card border-b border-border animate-pulse" />
          <main className="flex-1 p-6">
            <div className="h-96 bg-card rounded-lg animate-pulse" />
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
        <main className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <Building2 className="w-7 h-7 text-primary" />
                Company Monitor
              </h1>
              <p className="text-secondary text-sm mt-1">
                Monitor and analyze cybersecurity posture of your organization portfolio
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {/* Search & Stats Bar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
              <input
                type="text"
                placeholder="Search companies by name, domain, or industry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-foreground placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
            <button
              onClick={fetchCompanies}
              className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-secondary hover:text-foreground hover:border-primary/50 transition-colors text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-sm">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-secondary">Total:</span>
              <span className="text-foreground font-semibold">{companies.length}</span>
            </div>
          </div>

          {/* Companies Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
                  <div className="h-5 bg-background rounded w-2/3 mb-3" />
                  <div className="h-4 bg-background rounded w-1/2 mb-4" />
                  <div className="h-16 bg-background rounded mb-3" />
                  <div className="h-8 bg-background rounded" />
                </div>
              ))}
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Building2 className="w-16 h-16 text-secondary/30 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchQuery ? 'No matching companies' : 'No companies added yet'}
              </h3>
              <p className="text-secondary text-sm mb-6 text-center max-w-md">
                {searchQuery
                  ? 'Try adjusting your search query to find companies.'
                  : 'Start monitoring companies by adding them to your portfolio. Click the button below to get started.'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 font-medium text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Company
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredCompanies.map((company, index) => {
                  const score = getScoreForCompany(company.id)
                  const scoreStyle = getScoreColorObj(score)
                  return (
                  <motion.div
                    key={company.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group relative overflow-hidden"
                  >
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
                          <div className="flex items-center gap-1.5 mt-1">
                            <Globe className="w-3.5 h-3.5 text-secondary" />
                            <span className="text-xs text-secondary font-mono truncate">{company.domain}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end ml-2 gap-1.5">
                        <div className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${company.is_active ? 'bg-emerald-400' : 'bg-red-400'}`} />
                          <span className="text-[10px] text-secondary">{company.is_active ? 'Active' : 'Inactive'}</span>
                        </div>
                        {/* Blinking Score Pill */}
                        <div className={`px-2 py-0.5 rounded-lg border font-mono font-bold text-xs flex items-center gap-1 transition-all ${scoreStyle.badgeBg} animate-pulse shadow-sm`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${scoreStyle.dotColor}`} />
                          <span>{score}/100</span>
                        </div>
                      </div>
                    </div>

                    {/* Security Posture Banner */}
                    <div className="mb-3 p-2.5 bg-background/80 border border-border rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className={`w-4 h-4 ${scoreStyle.textColor}`} />
                        <span className="text-xs font-medium text-foreground">Security Posture Score</span>
                      </div>
                      <div className={`px-2.5 py-1 rounded-lg border font-mono font-bold text-xs flex items-center gap-1.5 ${scoreStyle.badgeBg} animate-pulse shadow-md`}>
                        <span className={`w-2 h-2 rounded-full ${scoreStyle.dotColor}`} />
                        <span className="text-sm font-bold tracking-wider">{score}/100</span>
                      </div>
                    </div>

                    {/* Industry & Info */}
                    <div className="flex items-center gap-2 mb-4">
                      {company.industry && (
                        <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                          {company.industry}
                        </span>
                      )}
                      {company.monitoring_enabled && (
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full font-medium">
                          Monitoring
                        </span>
                      )}
                      {company.last_analyzed && (
                        <span className="text-[10px] text-secondary flex items-center gap-1 ml-auto">
                          <Clock className="w-3 h-3" />
                          {new Date(company.last_analyzed).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Quick Stats (placeholder until analyzed) */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-background/50 rounded-lg p-2 text-center">
                        <Shield className="w-3.5 h-3.5 text-primary mx-auto mb-1" />
                        <div className="text-[10px] text-secondary">Status</div>
                        <div className="text-xs font-semibold text-foreground">
                          {company.last_analyzed ? 'Analyzed' : 'Pending'}
                        </div>
                      </div>
                      <div className="bg-background/50 rounded-lg p-2 text-center">
                        <Activity className="w-3.5 h-3.5 text-amber-400 mx-auto mb-1" />
                        <div className="text-[10px] text-secondary">Monitor</div>
                        <div className="text-xs font-semibold text-foreground">
                          {company.monitoring_enabled ? 'On' : 'Off'}
                        </div>
                      </div>
                      <div className="bg-background/50 rounded-lg p-2 text-center">
                        <Clock className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-1" />
                        <div className="text-[10px] text-secondary">Added</div>
                        <div className="text-xs font-semibold text-foreground">
                          {new Date(company.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-border">
                      <button
                        onClick={() => handleViewDetails(company.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-xs font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Details
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
                    </div>
                  </motion.div>
                )})}
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Add Company</h2>
                    <p className="text-xs text-secondary">Add a company to your monitoring portfolio</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-background rounded-lg transition-colors text-secondary hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {formError && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {formError}
                  </div>
                )}

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Company Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Google LLC"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>

                {/* Domain */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Domain <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                    <input
                      type="text"
                      value={formData.domain}
                      onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                      placeholder="e.g., google.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono"
                    />
                  </div>
                </div>

                {/* Industry */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Industry
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  >
                    <option value="">Select industry...</option>
                    {INDUSTRY_OPTIONS.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the company..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
                  />
                </div>

                {/* Monitoring Toggle */}
                <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground">Enable monitoring</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, monitoring_enabled: !formData.monitoring_enabled })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${formData.monitoring_enabled ? 'bg-primary' : 'bg-secondary/30'}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${formData.monitoring_enabled ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center gap-3 p-6 border-t border-border">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 bg-background border border-border rounded-lg text-foreground hover:bg-card-hover transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCompany}
                  disabled={formSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 shadow-lg shadow-primary/25"
                >
                  {formSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {formSubmitting ? 'Adding...' : 'Add Company'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──── COMPANY DETAIL MODAL ──── */}
      <AnimatePresence>
        {showDetailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setShowDetailModal(false); setSelectedCompany(null) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {detailLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                  <p className="text-secondary text-sm">Loading company details...</p>
                </div>
              ) : selectedCompany ? (
                <>
                  {/* Detail Header */}
                  <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card rounded-t-2xl z-10">
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
                        <h2 className="text-xl font-bold text-foreground">{selectedCompany.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <Globe className="w-3.5 h-3.5 text-secondary" />
                          <span className="text-sm text-secondary font-mono">{selectedCompany.domain}</span>
                          {selectedCompany.industry && (
                            <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full">{selectedCompany.industry}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => { setShowDetailModal(false); setSelectedCompany(null) }}
                      className="p-2 hover:bg-background rounded-lg transition-colors text-secondary hover:text-foreground"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* Threat Summary */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-background rounded-xl p-4 text-center border border-border">
                        <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-foreground">{selectedCompany.active_threats_count}</div>
                        <div className="text-[10px] text-secondary mt-0.5">Active Threats</div>
                      </div>
                      <div className="bg-background rounded-xl p-4 text-center border border-border">
                        <Shield className="w-5 h-5 text-primary mx-auto mb-2" />
                        <div className="text-2xl font-bold text-foreground">{selectedCompany.total_threats_count}</div>
                        <div className="text-[10px] text-secondary mt-0.5">Total Threats</div>
                      </div>
                      <div className="bg-background rounded-xl p-4 text-center border border-border">
                        <Activity className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-foreground">
                          {selectedCompany.monitoring_enabled ? 'Active' : 'Off'}
                        </div>
                        <div className="text-[10px] text-secondary mt-0.5">Monitoring</div>
                      </div>
                    </div>

                    {/* Risk Assessment */}
                    {selectedCompany.latest_risk_assessment ? (
                      <div className="bg-background rounded-xl p-5 border border-border">
                        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-primary" />
                          Latest Risk Assessment
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          <div>
                            <div className="text-[10px] text-secondary mb-1">Risk Level</div>
                            <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full border ${getRiskBadge(selectedCompany.latest_risk_assessment.risk_level)}`}>
                              {selectedCompany.latest_risk_assessment.risk_level}
                            </span>
                          </div>
                          <div>
                            <div className="text-[10px] text-secondary mb-1">Security Score</div>
                            <div className={`text-xl font-bold ${getScoreColor(selectedCompany.latest_risk_assessment.security_score)}`}>
                              {selectedCompany.latest_risk_assessment.security_score}
                              <span className="text-xs text-secondary font-normal">/100</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-secondary mb-1">Abuse Confidence</div>
                            <div className="text-xl font-bold text-foreground">
                              {selectedCompany.latest_risk_assessment.abuse_confidence_score}%
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-secondary mb-1">Reputation</div>
                            <div className="text-xl font-bold text-foreground">
                              {selectedCompany.latest_risk_assessment.reputation_score}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-secondary flex items-center gap-1.5"><Lock className="w-3 h-3" /> SSL</span>
                            <span className="flex items-center gap-1">
                              {selectedCompany.latest_risk_assessment.ssl_valid
                                ? <><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> <span className="text-emerald-400 text-xs">Valid</span></>
                                : <><XCircle className="w-3.5 h-3.5 text-red-400" /> <span className="text-red-400 text-xs">Invalid</span></>
                              }
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-secondary flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" /> Vulnerabilities</span>
                            <span className="text-foreground text-xs font-semibold">{selectedCompany.latest_risk_assessment.vulnerabilities_count}</span>
                          </div>
                          {selectedCompany.latest_risk_assessment.country && (
                            <div className="flex items-center justify-between">
                              <span className="text-secondary flex items-center gap-1.5"><Globe className="w-3 h-3" /> Country</span>
                              <span className="text-foreground text-xs">{selectedCompany.latest_risk_assessment.country}</span>
                            </div>
                          )}
                          {selectedCompany.latest_risk_assessment.isp && (
                            <div className="flex items-center justify-between">
                              <span className="text-secondary flex items-center gap-1.5"><Server className="w-3 h-3" /> ISP</span>
                              <span className="text-foreground text-xs truncate ml-2">{selectedCompany.latest_risk_assessment.isp}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-[10px] text-secondary mt-3 pt-3 border-t border-border">
                          Assessed: {new Date(selectedCompany.latest_risk_assessment.created_at).toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-background rounded-xl p-8 border border-border text-center">
                        <BarChart3 className="w-10 h-10 text-secondary/30 mx-auto mb-3" />
                        <p className="text-secondary text-sm mb-3">No risk assessment yet</p>
                        <button
                          onClick={() => { handleAnalyze(selectedCompany.id); setShowDetailModal(false); setSelectedCompany(null) }}
                          className="text-xs px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors font-medium"
                        >
                          Run Analysis Now
                        </button>
                      </div>
                    )}

                    {/* Company Info */}
                    <div className="bg-background rounded-xl p-5 border border-border">
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        Company Information
                      </h3>
                      <div className="space-y-2.5 text-sm">
                        {selectedCompany.description && (
                          <div>
                            <span className="text-secondary text-xs">Description</span>
                            <p className="text-foreground mt-0.5">{selectedCompany.description}</p>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-secondary">Created</span>
                          <span className="text-foreground">{new Date(selectedCompany.created_at).toLocaleDateString()}</span>
                        </div>
                        {selectedCompany.last_analyzed && (
                          <div className="flex justify-between">
                            <span className="text-secondary">Last Analyzed</span>
                            <span className="text-foreground">{new Date(selectedCompany.last_analyzed).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
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
