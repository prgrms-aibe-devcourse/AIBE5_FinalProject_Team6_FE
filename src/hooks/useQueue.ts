import { useCallback, useRef, useState } from 'react'
import { joinQueue, subscribeQueueStream } from '../api/queue'

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

export function useQueue() {
  const [queueState, setQueueState] = useState<QueueState>(INITIAL)
  const abortRef = useRef<(() => void) | null>(null)

  const cleanup = useCallback(() => {
    abortRef.current?.()
    abortRef.current = null
  }, [])

  const startQueue = useCallback(async (productId: number) => {
    cleanup()
    setQueueState({ ...INITIAL, phase: 'WAITING' })

    try {
      await joinQueue(productId)
    } catch {
      setQueueState({ ...INITIAL, phase: 'EXPIRED' })
      return
    }

    abortRef.current = subscribeQueueStream(
      productId,
      (event) => {
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
      () => {
        setQueueState(prev =>
          prev.phase === 'PROCESSING' ? prev : { ...INITIAL, phase: 'EXPIRED' },
        )
      },
    )
  }, [cleanup])

  const resetQueue = useCallback(() => {
    cleanup()
    setQueueState(INITIAL)
  }, [cleanup])

  return { queueState, startQueue, resetQueue }
}