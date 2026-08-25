'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Newspaper, ExternalLink, Globe, ShieldAlert, Radio } from 'lucide-react'
import { newsService } from '../services/news.service'
import { useNotificationStore } from '@/store/notificationStore'

export default function LiveCyberThreatNews() {
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAllNews, setShowAllNews] = useState(false)
  const { addNotification } = useNotificationStore()

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        const data = await newsService.getNews()
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const enrichedNews = data.map((item: any) => ({
            ...item,
            source: item.source || 'GDELT Cyber Sensor',
            category: item.category || (item.title.toLowerCase().includes('ransomware') ? 'Ransomware' : item.title.toLowerCase().includes('cve') ? 'Vulnerability' : 'Cyber Attack'),
            severity: item.severity || (item.title.toLowerCase().includes('critical') || item.title.toLowerCase().includes('zero-day') ? 'Critical' : 'High'),
            impact: item.impact || 'High'
          }))
          setNews(enrichedNews)

          // Dispatch breaking critical news to notification store
          const topCritical = enrichedNews.find((n: any) => n.severity === 'Critical' || n.category === 'Ransomware')
          if (topCritical) {
            addNotification({
              title: `📰 GDELT News: ${topCritical.title.slice(0, 55)}...`,
              message: topCritical.content || topCritical.title,
              type: 'GDELT_NEWS',
              severity: 'HIGH',
              link: topCritical.url
            })
          }
        }
      } catch (error) {
        console.error('Error fetching cyber threat news:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 45000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [addNotification])

  const getSeverityColor = (severity: string = 'High') => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30'
      case 'high': return 'text-amber-400 bg-amber-500/10 border-amber-500/30'
      case 'medium': return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
      default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    }
  }

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-48 bg-background rounded" />
          <div className="h-4 w-16 bg-background rounded" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-background rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  const displayedNews = showAllNews ? news : news.slice(0, 5)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-all duration-300 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-primary" />
          <h2 className="text-base font-bold text-foreground uppercase tracking-wider">
            Live Cyber Threat News
          </h2>
          <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-mono flex items-center gap-1 border border-primary/20">
            <Radio className="w-2.5 h-2.5 text-primary animate-pulse" /> GDELT Ingest
          </span>
        </div>
        <button
          onClick={() => setShowAllNews(!showAllNews)}
          className="text-xs text-primary hover:underline font-semibold"
        >
          {showAllNews ? 'Show Less' : `View All (${news.length})`}
        </button>
      </div>

      <div className="space-y-2.5">
        {displayedNews.map((item, index) => (
          <div
            key={item.id || index}
            className="p-3 bg-background/60 hover:bg-background border border-border/50 hover:border-primary/40 rounded-xl transition-all duration-200 group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <a
                  href={item.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-foreground hover:text-primary transition-colors line-clamp-1 group-hover:underline flex items-center gap-1"
                >
                  <span>{item.title}</span>
                  <ExternalLink className="w-3 h-3 text-secondary group-hover:text-primary flex-shrink-0" />
                </a>
                
                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-secondary">
                  <span className="font-mono text-foreground/80">{item.source}</span>
                  <span>•</span>
                  <span>{item.time_ago || 'Recent'}</span>
                  <span>•</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${getSeverityColor(item.severity)}`}>
                    {item.severity || 'HIGH'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
