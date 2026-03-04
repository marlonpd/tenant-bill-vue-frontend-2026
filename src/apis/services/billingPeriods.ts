import ApiService from '@/apis/api'

export type BillingPeriodPayload = {
  tenant_id: number
  from_date: string
  end_date: string
  monthly_rent_amount?: number | null
  current_electric_sub_meter_reading?: number | null
  current_water_sub_meter_reading?: number | null
  notes?: string | null
}

export const BillingPeriodsService = {
  create(payload: BillingPeriodPayload) {
    return ApiService.post('/billing_period', payload)
  },
}
