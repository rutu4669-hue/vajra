'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { AlertTriangle, Filter, Search, X, TrendingUp, Globe } from 'lucide-react'
import { alertsService } from '@/services/alerts.service'
import { domainService } from '@/services/domain.service'

export default function AlertsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(200)
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [selectedAlert, setSelectedAlert] = useState<any>(null)
  
  const [domainScanResult, setDomainScanResult] = useState<any>(null)
  const [loadingDomainScan, setLoadingDomainScan] = useState(false)
  const [domainScanError, setDomainScanError] = useState<string | null>(null)

  useEffect(() => {
    setDomainScanResult(null)
    setDomainScanError(null)
  }, [searchQuery])

  const cleanQuery = searchQuery.trim().toLowerCase()
  const isDomainSearch = searchQuery.trim().includes('.') && /^(https?:\/\/)?(www\.)?[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/.test(cleanQuery)

  const triggerDomainScan = async () => {
    if (!searchQuery.trim()) return
    setLoadingDomainScan(true)
    setDomainScanError(null)
    setDomainScanResult(null)
    try {
      const data = await domainService.scanDomain(searchQuery.trim())
      setDomainScanResult(data)
    } catch (err: any) {
      console.warn('Domain reputation check error:', err.message)
      setDomainScanError(err.response?.data?.detail || 'Failed to scan domain reputation.')
    } finally {
      setLoadingDomainScan(false)
    }
  }

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await alertsService.getAlerts()
        setAlerts(data)
      } catch (error) {
        console.error('Error fetching alerts:', error)
        // Fallback to mock data with all severity levels
        setAlerts([
          {
            id: 1,
            title: 'Ransomware Attack Detected',
            description: 'Target: Aviation Sector - LockBit ransomware group has claimed responsibility for a major attack on aviation infrastructure.',
            time: '2 min ago',
            severity: 'CRITICAL',
            source: 'Ransomware.live'
          },
          {
            id: 2,
            title: 'CVE-2026-1234 Exploited in the Wild',
            description: 'High exploitation activity detected for a critical vulnerability in widely-used enterprise software.',
            time: '15 min ago',
            severity: 'CRITICAL',
            source: 'CVE Database'
          },
          {
            id: 3,
            title: 'Credential Leak Detected',
            description: '17 accounts found on dark web forums containing corporate credentials from multiple organizations.',
            time: '32 min ago',
            severity: 'CRITICAL',
            source: 'Dark Web Monitoring'
          },
          {
            id: 4,
            title: 'Malicious IP Detected',
            description: '185.234.217.16 - C2 Communication detected with known botnet infrastructure.',
            time: '45 min ago',
            severity: 'CRITICAL',
            source: 'Threat Intelligence'
          },
          {
            id: 5,
            title: 'Phishing Campaign Targeting Finance',
            description: 'Large-scale phishing campaign detected targeting financial institutions in North America and Europe.',
            time: '1 hour ago',
            severity: 'HIGH',
            source: 'Phishing Feed'
          },
          {
            id: 6,
            title: 'Zero-Day Vulnerability Discovered',
            description: 'New zero-day vulnerability found in popular cloud storage platform, no patch available yet.',
            time: '2 hours ago',
            severity: 'CRITICAL',
            source: 'Zero-Day Tracker'
          },
          {
            id: 7,
            title: 'APT Group Activity Increased',
            description: 'Increased activity detected from APT29 targeting diplomatic organizations in Eastern Europe.',
            time: '3 hours ago',
            severity: 'HIGH',
            source: 'Threat Actors'
          },
          {
            id: 8,
            title: 'Supply Chain Attack Detected',
            description: 'Malicious code discovered in popular software development tool affecting thousands of organizations.',
            time: '4 hours ago',
            severity: 'CRITICAL',
            source: 'Supply Chain'
          },
          {
            id: 9,
            title: 'DDoS Attack on Healthcare',
            description: 'Major DDoS attack targeting healthcare providers in the Asia-Pacific region.',
            time: '5 hours ago',
            severity: 'HIGH',
            source: 'Network Monitoring'
          },
          {
            id: 10,
            title: 'Data Breach Reported',
            description: 'Large-scale data breach reported affecting millions of customer records from retail company.',
            time: '6 hours ago',
            severity: 'HIGH',
            source: 'Breach Reports'
          },
          {
            id: 11,
            title: 'Suspicious Login Activity',
            description: 'Multiple failed login attempts from unusual geographic location detected.',
            time: '7 hours ago',
            severity: 'MEDIUM',
            source: 'Authentication System'
          },
          {
            id: 12,
            title: 'Outdated Software Detected',
            description: 'Server running vulnerable version of Apache Tomcat requiring patch.',
            time: '8 hours ago',
            severity: 'MEDIUM',
            source: 'Vulnerability Scanner'
          },
          {
            id: 13,
            title: 'Port Scan Detected',
            description: 'Systematic port scanning activity from external IP address.',
            time: '9 hours ago',
            severity: 'MEDIUM',
            source: 'IDS'
          },
          {
            id: 14,
            title: 'Weak SSL Certificate',
            description: 'SSL certificate using weak encryption algorithm detected.',
            time: '10 hours ago',
            severity: 'LOW',
            source: 'SSL Monitor'
          },
          {
            id: 15,
            title: 'Configuration Drift',
            description: 'Security configuration changed without proper approval process.',
            time: '11 hours ago',
            severity: 'LOW',
            source: 'Config Monitor'
          },
          {
            id: 16,
            title: 'Unusual Network Traffic',
            description: 'Increased data transfer to unknown external server detected.',
            time: '12 hours ago',
            severity: 'LOW',
            source: 'Network Monitor'
          }
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchAlerts()
  }, [])

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter
    return matchesSearch && matchesSeverity
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'severity-critical bg-severity-critical/10 border-severity-critical/20'
      case 'HIGH': return 'severity-high bg-severity-high/10 border-severity-high/20'
      case 'MEDIUM': return 'severity-medium bg-severity-medium/10 border-severity-medium/20'
      case 'LOW': return 'severity-low bg-severity-low/10 border-severity-low/20'
      default: return 'text-secondary bg-secondary/10 border-secondary/20'
    }
  }

  const formatAlertTime = (time: string) => {
    if (!time || time === 'Unknown') return 'Unknown'
    if (time.toLowerCase().includes('ago')) return time
    
    try {
      // Try to parse the timestamp
      const date = new Date(time)
      
      // Check if date is valid
      if (!isNaN(date.getTime())) {
        // Format as readable date/time
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      }
      
      // If invalid, try to clean up the timestamp format
      // AlienVault sometimes returns timestamps with extra characters
      const cleanedTime = time.replace(/[^\d\-:T]/g, '').slice(0, 25)
      const cleanedDate = new Date(cleanedTime)
      
      if (!isNaN(cleanedDate.getTime())) {
        return cleanedDate.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      }
      
      // Return original if all parsing fails
      return time
    } catch (error) {
      return time // Return original if parsing fails
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} sidebarWidth={sidebarWidth} setSidebarWidth={setSidebarWidth} />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-[300px]'} overflow-hidden`}>
          <Navbar />
          <main className="flex-1 overflow-auto p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-24 bg-card rounded-xl animate-pulse" />
              ))}
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} sidebarWidth={sidebarWidth} setSidebarWidth={setSidebarWidth} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-[300px]'} overflow-hidden`}>
        <Navbar />
        <main className="flex-1 overflow-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground text-glow">Security Alerts</h1>
              <p className="text-secondary text-sm mt-1">Monitor and manage security alerts and incidents</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div 
                onClick={() => setSeverityFilter('all')}
                className={`bg-card border rounded-xl p-4 card-glow cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ${severityFilter === 'all' ? 'border-primary' : 'border-border'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                  <span className="text-sm text-secondary">Total Alerts</span>
                </div>
                <div className="text-2xl font-bold text-foreground text-glow">{alerts.length}</div>
              </div>
              <div 
                onClick={() => setSeverityFilter('CRITICAL')}
                className={`bg-card border rounded-xl p-4 card-glow-red cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ${severityFilter === 'CRITICAL' ? 'border-danger' : 'border-border'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-danger animate-pulse" />
                  <span className="text-sm text-secondary">Critical</span>
                </div>
                <div className="text-2xl font-bold text-danger text-glow-red">
                  {alerts.filter(a => a.severity === 'CRITICAL').length}
                </div>
              </div>
              <div 
                onClick={() => setSeverityFilter('HIGH')}
                className={`bg-card border rounded-xl p-4 card-glow-cyan cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ${severityFilter === 'HIGH' ? 'border-accent' : 'border-border'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  <span className="text-sm text-secondary">High Priority</span>
                </div>
                <div className="text-2xl font-bold text-accent text-glow-cyan">
                  {alerts.filter(a => a.severity === 'HIGH').length}
                </div>
              </div>
              <div 
                onClick={() => { setSeverityFilter('all'); setSearchQuery(''); }}
                className={`bg-card border rounded-xl p-4 card-glow-green cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ${((severityFilter !== 'all' ? 1 : 0) + (searchQuery ? 1 : 0)) > 0 ? 'border-success' : 'border-border'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-success" />
                    <span className="text-sm text-secondary">Active Filters</span>
                  </div>
                  {((severityFilter !== 'all' ? 1 : 0) + (searchQuery ? 1 : 0)) > 0 && (
                    <span className="text-[9px] text-success bg-success/10 px-2 py-0.5 rounded-full font-bold animate-pulse">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-xl font-bold text-success text-glow-green flex items-baseline justify-between mt-1">
                  <span>
                    {severityFilter === 'all' ? 'All' :
                     severityFilter === 'CRITICAL' ? 'Critical' :
                     severityFilter === 'HIGH' ? 'High' :
                     severityFilter === 'MEDIUM' ? 'Medium' : 'Low'}
                    {searchQuery && (
                      <span className="text-[10px] text-secondary font-normal ml-1 truncate max-w-[80px]">
                        *
                      </span>
                    )}
                  </span>
                  <span className="text-[9px] text-secondary font-normal hover:text-success transition-colors">
                    Reset
                  </span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-card border border-border rounded-xl p-4 hover:border-glow-blue transition-all duration-300 hover:shadow-glow">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                    <input
                      type="text"
                      placeholder="Search alerts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder-secondary focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-secondary" />
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="all">All Severities</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Domain Reputation Scanner (Alerts Page inline version) */}
            {isDomainSearch && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-primary/45 rounded-xl p-5 card-glow-blue hover:shadow-glow transition-all duration-300"
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary animate-pulse" />
                    <h3 className="text-sm font-semibold text-foreground">Domain Reputation Intelligence</h3>
                  </div>
                  {!domainScanResult && !loadingDomainScan && (
                    <button
                      onClick={triggerDomainScan}
                      className="bg-primary hover:bg-primary-hover text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all shadow-glow"
                    >
                      Scan Domain Risk
                    </button>
                  )}
                </div>

                {loadingDomainScan && (
                  <div className="flex items-center gap-2.5 text-xs text-secondary py-3">
                    <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    Querying reputation data from AlienVault OTX...
                  </div>
                )}

                {domainScanError && (
                  <div className="text-xs text-danger bg-danger/10 border border-danger/15 rounded-lg p-2.5">
                    {domainScanError}
                  </div>
                )}

                {domainScanResult && (
                  <div className="bg-background/50 border border-border/50 rounded-lg p-4 space-y-4 animate-in fade-in duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-foreground font-mono">{domainScanResult.domain}</h4>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                          domainScanResult.risk_level === 'CRITICAL' ? 'bg-danger/20 text-danger border border-danger/30 font-bold' :
                          domainScanResult.risk_level === 'HIGH' ? 'bg-warning/20 text-warning border border-warning/30 font-bold' :
                          domainScanResult.risk_level === 'MEDIUM' ? 'bg-primary/20 text-primary border border-primary/30 font-bold' :
                          'bg-success/20 text-success border border-success/30 font-bold'
                        }`}>
                          {domainScanResult.risk_level} Severity
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] text-secondary block">Risk Score</span>
                          <span className={`text-lg font-black ${
                            domainScanResult.risk_score > 75 ? 'text-danger' :
                            domainScanResult.risk_score > 40 ? 'text-warning' : 'text-success'
                          }`}>
                            {domainScanResult.risk_score}/100
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <h5 className="font-semibold text-secondary mb-1">Mitigation Advice</h5>
                        <p className="text-foreground leading-relaxed bg-card p-2 rounded border border-border/30">{domainScanResult.recommendation}</p>
                      </div>
                      <div>
                        <h5 className="font-semibold text-secondary mb-1">WHOIS Metadata</h5>
                        <p className="text-foreground leading-relaxed font-mono whitespace-pre-line bg-card p-2 rounded border border-border/30 max-h-[60px] overflow-y-auto">
                          {domainScanResult.whois}
                        </p>
                      </div>
                    </div>

                    {/* Risk Factors Breakdown */}
                    {domainScanResult.risk_factors && domainScanResult.risk_factors.length > 0 && (
                      <div className="border-t border-border/40 pt-3 text-[11px]">
                        <h5 className="font-semibold text-foreground mb-2 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-primary" />
                          Risk Factors Analysis
                        </h5>
                        <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-0.5 scrollbar-thin">
                          {domainScanResult.risk_factors.map((rf: any, i: number) => (
                            <div key={i} className="bg-card/45 border border-border/30 rounded p-2 flex items-center justify-between gap-3">
                              <div className="space-y-0.5 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-semibold text-foreground text-[10px]">{rf.factor}</span>
                                  <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded border ${
                                    rf.status === 'DANGER' ? 'bg-danger/20 text-danger border-danger/30' :
                                    rf.status === 'WARNING' ? 'bg-warning/20 text-warning border-warning/30' :
                                    rf.status === 'SUSPICIOUS' ? 'bg-accent/20 text-accent border-accent/30' :
                                    'bg-success/20 text-success border-success/30'
                                  }`}>
                                    {rf.status}
                                  </span>
                                </div>
                                <p className="text-secondary text-[9px] leading-relaxed">{rf.description}</p>
                              </div>
                              <span className="font-mono font-bold text-[9px] text-primary min-w-[30px] text-right">
                                {rf.impact}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Alerts List */}
            <div className="space-y-4">
              {filteredAlerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedAlert(alert)}
                  className={`bg-card border rounded-xl p-4 hover:border-primary/50 transition-all duration-300 hover:shadow-glow cursor-pointer ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity).split(' ')[1]}`}>
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-foreground">{alert.title}</h3>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-sm text-secondary mb-2">{alert.description}</p>
                        <div className="flex items-center gap-4 text-xs text-secondary">
                          <span>{formatAlertTime(alert.time)}</span>
                          {alert.source && <span>Source: {alert.source}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredAlerts.length === 0 && (
              <div className="text-center py-12 bg-card border border-border rounded-xl">
                <AlertTriangle className="w-12 h-12 text-secondary mx-auto mb-4" />
                <p className="text-sm text-secondary">No alerts found matching your criteria</p>
              </div>
            )}

            {/* Alert Detail Modal */}
            {selectedAlert && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setSelectedAlert(null)}
                  className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                />
                
                {/* Modal Content */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl p-6 overflow-hidden z-10"
                >
                  <button 
                    onClick={() => setSelectedAlert(null)}
                    className="absolute right-4 top-4 p-1 rounded-lg hover:bg-background transition-colors text-secondary hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-danger/10 text-danger animate-pulse">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${getSeverityColor(selectedAlert.severity)}`}>
                        {selectedAlert.severity}
                      </span>
                      <p className="text-xs text-secondary mt-1">{selectedAlert.time}</p>
                    </div>
                  </div>

                  <h2 className="text-base font-bold text-foreground mb-2">{selectedAlert.title}</h2>
                  
                  {selectedAlert.adversary && selectedAlert.adversary !== 'Unknown' && (
                    <div className="text-xs text-primary font-semibold mb-2 bg-primary/10 px-2 py-1 rounded inline-block">
                      Threat Actor: <span className="underline">{selectedAlert.adversary}</span>
                    </div>
                  )}

                  {selectedAlert.tags && selectedAlert.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {selectedAlert.tags.map((tag: string, i: number) => (
                        <span key={i} className="text-[10px] bg-background border border-border/80 text-secondary px-2 py-0.5 rounded-full font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-secondary mb-4 leading-relaxed bg-background/40 border border-border/40 rounded-lg p-3 max-h-[120px] overflow-y-auto">
                    {selectedAlert.description}
                  </p>

                  {/* Indicators of Compromise (IOCs) */}
                  {selectedAlert.indicators && selectedAlert.indicators.length > 0 && (
                    <div className="mb-4 border-t border-border pt-3">
                      <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                        Indicators of Compromise ({selectedAlert.indicators.length})
                      </h4>
                      <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                        {selectedAlert.indicators.map((ioc: any, i: number) => (
                          <div key={i} className="flex flex-col bg-background/50 border border-border/40 rounded p-2 text-[10px]">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-mono text-foreground font-semibold break-all">{ioc.indicator}</span>
                              <div className="flex items-center gap-1.5">
                                {(ioc.type === 'IPv4' || ioc.type === 'IPv6' || /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ioc.indicator)) && (
                                  <a
                                    href={`https://www.abuseipdb.com/check/${ioc.indicator}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[8px] bg-danger/10 hover:bg-danger/20 text-danger border border-danger/25 px-1.5 py-0.5 rounded font-bold transition-all"
                                  >
                                    AbuseIPDB
                                  </a>
                                )}
                                <span className="text-[8px] bg-accent/10 text-accent px-1.5 py-0.5 rounded font-mono uppercase">
                                  {ioc.type}
                                </span>
                              </div>
                            </div>
                            {ioc.description && (
                              <span className="text-secondary mt-0.5">{ioc.description}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 border-t border-border pt-3">
                    {selectedAlert.source && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-secondary">Source Feed</span>
                        <span className="text-foreground font-medium">{selectedAlert.source}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-secondary">Incident Classification</span>
                      <span className="text-foreground font-medium font-semibold text-glow-cyan text-accent">Cybersecurity Threat Alert</span>
                    </div>
                  </div>

                  <div className="mt-5 flex justify-end gap-3">
                    {selectedAlert.external_url && (
                      <a
                        href={selectedAlert.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-accent hover:bg-accent/80 text-background text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-glow-cyan flex items-center justify-center"
                      >
                        View Incident
                      </a>
                    )}
                    <button 
                      onClick={() => setSelectedAlert(null)}
                      className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-glow"
                    >
                      Close Details
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
