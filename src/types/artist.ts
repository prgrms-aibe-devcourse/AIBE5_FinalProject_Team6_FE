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

/** 팬 앱 내 아티스트 카드/보드용 (API + 그라데이션 fallback) */
export interface FanArtistEntry {
  id: number
  name: string
  bg: string
  profileImageUrl?: string
}

export function toFanArtistEntry(artist: {
  id: number
  name: string
  profileImageUrl?: string
  bg?: string
}): FanArtistEntry {
  return {
    id: artist.id,
    name: artist.name,
    bg: artist.bg ?? fanArtistGradient(artist.id),
    profileImageUrl: artist.profileImageUrl,
  }
}

export function fanArtistGradient(id: number): string {
  const gradients = [
    'linear-gradient(135deg, #FF9A9E, #FECFEF)',
    'linear-gradient(135deg, #fccb90, #d57eeb)',
    'linear-gradient(135deg, #a1c4fd, #c2e9fb)',
    'linear-gradient(135deg, #84fab0, #8fd3f4)',
    'linear-gradient(135deg, #f6d365, #fda085)',
  ]
  return gradients[id % gradients.length]
}

export function enrichFanArtist(
  artist: FanArtistEntry,
  catalog: ArtistItem[],
): FanArtistEntry {
  const found = catalog.find(a => a.id === artist.id)
  if (!found) return artist
  return {
    ...artist,
    name: found.name || artist.name,
    profileImageUrl: artist.profileImageUrl ?? found.profileImageUrl,
  }
}

export interface MyArtistMemberResult {
  id: number
  artistId: number
  memberName: string
  loginId: string
  profileImageUrl?: string
  groupName: string
}
