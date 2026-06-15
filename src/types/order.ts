export type OrderStatus = 'PENDING' | 'PAID' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED'

export interface OrderListItem {
  orderId: number
  status: OrderStatus
  totalAmount: number
  createdAt: string
}

export interface OrderListResponse {
  items: OrderListItem[]
  nextCursor: number | null
}

export interface OrderItemDetail {
  productId: number
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface OrderDetail {
  orderId: number
  status: OrderStatus
  totalAmount: number
  orderPaymentKey: string
  items: OrderItemDetail[]
  createdAt: string
}