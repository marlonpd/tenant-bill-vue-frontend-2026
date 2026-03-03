import ApiService from '@/apis/api'

export const MeterReadingService = {
  getAll(tenantId: number) {
    return ApiService.get(`/meter_readings/tenant/${tenantId}`)
  },
  create(payload: object) {
    return ApiService.post('/meter_reading', payload)
  },
}
