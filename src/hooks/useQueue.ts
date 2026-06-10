import { useCallback, useRef, useState } from 'react'
import { getQueueStatus, joinQueue, subscribeQueueStream } from '../api/queue'

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

  const cleanup = useCallback(() => {
    abortRef.current?.()
    abortRef.current = null
  }, [])

  const connectSse = useCallback((productId: number) => {
    cleanup()
    abortRef.current = subscribeQueueStream(
      productId,
      (event) => {
        retryCountRef.current = 0 // 이벤트 수신 성공 시 재시도 카운터 리셋
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
      // SSE 연결 오류(60s 타임아웃 포함) 시 재연결 시도
      async () => {
        if (retryCountRef.current >= MAX_RETRIES) {
          setQueueState({ ...INITIAL, phase: 'EXPIRED' })
          return
        }

        // 현재 큐 상태 확인 — 이미 PROCESSING이면 재연결 불필요
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
        setTimeout(() => connectSse(productId), delay)
      },
    )
  }, [cleanup]) // eslint-disable-line react-hooks/exhaustive-deps

  const startQueue = useCallback(async (productId: number) => {
    cleanup()
    retryCountRef.current = 0
    productIdRef.current = productId
    setQueueState({ ...INITIAL, phase: 'WAITING' })

    try {
      await joinQueue(productId)
    } catch {
      setQueueState({ ...INITIAL, phase: 'EXPIRED' })
      return
    }

    connectSse(productId)
  }, [cleanup, connectSse])

  const resetQueue = useCallback(() => {
    cleanup()
    retryCountRef.current = 0
    productIdRef.current = null
    setQueueState(INITIAL)
  }, [cleanup])

  return { queueState, startQueue, resetQueue }
}