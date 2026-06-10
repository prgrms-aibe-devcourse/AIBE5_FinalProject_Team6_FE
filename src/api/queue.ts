import { getAuthHeaders, getFanIdHeader } from './auth'

const BASE = '/api/v1/queue'

export type QueueStatus = 'IDLE' | 'WAITING' | 'PROCESSING' | 'DONE' | 'EXPIRED'

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

export interface QueueStreamEvent {
  status: 'WAITING' | 'PROCESSING' | 'EXPIRED'
  position: number
  estimatedWaitSec: number
  accessToken: string | null
}

function queueHeaders(): Record<string, string> {
  return { ...getAuthHeaders(), 'X-Fan-Id': getFanIdHeader() }
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

/**
 * SSE 스트림 구독. EventSource 대신 fetch+ReadableStream을 사용해 커스텀 헤더(X-Fan-Id, Authorization)를 전송한다.
 * 반환값은 구독 해제 함수(abort).
 */
export function subscribeQueueStream(
  productId: number,
  onEvent: (event: QueueStreamEvent) => void,
  onError: () => void,
): () => void {
  const controller = new AbortController()

  async function connect() {
    try {
      const res = await fetch(`${BASE}/stream/${productId}`, {
        headers: { Accept: 'text/event-stream', ...queueHeaders() },
        signal: controller.signal,
      })
      if (!res.ok || !res.body) { onError(); return }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data:')) {
            try {
              const data = JSON.parse(line.slice(5).trim()) as QueueStreamEvent
              onEvent(data)
            } catch { /* 파싱 실패 무시 */ }
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') onError()
    }
  }

  connect()
  return () => controller.abort()
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
