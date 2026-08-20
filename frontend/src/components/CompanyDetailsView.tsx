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
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Server,
  Lock,
  FileText,
  Database,
  Scan,
  Eye,
  ExternalLink
} from 'lucide-react';
import { ExpandableText } from '@/components/ExpandableText';
import DomainDetails from '@/components/DomainDetails';
import WebAlerts from '@/components/WebAlerts';

interface Company {
  id: number;
  name: string;
  domain: string;
  industry: string | null;
  description: string | null;
  monitoring_enabled: boolean;
  is_active: boolean;
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
  
  const [company, setCompany] = useState<Company | null>(null);
  const [threats, setThreats] = useState<CompanyThreat[]>([]);
  const [assessments, setAssessments] = useState<CompanyRiskAssessment[]>([]);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [apiSources, setApiSources] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const fetchCompanyData = useCallback(async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const [companyRes, threatsRes, assessmentsRes] = await Promise.all([
        fetch(`${API_URL}/api/companies/${companyId}`),
        fetch(`${API_URL}/api/companies/${companyId}/threats`),
        fetch(`${API_URL}/api/companies/${companyId}/assessments`)
      ]);

      const companyData = await companyRes.json();
      const threatsData = await threatsRes.json();
      const assessmentsData = await assessmentsRes.json();

      setCompany(companyData);
      setThreats(Array.isArray(threatsData) ? threatsData : []);
      setAssessments(Array.isArray(assessmentsData) ? assessmentsData : []);
    } catch (error) {
      console.error('Error fetching company data:', error);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (companyId) {
      fetchCompanyData();
    }
  }, [companyId, fetchCompanyData]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/companies/${companyId}/analyze`, {
        method: 'POST'
      });
      const data = await response.json();
      setAnalysisData(data.analysis_data);
      setApiSources(data.api_sources);
      await fetchCompanyData();
    } catch (error) {
      console.error('Error analyzing company:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12 text-gray-400">Loading company details...</div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12 text-gray-400">Company not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/companies')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>

        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600/20 rounded-lg flex items-center justify-center overflow-hidden border border-blue-500/30">
              {!logoError ? (
                <img 
                  src={`https://www.google.com/s2/favicons?domain=${company.domain}&sz=64`} 
                  alt={`${company.name} logo`} 
                  className="w-10 h-10 object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <Building2 className="w-8 h-8 text-blue-400" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{company.name}</h1>
              <p className="text-gray-400">{company.domain}</p>
              {company.industry && (
                <p className="text-sm text-gray-500">{company.industry}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 px-4 py-2 rounded-lg transition"
          >
            <Activity className="w-5 h-5" />
            {analyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>

        <DomainDetails key={company.updated_at || Date.now()} domain={company.domain} companyId={companyId} />

        {/* Web Alerts Section */}
        <WebAlerts companyId={companyId} companyName={company.name} domain={company.domain} />
      </div>
    </div>
  );
}
