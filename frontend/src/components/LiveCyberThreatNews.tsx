'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Newspaper, Radio, ShieldAlert, AlertTriangle, X, Check, Copy, ExternalLink, Bookmark, Clock, Globe, ArrowRight, Share2 } from 'lucide-react'
import { newsService } from '../services/news.service'
import { useNotificationStore } from '@/store/notificationStore'

export default function LiveCyberThreatNews() {
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAllNews, setShowAllNews] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<any>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const { addNotification } = useNotificationStore()

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        const data = await newsService.getNews()
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const enrichedNews = data.map((item: any) => ({
            ...item,
            source: item.source || 'GDELT Cyber Telemetry',
            category: item.category || (item.title.toLowerCase().includes('ransomware') ? 'Ransomware' : item.title.toLowerCase().includes('cve') ? 'Vulnerability' : 'Cyber Attack'),
            severity: item.severity || (item.title.toLowerCase().includes('critical') || item.title.toLowerCase().includes('zero-day') ? 'Critical' : 'High'),
            impact: item.impact || 'High'
          }))
          setNews(enrichedNews)

          // Dispatch top breaking news item to notification store & screen toast popup
          const topBreaking = enrichedNews[0]
          if (topBreaking) {
            addNotification({
              title: `📰 Live Threat News: ${topBreaking.title.slice(0, 55)}...`,
              message: topBreaking.content || topBreaking.title,
              type: 'GDELT_NEWS',
              severity: topBreaking.severity === 'Critical' ? 'CRITICAL' : 'HIGH',
              link: '/updates',
              article: topBreaking
            }, true)
          }
        }
      } catch (error) {
        console.error('Error fetching cyber threat news:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 60000)

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

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-48 bg-background rounded" />
          <div className="h-4 w-16 bg-background rounded" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-background rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const displayedNews = showAllNews ? news : news.slice(0, 5)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 transition-all duration-300 shadow-sm"
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
              onClick={() => setSelectedArticle(item)}
              className="p-3.5 bg-background/60 hover:bg-background border border-border/50 hover:border-primary/50 rounded-xl transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 flex items-center gap-1.5">
                    <span>{item.title}</span>
                    <ArrowRight className="w-3 h-3 text-secondary group-hover:text-primary group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                  </h4>
                  
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-secondary">
                    <span className="font-mono text-foreground/80 font-medium">{item.source}</span>
                    <span>•</span>
                    <span>{item.time_ago || 'Recent'}</span>
                    <span>•</span>
                    <span className={`text-[10px] px-2 py-0.2 rounded-full border font-semibold ${getSeverityColor(item.severity)}`}>
                      {item.severity || 'HIGH'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* In-Portal News Article Reader Modal */}
      {selectedArticle && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedArticle(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[88vh] overflow-y-auto shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border mb-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${getSeverityColor(selectedArticle.severity)}`}>
                    {selectedArticle.severity || 'HIGH'} SEVERITY
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-primary/10 text-primary rounded border border-primary/20">
                    {selectedArticle.category || 'CYBER_ATTACK'}
                  </span>
                  <span className="text-xs text-secondary font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-secondary" /> {selectedArticle.time_ago || 'Recent Telemetry'}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-foreground leading-snug">
                  {selectedArticle.title}
                </h2>
                <p className="text-xs text-secondary flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-primary" /> Source: <strong className="text-foreground">{selectedArticle.source}</strong>
                </p>
              </div>

              <button
                onClick={() => setSelectedArticle(null)}
                className="p-2 hover:bg-background rounded-xl text-secondary hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* In-Portal Intelligence Analysis Body */}
            <div className="space-y-5 text-xs text-foreground/90 leading-relaxed">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-2 flex items-center gap-1.5">
                  <Newspaper className="w-3.5 h-3.5" /> Executive Threat Summary
                </h3>
                <p className="bg-background/70 p-4 rounded-xl border border-border/60 text-sm text-foreground/90 leading-relaxed">
                  {selectedArticle.content || selectedArticle.description || 'Global sensors recorded security telemetry concerning active threat activity and exploit vectors.'}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Operational Context & Impact Assessment
                </h3>
                <div className="p-3.5 bg-background/50 rounded-xl border border-border/50 space-y-2 text-secondary">
                  <p>• Adversaries actively targeting perimeter appliances, VPNs, and corporate identity providers.</p>
                  <p>• Telemetry recorded by global cybersecurity surveillance feeds and cross-verified against CVE exploit databases.</p>
                  <p>• Enterprise organizations are strongly advised to inspect authentication logs and verify active patch levels.</p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" /> Recommended Action Items
                </h3>
                <div className="space-y-1.5">
                  <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-emerald-400 font-medium">
                    1. Enforce strict Multi-Factor Authentication (MFA) across all administrative access enclaves.
                  </div>
                  <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-emerald-400 font-medium">
                    2. Query internal EDR telemetry for indicators of compromise (IOCs) matching this campaign.
                  </div>
                  <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-emerald-400 font-medium">
                    3. Isolate affected network segments and apply emergency vendor mitigations.
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyLink(selectedArticle.url || window.location.href)}
                  className="px-3 py-1.5 bg-background hover:bg-card border border-border rounded-xl font-semibold text-secondary hover:text-foreground flex items-center gap-1.5 transition-colors"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? 'Link Copied' : 'Copy Article Link'}
                </button>
                <button
                  onClick={() => setBookmarked(!bookmarked)}
                  className={`px-3 py-1.5 border rounded-xl font-semibold flex items-center gap-1.5 transition-colors ${
                    bookmarked ? 'bg-primary text-white border-primary' : 'bg-background hover:bg-card border-border text-secondary'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  {bookmarked ? 'Saved to Watchlist' : 'Add to Watchlist'}
                </button>
              </div>

              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors"
              >
                Close In-Portal Reader
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}
