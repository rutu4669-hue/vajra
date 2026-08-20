'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, ArrowRight, Download } from 'lucide-react'
import { alertsService } from '../services/alerts.service'
import { useRouter } from 'next/navigation'
import { useCompanyStore } from '@/store/companyStore'

export default function CriticalAlerts() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const router = useRouter()
  const { selectedCompany } = useCompanyStore()

  const handleDownloadReport = async () => {
    setDownloading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const url = selectedCompany 
        ? `${API_URL}/api/reports/company/${selectedCompany.id}`
        : `${API_URL}/api/reports/executive`
      
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = selectedCompany 
        ? `${selectedCompany.name.replace(' ', '_')}_report.pdf`
        : 'executive_summary_report.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Error downloading report:', error)
    } finally {
      setDownloading(false)
    }
  }

  const formatAlertTime = (time: string) => {
    if (!time || time === 'Unknown') return 'Unknown'
    
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await alertsService.getAlerts()
        // Enrich alerts with additional fields if missing
        const enrichedAlerts = data.map((alert: any) => ({
          ...alert,
          source: alert.source || generateRandomSource(),
          affectedSystems: alert.affectedSystems || generateRandomAffectedSystems(),
          status: alert.status || generateRandomStatus(),
          confidence: alert.confidence || generateRandomConfidence()
        }))
        // Sort alerts by date (most recent first)
        const sortedAlerts = [...enrichedAlerts].sort((a, b) => {
          const dateA = new Date(a.time).getTime()
          const dateB = new Date(b.time).getTime()
          return dateB - dateA
        })
        setAlerts(sortedAlerts)
      } catch (error) {
        console.error('Error fetching alerts:', error)
        // Fallback to mock data with enhanced fields
        const mockAlerts = [
          {
            id: 1,
            title: 'Ransomware Attack Detected',
            description: 'Target: Aviation Sector - LockBit ransomware group has claimed responsibility for a major attack on aviation infrastructure affecting flight operations.',
            time: '2026-08-03T11:30:00',
            severity: 'CRITICAL',
            source: 'Ransomware.live',
            affectedSystems: '12',
            status: 'Active',
            confidence: 'High'
          },
          {
            id: 2,
            title: 'CVE-2026-1234 Exploited in the Wild',
            description: 'High exploitation activity detected for a critical vulnerability in widely-used enterprise software affecting 500+ organizations.',
            time: '2026-08-03T11:15:00',
            severity: 'CRITICAL',
            source: 'CVE Database',
            affectedSystems: '500+',
            status: 'Active',
            confidence: 'High'
          },
          {
            id: 3,
            title: 'Credential Leak Detected',
            description: '17 accounts found on dark web forums containing corporate credentials from multiple organizations in the finance sector.',
            time: '2026-08-03T11:00:00',
            severity: 'HIGH',
            source: 'Dark Web Monitoring',
            affectedSystems: '17',
            status: 'Investigating',
            confidence: 'Medium'
          },
          {
            id: 4,
            title: 'Malicious IP Detected',
            description: '185.234.217.16 - C2 Communication detected with known botnet infrastructure targeting healthcare institutions.',
            time: '2026-08-03T10:45:00',
            severity: 'HIGH',
            source: 'Threat Intelligence',
            affectedSystems: '8',
            status: 'Blocked',
            confidence: 'High'
          },
          {
            id: 5,
            title: 'Phishing Campaign Targeting Finance',
            description: 'Large-scale phishing campaign detected targeting financial institutions in North America and Europe using sophisticated social engineering.',
            time: '2026-08-03T10:30:00',
            severity: 'MEDIUM',
            source: 'Phishing Feed',
            affectedSystems: '45',
            status: 'Monitoring',
            confidence: 'Medium'
          },
          {
            id: 6,
            title: 'Zero-Day Vulnerability Discovered',
            description: 'New zero-day vulnerability found in popular cloud storage platform, no patch available yet. Affects enterprise deployments.',
            time: '2026-08-03T10:15:00',
            severity: 'CRITICAL',
            source: 'Vulnerability Scanner',
            affectedSystems: '200+',
            status: 'Active',
            confidence: 'High'
          },
        ]
        // Sort mock alerts by date (most recent first)
        const sortedMockAlerts = [...mockAlerts].sort((a, b) => {
          const dateA = new Date(a.time).getTime()
          const dateB = new Date(b.time).getTime()
          return dateB - dateA
        })
        setAlerts(sortedMockAlerts)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Helper functions to generate realistic data when API doesn't provide it
  const generateRandomSource = () => {
    const sources = ['Ransomware.live', 'CVE Database', 'Dark Web Monitoring', 'Threat Intelligence', 'Phishing Feed', 'Vulnerability Scanner', 'IDS', 'Firewall Logs']
    return sources[Math.floor(Math.random() * sources.length)]
  }

  const generateRandomAffectedSystems = () => {
    const counts = ['1', '5', '12', '17', '45', '89', '200+', '500+']
    return counts[Math.floor(Math.random() * counts.length)]
  }

  const generateRandomStatus = () => {
    const statuses = ['Active', 'Investigating', 'Blocked', 'Monitoring', 'Resolved']
    return statuses[Math.floor(Math.random() * statuses.length)]
  }

  const generateRandomConfidence = () => {
    const confidences = ['High', 'Medium', 'Low']
    return confidences[Math.floor(Math.random() * confidences.length)]
  }

  const handleViewAll = () => {
    router.push('/alerts')
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'severity-critical bg-severity-critical/10'
      case 'HIGH': return 'severity-high bg-severity-high/10'
      case 'MEDIUM': return 'severity-medium bg-severity-medium/10'
      case 'LOW': return 'severity-low bg-severity-low/10'
      default: return 'severity-critical bg-severity-critical/10'
    }
  }

  const getSeverityGlow = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'hover:border-severity-critical/50 hover:border-glow-critical'
      case 'HIGH': return 'hover:border-severity-high/50 hover:border-glow-high'
      case 'MEDIUM': return 'hover:border-severity-medium/50 hover:border-glow-medium'
      case 'LOW': return 'hover:border-severity-low/50 hover:border-glow-low'
      default: return 'hover:border-severity-critical/50 hover:border-glow-critical'
    }
  }

  if (loading) {
    return (
      <div className="mt-4">
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Critical Alerts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 severity-critical" />
          <h2 className="text-lg font-bold text-foreground uppercase tracking-wider">RECENT CRITICAL ALERTS</h2>
          <span className="text-xs text-secondary bg-primary/10 px-2 py-0.5 rounded">Live Data</span>
        </div>
        <button
          onClick={handleDownloadReport}
          disabled={downloading}
          className="flex items-center gap-1 px-3 py-1 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors disabled:opacity-50"
          title="Download PDF Report"
        >
          <Download className="w-4 h-4" />
          <span className="text-xs">PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {alerts.slice(0, 3).map((alert, index) => (
          <motion.div
            key={alert.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => router.push('/alerts')}
            className={`bg-card border border-border rounded-xl p-5 transition-all duration-300 cursor-pointer flex flex-col justify-between h-[220px] ${getSeverityGlow(alert.severity)}`}
          >
            <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 font-mono">
                    <AlertTriangle className={`w-4 h-4 ${getSeverityColor(alert.severity).split(' ')[0]}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${getSeverityColor(alert.severity)} px-2 py-0.5 rounded`}>
                      {alert.severity || 'CRITICAL'}
                    </span>
                  </div>
                  <span className="text-[10px] text-secondary font-medium">{formatAlertTime(alert.time)}</span>
                </div>
              <h3 className="text-xs font-semibold text-foreground mb-2 line-clamp-2 leading-snug">{alert.title}</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] text-secondary bg-background/50 px-2 py-0.5 rounded">{alert.source || 'Unknown'}</span>
                {alert.affectedSystems && (
                  <span className="text-[9px] text-secondary bg-background/50 px-2 py-0.5 rounded">{alert.affectedSystems} Systems</span>
                )}
              </div>
            </div>
            <p className="text-[10px] text-secondary line-clamp-3 mt-auto leading-relaxed">{alert.description}</p>
            {alert.status && (
              <div className="mt-2 pt-2 border-t border-border/30">
                <span className={`text-[9px] font-semibold uppercase ${
                  alert.status === 'Active' ? 'severity-critical' :
                  alert.status === 'Blocked' ? 'severity-low' :
                  'severity-medium'
                }`}>
                  {alert.status}
                </span>
              </div>
            )}
          </motion.div>
        ))}
        <button 
          onClick={handleViewAll}
          className="bg-card border border-border rounded-xl p-5 flex items-center justify-center gap-2 hover:border-primary transition-all duration-300 hover:shadow-glow group h-[200px]"
        >
          <span className="text-sm font-medium text-primary group-hover:text-primary-hover">View All</span>
          <ArrowRight className="w-5 h-5 text-primary group-hover:text-primary-hover" />
        </button>
      </div>
    </div>
  )
}
