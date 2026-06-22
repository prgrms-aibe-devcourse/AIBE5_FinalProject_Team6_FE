import { fetchWithAuth } from '../lib/fetchWithAuth'
import { getAuthHeaders } from './auth'
import type { ArtistMember } from '../types/artist'

export interface CreateArtistMemberRequest {
  artistId: number
  memberName: string
  profileImageUrl?: string
}

export interface UpdateArtistMemberRequest {
  memberName?: string
  profileImageUrl?: string
}

export async function createArtistMember(
  data: CreateArtistMemberRequest,
): Promise<ArtistMember> {
  const res = await fetchWithAuth('/api/v1/artist-members', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`createArtistMember failed: ${res.status}`)
  const body = await res.json()
  return body.data as ArtistMember
}

export async function updateArtistMember(
  memberId: number,
  data: UpdateArtistMemberRequest,
): Promise<ArtistMember> {
  const res = await fetchWithAuth(`/api/v1/artist-members/${memberId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`updateArtistMember failed: ${res.status}`)
  const body = await res.json()
  return body.data as ArtistMember
}

export async function deleteArtistMember(memberId: number): Promise<void> {
  const res = await fetchWithAuth(`/api/v1/artist-members/${memberId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error(`deleteArtistMember failed: ${res.status}`)
}