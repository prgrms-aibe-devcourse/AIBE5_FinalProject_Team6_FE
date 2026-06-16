import { getAuthHeaders, getFanIdHeader } from './auth'
import { fetchWithAuth } from '../lib/fetchWithAuth'
import type { PaymentDetail } from '../types/payment'

const BASE = '/api/v1/payments/toss'

export interface PaymentConfirmResponse {
  paymentId: string
  status: string
}

export async function getPaymentDetail(orderId: number): Promise<PaymentDetail> {
  const res = await fetchWithAuth(`/api/v1/fans/me/orders/${orderId}/payment`, {
    headers: { ...getAuthHeaders(), 'X-Fan-Id': getFanIdHeader() },
  })
  if (!res.ok) throw new Error(`getPaymentDetail failed: ${res.status}`)
  return res.json() as Promise<PaymentDetail>
}

export async function confirmPayment(
  tossPaymentKey: string,
  orderId: number,
  orderPaymentKey: string,
  amount: number,
): Promise<PaymentConfirmResponse> {
  const res = await fetchWithAuth(`${BASE}/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ tossPaymentKey, orderId, orderPaymentKey, amount }),
  })
  if (!res.ok) throw new Error(`confirmPayment failed: ${res.status}`)
  const body = await res.json()
  return body.data as PaymentConfirmResponse
}