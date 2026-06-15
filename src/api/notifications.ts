import { getAuthHeaders, getFanIdHeader } from './auth'
import type { NotificationResult } from '../types/notification'

export async function getNotifications(
  cursor?: number,
  size = 20,
): Promise<NotificationResult[]> {
  const params = new URLSearchParams({ size: String(size) })
  if (cursor != null) params.set('cursor', String(cursor))
  const res = await fetch(`/api/v1/fans/me/notifications?${params}`, {
    headers: {
      ...getAuthHeaders(),
      'X-Fan-Id': getFanIdHeader(),
    },
  })
  if (!res.ok) throw new Error(`getNotifications failed: ${res.status}`)
  const body = await res.json()
  return body.data as NotificationResult[]
}

export async function markAsRead(notificationId: number): Promise<void> {
  const res = await fetch(`/api/v1/fans/me/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeaders(),
      'X-Fan-Id': getFanIdHeader(),
    },
  })
  if (!res.ok) throw new Error(`markAsRead failed: ${res.status}`)
}