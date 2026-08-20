'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, TrendingUp, TrendingDown, Search, AlertCircle, X, MapPin, Calendar, Shield, Globe, Activity } from 'lucide-react'
import { industriesService } from '@/services/industries.service'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

export default function IndustriesPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(200)
  const [mounted, setMounted] = useState(false)
  const [industries, setIndustries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const data = await industriesService.getTargetedIndustries()
        setIndustries(data)
      } catch (error) {
        console.error('Error fetching industries:', error)
        // Fallback to mock data
        setIndustries([
          { 
            id: 1, 
            name: 'Healthcare', 
            attack_count: 456, 
            risk_level: 'CRITICAL', 
            trend: '↑ 23%', 
            top_threat: 'Ransomware',
            description: 'The healthcare sector remains one of the most targeted industries by cybercriminals due to the critical nature of medical services and the high value of patient data. Healthcare organizations often struggle with legacy systems, limited cybersecurity budgets, and the need for 24/7 availability, making them attractive targets. Ransomware attacks have been particularly devastating, causing hospital shutdowns and delaying critical care. The sector also faces threats from nation-state actors seeking medical research data, particularly during health crises like the COVID-19 pandemic.',
            notable_incidents: '2023 Change Healthcare ransomware attack, 2021 Irish Health Service attack, 2020 Universal Health Services breach',
            top_threat_actors: 'LockBit, BlackCat, Conti, Wizard Spider',
            common_vulnerabilities: 'Unpatched legacy systems, weak authentication, insufficient network segmentation',
            avg_ransom_demand: '$2.5M',
            data_breach_impact: 'High (PHI records worth $250+ per record on black market)'
          },
          { 
            id: 2, 
            name: 'Finance & Banking', 
            attack_count: 389, 
            risk_level: 'CRITICAL', 
            trend: '↑ 18%', 
            top_threat: 'Phishing',
            description: 'Financial institutions are prime targets for cybercriminals due to the direct monetary value of their assets and the sensitive financial data they hold. The sector faces a constant barrage of threats including phishing campaigns, credential theft, ATM jackpotting, and sophisticated banking trojans. State-sponsored actors also target financial systems for espionage and economic disruption. Despite having robust security measures, the sector\'s interconnectedness and reliance on third-party services create significant attack surfaces.',
            notable_incidents: '2023 MOVEit transfer breach affecting financial sector, 2022 SWIFT system attacks, 2021 SolarWinds supply chain impact',
            top_threat_actors: 'Lazarus Group, APT38, Wizard Spider, FIN7',
            common_vulnerabilities: 'Third-party dependencies, insider threats, API vulnerabilities',
            avg_ransom_demand: '$4.2M',
            data_breach_impact: 'Critical (financial records worth $500+ per record)'
          },
          { 
            id: 3, 
            name: 'Government', 
            attack_count: 312, 
            risk_level: 'HIGH', 
            trend: '↑ 12%', 
            top_threat: 'APT',
            description: 'Government agencies face persistent threats from nation-state actors seeking political intelligence, classified information, and strategic advantages. These attacks are often highly sophisticated and long-term, involving advanced persistent threats (APTs) that maintain access for months or years. Government systems are also targeted by cybercriminals for identity theft and financial fraud. The sector\'s complex bureaucracy and legacy systems often hinder rapid security improvements.',
            notable_incidents: '2020 US government agencies breach via SolarWinds, 2019 Office of Personnel Management breach, 2017 WannaCry impact on UK NHS',
            top_threat_actors: 'APT29, APT28, APT41, Lazarus Group',
            common_vulnerabilities: 'Legacy infrastructure, insufficient monitoring, supply chain dependencies',
            avg_ransom_demand: '$3.8M',
            data_breach_impact: 'Critical (classified information, citizen data)'
          },
          { 
            id: 4, 
            name: 'Manufacturing', 
            attack_count: 278, 
            risk_level: 'HIGH', 
            trend: '↑ 8%', 
            top_threat: 'Supply Chain',
            description: 'The manufacturing sector has become increasingly targeted as Industry 4.0 and IoT adoption expand the attack surface. Manufacturers face threats from ransomware groups seeking to disrupt production, intellectual property theft by competitors and nation-states, and supply chain attacks that can cascade through entire ecosystems. The sector\'s focus on operational efficiency often comes at the expense of cybersecurity, with many industrial control systems lacking basic security features.',
            notable_incidents: '2023 Cl0p MOVEit attacks on manufacturers, 2021 Colonial Pipeline ransomware, 2020 Honda ransomware attack',
            top_threat_actors: 'Cl0p, LockBit, Conti, APT41',
            common_vulnerabilities: 'Unsecured IoT devices, outdated industrial control systems, weak supply chain security',
            avg_ransom_demand: '$3.1M',
            data_breach_impact: 'High (intellectual property, production data)'
          },
          { 
            id: 5, 
            name: 'Technology', 
            attack_count: 234, 
            risk_level: 'HIGH', 
            trend: '↑ 15%', 
            top_threat: 'Zero-Day',
            description: 'Technology companies are on the frontlines of cybersecurity threats, both as targets and as potential vectors for supply chain attacks. The sector faces constant attempts to steal intellectual property, compromise software development pipelines, and exploit cloud infrastructure. Tech companies are also targeted for their vast troves of user data. The rapid pace of innovation often outpaces security considerations, creating vulnerabilities that attackers exploit.',
            notable_incidents: '2023 MOVEit transfer breach, 2022 LastPass breach, 2021 Log4j supply chain impact',
            top_threat_actors: 'APT29, APT41, Lazarus Group, various ransomware groups',
            common_vulnerabilities: 'Software supply chain, cloud misconfigurations, zero-day exploits',
            avg_ransom_demand: '$5.5M',
            data_breach_impact: 'Critical (user data, source code, intellectual property)'
          },
          { 
            id: 6, 
            name: 'Retail & E-commerce', 
            attack_count: 189, 
            risk_level: 'MEDIUM', 
            trend: '↓ 5%', 
            top_threat: 'Card Skimming',
            description: 'Retail and e-commerce companies are targeted primarily for payment card data and personal customer information. The sector faces threats from POS malware, e-commerce skimming attacks, and credential stuffing. The high volume of transactions and seasonal peaks create opportunities for attackers. Many retailers operate on thin margins, limiting their cybersecurity investments, though the rise of e-commerce has driven improvements in some areas.',
            notable_incidents: '2023 23andMe data breach, 2022 T-Mobile data breach, 2020 Wawa POS malware attack',
            top_threat_actors: 'FIN7, Magecart cartels, various ransomware groups',
            common_vulnerabilities: 'POS system vulnerabilities, third-party payment processors, web application flaws',
            avg_ransom_demand: '$2.8M',
            data_breach_impact: 'High (payment card data, customer PII)'
          },
          { 
            id: 7, 
            name: 'Energy & Utilities', 
            attack_count: 156, 
            risk_level: 'HIGH', 
            trend: '↑ 10%', 
            top_threat: 'ICS Attacks',
            description: 'The energy and utilities sector is critical infrastructure facing threats from nation-state actors seeking to disrupt power grids and industrial control systems. Attacks on this sector can have physical consequences and national security implications. The increasing connectivity of operational technology (OT) systems with IT networks has expanded the attack surface. Many utilities still rely on legacy systems that were not designed with modern security in mind.',
            notable_incidents: '2021 Colonial Pipeline ransomware, 2020 US power grid penetration attempts, 2019 Ukrainian power grid attacks',
            top_threat_actors: 'Sandworm, Electrum, APT41, various ransomware groups',
            common_vulnerabilities: 'Unsecured industrial control systems, legacy OT/IT integration, insufficient network monitoring',
            avg_ransom_demand: '$4.8M',
            data_breach_impact: 'Critical (physical infrastructure impact, national security)'
          },
          { 
            id: 8, 
            name: 'Education', 
            attack_count: 134, 
            risk_level: 'MEDIUM', 
            trend: '↓ 3%', 
            top_threat: 'Data Breach',
            description: 'Educational institutions face growing cyber threats as they increasingly digitize operations and collect vast amounts of student and research data. Universities are targeted for their valuable intellectual property and research data, while K-12 schools are often targeted by ransomware groups due to their limited cybersecurity resources. The open nature of academic networks and the prevalence of BYOD policies create additional security challenges.',
            notable_incidents: '2023 Minneapolis Public Schools ransomware, 2022 Los Angeles Unified School District breach, 2021 University of California research data theft',
            top_threat_actors: 'LockBit, BlackCat, various ransomware groups',
            common_vulnerabilities: 'Open network architecture, insufficient IT security staff, legacy systems',
            avg_ransom_demand: '$1.2M',
            data_breach_impact: 'Medium (student data, research intellectual property)'
          },
          { 
            id: 9, 
            name: 'Legal Services', 
            attack_count: 112, 
            risk_level: 'MEDIUM', 
            trend: '↑ 7%', 
            top_threat: 'Ransomware',
            description: 'Law firms and legal service providers are increasingly targeted for the sensitive client information they hold, including corporate secrets, merger and acquisition details, and privileged attorney-client communications. The sector faces threats from ransomware groups seeking quick payouts and from competitors seeking strategic information. Many law firms lack dedicated cybersecurity resources, making them attractive targets despite the high value of their data.',
            notable_incidents: '2023 Grubman Shire Meiselas & Sacks ransomware, 2022 multiple law firm data breaches, 2021 Campari ransomware affecting legal partners',
            top_threat_actors: 'REvil, LockBit, BlackCat, Maze',
            common_vulnerabilities: 'Insufficient cybersecurity investment, third-party dependencies, email security gaps',
            avg_ransom_demand: '$3.5M',
            data_breach_impact: 'High (privileged client communications, M&A data)'
          },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchIndustries()
  }, [])

  const filteredIndustries = industries.filter(industry =>
    industry.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getTrendIcon = (trend: string) => {
    return trend.includes('↑') ? TrendingUp : TrendingDown
  }

  const getTrendColor = (trend: string) => {
    return trend.includes('↑') ? 'text-danger' : 'text-success'
  }

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
              <h1 className="text-2xl font-bold text-foreground text-glow">Most Targeted Industries</h1>
              <p className="text-secondary text-sm mt-1">Industries most frequently targeted by cyber attacks worldwide</p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search industries..."
                  className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Industries Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-48 bg-card rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredIndustries.map((industry, index) => (
                  <motion.div
                    key={industry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedIndustry(industry)}
                    className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-foreground">{industry.name}</h3>
                          <span className={`text-xs flex items-center gap-1 ${getTrendColor(industry.trend)}`}>
                            {industry.trend.includes('↑') ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {industry.trend}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-secondary">Attack Count</span>
                        <span className="text-foreground font-medium">{industry.attack_count}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-secondary">Risk Level</span>
                        <span className="text-foreground font-medium">{industry.risk_level}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-secondary">Top Threat</span>
                        <span className="text-foreground font-medium">{industry.top_threat || 'N/A'}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal for detailed industry information */}
      {selectedIndustry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedIndustry(null)}>
          <div className="bg-card border border-border rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selectedIndustry.name}</h2>
                  <span className={`text-xs flex items-center gap-1 ${getTrendColor(selectedIndustry.trend)}`}>
                    {selectedIndustry.trend.includes('↑') ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {selectedIndustry.trend}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedIndustry(null)} className="p-2 hover:bg-background rounded-lg transition-colors">
                <X className="w-5 h-5 text-secondary" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-2">Industry Overview</h3>
                <p className="text-sm text-secondary leading-relaxed">{selectedIndustry.description}</p>
              </div>

              {/* Key Information Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background/50 border border-border/40 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-secondary" />
                    <span className="text-xs text-secondary uppercase font-semibold tracking-wider">Attack Count</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{selectedIndustry.attack_count}</p>
                </div>
                <div className="bg-background/50 border border-border/40 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-secondary" />
                    <span className="text-xs text-secondary uppercase font-semibold tracking-wider">Risk Level</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{selectedIndustry.risk_level}</p>
                </div>
                <div className="bg-background/50 border border-border/40 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-secondary" />
                    <span className="text-xs text-secondary uppercase font-semibold tracking-wider">Top Threat</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{selectedIndustry.top_threat || 'Unknown'}</p>
                </div>
                <div className="bg-background/50 border border-border/40 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-secondary" />
                    <span className="text-xs text-secondary uppercase font-semibold tracking-wider">Avg Ransom</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{selectedIndustry.avg_ransom_demand || 'Unknown'}</p>
                </div>
              </div>

              {/* Top Threat Actors */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-2">Top Threat Actors</h3>
                <p className="text-sm text-secondary leading-relaxed">{selectedIndustry.top_threat_actors || 'Unknown'}</p>
              </div>

              {/* Common Vulnerabilities */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-2">Common Vulnerabilities</h3>
                <p className="text-sm text-secondary leading-relaxed">{selectedIndustry.common_vulnerabilities || 'Unknown'}</p>
              </div>

              {/* Notable Incidents */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-2">Notable Incidents</h3>
                <p className="text-sm text-secondary leading-relaxed">{selectedIndustry.notable_incidents || 'Unknown'}</p>
              </div>

              {/* Data Breach Impact */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-secondary" />
                  <span className="text-xs text-secondary uppercase font-semibold tracking-wider">Data Breach Impact</span>
                </div>
                <p className="text-sm text-secondary leading-relaxed">{selectedIndustry.data_breach_impact || 'Unknown'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
