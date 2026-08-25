'use client'

import { useState } from 'react'
import { Bell, Globe, Search, Bot, User, LogOut, X, Send, Loader2, ChevronDown, Download, Shield, AlertTriangle, Radio, ExternalLink, CheckCheck } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useCompanyStore } from '@/store/companyStore'
import { useLanguageStore } from '@/store/languageStore'
import { useNotificationStore } from '@/store/notificationStore'
import { SUPPORTED_LANGUAGES, LanguageCode } from '@/i18n/translations'
import { aiService } from '@/services/ai.service'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const { selectedCompany } = useCompanyStore()
  const { currentLanguage, setLanguage, t } = useLanguageStore()
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotificationStore()
  const router = useRouter()

  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)
  const [downloadingReport, setDownloadingReport] = useState(false)
  const [reportDropdownOpen, setReportDropdownOpen] = useState(false)
  const [notifFilter, setNotifFilter] = useState<'ALL' | 'CRITICAL' | 'RANSOMWARE' | 'GDELT'>('ALL')

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const handleDownloadReport = async (reportType: string) => {
    setDownloadingReport(true)
    setReportDropdownOpen(false)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vajra-9pjh.onrender.com'
      const url = selectedCompany 
        ? `${API_URL}/api/reports/company/${selectedCompany.id}`
        : `${API_URL}/api/reports/${reportType}`
      
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = selectedCompany 
        ? `${selectedCompany.name.replace(' ', '_')}_report.pdf`
        : `${reportType}_report.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Error downloading report:', error)
      alert('Failed to download report. Please try again.')
    } finally {
      setDownloadingReport(false)
    }
  }

  const handleAskAI = async () => {
    if (!aiPrompt.trim()) return
    
    setAiLoading(true)
    setAiResponse('')
    
    try {
      const response = await aiService.generateResponse(aiPrompt, 'Cybersecurity threat intelligence platform')
      setAiResponse(response.response)
    } catch (error) {
      setAiResponse('Error generating AI response. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const sectionMap: { [key: string]: string } = {
        'threat': 'threat-intelligence',
        'intelligence': 'threat-intelligence',
        'ransomware': 'ransomware',
        'attack': 'global-attacks',
        'map': 'global-attacks',
        'company': 'companies',
        'companies': 'companies',
        'alert': 'alerts',
        'news': 'updates',
        'actor': 'threat-intelligence/actors',
        'industry': 'threat-intelligence/industries',
        'domain': 'domain-analysis',
        'pulse': 'domain-analysis',
        'setting': 'settings',
        'admin': 'admin',
      }
      
      let matchedSection = null
      for (const [key, section] of Object.entries(sectionMap)) {
        if (query.includes(key)) {
          matchedSection = section
          break
        }
      }
      
      if (matchedSection) {
        router.push(`/${matchedSection}`)
        setSearchQuery('')
      } else {
        router.push(`/companies`)
        setSearchQuery('')
      }
    }
  }

  const filteredNotifs = notifications.filter((n) => {
    if (notifFilter === 'CRITICAL') return n.severity === 'CRITICAL'
    if (notifFilter === 'RANSOMWARE') return n.type === 'RANSOMWARE'
    if (notifFilter === 'GDELT') return n.type === 'GDELT_NEWS'
    return true
  })

  const currentLangMeta = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0]

  return (
    <>
      <nav className="h-16 bg-card border-b border-border px-6 flex items-center justify-between sticky top-0 z-40">
        {/* Search Bar */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
            <input
              type="text"
              placeholder={t('searchPlaceholder', 'Search threats, domains, CVEs, ransomware...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-foreground placeholder-secondary/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </form>

          {/* Download Report Dropdown */}
          <div className="relative">
            <button
              onClick={() => setReportDropdownOpen(!reportDropdownOpen)}
              disabled={downloadingReport}
              className="flex items-center gap-1.5 px-3 py-2 bg-background border border-border rounded-xl text-xs font-semibold text-foreground hover:border-primary/50 transition-colors disabled:opacity-50"
            >
              {downloadingReport ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              ) : (
                <Download className="w-3.5 h-3.5 text-primary" />
              )}
              <span>{t('downloadPdf', 'Report')}</span>
              <ChevronDown className="w-3 h-3 text-secondary" />
            </button>

            {reportDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                <button
                  onClick={() => handleDownloadReport('dashboard')}
                  className="w-full text-left px-4 py-2.5 text-xs text-foreground hover:bg-background/80 flex items-center justify-between transition-colors"
                >
                  <span>Full Platform Report</span>
                  <span className="text-[10px] text-primary font-mono">PDF</span>
                </button>
                <button
                  onClick={() => handleDownloadReport('threat-intelligence')}
                  className="w-full text-left px-4 py-2.5 text-xs text-foreground hover:bg-background/80 flex items-center justify-between transition-colors"
                >
                  <span>Threat Intelligence Report</span>
                  <span className="text-[10px] text-primary font-mono">PDF</span>
                </button>
                <button
                  onClick={() => handleDownloadReport('ransomware')}
                  className="w-full text-left px-4 py-2.5 text-xs text-foreground hover:bg-background/80 flex items-center justify-between transition-colors"
                >
                  <span>Ransomware Live Report</span>
                  <span className="text-[10px] text-primary font-mono">PDF</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl bg-background border border-border hover:border-primary/50 transition-colors"
              title="Platform Notifications"
            >
              <Bell className="w-4 h-4 text-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger rounded-full text-[10px] text-white flex items-center justify-center font-bold shadow-glow-red animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-96 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-3.5 border-b border-border bg-background/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-primary animate-pulse" />
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">{t('notifications', 'Notifications')}</h3>
                    <span className="text-[10px] px-2 py-0.5 bg-primary/15 text-primary rounded-full font-mono font-bold">
                      {unreadCount} unread
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
                    >
                      <CheckCheck className="w-3 h-3" /> {t('markAllRead', 'Mark read')}
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 px-3 py-2 border-b border-border/50 bg-card/80 text-[10px] font-semibold">
                  {(['ALL', 'CRITICAL', 'RANSOMWARE', 'GDELT'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setNotifFilter(filter)}
                      className={`px-2 py-0.5 rounded-md transition-colors ${
                        notifFilter === filter ? 'bg-primary text-white' : 'text-secondary hover:text-foreground'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
                  {filteredNotifs.length === 0 ? (
                    <div className="p-8 text-center text-secondary">
                      <p className="text-xs">{t('noNotifications', 'No notifications matching filter')}</p>
                    </div>
                  ) : (
                    filteredNotifs.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markAsRead(notif.id)
                          if (notif.link) router.push(notif.link)
                          setNotificationsOpen(false)
                        }}
                        className={`p-3.5 hover:bg-background/80 transition-colors cursor-pointer ${
                          !notif.is_read ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                            notif.severity === 'CRITICAL' ? 'bg-red-400 shadow-glow-red' :
                            notif.severity === 'HIGH' ? 'bg-amber-400' : 'bg-blue-400'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <p className="text-xs font-semibold text-foreground truncate">{notif.title}</p>
                              <span className="text-[10px] text-secondary font-mono flex-shrink-0">{notif.timestamp}</span>
                            </div>
                            <p className="text-[11px] text-secondary leading-relaxed line-clamp-2">{notif.message}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2.5 border-t border-border bg-background/50 flex items-center justify-between text-xs">
                  <button 
                    onClick={clearAll}
                    className="text-[11px] text-secondary hover:text-danger transition-colors"
                  >
                    Clear all
                  </button>
                  <button 
                    onClick={() => { router.push('/alerts'); setNotificationsOpen(false) }}
                    className="text-[11px] text-primary hover:underline font-semibold"
                  >
                    View All Security Alerts →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Multi-Language Selector */}
          <div className="relative">
            <button 
              onClick={() => setLanguageOpen(!languageOpen)}
              className="px-2.5 py-1.5 rounded-xl bg-background border border-border hover:border-primary/50 transition-colors flex items-center gap-1.5 text-xs font-semibold text-foreground"
              title="Select Language"
            >
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span>{currentLangMeta.flag} {currentLangMeta.code.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3 text-secondary" />
            </button>
            
            {languageOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                <div className="px-3 py-1.5 border-b border-border text-[10px] text-secondary font-bold uppercase tracking-wider">
                  Platform Language
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code as LanguageCode)
                      setLanguageOpen(false)
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                      currentLanguage === lang.code ? 'bg-primary/10 text-primary font-bold' : 'text-foreground hover:bg-background/80'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </span>
                    <span className="text-[10px] text-secondary font-mono uppercase">{lang.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-3 border-l border-border">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-sm">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-semibold text-foreground truncate max-w-[100px]">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-secondary truncate">{user?.role || 'SOC Lead'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-card-hover transition-colors text-secondary hover:text-danger ml-1"
              title={t('logout', 'Logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* AI Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Maya - AI Security Assistant</h3>
              </div>
              <button
                onClick={() => setAiModalOpen(false)}
                className="p-1 rounded-lg hover:bg-background transition-colors text-secondary hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4">
              {aiResponse && (
                <div className="bg-background border border-border rounded-xl p-4">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{aiResponse}</p>
                </div>
              )}
              
              {aiLoading && (
                <div className="flex items-center justify-center gap-2 text-secondary py-6">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-xs">Analyzing security telemetry...</span>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border flex gap-2">
              <input
                type="text"
                placeholder="Ask about threats, CVEs, or security recommendations..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-xs text-foreground placeholder:text-secondary focus:outline-none focus:border-primary"
              />
              <button
                onClick={handleAskAI}
                disabled={aiLoading}
                className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
