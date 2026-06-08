const BASE = '/api/v1/payments/toss'

export async function confirmPayment(
  tossPaymentKey: string,
  orderId: string,
  amount: number,
): Promise<void> {
  const res = await fetch(`${BASE}/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer test-token',
    },
    body: JSON.stringify({ tossPaymentKey, orderId, amount }),
  })
  if (!res.ok) throw new Error(`confirmPayment failed: ${res.status}`)
}

export async function triggerWebhook(
  tossPaymentKey: string,
  orderId: string,
  amount: number,
  status: 'SUCCESS' | 'FAILED',
): Promise<void> {
  const res = await fetch(`${BASE}/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature-256': 'sha256=mock-signature-here',
    },
    body: JSON.stringify({
      eventType: 'PAYMENT_STATUS_CHANGED',
      createdAt: new Date().toISOString(),
      data: {
        paymentKey: tossPaymentKey,
        orderId,
        status: status === 'SUCCESS' ? 'DONE' : 'ABORTED',
        method: '카드',
        totalAmount: amount,
        approvedAt: new Date().toISOString(),
      },
    }),
  })
  if (!res.ok) throw new Error(`triggerWebhook failed: ${res.status}`)
}