export type ArtistScheduleType = 'DROP' | 'LIVE' | 'EVENT' | 'NOTICE'

export interface ScheduleResult {
  id: number
  type: ArtistScheduleType
  title: string
  startTime: string // ISO-8601 UTC
}

export interface CalendarResponse {
  events: ScheduleResult[]
}