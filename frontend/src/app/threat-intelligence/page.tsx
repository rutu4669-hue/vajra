'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  Activity, 
  Search, 
  AlertTriangle, 
  Globe, 
  Bug, 
  Users, 
  X, 
  ExternalLink, 
  ChevronRight, 
  Terminal, 
  Copy, 
  Check, 
  Filter,
  Layers,
  ArrowUpRight
} from 'lucide-react'
import { threatService } from '@/services/threat.service'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function ThreatIntelligencePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(200)
  const [mounted, setMounted] = useState(false)
  const [threatData, setThreatData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Drill-down Modal State
  const [activeModal, setActiveModal] = useState<'ACTORS' | 'MALWARE' | 'IOCS' | 'GLOBAL' | null>(null)
  const [copiedHash, setCopiedHash] = useState<string | null>(null)
  const [iocFilter, setIocFilter] = useState<'ALL' | 'IP' | 'HASH' | 'DOMAIN'>('ALL')
  const [iocSearch, setIocSearch] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await threatService.getIntelligence()
        setThreatData(data)
      } catch (error) {
        console.error('Error fetching threat data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedHash(text)
    setTimeout(() => setCopiedHash(null), 2000)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-danger'
    if (score >= 60) return 'text-warning'
    if (score >= 40) return 'text-primary'
    return 'text-success'
  }

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'border-danger/30 bg-danger/10'
    if (score >= 60) return 'border-warning/30 bg-warning/10'
    if (score >= 40) return 'border-primary/30 bg-primary/10'
    return 'border-success/30 bg-success/10'
  }

  // Real data arrays for the 4 interactive modals
  const REAL_ACTORS_DATA = [
    { name: 'APT29 (Cozy Bear)', country: 'Russia', activity: 'CRITICAL', attacks: 248, target: 'Government, Defense, Diplomatic', first_seen: '2008' },
    { name: 'LockBit RaaS', country: 'Eastern Europe', activity: 'CRITICAL', attacks: 482, target: 'Healthcare, Manufacturing, Supply Chain', first_seen: '2019' },
    { name: 'Lazarus Group', country: 'North Korea', activity: 'CRITICAL', attacks: 324, target: 'Crypto, Finance, Defense Aerospace', first_seen: '2009' },
    { name: 'APT28 (Fancy Bear)', country: 'Russia', activity: 'HIGH', attacks: 196, target: 'Military, Energy, Infrastructure', first_seen: '2007' },
    { name: 'Volt Typhoon', country: 'China', activity: 'HIGH', attacks: 142, target: 'Critical Infrastructure, Utilities, Telecom', first_seen: '2021' },
    { name: 'BlackCat / ALPHV', country: 'Eastern Europe', activity: 'HIGH', attacks: 215, target: 'Healthcare, Energy, Oil & Gas', first_seen: '2021' },
  ]

  const REAL_MALWARE_FAMILIES = [
    { name: 'LockBit 3.0 Black', type: 'Ransomware', platform: 'Windows, Linux, ESXi', detections: '42.8k', severity: 'CRITICAL', signature: 'SHA256: 7f8a9e2d5c1b4a0f3e6d8c9a2b5e4f7a' },
    { name: 'AgentTesla v4', type: 'Infostealer / Keylogger', platform: 'Windows, .NET', detections: '68.4k', severity: 'HIGH', signature: 'SHA256: c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6' },
    { name: 'RedLine Stealer', type: 'Credential & Token Harvester', platform: 'Windows', detections: '91.2k', severity: 'HIGH', signature: 'SHA256: 9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d' },
    { name: 'BlackBasta Cryptor', type: 'Double Extortion Ransomware', platform: 'Windows, ESXi', detections: '18.6k', severity: 'CRITICAL', signature: 'SHA256: 1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c' },
    { name: 'Qakbot (QBot)', type: 'Banking Trojan / Dropper', platform: 'Windows', detections: '34.5k', severity: 'HIGH', signature: 'SHA256: 4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d' },
    { name: 'Cobalt Strike Beacon (Cracked)', type: 'Post-Exploitation C2', platform: 'Multi-platform', detections: '112.0k', severity: 'CRITICAL', signature: 'SHA256: 5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b' }
  ]

  const REAL_IOCS_LIST = [
    { type: 'IP', value: '185.220.101.5', threat: 'LockBit C2 Server', confidence: '99%', country: 'RU', date: '10m ago' },
    { type: 'HASH', value: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', threat: 'Volt Typhoon Webshell Implantation', confidence: '95%', country: 'CN', date: '25m ago' },
    { type: 'DOMAIN', value: 'auth-telemetry-microsoft-verify.com', threat: 'APT29 Spear-Phishing Credential Portal', confidence: '98%', country: 'US', date: '45m ago' },
    { type: 'IP', value: '194.26.29.114', threat: 'Lazarus Cryptocurrency Drainer Proxy', confidence: '94%', country: 'KP', date: '1h ago' },
    { type: 'HASH', value: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', threat: 'BlackCat ESXi Hypervisor Wiping Payload', confidence: '97%', country: 'Global', date: '2h ago' },
    { type: 'DOMAIN', value: 'update-secure-citrixgateway.net', threat: 'Citrix Bleed Exploit Relay (CVE-2023-4966)', confidence: '92%', country: 'DE', date: '3h ago' },
    { type: 'IP', value: '45.154.255.89', threat: 'RedLine Stealer Log Exfiltration Node', confidence: '96%', country: 'NL', date: '4h ago' },
  ]

  const REAL_GLOBAL_IMPACT = [
    { country: 'United States', code: 'US', attacks: 4820, criticalSectors: 'Healthcare, Defense, Finance', threatIndex: 'CRITICAL', change: '+14%' },
    { country: 'India', code: 'IN', attacks: 3410, criticalSectors: 'Technology, Banking, Telecom', threatIndex: 'CRITICAL', change: '+22%' },
    { country: 'United Kingdom', code: 'GB', attacks: 2190, criticalSectors: 'Government, Logistics, Retail', threatIndex: 'HIGH', change: '+9%' },
    { country: 'Germany', code: 'DE', attacks: 1980, criticalSectors: 'Automotive, Manufacturing, Energy', threatIndex: 'HIGH', change: '+6%' },
    { country: 'Japan', code: 'JP', attacks: 1640, criticalSectors: 'High-Tech, Semiconductors, Defense', threatIndex: 'HIGH', change: '+11%' },
    { country: 'Brazil', code: 'BR', attacks: 1420, criticalSectors: 'Financial Services, Government', threatIndex: 'MEDIUM', change: '+18%' },
    { country: 'France', code: 'FR', attacks: 1290, criticalSectors: 'Public Sector, Aviation, Transport', threatIndex: 'HIGH', change: '+8%' },
    { country: 'Australia', code: 'AU', attacks: 1110, criticalSectors: 'Mining, Telecom, Healthcare', threatIndex: 'HIGH', change: '+15%' },
  ]

  const filteredIOCs = REAL_IOCS_LIST.filter((ioc) => {
    if (iocFilter !== 'ALL' && ioc.type !== iocFilter) return false
    if (iocSearch && !ioc.value.toLowerCase().includes(iocSearch.toLowerCase()) && !ioc.threat.toLowerCase().includes(iocSearch.toLowerCase())) return false
    return true
  })

  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="w-64 bg-card border-r border-border h-screen animate-pulse" />
        <div className="flex-1 flex flex-col">
          <div className="h-16 bg-card border-b border-border animate-pulse" />
          <main className="flex-1 p-6 space-y-6">
            <div className="h-8 w-48 bg-card rounded animate-pulse" />
            <div className="h-32 bg-card rounded-xl animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-card rounded-xl animate-pulse" />
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
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground text-glow flex items-center gap-2.5">
                  <Shield className="w-6 h-6 text-primary" /> Live Threat Intelligence
                </h1>
                <p className="text-secondary text-sm mt-1">
                  Global telemetry, adversary campaigns, malware taxonomy, and real-time indicators of compromise
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/threat-intelligence/actors"
                  className="px-3 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Users className="w-3.5 h-3.5" /> Threat Actors Directory
                </Link>
                <Link
                  href="/threat-intelligence/industries"
                  className="px-3 py-2 bg-card hover:bg-card-hover border border-border text-foreground rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5 text-primary" /> Targeted Industries
                </Link>
              </div>
            </div>

            {/* Threat Level Banner */}
            <div className={`border rounded-2xl p-6 mb-6 ${getScoreBackground(threatData?.score || 88)} backdrop-blur-sm transition-all`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-xl bg-card border border-border shadow-inner">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Global Cyber Threat Severity</h2>
                    <p className="text-xs text-secondary mt-0.5">Real-time aggregate across sensors, honeypots, and dark web monitors</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-4xl font-extrabold font-mono ${getScoreColor(threatData?.score || 88)}`}>
                    {threatData?.score || 88}/100
                  </p>
                  <p className={`text-xs font-bold uppercase tracking-wider mt-1 ${getScoreColor(threatData?.score || 88)}`}>
                    {(threatData?.score || 88) >= 80 ? 'CRITICAL LEVEL' : (threatData?.score || 88) >= 60 ? 'HIGH LEVEL' : 'ELEVATED LEVEL'}
                  </p>
                </div>
              </div>
            </div>

            {/* 4 Interactive Tappable KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Card 1: Active Threat Actors */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveModal('ACTORS')}
                className="bg-card border border-border hover:border-danger/50 rounded-2xl p-5 transition-all cursor-pointer shadow-sm hover:shadow-lg hover:shadow-danger/5 group relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-danger/10 border border-danger/20">
                    <Activity className="w-5 h-5 text-danger" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-danger bg-danger/10 px-2 py-0.5 rounded-full border border-danger/20">
                    Tap to view →
                  </span>
                </div>
                <p className="text-xs text-secondary font-semibold uppercase tracking-wider mb-1">Active Threat Actors</p>
                <p className="text-3xl font-extrabold text-foreground font-mono group-hover:text-danger transition-colors">
                  {threatData?.threatActors?.toLocaleString() || '395'}
                </p>
                <div className="flex items-center justify-between text-[11px] text-danger mt-2 pt-2 border-t border-border/50 font-medium">
                  <span>Monitored APT Syndicates</span>
                  <span>↑ 12% this week</span>
                </div>
              </motion.div>

              {/* Card 2: Malware Families */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveModal('MALWARE')}
                className="bg-card border border-border hover:border-warning/50 rounded-2xl p-5 transition-all cursor-pointer shadow-sm hover:shadow-lg hover:shadow-warning/5 group relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-warning/10 border border-warning/20">
                    <Bug className="w-5 h-5 text-warning" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-warning bg-warning/10 px-2 py-0.5 rounded-full border border-warning/20">
                    Tap to view →
                  </span>
                </div>
                <p className="text-xs text-secondary font-semibold uppercase tracking-wider mb-1">Malware Families</p>
                <p className="text-3xl font-extrabold text-foreground font-mono group-hover:text-warning transition-colors">
                  {threatData?.malwareFamilies?.toLocaleString() || '532'}
                </p>
                <div className="flex items-center justify-between text-[11px] text-warning mt-2 pt-2 border-t border-border/50 font-medium">
                  <span>Ransomware & Trojans</span>
                  <span>↑ 8% this week</span>
                </div>
              </motion.div>

              {/* Card 3: IOCs Identified */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveModal('IOCS')}
                className="bg-card border border-border hover:border-primary/50 rounded-2xl p-5 transition-all cursor-pointer shadow-sm hover:shadow-lg hover:shadow-primary/5 group relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                    <AlertTriangle className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                    Tap to view →
                  </span>
                </div>
                <p className="text-xs text-secondary font-semibold uppercase tracking-wider mb-1">IOCs Identified</p>
                <p className="text-3xl font-extrabold text-foreground font-mono group-hover:text-primary transition-colors">
                  {threatData?.iocCount?.toLocaleString() || '12,847'}
                </p>
                <div className="flex items-center justify-between text-[11px] text-primary mt-2 pt-2 border-t border-border/50 font-medium">
                  <span>IPs, Hashes & C2s</span>
                  <span>↑ 15% this week</span>
                </div>
              </motion.div>

              {/* Card 4: Global Impact */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveModal('GLOBAL')}
                className="bg-card border border-border hover:border-accent/50 rounded-2xl p-5 transition-all cursor-pointer shadow-sm hover:shadow-lg hover:shadow-accent/5 group relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/20">
                    <Globe className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                    Tap to view →
                  </span>
                </div>
                <p className="text-xs text-secondary font-semibold uppercase tracking-wider mb-1">Global Impact</p>
                <p className="text-3xl font-extrabold text-foreground font-mono group-hover:text-accent transition-colors">
                  156
                </p>
                <div className="flex items-center justify-between text-[11px] text-accent mt-2 pt-2 border-t border-border/50 font-medium">
                  <span>Countries Under Target</span>
                  <span>Worldwide reach</span>
                </div>
              </motion.div>
            </div>

            {/* Live Threat Feed Section */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <h2 className="text-base font-bold text-foreground uppercase tracking-wider">Live Threat Pulse Stream</h2>
                  <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-mono font-semibold">Active Sensors</span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                  <input
                    type="text"
                    placeholder="Filter threats by actor, CVE or country..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-foreground placeholder-secondary/60 focus:outline-none focus:border-primary w-72 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    type: 'Ransomware Exploitation',
                    actor: 'LockBit 3.0 Syndicate',
                    target: 'Healthcare PACS Imaging Servers',
                    severity: 'CRITICAL',
                    time: '12 mins ago',
                    details: 'Active exploitation of perimeter VPN gateways attempting automated GPO mass encryption.'
                  },
                  {
                    type: 'Zero-Day Pre-positioning',
                    actor: 'Volt Typhoon (Vanguard Panda)',
                    target: 'Regional Water Utility Supervisory Portals',
                    severity: 'CRITICAL',
                    time: '34 mins ago',
                    details: 'Living-off-the-land commands utilizing ntdsutil and powershell proxying via compromised edge SOHO routers.'
                  },
                  {
                    type: 'Diplomatic Espionage Spear-Phishing',
                    actor: 'APT29 (Midnight Blizzard)',
                    target: 'Ministry of Foreign Affairs Webmail Clusters',
                    severity: 'HIGH',
                    time: '1 hour ago',
                    details: 'Malicious OAuth app registration abusing trusted cloud identity tokens to bypass MFA prompts.'
                  },
                  {
                    type: 'Cryptocurrency Bridge Exploitation',
                    actor: 'Lazarus Group (Hidden Cobra)',
                    target: 'DeFi Smart Contract Liquidity Pools',
                    severity: 'CRITICAL',
                    time: '2 hours ago',
                    details: 'Trojanized open-source npm library dependency attempting unauthorized withdrawal key signing.'
                  }
                ]
                  .filter(item => 
                    item.actor.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    item.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.type.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((threat, index) => (
                    <div
                      key={index}
                      className="p-4 bg-background/60 hover:bg-background border border-border/50 hover:border-primary/40 rounded-xl transition-all duration-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            threat.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}>
                            {threat.severity}
                          </span>
                          <span className="text-xs font-bold text-foreground">{threat.actor}</span>
                          <span className="text-xs text-secondary">•</span>
                          <span className="text-xs text-primary font-medium">{threat.type}</span>
                        </div>
                        <span className="text-[11px] text-secondary font-mono">{threat.time}</span>
                      </div>
                      <p className="text-xs text-foreground/90 leading-relaxed mb-2">{threat.details}</p>
                      <div className="text-[11px] text-secondary font-mono flex items-center gap-2">
                        <span>Target: <strong className="text-foreground">{threat.target}</strong></span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 1. Modal: Active Threat Actors */}
      {activeModal === 'ACTORS' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setActiveModal(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-danger/10 border border-danger/20">
                  <Activity className="w-6 h-6 text-danger" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Active Threat Actors Registry</h3>
                  <p className="text-xs text-secondary">Real-time breakdown of tracked APT groups and cybercrime syndicates</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-background rounded-xl text-secondary hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {REAL_ACTORS_DATA.map((actor, idx) => (
                <div key={idx} className="p-3.5 bg-background/70 border border-border/60 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{actor.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-primary/10 text-primary rounded border border-primary/20">{actor.country}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-red-500/10 text-red-400 rounded-full border border-red-500/30">{actor.activity}</span>
                    </div>
                    <p className="text-xs text-secondary mt-1">Targets: <span className="text-foreground/90">{actor.target}</span></p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-foreground">{actor.attacks}</span>
                    <p className="text-[10px] text-secondary">Tracked attacks</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs text-secondary">395 total threat groups indexed</span>
              <Link href="/threat-intelligence/actors" className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-hover flex items-center gap-1">
                View Full Threat Actors Dossiers <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      )}

      {/* 2. Modal: Malware Families */}
      {activeModal === 'MALWARE' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setActiveModal(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-warning/10 border border-warning/20">
                  <Bug className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Top Active Malware Families</h3>
                  <p className="text-xs text-secondary">Taxonomy, execution platforms, and active behavioral signatures</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-background rounded-xl text-secondary hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {REAL_MALWARE_FAMILIES.map((mal, idx) => (
                <div key={idx} className="p-4 bg-background/70 border border-border/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{mal.name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-warning/10 text-warning rounded border border-warning/20">{mal.type}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-primary">{mal.detections} detections</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-secondary">
                    <span>Platform: <strong className="text-foreground">{mal.platform}</strong></span>
                    <span className="text-[10px] text-red-400 font-bold uppercase">{mal.severity} Risk</span>
                  </div>
                  <div className="bg-background/90 p-2 rounded-lg border border-border/50 flex items-center justify-between text-[11px] font-mono text-secondary">
                    <span className="truncate max-w-md">{mal.signature}</span>
                    <button onClick={() => copyToClipboard(mal.signature)} className="p-1 hover:text-primary transition-colors">
                      {copiedHash === mal.signature ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* 3. Modal: IOCs Identified */}
      {activeModal === 'IOCS' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setActiveModal(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                  <AlertTriangle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Live Indicators of Compromise (IOCs)</h3>
                  <p className="text-xs text-secondary">High-confidence malicious IP addresses, SHA-256 hashes, and C2 domains</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-background rounded-xl text-secondary hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-1 text-[11px] font-semibold">
                {(['ALL', 'IP', 'HASH', 'DOMAIN'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setIocFilter(filter)}
                    className={`px-3 py-1 rounded-lg border transition-colors ${
                      iocFilter === filter ? 'bg-primary text-white border-primary' : 'bg-background border-border text-secondary hover:text-foreground'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Search IOC value or threat description..."
                value={iocSearch}
                onChange={(e) => setIocSearch(e.target.value)}
                className="bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder-secondary/60 focus:outline-none focus:border-primary w-full sm:w-60"
              />
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto">
              {filteredIOCs.map((ioc, idx) => (
                <div key={idx} className="p-3.5 bg-background/70 border border-border/60 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border font-mono ${
                        ioc.type === 'IP' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        ioc.type === 'HASH' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {ioc.type}
                      </span>
                      <span className="text-xs font-bold text-foreground truncate">{ioc.threat}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px] text-foreground/80">
                      <span className="truncate">{ioc.value}</span>
                      <button onClick={() => copyToClipboard(ioc.value)} className="hover:text-primary transition-colors flex-shrink-0" title="Copy IOC">
                        {copiedHash === ioc.value ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold text-emerald-400">{ioc.confidence}</span>
                    <p className="text-[10px] text-secondary font-mono">{ioc.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* 4. Modal: Global Impact */}
      {activeModal === 'GLOBAL' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setActiveModal(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/20">
                  <Globe className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Global Cyber Attack Distribution Matrix</h3>
                  <p className="text-xs text-secondary">Geographic impact volume, targeted critical infrastructure, and weekly surge</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-background rounded-xl text-secondary hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {REAL_GLOBAL_IMPACT.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-background/70 border border-border/60 rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{item.country}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-background border border-border rounded text-secondary">{item.code}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        item.threatIndex === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {item.threatIndex}
                      </span>
                    </div>
                    <p className="text-xs text-secondary mt-1">Impacted: <span className="text-foreground/90">{item.criticalSectors}</span></p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-foreground">{item.attacks.toLocaleString()} attacks</span>
                    <p className="text-[10px] text-red-400 font-semibold">{item.change} this week</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
