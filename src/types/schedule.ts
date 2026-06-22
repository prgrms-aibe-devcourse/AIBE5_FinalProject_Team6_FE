export type ArtistScheduleType = 'DROP' | 'LIVE' | 'EVENT' | 'NOTICE'

export interface ScheduleResult {
  id: number
  type: ArtistScheduleType
  title: string
  startTime: string // ISO-8601 UTC
  liveUrl?: string | null
  noticeId?: number | null
  externalTicketUrl?: string | null
}

export interface CalendarResponse {
  events: ScheduleResult[]
}

export interface LivesResponse {
  lives: ScheduleResult[]
}