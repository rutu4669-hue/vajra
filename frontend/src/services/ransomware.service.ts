import api from './auth.service'

export const ransomwareService = {
  async getIncidents() {
    const response = await api.get('/api/ransomware')
    return response.data
  },

  async getStats() {
    const response = await api.get('/api/ransomware/stats')
    return response.data
  },

  async getGroupIncidents(groupName: string) {
    const response = await api.get(`/api/ransomware/group/${encodeURIComponent(groupName)}`)
    return response.data
  },
}
