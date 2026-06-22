import type { ArtistListResult, ArtistMember } from '../types/artist'

export async function getArtists(
  cursor?: string,
  size = 50,
): Promise<ArtistListResult> {
  const params = new URLSearchParams({ size: String(size) })
  if (cursor) params.set('cursor', cursor)
  const res = await fetch(`/api/v1/artists?${params}`)
  if (!res.ok) throw new Error(`getArtists failed: ${res.status}`)
  const body = await res.json()
  return body.data as ArtistListResult
}

export async function getArtistMembersList(artistId: number): Promise<ArtistMember[]> {
  const res = await fetch(`/api/v1/artists/${artistId}/members`)
  if (!res.ok) throw new Error(`getArtistMembersList failed: ${res.status}`)
  const body = await res.json()
  return (body.data ?? []) as ArtistMember[]
}