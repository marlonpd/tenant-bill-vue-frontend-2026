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

export type BulkGeneratePayload = {
  from_date: string
  end_date: string
  notes?: string | null
  current_readings?: Record<string, {
    current_electric_sub_meter_reading?: number | null
    current_water_sub_meter_reading?: number | null
  }>
}

export type BillingHistoryQuery = {
  tenant_id?: number
  status?: string
  from_date?: string
  to_date?: string
  q?: string
}

export type BillingPeriodItem = {
  id: number
  tenant_id: number
  tenant_name: string | null
  tenant_address: string | null
  tenant_contact_no: string | null
  from_date: string
  end_date: string
  monthly_rent_amount: number | null
  electric_charge_amount: number | null
  water_charge_amount: number | null
  previous_electric_sub_meter_reading: number | null
  previous_water_sub_meter_reading: number | null
  current_electric_sub_meter_reading: number | null
  current_water_sub_meter_reading: number | null
  used_electric_kwh: number | null
  used_water_cubic_meter: number | null
  electric_rate_per_kwh: number | null
  water_rate_per_cubic_meter: number | null
  due_date: string | null
  late_fee_amount: number | null
  total_amount: number | null
  status: string
  paid_amount: number | null
  outstanding_amount: number | null
  notes: string | null
  created_at: string | null
  payments: Array<{
    id: number
    amount: number
    payment_date: string | null
    payment_method: string | null
    reference_no: string | null
    notes: string | null
    created_at: string | null
  }>
}

export const BillingPeriodsService = {
  create(payload: BillingPeriodPayload) {
    return ApiService.post('/billing_period', payload)
  },
  getPreviousReading(tenantId: number) {
    return ApiService.get(`/billing_period/${tenantId}/previous-reading`)
  },
  getHistory(tenantIdOrQuery?: number | BillingHistoryQuery) {
    if (typeof tenantIdOrQuery === 'number') {
      return ApiService.get(`/billing_period/${tenantIdOrQuery}/history`)
    }
    return ApiService.query('/billing_period/history', tenantIdOrQuery)
  },
  exportCsvUrl(query?: BillingHistoryQuery) {
    const params = new URLSearchParams()
    if (query?.tenant_id) params.append('tenant_id', String(query.tenant_id))
    if (query?.status) params.append('status', query.status)
    if (query?.from_date) params.append('from_date', query.from_date)
    if (query?.to_date) params.append('to_date', query.to_date)
    if (query?.q) params.append('q', query.q)
    const qs = params.toString()
    return `/api/billing_period/history/export-csv${qs ? `?${qs}` : ''}`
  },
  bulkGenerate(payload: BulkGeneratePayload) {
    return ApiService.post('/billing_period/bulk-generate', payload)
  },
  refreshOverdue(payload?: { late_fee_rate?: number }) {
    return ApiService.post('/billing_period/refresh-overdue', payload || {})
  },
}
