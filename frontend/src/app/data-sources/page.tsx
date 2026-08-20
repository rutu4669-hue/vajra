'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { Database, Activity, Globe, Shield, TrendingUp } from 'lucide-react'

export default function DataSourcesPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [feeds, setFeeds] = useState<any[]>([])

  useEffect(() => {
    // Simulate live data sources - reduced for performance
    const dataSources = [
      { name: 'Ransomware.live', status: 'Active', lastUpdate: '2 min ago', dataPoints: 1247 },
      { name: 'CVE Database', status: 'Active', lastUpdate: '5 min ago', dataPoints: 3842 },
      { name: 'Threat Intelligence API', status: 'Active', lastUpdate: '1 min ago', dataPoints: 892 },
      { name: 'Dark Web Monitoring', status: 'Active', lastUpdate: '3 min ago', dataPoints: 156 },
      { name: 'Phishing Feed', status: 'Active', lastUpdate: '4 min ago', dataPoints: 2341 },
      { name: 'Malware Analysis', status: 'Active', lastUpdate: '6 min ago', dataPoints: 567 },
      { name: 'IP Reputation', status: 'Active', lastUpdate: '2 min ago', dataPoints: 8923 },
      { name: 'Domain Monitoring', status: 'Active', lastUpdate: '7 min ago', dataPoints: 4521 },
      { name: 'Social Media Intel', status: 'Active', lastUpdate: '8 min ago', dataPoints: 234 },
      { name: 'Government Alerts', status: 'Active', lastUpdate: '10 min ago', dataPoints: 89 },
      { name: 'Industry Reports', status: 'Active', lastUpdate: '15 min ago', dataPoints: 156 },
      { name: 'Security Blogs', status: 'Active', lastUpdate: '20 min ago', dataPoints: 423 },
    ]
    setFeeds(dataSources)
  }, [])

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
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
              <h1 className="text-2xl font-bold text-foreground text-glow">Data Sources</h1>
              <p className="text-secondary text-sm mt-1">Live threat intelligence feeds and data sources</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-xl p-4 card-glow">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-5 h-5 text-primary" />
                  <span className="text-sm text-secondary">Total Sources</span>
                </div>
                <div className="text-2xl font-bold text-foreground text-glow">{feeds.length}</div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 card-glow-green">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-success" />
                  <span className="text-sm text-secondary">Active Feeds</span>
                </div>
                <div className="text-2xl font-bold text-success text-glow-green">{feeds.length}</div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 card-glow-cyan">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  <span className="text-sm text-secondary">Data Points</span>
                </div>
                <div className="text-2xl font-bold text-accent text-glow-cyan">
                  {feeds.reduce((sum, feed) => sum + feed.dataPoints, 0).toLocaleString()}
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 card-glow-red">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5 text-danger" />
                  <span className="text-sm text-secondary">Global Coverage</span>
                </div>
                <div className="text-2xl font-bold text-danger text-glow-red">150+</div>
              </div>
            </div>

            {/* Data Sources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {feeds.map((feed, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card border border-border rounded-xl p-4 hover:border-glow-blue transition-all duration-300 hover:shadow-glow cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">{feed.name}</h3>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${feed.status === 'Active' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                      {feed.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-secondary">Last Update</span>
                      <span className="text-xs text-foreground">{feed.lastUpdate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-secondary">Data Points</span>
                      <span className="text-xs text-foreground font-medium">{feed.dataPoints.toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Info */}
            <div className="bg-card border border-border rounded-xl p-6 hover:border-glow-blue transition-all duration-300 hover:shadow-glow">
              <h2 className="text-lg font-semibold text-foreground mb-4">About Data Sources</h2>
              <p className="text-sm text-secondary mb-4">
                Our platform aggregates threat intelligence from over 23+ live data sources, providing comprehensive coverage of emerging threats, vulnerabilities, and attack patterns. Each feed is continuously monitored and updated in real-time.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-2">Feed Types</h3>
                  <ul className="text-xs text-secondary space-y-1">
                    <li>• Ransomware tracking</li>
                    <li>• Vulnerability databases</li>
                    <li>• Dark web monitoring</li>
                    <li>• Phishing detection</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-2">Update Frequency</h3>
                  <ul className="text-xs text-secondary space-y-1">
                    <li>• Real-time (every 30s)</li>
                    <li>• Near real-time (every 5 min)</li>
                    <li>• Hourly updates</li>
                    <li>• Daily summaries</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-2">Data Quality</h3>
                  <ul className="text-xs text-secondary space-y-1">
                    <li>• Verified sources only</li>
                    <li>• Automated validation</li>
                    <li>• Manual review</li>
                    <li>• Confidence scoring</li>
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
