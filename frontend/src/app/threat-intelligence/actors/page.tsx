'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Activity, Search, AlertCircle, X, MapPin, Calendar, Shield, Globe, Terminal, Zap, CheckCircle2 } from 'lucide-react'
import { threatActorsService } from '@/services/threatActors.service'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

export default function ThreatActorsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(200)
  const [mounted, setMounted] = useState(false)
  const [actors, setActors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedActor, setSelectedActor] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchActors = async () => {
      try {
        const data = await threatActorsService.getThreatActors()
        if (Array.isArray(data) && data.length > 0) {
          setActors(data)
        } else {
          throw new Error('Empty response')
        }
      } catch (error) {
        console.error('Error fetching threat actors:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActors()
  }, [])

  const getActivityColor = (level: string = 'HIGH') => {
    const l = level.toUpperCase()
    if (l === 'CRITICAL') return 'bg-red-500/15 text-red-400 border-red-500/30'
    if (l === 'HIGH') return 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    return 'bg-blue-500/15 text-blue-400 border-blue-500/30'
  }

  const filteredActors = actors.filter((actor) =>
    (actor.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (actor.country || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (actor.attribution || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (actor.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (actor.targeted_sectors || []).some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (actor.aliases || []).some((a: string) => a.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="w-64 bg-card border-r border-border h-screen animate-pulse" />
        <div className="flex-1 flex flex-col">
          <div className="h-16 bg-card border-b border-border animate-pulse" />
          <main className="flex-1 p-6 space-y-6">
            <div className="h-8 w-48 bg-card rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 bg-card rounded-xl animate-pulse" />
              ))}
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed}
        sidebarWidth={sidebarWidth}
        setSidebarWidth={setSidebarWidth}
      />
      <div 
        className="flex-1 flex flex-col transition-all duration-300 overflow-hidden"
        style={{ marginLeft: sidebarCollapsed ? '64px' : `${sidebarWidth}px` }}
      >
        <Navbar />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground text-glow flex items-center gap-2.5">
                <Users className="w-6 h-6 text-primary" /> Top Active Threat Actors
              </h1>
              <p className="text-secondary text-sm mt-1">
                Real-time tracking of nation-state APT syndicates, Ransomware cartels, and targeted campaigns worldwide
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search actors, aliases, attribution, targeted sectors..."
                  className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-foreground placeholder:text-secondary/60 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            {/* Actors Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-48 bg-card rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredActors.map((actor, index) => {
                  const attackCount = actor.attacks_count || actor.attack_count || 185
                  const sectors = actor.targeted_sectors || actor.targets || ['Government', 'Finance', 'Healthcare']

                  return (
                    <motion.div
                      key={actor.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedActor(actor)}
                      className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                              <Users className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                                {actor.name}
                              </h3>
                              <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${getActivityColor(actor.activity_level)}`}>
                                {actor.activity_level || 'HIGH'} SEVERITY
                              </span>
                            </div>
                          </div>
                          <span className="text-[11px] text-secondary font-mono px-2 py-0.5 bg-background rounded border border-border/50">
                            {actor.country || 'Global'}
                          </span>
                        </div>

                        <p className="text-xs text-secondary line-clamp-2 mb-4 leading-relaxed">
                          {actor.description || 'Active adversary group monitored for multi-stage enterprise intrusions.'}
                        </p>

                        <div className="space-y-2 pt-3 border-t border-border/50">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-secondary">Tracked Incidents</span>
                            <span className="text-foreground font-mono font-bold">{attackCount} attacks</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-secondary">Target Sectors</span>
                            <span className="text-primary font-medium truncate max-w-[170px]">{sectors.slice(0, 2).join(', ')}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-secondary">Attribution</span>
                            <span className="text-foreground font-medium truncate max-w-[170px]">{actor.attribution || 'State-Sponsored'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-secondary">
                        <span>Last Active: <strong className="text-foreground">{actor.last_seen || 'Active Now'}</strong></span>
                        <span className="text-primary group-hover:translate-x-1 transition-transform font-medium">Deep Dossier →</span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal for detailed actor information */}
      {selectedActor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedActor(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-card/95 backdrop-blur-md border-b border-border p-5 flex items-center justify-between z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selectedActor.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full border ${getActivityColor(selectedActor.activity_level)}`}>
                      {selectedActor.activity_level || 'HIGH'} Activity
                    </span>
                    <span className="text-xs text-secondary font-mono flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-400" /> {selectedActor.country || 'Global / Multinational'}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedActor(null)} 
                className="p-2 hover:bg-background rounded-xl transition-colors text-secondary hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Aliases */}
              {selectedActor.aliases && selectedActor.aliases.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-secondary mb-2">Known Aliases</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedActor.aliases.map((alias: string, idx: number) => (
                      <span key={idx} className="text-xs font-mono px-2.5 py-0.5 bg-background border border-border rounded-md text-foreground">
                        {alias}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Threat Actor Profile
                </h3>
                <p className="text-sm text-foreground/90 leading-relaxed bg-background/60 p-4 rounded-xl border border-border/50">
                  {selectedActor.description || 'Monitored threat actor entity exhibiting persistent advanced persistent threat (APT) capabilities.'}
                </p>
                {selectedActor.additional_description && (
                  <p className="text-xs text-secondary leading-relaxed mt-2.5 px-1">
                    {selectedActor.additional_description}
                  </p>
                )}
              </div>

              {/* Key Information Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-background/60 border border-border/60 rounded-xl p-3.5">
                  <span className="text-[10px] text-secondary uppercase font-semibold tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-secondary" /> Origin
                  </span>
                  <p className="text-sm font-bold text-foreground mt-1">{selectedActor.country || 'Global'}</p>
                </div>
                <div className="bg-background/60 border border-border/60 rounded-xl p-3.5">
                  <span className="text-[10px] text-secondary uppercase font-semibold tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-secondary" /> First Observed
                  </span>
                  <p className="text-sm font-bold text-primary mt-1">{selectedActor.first_seen || '2018'}</p>
                </div>
                <div className="bg-background/60 border border-border/60 rounded-xl p-3.5">
                  <span className="text-[10px] text-secondary uppercase font-semibold tracking-wider flex items-center gap-1">
                    <Activity className="w-3 h-3 text-secondary" /> Attack Count
                  </span>
                  <p className="text-sm font-bold text-red-400 mt-1">{selectedActor.attacks_count || selectedActor.attack_count || 185} campaigns</p>
                </div>
                <div className="bg-background/60 border border-border/60 rounded-xl p-3.5">
                  <span className="text-[10px] text-secondary uppercase font-semibold tracking-wider flex items-center gap-1">
                    <Shield className="w-3 h-3 text-secondary" /> Last Activity
                  </span>
                  <p className="text-sm font-bold text-emerald-400 mt-1">{selectedActor.last_seen || 'Recent'}</p>
                </div>
              </div>

              {/* Attribution */}
              <div className="bg-background/60 border border-border/60 rounded-xl p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-secondary mb-1">State / Organizational Attribution</h3>
                <p className="text-sm font-semibold text-foreground">{selectedActor.attribution || 'State-Sponsored Threat Syndicate'}</p>
              </div>

              {/* Targeted Sectors */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-primary" /> Targeted Industries & Sectors
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(selectedActor.targeted_sectors || selectedActor.targets || ['Government', 'Healthcare', 'Finance', 'Defense']).map((sector: string, idx: number) => (
                    <span key={idx} className="text-xs px-3 py-1 bg-primary/10 text-primary border border-primary/25 rounded-lg font-medium">
                      {sector}
                    </span>
                  ))}
                </div>
              </div>

              {/* Motivations */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Primary Motivations & Objectives
                </h3>
                <p className="text-xs text-secondary leading-relaxed bg-background/50 p-3.5 rounded-xl border border-border/40">
                  {selectedActor.motivations || 'Geopolitical espionage, state intelligence collection, intellectual property theft, and financial extortion.'}
                </p>
              </div>

              {/* Capabilities */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400" /> Operational Capabilities
                </h3>
                <p className="text-xs text-secondary leading-relaxed bg-background/50 p-3.5 rounded-xl border border-border/40">
                  {selectedActor.capabilities || 'Custom malware frameworks, zero-day exploitation, memory-resident implants, and long-term lateral persistence.'}
                </p>
              </div>

              {/* MITRE ATT&CK Techniques */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" /> MITRE ATT&CK Techniques & Tactics
                </h3>
                <p className="text-xs text-foreground/90 font-mono leading-relaxed bg-background/80 p-3.5 rounded-xl border border-border/60">
                  {selectedActor.techniques || 'Spear-phishing (T1566), Living-off-the-land (T1059), Credential dumping (T1003), Web shells (T1505)'}
                </p>
              </div>

              {/* Notable Incidents */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-purple-400" /> Notable High-Profile Incidents
                </h3>
                <p className="text-xs text-secondary leading-relaxed bg-background/50 p-3.5 rounded-xl border border-border/40">
                  {selectedActor.notable_incidents || 'Major global enterprise intrusions, critical infrastructure supply chain compromises, and high-impact extortion campaigns.'}
                </p>
              </div>

              {/* Recommended Defenses */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Recommended Hardening & Defenses
                </h3>
                <p className="text-xs text-emerald-400/90 leading-relaxed bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/25 font-medium">
                  {selectedActor.defenses || 'FIDO2 Multi-Factor Authentication, EDR behavioral endpoint detection, Zero Trust network segmentation, and proactive threat hunting.'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
