import api from './auth.service'

export const industriesService = {
  async getTargetedIndustries() {
    const response = await api.get('/api/threat-intelligence/industries')
    return response.data
  },
}
