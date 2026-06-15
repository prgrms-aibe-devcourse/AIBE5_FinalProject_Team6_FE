export interface NotificationResult {
  id: number
  type: string
  message: string
  isRead: boolean
  sentAt: string // ISO-8601 Instant (UTC)
  targetId: number | null
}