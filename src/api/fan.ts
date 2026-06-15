import { getAuthHeaders, getFanIdHeader } from './auth'
import type { FanResult, ActivityListResult } from '../types/fan'

export async function getMyProfile(): Promise<FanResult> {
  const res = await fetch('/api/v1/fans/me', {
    headers: { ...getAuthHeaders(), 'X-Fan-Id': getFanIdHeader() },
  })
  if (!res.ok) throw new Error(`getMyProfile failed: ${res.status}`)
  const body = await res.json()
  return body.data as FanResult
}

export async function updateMyProfile(patch: {
  nickname?: string
  allowNotification?: boolean
}): Promise<FanResult> {
  const res = await fetch('/api/v1/fans/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), 'X-Fan-Id': getFanIdHeader() },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error(`updateMyProfile failed: ${res.status}`)
  const body = await res.json()
  return body.data as FanResult
}

export async function getMyActivities(cursor?: string, size = 20): Promise<ActivityListResult> {
  const params = new URLSearchParams({ size: String(size) })
  if (cursor) params.set('cursor', cursor)
  const res = await fetch(`/api/v1/fans/me/activities?${params}`, {
    headers: { ...getAuthHeaders(), 'X-Fan-Id': getFanIdHeader() },
  })
  if (!res.ok) throw new Error(`getMyActivities failed: ${res.status}`)
  const body = await res.json()
  return body.data as ActivityListResult
}