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

export interface ArtistPublicProfile {
  id: number
  name: string
  bio?: string
  profileImageUrl?: string
  instagramUrl?: string
  youtubeUrl?: string
  twitterUrl?: string
  officialUrl?: string
}

export interface ArtistMember {
  id: number
  memberName: string
  profileImageUrl?: string
}

export interface MyArtistMemberResult {
  id: number
  artistId: number
  memberName: string
  loginId: string
  profileImageUrl?: string
  groupName: string
}
