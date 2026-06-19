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
}

export interface ProductResponse extends ProductListItem {
  reservedQty: number
  dropsStartAt: string | null
  dropsEndAt: string | null
  updatedAt: string
}

export interface ProductListResponse {
  items: ProductListItem[]
  nextCursor: string | null
  hasMore: boolean
}