import api from './auth.service'

export const alertsService = {
  async getAlerts() {
    const response = await api.get('/api/alerts')
    return response.data
  },

  async getAlertById(id: number) {
    const response = await api.get(`/api/alerts/${id}`)
    return response.data
  },
}
