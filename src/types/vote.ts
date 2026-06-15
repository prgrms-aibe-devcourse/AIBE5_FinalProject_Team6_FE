export interface GoodsVoteOptionResult {
  id: number
  label: string
  imageUrl: string
  voteCount: number
}

export interface GoodsVoteResult {
  id: number
  artistId: number
  title: string
  endsAt: string // ISO-8601 UTC
  active: boolean
  options: GoodsVoteOptionResult[]
}

export interface GoodsVoteListResponse {
  items: GoodsVoteResult[]
  nextCursor: string | null
  hasMore: boolean
}