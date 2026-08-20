'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import RansomwareLive from '@/components/RansomwareLive'
import { ransomwareService } from '@/services/ransomware.service'

export default function RansomwarePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(200)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await ransomwareService.getStats()
        setStats(data)
      } catch (error) {
        console.error('Error fetching ransomware stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground text-glow">Ransomware Threat Intelligence</h1>
              <p className="text-secondary text-sm mt-1">Real-time ransomware attack monitoring and analysis</p>
            </div>

            {/* Stats Cards */}
            {!loading && stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-card border border-border rounded-xl p-4 card-glow-cyan">
                  <div className="text-2xl font-bold text-accent text-glow-cyan">{stats.groupsCount}</div>
                  <div className="text-xs text-secondary mt-1">Groups</div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 card-glow">
                  <div className="text-2xl font-bold text-foreground text-glow">{stats.overallVictims?.toLocaleString()}</div>
                  <div className="text-xs text-secondary mt-1">Overall Victims</div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 card-glow-red">
                  <div className="text-2xl font-bold text-danger text-glow-red">{stats.victimsThisYear?.toLocaleString()}</div>
                  <div className="flex items-center justify-between text-xs text-secondary mt-1">
                    <span>Victims This Year</span>
                    <span className="text-danger font-medium text-[10px]">{stats.victimsThisYearTrend}</span>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 card-glow-green">
                  <div className="text-2xl font-bold text-success text-glow-green">{stats.victimsThisMonth?.toLocaleString()}</div>
                  <div className="flex items-center justify-between text-xs text-secondary mt-1">
                    <span>Victims This Month</span>
                    <span className="text-success font-medium text-[10px]">{stats.victimsThisMonthTrend}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Ransomware Live Feed */}
            <RansomwareLive />

            {/* Additional Info */}
            <div className="bg-card border border-border rounded-xl p-6 hover:border-glow-blue transition-all duration-300 hover:shadow-glow">
              <h2 className="text-lg font-semibold text-foreground mb-4">About Ransomware.live</h2>
              <p className="text-sm text-secondary mb-4">
                Ransomware.live tracks and monitors ransomware groups&apos; victims and their activity. 
                This dashboard provides simulated threat intelligence data that mirrors the types of 
                information available from ransomware.live, including attack patterns, target industries, 
                and geographic distribution.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-2">Key Features</h3>
                  <ul className="text-xs text-secondary space-y-1">
                    <li>• Real-time attack monitoring</li>
                    <li>• Ransomware group tracking</li>
                    <li>• Target industry analysis</li>
                    <li>• Geographic threat distribution</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-2">Data Sources</h3>
                  <ul className="text-xs text-secondary space-y-1">
                    <li>• Dark web monitoring</li>
                    <li>• Victim leak sites</li>
                    <li>• Security research reports</li>
                    <li>• Threat intelligence feeds</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
