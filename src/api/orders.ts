import { getAuthHeaders, getFanIdHeader } from './auth'
import { fetchWithAuth } from '../lib/fetchWithAuth'

const BASE = '/api/v1/orders'

export interface OrderItem {
  productId: number
  quantity: number
}

export interface CreateOrderResponse {
  orderId: string
  orderPaymentKey: string
  status: string
}

export async function createOrder(
  items: OrderItem[],
  accessTicket: string | null,
): Promise<CreateOrderResponse> {
  const res = await fetchWithAuth(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Fan-Id': getFanIdHeader(), ...getAuthHeaders() },
    body: JSON.stringify({ accessTicket, items }),
  })
  if (!res.ok) throw new Error(`createOrder failed: ${res.status}`)
  const body = await res.json()
  return body.data as CreateOrderResponse
}