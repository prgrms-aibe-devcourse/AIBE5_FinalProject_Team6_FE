import { getAuthHeaders, getFanIdHeader } from './auth'
import { fetchWithAuth } from '../lib/fetchWithAuth'
import type { NoticeListResponse, NoticeResult } from '../types/notice'

export async function getNotices(
  artistId: number,
  cursor?: string,
  size = 20,
): Promise<NoticeListResponse> {
  const params = new URLSearchParams({ size: String(size) })
  if (cursor) params.set('cursor', cursor)
  const res = await fetchWithAuth(`/api/v1/artists/${artistId}/notices?${params}`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error(`getNotices failed: ${res.status}`)
  const body = await res.json()
  return body.data as NoticeListResponse
}

export async function getNotice(artistId: number, noticeId: number): Promise<NoticeResult> {
  const res = await fetchWithAuth(`/api/v1/artists/${artistId}/notices/${noticeId}`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error(`getNotice failed: ${res.status}`)
  const body = await res.json()
  return body.data as NoticeResult
}

export async function createNotice(
  artistId: number,
  title: string,
  content: string,
  imageUrls: string[] = [],
): Promise<{ noticeId: number }> {
  const res = await fetchWithAuth(`/api/v1/artists/${artistId}/notices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      'X-Artist-Member-Id': getFanIdHeader(),
    },
    body: JSON.stringify({ title, content, imageUrls }),
  })
  if (!res.ok) throw new Error(`createNotice failed: ${res.status}`)
  const body = await res.json()
  return body.data as { noticeId: number }
}