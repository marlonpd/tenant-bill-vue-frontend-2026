import ApiService from '@/apis/api'

export type PaymentPayload = {
  billing_period_id: number
  amount: number
  payment_date: string
  payment_method?: string | null
  reference_no?: string | null
  notes?: string | null
}

export const PaymentsService = {
  create(payload: PaymentPayload) {
    return ApiService.post('/payments/save', payload)
  },
  getAll(params?: { tenant_id?: number; billing_period_id?: number }) {
    return ApiService.query('/payments', params)
  },
  getTenantLedger(tenantId: number) {
    return ApiService.get(`/tenant/${tenantId}/ledger`)
  },
}
