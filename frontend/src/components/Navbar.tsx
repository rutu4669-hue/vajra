'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, Globe, Search, Bot, User, LogOut, X, Send, Loader2, ChevronDown, Download } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useCompanyStore } from '@/store/companyStore'
import { aiService } from '@/services/ai.service'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const { selectedCompany } = useCompanyStore()
  const router = useRouter()
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [downloadingReport, setDownloadingReport] = useState(false)
  const [reportDropdownOpen, setReportDropdownOpen] = useState(false)
  const { token } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const handleDownloadReport = async (reportType: string) => {
    setDownloadingReport(true)
    setReportDropdownOpen(false)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
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
      
      // Map search terms to dashboard sections
      const sectionMap: { [key: string]: string } = {
        'threat': 'threat-intelligence',
        'intelligence': 'threat-intelligence',
        'ransomware': 'ransomware',
        'attack': 'global-attacks',
        'map': 'global-attacks',
        'global': 'global-attacks',
        'alert': 'alerts',
        'critical': 'alerts',
        'news': 'updates',
        'update': 'updates',
        'trend': 'risk-counters',
        'risk': 'risk-counters',
        'counter': 'risk-counters',
        'actor': 'threat-intelligence/actors',
        'data': 'data-sources',
        'source': 'data-sources',
        'executive': 'executive-summary',
        'summary': 'executive-summary',
        'setting': 'settings',
        'admin': 'admin',
      }
      
      // Find matching section
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
        // If no match, try to navigate to the section directly
        const possibleRoutes = [
          '/threat-intelligence',
          '/ransomware',
          '/global-attacks',
          '/alerts',
          '/updates',
          '/risk-counters',
          '/threat-intelligence/actors',
          '/data-sources',
          '/executive-summary',
          '/settings',
          '/admin',
        ]
        
        // Check if query matches any route
        for (const route of possibleRoutes) {
          if (route.includes(query) || query.includes(route.replace('/', ''))) {
            router.push(route)
            setSearchQuery('')
            return
          }
        }
        
        // If still no match, show alert
        alert(`No section found for "${searchQuery}". Try: threat, ransomware, attack, alert, news, trend, actor, data, executive, settings, admin`)
      }
    }
  }

  const languages = ['English', 'Spanish', 'French', 'German', 'Japanese']

  const fetchNotifications = useCallback(async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }, [token])

  const fetchUnreadCount = useCallback(async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_URL}/api/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.count)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }, [token])

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications()
      fetchUnreadCount()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [fetchNotifications, fetchUnreadCount])

  const markAsRead = async (notificationId: number) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      fetchNotifications()
      fetchUnreadCount()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      await fetch(`${API_URL}/api/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      fetchNotifications()
      fetchUnreadCount()
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  return (
    <>
      <nav className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shadow-glow">
        {/* Logo and Search Bar */}
        <div className="flex items-center gap-4 flex-1">
          <img src="/logo.png" alt="VAJRA Logo" className="h-10 w-auto object-contain" onError={(e) => { console.error('Logo failed to load:', e); (e.target as HTMLImageElement).style.display = 'none'; }} />
          <div className="flex-1 max-w-xl">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search anything..."
                  className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:shadow-glow transition-all"
                />
              </div>
            </form>
          </div>
          
          {/* Download Report Button */}
          <div className="relative">
            <button
              onClick={() => setReportDropdownOpen(!reportDropdownOpen)}
              disabled={downloadingReport}
              className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-50 text-xs font-semibold shadow-md shadow-blue-600/30"
              title="Download PDF Report"
            >
              {downloadingReport ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="inline font-medium">PDF</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>
            
            {reportDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-glow z-50">
                <div className="p-2">
                  <div className="border-t border-border/50 my-1" />
                  <button
                    onClick={() => handleDownloadReport('comprehensive')}
                    className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-background/50 transition-colors rounded-lg flex items-center gap-2 font-semibold"
                  >
                    <Download className="w-3 h-3 text-primary" />
                    Overall
                  </button>
                  <div className="border-t border-border/50 my-1" />
                  <button
                    onClick={() => handleDownloadReport('executive')}
                    className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-background/50 transition-colors rounded-lg flex items-center gap-2"
                  >
                    <Download className="w-3 h-3 text-primary" />
                    Executive
                  </button>
                  <button
                    onClick={() => handleDownloadReport('threat-intelligence')}
                    className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-background/50 transition-colors rounded-lg flex items-center gap-2"
                  >
                    <Download className="w-3 h-3 text-primary" />
                    Threat Intel
                  </button>
                  <button
                    onClick={() => handleDownloadReport('ransomware')}
                    className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-background/50 transition-colors rounded-lg flex items-center gap-2"
                  >
                    <Download className="w-3 h-3 text-primary" />
                    Ransomware
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-1.5 rounded-lg hover:bg-card-hover transition-colors"
            >
              <Bell className="w-4 h-4 text-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-danger rounded-full text-xs text-white flex items-center justify-center font-bold shadow-glow-red">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-glow z-50">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-primary hover:text-primary-hover"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-secondary">
                      <p className="text-sm">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => !notif.is_read && markAsRead(notif.id)}
                        className={`p-3 border-b border-border/50 hover:bg-background/50 transition-colors cursor-pointer ${
                          !notif.is_read ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {!notif.is_read && (
                            <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0 shadow-glow" />
                          )}
                          <div className="flex-1">
                            <p className="text-xs text-foreground">{notif.message}</p>
                            <p className="text-xs text-secondary mt-1">{notif.time_ago || notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 border-t border-border">
                  <button className="text-xs text-primary hover:text-primary-hover w-full text-center">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Language */}
          <div className="relative">
            <button 
              onClick={() => setLanguageOpen(!languageOpen)}
              className="p-1.5 rounded-lg hover:bg-card-hover transition-colors flex items-center gap-1"
            >
              <Globe className="w-4 h-4 text-foreground" />
              <ChevronDown className="w-3 h-3 text-secondary" />
            </button>
            
            {languageOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-card border border-border rounded-xl shadow-glow z-50">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguageOpen(false)}
                    className="w-full text-left px-4 py-2 text-xs text-foreground hover:bg-background/50 transition-colors"
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Admin Profile */}
          <div className="flex items-center gap-2 pl-3 border-l border-border">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-medium text-foreground">{user?.name || 'Admin'}</p>
              <p className="text-xs text-secondary">{user?.role || 'SOC'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-card-hover transition-colors text-secondary hover:text-danger"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* AI Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-glow">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Maya - AI Security Assistant</h3>
              </div>
              <button
                onClick={() => setAiModalOpen(false)}
                className="p-1 rounded-lg hover:bg-card-hover transition-colors text-secondary hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {aiResponse && (
                <div className="bg-background border border-border rounded-lg p-4">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{aiResponse}</p>
                </div>
              )}
              
              {aiLoading && (
                <div className="flex items-center justify-center gap-2 text-secondary">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Generating response...</span>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
                  placeholder="Ask about cybersecurity threats, vulnerabilities, or security analysis..."
                  className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-sm text-foreground placeholder-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  disabled={aiLoading}
                />
                <button
                  onClick={handleAskAI}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {aiLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
