import ApiService from '@/apis/api'

export type AuditLogItem = {
  id: number
  user_id: number
  action: string
  entity_type: string
  entity_id: number | null
  details: string | null
  created_at: string | null
}

export const AuditLogsService = {
  getAll(params?: { limit?: number }) {
    return ApiService.query('/audit-logs', params)
  },
}
