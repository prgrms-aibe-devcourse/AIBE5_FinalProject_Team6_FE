import { useCallback, useEffect, useRef, useState } from 'react'
import { exitQueue, getQueueStatus, joinQueue, subscribeQueueStream } from '../api/queue'

export type QueuePhase = 'IDLE' | 'WAITING' | 'PROCESSING' | 'EXPIRED'

export interface QueueState {
  phase: QueuePhase
  position: number
  estimatedWaitSec: number
  accessTicket: string | null
}

const INITIAL: QueueState = {
  phase: 'IDLE',
  position: 0,
  estimatedWaitSec: 0,
  accessTicket: null,
}

const MAX_RETRIES = 3
const BASE_RETRY_MS = 2000

export function useQueue() {
  const [queueState, setQueueState] = useState<QueueState>(INITIAL)
  const abortRef = useRef<(() => void) | null>(null)
  const retryCountRef = useRef(0)
  const productIdRef = useRef<number | null>(null)
  // ref holds the latest connectSse to avoid self-referencing closure error
  const connectSseRef = useRef<((productId: number) => void) | null>(null)

  const cleanup = useCallback(() => {
    abortRef.current?.()
    abortRef.current = null
  }, [])

  const connectSse = useCallback((productId: number) => {
    cleanup()
    abortRef.current = subscribeQueueStream(
      productId,
      (event) => {
        retryCountRef.current = 0
        if (event.status === 'PROCESSING') {
          setQueueState({
            phase: 'PROCESSING',
            position: 0,
            estimatedWaitSec: 0,
            accessTicket: event.accessToken,
          })
          cleanup()
        } else if (event.status === 'EXPIRED') {
          setQueueState({ ...INITIAL, phase: 'EXPIRED' })
          cleanup()
        } else {
          setQueueState(prev => ({
            ...prev,
            phase: 'WAITING',
            position: event.position ?? prev.position,
            estimatedWaitSec: event.estimatedWaitSec ?? prev.estimatedWaitSec,
          }))
        }
      },
      async () => {
        if (retryCountRef.current >= MAX_RETRIES) {
          setQueueState({ ...INITIAL, phase: 'EXPIRED' })
          return
        }

        try {
          const status = await getQueueStatus(productId)
          if (status.status === 'PROCESSING' && status.token) {
            setQueueState({
              phase: 'PROCESSING',
              position: 0,
              estimatedWaitSec: 0,
              accessTicket: status.token,
            })
            return
          }
          if (status.status === 'EXPIRED' || status.status === 'DONE') {
            setQueueState({ ...INITIAL, phase: 'EXPIRED' })
            return
          }
        } catch {
          // 상태 조회 실패 시 재연결 시도
        }

        retryCountRef.current += 1
        const delay = BASE_RETRY_MS * Math.pow(2, retryCountRef.current - 1)
        // connectSseRef.current 를 통해 호출하여 선언 전 접근 문제 방지
        setTimeout(() => connectSseRef.current?.(productId), delay)
      },
    )
  }, [cleanup])

  // ref를 최신 connectSse로 동기화 (렌더 중 직접 할당 금지 → effect로 처리)
  useEffect(() => {
    connectSseRef.current = connectSse
  }, [connectSse])

  const startQueue = useCallback(async (productId: number) => {
    cleanup()
    retryCountRef.current = 0
    productIdRef.current = productId
    setQueueState({ ...INITIAL, phase: 'WAITING' })

    try {
      const res = await joinQueue(productId)
      setQueueState({
        phase: res.status === 'PROCESSING' ? 'PROCESSING' : 'WAITING',
        position: res.position,
        estimatedWaitSec: res.position * 3, // 3 seconds per position
        accessTicket: null,
      })
    } catch {
      setQueueState({ ...INITIAL, phase: 'EXPIRED' })
      return
    }

    connectSse(productId)
  }, [cleanup, connectSse])

  const resetQueue = useCallback(() => {
    if (productIdRef.current !== null) {
      exitQueue(productIdRef.current).catch(() => {})
    }
    cleanup()
    retryCountRef.current = 0
    productIdRef.current = null
    setQueueState(INITIAL)
  }, [cleanup])

  return { queueState, startQueue, resetQueue }
}