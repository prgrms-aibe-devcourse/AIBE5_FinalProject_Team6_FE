const BASE = '/api/v1/queue'

export interface QueueStatusResponse {
  position: number
  status: string
  token?: string
}

export async function joinQueue(productId: string): Promise<void> {
  const res = await fetch(`${BASE}/join/${productId}`, { method: 'POST' })
  if (!res.ok) throw new Error(`joinQueue failed: ${res.status}`)
}

export function createQueueSSE(productId: string): EventSource {
  return new EventSource(`${BASE}/stream/${productId}`)
}

export async function getQueueStatus(productId: string): Promise<QueueStatusResponse> {
  const res = await fetch(`${BASE}/status?productId=${productId}`)
  if (!res.ok) throw new Error(`getQueueStatus failed: ${res.status}`)
  return res.json() as Promise<QueueStatusResponse>
}