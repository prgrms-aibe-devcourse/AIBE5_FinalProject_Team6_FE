export interface ArtistItem {
  id: number
  name: string
  fanCount?: number
  profileImageUrl?: string
}

export interface ArtistListResult {
  items: ArtistItem[]
  nextCursor: string | null
  hasMore: boolean
}