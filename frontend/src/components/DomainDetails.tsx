'use client'

import { useEffect, useState } from 'react'
import { 
  Shield, AlertTriangle, Globe, Server, Clock, FileText, 
  TrendingUp, Activity, CheckCircle, XCircle, Lock, ExternalLink,
  Copy, Check, Radio, Cpu, Network, Database, Layers
} from 'lucide-react'
import CertificateDetails from './CertificateDetails'

interface DomainData {
  target: string
  risk_level: string
  active_incidents: number
  security_score: number
  last_scanned: string
  threats: Array<{
    type: string
    severity: string
    first_seen: string
    last_seen: string
    confidence: number
    source?: string
  }>
  country: string
  isp: string
  abuse_confidence_score: number
  total_reports: number
  domain_age_days: number
  ssl_certificate: {
    valid: boolean
    issuer: string
    expires_days: number
  }
  dns_records: {
    a_records: number
    mx_records: number
    txt_records: number
  }
  reputation_score: number
  last_reported: string
  trust_score?: number
  domain_age?: string
  global_rank?: string
  location?: string
  is_malicious?: boolean
  threat_level?: string
  categories?: string[]
  ssl_info?: any
  dns_info?: any
  analysis?: {
    malware_detected?: boolean
    phishing_detected?: boolean
    suspicious_content?: boolean
    last_analysis?: string
    scan_engines?: any
    detection_ratio?: string
  }
  history?: {
    first_seen?: string
    last_seen?: string
    reputation_history?: any[]
    threat_history?: any[]
  }
  connections?: {
    related_domains?: string[]
    ip_addresses?: string[]
    asn_info?: any
    server_location?: any
  }
  security?: {
    ssl_certificate?: any
    dnssec?: boolean
    spf_record?: string
    dmarc_record?: string
    open_ports?: number[]
    security_headers?: any
  }
  vulnerabilities?: Array<{
    cve_id: string
    description: string
    cvss_score: number
    severity: string
    published_date: string
    modified_date: string
    references: string[]
  }>
  total_vulnerabilities?: number
  vulnerability_risk_score?: number
  high_critical_vulnerabilities?: number
  urlscan_data?: {
    total_scans: number
    malicious_scans: number
    suspicious_scans: number
    countries: string[]
    tags: string[]
  }
  abuseipdb_data?: {
    abuse_confidence_score: number
    total_reports: number
    last_reported_at: string
    country: string
  }
  virustotal_data?: {
    reputation: number
    last_analysis_stats: {
      malicious: number
      suspicious: number
      harmless: number
      undetected: number
      timeout?: number
    }
    detection_ratio?: string
    total_engines?: number
    flagged_engines?: Array<{
      engine_name: string
      category: string
      result: string
      method?: string
    }>
    categories?: string[]
    tags?: string[]
    resolved_ips?: string[]
    country?: string
    as_owner?: string
    network?: string
    popularity_ranks?: Record<string, any>
    total_votes?: {
      harmless: number
      malicious: number
    }
  }
  alienvault_data?: {
    pulse_count: number
    sections: string[]
    reputation: number
  }
}

interface DomainDetailsProps {
  domain: string
  companyId?: number
}

type TabType = 'overview' | 'virustotal' | 'vulnerabilities' | 'threats' | 'ssl' | 'dns'

export default function DomainDetails({ domain, companyId }: DomainDetailsProps) {
  const [domainData, setDomainData] = useState<DomainData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [vulnFilter, setVulnFilter] = useState<string>('ALL')
  const [visibleVulnCount, setVisibleVulnCount] = useState<number>(10)
  const [copiedIp, setCopiedIp] = useState<string | null>(null)

  useEffect(() => {
    const fetchDomainData = async () => {
      try {
        setLoading(true)
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vajra-9pjh.onrender.com'
        const response = await fetch(`${API_URL}/api/domain-analysis/analyze?domain=${encodeURIComponent(domain)}`)
        
        if (!response.ok) throw new Error('Failed to fetch domain data')
        
        const data = await response.json()
        setDomainData(data)
      } catch (err) {
        setError('Failed to load domain data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (domain) {
      fetchDomainData()
    }
  }, [domain])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedIp(text)
    setTimeout(() => setCopiedIp(null), 2000)
  }

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 animate-pulse space-y-4">
        <div className="h-8 bg-background rounded w-1/3" />
        <div className="h-10 bg-background rounded w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-background rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !domainData) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 text-danger">
          <AlertTriangle className="w-5 h-5" />
          <p>{error || 'No domain data available'}</p>
        </div>
      </div>
    )
  }

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'text-danger bg-danger/10 border-danger/30'
      case 'medium': return 'text-warning bg-warning/10 border-warning/30'
      case 'low': return 'text-success bg-success/10 border-success/30'
      case 'critical': return 'text-danger bg-danger/20 border-danger/40'
      default: return 'text-secondary bg-background border-border'
    }
  }

  const getSourceBadge = (source?: string) => {
    const s = (source || '').toLowerCase()
    if (s.includes('virustotal')) {
      return 'bg-blue-500/15 text-blue-400 border-blue-500/30'
    }
    if (s.includes('abuseipdb')) {
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    }
    if (s.includes('urlscan')) {
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    }
    if (s.includes('alienvault') || s.includes('otx')) {
      return 'bg-purple-500/15 text-purple-400 border-purple-500/30'
    }
    return 'bg-primary/15 text-primary border-primary/30'
  }

  const filteredVulnerabilities = (domainData.vulnerabilities || []).filter(v => {
    if (vulnFilter === 'ALL') return true
    return v.severity?.toUpperCase() === vulnFilter
  })

  const resolvedIps = domainData.connections?.ip_addresses || []
  const vtData = domainData.virustotal_data
  const vtStats = vtData?.last_analysis_stats || { malicious: 0, suspicious: 0, harmless: 0, undetected: 0 }
  const totalEngines = vtData?.total_engines || (vtStats.malicious + vtStats.suspicious + vtStats.harmless + vtStats.undetected)
  const isVtMalicious = vtStats.malicious > 0

  return (
    <div className="space-y-6">
      {/* Domain Header Card */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={`https://www.google.com/s2/favicons?domain=${domainData.target}&sz=64`}
              alt={`${domainData.target} logo`}
              className="w-12 h-12 object-contain rounded-xl border border-border bg-background p-1.5 flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${domainData.target}&sz=64`
              }}
            />
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-foreground">{domainData.target}</h2>
                <span className={`px-3 py-0.5 rounded-full text-xs font-semibold border ${getRiskColor(domainData.risk_level)}`}>
                  {domainData.risk_level} RISK
                </span>
                {vtData && (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${
                    isVtMalicious 
                      ? 'bg-red-500/15 text-red-400 border-red-500/30' 
                      : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  }`}>
                    <Shield className="w-3 h-3" />
                    VT: {vtData.detection_ratio || `${vtStats.malicious}/${totalEngines}`}
                  </span>
                )}
              </div>
              <p className="text-xs text-secondary mt-1">
                Last scanned: {domainData.last_scanned}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{domainData.security_score}</div>
              <div className="text-[10px] text-secondary">Security Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{resolvedIps.length}</div>
              <div className="text-[10px] text-secondary">Resolved IPs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{domainData.total_vulnerabilities || domainData.vulnerabilities?.length || 0}</div>
              <div className="text-[10px] text-secondary">Vulnerabilities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{domainData.country || 'Global'}</div>
              <div className="text-[10px] text-secondary">Location</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-primary text-primary bg-primary/5 rounded-t-lg'
              : 'border-transparent text-secondary hover:text-foreground'
          }`}
        >
          <Globe className="w-4 h-4" />
          Overview & IPs ({resolvedIps.length})
        </button>

        <button
          onClick={() => setActiveTab('virustotal')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'virustotal'
              ? 'border-primary text-primary bg-primary/5 rounded-t-lg'
              : 'border-transparent text-secondary hover:text-foreground'
          }`}
        >
          <Radio className="w-4 h-4 text-blue-400" />
          VirusTotal Telemetry
          {vtData && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
              isVtMalicious ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {vtData.detection_ratio || '0/0'}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('vulnerabilities')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'vulnerabilities'
              ? 'border-primary text-primary bg-primary/5 rounded-t-lg'
              : 'border-transparent text-secondary hover:text-foreground'
          }`}
        >
          <Shield className="w-4 h-4" />
          Vulnerabilities ({domainData.total_vulnerabilities || domainData.vulnerabilities?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('threats')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'threats'
              ? 'border-primary text-primary bg-primary/5 rounded-t-lg'
              : 'border-transparent text-secondary hover:text-foreground'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Threat Matrix ({domainData.threats.length})
        </button>

        <button
          onClick={() => setActiveTab('ssl')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'ssl'
              ? 'border-primary text-primary bg-primary/5 rounded-t-lg'
              : 'border-transparent text-secondary hover:text-foreground'
          }`}
        >
          <Lock className="w-4 h-4" />
          SSL Verification
        </button>

        <button
          onClick={() => setActiveTab('dns')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'dns'
              ? 'border-primary text-primary bg-primary/5 rounded-t-lg'
              : 'border-transparent text-secondary hover:text-foreground'
          }`}
        >
          <Server className="w-4 h-4" />
          DNS & Feeds
        </button>
      </div>

      {/* ──── TAB 1: OVERVIEW & RESOLVED IPs ──── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-xs text-secondary">Active Incidents</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{domainData.active_incidents}</div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-xs text-secondary">Abuse Confidence</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{domainData.abuse_confidence_score}%</div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs text-secondary">Reputation Score</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{domainData.reputation_score}</div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-primary" />
                <span className="text-xs text-secondary">Total Reports</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{domainData.total_reports}</div>
            </div>
          </div>

          {/* Resolved IP Addresses Section */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Network className="w-5 h-5 text-primary" />
                Resolved IP Addresses ({resolvedIps.length})
              </h3>
              <span className="text-xs text-secondary">
                Discovered via Google DNS & VirusTotal
              </span>
            </div>

            {resolvedIps.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {resolvedIps.map((ip, idx) => (
                  <div key={idx} className="bg-background border border-border rounded-xl p-4 flex items-center justify-between hover:border-primary/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center font-mono text-primary font-bold text-xs">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-foreground text-sm">{ip}</span>
                          <button
                            onClick={() => copyToClipboard(ip)}
                            className="text-secondary hover:text-foreground transition-colors p-1"
                            title="Copy IP"
                          >
                            {copiedIp === ip ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <div className="text-xs text-secondary mt-0.5 flex items-center gap-2">
                          <span>{domainData.isp || 'Telecom Host'}</span>
                          <span>•</span>
                          <span>{domainData.country || 'Global'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                        A Record
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-background rounded-xl text-center text-secondary text-sm">
                No external IP addresses resolved for this domain yet.
              </div>
            )}
          </div>

          {/* Infrastructure & Location Details */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Network & Organization Infrastructure
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                  <span className="text-secondary text-sm">Country Location</span>
                  <span className="text-foreground font-semibold">{domainData.country || 'Unknown'}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                  <span className="text-secondary text-sm">ISP / Organization</span>
                  <span className="text-foreground font-semibold truncate max-w-[220px]">{domainData.isp}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                  <span className="text-secondary text-sm">Domain Age</span>
                  <span className="text-foreground font-semibold">{domainData.domain_age_days} days</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                  <span className="text-secondary text-sm">Autonomous System (ASN)</span>
                  <span className="text-foreground font-mono text-sm font-semibold truncate max-w-[220px]">
                    {domainData.connections?.asn_info?.asn || 'Global Network'}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                  <span className="text-secondary text-sm">VirusTotal Status</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    isVtMalicious ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {isVtMalicious ? `${vtStats.malicious} Malicious Engines` : 'Clean Reputation'}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                  <span className="text-secondary text-sm">Last Reported</span>
                  <span className="text-foreground font-medium">{domainData.last_reported || 'Never'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──── TAB 2: VIRUSTOTAL MULTI-ENGINE TELEMETRY ──── */}
      {activeTab === 'virustotal' && (
        <div className="space-y-6">
          {/* VirusTotal Hero Score Card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Radio className="w-6 h-6 text-blue-400" />
                  VirusTotal Multi-Antivirus Engine Reputation
                </h3>
                <p className="text-xs text-secondary mt-1">
                  Aggregated threat detection from 90+ antivirus and URL scanning security vendors
                </p>
              </div>

              <div className={`px-4 py-2 rounded-xl border text-center ${
                isVtMalicious 
                  ? 'bg-red-500/15 border-red-500/30 text-red-400' 
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              }`}>
                <div className="text-2xl font-mono font-bold">
                  {vtData?.detection_ratio || `${vtStats.malicious}/${totalEngines}`}
                </div>
                <div className="text-[10px] uppercase tracking-wider font-semibold">
                  {isVtMalicious ? 'Threat Detected' : 'Clean / Safe'}
                </div>
              </div>
            </div>

            {/* 4 Engine Stats Pillars */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-background border border-border rounded-xl p-4 text-center">
                <div className="text-xs text-secondary mb-1 flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400" /> Malicious
                </div>
                <div className="text-2xl font-bold text-red-400">{vtStats.malicious}</div>
              </div>

              <div className="bg-background border border-border rounded-xl p-4 text-center">
                <div className="text-xs text-secondary mb-1 flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Suspicious
                </div>
                <div className="text-2xl font-bold text-amber-400">{vtStats.suspicious}</div>
              </div>

              <div className="bg-background border border-border rounded-xl p-4 text-center">
                <div className="text-xs text-secondary mb-1 flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Harmless
                </div>
                <div className="text-2xl font-bold text-emerald-400">{vtStats.harmless}</div>
              </div>

              <div className="bg-background border border-border rounded-xl p-4 text-center">
                <div className="text-xs text-secondary mb-1 flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-400" /> Undetected
                </div>
                <div className="text-2xl font-bold text-foreground">{vtStats.undetected}</div>
              </div>
            </div>

            {/* Vendor Categorizations & Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-background border border-border rounded-xl p-4">
                <span className="text-xs text-secondary font-medium block mb-2">Security Vendor Categorization</span>
                {vtData?.categories && vtData.categories.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {vtData.categories.map((cat, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-lg border border-primary/20">
                        {cat}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-secondary">General Web Infrastructure</p>
                )}
              </div>

              <div className="bg-background border border-border rounded-xl p-4">
                <span className="text-xs text-secondary font-medium block mb-2">Community Trust & Network</span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-secondary">VirusTotal Reputation</span>
                    <span className="text-foreground font-semibold font-mono">{vtData?.reputation || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Community Votes (Harmless)</span>
                    <span className="text-emerald-400 font-semibold">{vtData?.total_votes?.harmless || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Community Votes (Malicious)</span>
                    <span className="text-red-400 font-semibold">{vtData?.total_votes?.malicious || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Flagged Antivirus Engines */}
            {vtData?.flagged_engines && vtData.flagged_engines.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  Flagged Security Engines ({vtData.flagged_engines.length})
                </h4>
                <div className="space-y-2">
                  {vtData.flagged_engines.map((eng, i) => (
                    <div key={i} className="bg-background border border-red-500/20 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                        <span className="font-semibold text-foreground text-sm">{eng.engine_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 uppercase">
                          {eng.result}
                        </span>
                        <span className="text-xs text-secondary">{eng.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──── TAB 3: VULNERABILITIES (NVD / CVEs) ──── */}
      {activeTab === 'vulnerabilities' && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Vulnerability Assessment (NVD / CVE Database)
                </h3>
                <p className="text-xs text-secondary mt-1">
                  National Vulnerability Database intelligence & CVSS impact scoring
                </p>
              </div>

              {/* Severity Filter */}
              <div className="flex items-center gap-1 bg-background border border-border rounded-lg p-1">
                {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setVulnFilter(sev)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      vulnFilter === sev ? 'bg-primary text-white' : 'text-secondary hover:text-foreground'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-background border border-border rounded-xl p-4">
                <div className="text-xs text-secondary mb-1">Total Vulnerabilities</div>
                <div className="text-2xl font-bold text-foreground">
                  {domainData.total_vulnerabilities || domainData.vulnerabilities?.length || 0}
                </div>
              </div>
              <div className="bg-background border border-border rounded-xl p-4">
                <div className="text-xs text-secondary mb-1">High & Critical CVEs</div>
                <div className="text-2xl font-bold text-danger">
                  {domainData.high_critical_vulnerabilities || 0}
                </div>
              </div>
              <div className="bg-background border border-border rounded-xl p-4">
                <div className="text-xs text-secondary mb-1">Vulnerability Risk Score</div>
                <div className="text-2xl font-bold text-foreground">
                  {domainData.vulnerability_risk_score || 20}/100
                </div>
              </div>
            </div>

            {/* Vulnerabilities List */}
            {filteredVulnerabilities.length > 0 ? (
              <div className="space-y-4">
                {filteredVulnerabilities.slice(0, visibleVulnCount).map((vuln, index) => (
                  <div key={index} className="bg-background border border-border rounded-xl p-5 hover:border-primary/30 transition-all">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <a
                            href={`https://nvd.nist.gov/vuln/detail/${vuln.cve_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base font-mono font-bold text-primary hover:underline flex items-center gap-1.5"
                          >
                            {vuln.cve_id}
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded border ${getRiskColor(vuln.severity)}`}>
                            {vuln.severity}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-card border border-border text-foreground">
                            CVSS v3: {vuln.cvss_score.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/95 leading-relaxed">{vuln.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 text-xs text-secondary mt-3 pt-3 border-t border-border/50 flex-wrap">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Published: {new Date(vuln.published_date).toLocaleDateString()}</span>
                        </div>
                        {vuln.modified_date && vuln.modified_date !== "Unknown" && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Modified: {new Date(vuln.modified_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {vuln.references && vuln.references.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-secondary">References:</span>
                          <div className="flex gap-1.5">
                            {vuln.references.slice(0, 3).map((refUrl, i) => (
                              <a
                                key={i}
                                href={refUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline bg-primary/10 px-2 py-0.5 rounded flex items-center gap-1"
                              >
                                Ref {i + 1}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {filteredVulnerabilities.length > visibleVulnCount && (
                  <div className="pt-4 text-center">
                    <button
                      onClick={() => setVisibleVulnCount(prev => prev + 15)}
                      className="px-6 py-2.5 bg-primary/10 text-primary border border-primary/30 rounded-xl hover:bg-primary/20 transition-all font-medium text-sm"
                    >
                      Load More Vulnerabilities ({filteredVulnerabilities.length - visibleVulnCount} remaining)
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-secondary bg-background rounded-xl border border-border">
                <Shield className="w-12 h-12 mx-auto mb-2 text-emerald-400" />
                <p className="text-foreground font-semibold">No matching vulnerabilities found</p>
                <p className="text-xs text-secondary mt-1">Try selecting a different severity filter.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──── TAB 4: THREAT MATRIX ──── */}
      {activeTab === 'threats' && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-primary" />
              Detected Threat Intelligence Matrix ({domainData.threats.length})
            </h3>

            {domainData.threats.length > 0 ? (
              <div className="space-y-3">
                {domainData.threats.map((threat, index) => (
                  <div key={index} className="bg-background border border-border rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getRiskColor(threat.severity)}`}>
                            {threat.severity}
                          </span>
                          <span className="text-foreground font-semibold text-sm">{threat.type}</span>
                          {threat.source && (
                            <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${getSourceBadge(threat.source)}`}>
                              {threat.source}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-primary">{threat.confidence}%</div>
                        <div className="text-[10px] text-secondary">Confidence</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-secondary mt-2 pt-2 border-t border-border/50">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>First seen: {threat.first_seen}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Last seen: {threat.last_seen}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-secondary bg-background rounded-xl border border-border">
                <Shield className="w-12 h-12 mx-auto mb-2 text-emerald-400" />
                <p className="text-foreground font-semibold">No domain threats detected</p>
                <p className="text-xs text-secondary mt-1">Domain is clean according to current threat feeds.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──── TAB 5: SSL CERTIFICATE ──── */}
      {activeTab === 'ssl' && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              SSL / TLS Certificate Verification
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-background border border-border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-secondary mb-1">SSL Status</div>
                  <div className="text-lg font-bold text-foreground">
                    {domainData.ssl_certificate.valid ? 'Valid & Encrypted' : 'Invalid / Expired'}
                  </div>
                </div>
                {domainData.ssl_certificate.valid ? (
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-400" />
                )}
              </div>

              <div className="bg-background border border-border rounded-xl p-4">
                <div className="text-xs text-secondary mb-1">Issuer Authority</div>
                <div className="text-base font-semibold text-foreground truncate">
                  {domainData.ssl_certificate.issuer || 'Standard CA'}
                </div>
              </div>

              <div className="bg-background border border-border rounded-xl p-4">
                <div className="text-xs text-secondary mb-1">Days to Expiration</div>
                <div className="text-2xl font-bold text-foreground">
                  {domainData.ssl_certificate.expires_days || 'Valid'}
                </div>
              </div>
            </div>

            {companyId && (
              <div className="pt-4 border-t border-border">
                <CertificateDetails companyId={companyId} domain={domain} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──── TAB 6: DNS & FEEDS ──── */}
      {activeTab === 'dns' && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              DNS Records Matrix
            </h3>

            <div className="grid grid-cols-3 gap-4 text-center mb-6">
              <div className="bg-background border border-border rounded-xl p-4">
                <div className="text-3xl font-bold text-primary">{domainData.dns_records.a_records}</div>
                <div className="text-xs text-secondary mt-1">A Records (IPs)</div>
              </div>
              <div className="bg-background border border-border rounded-xl p-4">
                <div className="text-3xl font-bold text-primary">{domainData.dns_records.mx_records}</div>
                <div className="text-xs text-secondary mt-1">MX Records</div>
              </div>
              <div className="bg-background border border-border rounded-xl p-4">
                <div className="text-3xl font-bold text-primary">{domainData.dns_records.txt_records}</div>
                <div className="text-xs text-secondary mt-1">TXT Records</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
