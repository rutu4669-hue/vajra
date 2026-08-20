import api from './auth.service'

export const newsService = {
  async getNews() {
    const response = await api.get('/api/news')
    return response.data
  },
}
