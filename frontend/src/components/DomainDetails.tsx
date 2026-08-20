'use client'

import { useEffect, useState } from 'react'
import { Shield, AlertTriangle, Globe, Server, Clock, FileText, TrendingUp, Activity, CheckCircle, XCircle, Lock, ExternalLink } from 'lucide-react'
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
    }
    country: string
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

type TabType = 'overview' | 'threats' | 'vulnerabilities' | 'ssl' | 'dns'

export default function DomainDetails({ domain, companyId }: DomainDetailsProps) {
  const [domainData, setDomainData] = useState<DomainData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [vulnFilter, setVulnFilter] = useState<string>('ALL')
  const [visibleVulnCount, setVisibleVulnCount] = useState<number>(10)

  useEffect(() => {
    const fetchDomainData = async () => {
      try {
        setLoading(true)
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
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

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-danger bg-danger/10'
      case 'high': return 'text-danger'
      case 'medium': return 'text-warning'
      case 'low': return 'text-success'
      default: return 'text-secondary'
    }
  }

  const filteredVulnerabilities = (domainData.vulnerabilities || []).filter(v => {
    if (vulnFilter === 'ALL') return true
    return v.severity?.toUpperCase() === vulnFilter
  })

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
              <div className="text-2xl font-bold text-foreground">{domainData.domain_age_days}</div>
              <div className="text-[10px] text-secondary">Domain Age (Days)</div>
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
          Overview & IPs
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
          Domain Threats ({domainData.threats.length})
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

      {/* ──── TAB 1: OVERVIEW & IPs ──── */}
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
                <span className="text-xs text-secondary">Reputation</span>
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

          {/* Infrastructure & Location */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              IP & Location Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2.5 bg-background rounded-lg border border-border">
                  <span className="text-secondary text-sm">Country Location</span>
                  <span className="text-foreground font-semibold">{domainData.country}</span>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-background rounded-lg border border-border">
                  <span className="text-secondary text-sm">ISP / Host</span>
                  <span className="text-foreground font-semibold truncate max-w-[200px]">{domainData.isp}</span>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-background rounded-lg border border-border">
                  <span className="text-secondary text-sm">Domain Age</span>
                  <span className="text-foreground font-semibold">{domainData.domain_age_days} days</span>
                </div>
              </div>

              <div className="space-y-3">
                {domainData.connections?.ip_addresses && domainData.connections.ip_addresses.length > 0 ? (
                  <div className="p-3 bg-background rounded-lg border border-border">
                    <span className="text-secondary text-xs block mb-2 font-medium">Resolved IP Addresses</span>
                    <div className="flex flex-wrap gap-2">
                      {domainData.connections.ip_addresses.map((ip, i) => (
                        <span key={i} className="text-xs font-mono px-2.5 py-1 bg-card rounded border border-border text-foreground font-semibold">
                          {ip}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-background rounded-lg border border-border">
                    <span className="text-secondary text-xs block mb-1">Primary Network IP</span>
                    <span className="text-foreground font-mono font-semibold text-sm">
                      {domainData.isp !== 'Unknown' ? domainData.isp : 'Resolved via DNS'}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center p-2.5 bg-background rounded-lg border border-border">
                  <span className="text-secondary text-sm">Last Reported</span>
                  <span className="text-foreground font-medium">{domainData.last_reported || 'Never'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──── TAB 2: DOMAIN THREATS ──── */}
      {activeTab === 'threats' && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-primary" />
              Detected Domain Threats ({domainData.threats.length})
            </h3>

            {domainData.threats.length > 0 ? (
              <div className="space-y-3">
                {domainData.threats.map((threat, index) => (
                  <div key={index} className="bg-background border border-border rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getRiskColor(threat.severity)}`}>
                            {threat.severity}
                          </span>
                          <span className="text-foreground font-semibold text-sm">{threat.type}</span>
                        </div>
                        {threat.source && (
                          <span className="text-xs text-secondary">Source: {threat.source}</span>
                        )}
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
                <p className="text-xs text-secondary mt-1">Domain is clean according to current intelligence feeds.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──── TAB 3: VULNERABILITIES ──── */}
      {activeTab === 'vulnerabilities' && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Vulnerability Assessment (NVD)
              </h3>

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
                <div className="text-xs text-secondary mb-1">High/Critical</div>
                <div className="text-2xl font-bold text-danger">
                  {domainData.high_critical_vulnerabilities || 0}
                </div>
              </div>
              <div className="bg-background border border-border rounded-xl p-4">
                <div className="text-xs text-secondary mb-1">Risk Score</div>
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

      {/* ──── TAB 4: SSL CERTIFICATE ──── */}
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

            {/* Deep Certificate Component */}
            {companyId && (
              <div className="pt-4 border-t border-border">
                <CertificateDetails companyId={companyId} domain={domain} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──── TAB 5: DNS & FEEDS ──── */}
      {activeTab === 'dns' && (
        <div className="space-y-6">
          {/* DNS Records */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              DNS Records Matrix
            </h3>

            <div className="grid grid-cols-3 gap-4 text-center mb-6">
              <div className="bg-background border border-border rounded-xl p-4">
                <div className="text-3xl font-bold text-primary">{domainData.dns_records.a_records}</div>
                <div className="text-xs text-secondary mt-1">A Records</div>
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

          {/* Feeds Data */}
          {(domainData.urlscan_data || domainData.abuseipdb_data || domainData.virustotal_data || domainData.alienvault_data) && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Intelligence Feed Summary
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {domainData.urlscan_data && (
                  <div className="bg-background border border-border rounded-xl p-4">
                    <h4 className="font-semibold text-foreground mb-3 text-sm">URLScan.io</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-secondary">Total Scans</span>
                        <span className="text-foreground font-semibold">{domainData.urlscan_data.total_scans}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Malicious</span>
                        <span className="text-danger font-semibold">{domainData.urlscan_data.malicious_scans}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Suspicious</span>
                        <span className="text-warning font-semibold">{domainData.urlscan_data.suspicious_scans}</span>
                      </div>
                    </div>
                  </div>
                )}

                {domainData.virustotal_data && (
                  <div className="bg-background border border-border rounded-xl p-4">
                    <h4 className="font-semibold text-foreground mb-3 text-sm">VirusTotal</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-secondary">Reputation</span>
                        <span className="text-foreground font-semibold">{domainData.virustotal_data.reputation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Malicious Detections</span>
                        <span className="text-danger font-semibold">{domainData.virustotal_data.last_analysis_stats.malicious}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Harmless Detections</span>
                        <span className="text-success font-semibold">{domainData.virustotal_data.last_analysis_stats.harmless}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
