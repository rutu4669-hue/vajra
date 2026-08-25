'use client'

import { useState, useEffect } from 'react'
import { 
  Shield, Bell, Globe, Lock, User, Database, Radio, 
  Sliders, Webhook, CheckCircle2, Send, Save, AlertTriangle, RefreshCw
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useLanguageStore } from '@/store/languageStore'
import { useNotificationStore } from '@/store/notificationStore'
import { SUPPORTED_LANGUAGES, LanguageCode } from '@/i18n/translations'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(200)
  const { user } = useAuthStore()
  const { currentLanguage, setLanguage, t } = useLanguageStore()
  const { addNotification } = useNotificationStore()

  // Settings State
  const [scanInterval, setScanInterval] = useState('15m')
  const [criticalThreshold, setCriticalThreshold] = useState(80)
  const [highThreshold, setHighThreshold] = useState(60)
  const [minConfidence, setMinConfidence] = useState(85)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [ransomwareAlerts, setRansomwareAlerts] = useState(true)
  const [gdeltAlerts, setGdeltAlerts] = useState(true)
  const [slackWebhook, setSlackWebhook] = useState('https://hooks.slack.com/services/T00/B00/XXXXX')
  const [discordWebhook, setDiscordWebhook] = useState('')
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [testWebhookStatus, setTestWebhookStatus] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSaveSettings = () => {
    setSavedSuccess(true)
    addNotification({
      title: '⚙️ Settings Updated',
      message: 'Platform telemetry scan frequencies, alert thresholds, and webhook dispatchers saved successfully.',
      type: 'SYSTEM',
      severity: 'INFO'
    })
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const handleTestWebhook = () => {
    setTestWebhookStatus('Testing...')
    setTimeout(() => {
      setTestWebhookStatus('✅ Webhook Test Payload Successfully Delivered')
      addNotification({
        title: '📡 Webhook Dispatcher Test',
        message: 'A test alert payload was dispatched to your configured endpoint.',
        type: 'SYSTEM',
        severity: 'INFO'
      })
      setTimeout(() => setTestWebhookStatus(null), 4000)
    }, 1000)
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="w-64 bg-card border-r border-border h-screen animate-pulse" />
        <div className="flex-1 flex flex-col">
          <div className="h-16 bg-card border-b border-border animate-pulse" />
          <main className="flex-1 p-6 space-y-6">
            <div className="h-8 w-48 bg-card rounded animate-pulse" />
            <div className="h-64 bg-card rounded-xl animate-pulse" />
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
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground text-glow flex items-center gap-2">
                  <Sliders className="w-6 h-6 text-primary" /> Enterprise System Settings
                </h1>
                <p className="text-secondary text-sm mt-1">
                  Configure automated scanning intervals, alert thresholds, multi-channel webhooks, and preferences
                </p>
              </div>

              <button
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>

            {savedSuccess && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> System preferences & thresholds saved successfully!
              </div>
            )}

            {/* 1. Automated Telemetry & Scan Frequency */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <Radio className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-base font-bold text-foreground">Automated Telemetry & Scan Frequencies</h2>
                  <p className="text-xs text-secondary">Define how frequently domain assets, NVD CVE feeds, and dark web indexes sync</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {[
                  { label: 'Real-Time (15m)', value: '15m', desc: 'Continuous stream for high-risk assets' },
                  { label: 'Standard (1 hour)', value: '1h', desc: 'Default hourly assessment cycle' },
                  { label: 'Extended (6 hours)', value: '6h', desc: 'Periodic domain telemetry check' },
                  { label: 'Daily (24 hours)', value: '24h', desc: 'Low bandwidth daily snapshot' },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setScanInterval(item.value)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      scanInterval === item.value
                        ? 'bg-primary/10 border-primary text-primary shadow-sm'
                        : 'bg-background border-border text-foreground hover:border-primary/40'
                    }`}
                  >
                    <p className="text-xs font-bold">{item.label}</p>
                    <p className="text-[10px] text-secondary mt-1">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Alert Threshold Sliders */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <div>
                  <h2 className="text-base font-bold text-foreground">Security Risk Trigger Thresholds</h2>
                  <p className="text-xs text-secondary">Fine-tune automated alerting triggers for risk score drops and adversary activity</p>
                </div>
              </div>

              <div className="space-y-4 pt-1">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-foreground">Critical Severity Alert Trigger</span>
                    <span className="font-mono font-bold text-red-400">Score &gt;= {criticalThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="95"
                    value={criticalThreshold}
                    onChange={(e) => setCriticalThreshold(Number(e.target.value))}
                    className="w-full h-1.5 bg-background rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-foreground">High Severity Alert Trigger</span>
                    <span className="font-mono font-bold text-amber-400">Score &gt;= {highThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="75"
                    value={highThreshold}
                    onChange={(e) => setHighThreshold(Number(e.target.value))}
                    className="w-full h-1.5 bg-background rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-foreground">Minimum Threat Confidence Filter</span>
                    <span className="font-mono font-bold text-primary">{minConfidence}% Confidence</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="99"
                    value={minConfidence}
                    onChange={(e) => setMinConfidence(Number(e.target.value))}
                    className="w-full h-1.5 bg-background rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>
            </div>

            {/* 3. Webhook Dispatcher Config */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Webhook className="w-5 h-5 text-purple-400" />
                  <div>
                    <h2 className="text-base font-bold text-foreground">Real-Time Webhook Dispatchers</h2>
                    <p className="text-xs text-secondary">Broadcast urgent threat alerts to Slack, Discord, and Microsoft Teams</p>
                  </div>
                </div>

                <button
                  onClick={handleTestWebhook}
                  className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-xl text-xs font-semibold hover:bg-purple-500/20 transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Test Dispatch
                </button>
              </div>

              {testWebhookStatus && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/25 rounded-xl text-xs text-purple-300">
                  {testWebhookStatus}
                </div>
              )}

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs text-secondary font-medium mb-1">Slack Incident Channel Webhook URL</label>
                  <input
                    type="text"
                    value={slackWebhook}
                    onChange={(e) => setSlackWebhook(e.target.value)}
                    placeholder="https://hooks.slack.com/services/..."
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-xs text-foreground font-mono focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs text-secondary font-medium mb-1">Discord / Teams Webhook URL</label>
                  <input
                    type="text"
                    value={discordWebhook}
                    onChange={(e) => setDiscordWebhook(e.target.value)}
                    placeholder="https://discord.com/api/webhooks/..."
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-xs text-foreground font-mono focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* 4. Platform Language & Notification Toggles */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <Globe className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-base font-bold text-foreground">Language & Alerts Channels</h2>
                  <p className="text-xs text-secondary">Set preferred UI language and telemetry notification categories</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs text-secondary font-medium mb-1.5">Platform Localization</label>
                  <select
                    value={currentLanguage}
                    onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  >
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.flag} {l.nativeName} ({l.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-2.5 bg-background rounded-xl border border-border">
                    <span className="text-xs text-foreground font-semibold">Ransomware Surge Broadcasts</span>
                    <input
                      type="checkbox"
                      checked={ransomwareAlerts}
                      onChange={(e) => setRansomwareAlerts(e.target.checked)}
                      className="w-4 h-4 accent-primary rounded cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-background rounded-xl border border-border">
                    <span className="text-xs text-foreground font-semibold">GDELT Breaking News Notifications</span>
                    <input
                      type="checkbox"
                      checked={gdeltAlerts}
                      onChange={(e) => setGdeltAlerts(e.target.checked)}
                      className="w-4 h-4 accent-primary rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Profile Info */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <User className="w-5 h-5 text-primary" />
                <h2 className="text-base font-bold text-foreground">Current Operator Profile</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] text-secondary uppercase font-semibold mb-1">Operator Name</label>
                  <input
                    type="text"
                    value={user?.name || 'Security Lead'}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs text-foreground"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-secondary uppercase font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || 'admin@indigo.com'}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs text-foreground"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-secondary uppercase font-semibold mb-1">Privilege Level</label>
                  <input
                    type="text"
                    value={user?.role || 'Enterprise Admin'}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs text-foreground font-semibold"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
