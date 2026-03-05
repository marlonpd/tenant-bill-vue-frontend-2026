import ApiService from '@/apis/api'

export type PowerRatePayload = {
  rate: number
  rate_date: string
}

export const PowerRateService = {
  getAll() {
    return ApiService.get('/power-rates')
  },
  create(payload: PowerRatePayload) {
    return ApiService.post('/power_rate', payload)
  },
  update(powerRateId: number, payload: PowerRatePayload) {
    return ApiService.put(`/power_rate/${powerRateId}`, payload)
  },
  delete(powerRateId: number) {
    return ApiService.delete(`/power_rate/${powerRateId}`)
  },
}
