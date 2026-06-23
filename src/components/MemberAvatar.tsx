import type { CSSProperties } from 'react'
import { fanArtistGradient } from '../types/artist'

interface MemberAvatarProps {
  profileImageUrl?: string
  name?: string
  artistId?: number
  className?: string
  style?: CSSProperties
}

export function MemberAvatar({ profileImageUrl, name, artistId, className, style }: MemberAvatarProps) {
  if (profileImageUrl) {
    return (
      <img
        src={profileImageUrl}
        alt={name ?? ''}
        className={className}
        style={{ objectFit: 'cover', display: 'block', ...style }}
      />
    )
  }
  return (
    <div
      className={className}
      style={{
        background: artistId !== undefined ? fanArtistGradient(artistId) : 'linear-gradient(135deg, #FF9A9E, #FECFEF)',
        ...style,
      }}
      aria-hidden
    />
  )
}
