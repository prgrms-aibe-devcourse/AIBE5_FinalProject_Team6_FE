export interface FanResult {
  fanId: number
  email: string
  nickname: string
  allowNotification: boolean
  createdAt: string // ISO-8601
}

export type ActivityType = 'COMMENT' | 'FEED_LIKE'

export interface ActivityItem {
  type: ActivityType
  id: number
  feedId: number
  artistId: number
  content: string
  createdAt: string // ISO-8601
}

export interface ActivityListResult {
  items: ActivityItem[]
  nextCursor: string | null
  hasMore: boolean
}
