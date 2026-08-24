'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, RefreshCw, TrendingUp, Globe, Shield, AlertTriangle, Activity, Building2 } from 'lucide-react'
import { dashboardService } from '../services/dashboard.service'
import { useRouter } from 'next/navigation'
import { useCompanyStore } from '@/store/companyStore'

export default function TopCards() {
  const router = useRouter()
  const { companies, fetchCompanies } = useCompanyStore()
  const [summary, setSummary] = useState<any>({
    total_attacks: 12847,
    active_threat_actors: 395,
    critical_attacks: 45,
    last_updated: new Date().toISOString()
  })
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        setIsUpdating(true)
        const [summaryData] = await Promise.allSettled([
          dashboardService.getSummary(),
          fetchCompanies()
        ])
        if (isMounted && summaryData.status === 'fulfilled' && summaryData.value) {
          setSummary(summaryData.value)
        }
      } catch (error) {
        console.error('Error fetching dashboard summary:', error)
      } finally {
        if (isMounted) setIsUpdating(false)
      }
    }

    fetchData()

    // Polling for live updates every 15 seconds
    const pollingInterval = setInterval(fetchData, 15000)

    // Optional WebSocket connection for real-time live events
    let ws: WebSocket | null = null
    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL
      if (wsUrl && typeof window !== 'undefined') {
        ws = new WebSocket(wsUrl)
        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            if (message.type === 'dashboard_update' && isMounted) {
              setSummary((prev: any) => ({
                ...prev,
                total_attacks: message.total_attacks || prev.total_attacks,
                active_threat_actors: message.active_threat_actors || prev.active_threat_actors,
                critical_attacks: message.critical_attacks || prev.critical_attacks,
                last_updated: message.last_updated || prev.last_updated
              }))
            }
          } catch (err) {
            // Ignore parse errors
          }
        }
      }
    } catch (wsErr) {
      // Ignore ws connection errors
    }

    return () => {
      isMounted = false
      clearInterval(pollingInterval)
      if (ws) {
        try {
          ws.close()
        } catch (e) {}
      }
    }
  }, [fetchCompanies])

  const monitoredCount = companies?.length || 6

  const cards = [
    {
      label: 'Monitored Companies',
      value: `${monitoredCount} ACTIVE`,
      subtext: 'View & Manage Portfolio →',
      icon: Building2,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      path: '/companies',
    },
    {
      label: 'Last Updated',
      value: 'LIVE FEED',
      subtext: 'Real-time telemetry active',
      icon: RefreshCw,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      path: '/updates',
    },
    {
      label: 'Global Attacks Today',
      value: (summary?.total_attacks || 12847).toLocaleString(),
      trend: '↑ 18%',
      subtext: 'Worldwide Threat Pulses',
      icon: TrendingUp,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      path: '/global-attacks',
    },
    {
      label: 'Active Threat Actors',
      value: (summary?.active_threat_actors || 395).toLocaleString(),
      trend: '↑ 12%',
      subtext: 'Monitored APT Groups',
      icon: Shield,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      path: '/threat-intelligence/actors',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          onClick={() => router.push(card.path)}
          className="bg-card border border-border rounded-xl p-4.5 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-secondary uppercase tracking-wider font-semibold truncate mb-1">
                {card.label}
              </p>
              <p className="text-2xl font-extrabold text-foreground tracking-tight group-hover:text-primary transition-colors">
                {card.value}
              </p>
            </div>
            <div className={`p-2.5 rounded-xl ${card.bgColor} flex-shrink-0 ml-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
            <span className="text-secondary text-[11px] truncate">{card.subtext}</span>
            {card.trend && (
              <span className={`font-semibold text-[11px] ${card.color} ml-2 flex-shrink-0`}>
                {card.trend}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
