export interface PaymentDetail {
  id: number
  orderId: number
  amount: number
  paymentMethod: string
  status: string
  paidAt: string | null
  failedAt: string | null
  createdAt: string
}