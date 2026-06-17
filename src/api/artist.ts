import { getAuthHeaders } from './auth'
import type { ArtistListResult } from '../types/artist'

export async function getArtists(
  cursor?: string,
  size = 20,
  sort = 'fanCount',
): Promise<ArtistListResult> {
  const params = new URLSearchParams({ size: String(size), sort })
  if (cursor) params.set('cursor', cursor)
  const res = await fetch(`/api/v1/artists?${params}`, { headers: getAuthHeaders() })
  if (!res.ok) throw new Error(`getArtists failed: ${res.status}`)
  const body = await res.json()
  return body.data as ArtistListResult
}