export interface ArtistItem {
  id: number
  name: string
  profileImageUrl?: string
  fanCount?: number
}

export interface ArtistListResult {
  items: ArtistItem[]
  nextCursor: string | null
  hasMore: boolean
}
