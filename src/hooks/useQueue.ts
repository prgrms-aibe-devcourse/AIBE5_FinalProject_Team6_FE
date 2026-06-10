import { useEffect, useState } from 'react'

export function useQueue() {
  const [queueActive, setQueueActive] = useState(false)
  const [queuePosition, setQueuePosition] = useState(247)
  const [seatMapUnlocked, setSeatMapUnlocked] = useState(false)

  useEffect(() => {
    if (queueActive && queuePosition > 0) {
      const timer = setTimeout(() => {
        setQueuePosition(p => (p > 0 ? p - 1 : 0))
      }, 50)
      return () => clearTimeout(timer)
    }
    if (queueActive && queuePosition === 0) {
      const finishTimer = setTimeout(() => {
        setQueueActive(false)
        setSeatMapUnlocked(true)
      }, 500)
      return () => clearTimeout(finishTimer)
    }
  }, [queueActive, queuePosition])

  return {
    queueActive,
    setQueueActive,
    queuePosition,
    seatMapUnlocked,
  }
}