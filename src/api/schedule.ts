import { getAuthHeaders } from './auth'
import type { CalendarResponse, LivesResponse, ScheduleResult } from '../types/schedule'

function agencyHeaders() {
  return { ...getAuthHeaders(), 'Content-Type': 'application/json', 'X-Artist-Member-Id': '1' }
}

export async function getCalendar(
  artistId: number,
  from?: string,
  to?: string,
): Promise<CalendarResponse> {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  const qs = params.toString() ? `?${params}` : ''
  const res = await fetch(`/api/v1/artists/${artistId}/calendar${qs}`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error(`getCalendar failed: ${res.status}`)
  const body = await res.json()
  return body.data as CalendarResponse
}

export async function getLives(artistId: number): Promise<LivesResponse> {
  const res = await fetch(`/api/v1/artists/${artistId}/lives`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error(`getLives failed: ${res.status}`)
  const body = await res.json()
  return body.data as LivesResponse
}

export interface CreateEventOptions {
  linkNoticeId?: number
  externalTicketUrl?: string
}

export async function createEvent(
  artistId: number,
  title: string,
  type: string,
  scheduledAt: string,
  options: CreateEventOptions = {},
): Promise<{ eventId: number }> {
  const payload: Record<string, unknown> = { title, type, scheduledAt }
  if (options.linkNoticeId) payload.linkNoticeId = options.linkNoticeId
  if (options.externalTicketUrl) payload.externalTicketUrl = options.externalTicketUrl
  const res = await fetch(`/api/v1/artists/${artistId}/events`, {
    method: 'POST',
    headers: agencyHeaders(),
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`createEvent failed: ${res.status}`)
  const json = await res.json()
  return json.data as { eventId: number }
}

export async function registerLive(
  artistId: number,
  title: string,
  scheduledAt: string,
  liveUrl: string,
): Promise<{ scheduleId: number }> {
  const res = await fetch(`/api/v1/artists/${artistId}/lives`, {
    method: 'POST',
    headers: agencyHeaders(),
    body: JSON.stringify({ title, scheduledAt, liveUrl }),
  })
  if (!res.ok) throw new Error(`registerLive failed: ${res.status}`)
  const body = await res.json()
  return body.data as { scheduleId: number }
}

export async function startLive(scheduleId: number): Promise<ScheduleResult> {
  const res = await fetch(`/api/v1/lives/${scheduleId}/start`, {
    method: 'PATCH',
    headers: agencyHeaders(),
  })
  if (!res.ok) throw new Error(`startLive failed: ${res.status}`)
  const body = await res.json()
  return body.data as ScheduleResult
}