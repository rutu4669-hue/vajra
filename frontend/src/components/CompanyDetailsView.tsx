'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Building2, 
  Shield, 
  AlertTriangle, 
  Activity, 
  Globe, 
  Clock, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  Server,
  Lock,
  Radio,
  Network,
  ExternalLink,
  User as UserIcon,
  RefreshCw,
  Loader2
} from 'lucide-react';
import DomainDetails from '@/components/DomainDetails';
import WebAlerts from '@/components/WebAlerts';
import { useAuthStore } from '@/store/authStore';

interface Company {
  id: number;
  name: string;
  domain: string;
  industry: string | null;
  description: string | null;
  monitoring_enabled: boolean;
  is_active: boolean;
  is_global: boolean;
  created_by_user_id: number | null;
  created_by_user_name: string | null;
  created_by_user_email: string | null;
  created_at: string;
  updated_at: string | null;
  last_analyzed: string | null;
}

interface CompanyThreat {
  id: number;
  threat_type: string;
  severity: string;
  description: string | null;
  source: string | null;
  confidence_score: number;
  status: string;
  first_seen: string;
  last_seen: string;
}

interface CompanyRiskAssessment {
  id: number;
  risk_level: string;
  security_score: number;
  active_incidents: number;
  abuse_confidence_score: number;
  reputation_score: number;
  vulnerabilities_count: number;
  ssl_valid: boolean;
  domain_age_days: number | null;
  country: string | null;
  isp: string | null;
  assessment_details?: string;
  created_at: string;
}

export default function CompanyDetailsView() {
  const params = useParams();
  const router = useRouter();
  const companyId = parseInt(params.id as string) || 1;
  const { user, token } = useAuthStore();
  
  const [company, setCompany] = useState<Company | null>(null);
  const [threats, setThreats] = useState<CompanyThreat[]>([]);
  const [assessments, setAssessments] = useState<CompanyRiskAssessment[]>([]);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const fetchCompanyData = useCallback(async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vajra-9pjh.onrender.com';
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const [companyRes, threatsRes, assessmentsRes, analysisRes] = await Promise.all([
        fetch(`${API_URL}/api/companies/${companyId}`, { headers }),
        fetch(`${API_URL}/api/companies/${companyId}/threats`, { headers }),
        fetch(`${API_URL}/api/companies/${companyId}/assessments`, { headers }),
        fetch(`${API_URL}/api/companies/${companyId}/analysis`, { headers }).catch(() => null)
      ]);

      if (!companyRes.ok) {
        setCompany(null);
        return;
      }

      const companyData = await companyRes.json();
      const threatsData = await threatsRes.json();
      const assessmentsData = await assessmentsRes.json();

      setCompany(companyData);
      setThreats(Array.isArray(threatsData) ? threatsData : []);
      setAssessments(Array.isArray(assessmentsData) ? assessmentsData : []);

      if (analysisRes && analysisRes.ok) {
        const aData = await analysisRes.json();
        setAnalysisData(aData.analysis_data || null);
      } else if (companyData.latest_risk_assessment?.assessment_details) {
        try {
          setAnalysisData(JSON.parse(companyData.latest_risk_assessment.assessment_details));
        } catch {
          setAnalysisData(null);
        }
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
    } finally {
      setLoading(false);
    }
  }, [companyId, token]);

  useEffect(() => {
    if (companyId) {
      fetchCompanyData();
    }
  }, [companyId, fetchCompanyData]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vajra-9pjh.onrender.com';
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/companies/${companyId}/analyze`, {
        method: 'POST',
        headers
      });
      const data = await response.json();
      setAnalysisData(data.analysis_data);
      await fetchCompanyData();
    } catch (error) {
      console.error('Error analyzing company:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-24">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
          <div className="text-secondary text-sm">Loading deep company telemetry...</div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16 text-secondary bg-card border border-border rounded-2xl p-8">
            <Building2 className="w-12 h-12 text-secondary/40 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-foreground">Company Not Found</h3>
            <p className="text-xs text-secondary mt-1 mb-4">You may not have permission to view this company or it does not exist.</p>
            <button
              onClick={() => router.push('/companies')}
              className="px-4 py-2 bg-primary rounded-lg text-xs font-semibold text-white shadow-lg shadow-primary/25"
            >
              Back to Companies
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCreatedByCurrentUser = user && company.created_by_user_id === Number(user.id);
  const vtData = analysisData?.virustotal_data;
  const resolvedIps = analysisData?.connections?.ip_addresses || [];

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/companies')}
            className="flex items-center gap-2 text-secondary hover:text-foreground transition text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Companies Monitor
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 px-4 py-2 rounded-xl transition text-white text-xs font-semibold shadow-lg shadow-primary/25"
            >
              {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {analyzing ? 'Scanning Intelligence...' : 'Re-Analyze Company'}
            </button>
          </div>
        </div>

        {/* Company Header Banner */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-background rounded-xl flex items-center justify-center overflow-hidden border border-border p-2">
                {!logoError ? (
                  <img 
                    src={`https://www.google.com/s2/favicons?domain=${company.domain}&sz=64`} 
                    alt={`${company.name} logo`} 
                    className="w-10 h-10 object-contain"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-primary" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">{company.name}</h1>
                  {company.is_global ? (
                    <span className="text-xs px-2.5 py-0.5 bg-blue-500/15 text-blue-400 border border-blue-500/30 rounded-full font-semibold flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5" /> Global (Admin)
                    </span>
                  ) : isCreatedByCurrentUser ? (
                    <span className="text-xs px-2.5 py-0.5 bg-purple-500/15 text-purple-400 border border-purple-500/30 rounded-full font-semibold flex items-center gap-1">
                      <UserIcon className="w-3.5 h-3.5" /> Added by You
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-0.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full font-semibold flex items-center gap-1">
                      <UserIcon className="w-3.5 h-3.5" /> Added by: {company.created_by_user_name || company.created_by_user_email || 'User'}
                    </span>
                  )}
                  {vtData && (
                    <span className="text-xs px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-semibold flex items-center gap-1.5">
                      <Radio className="w-3 h-3" />
                      VirusTotal: {vtData.detection_ratio || 'Safe'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-secondary font-mono">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{company.domain}</span>
                  {company.industry && (
                    <>
                      <span>•</span>
                      <span className="text-foreground">{company.industry}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick summary counters */}
            <div className="flex items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-border">
              <div className="text-center px-3">
                <div className="text-2xl font-bold text-primary">
                  {analysisData?.security_score || 85}
                </div>
                <div className="text-[10px] text-secondary">Security Score</div>
              </div>
              <div className="text-center px-3 border-l border-border">
                <div className="text-2xl font-bold text-foreground">
                  {resolvedIps.length}
                </div>
                <div className="text-[10px] text-secondary">Resolved IPs</div>
              </div>
              <div className="text-center px-3 border-l border-border">
                <div className="text-2xl font-bold text-foreground">
                  {analysisData?.total_vulnerabilities || analysisData?.vulnerabilities?.length || 0}
                </div>
                <div className="text-[10px] text-secondary">Vulnerabilities</div>
              </div>
            </div>
          </div>
        </div>

        {/* Deep Domain & Threat Intelligence View */}
        <DomainDetails key={company.updated_at || Date.now()} domain={company.domain} companyId={companyId} />

        {/* Web Alerts & Security Incidents */}
        <WebAlerts companyId={companyId} companyName={company.name} domain={company.domain} />
      </div>
    </div>
  );
}
