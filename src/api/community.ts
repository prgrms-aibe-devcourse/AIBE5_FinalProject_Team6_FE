import { getAuthHeaders, getFanIdHeader } from './auth'
import { fetchWithAuth } from '../lib/fetchWithAuth'
import type { FeedListResponse, JoinedArtistListResponse } from '../types/feed'

export async function getFeeds(
  artistId: number,
  cursor?: string,
  size = 20,
): Promise<FeedListResponse> {
  const params = new URLSearchParams({ size: String(size) })
  if (cursor) params.set('cursor', cursor)
  const res = await fetchWithAuth(`/api/v1/artists/${artistId}/feeds?${params}`, {
    headers: { ...getAuthHeaders(), 'X-Fan-Id': getFanIdHeader() },
  })
  if (!res.ok) throw new Error(`getFeeds failed: ${res.status}`)
  const body = await res.json()
  return body.data as FeedListResponse
}

export async function createFeed(
  artistId: number,
  content: string,
  imageUrls: string[],
): Promise<{ feedId: number }> {
  const res = await fetchWithAuth(`/api/v1/artists/${artistId}/feeds`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      'X-Artist-Member-Id': getFanIdHeader(),
    },
    body: JSON.stringify({ content, imageUrls }),
  })
  if (!res.ok) throw new Error(`createFeed failed: ${res.status}`)
  const body = await res.json()
  return body.data as { feedId: number }
}

export async function deleteFeed(artistId: number, feedId: number): Promise<void> {
  const res = await fetchWithAuth(`/api/v1/artists/${artistId}/feeds/${feedId}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders(), 'X-Artist-Member-Id': getFanIdHeader() },
  })
  if (!res.ok) throw new Error(`deleteFeed failed: ${res.status}`)
}

export async function createComment(
  feedId: number,
  artistId: number,
  content: string,
  parentId?: number,
): Promise<{ commentId: number }> {
  const res = await fetchWithAuth(`/api/v1/feeds/${feedId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      'X-Artist-Id': String(artistId),
      'X-Fan-Id': getFanIdHeader(),
    },
    body: JSON.stringify({ content, parentId: parentId ?? null }),
  })
  if (!res.ok) throw new Error(`createComment failed: ${res.status}`)
  const body = await res.json()
  return body.data as { commentId: number }
}

export async function likeFeed(feedId: number, artistId: number): Promise<void> {
  const res = await fetchWithAuth(`/api/v1/feeds/${feedId}/likes`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'X-Artist-Id': String(artistId),
      'X-Fan-Id': getFanIdHeader(),
    },
  })
  if (!res.ok) throw new Error(`likeFeed failed: ${res.status}`)
}

export async function unlikeFeed(feedId: number): Promise<void> {
  const res = await fetchWithAuth(`/api/v1/feeds/${feedId}/likes`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders(), 'X-Fan-Id': getFanIdHeader() },
  })
  if (!res.ok) throw new Error(`unlikeFeed failed: ${res.status}`)
}

export async function followArtist(artistId: number): Promise<void> {
  const res = await fetchWithAuth(`/api/v1/artists/${artistId}/follow`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'X-Fan-Id': getFanIdHeader() },
  })
  if (!res.ok) throw new Error(`followArtist failed: ${res.status}`)
}

export async function unfollowArtist(artistId: number): Promise<void> {
  const res = await fetchWithAuth(`/api/v1/artists/${artistId}/follow`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders(), 'X-Fan-Id': getFanIdHeader() },
  })
  if (!res.ok) throw new Error(`unfollowArtist failed: ${res.status}`)
}

export async function getJoinedArtists(
  cursor?: string,
  size = 20,
): Promise<JoinedArtistListResponse> {
  const params = new URLSearchParams({ size: String(size) })
  if (cursor) params.set('cursor', cursor)
  const res = await fetchWithAuth(`/api/v1/fans/me/artists?${params}`, {
    headers: { ...getAuthHeaders(), 'X-Fan-Id': getFanIdHeader() },
  })
  if (!res.ok) throw new Error(`getJoinedArtists failed: ${res.status}`)
  const body = await res.json()
  return body.data as JoinedArtistListResponse
}