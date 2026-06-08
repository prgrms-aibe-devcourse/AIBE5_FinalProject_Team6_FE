const BASE = '/api/v1/orders'

export interface OrderItem {
  productId: string
  quantity: number
}

export interface CreateOrderResponse {
  orderId: string
  orderPaymentKey: string
}

export async function createOrder(
  items: OrderItem[],
  accessTicket: string | null,
): Promise<CreateOrderResponse> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer test-token',
    },
    body: JSON.stringify({ accessTicket, items }),
  })
  if (!res.ok) throw new Error(`createOrder failed: ${res.status}`)
  return res.json() as Promise<CreateOrderResponse>
}