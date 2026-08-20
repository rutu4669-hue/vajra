'use client'

import { useEffect, useState } from 'react'
import { Shield, Lock, AlertTriangle, CheckCircle, XCircle, Clock, Server, Globe, FileText } from 'lucide-react'

interface SSLCertificateData {
  host: string
  status: string
  grade: string
  has_certificate: boolean
  ip_address?: string
  server_name?: string
  days_until_expiry?: number
  valid_from?: string
  certificate_chain?: Array<{
    subject: string
    issuer: string
    valid_from: string
    valid_to: string
    signature_algorithm: string
    key_size: number
  }>
  protocols?: Array<{
    name: string
    version: string
    strength: number
  }>
  vulnerabilities?: {
    heartbleed: boolean
    poodle: boolean
    freak: boolean
    logjam: boolean
    beast: boolean
  }
  sans?: string[]
  is_public?: boolean
  engine_version?: string
  criteria_version?: string
  error?: string
}

interface CertificateDetailsProps {
  companyId: number
  domain: string
}

export default function CertificateDetails({ companyId, domain }: CertificateDetailsProps) {
  const [sslData, setSslData] = useState<SSLCertificateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSSLData = async () => {
      try {
        setLoading(true)
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${API_URL}/api/companies/${companyId}/ssl-certificate`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        
        if (!response.ok) throw new Error('Failed to fetch SSL certificate data')
        
        const data = await response.json()
        setSslData(data.ssl_data)
      } catch (err) {
        setError('Failed to load SSL certificate data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (companyId && domain) {
      fetchSSLData()
    }
  }, [companyId, domain])

  const getGradeColor = (grade: string) => {
    if (grade === 'A+' || grade === 'A') return 'text-success bg-success/10 border-success/30'
    if (grade === 'A-' || grade === 'B+') return 'text-primary bg-primary/10 border-primary/30'
    if (grade === 'B' || grade === 'B-') return 'text-warning bg-warning/10 border-warning/30'
    if (grade === 'C' || grade === 'D') return 'text-danger bg-danger/10 border-danger/30'
    return 'text-secondary bg-background border-border'
  }

  const getExpiryColor = (days: number) => {
    if (days < 0) return 'text-danger'
    if (days < 30) return 'text-danger'
    if (days < 90) return 'text-warning'
    return 'text-success'
  }

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

  if (error || !sslData) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 text-danger">
          <AlertTriangle className="w-5 h-5" />
          <p>{error || 'No SSL certificate data available'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* SSL Certificate Header */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              SSL Certificate Analysis
            </h3>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getGradeColor(sslData.grade)}`}>
                Grade: {sslData.grade}
              </span>
              <span className="text-secondary text-sm">
                Status: {sslData.status}
              </span>
            </div>
          </div>
          {sslData.has_certificate && (
            <div className="flex items-center gap-2 text-success">
              <Lock className="w-5 h-5" />
              <span className="font-medium">Certificate Valid</span>
            </div>
          )}
        </div>
      </div>

      {/* Key SSL Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-xs text-secondary">Host</span>
          </div>
          <div className="text-sm font-medium text-foreground break-all">{sslData.host}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Server className="w-4 h-4 text-primary" />
            <span className="text-xs text-secondary">IP Address</span>
          </div>
          <div className="text-sm font-medium text-foreground">{sslData.ip_address || 'N/A'}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-xs text-secondary">Days Until Expiry</span>
          </div>
          <div className={`text-lg font-bold ${getExpiryColor(sslData.days_until_expiry || 0)}`}>
            {sslData.days_until_expiry !== undefined ? sslData.days_until_expiry : 'N/A'}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-xs text-secondary">Engine Version</span>
          </div>
          <div className="text-sm font-medium text-foreground">{sslData.engine_version || 'N/A'}</div>
        </div>
      </div>

      {/* Certificate Chain */}
      {sslData.certificate_chain && sslData.certificate_chain.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Certificate Chain ({sslData.certificate_chain.length} certificates)
          </h4>
          <div className="space-y-4">
            {sslData.certificate_chain.map((cert, index) => (
              <div key={index} className="bg-background border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                    Certificate #{index + 1}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-secondary">Subject:</span>
                    <span className="text-foreground ml-2">{cert.subject}</span>
                  </div>
                  <div>
                    <span className="text-secondary">Issuer:</span>
                    <span className="text-foreground ml-2">{cert.issuer}</span>
                  </div>
                  <div>
                    <span className="text-secondary">Valid From:</span>
                    <span className="text-foreground ml-2">{cert.valid_from}</span>
                  </div>
                  <div>
                    <span className="text-secondary">Valid To:</span>
                    <span className="text-foreground ml-2">{cert.valid_to}</span>
                  </div>
                  <div>
                    <span className="text-secondary">Signature Algorithm:</span>
                    <span className="text-foreground ml-2">{cert.signature_algorithm}</span>
                  </div>
                  <div>
                    <span className="text-secondary">Key Size:</span>
                    <span className="text-foreground ml-2">{cert.key_size} bits</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Protocol Information */}
      {sslData.protocols && sslData.protocols.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Supported Protocols
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sslData.protocols.map((protocol, index) => (
              <div key={index} className="bg-background border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">
                      {protocol.name} {protocol.version}
                    </div>
                    <div className="text-xs text-secondary mt-1">Strength: {protocol.strength}%</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {protocol.strength >= 90 ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : protocol.strength >= 70 ? (
                      <AlertTriangle className="w-5 h-5 text-warning" />
                    ) : (
                      <XCircle className="w-5 h-5 text-danger" />
                    )}
                  </div>
                </div>
                <div className="mt-2 h-2 bg-background rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${protocol.strength >= 90 ? 'bg-success' : protocol.strength >= 70 ? 'bg-warning' : 'bg-danger'}`}
                    style={{ width: `${protocol.strength}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vulnerability Assessment */}
      {sslData.vulnerabilities && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Vulnerability Assessment
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(sslData.vulnerabilities).map(([vuln, vulnerable]) => (
              <div key={vuln} className="bg-background border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground capitalize">{vuln.replace('_', ' ')}</div>
                    <div className="text-xs text-secondary mt-1">
                      {vulnerable ? 'Vulnerable' : 'Not Vulnerable'}
                    </div>
                  </div>
                  {vulnerable ? (
                    <XCircle className="w-6 h-6 text-danger" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-success" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subject Alternative Names (SANs) */}
      {sslData.sans && sslData.sans.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Subject Alternative Names (SANs - {sslData.sans.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {sslData.sans.map((san, i) => (
              <span key={i} className="text-xs font-mono px-2.5 py-1 bg-background text-foreground rounded border border-border">
                {san}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Additional Information */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Additional Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-secondary">Public Domain</span>
            <span className="text-foreground font-medium">
              {sslData.is_public ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-secondary">Criteria Version</span>
            <span className="text-foreground font-medium">
              {sslData.criteria_version || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-secondary">Server Name</span>
            <span className="text-foreground font-medium">
              {sslData.server_name || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-secondary">Valid From</span>
            <span className="text-foreground font-medium">
              {sslData.valid_from || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
