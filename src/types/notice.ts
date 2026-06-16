export interface NoticeResult {
  id: number
  type: string
  title: string
  content: string
  imageUrls: string[]
  scheduledAt: string
}

export interface NoticeListResponse {
  items: NoticeResult[]
  nextCursor: string | null
  hasMore: boolean
}