import { create } from 'zustand'

interface Company {
  id: number
  name: string
  domain: string
  industry: string | null
  description: string | null
  monitoring_enabled: boolean
  is_active: boolean
  created_at: string
  updated_at: string | null
  last_analyzed: string | null
}

interface CompanyWithDetails extends Company {
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
      const response = await fetch('http://localhost:8000/api/companies/')
      const data = await response.json()
      set({ companies: data })
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }
}))
