import ApiService from '@/apis/api'

export type WaterRatePayload = {
  rate: number
  rate_date: string
}

export const WaterRateService = {
  getAll() {
    return ApiService.get('/water-rates')
  },
  create(payload: WaterRatePayload) {
    return ApiService.post('/water_rate', payload)
  },
  update(waterRateId: number, payload: WaterRatePayload) {
    return ApiService.put(`/water_rate/${waterRateId}`, payload)
  },
  delete(waterRateId: number) {
    return ApiService.delete(`/water_rate/${waterRateId}`)
  },
}
