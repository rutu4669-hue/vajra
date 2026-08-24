import { create } from 'zustand'
import { useAuthStore } from './authStore'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface Company {
  id: number
  name: string
  domain: string
  industry: string | null
  description: string | null
  logo_url?: string | null
  monitoring_enabled: boolean
  is_active: boolean
  is_global: boolean
  created_by_user_id: number | null
  created_by_user_name: string | null
  created_by_user_email: string | null
  created_at: string
  updated_at: string | null
  last_analyzed: string | null
}

export interface CompanyWithDetails extends Company {
  latest_risk_assessment: {
    id: number
    risk_level: string
    security_score: number
    active_incidents: number
    created_at: string
  } | null
  active_threats_count: number
  total_threats_count: number
}

interface CompanyStore {
  selectedCompany: CompanyWithDetails | null
  companies: CompanyWithDetails[]
  setSelectedCompany: (company: CompanyWithDetails | null) => void
  setCompanies: (companies: CompanyWithDetails[]) => void
  fetchCompanies: () => Promise<void>
}

export const useCompanyStore = create<CompanyStore>((set) => ({
  selectedCompany: null,
  companies: [],
  
  setSelectedCompany: (company) => set({ selectedCompany: company }),
  
  setCompanies: (companies) => set({ companies }),
  
  fetchCompanies: async () => {
    try {
      const token = useAuthStore.getState().token
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      const response = await fetch(`${API_URL}/api/companies/`, { headers })
      if (response.ok) {
        const data = await response.json()
        set({ companies: data })
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }
}))

