export interface BannerResponse {
  id: number
  title: string
  imageUrl: string
  landingUrl: string
  exposureOrder: number
  isActive: boolean
  startAt: string
  endAt: string
}

export interface StoreBannerResponse {
  id: number
  title: string
  imageUrl: string
  landingUrl: string
  exposureOrder: number
  status: string
  startAt: string
  endAt: string
  productId: number | null
}
