'use client'

import { useEffect, useRef } from 'react'
import { lsGet, lsSet, LS_KEYS } from '@/utils/localStorage'
import { syncStats } from '@/utils/persistence'
import { useAuth } from '@/contexts/AuthContext'

const IDLE_TIMEOUT = 180_000  // 3 min of no interaction = idle (accounts for reading FRQ docs, MCQ stimuli)
const SYNC_INTERVAL = 30_000  // sync to Supabase every 30s while active

/**
 * Tracks real active time on the site.
 * Listens for user interactions; pauses counting after IDLE_TIMEOUT.
 * Accumulates seconds in localStorage and syncs to Supabase periodically.
 * Mount once in root layout — renders nothing.
 */
export default function ActiveTimeTracker() {
  const { isAuthenticated } = useAuth()
  const activeRef = useRef(true)
  const lastTickRef = useRef(Date.now())
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function markActive() {
      if (!activeRef.current) {
        // Was idle, resuming — reset the tick so we don't count idle gap
        lastTickRef.current = Date.now()
      }
      activeRef.current = true

      // Reset idle timer
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      idleTimerRef.current = setTimeout(() => {
        // Flush accumulated time before going idle
        flush()
        activeRef.current = false
      }, IDLE_TIMEOUT)
    }

    function flush() {
      if (!activeRef.current) return
      const now = Date.now()
      const elapsed = Math.round((now - lastTickRef.current) / 1000)
      lastTickRef.current = now
      if (elapsed > 0 && elapsed < 300) {
        // Cap at 5 min per tick to avoid counting sleep/suspend
        lsSet(LS_KEYS.totalSeconds, lsGet<number>(LS_KEYS.totalSeconds, 0) + elapsed)
      }
    }

    function flushAndSync() {
      flush()
      if (isAuthenticated) syncStats()
    }

    // Listen for user interactions
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(e => window.addEventListener(e, markActive, { passive: true }))

    // Periodic flush + sync
    const interval = setInterval(flushAndSync, SYNC_INTERVAL)

    // Sync on tab close / navigate away
    window.addEventListener('beforeunload', flushAndSync)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flushAndSync()
      else markActive()
    })

    // Start as active
    markActive()

    return () => {
      events.forEach(e => window.removeEventListener(e, markActive))
      clearInterval(interval)
      window.removeEventListener('beforeunload', flushAndSync)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      flushAndSync()
    }
  }, [isAuthenticated])

  return null
}
