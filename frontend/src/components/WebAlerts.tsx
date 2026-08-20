'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Globe, Clock, ExternalLink, Search, Filter, TrendingUp, Shield, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

interface WebAlertData {
  company_name: string
  domain: string
  search_period_days: number
  total_alerts: number
  alerts: Array<{
    id: string
    title: string
    description: string
    url: string
    source: string
    published_date: string
    severity: string
    category: string
    relevance_score: number
    company_mentioned: boolean
    is_recent: boolean
    confidence: number
  }>
  categories: Record<string, number>
  severity_distribution: Record<string, number>
  search_timestamp: string
  note?: string
}

interface WebAlertsProps {
  companyId: number
  companyName: string
  domain: string
  days?: number
}

export default function WebAlerts({ companyId, companyName, domain, days = 30 }: WebAlertsProps) {
  const [alertData, setAlertData] = useState<WebAlertData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searching, setSearching] = useState(false)
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL')
  const [filterCategory, setFilterCategory] = useState<string>('ALL')

  useEffect(() => {
    const fetchWebAlerts = async () => {
      try {
        setLoading(true)
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${API_URL}/api/companies/${companyId}/web-alerts?days=${days}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        
        if (!response.ok) throw new Error('Failed to fetch web alerts')
        
        const data = await response.json()
        setAlertData(data.alert_data)
      } catch (err) {
        setError('Failed to load web alerts')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (companyId && companyName && domain) {
      fetchWebAlerts()
    }
  }, [companyId, companyName, domain, days])

  const handleSearch = async () => {
    try {
      setSearching(true)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_URL}/api/companies/${companyId}/web-alerts?days=${days}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) throw new Error('Failed to search web alerts')
      
      const data = await response.json()
      setAlertData(data.alert_data)
    } catch (err) {
      setError('Failed to search web alerts')
      console.error(err)
    } finally {
      setSearching(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'text-danger bg-danger/10 border-danger/30'
      case 'MEDIUM': return 'text-warning bg-warning/10 border-warning/30'
      case 'LOW': return 'text-success bg-success/10 border-success/30'
      default: return 'text-secondary bg-background border-border'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'HIGH': return <XCircle className="w-5 h-5 text-danger" />
      case 'MEDIUM': return <AlertTriangle className="w-5 h-5 text-warning" />
      case 'LOW': return <CheckCircle className="w-5 h-5 text-success" />
      default: return <AlertCircle className="w-5 h-5 text-secondary" />
    }
  }

  const filteredAlerts = alertData?.alerts.filter(alert => {
    if (filterSeverity !== 'ALL' && alert.severity !== filterSeverity) return false
    if (filterCategory !== 'ALL' && alert.category !== filterCategory) return false
    return true
  }) || []

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 animate-pulse">
        <div className="h-8 bg-background rounded mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-background rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !alertData) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 text-danger">
          <AlertTriangle className="w-5 h-5" />
          <p>{error || 'No web alert data available'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Web Alerts Header */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Globe className="w-6 h-6 text-primary" />
              Web Security Alerts & Incidents
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-secondary text-sm">
                Searching for: {companyName} ({domain})
              </span>
              <span className="text-secondary text-sm">
                Period: Last {days} days
              </span>
            </div>
          </div>
          <button
            onClick={handleSearch}
            disabled={searching}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground px-4 py-2 rounded-lg transition"
          >
            <Search className="w-4 h-4" />
            {searching ? 'Searching...' : 'Refresh Search'}
          </button>
        </div>
        {alertData.note && (
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 mt-4">
            <p className="text-warning text-sm">{alertData.note}</p>
          </div>
        )}
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-primary" />
            <span className="text-xs text-secondary">Total Alerts</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{alertData.total_alerts}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-danger" />
            <span className="text-xs text-secondary">High Severity</span>
          </div>
          <div className="text-2xl font-bold text-danger">{alertData.severity_distribution.HIGH || 0}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="text-xs text-secondary">Medium Severity</span>
          </div>
          <div className="text-2xl font-bold text-warning">{alertData.severity_distribution.MEDIUM || 0}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-xs text-secondary">Low Severity</span>
          </div>
          <div className="text-2xl font-bold text-success">{alertData.severity_distribution.LOW || 0}</div>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          Alert Categories
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(alertData.categories).map(([category, count]) => (
            <div key={category} className="bg-background border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-foreground font-medium">{category}</span>
                <span className="text-primary font-bold">{count}</span>
              </div>
              <div className="mt-2 h-2 bg-background rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary"
                  style={{ width: `${(count / alertData.total_alerts) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          Filter Alerts
        </h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-secondary">Severity:</label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
            >
              <option value="ALL">All Severities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-secondary">Category:</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
            >
              <option value="ALL">All Categories</option>
              {Object.keys(alertData.categories).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-primary" />
          Security Alerts ({filteredAlerts.length})
        </h4>
        
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8 text-secondary">
            <Shield className="w-12 h-12 mx-auto mb-2 text-success" />
            <p>No alerts match your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className="bg-background border border-border rounded-lg p-4 hover:border-primary/50 transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getSeverityIcon(alert.severity)}
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs text-secondary bg-background px-2 py-1 rounded">
                        {alert.category}
                      </span>
                      {alert.is_recent && (
                        <span className="text-xs text-success bg-success/10 px-2 py-1 rounded flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Recent
                        </span>
                      )}
                    </div>
                    <h5 className="font-semibold text-foreground mb-2">{alert.title}</h5>
                    <p className="text-sm text-secondary mb-3">{alert.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <div className="text-right">
                      <div className="text-xs text-secondary">Relevance</div>
                      <div className="text-lg font-bold text-primary">{Math.round(alert.relevance_score * 100)}%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-secondary">Confidence</div>
                      <div className="text-lg font-bold text-primary">{Math.round(alert.confidence * 100)}%</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-4 text-xs text-secondary">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {alert.source}
                    </span>
                    {alert.published_date && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(alert.published_date).toLocaleDateString()}
                      </span>
                    )}
                    {alert.company_mentioned && (
                      <span className="flex items-center gap-1 text-primary">
                        <CheckCircle className="w-3 h-3" />
                        Company Mentioned
                      </span>
                    )}
                  </div>
                  {alert.url && (
                    <a
                      href={alert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:text-primary/80 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Source
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search Metadata */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Search Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-secondary">Search Timestamp</span>
            <span className="text-foreground font-medium">
              {new Date(alertData.search_timestamp).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-secondary">Search Period</span>
            <span className="text-foreground font-medium">
              Last {alertData.search_period_days} days
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-secondary">Company Name</span>
            <span className="text-foreground font-medium">{alertData.company_name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-secondary">Domain</span>
            <span className="text-foreground font-medium">{alertData.domain}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
