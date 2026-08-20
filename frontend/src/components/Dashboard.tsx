'use client'

import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import TopCards from './TopCards'
import CriticalAlerts from './CriticalAlerts'
import ThreatIntelligenceSummary from './ThreatIntelligenceSummary'
import RansomwareLive from './RansomwareLive'
import AttackTrendGraph from './AttackTrendGraph'
import LiveCyberThreatNews from './LiveCyberThreatNews'

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(200)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="w-64 bg-card border-r border-border h-screen animate-pulse" />
        <div className="flex-1 flex flex-col">
          <div className="h-16 bg-card border-b border-border animate-pulse" />
          <main className="flex-1 p-6 space-y-6">
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-card rounded-lg animate-pulse" />
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
        <div className="sticky top-0 z-40 bg-background">
          <Navbar />
        </div>
        <main className="flex-1 overflow-auto p-6">
          <TopCards />
          <CriticalAlerts />
          <div className="mt-6">
            <ThreatIntelligenceSummary />
          </div>
          <div className="mt-6">
            <RansomwareLive />
          </div>
          <div className="mt-6">
            <AttackTrendGraph />
          </div>
          <div className="mt-6">
            <LiveCyberThreatNews />
          </div>
        </main>
      </div>
    </div>
  )
}
