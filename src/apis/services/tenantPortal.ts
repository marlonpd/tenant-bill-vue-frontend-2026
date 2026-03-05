import axios from 'axios'
import { API_URL } from '@/apis/config'
import TenantJwtService from '@/apis/tenantJwt'

const tenantClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

tenantClient.interceptors.request.use((config) => {
  const token = TenantJwtService.getTenantToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

tenantClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      TenantJwtService.destroyTenantToken()
      if (window.location.pathname !== '/tenant/login') {
        window.location.href = '/tenant/login'
      }
    }
    return Promise.reject(error)
  },
)

export type TenantPortalBillItem = {
  id: number
  from_date: string
  end_date: string
  monthly_rent_amount: number | null
  electric_charge_amount: number | null
  water_charge_amount: number | null
  late_fee_amount: number | null
  total_amount: number | null
  status: string
  paid_amount: number | null
  outstanding_amount: number | null
  notes: string | null
  due_date: string | null
  created_at: string | null
}

export const TenantPortalService = {
  login(payload: { email: string; password: string }) {
    return tenantClient.post('/tenant/portal/login', payload)
  },
  getBillingHistory() {
    return tenantClient.get('/tenant/portal/billing-history')
  },
}
