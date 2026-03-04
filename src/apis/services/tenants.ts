import ApiService from '@/apis/api'

export type TenantPayload = {
  name: string
  address: string
  contact_no: string
  unit_id?: number | null
  unit_rent_amount?: number | null
  due_date?: number | null
  is_fixed_power_rate?: boolean
  monthly_fixed_power_rate?: number | null
  initial_electric_sub_meter_reading?: number | null
  is_fixed_water_rate?: boolean
  monthly_fixed_water_rate?: number | null
  initial_water_sub_meter_reading?: number | null
}

export type TenantItem = {
  id: number
  name: string
  address: string
  contact_no: string
  unit_id?: number | null
  unit_rent_amount?: number | null
  due_date?: number | null
  is_fixed_power_rate?: boolean
  monthly_fixed_power_rate?: number | null
  initial_electric_sub_meter_reading?: number | null
  is_fixed_water_rate?: boolean
  monthly_fixed_water_rate?: number | null
  initial_water_sub_meter_reading?: number | null
}

export const TenantsService = {
  getAll() {
    return ApiService.get('/tenants')
  },
  create(payload: TenantPayload) {
    return ApiService.post('/tenant', payload)
  },
  update(id: number, payload: TenantPayload) {
    return ApiService.put(`/tenant/${id}`, payload)
  },
  destroy(id: number) {
    return ApiService.delete(`/tenant/${id}`)
  },
}
