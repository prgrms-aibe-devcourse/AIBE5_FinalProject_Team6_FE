import { fetchWithAuth } from '../lib/fetchWithAuth'
import { getAuthHeaders } from './auth'
import type { ArtistListResult, ArtistPublicProfile, ArtistMember } from '../types/artist'

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

export async function getArtistPublicProfile(artistId: number): Promise<ArtistPublicProfile> {
  const res = await fetchWithAuth(`/api/v1/artists/${artistId}`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error(`getArtistPublicProfile failed: ${res.status}`)
  const body = await res.json()
  return body.data as ArtistPublicProfile
}

export interface UpdateArtistProfileRequest {
  bio?: string
  instagramUrl?: string
  youtubeUrl?: string
  twitterUrl?: string
  officialUrl?: string
}

export async function updateArtistProfile(
  artistId: number,
  data: UpdateArtistProfileRequest,
): Promise<void> {
  const res = await fetchWithAuth(`/api/v1/agency/artists/${artistId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`updateArtistProfile failed: ${res.status}`)
}

export async function requestArtistProfileImagePresignedUrl(
  artistId: number,
  contentType: string,
  contentLength: number,
): Promise<{ presignedUrl: string; imageUrl: string }> {
  const res = await fetchWithAuth(
    `/api/v1/agency/artists/${artistId}/profile-image/presigned-url`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ contentType, contentLength }),
    },
  )
  if (!res.ok) throw new Error(`requestArtistProfileImagePresignedUrl failed: ${res.status}`)
  const body = await res.json()
  return body.data
}

export async function updateArtistProfileImage(
  artistId: number,
  imageUrl: string,
): Promise<void> {
  const res = await fetchWithAuth(`/api/v1/agency/artists/${artistId}/profile-image`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ imageUrl }),
  })
  if (!res.ok) throw new Error(`updateArtistProfileImage failed: ${res.status}`)
}

export async function getArtistMembers(artistId: number): Promise<ArtistMember[]> {
  const res = await fetchWithAuth(`/api/v1/agency/artists/${artistId}/members`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error(`getArtistMembers failed: ${res.status}`)
  const body = await res.json()
  return body.data as ArtistMember[]
}
