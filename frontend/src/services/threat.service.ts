import api from './auth.service'

export const threatService = {
  async getIntelligence() {
    const response = await api.get('/api/threat-intelligence')
    return response.data
  },

  async getThreatIntelligence() {
    const response = await api.get('/api/threat-intelligence')
    return response.data
  },

  async getTrend() {
    const response = await api.get('/api/threat-intelligence/trend')
    return response.data
  },
}
