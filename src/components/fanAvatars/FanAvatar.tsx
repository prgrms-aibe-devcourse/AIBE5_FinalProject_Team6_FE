import type { CSSProperties } from 'react'
import { getFanAvatarIndex, getFanAvatarBg, FAN_AVATAR_NAMES } from './fanAvatarUtils'
import { FanMascotArt } from './FanMascotArt'

export interface FanAvatarProps {
  fanId: number
  size?: number
  className?: string
  style?: CSSProperties
  border?: string
  title?: string
  customImageUrl?: string
}

/**
 * 팬 default 아바타 — 왓챠식 블롭 12종 + 가입 시 랜덤(고정) 배경색.
 */
export function FanAvatar({
  fanId,
  size = 32,
  className,
  style,
  border,
  title,
  customImageUrl,
}: FanAvatarProps) {
  const index = getFanAvatarIndex(fanId)
  const [from, to] = getFanAvatarBg(fanId)
  const label = title ?? `${FAN_AVATAR_NAMES[index]} fan avatar`

  return (
    <div
      role="img"
      aria-label={label}
      title={label}
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: customImageUrl ? 'transparent' : `linear-gradient(145deg, ${from}, ${to})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        border: border ?? '2px solid white',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {customImageUrl ? (
        <img
          src={customImageUrl}
          alt={label}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{ width: '90%', height: '90%' }}>
          <FanMascotArt index={index} />
        </div>
      )}
    </div>
  )
}

export { getFanAvatarIndex, getFanAvatarBg, FAN_AVATAR_NAMES } from './fanAvatarUtils'
