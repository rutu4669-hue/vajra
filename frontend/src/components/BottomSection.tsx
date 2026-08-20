'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Newspaper, TrendingUp } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { newsService } from '../services/news.service'

export default function BottomSection() {
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAllNews, setShowAllNews] = useState(false)
  const [showFullChart, setShowFullChart] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await newsService.getNews()
        setNews(data)
      } catch (error) {
        console.error('Error fetching news:', error)
        // Fallback to mock data
        setNews([
          { title: 'Critical CVE-2026-1234 exploited in attacks against healthcare sector', time: '1 hour ago' },
          { title: 'New ransomware variant "DarkVault" discovered targeting financial institutions', time: '2 hours ago' },
          { title: 'State-sponsored APT group targeting critical infrastructure in Europe', time: '3 hours ago' },
          { title: 'Massive data breach exposes 10M user records from major tech company', time: '4 hours ago' },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const attackTrendData = [
    { month: 'Jan', attacks: 850 },
    { month: 'Feb', attacks: 920 },
    { month: 'Mar', attacks: 880 },
    { month: 'Apr', attacks: 1050 },
    { month: 'May', attacks: 1180 },
    { month: 'Jun', attacks: 1247 },
  ]

  if (loading) {
    return (
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Live Cyber Threat News */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-6 hover:border-glow-blue transition-all duration-300 hover:shadow-glow"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Live Cyber Threat News</h2>
          </div>
          <button
            onClick={() => setShowAllNews(!showAllNews)}
            className="text-xs text-primary hover:text-primary-hover"
          >
            {showAllNews ? 'Show Less' : 'See More'}
          </button>
        </div>
        <div className="space-y-3">
          {(showAllNews ? news : news.slice(0, 4)).map((item, index) => (
            <div 
              key={index} 
              className="border-b border-border/50 pb-3 last:border-0 cursor-pointer hover:bg-background/50 transition-colors rounded p-2"
              onClick={() => {
                if (item.url) {
                  window.open(item.url, '_blank', 'noopener,noreferrer')
                }
              }}
            >
              <p className="text-sm text-foreground mb-1 hover:text-primary transition-colors">{item.title}</p>
              <p className="text-xs text-secondary">{item.time || 'Recently'}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Attack Trend Graph */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-xl p-6 hover:border-glow-blue transition-all duration-300 hover:shadow-glow"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold text-foreground">Attack Trend (6 Months)</h2>
          </div>
          <button
            onClick={() => setShowFullChart(!showFullChart)}
            className="text-xs text-primary hover:text-primary-hover"
          >
            {showFullChart ? 'Show Less' : 'See More'}
          </button>
        </div>
        <div className={showFullChart ? "h-64" : "h-32"}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={attackTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={10} />
              <YAxis stroke="#6b7280" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                itemStyle={{ color: '#e5e7eb' }}
              />
              <Area
                type="monotone"
                dataKey="attacks"
                stroke="#3b82f6"
                fill="rgba(59, 130, 246, 0.2)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  )
}
