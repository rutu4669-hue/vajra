import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useAuthStore } from './authStore'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vajra-9pjh.onrender.com'

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
  addCompanyToStore: (company: CompanyWithDetails) => void
  fetchCompanies: () => Promise<void>
}

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set, get) => ({
      selectedCompany: null,
      companies: [],
      
      setSelectedCompany: (company) => set({ selectedCompany: company }),
      
      setCompanies: (companies) => set({ companies }),

      addCompanyToStore: (company) => {
        set((state) => {
          const filtered = state.companies.filter((c) => c.id !== company.id && c.domain.toLowerCase() !== company.domain.toLowerCase())
          return { companies: [company, ...filtered] }
        })
      },
      
      fetchCompanies: async () => {
        try {
          const token = useAuthStore.getState().token
          const headers: Record<string, string> = {
            'Content-Type': 'application/json'
          }
          if (token) {
            headers['Authorization'] = `Bearer ${token}`
          }
          let response = await fetch(`${API_URL}/api/companies/?active_only=true`, { headers }).catch(() => null)
          if (!response || !response.ok) {
            response = await fetch(`/api/companies/?active_only=true`, { headers }).catch(() => null)
          }
          if (response && response.ok) {
            const data = await response.json()
            if (Array.isArray(data) && data.length > 0) {
              set({ companies: data })
            }
          }
        } catch (error) {
          console.error('Error fetching companies in store:', error)
        }
      }
    }),
    {
      name: 'vajra-companies-storage',
    }
  )
)
