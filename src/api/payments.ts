import { getAuthHeaders } from './auth'

const BASE = '/api/v1/payments/toss'

export interface PaymentConfirmResponse {
  paymentId: string
  status: string
}

export async function confirmPayment(
  tossPaymentKey: string,
  orderId: number,
  orderPaymentKey: string,
  amount: number,
): Promise<PaymentConfirmResponse> {
  const res = await fetch(`${BASE}/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ tossPaymentKey, orderId, orderPaymentKey, amount }),
  })
  if (!res.ok) throw new Error(`confirmPayment failed: ${res.status}`)
  const body = await res.json()
  return body.data as PaymentConfirmResponse
}