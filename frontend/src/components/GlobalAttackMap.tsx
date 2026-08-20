'use client'

import { TrendingUp, ShieldAlert, Globe, Database, ExternalLink } from 'lucide-react'

export default function GlobalAttackMap() {
  const countries = [
    { name: 'United States', count: 387 },
    { name: 'India', count: 94 },
    { name: 'United Kingdom', count: 51 },
    { name: 'Germany', count: 47 },
    { name: 'France', count: 36 },
  ]

  const counters = [
    { label: 'Critical Attacks', value: '217', trend: '↑ 22%', color: 'text-danger', iconName: 'TrendingUp' },
    { label: 'Malware Detected', value: '532', trend: '↑ 15%', color: 'text-warning', iconName: 'ShieldAlert' },
    { label: 'Phishing Sites', value: '1,124', trend: '↑ 19%', color: 'text-primary', iconName: 'Globe' },
    { label: 'Data Breaches', value: '74', trend: '↑ 11%', color: 'text-accent', iconName: 'Database' },
  ]

  const iconMap: Record<string, React.ElementType> = {
    TrendingUp,
    ShieldAlert,
    Globe,
    Database,
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:border-glow-blue transition-all duration-300 hover:shadow-glow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">LIVE GLOBAL ATTACK MAP</h2>
          <p className="text-xs text-secondary">Real-time Attack Map</p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://livethreatmap.radware.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-lg hover:border-primary transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-primary" />
            <span className="text-xs text-foreground">Open Full Map</span>
          </a>
          <div className="text-right">
            <p className="text-xs text-secondary">TOTAL ATTACKS TODAY</p>
            <p className="text-2xl font-bold text-danger text-glow-red">1,247</p>
            <p className="text-xs text-danger">↑ 18% vs yesterday</p>
          </div>
        </div>
      </div>

      <div className="relative h-96 bg-background/50 rounded-lg overflow-hidden mb-4">
        <iframe
          src="https://livethreatmap.radware.com/"
          className="w-full h-full border-0"
          title="Radware Live Threat Map"
          allowFullScreen
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Top Targeted Countries</h3>
          <div className="space-y-2">
            {countries.map((country, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-xs text-secondary">{country.name}</span>
                <span className="text-xs font-medium text-foreground">{country.count}</span>
              </div>
            ))}
          </div>
          <button className="mt-3 text-xs text-primary hover:text-primary-hover">View All Countries</button>
        </div>

        <div className="space-y-3">
          {counters.map((counter, index) => {
            const IconComponent = iconMap[counter.iconName]
            return (
              <div key={index} className="flex items-center justify-between p-2 bg-background rounded-lg">
                <div className="flex items-center gap-2">
                  <IconComponent className={`w-4 h-4 ${counter.color}`} />
                  <span className="text-xs text-secondary">{counter.label}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{counter.value}</p>
                  <p className={`text-xs ${counter.color}`}>{counter.trend}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
