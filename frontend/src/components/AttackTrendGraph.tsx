'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AttackTrendGraph() {
  const [showFullChart, setShowFullChart] = useState(false)

  const attackTrendData = [
    { month: 'Jan', attacks: 850, critical: 245, high: 320, medium: 185, low: 100 },
    { month: 'Feb', attacks: 920, critical: 280, high: 350, medium: 190, low: 100 },
    { month: 'Mar', attacks: 880, critical: 260, high: 330, medium: 190, low: 100 },
    { month: 'Apr', attacks: 1050, critical: 320, high: 400, medium: 230, low: 100 },
    { month: 'May', attacks: 1180, critical: 380, high: 450, medium: 250, low: 100 },
    { month: 'Jun', attacks: 1247, critical: 420, high: 480, medium: 247, low: 100 },
  ]

  const stats = {
    totalAttacks: 6127,
    avgPerMonth: 1021,
    peakMonth: 'Jun',
    growthRate: '+46.7%',
    criticalAttacks: 1905,
    blockedAttacks: 4850
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-6 hover:border-glow-blue transition-all duration-300 hover:shadow-glow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-bold text-foreground uppercase tracking-wider">ATTACK TREND</h2>
          <span className="text-xs text-secondary bg-primary/10 px-2 py-0.5 rounded">6 Months</span>
        </div>
        <button
          onClick={() => setShowFullChart(!showFullChart)}
          className="text-xs text-primary hover:text-primary-hover"
        >
          {showFullChart ? 'Show Less' : 'See More'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <div className="bg-background border border-border/80 rounded-lg p-3 hover:border-accent/40 transition-all duration-300">
          <div className="text-xl font-bold text-accent text-glow-cyan">{stats.totalAttacks.toLocaleString()}</div>
          <div className="text-[10px] text-secondary uppercase font-semibold tracking-wider mt-1">Total Attacks</div>
        </div>
        <div className="bg-background border border-border/80 rounded-lg p-3 hover:border-primary/40 transition-all duration-300">
          <div className="text-xl font-bold text-foreground text-glow">{stats.avgPerMonth.toLocaleString()}</div>
          <div className="text-[10px] text-secondary uppercase font-semibold tracking-wider mt-1">Avg/Month</div>
        </div>
        <div className="bg-background border border-border/80 rounded-lg p-3 hover:border-severity-critical/40 transition-all duration-300">
          <div className="text-xl font-bold severity-critical text-glow-critical">{stats.criticalAttacks.toLocaleString()}</div>
          <div className="text-[10px] text-secondary uppercase font-semibold tracking-wider mt-1">Critical</div>
        </div>
        <div className="bg-background border border-border/80 rounded-lg p-3 hover:border-severity-low/40 transition-all duration-300">
          <div className="text-xl font-bold severity-low text-glow-low">{stats.blockedAttacks.toLocaleString()}</div>
          <div className="text-[10px] text-secondary uppercase font-semibold tracking-wider mt-1">Blocked</div>
        </div>
        <div className="bg-background border border-border/80 rounded-lg p-3 hover:border-severity-high/40 transition-all duration-300">
          <div className="text-xl font-bold severity-high text-glow-high">{stats.growthRate}</div>
          <div className="text-[10px] text-secondary uppercase font-semibold tracking-wider mt-1">Growth</div>
        </div>
        <div className="bg-background border border-border/80 rounded-lg p-3 hover:border-purple/40 transition-all duration-300">
          <div className="text-xl font-bold text-purple-400 text-glow-purple">{stats.peakMonth}</div>
          <div className="text-[10px] text-secondary uppercase font-semibold tracking-wider mt-1">Peak Month</div>
        </div>
      </div>

      <div className={showFullChart ? "h-64" : "h-48"}>
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
  )
}
