import ApiService from '@/apis/api'

export type UnitItem = {
  id: number
  unit_no: string
  electric_meter_no?: string | null
  water_meter_no?: string | null
}

export type UnitPayload = {
  unit_no: string
  electric_meter_no?: string | null
  water_meter_no?: string | null
}

export const UnitsService = {
  getAll() {
    return ApiService.get('/units')
  },
  create(payload: UnitPayload) {
    return ApiService.post('/unit', payload)
  },
}
