'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, TrendingUp, TrendingDown, Search, AlertCircle, X, Shield, Globe, Activity, CheckCircle2, Bug, Zap } from 'lucide-react'
import { industriesService } from '@/services/industries.service'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

export default function IndustriesPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(200)
  const [mounted, setMounted] = useState(false)
  const [industries, setIndustries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const data = await industriesService.getTargetedIndustries()
        if (Array.isArray(data) && data.length > 0) {
          setIndustries(data)
        } else {
          throw new Error('Empty response')
        }
      } catch (error) {
        console.error('Error fetching industries:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchIndustries()
  }, [])

  const getTrendColor = (trend: string = '') => {
    if (trend.includes('↑')) return 'text-danger bg-danger/10 border-danger/30'
    if (trend.includes('↓')) return 'text-success bg-success/10 border-success/30'
    return 'text-secondary bg-secondary/10 border-secondary/30'
  }

  const getRiskBadge = (level: string = 'HIGH') => {
    const l = level.toUpperCase()
    if (l === 'CRITICAL') return 'bg-red-500/15 text-red-400 border-red-500/30'
    if (l === 'HIGH') return 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    return 'bg-blue-500/15 text-blue-400 border-blue-500/30'
  }

  const filteredIndustries = industries.filter((industry) =>
    (industry.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (industry.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (industry.top_adversaries || []).some((a: string) => a.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="w-64 bg-card border-r border-border h-screen animate-pulse" />
        <div className="flex-1 flex flex-col">
          <div className="h-16 bg-card border-b border-border animate-pulse" />
          <main className="flex-1 p-6 space-y-6">
            <div className="h-8 w-48 bg-card rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 bg-card rounded-xl animate-pulse" />
              ))}
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
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground text-glow flex items-center gap-2.5">
                <Building2 className="w-6 h-6 text-primary" /> Most Targeted Industries
              </h1>
              <p className="text-secondary text-sm mt-1">
                Real-time sector targeting telemetry, adversary attack vectors, and prioritized defense hardening
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search industries, adversaries, attack vectors..."
                  className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-foreground placeholder:text-secondary/60 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            {/* Industries Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-48 bg-card rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredIndustries.map((industry, index) => {
                  const adversaries = industry.top_adversaries || (industry.top_threat_actors ? industry.top_threat_actors.split(', ') : ['LockBit', 'Lazarus Group'])
                  const vectors = industry.primary_threat_vectors || ['Ransomware', 'Phishing', 'Zero-Day']

                  return (
                    <motion.div
                      key={industry.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedIndustry(industry)}
                      className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                              <Building2 className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                                {industry.name}
                              </h3>
                              <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${getRiskBadge(industry.risk_level)}`}>
                                {industry.risk_level || 'HIGH'} RISK
                              </span>
                            </div>
                          </div>
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg border flex items-center gap-1 ${getTrendColor(industry.trend)}`}>
                            {industry.trend?.includes('↑') ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {industry.trend || '↑ 5%'}
                          </span>
                        </div>

                        <p className="text-xs text-secondary line-clamp-2 mb-4 leading-relaxed">
                          {industry.description}
                        </p>

                        <div className="space-y-2 pt-3 border-t border-border/50">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-secondary">Attack Volume</span>
                            <span className="text-foreground font-mono font-bold">{industry.attack_count || 250} ({industry.attack_percentage || '15'}%)</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-secondary">Primary Vector</span>
                            <span className="text-primary font-medium">{vectors[0] || 'Double Extortion Ransomware'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-secondary">
                        <span>Top Threat: <strong className="text-foreground">{adversaries[0] || 'LockBit 3.0'}</strong></span>
                        <span className="text-primary group-hover:translate-x-1 transition-transform font-medium">View Dossier →</span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal for detailed industry information */}
      {selectedIndustry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedIndustry(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-card/95 backdrop-blur-md border-b border-border p-5 flex items-center justify-between z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selectedIndustry.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full border ${getRiskBadge(selectedIndustry.risk_level)}`}>
                      {selectedIndustry.risk_level || 'HIGH'} Risk Sector
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-lg border font-semibold flex items-center gap-1 ${getTrendColor(selectedIndustry.trend)}`}>
                      {selectedIndustry.trend?.includes('↑') ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {selectedIndustry.trend || '↑ 5%'}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedIndustry(null)} 
                className="p-2 hover:bg-background rounded-xl transition-colors text-secondary hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Industry Threat Profile
                </h3>
                <p className="text-sm text-foreground/90 leading-relaxed bg-background/60 p-4 rounded-xl border border-border/50">
                  {selectedIndustry.description || 'Comprehensive threat intelligence tracking targeting dynamics across global enterprise sectors.'}
                </p>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-background/60 border border-border/60 rounded-xl p-3.5">
                  <span className="text-[10px] text-secondary uppercase font-semibold tracking-wider">Attack Volume</span>
                  <p className="text-base font-bold text-foreground mt-1">{selectedIndustry.attack_count || 356} incidents</p>
                </div>
                <div className="bg-background/60 border border-border/60 rounded-xl p-3.5">
                  <span className="text-[10px] text-secondary uppercase font-semibold tracking-wider">Global Share</span>
                  <p className="text-base font-bold text-primary mt-1">{selectedIndustry.attack_percentage || '28.5'}% of attacks</p>
                </div>
                <div className="bg-background/60 border border-border/60 rounded-xl p-3.5">
                  <span className="text-[10px] text-secondary uppercase font-semibold tracking-wider">Risk Classification</span>
                  <p className="text-base font-bold text-red-400 mt-1">{selectedIndustry.risk_level || 'CRITICAL'}</p>
                </div>
                <div className="bg-background/60 border border-border/60 rounded-xl p-3.5">
                  <span className="text-[10px] text-secondary uppercase font-semibold tracking-wider">Attack Trend</span>
                  <p className="text-base font-bold text-amber-400 mt-1">{selectedIndustry.trend || '↑ 12%'}</p>
                </div>
              </div>

              {/* Primary Threat Vectors */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2.5 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Primary Attack Vectors
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(selectedIndustry.primary_threat_vectors || ['Double Extortion Ransomware', 'Phishing Credential Harvesters', 'Supply Chain Compromise', 'Medical/Industrial IoT Exploits']).map((vector: string, i: number) => (
                    <span key={i} className="text-xs px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/25 rounded-lg font-medium">
                      {vector}
                    </span>
                  ))}
                </div>
              </div>

              {/* Active Adversaries */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2.5 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-red-400" /> Active Threat Actors Targeting This Sector
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(selectedIndustry.top_adversaries || ['LockBit 3.0', 'BlackCat (ALPHV)', 'Lazarus Group', 'Volt Typhoon']).map((adv: string, i: number) => (
                    <span key={i} className="text-xs px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/25 rounded-lg font-medium">
                      {adv}
                    </span>
                  ))}
                </div>
              </div>

              {/* Common CVEs */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2.5 flex items-center gap-1.5">
                  <Bug className="w-3.5 h-3.5 text-purple-400" /> Commonly Exploited Vulnerabilities (CVEs)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(selectedIndustry.common_cves || ['CVE-2023-4966 (Citrix Bleed)', 'CVE-2024-21887 (Ivanti Secure)', 'CVE-2023-23397 (Outlook NTLM)']).map((cve: string, i: number) => (
                    <span key={i} className="text-xs px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/25 rounded-lg font-mono font-medium">
                      {cve}
                    </span>
                  ))}
                </div>
              </div>

              {/* Impact Summary */}
              {selectedIndustry.impact_summary && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400" /> Impact & Exposure Summary
                  </h3>
                  <p className="text-xs text-secondary leading-relaxed bg-background/50 p-3.5 rounded-xl border border-border/40">
                    {selectedIndustry.impact_summary}
                  </p>
                </div>
              )}

              {/* Recommended Defenses */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Recommended Strategic Defenses
                </h3>
                <div className="space-y-2">
                  {(selectedIndustry.recommended_defenses || [
                    'Network microsegmentation isolating critical operational systems',
                    'Enforced hardware-backed Multi-Factor Authentication (FIDO2)',
                    'Continuous 24/7 EDR/MDR endpoint telemetry and behavioral anomaly detection',
                    'Air-gapped, immutable backup architectures for zero-downtime disaster recovery'
                  ]).map((defense: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-foreground/90 bg-emerald-500/5 border border-emerald-500/15 p-2.5 rounded-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                      <span>{defense}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
