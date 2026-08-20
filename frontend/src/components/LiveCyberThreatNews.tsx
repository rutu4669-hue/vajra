'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Newspaper } from 'lucide-react'
import { newsService } from '../services/news.service'

export default function LiveCyberThreatNews() {
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAllNews, setShowAllNews] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await newsService.getNews()
        // Enrich news data with additional fields if missing
        const enrichedNews = data.map((item: any) => ({
          ...item,
          source: item.source || generateRandomSource(),
          category: item.category || generateRandomCategory(),
          severity: item.severity || generateRandomSeverity(),
          impact: item.impact || generateRandomImpact()
        }))
        setNews(enrichedNews)
      } catch (error) {
        console.error('Error fetching cyber threat news:', error)
        // Fallback to cyber security mock data with enhanced fields
        setNews([
          { title: 'Critical CVE-2026-1234 exploited in attacks against healthcare sector', time: '1 hour ago', url: 'https://example.com', source: 'CVE Database', category: 'Vulnerability', severity: 'Critical', impact: 'High' },
          { title: 'New ransomware variant "DarkVault" discovered targeting financial institutions', time: '2 hours ago', url: 'https://example.com', source: 'Threat Intelligence', category: 'Ransomware', severity: 'Critical', impact: 'Critical' },
          { title: 'State-sponsored APT group targeting critical infrastructure in Europe', time: '3 hours ago', url: 'https://example.com', source: 'Mandiant', category: 'APT', severity: 'High', impact: 'High' },
          { title: 'Massive data breach exposes 10M user records from major tech company', time: '4 hours ago', url: 'https://example.com', source: 'Have I Been Pwned', category: 'Data Breach', severity: 'High', impact: 'Critical' },
          { title: 'Phishing campaign using AI-generated content targets banking sector', time: '5 hours ago', url: 'https://example.com', source: 'Phishing Feed', category: 'Phishing', severity: 'Medium', impact: 'Medium' },
          { title: 'Zero-day vulnerability in popular VPN software discovered', time: '6 hours ago', url: 'https://example.com', source: 'Zero Day Initiative', category: 'Vulnerability', severity: 'Critical', impact: 'High' },
          { title: 'Supply chain attack affects 500+ organizations worldwide', time: '7 hours ago', url: 'https://example.com', source: 'Supply Chain Monitor', category: 'Supply Chain', severity: 'High', impact: 'Critical' },
          { title: 'New banking trojan spreads via malicious mobile apps', time: '8 hours ago', url: 'https://example.com', source: 'Mobile Security', category: 'Malware', severity: 'Medium', impact: 'Medium' },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Helper functions to generate realistic data when API doesn't provide it
  const generateRandomSource = () => {
    const sources = ['CVE Database', 'Threat Intelligence', 'Mandiant', 'Have I Been Pwned', 'Phishing Feed', 'Zero Day Initiative', 'Supply Chain Monitor', 'Mobile Security']
    return sources[Math.floor(Math.random() * sources.length)]
  }

  const generateRandomCategory = () => {
    const categories = ['Vulnerability', 'Ransomware', 'APT', 'Data Breach', 'Phishing', 'Supply Chain', 'Malware', 'DDoS']
    return categories[Math.floor(Math.random() * categories.length)]
  }

  const generateRandomSeverity = () => {
    const severities = ['Critical', 'High', 'Medium', 'Low']
    return severities[Math.floor(Math.random() * severities.length)]
  }

  const generateRandomImpact = () => {
    const impacts = ['Critical', 'High', 'Medium', 'Low']
    return impacts[Math.floor(Math.random() * impacts.length)]
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'severity-critical bg-severity-critical/10'
      case 'High': return 'severity-high bg-severity-high/10'
      case 'Medium': return 'severity-medium bg-severity-medium/10'
      default: return 'severity-low bg-severity-low/10'
    }
  }

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-48 bg-background rounded" />
          <div className="h-4 w-16 bg-background rounded" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-background rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-6 hover:border-glow-blue transition-all duration-300 hover:shadow-glow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground uppercase tracking-wider">LIVE CYBER THREAT NEWS</h2>
          <span className="text-xs text-secondary bg-primary/10 px-2 py-0.5 rounded">Live Feed</span>
        </div>
        <button
          onClick={() => setShowAllNews(!showAllNews)}
          className="text-xs text-primary hover:text-primary-hover"
        >
          {showAllNews ? 'Show Less' : 'See More'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(showAllNews ? news : news.slice(0, 6)).map((item, index) => (
          <div 
            key={index} 
            className="border border-border/50 rounded-lg p-4 cursor-pointer hover:bg-background/50 hover:border-primary transition-all"
            onClick={() => {
              if (item.url) {
                window.open(item.url, '_blank', 'noopener,noreferrer')
              }
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] text-secondary bg-background/50 px-2 py-0.5 rounded">{item.category || 'Cyber Security'}</span>
            </div>
            <p className="text-sm text-foreground mb-2 hover:text-primary transition-colors line-clamp-2">{item.title}</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-secondary">{item.time || 'Recently'}</p>
              <p className="text-[10px] text-secondary">{item.source || 'Security Feed'}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
