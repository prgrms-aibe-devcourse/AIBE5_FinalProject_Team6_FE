import { getAuthHeaders, getFanIdHeader } from './auth'
import type { AttendanceEventResult, CheckInResult } from '../types/attendance'

export async function getAttendanceEvents(artistId: number): Promise<AttendanceEventResult[]> {
  const res = await fetch(`/api/v1/artists/${artistId}/attendance-events`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error(`getAttendanceEvents failed: ${res.status}`)
  const body = await res.json()
  return body.data as AttendanceEventResult[]
}

export async function checkIn(eventId: number): Promise<CheckInResult> {
  const res = await fetch(`/api/v1/attendance-events/${eventId}/check-in`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'X-Fan-Id': getFanIdHeader(),
    },
  })
  if (!res.ok) throw new Error(`checkIn failed: ${res.status}`)
  const body = await res.json()
  return body.data as CheckInResult
}