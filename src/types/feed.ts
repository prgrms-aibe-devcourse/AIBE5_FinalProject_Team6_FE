export interface FeedResponse {
  id: number
  artistId: number
  artistMemberId: number | null
  content: string
  likeCount: number
  commentCount: number
  imageUrls: string[]
  createdAt: string
  isLiked: boolean
}

export interface FeedListResponse {
  items: FeedResponse[]
  nextCursor: string | null
  hasMore: boolean
}

export interface JoinedArtistResponse {
  artistId: number
  artistName?: string
  profileImageUrl?: string
  followedAt: string
}

export interface JoinedArtistListResponse {
  items: JoinedArtistResponse[]
  nextCursor: string | null
  hasMore: boolean
}