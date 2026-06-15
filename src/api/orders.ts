import type { OrderListResponse, OrderDetail } from '../types/order'
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

function fanHeaders() {
  return { ...getAuthHeaders(), 'X-Fan-Id': getFanIdHeader() }
}

export async function createOrder(
  items: OrderItem[],
  accessTicket: string | null,
): Promise<CreateOrderResponse> {
  const res = await fetchWithAuth(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...fanHeaders() },
    body: JSON.stringify({ accessTicket, items }),
  })
  if (!res.ok) throw new Error(`createOrder failed: ${res.status}`)
  const body = await res.json()
  return body.data as CreateOrderResponse
}

export async function getMyOrders(cursor?: number, size = 20): Promise<OrderListResponse> {
  const params = new URLSearchParams({ size: String(size) })
  if (cursor !== undefined) params.set('cursor', String(cursor))
  const res = await fetchWithAuth(`/api/v1/fans/me/orders?${params}`, { headers: fanHeaders() })
  if (!res.ok) throw new Error(`getMyOrders failed: ${res.status}`)
  const body = await res.json()
  return body.data as OrderListResponse
}

export async function getOrderDetail(orderId: number): Promise<OrderDetail> {
  const res = await fetchWithAuth(`${BASE}/${orderId}`, { headers: fanHeaders() })
  if (!res.ok) throw new Error(`getOrderDetail failed: ${res.status}`)
  const body = await res.json()
  return body.data as OrderDetail
}

export async function cancelOrder(orderId: number): Promise<void> {
  const res = await fetchWithAuth(`${BASE}/${orderId}`, {
    method: 'DELETE',
    headers: fanHeaders(),
  })
  if (!res.ok) throw new Error(`cancelOrder failed: ${res.status}`)
}