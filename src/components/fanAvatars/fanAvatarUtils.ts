export const FAN_AVATAR_COUNT = 12

/** 레퍼런스 그리드 3×4 순서 (왼→오, 위→아래) */
export const FAN_AVATAR_NAMES = [
  'Star', 'Blob', 'Squircle', 'Pea',
  'Cloud', 'Hill', 'Egg', 'Heart',
  'RoseHeart', 'Slab', 'Bean', 'Petal',
] as const

export type FanAvatarIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

/** 가입 시 배정 — 캐릭터 종류 (fanId 고정) */
export function getFanAvatarIndex(fanId: number): FanAvatarIndex {
  return (Math.abs(fanId) % FAN_AVATAR_COUNT) as FanAvatarIndex
}

/**
 * 가입 시 배정 — 원형 배경색 (캐릭터와 독립 랜덤, fanId로 재현 가능)
 * BE 없이 fanId 해시로 가입 시 1회 고정
 */
export function getFanAvatarBgIndex(fanId: number): number {
  const n = Math.abs(fanId)
  return (n * 11 + 7) % FAN_AVATAR_BG_PALETTES.length
}

/** 파스텔 그라데이션 배경 팔레트 (레퍼런스 크림 톤 + 다양한 파스텔) */
export const FAN_AVATAR_BG_PALETTES: [string, string][] = [
  ['#FFF8E8', '#FFE8B8'], // warm cream
  ['#F5EEFF', '#E0D0F8'], // soft lavender
  ['#E8F6FF', '#C0E0F8'], // sky
  ['#E8FAF0', '#B8E8D0'], // mint
  ['#FFF0E8', '#FFD0B0'], // peach
  ['#FFE8F2', '#F8B8D8'], // blush pink
  ['#F5F0EA', '#E0D8D0'], // oat
  ['#E8EEFF', '#C0D4F8'], // periwinkle
  ['#FFF5D6', '#F8E090'], // butter
  ['#E8FFE8', '#B8E8B8'], // sage
  ['#F3E8FF', '#D8B8F0'], // lilac
  ['#FFE8EE', '#F8C0D0'], // rose mist
]

export function getFanAvatarBg(fanId: number): [string, string] {
  return FAN_AVATAR_BG_PALETTES[getFanAvatarBgIndex(fanId)]
}
