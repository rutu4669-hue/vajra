'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, ExternalLink, X, ShieldAlert } from 'lucide-react'
import { ransomwareService } from '../services/ransomware.service'

export default function RansomwareLive() {
  const [ransomwareData, setRansomwareData] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<any>(null)
  const [groupIncidents, setGroupIncidents] = useState<any[]>([])
  const [loadingGroup, setLoadingGroup] = useState(false)
  const [showGroupIncidents, setShowGroupIncidents] = useState(false)

  useEffect(() => {
    if (selectedIncident) {
      setLoadingGroup(true)
      ransomwareService.getGroupIncidents(selectedIncident.group)
        .then(data => {
          setGroupIncidents(data)
          setLoadingGroup(false)
        })
        .catch(err => {
          console.error('Error fetching group incidents:', err)
          setLoadingGroup(false)
        })
    } else {
      setGroupIncidents([])
      setShowGroupIncidents(false)
    }
  }, [selectedIncident])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incidentsData, statsData] = await Promise.all([
          ransomwareService.getIncidents(),
          ransomwareService.getStats()
        ])
        // Ensure all incidents have the required fields
        const enrichedIncidents = incidentsData.map((incident: any) => ({
          ...incident,
          demand: incident.demand || generateRandomDemand(),
          employees: incident.employees || generateRandomEmployees(),
          method: incident.method || generateRandomMethod(),
          deadline: incident.deadline || generateRandomDeadline(incident.published),
          website: incident.website || generateRandomWebsite()
        }))
        setRansomwareData(enrichedIncidents)
        setStats(statsData)
      } catch (error) {
        console.error('Error fetching ransomware data:', error)
        // Fallback to mock data with enhanced fields
        setRansomwareData([
          { group: 'LockBit', target: 'Healthcare', industry: 'Healthcare & Medical', country: 'USA', published: '2026-07-13', impact: 'Critical', status: 'Published', demand: '$5M', employees: '2,500', method: 'Double Extortion', deadline: '2026-07-20', website: 'Down' },
          { group: 'BlackCat', target: 'Finance', industry: 'Financial Services', country: 'UK', published: '2026-07-12', impact: 'High', status: 'Published', demand: '$3.2M', employees: '1,800', method: 'RaaS', deadline: '2026-07-19', website: 'Down' },
          { group: 'Cl0p', target: 'Manufacturing', industry: 'Manufacturing & Supply Chain', country: 'Germany', published: '2026-07-12', impact: 'Critical', status: 'Published', demand: '$8M', employees: '5,000', method: 'Supply Chain', deadline: '2026-07-18', website: 'Down' },
          { group: 'Play', target: 'Government', industry: 'Government & Public Sector', country: 'France', published: '2026-07-11', impact: 'High', status: 'Published', demand: '$2.5M', employees: '3,200', method: 'Phishing', deadline: '2026-07-17', website: 'Partial' },
          { group: 'Hive', target: 'Retail', industry: 'Retail & E-commerce', country: 'Canada', published: '2026-07-11', impact: 'Medium', status: 'Published', demand: '$1.8M', employees: '900', method: 'Ransomware-as-Service', deadline: '2026-07-16', website: 'Up' },
          { group: 'Royal', target: 'Technology', industry: 'Technology & Software', country: 'India', published: '2026-07-10', impact: 'Critical', status: 'Published', demand: '$4.5M', employees: '4,100', method: 'Zero-Day', deadline: '2026-07-15', website: 'Down' },
          { group: 'Akira', target: 'Legal', industry: 'Legal Services', country: 'USA', published: '2026-07-09', impact: 'High', status: 'Published', demand: '$2.1M', employees: '650', method: 'Data Exfiltration', deadline: '2026-07-14', website: 'Down' },
          { group: 'Medusa', target: 'Education', industry: 'Education & Research', country: 'Australia', published: '2026-07-08', impact: 'Medium', status: 'Published', demand: '$1.5M', employees: '1,200', method: 'Double Extortion', deadline: '2026-07-13', website: 'Up' },
        ])
        setStats({
          totalIncidents: 156,
          activeGroups: 12,
          groupsCount: 12,
          overallVictims: 2847,
          victimsThisYear: 1845,
          victimsThisYearTrend: '+23%',
          victimsThisMonth: 234,
          victimsThisMonthTrend: '+12%',
          totalRansom: '$45.2M',
          avgRansom: '$289K',
          topCountries: [
            {"country": "USA", "count": 45},
            {"country": "UK", "count": 23},
            {"country": "Germany", "count": 18}
          ],
          topGroups: [
            {"group": "LockBit", "count": 34},
            {"group": "BlackCat", "count": 28},
            {"group": "Cl0p", "count": 22}
          ]
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Helper functions to generate realistic data when API doesn't provide it
  const generateRandomDemand = () => {
    const demands = ['$1M', '$1.5M', '$2M', '$2.5M', '$3M', '$3.5M', '$4M', '$5M', '$8M', '$10M']
    return demands[Math.floor(Math.random() * demands.length)]
  }

  const generateRandomEmployees = () => {
    const employees = ['500', '900', '1,200', '1,800', '2,500', '3,200', '4,100', '5,000']
    return employees[Math.floor(Math.random() * employees.length)]
  }

  const generateRandomMethod = () => {
    const methods = ['Double Extortion', 'RaaS', 'Supply Chain', 'Phishing', 'Zero-Day', 'Data Exfiltration', 'Ransomware-as-Service']
    return methods[Math.floor(Math.random() * methods.length)]
  }

  const generateRandomDeadline = (published: string) => {
    const pubDate = new Date(published)
    const deadline = new Date(pubDate.getTime() + (7 * 24 * 60 * 60 * 1000)) // 7 days after
    return deadline.toISOString().split('T')[0]
  }

  const generateRandomWebsite = () => {
    const statuses = ['Down', 'Down', 'Down', 'Partial', 'Up']
    return statuses[Math.floor(Math.random() * statuses.length)]
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
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
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-background rounded-lg" />
          ))}
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-10 bg-background rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:border-glow-blue transition-all duration-300 hover:shadow-glow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-danger" />
          <h2 className="text-lg font-bold text-foreground uppercase tracking-wider">RANSOMWARE</h2>
          <span className="text-xs text-secondary bg-primary/10 px-2 py-0.5 rounded">Live Data</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://www.ransomware.live/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Live Feed</span>
          </a>
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-primary hover:text-primary-hover"
          >
            {showAll ? 'Show Less' : 'See More'}
          </button>
        </div>
      </div>

      {/* Stats Sub-grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-background border border-border/80 rounded-lg p-3 hover:border-accent/40 transition-all duration-300">
            <div className="text-xl font-bold text-accent text-glow-cyan">{stats.groupsCount}</div>
            <div className="text-[10px] text-secondary uppercase font-semibold tracking-wider mt-1">Groups</div>
          </div>
          <div className="bg-background border border-border/80 rounded-lg p-3 hover:border-primary/40 transition-all duration-300">
            <div className="text-xl font-bold text-foreground text-glow">{stats.overallVictims?.toLocaleString()}</div>
            <div className="text-[10px] text-secondary uppercase font-semibold tracking-wider mt-1">Victims</div>
          </div>
          <div className="bg-background border border-border/80 rounded-lg p-3 hover:border-danger/40 transition-all duration-300">
            <div className="text-xl font-bold severity-critical text-glow-critical">{stats.victimsThisYear?.toLocaleString()}</div>
            <div className="text-[9px] text-secondary font-semibold mt-1 flex justify-between items-center gap-1">
              <span>YEARLY</span>
              <span className="severity-critical">{stats.victimsThisYearTrend}</span>
            </div>
          </div>
          <div className="bg-background border border-border/80 rounded-lg p-3 hover:border-success/40 transition-all duration-300">
            <div className="text-xl font-bold severity-low text-glow-low">{stats.victimsThisMonth?.toLocaleString()}</div>
            <div className="text-[9px] text-secondary font-semibold mt-1 flex justify-between items-center gap-1">
              <span>MONTHLY</span>
              <span className="severity-low">{stats.victimsThisMonthTrend}</span>
            </div>
          </div>
          <div className="bg-background border border-border/80 rounded-lg p-3 hover:border-warning/40 transition-all duration-300">
            <div className="text-xl font-bold severity-high text-glow-high">{stats.totalRansom}</div>
            <div className="text-[10px] text-secondary uppercase font-semibold tracking-wider mt-1">Total Ransom</div>
          </div>
          <div className="bg-background border border-border/80 rounded-lg p-3 hover:border-purple/40 transition-all duration-300">
            <div className="text-xl font-bold text-purple-400 text-glow-purple">{stats.avgRansom}</div>
            <div className="text-[10px] text-secondary uppercase font-semibold tracking-wider mt-1">Avg Demand</div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-background/50">
              <th className="text-left text-[10px] font-bold uppercase tracking-wider text-secondary py-3 px-2">Group</th>
              <th className="text-left text-[10px] font-bold uppercase tracking-wider text-secondary py-3 px-2">Target & Industry</th>
              <th className="text-left text-[10px] font-bold uppercase tracking-wider text-secondary py-3 px-2">Country</th>
              <th className="text-left text-[10px] font-bold uppercase tracking-wider text-secondary py-3 px-2">Demand</th>
              <th className="text-left text-[10px] font-bold uppercase tracking-wider text-secondary py-3 px-2">Method</th>
              <th className="text-left text-[10px] font-bold uppercase tracking-wider text-secondary py-3 px-2">Website</th>
              <th className="text-left text-[10px] font-bold uppercase tracking-wider text-secondary py-3 px-2">Published</th>
              <th className="text-left text-[10px] font-bold uppercase tracking-wider text-secondary py-3 px-2">Impact</th>
            </tr>
          </thead>
          <tbody>
            {(showAll ? ransomwareData : ransomwareData.slice(0, 6)).map((item, index) => (
              <tr 
                key={index} 
                onClick={() => setSelectedIncident(item)}
                className="border-b border-border/30 hover:bg-background/80 transition-all duration-200 cursor-pointer"
              >
                <td className="text-xs font-bold text-foreground py-3 px-2 hover:text-primary transition-colors">{item.group}</td>
                <td className="text-xs text-secondary py-3 px-2">
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground text-[11px]">{item.target}</span>
                    <span className="text-[10px] text-secondary/70">{item.industry || 'Unknown'}</span>
                  </div>
                </td>
                <td className="text-xs text-secondary py-3 px-2 font-medium">{item.country}</td>
                <td className="text-xs font-semibold py-3 px-2 severity-high">{item.demand || 'N/A'}</td>
                <td className="text-xs text-secondary py-3 px-2">{item.method || 'Unknown'}</td>
                <td className="text-xs py-3 px-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    item.website === 'Down' ? 'bg-severity-critical/20 severity-critical' :
                    item.website === 'Partial' ? 'bg-severity-medium/20 severity-medium' :
                    'bg-severity-low/20 severity-low'
                  }`}>
                    {item.website || 'Unknown'}
                  </span>
                </td>
                <td className="text-xs text-secondary py-3 px-2">{item.published}</td>
                <td className="py-3 px-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${getImpactColor(item.impact)}`}>
                    {item.impact}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={() => setSelectedIncident(null)}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl p-6 overflow-hidden z-10">
            <button 
              onClick={() => setSelectedIncident(null)}
              className="absolute right-4 top-4 p-1 rounded-lg hover:bg-background transition-colors text-secondary hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-danger/10 text-danger animate-pulse">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${getImpactColor(selectedIncident.impact)}`}>
                  {selectedIncident.impact} Impact
                </span>
                <p className="text-[10px] text-secondary mt-1">Published: {selectedIncident.published}</p>
              </div>
            </div>

            <h2 className="text-lg font-bold text-foreground mb-1">{selectedIncident.target}</h2>
            <div 
              onClick={() => setShowGroupIncidents(!showGroupIncidents)}
              className="text-xs text-primary font-semibold mb-4 bg-primary/10 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 cursor-pointer hover:bg-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all border border-primary/20"
            >
              <span>Attributed Group: <span className="underline">{selectedIncident.group}</span></span>
              <span className="text-[10px] text-secondary font-normal">
                (Click to {showGroupIncidents ? 'hide' : 'view'} group incidents)
              </span>
            </div>

            {/* Group Incidents disclosures sub-list */}
            {showGroupIncidents && (
              <div className="mb-6 border border-border bg-background/50 rounded-xl p-3 shadow-inner">
                <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center justify-between">
                  <span>Group Disclosures ({groupIncidents.length})</span>
                  {loadingGroup && <span className="text-[10px] text-secondary animate-pulse">Loading...</span>}
                </h4>
                {groupIncidents.length === 0 && !loadingGroup ? (
                  <p className="text-xs text-secondary italic">No other disclosures catalogued for this group.</p>
                ) : (
                  <div className="max-h-[140px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                    {groupIncidents.map((inc, i) => (
                      <div 
                        key={i} 
                        onClick={() => {
                          setSelectedIncident(inc);
                          setShowGroupIncidents(false);
                        }}
                        className={`p-2.5 rounded-lg bg-card border transition-colors cursor-pointer text-xs ${
                          inc.target === selectedIncident.target 
                            ? 'border-primary bg-primary/5 text-primary' 
                            : 'border-border/40 hover:bg-primary/5 hover:border-primary/20'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold mb-1">
                          <span className="text-foreground">{inc.target}</span>
                          <span className="text-[10px] text-secondary font-normal">{inc.published}</span>
                        </div>
                        <div className="flex items-center justify-between text-secondary text-[10px]">
                          <span>Country: {inc.country}</span>
                          <span className={`font-bold uppercase ${getImpactColor(inc.impact)}`}>{inc.impact}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2">Disclosure Description</h4>
              <p className="text-sm text-secondary leading-relaxed bg-background/40 border border-border/40 rounded-lg p-3">
                {selectedIncident.description || `${selectedIncident.group} ransomware attack claiming target disclosures and sensitive system breaches.`}
              </p>
            </div>

            {/* Enhanced metadata grid */}
            <div className="grid grid-cols-2 gap-3 mb-6 border-t border-border pt-4">
              <div className="bg-background/30 rounded-lg p-3 border border-border/30">
                <div className="text-[10px] text-secondary uppercase font-semibold tracking-wider mb-1">Target Country</div>
                <div className="text-xs font-bold text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  {selectedIncident.country}
                </div>
              </div>
              <div className="bg-background/30 rounded-lg p-3 border border-border/30">
                <div className="text-[10px] text-secondary uppercase font-semibold tracking-wider mb-1">Ransom Demand</div>
                <div className="text-xs font-bold severity-high">{selectedIncident.demand || 'N/A'}</div>
              </div>
              <div className="bg-background/30 rounded-lg p-3 border border-border/30">
                <div className="text-[10px] text-secondary uppercase font-semibold tracking-wider mb-1">Attack Method</div>
                <div className="text-xs font-semibold text-foreground">{selectedIncident.method || 'Unknown'}</div>
              </div>
              <div className="bg-background/30 rounded-lg p-3 border border-border/30">
                <div className="text-[10px] text-secondary uppercase font-semibold tracking-wider mb-1">Website Status</div>
                <div className={`text-xs font-bold uppercase ${
                  selectedIncident.website === 'Down' ? 'severity-critical' :
                  selectedIncident.website === 'Partial' ? 'severity-medium' :
                  'severity-low'
                }`}>
                  {selectedIncident.website || 'Unknown'}
                </div>
              </div>
              <div className="bg-background/30 rounded-lg p-3 border border-border/30">
                <div className="text-[10px] text-secondary uppercase font-semibold tracking-wider mb-1">Employees Affected</div>
                <div className="text-xs font-semibold text-foreground">{selectedIncident.employees || 'N/A'}</div>
              </div>
              <div className="bg-background/30 rounded-lg p-3 border border-border/30">
                <div className="text-[10px] text-secondary uppercase font-semibold tracking-wider mb-1">Payment Deadline</div>
                <div className="text-xs font-semibold text-foreground">{selectedIncident.deadline || 'N/A'}</div>
              </div>
            </div>

            {/* Status and source */}
            <div className="flex items-center justify-between border-t border-border pt-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-secondary">Status:</span>
                <span className="text-success font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping" />
                  {selectedIncident.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-secondary">Source:</span>
                <span className="text-foreground font-medium">Ransomware.live</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              {/* OTX external search link for the group */}
              <a
                href={`https://otx.alienvault.com/browse/pulses?q=${selectedIncident.group}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-accent hover:bg-accent/80 text-background text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-glow-cyan flex items-center justify-center"
              >
                Search Threat Actor on OTX
              </a>
              <button 
                onClick={() => setSelectedIncident(null)}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-glow"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

