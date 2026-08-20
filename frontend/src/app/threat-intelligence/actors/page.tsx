'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Activity, Search, AlertCircle, X, MapPin, Calendar, Shield, Globe } from 'lucide-react'
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
        setActors(data)
      } catch (error) {
        console.error('Error fetching threat actors:', error)
        // Fallback to mock data
        setActors([
          { 
            id: 1, 
            name: 'APT29 (Cozy Bear)', 
            activity_level: 'CRITICAL', 
            attack_count: 234, 
            targeted_sectors: ['Government', 'Healthcare', 'Finance'], 
            last_seen: '2 hours ago',
            country: 'Russia',
            description: 'APT29, also known as Cozy Bear, is a Russian state-sponsored threat group that has been active since at least 2008. They are known for sophisticated cyber espionage campaigns targeting government institutions, diplomatic organizations, and think tanks worldwide. The group typically uses spear-phishing emails with malicious attachments and exploits zero-day vulnerabilities to gain initial access. They are particularly known for their patience and persistence in maintaining long-term access to compromised networks.',
            additional_description: 'APT29 is believed to be operated by the Russian Foreign Intelligence Service (SVR). Their operations are characterized by careful planning, stealthy techniques, and a focus on gathering intelligence rather than causing disruption. They have been implicated in attacks against political organizations, research institutions, and government agencies across North America and Europe. The group is known for using custom malware and exploiting legitimate software vulnerabilities to maintain persistence.',
            techniques: 'Spear-phishing, Zero-day exploits, Custom malware, Living-off-the-land techniques, Credential harvesting, Web shell deployment',
            notable_incidents: '2016 US Election interference, COVID-19 vaccine research theft, 2020 SolarWinds supply chain attack',
            attribution: 'Russian Foreign Intelligence Service (SVR)',
            first_seen: '2008',
            motivations: 'Political espionage, Intelligence gathering, Strategic advantage',
            capabilities: 'Advanced persistent threat capabilities, Custom malware development, Zero-day exploitation, Long-term persistence',
            defenses: 'Network segmentation, Endpoint detection and response, User awareness training, Zero-trust architecture'
          },
          { 
            id: 2, 
            name: 'APT28 (Fancy Bear)', 
            activity_level: 'HIGH', 
            attack_count: 189, 
            targeted_sectors: ['Government', 'Defense', 'Energy'], 
            last_seen: '5 hours ago',
            country: 'Russia',
            description: 'APT28, also known as Fancy Bear, is a Russian military intelligence (GRU) hacking group that has been active since at least 2007. They specialize in cyber espionage and information warfare operations targeting government, military, and defense organizations globally. The group is known for using sophisticated phishing campaigns, exploiting vulnerabilities in network infrastructure, and deploying custom malware such as X-Agent and Sofacy. They have been implicated in numerous high-profile attacks including the 2016 Democratic National Committee breach.',
            additional_description: 'APT28 is attributed to the Russian military intelligence agency GRU, specifically Unit 26165. Unlike APT29 which focuses on stealthy intelligence gathering, APT28 is more aggressive and has been involved in disruptive operations. They are known for their speed and willingness to use destructive malware when necessary. The group has targeted election systems, government agencies, and military organizations across multiple countries.',
            techniques: 'Spear-phishing, Credential harvesting, Network infrastructure exploitation, Custom malware, Web application attacks',
            notable_incidents: '2016 DNC breach, NotPetya attacks, Olympic Destroyer, 2018 World Cup Football Federation breach',
            attribution: 'Russian Military Intelligence (GRU) - Unit 26165',
            first_seen: '2007',
            motivations: 'Political influence, Military intelligence, Disruption of critical infrastructure',
            capabilities: 'Custom malware development (X-Agent, Sofacy), Credential harvesting, Network penetration, Destructive malware deployment',
            defenses: 'Multi-factor authentication, Network monitoring, Incident response planning, Patch management'
          },
          { 
            id: 3, 
            name: 'Lazarus Group', 
            activity_level: 'CRITICAL', 
            attack_count: 312, 
            targeted_sectors: ['Finance', 'Crypto', 'Technology'], 
            last_seen: '1 hour ago',
            country: 'North Korea',
            description: 'The Lazarus Group is a North Korean state-sponsored hacking operation that has been active since at least 2009. They are known for financially motivated attacks including cryptocurrency heists, bank transfers, and ransomware operations. The group has evolved from espionage-focused operations to become one of the most financially successful cyber criminal organizations, stealing an estimated $2 billion in cryptocurrency alone. They are known for their advanced capabilities and ability to adapt to new security measures.',
            additional_description: 'Lazarus Group is believed to be operated by North Korea\'s Reconnaissance General Bureau. They initially focused on espionage against South Korean government and military targets but shifted to financially motivated operations to generate revenue for the regime. The group has demonstrated remarkable adaptability, quickly evolving their tactics to bypass security measures. They are known for sophisticated supply chain attacks and cryptocurrency theft operations.',
            techniques: 'Supply chain attacks, Cryptocurrency theft, Ransomware, Social engineering, Malware development',
            notable_incidents: 'Sony Pictures hack (2014), Bangladesh Bank heist ($81M stolen), WannaCry ransomware, Cryptocurrency exchange hacks',
            attribution: 'North Korean Reconnaissance General Bureau',
            first_seen: '2009',
            motivations: 'Financial gain, Regime funding, Espionage, Sanctions evasion',
            capabilities: 'Advanced malware development, Cryptocurrency exploitation, Supply chain compromise, Financial system penetration',
            defenses: 'Cold storage for cryptocurrency, Transaction monitoring, Supply chain security, Anti-money laundering controls'
          },
          { 
            id: 4, 
            name: 'LockBit', 
            activity_level: 'HIGH', 
            attack_count: 456, 
            targeted_sectors: ['Healthcare', 'Manufacturing', 'Retail'], 
            last_seen: '30 minutes ago',
            country: 'Unknown (RaaS)',
            description: 'LockBit is a ransomware-as-a-service (RaaS) operation that emerged in 2019 and has since become one of the most prolific ransomware groups. They operate on an affiliate model where developers provide the ransomware infrastructure and affiliates carry out attacks in exchange for a percentage of the ransom payments. LockBit is known for its double extortion tactics, encrypting victim data and threatening to leak it if the ransom is not paid. They have targeted organizations across all sectors globally.',
            additional_description: 'LockBit has evolved through multiple versions (LockBit 2.0, LockBit 3.0) with increasing sophistication. They are known for their aggressive marketing on dark web forums and their technical innovations in ransomware. The group maintains a data leak site where they publish stolen data from victims who refuse to pay. LockBit has been particularly successful in targeting large organizations with significant ability to pay ransoms.',
            techniques: 'Double extortion, RaaS model, Automated attacks, Data exfiltration, Lateral movement',
            notable_incidents: 'Attacks on 1000+ organizations, Boeing attack (2022), Royal Mail attack (2023), Hospital attacks',
            attribution: 'Ransomware-as-a-Service operation - likely Russia/Eastern Europe based',
            first_seen: '2019',
            motivations: 'Financial gain through ransom payments, Data monetization',
            capabilities: 'Automated ransomware deployment, Data exfiltration, Encryption of multiple systems, Affiliate network management',
            defenses: 'Regular backups, Network segmentation, Endpoint protection, Employee training, Incident response planning'
          },
          { 
            id: 5, 
            name: 'BlackCat (ALPHV)', 
            activity_level: 'HIGH', 
            attack_count: 278, 
            targeted_sectors: ['Finance', 'Legal', 'Technology'], 
            last_seen: '3 hours ago',
            country: 'Unknown (RaaS)',
            description: 'BlackCat, also known as ALPHV, is a ransomware-as-a-service group that emerged in 2021 and quickly gained notoriety for its sophisticated operations. They were one of the first major ransomware groups to use the Rust programming language for their malware, making it more difficult to analyze. BlackCat operates on an affiliate model and has been known to target large organizations with high ransom demands. They employ triple extortion tactics, encrypting data, threatening to leak it, and launching DDoS attacks against victims who refuse to pay.',
            additional_description: 'BlackCat is believed to be operated by former members of other ransomware groups, bringing significant experience to their operations. The Rust-based malware is cross-platform, capable of targeting Windows, Linux, and VMware ESXi systems. They have been particularly aggressive in targeting critical infrastructure and healthcare organizations. The group maintains a sophisticated dark web presence and uses professional-looking data leak sites.',
            techniques: 'Triple extortion, Rust-based malware, RaaS model, DDoS attacks, Cross-platform encryption',
            notable_incidents: 'Attack on Change Healthcare (2024), multiple critical infrastructure targets, healthcare sector attacks',
            attribution: 'Ransomware-as-a-Service operation - likely former REvil/BlackMatter members',
            first_seen: '2021',
            motivations: 'Financial gain through ransom payments, Maximum disruption for leverage',
            capabilities: 'Cross-platform malware, DDoS capabilities, Sophisticated encryption, Professional extortion operations',
            defenses: 'Multi-platform security, DDoS protection, Comprehensive backup strategy, Network segmentation'
          },
          { 
            id: 6, 
            name: 'Cl0p', 
            activity_level: 'MEDIUM', 
            attack_count: 156, 
            targeted_sectors: ['Manufacturing', 'Supply Chain', 'Energy'], 
            last_seen: '6 hours ago',
            country: 'Unknown (likely Russia/Eastern Europe)',
            description: 'Cl0p is a ransomware group that has been active since 2019, initially known for targeting healthcare organizations before shifting to supply chain attacks. They gained significant attention in 2020 and 2021 for exploiting vulnerabilities in managed file transfer software (MFT) to compromise hundreds of organizations. Cl0p is known for their aggressive data leak site where they publish stolen data from victims who refuse to pay ransom demands. They have been particularly successful in exploiting zero-day vulnerabilities in enterprise software.',
            additional_description: 'Cl0p has demonstrated exceptional skill in identifying and exploiting zero-day vulnerabilities in enterprise software. Their 2020 Accellion breach and 2023 MOVEit transfer attacks affected thousands of organizations worldwide through supply chain compromise. The group is known for their professional approach to extortion, maintaining a well-organized data leak site and communicating with victims and media. They have been one of the most successful ransomware groups in terms of victim count.',
            techniques: 'Supply chain attacks, Zero-day exploitation, Data leak site, MFT software exploitation, Large-scale data theft',
            notable_incidents: '2020 Accellion breach affecting 100+ orgs, 2023 MOVEit transfer attacks affecting 1000+ orgs, GoAnywhere MFT attacks',
            attribution: 'Unknown (likely Russia/Eastern Europe based)',
            first_seen: '2019',
            motivations: 'Financial gain through ransom payments, Data monetization at scale',
            capabilities: 'Zero-day vulnerability discovery, Supply chain compromise, Large-scale data exfiltration, Professional extortion operations',
            defenses: 'Supply chain security, Vulnerability management, Third-party risk assessment, Data loss prevention'
          },
          { 
            id: 7, 
            name: 'REvil', 
            activity_level: 'MEDIUM', 
            attack_count: 134, 
            targeted_sectors: ['Retail', 'Healthcare', 'Education'], 
            last_seen: '12 hours ago',
            country: 'Unknown (Russian-speaking)',
            description: 'REvil (also known as Sodinokibi) was a prominent Russian-speaking ransomware-as-a-service operation that was active from 2019 to 2021. They were known for demanding some of the highest ransom payments in the industry, with demands reaching up to $70 million. REvil operated through a network of affiliates who conducted attacks using the group\'s ransomware. The group gained international attention after attacking Kaseya, a software vendor, which affected hundreds of managed service providers and their customers. The group appeared to cease operations in 2021 following international law enforcement pressure.',
            additional_description: 'REvil was known for their bold public persona and aggressive tactics. They maintained a "Happy Blog" dark web site where they auctioned stolen data and negotiated with victims publicly. The group demanded some of the highest ransoms ever seen, with the $70 million demand against Kaseya being a notable example. In 2021, international law enforcement actions including FBI infiltration and Russian arrests led to the group\'s apparent dissolution, though some members are believed to have joined other operations.',
            techniques: 'RaaS model, Supply chain attacks, High ransom demands, Affiliate network, Public data auctions',
            notable_incidents: 'Kaseya supply chain attack (2021), JBS meat processing attack ($11M paid), Travelex attack, Colonial Pipeline negotiation attempt',
            attribution: 'Russian-speaking RaaS operation',
            first_seen: '2019',
            motivations: 'Maximum financial gain, Public notoriety, Disruption for leverage',
            capabilities: 'Sophisticated ransomware, Affiliate network management, Public extortion operations, High-value targeting',
            defenses: 'Supply chain security, Comprehensive backups, Incident response planning, Cyber insurance'
          },
          { 
            id: 8, 
            name: 'Conti', 
            activity_level: 'LOW', 
            attack_count: 89, 
            targeted_sectors: ['Finance', 'Government', 'Healthcare'], 
            last_seen: '1 day ago',
            country: 'Unknown (Russian-speaking)',
            description: 'Conti was a Russian-speaking ransomware cartel that operated from at least 2020 until 2022. They were known for their highly organized operations, professional customer service for victims, and sophisticated double extortion tactics. Conti operated as a ransomware-as-a-service operation with a complex affiliate structure. The group gained notoriety for their attacks on healthcare organizations during the COVID-19 pandemic. The group effectively disbanded in 2022 following internal leaks and international law enforcement actions, though some members are believed to have joined other ransomware operations.',
            additional_description: 'Conti was notable for their professional approach to criminal operations, including a "customer service" team to help victims pay ransoms and decrypt files. They maintained a complex internal structure with different teams for development, operations, and negotiations. In 2022, a Ukrainian security researcher leaked Conti\'s internal chat logs, revealing extensive details about their operations and leading to the group\'s collapse. Many former Conti members are believed to have joined other ransomware groups.',
            techniques: 'Double extortion, RaaS model, Professional victim support, Custom malware, Complex affiliate structure',
            notable_incidents: 'Healthcare attacks during COVID-19, Irish Health Service attack (2021), attacks on 400+ organizations',
            attribution: 'Russian-speaking criminal organization',
            first_seen: '2020',
            motivations: 'Financial gain, Professional criminal operations, Healthcare sector exploitation',
            capabilities: 'Sophisticated ransomware development, Professional operations management, Healthcare sector expertise',
            defenses: 'Healthcare-specific security measures, Regular backups, Network segmentation, Employee training'
          },
          { 
            id: 9, 
            name: 'Wizard Spider', 
            activity_level: 'HIGH', 
            attack_count: 201, 
            targeted_sectors: ['Finance', 'Healthcare', 'Technology'], 
            last_seen: '4 hours ago',
            country: 'Russia',
            description: 'Wizard Spider is a Russian cyber criminal group that has been active since at least 2016. They are the operators behind the notorious TrickBot malware and the Conti ransomware operation. The group is known for their sophisticated malware development and extensive criminal infrastructure. Wizard Spider has evolved from banking malware operations to become one of the most dangerous ransomware operators. They are known for their persistence and ability to adapt to law enforcement actions, rebranding and continuing operations under different names.',
            additional_description: 'Wizard Spider is considered one of the most sophisticated cyber criminal organizations operating today. They developed and operated TrickBot, one of the most prevalent banking trojans, which evolved into a full-featured malware platform. After Conti\'s collapse, many Wizard Spider members are believed to have rebranded under new names like BlackBasta and continue ransomware operations. The group has demonstrated remarkable resilience to law enforcement actions and continues to evolve their tactics.',
            techniques: 'Banking malware, Ransomware, Botnet operations, Credential theft, Malware-as-a-Service',
            notable_incidents: 'TrickBot botnet operations, Conti ransomware, numerous financial sector attacks, Emotet collaboration',
            attribution: 'Russian cyber criminal organization',
            first_seen: '2016',
            motivations: 'Financial gain, Long-term criminal operations, Malware platform development',
            capabilities: 'Sophisticated malware development, Botnet management, Banking trojan operations, Ransomware deployment',
            defenses: 'Endpoint detection and response, Network monitoring, Banking trojan protection, Credential management'
          },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchActors()
  }, [])

  const filteredActors = actors.filter(actor =>
    actor.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getActivityColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-danger bg-danger/10 border-danger/20'
      case 'HIGH': return 'text-warning bg-warning/10 border-warning/20'
      case 'MEDIUM': return 'text-primary bg-primary/10 border-primary/20'
      case 'LOW': return 'text-success bg-success/10 border-success/20'
      default: return 'text-secondary bg-secondary/10 border-secondary/20'
    }
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
              <h1 className="text-2xl font-bold text-foreground text-glow">Top Active Threat Actors</h1>
              <p className="text-secondary text-sm mt-1">Real-time tracking of the most active cyber threat actors worldwide</p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search threat actors..."
                  className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
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
                {filteredActors.map((actor, index) => (
                  <motion.div
                    key={actor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedActor(actor)}
                    className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-foreground">{actor.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getActivityColor(actor.activity_level)}`}>
                            {actor.activity_level}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-secondary">Attacks</span>
                        <span className="text-foreground font-medium">{actor.attack_count}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-secondary">Targeted Sectors</span>
                        <span className="text-foreground font-medium">{actor.targeted_sectors?.length || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-secondary">Last Seen</span>
                        <span className="text-foreground font-medium">{actor.last_seen || 'Unknown'}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal for detailed actor information */}
      {selectedActor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedActor(null)}>
          <div className="bg-card border border-border rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selectedActor.name}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getActivityColor(selectedActor.activity_level)}`}>
                    {selectedActor.activity_level}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedActor(null)} className="p-2 hover:bg-background rounded-lg transition-colors">
                <X className="w-5 h-5 text-secondary" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-2">Description</h3>
                <p className="text-sm text-secondary leading-relaxed">{selectedActor.description}</p>
              </div>

              {/* Additional Description */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-2">Additional Details</h3>
                <p className="text-sm text-secondary leading-relaxed">{selectedActor.additional_description}</p>
              </div>

              {/* Key Information Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background/50 border border-border/40 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-secondary" />
                    <span className="text-xs text-secondary uppercase font-semibold tracking-wider">Country</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{selectedActor.country || 'Unknown'}</p>
                </div>
                <div className="bg-background/50 border border-border/40 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-secondary" />
                    <span className="text-xs text-secondary uppercase font-semibold tracking-wider">First Seen</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{selectedActor.first_seen || 'Unknown'}</p>
                </div>
                <div className="bg-background/50 border border-border/40 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-secondary" />
                    <span className="text-xs text-secondary uppercase font-semibold tracking-wider">Attack Count</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{selectedActor.attack_count}</p>
                </div>
                <div className="bg-background/50 border border-border/40 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-secondary" />
                    <span className="text-xs text-secondary uppercase font-semibold tracking-wider">Attribution</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{selectedActor.attribution || 'Unknown'}</p>
                </div>
              </div>

              {/* Targeted Sectors */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-2">Targeted Sectors</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedActor.targeted_sectors?.map((sector: string, idx: number) => (
                    <span key={idx} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                      {sector}
                    </span>
                  ))}
                </div>
              </div>

              {/* Motivations */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-2">Motivations</h3>
                <p className="text-sm text-secondary leading-relaxed">{selectedActor.motivations || 'Unknown'}</p>
              </div>

              {/* Capabilities */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-2">Capabilities</h3>
                <p className="text-sm text-secondary leading-relaxed">{selectedActor.capabilities || 'Unknown'}</p>
              </div>

              {/* Techniques */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-2">Attack Techniques</h3>
                <p className="text-sm text-secondary leading-relaxed">{selectedActor.techniques || 'Unknown'}</p>
              </div>

              {/* Notable Incidents */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-2">Notable Incidents</h3>
                <p className="text-sm text-secondary leading-relaxed">{selectedActor.notable_incidents || 'Unknown'}</p>
              </div>

              {/* Defenses */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-2">Recommended Defenses</h3>
                <p className="text-sm text-secondary leading-relaxed">{selectedActor.defenses || 'Unknown'}</p>
              </div>

              {/* Last Seen */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary">Last Seen</span>
                  <span className="text-foreground font-medium">{selectedActor.last_seen || 'Unknown'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
