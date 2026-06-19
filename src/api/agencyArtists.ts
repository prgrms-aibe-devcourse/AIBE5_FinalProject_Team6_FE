import { fetchWithAuth } from '../lib/fetchWithAuth'
import { getAuthHeaders } from './auth'
import type { ArtistListResult } from '../types/artist'

export async function getAgencyArtists(
  cursor?: string,
  size = 50,
): Promise<ArtistListResult> {
  const params = new URLSearchParams({ size: String(size) })
  if (cursor) params.set('cursor', cursor)
  const res = await fetchWithAuth(`/api/v1/agency/artists?${params}`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error(`getAgencyArtists failed: ${res.status}`)
  const body = await res.json()
  return body.data as ArtistListResult
}
