import { getAuthHeaders } from './auth'
import type { CalendarResponse, LivesResponse } from '../types/schedule'

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