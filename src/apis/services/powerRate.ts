import ApiService from '@/apis/api'

export const PowerRateService = {
  getAll() {
    return ApiService.get('/power-rates')
  },
  create(payload: { rate: number }) {
    return ApiService.post('/power_rate', payload)
  },
}
