import { getAuthHeaders } from './auth'

const BASE = '/api/v1/queue'

export type QueueStatus = 'IDLE' | 'WAITING' | 'PROCESSING' | 'DONE'

export interface QueueJoinResponse {
  queueId: number
  position: number
  status: QueueStatus
}

export interface QueueStatusResponse {
  position: number
  status: QueueStatus
  estimatedWaitSec: number
  token?: string
}

function queueHeaders(): Record<string, string> {
  return { ...getAuthHeaders(), 'X-Fan-Id': '1' }
}

export async function joinQueue(productId: number): Promise<QueueJoinResponse> {
  const res = await fetch(`${BASE}/join/${productId}`, {
    method: 'POST',
    headers: queueHeaders(),
  })
  if (!res.ok) throw new Error(`joinQueue failed: ${res.status}`)
  const body = await res.json()
  return body.data as QueueJoinResponse
}

export function createQueueSSE(productId: number): EventSource {
  return new EventSource(`${BASE}/stream/${productId}`)
}

export async function getQueueStatus(productId: number): Promise<QueueStatusResponse> {
  const res = await fetch(`${BASE}/status?productId=${productId}`, {
    headers: queueHeaders(),
  })
  if (!res.ok) throw new Error(`getQueueStatus failed: ${res.status}`)
  const body = await res.json()
  return body.data as QueueStatusResponse
}

export async function exitQueue(productId: number): Promise<void> {
  const res = await fetch(`${BASE}/exit/${productId}`, {
    method: 'DELETE',
    headers: queueHeaders(),
  })
  if (!res.ok) throw new Error(`exitQueue failed: ${res.status}`)
}
