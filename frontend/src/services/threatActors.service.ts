import api from './auth.service'

export const threatActorsService = {
  async getThreatActors() {
    const response = await api.get('/api/threat-intelligence/actors')
    return response.data
  },
}
