export interface ProductListItem {
  id: number
  artistId: number
  name: string
  price: number
  status: string
  totalQty: number
  availableQty: number
  dropsStartAt?: string | null
  dropsEndAt?: string | null
  thumbnailUrl?: string | null
}

export interface ProductImage {
  imageUrl: string
  sortOrder: number
  isPrimary: boolean
}

export interface ProductResponse extends ProductListItem {
  reservedQty: number
  dropsStartAt: string | null
  dropsEndAt: string | null
  updatedAt: string
  images: ProductImage[]
}

export interface ProductListResponse {
  items: ProductListItem[]
  nextCursor: string | null
  hasMore: boolean
}