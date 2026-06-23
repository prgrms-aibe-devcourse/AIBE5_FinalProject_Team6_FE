export interface AttendanceRewardAsset {
  imgUrl: string
  gradient: string
}

// imgUrl: public/assets/photocards/ 에 WEBP 파일 배치 시 자동 적용
export const ATTENDANCE_REWARD_IMAGES: Record<number, AttendanceRewardAsset> = {
  1: {
    imgUrl: '/assets/photocards/nova-attendance.webp',
    gradient: 'linear-gradient(135deg, #C2507A 0%, #FF9A9E 100%)',
  },
  2: {
    imgUrl: '/assets/photocards/luna-attendance.webp',
    gradient: 'linear-gradient(135deg, #7F77DD 0%, #C4B5FD 100%)',
  },
  3: {
    imgUrl: '/assets/photocards/echo-attendance.webp',
    gradient: 'linear-gradient(135deg, #0EA5E9 0%, #67E8F9 100%)',
  },
}

const FALLBACK: AttendanceRewardAsset = {
  imgUrl: '',
  gradient: 'linear-gradient(135deg, #FF9A9E, #FECFEF)',
}

export function getRewardAsset(artistId: number | undefined): AttendanceRewardAsset {
  return (artistId !== undefined ? ATTENDANCE_REWARD_IMAGES[artistId] : undefined) ?? FALLBACK
}
