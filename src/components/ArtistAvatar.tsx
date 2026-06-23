import type { CSSProperties } from 'react'
import type { FanArtistEntry } from '../types/artist'

interface ArtistAvatarProps {
  artist: FanArtistEntry
  className?: string
  style?: CSSProperties
  fallbackChars?: number
}

export function ArtistAvatar({
  artist,
  className,
  style,
  fallbackChars = 2,
}: ArtistAvatarProps) {
  if (artist.profileImageUrl) {
    return (
      <img
        src={artist.profileImageUrl}
        alt={artist.name}
        className={className}
        style={{ objectFit: 'cover', display: 'block', ...style }}
      />
    )
  }

  return (
    <div
      className={className}
      style={{
        background: artist.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        ...style,
      }}
      aria-hidden
    >
      {artist.name.substring(0, fallbackChars)}
    </div>
  )
}
