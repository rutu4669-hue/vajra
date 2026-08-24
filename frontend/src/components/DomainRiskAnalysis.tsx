'use client';

import React, { useState } from 'react';

interface Threat {
  type: string;
  severity: string;
  first_seen: string;
  last_seen: string;
  confidence: number;
}

interface DomainAnalysis {
  target: string;
  risk_level: string;
  active_incidents: number;
  security_score: number;
  last_scanned: string;
  threats: Threat[];
  country?: string;
  abuse_confidence_score?: number;
  reputation?: number;
  pulse_count?: number;
  urlscan_data?: {
    total_scans: number;
    malicious_scans: number;
    suspicious_scans: number;
    countries: string[];
    tags: string[];
  };
  domain_age_days?: number;
  ssl_certificate?: {
    valid: boolean;
    issuer: string;
    expires_days: number;
  };
  dns_records?: {
    a_records: number;
    mx_records: number;
    txt_records: number;
  };
  isp?: string;
  last_reported?: string;
}

export default function DomainRiskAnalysis() {
  const [domainInput, setDomainInput] = useState('');
  const [analysis, setAnalysis] = useState<DomainAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzeDomain = async () => {
    if (!domainInput.trim()) {
      setError('Please enter a domain or IP address');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vajra-9pjh.onrender.com';
      const response = await fetch(`${API_URL}/api/domain-analysis/analyze?domain=${encodeURIComponent(domainInput)}`);
      
      if (!response.ok) {
        throw new Error('Failed to analyze domain');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError('Error analyzing domain. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'HIGH': return 'text-red-600 bg-red-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'HIGH': return 'text-red-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'LOW': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Domain/IP Risk Analysis</h1>
          <p className="text-gray-600">Analyze domains and IP addresses for security threats using multiple threat intelligence sources</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder="Enter domain or IP address (e.g., google.com, 8.8.8.8)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && analyzeDomain()}
            />
            <button
              onClick={analyzeDomain}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {analysis && (
          <div className="space-y-6">
            {/* Risk Overview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Risk Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Risk Level</div>
                  <div className={`text-2xl font-bold px-3 py-1 rounded ${getRiskLevelColor(analysis.risk_level)}`}>
                    {analysis.risk_level}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Security Score</div>
                  <div className="text-2xl font-bold text-gray-900">{analysis.security_score}/100</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Active Incidents</div>
                  <div className="text-2xl font-bold text-gray-900">{analysis.active_incidents}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Abuse Confidence</div>
                  <div className="text-2xl font-bold text-gray-900">{analysis.abuse_confidence_score || 0}%</div>
                </div>
              </div>
            </div>

            {/* URLScan.io Analysis */}
            {analysis.urlscan_data && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">URLScan.io Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Total Scans</div>
                    <div className="text-2xl font-bold text-gray-900">{analysis.urlscan_data.total_scans}</div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Malicious</div>
                    <div className="text-2xl font-bold text-red-600">{analysis.urlscan_data.malicious_scans}</div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Suspicious</div>
                    <div className="text-2xl font-bold text-yellow-600">{analysis.urlscan_data.suspicious_scans}</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Clean</div>
                    <div className="text-2xl font-bold text-green-600">
                      {analysis.urlscan_data.total_scans - analysis.urlscan_data.malicious_scans - analysis.urlscan_data.suspicious_scans}
                    </div>
                  </div>
                </div>
                {analysis.urlscan_data.countries.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-2">Countries Detected:</div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.urlscan_data.countries.map((country, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {country}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {analysis.urlscan_data.tags.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-2">Tags:</div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.urlscan_data.tags.map((tag, idx) => (
                        <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Threats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Detected Threats</h2>
              {analysis.threats.length > 0 ? (
                <div className="space-y-3">
                  {analysis.threats.map((threat, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg border-l-4 border-red-500">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-gray-900">{threat.type}</div>
                        <div className={`px-2 py-1 rounded text-sm font-medium ${getSeverityColor(threat.severity)}`}>
                          {threat.severity}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
                        <div>First Seen: {threat.first_seen}</div>
                        <div>Last Seen: {threat.last_seen}</div>
                        <div>Confidence: {threat.confidence}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">No threats detected</div>
              )}
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Country</div>
                  <div className="font-semibold text-gray-900">{analysis.country || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">ISP</div>
                  <div className="font-semibold text-gray-900">{analysis.isp || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Domain Age</div>
                  <div className="font-semibold text-gray-900">{analysis.domain_age_days || 'Unknown'} days</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Last Reported</div>
                  <div className="font-semibold text-gray-900">{analysis.last_reported || 'Never'}</div>
                </div>
                {analysis.ssl_certificate && (
                  <>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">SSL Certificate</div>
                      <div className={`font-semibold ${analysis.ssl_certificate.valid ? 'text-green-600' : 'text-red-600'}`}>
                        {analysis.ssl_certificate.valid ? 'Valid' : 'Invalid'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">SSL Issuer</div>
                      <div className="font-semibold text-gray-900">{analysis.ssl_certificate.issuer}</div>
                    </div>
                  </>
                )}
                {analysis.dns_records && (
                  <>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">A Records</div>
                      <div className="font-semibold text-gray-900">{analysis.dns_records.a_records}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">MX Records</div>
                      <div className="font-semibold text-gray-900">{analysis.dns_records.mx_records}</div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="text-sm text-gray-500 text-center">
              Last scanned: {analysis.last_scanned}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
