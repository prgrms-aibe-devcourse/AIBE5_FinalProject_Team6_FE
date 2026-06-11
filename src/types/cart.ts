export interface CartItemResponse {
  cartItemId: number
  productId: number
  quantity: number
  price: number
}

export interface CartResponse {
  items: CartItemResponse[]
}
