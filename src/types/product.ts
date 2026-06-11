export interface ProductResponse {
  id: number
  artistId: number
  name: string
  price: number
  totalQty: number
  remainingQty: number
  status: string
}

export interface ProductListResponse {
  items: ProductResponse[]
  nextCursor: string | null
  hasMore: boolean
}