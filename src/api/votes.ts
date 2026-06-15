import { getAuthHeaders, getFanIdHeader } from './auth'
import type { GoodsVoteListResponse } from '../types/vote'

export async function getVotes(
  artistId: number,
  cursor?: string,
  size = 20,
): Promise<GoodsVoteListResponse> {
  const params = new URLSearchParams({ size: String(size) })
  if (cursor) params.set('cursor', cursor)
  const res = await fetch(`/api/v1/artists/${artistId}/goods-votes?${params}`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error(`getVotes failed: ${res.status}`)
  const body = await res.json()
  return body.data as GoodsVoteListResponse
}

export async function castBallot(
  voteId: number,
  optionId: number,
): Promise<{ recordId: number }> {
  const res = await fetch(`/api/v1/goods-votes/${voteId}/ballots`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      'X-Fan-Id': getFanIdHeader(),
    },
    body: JSON.stringify({ optionId }),
  })
  if (!res.ok) throw new Error(`castBallot failed: ${res.status}`)
  const body = await res.json()
  return body.data as { recordId: number }
}