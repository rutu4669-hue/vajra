'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Activity, AlertTriangle, Search, RefreshCw, Clock, Globe, Bug } from 'lucide-react'
import { threatService } from '@/services/threat.service'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

export default function ThreatIntelligencePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(200)
  const [mounted, setMounted] = useState(false)
  const [threatData, setThreatData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await threatService.getIntelligence()
        setThreatData(data)
        setLastUpdated(new Date())
      } catch (error) {
        console.error('Error fetching threat intelligence:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()

    // Refresh every 30 seconds for live data
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setLoading(true)
    const fetchData = async () => {
      try {
        const data = await threatService.getIntelligence()
        setThreatData(data)
        setLastUpdated(new Date())
      } catch (error) {
        console.error('Error fetching threat intelligence:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'severity-critical'
    if (score >= 60) return 'severity-high'
    if (score >= 40) return 'severity-medium'
    return 'severity-low'
  }

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-severity-critical/10 border-severity-critical/20'
    if (score >= 60) return 'bg-severity-high/10 border-severity-high/20'
    if (score >= 40) return 'bg-severity-medium/10 border-severity-medium/20'
    return 'bg-severity-low/10 border-severity-low/20'
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="w-64 bg-card border-r border-border h-screen animate-pulse" />
        <div className="flex-1 flex flex-col">
          <div className="h-16 bg-card border-b border-border animate-pulse" />
          <main className="flex-1 p-6 space-y-6">
            <div className="h-8 w-48 bg-card rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-card rounded-xl animate-pulse" />
              ))}
            </div>
            <div className="h-64 bg-card rounded-xl animate-pulse" />
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground text-glow">Live Threat Intelligence</h1>
                <p className="text-secondary text-sm mt-1">Real-time cybersecurity threat monitoring and analysis</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-secondary">
                  <Clock className="w-4 h-4" />
                  <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Threat Score Card */}
        <div className={`bg-card border rounded-xl p-6 mb-6 ${getScoreBackground(threatData?.score || 88)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-lg ${getScoreBackground(threatData?.score || 88).split(' ')[1]}`}>
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Overall Threat Level</h2>
                <p className="text-sm text-secondary">Based on recent threat activity</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-5xl font-bold ${getScoreColor(threatData?.score || 88)}`}>
                {threatData?.score || 88}
              </p>
              <p className={`text-sm font-medium ${getScoreColor(threatData?.score || 88)}`}>
                {threatData?.score >= 80 ? 'CRITICAL' : threatData?.score >= 60 ? 'HIGH' : threatData?.score >= 40 ? 'MEDIUM' : 'LOW'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-danger/10">
                <Activity className="w-5 h-5 text-danger" />
              </div>
              <span className="text-sm text-secondary">Active Threat Actors</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{threatData?.threatActors?.toLocaleString() || '278'}</p>
            <p className="text-xs text-danger mt-1">↑ 12% this week</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Bug className="w-5 h-5 text-warning" />
              </div>
              <span className="text-sm text-secondary">Malware Families</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{threatData?.malwareFamilies?.toLocaleString() || '532'}</p>
            <p className="text-xs text-warning mt-1">↑ 8% this week</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <AlertTriangle className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-secondary">IOCs Identified</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{threatData?.iocCount?.toLocaleString() || '12,847'}</p>
            <p className="text-xs text-primary mt-1">↑ 15% this week</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Globe className="w-5 h-5 text-accent" />
              </div>
              <span className="text-sm text-secondary">Global Impact</span>
            </div>
            <p className="text-3xl font-bold text-foreground">156</p>
            <p className="text-xs text-accent mt-1">Countries affected</p>
          </div>
        </div>

        {/* Live Feed Section */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Live Threat Feed</h2>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
              <input
                type="text"
                placeholder="Search threats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder-secondary focus:outline-none focus:border-primary w-64"
              />
            </div>
          </div>

          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 p-4 bg-background/50 rounded-lg border border-border/50"
            >
              <div className="w-2 h-2 bg-danger rounded-full animate-pulse" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">New Ransomware Variant Detected</span>
                  <span className="text-xs text-secondary">2 min ago</span>
                </div>
                <p className="text-xs text-secondary">Critical ransomware strain targeting healthcare sector in North America</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-4 p-4 bg-background/50 rounded-lg border border-border/50"
            >
              <div className="w-2 h-2 bg-warning rounded-full animate-pulse" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">APT Group Activity Spike</span>
                  <span className="text-xs text-secondary">15 min ago</span>
                </div>
                <p className="text-xs text-secondary">Increased activity from state-sponsored actors targeting critical infrastructure</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4 p-4 bg-background/50 rounded-lg border border-border/50"
            >
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">Zero-Day Vulnerability Disclosure</span>
                  <span className="text-xs text-secondary">32 min ago</span>
                </div>
                <p className="text-xs text-secondary">New critical vulnerability in enterprise software being exploited in the wild</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4 p-4 bg-background/50 rounded-lg border border-border/50"
            >
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">Phishing Campaign Surge</span>
                  <span className="text-xs text-secondary">1 hour ago</span>
                </div>
                <p className="text-xs text-secondary">Large-scale phishing operation targeting financial institutions globally</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>
)
}
