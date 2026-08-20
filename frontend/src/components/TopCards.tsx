'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, RefreshCw, TrendingUp, Globe, Shield, AlertTriangle, Activity } from 'lucide-react'
import { dashboardService } from '../services/dashboard.service'
import { useRouter } from 'next/navigation'

export default function TopCards() {
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await dashboardService.getSummary()
        setSummary(data)
      } catch (error) {
        console.error('Error fetching dashboard summary:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()

    // Polling for live updates every 10 seconds
    const pollingInterval = setInterval(async () => {
      try {
        const data = await dashboardService.getSummary()
        setSummary(data)
      } catch (error) {
        console.error('Error polling dashboard summary:', error)
      }
    }, 10000)

    // WebSocket connection for real-time updates
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/dashboard'
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log('WebSocket connected')
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        if (message.type === 'dashboard_update') {
          setSummary((prev: any) => ({
            ...prev,
            total_attacks: message.total_attacks,
            active_threat_actors: message.active_threat_actors,
            critical_attacks: message.critical_attacks,
            last_updated: message.last_updated
          }))
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
    }

    return () => {
      clearInterval(pollingInterval)
      ws.close()
    }
  }, [])

  const cards = summary ? [
    {
      label: 'Monitored Companies',
      value: 'VIEW COMPANIES',
      icon: ArrowRight,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      path: '/companies',
    },
    {
      label: 'Last Updated',
      value: 'JUST NOW',
      icon: RefreshCw,
      color: 'text-success',
      bgColor: 'bg-success/10',
      path: '/updates',
    },
    {
      label: 'Global Attacks Today',
      value: summary.total_attacks?.toLocaleString() || '1,247',
      trend: '↑ 18%',
      icon: TrendingUp,
      color: 'text-danger',
      bgColor: 'bg-danger/10',
      path: '/global-attacks',
    },
    {
      label: 'Active Threat Actors',
      value: summary.active_threat_actors?.toLocaleString() || '395',
      trend: '↑ 12%',
      icon: TrendingUp,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      path: '/threat-intelligence/actors',
    },
  ] : [
    {
      label: 'Monitored Companies',
      value: 'VIEW COMPANIES',
      icon: ArrowRight,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      path: '/companies',
    },
    {
      label: 'Last Updated',
      value: 'JUST NOW',
      icon: RefreshCw,
      color: 'text-success',
      bgColor: 'bg-success/10',
      path: '/updates',
    },
    {
      label: 'Global Attacks Today',
      value: '12,847',
      trend: '↑ 18%',
      icon: TrendingUp,
      color: 'text-danger',
      bgColor: 'bg-danger/10',
      path: '/global-attacks',
    },
    {
      label: 'Active Threat Actors',
      value: '395',
      trend: '↑ 12%',
      icon: TrendingUp,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      path: '/threat-intelligence/actors',
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          onClick={() => router.push(card.path)}
          className="bg-card border border-border rounded-xl p-4 hover:border-glow-blue transition-all duration-300 hover:shadow-glow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-secondary mb-1 uppercase tracking-wider font-semibold">{card.label}</p>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              {card.trend && (
                <p className={`text-sm font-medium ${card.color} mt-1`}>{card.trend}</p>
              )}
            </div>
            <div className={`p-3 rounded-lg ${card.bgColor}`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
