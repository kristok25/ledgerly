import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { MockEventSource } from '@/api/mock-event-source'
import type { LiveEvent } from '@/api/types'
import { keys } from './queries'
import { useAppStore } from '@/store/app'

type Status = 'connecting' | 'open' | 'closed'

/**
 * Subscribes to the workspace's Server-Sent Events stream.
 * Swap `MockEventSource` for the native `EventSource` to talk to a real backend —
 * the rest of the hook stays the same.
 */
export function useEventStream({ max = 12 } = {}) {
  const ws = useAppStore((s) => s.workspaceId)
  const enabled = useAppStore((s) => s.liveUpdates)
  const qc = useQueryClient()
  const [events, setEvents] = useState<LiveEvent[]>([])
  const [status, setStatus] = useState<Status>('closed')
  const invalidateTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    setEvents([])
    if (!enabled) {
      setStatus('closed')
      return
    }
    setStatus('connecting')
    const source = new MockEventSource(`/api/workspaces/${ws}/events`)
    source.onopen = () => setStatus('open')
    source.onerror = () => setStatus('closed')
    source.onmessage = (msg) => {
      const event = JSON.parse(msg.data) as LiveEvent
      setEvents((prev) => [event, ...prev].slice(0, max))
      if (event.type === 'invoice.paid') toast.success(event.message)
      // Debounce cache invalidation so bursts of events cause a single refetch
      clearTimeout(invalidateTimer.current)
      invalidateTimer.current = setTimeout(() => qc.invalidateQueries({ queryKey: keys.all(ws) }), 400)
    }
    return () => {
      source.close()
      clearTimeout(invalidateTimer.current)
    }
  }, [ws, enabled, max, qc])

  return { events, status }
}
