import ApiService from '@/apis/api'

export type NotificationItem = {
  id: number
  user_id: number
  tenant_id: number | null
  billing_period_id: number | null
  notification_type: string
  title: string
  message: string
  is_read: boolean
  created_at: string | null
}

export const NotificationsService = {
  getAll(params?: { unread_only?: boolean }) {
    return ApiService.query('/notifications', params)
  },
  markAsRead(notificationId: number) {
    return ApiService.put(`/notification/${notificationId}/read`, {})
  },
}
