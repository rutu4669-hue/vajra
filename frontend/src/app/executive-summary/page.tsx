'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

export default function ExecutiveSummaryPage() {
  const [mounted, setMounted] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(200)

  useEffect(() => {
    setMounted(true)
  }, [])

  const executiveSummary = [
    { label: 'Overall Risk Level', value: 'HIGH', color: 'severity-high', icon: AlertTriangle },
    { label: 'Active Threats', value: '342', color: 'severity-critical', icon: TrendingUp },
    { label: 'Resolved Incidents', value: '1,024', color: 'severity-low', icon: CheckCircle },
    { label: 'Pending Analysis', value: '89', color: 'severity-medium', icon: Clock },
  ]

  const detailedMetrics = [
    { category: 'Security Posture', items: [
      { label: 'Overall Security Score', value: '78/100', trend: '+5%', status: 'good' },
      { label: 'Vulnerability Response Time', value: '2.4 hours', trend: '-12%', status: 'good' },
      { label: 'Incident Response Time', value: '1.8 hours', trend: '-8%', status: 'good' },
    ]},
    { category: 'Threat Landscape', items: [
      { label: 'Critical Vulnerabilities', value: '17', trend: '+3', status: 'warning' },
      { label: 'Active Threat Actors', value: '278', trend: '+12%', status: 'warning' },
      { label: 'New Malware Variants', value: '45', trend: '+18%', status: 'danger' },
    ]},
    { category: 'Operational Metrics', items: [
      { label: 'Alerts Processed', value: '12,847', trend: '+22%', status: 'good' },
      { label: 'False Positive Rate', value: '3.2%', trend: '-5%', status: 'good' },
      { label: 'System Uptime', value: '99.9%', trend: '+0.1%', status: 'good' },
    ]},
  ]

  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="w-64 bg-card border-r border-border h-screen animate-pulse" />
        <div className="flex-1 flex flex-col">
          <div className="h-16 bg-card border-b border-border animate-pulse" />
          <main className="flex-1 p-6 space-y-6">
            <div className="h-24 bg-card rounded-lg animate-pulse" />
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-card rounded-lg animate-pulse" />
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-success" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Executive Summary</h1>
                <p className="text-sm text-secondary">Comprehensive security overview and risk assessment</p>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {executiveSummary.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border border-border rounded-xl p-6 hover:border-glow-blue transition-all duration-300 hover:shadow-glow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${item.color.replace('text-', 'bg-')}/10`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <p className="text-sm text-secondary">{item.label}</p>
                  </div>
                  <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Detailed Metrics */}
            {detailedMetrics.map((category, categoryIndex) => (
              <motion.div
                key={categoryIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + categoryIndex * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 hover:border-glow-blue transition-all duration-300 hover:shadow-glow"
              >
                <h2 className="text-lg font-semibold text-foreground mb-4">{category.category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="bg-background rounded-lg p-4">
                      <p className="text-sm text-secondary mb-2">{item.label}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-bold text-foreground">{item.value}</p>
                        <span className={`text-xs font-medium ${
                          item.status === 'good' ? 'text-success' : 
                          item.status === 'warning' ? 'text-warning' : 'text-danger'
                        }`}>
                          {item.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}


            {/* Summary Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-card border border-border rounded-xl p-6 hover:border-glow-blue transition-all duration-300 hover:shadow-glow"
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">Executive Summary</h2>
              <div className="space-y-4 text-sm text-secondary">
                <p>
                  The organization&apos;s security posture remains strong with an overall security score of 78/100. 
                  Response times have improved significantly with vulnerability response time at 2.4 hours 
                  and incident response time at 1.8 hours. The system maintains 99.9% uptime.
                </p>
                <p>
                  However, the threat landscape continues to evolve with 17 critical vulnerabilities requiring 
                  immediate attention and 278 active threat actors monitored. New malware variants have increased 
                  by 18% compared to the previous period, indicating heightened threat activity.
                </p>
                <p>
                  Operational metrics show strong performance with 12,847 alerts processed and a false positive 
                  rate of only 3.2%. The security team has resolved 1,024 incidents with 89 pending analysis.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
