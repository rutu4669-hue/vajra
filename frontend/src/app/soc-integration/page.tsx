'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Plus, Settings, Activity, Clock, CheckCircle, XCircle, AlertCircle, Trash2, TestTube, RefreshCw, Upload, Download, FileText, BarChart3, X } from 'lucide-react'
import { socService } from '@/services/soc.service'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

export default function SocIntegrationPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(200)
  const [mounted, setMounted] = useState(false)
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [testingConnection, setTestingConnection] = useState<string | null>(null)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [showReportsModal, setShowReportsModal] = useState(false)
  const [selectedProviderForReports, setSelectedProviderForReports] = useState<any>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [reports, setReports] = useState<any[]>([])
  const [generatingReport, setGeneratingReport] = useState(false)
  const [showReportLogsModal, setShowReportLogsModal] = useState(false)
  const [allReports, setAllReports] = useState<any[]>([])
  const [timeFilter, setTimeFilter] = useState('all')
  const [verificationFilter, setVerificationFilter] = useState('all')
  const [verifyingReport, setVerifyingReport] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [showVerificationDetails, setShowVerificationDetails] = useState(false)
  const [showAddReportModal, setShowAddReportModal] = useState(false)
  const [uploadingReport, setUploadingReport] = useState(false)
  const [selectedProviderForUpload, setSelectedProviderForUpload] = useState<any>(null)

  const [newProvider, setNewProvider] = useState({
    name: '',
    type: 'SIEM',
    endpoint: '',
    apiKey: '',
    syncFrequency: 'hourly',
    dataTypes: ['alerts', 'threat-intel', 'ransomware'],
    direction: 'export',
    enableApiAccess: false,
    webhookUrl: '',
    webhookSecret: ''
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      const data = await socService.getSocProviders()
      setProviders(data)
    } catch (error) {
      console.error('Error fetching SOC providers:', error)
      // Fallback to mock data
      setProviders([
        {
          id: '1',
          name: 'CrowdStrike Falcon',
          type: 'SIEM',
          endpoint: 'https://api.crowdstrike.com',
          status: 'active',
          lastSync: '2 hours ago',
          syncFrequency: 'hourly',
          dataTypes: ['alerts', 'threat-intel', 'ransomware'],
          totalExports: 1234
        },
        {
          id: '2',
          name: 'Splunk SIEM',
          type: 'SIEM',
          endpoint: 'https://api.splunk.com',
          status: 'active',
          lastSync: '1 hour ago',
          syncFrequency: 'real-time',
          dataTypes: ['alerts', 'threat-intel'],
          totalExports: 892
        },
        {
          id: '3',
          name: 'Microsoft Sentinel',
          type: 'SIEM',
          endpoint: 'https://api.azure.microsoft.com',
          status: 'inactive',
          lastSync: '3 days ago',
          syncFrequency: 'daily',
          dataTypes: ['alerts'],
          totalExports: 456
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleAddProvider = async () => {
    // Validation
    if (!newProvider.name.trim()) {
      alert('Please enter a provider name')
      return
    }
    if (!newProvider.endpoint.trim()) {
      alert('Please enter an API endpoint')
      return
    }
    if (!newProvider.apiKey.trim()) {
      alert('Please enter an API key')
      return
    }
    if (newProvider.dataTypes.length === 0) {
      alert('Please select at least one data type')
      return
    }

    try {
      console.log('Adding provider with data:', newProvider)
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
      
      const result = await socService.addSocProvider(newProvider)
      console.log('Add result:', result)
      
      setShowAddModal(false)
      setNewProvider({
        name: '',
        type: 'SIEM',
        endpoint: '',
        apiKey: '',
        syncFrequency: 'hourly',
        dataTypes: ['alerts', 'threat-intel', 'ransomware'],
        direction: 'export',
        enableApiAccess: false,
        webhookUrl: '',
        webhookSecret: ''
      })
      fetchProviders()
      alert('SOC provider added successfully!')
    } catch (error: any) {
      console.error('Error adding SOC provider:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      })
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to add provider'
      alert(`Failed to add provider: ${errorMessage}`)
    }
  }

  const handleTestConnection = async (id: string) => {
    setTestingConnection(id)
    try {
      await socService.testSocConnection(id)
      alert('Connection successful!')
    } catch (error) {
      alert('Connection failed. Please check your configuration.')
    } finally {
      setTestingConnection(null)
    }
  }

  const handleSync = async (id: string) => {
    setSyncing(id)
    try {
      await socService.syncWithSoc(id)
      fetchProviders()
      alert('Sync completed successfully!')
    } catch (error) {
      alert('Sync failed. Please try again.')
    } finally {
      setSyncing(null)
    }
  }

  const handleGenerateApiKey = async (id: string) => {
    try {
      const result = await socService.generateApiKey(id)
      alert(`API Key Generated: ${result.api_key}\nAPI Endpoint: ${result.api_endpoint}`)
      fetchProviders()
    } catch (error) {
      alert('Failed to generate API key')
    }
  }

  const handleDeleteProvider = async (id: string) => {
    if (confirm('Are you sure you want to delete this SOC provider?')) {
      try {
        await socService.deleteSocProvider(id)
        fetchProviders()
      } catch (error) {
        console.error('Error deleting SOC provider:', error)
      }
    }
  }

  const handleViewReports = async (provider: any) => {
    setSelectedProviderForReports(provider)
    setShowReportsModal(true)
    try {
      const data = await socService.getSocReports(provider.id)
      setReports(data.reports || [])
    } catch (error) {
      console.error('Error fetching reports:', error)
      setReports([])
    }
  }

  const handleUploadReport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedProviderForReports) return

    setUploadingFile(true)
    try {
      await socService.uploadSocReport(selectedProviderForReports.id, file)
      alert('Report uploaded successfully')
      handleViewReports(selectedProviderForReports) // Refresh reports
    } catch (error) {
      alert('Failed to upload report')
    } finally {
      setUploadingFile(false)
      event.target.value = '' // Reset file input
    }
  }

  const handleDownloadReport = async (filename: string) => {
    if (!selectedProviderForReports) return
    try {
      const blob = await socService.downloadSocReport(selectedProviderForReports.id, filename)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      alert('Failed to download report')
    }
  }

  const handleGenerateReport = async () => {
    if (!selectedProviderForReports) return
    setGeneratingReport(true)
    try {
      const result = await socService.generateSocReport(selectedProviderForReports.id, 'summary')
      alert('Report generated successfully')
      console.log('Generated report:', result.report)
    } catch (error) {
      alert('Failed to generate report')
    } finally {
      setGeneratingReport(false)
    }
  }

  const handleExportLogs = async (format: string) => {
    if (!selectedProviderForReports) return
    try {
      const data = await socService.exportSocLogs(selectedProviderForReports.id, format)
      
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${selectedProviderForReports.name}_logs_${Date.now()}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } else if (format === 'csv') {
        const blob = new Blob([data.data], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${selectedProviderForReports.name}_logs_${Date.now()}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
      
      alert(`Logs exported as ${format.toUpperCase()}`)
    } catch (error) {
      alert('Failed to export logs')
    }
  }

  const handleViewReportLogs = async () => {
    setShowReportLogsModal(true)
    await fetchAllReports()
  }

  const fetchAllReports = async () => {
    try {
      const data = await socService.getAllReports(timeFilter, verificationFilter)
      setAllReports(data.reports || [])
    } catch (error) {
      console.error('Error fetching reports:', error)
      setAllReports([])
    }
  }

  const handleVerifyReport = async (reportId: string) => {
    setVerifyingReport(reportId)
    try {
      const result = await socService.verifySocReport(reportId, 'full')
      alert('Report verified successfully')
      await fetchAllReports() // Refresh reports
    } catch (error) {
      alert('Failed to verify report')
    } finally {
      setVerifyingReport(null)
    }
  }

  const handleViewVerification = async (report: any) => {
    setSelectedReport(report)
    setShowVerificationDetails(true)
  }

  const handleAddReport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedProviderForUpload) return

    setUploadingReport(true)
    try {
      console.log('Uploading report:', file.name, 'Size:', file.size, 'Type:', file.type)
      console.log('Provider:', selectedProviderForUpload.id, selectedProviderForUpload.name)
      
      const result = await socService.uploadSocReport(selectedProviderForUpload.id, file)
      console.log('Upload result:', result)
      
      alert('Report uploaded successfully')
      setShowAddReportModal(false)
      await fetchAllReports() // Refresh reports
    } catch (error: any) {
      console.error('Error uploading report:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to upload report'
      alert(`Failed to upload report: ${errorMessage}`)
    } finally {
      setUploadingReport(false)
      event.target.value = '' // Reset file input
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'inactive': return <XCircle className="w-4 h-4 text-red-500" />
      default: return <AlertCircle className="w-4 h-4 text-yellow-500" />
    }
  }

  if (!mounted) {
    return <div className="flex min-h-screen bg-background">
      <div className="w-64 bg-card border-r border-border h-screen animate-pulse" />
      <div className="flex-1 flex flex-col">
        <div className="h-16 bg-card border-b border-border animate-pulse" />
        <main className="flex-1 p-6 space-y-6">
          <div className="h-8 w-48 bg-card rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-card rounded-xl animate-pulse" />
            ))}
          </div>
        </main>
      </div>
    </div>
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
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground text-glow">SOC Integration</h1>
                <p className="text-secondary text-sm mt-1">Configure and manage SOC provider integrations for data export</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleViewReportLogs}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-500 rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Report Logs</span>
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add SOC Provider</span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{providers.length}</p>
                    <p className="text-xs text-secondary">Total Providers</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{providers.filter((p: any) => p.status === 'active').length}</p>
                    <p className="text-xs text-secondary">Active</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{providers.reduce((acc: number, p: any) => acc + (p.totalExports || 0), 0)}</p>
                    <p className="text-xs text-secondary">Total Exports</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{providers.filter((p: any) => p.syncFrequency === 'real-time').length}</p>
                    <p className="text-xs text-secondary">Real-time Sync</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Providers List */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 bg-card rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {providers.map((provider, index) => (
                  <motion.div
                    key={provider.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-foreground">{provider.name}</h3>
                          <span className="text-xs text-secondary">{provider.type}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(provider.status)}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-secondary">Status</span>
                        <span className={`text-xs font-medium ${provider.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
                          {provider.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-secondary">Last Sync</span>
                        <span className="text-foreground font-medium">{provider.lastSync}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-secondary">Sync Frequency</span>
                        <span className="text-foreground font-medium">{provider.syncFrequency}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-secondary">Total Exports</span>
                        <span className="text-foreground font-medium">{provider.totalExports}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {provider.dataTypes.map((type: string) => (
                        <span key={type} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          {type}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTestConnection(provider.id)}
                        disabled={testingConnection === provider.id}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-background border border-border hover:border-primary/30 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {testingConnection === provider.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <TestTube className="w-4 h-4" />
                        )}
                        <span className="text-xs">Test</span>
                      </button>
                      <button
                        onClick={() => handleSync(provider.id)}
                        disabled={syncing === provider.id}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-primary/10 border border-primary/20 hover:bg-primary/20 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {syncing === provider.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                        <span className="text-xs">Sync</span>
                      </button>
                      <button
                        onClick={() => handleGenerateApiKey(provider.id)}
                        className="px-3 py-2 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 rounded-lg transition-colors"
                        title="Generate API Key"
                      >
                        <Shield className="w-4 h-4 text-blue-500" />
                      </button>
                      <button
                        onClick={() => handleViewReports(provider)}
                        className="px-3 py-2 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 rounded-lg transition-colors"
                        title="View Reports"
                      >
                        <FileText className="w-4 h-4 text-purple-500" />
                      </button>
                      <button
                        onClick={() => handleDeleteProvider(provider.id)}
                        className="px-3 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Provider Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-card border border-border rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Add SOC Provider</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Provider Name</label>
                  <input
                    type="text"
                    value={newProvider.name}
                    onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                    placeholder="Enter provider name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Provider Type</label>
                  <select
                    value={newProvider.type}
                    onChange={(e) => setNewProvider({ ...newProvider, type: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="SIEM">SIEM</option>
                    <option value="SOAR">SOAR</option>
                    <option value="EDR">EDR</option>
                    <option value="XDR">XDR</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">API Endpoint</label>
                  <input
                    type="text"
                    value={newProvider.endpoint}
                    onChange={(e) => setNewProvider({ ...newProvider, endpoint: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                    placeholder="https://api.soc-provider.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">API Key</label>
                  <input
                    type="password"
                    value={newProvider.apiKey}
                    onChange={(e) => setNewProvider({ ...newProvider, apiKey: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                    placeholder="Enter API key"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Sync Frequency</label>
                  <select
                    value={newProvider.syncFrequency}
                    onChange={(e) => setNewProvider({ ...newProvider, syncFrequency: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="real-time">Real-time</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Data Direction</label>
                  <select
                    value={newProvider.direction}
                    onChange={(e) => setNewProvider({ ...newProvider, direction: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="export">Export to SOC (We send data)</option>
                    <option value="import">Import from SOC (SOC sends data)</option>
                    <option value="bidirectional">Bidirectional (Both ways)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Data Types</label>
                <div className="flex flex-wrap gap-2">
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={newProvider.dataTypes.includes('alerts')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewProvider({ ...newProvider, dataTypes: [...newProvider.dataTypes, 'alerts'] })
                        } else {
                          setNewProvider({ ...newProvider, dataTypes: newProvider.dataTypes.filter(t => t !== 'alerts') })
                        }
                      }}
                      className="rounded"
                    />
                    <span>Alerts</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={newProvider.dataTypes.includes('threat-intel')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewProvider({ ...newProvider, dataTypes: [...newProvider.dataTypes, 'threat-intel'] })
                        } else {
                          setNewProvider({ ...newProvider, dataTypes: newProvider.dataTypes.filter(t => t !== 'threat-intel') })
                        }
                      }}
                      className="rounded"
                    />
                    <span>Threat Intelligence</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={newProvider.dataTypes.includes('ransomware')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewProvider({ ...newProvider, dataTypes: [...newProvider.dataTypes, 'ransomware'] })
                        } else {
                          setNewProvider({ ...newProvider, dataTypes: newProvider.dataTypes.filter(t => t !== 'ransomware') })
                        }
                      }}
                      className="rounded"
                    />
                    <span>Ransomware</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <input
                    type="checkbox"
                    checked={newProvider.enableApiAccess}
                    onChange={(e) => setNewProvider({ ...newProvider, enableApiAccess: e.target.checked })}
                    className="rounded"
                  />
                  <span>Enable API Access (Allow SOC to fetch our data)</span>
                </label>
                <p className="text-xs text-secondary mt-1">When enabled, SOC providers can fetch data from our system using API keys</p>
              </div>
              {newProvider.enableApiAccess && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Webhook URL (Optional)</label>
                    <input
                      type="text"
                      value={newProvider.webhookUrl}
                      onChange={(e) => setNewProvider({ ...newProvider, webhookUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                      placeholder="https://your-soc.com/webhook"
                    />
                    <p className="text-xs text-secondary mt-1">URL where SOC can push data to us</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Webhook Secret (Optional)</label>
                    <input
                      type="password"
                      value={newProvider.webhookSecret}
                      onChange={(e) => setNewProvider({ ...newProvider, webhookSecret: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                      placeholder="Enter webhook secret for signature validation"
                    />
                    <p className="text-xs text-secondary mt-1">Secret for validating webhook signatures</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-background border border-border hover:border-primary/30 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProvider}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
              >
                Add Provider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reports Modal */}
      {showReportsModal && selectedProviderForReports && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowReportsModal(false)}>
          <div className="bg-card border border-border rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selectedProviderForReports.name} Reports</h2>
                  <p className="text-xs text-secondary">Manage SOC reports and logs</p>
                </div>
              </div>
              <button onClick={() => setShowReportsModal(false)} className="p-2 hover:bg-background rounded-lg transition-colors">
                <X className="w-5 h-5 text-secondary" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleUploadReport}
                    disabled={uploadingFile}
                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <button
                    disabled={uploadingFile}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary/10 border border-primary/20 hover:bg-primary/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">{uploadingFile ? 'Uploading...' : 'Upload PDF'}</span>
                  </button>
                </div>
                <button
                  onClick={handleGenerateReport}
                  disabled={generatingReport}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 rounded-lg transition-colors disabled:opacity-50"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm">{generatingReport ? 'Generating...' : 'Generate Report'}</span>
                </button>
                <button
                  onClick={() => handleExportLogs('json')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Export JSON</span>
                </button>
                <button
                  onClick={() => handleExportLogs('csv')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Export CSV</span>
                </button>
              </div>

              {/* Reports List */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3">Uploaded Reports</h3>
                {reports.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-border rounded-lg">
                    <FileText className="w-12 h-12 text-secondary mx-auto mb-2" />
                    <p className="text-sm text-secondary">No reports uploaded yet</p>
                    <p className="text-xs text-secondary mt-1">Upload a PDF report to get started</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {reports.map((report, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-background/50 border border-border/40 rounded-lg hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-secondary" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{report.filename}</p>
                            <p className="text-xs text-secondary">
                              {new Date(report.uploaded_at).toLocaleString()} • {(report.file_size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadReport(report.filename)}
                          className="px-3 py-1.5 bg-primary/10 border border-primary/20 hover:bg-primary/20 rounded-lg transition-colors text-xs"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="border-t border-border pt-4">
                <div className="flex items-start gap-2 text-xs text-secondary">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground mb-1">Report Management</p>
                    <ul className="space-y-1">
                      <li>• Upload PDF reports from SOC providers</li>
                      <li>• Generate summary reports from system data</li>
                      <li>• Export logs in JSON or CSV format</li>
                      <li>• Download uploaded reports for review</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Report Modal */}
      {showAddReportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setShowAddReportModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-card border border-border rounded-xl max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Add SOC Report</h2>
                  <p className="text-xs text-secondary">Upload a PDF or text report from SOC provider</p>
                </div>
              </div>
              <button onClick={() => setShowAddReportModal(false)} className="p-2 hover:bg-background rounded-lg transition-colors">
                <X className="w-5 h-5 text-secondary" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Select SOC Provider</label>
                <select
                  value={selectedProviderForUpload?.id || ''}
                  onChange={(e) => {
                    const provider = providers.find(p => p.id === e.target.value)
                    setSelectedProviderForUpload(provider || null)
                  }}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">Select a provider...</option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>{provider.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Upload Report (PDF or Text)</label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.txt,.log,.csv"
                    onChange={handleAddReport}
                    disabled={uploadingReport || !selectedProviderForUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <button
                    disabled={uploadingReport || !selectedProviderForUpload}
                    className="w-full flex items-center justify-center gap-2 px-4 py-8 bg-background/50 border-2 border-dashed border-border hover:border-primary/30 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Upload className="w-5 h-5 text-secondary" />
                    <span className="text-sm text-secondary">
                      {uploadingReport ? 'Uploading...' : selectedProviderForUpload ? 'Click to upload PDF or Text file' : 'Select a provider first'}
                    </span>
                  </button>
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs text-secondary">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground mb-1">Upload Guidelines</p>
                  <ul className="space-y-1">
                    <li>• Supported formats: PDF, TXT, LOG, CSV</li>
                    <li>• Maximum file size: 10MB</li>
                    <li>• Reports will be automatically queued for AI verification</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Report Logs Modal */}
      {showReportLogsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowReportLogsModal(false)}>
          <div className="bg-card border border-border rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">SOC Report Logs</h2>
                  <p className="text-xs text-secondary">View and verify SOC reports with AI analysis</p>
                </div>
              </div>
              <button onClick={() => setShowReportLogsModal(false)} className="p-2 hover:bg-background rounded-lg transition-colors">
                <X className="w-5 h-5 text-secondary" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Header with Add Report button */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddReportModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Report</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-secondary mb-1">Time Filter</label>
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="all">All Time</option>
                    <option value="1day">Last 1 Day</option>
                    <option value="1month">Last 1 Month</option>
                    <option value="1year">Last 1 Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-secondary mb-1">Verification Status</label>
                  <select
                    value={verificationFilter}
                    onChange={(e) => setVerificationFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="all">All Status</option>
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div className="col-span-2 flex items-end">
                  <button
                    onClick={fetchAllReports}
                    className="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors text-sm"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>

              {/* Reports Table */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3">
                  Reports ({allReports.length})
                </h3>
                {allReports.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-border rounded-lg">
                    <FileText className="w-12 h-12 text-secondary mx-auto mb-2" />
                    <p className="text-sm text-secondary">No reports found</p>
                    <p className="text-xs text-secondary mt-1">Upload SOC reports to get started</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {allReports.map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-4 bg-background/50 border border-border/40 rounded-lg hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-purple-500" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground">{report.filename}</p>
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                report.verification_status === 'verified' ? 'bg-green-500/10 text-green-500' :
                                report.verification_status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                'bg-red-500/10 text-red-500'
                              }`}>
                                {report.verification_status}
                              </span>
                            </div>
                            <p className="text-xs text-secondary mt-1">
                              {report.provider_name} • {new Date(report.uploaded_at).toLocaleString()} • {(report.file_size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {report.verification_status === 'pending' && (
                            <button
                              onClick={() => handleVerifyReport(report.id)}
                              disabled={verifyingReport === report.id}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 rounded-lg transition-colors text-xs disabled:opacity-50"
                            >
                              {verifyingReport === report.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Shield className="w-3 h-3" />
                              )}
                              <span>Verify</span>
                            </button>
                          )}
                          {report.verification_status === 'verified' && (
                            <button
                              onClick={() => handleViewVerification(report)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 rounded-lg transition-colors text-xs"
                            >
                              <CheckCircle className="w-3 h-3" />
                              <span>View Result</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDownloadReport(report.filename)}
                            className="px-3 py-1.5 bg-primary/10 border border-primary/20 hover:bg-primary/20 rounded-lg transition-colors text-xs"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verification Details Modal */}
      {showVerificationDetails && selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowVerificationDetails(false)}>
          <div className="bg-card border border-border rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Verification Result</h2>
                  <p className="text-xs text-secondary">{selectedReport.filename}</p>
                </div>
              </div>
              <button onClick={() => setShowVerificationDetails(false)} className="p-2 hover:bg-background rounded-lg transition-colors">
                <X className="w-5 h-5 text-secondary" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {selectedReport.verification_result && (
                <>
                  {/* Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-background/50 border border-border/40 rounded-lg p-4">
                      <p className="text-xs text-secondary mb-1">Confidence Score</p>
                      <p className="text-lg font-bold text-foreground">{(selectedReport.verification_result.confidence_score * 100).toFixed(0)}%</p>
                    </div>
                    <div className="bg-background/50 border border-border/40 rounded-lg p-4">
                      <p className="text-xs text-secondary mb-1">Alerts Verified</p>
                      <p className="text-lg font-bold text-foreground">{selectedReport.verification_result.summary.total_alerts_verified}</p>
                    </div>
                    <div className="bg-background/50 border border-border/40 rounded-lg p-4">
                      <p className="text-xs text-secondary mb-1">Threats Matched</p>
                      <p className="text-lg font-bold text-foreground">{selectedReport.verification_result.summary.threats_matched}</p>
                    </div>
                    <div className="bg-background/50 border border-border/40 rounded-lg p-4">
                      <p className="text-xs text-secondary mb-1">Risk Level</p>
                      <p className="text-lg font-bold text-foreground">{selectedReport.verification_result.summary.overall_risk_level}</p>
                    </div>
                  </div>

                  {/* Findings */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3">Findings</h3>
                    <div className="space-y-2">
                      {selectedReport.verification_result.findings.map((finding: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-background/50 border border-border/40 rounded-lg">
                          <span className={`text-xs px-2 py-1 rounded ${
                            finding.status === 'pass' ? 'bg-green-500/10 text-green-500' :
                            finding.status === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
                            'bg-red-500/10 text-red-500'
                          }`}>
                            {finding.status}
                          </span>
                          <span className="text-sm text-foreground">{finding.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3">Recommendations</h3>
                    <ul className="space-y-2">
                      {selectedReport.verification_result.recommendations.map((rec: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-secondary">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
