'use client'
import { useEffect, useState } from 'react'
import { Flame } from 'lucide-react'

export function StreakStrip() {
  const [streak, setStreak] = useState<number | null>(null)
  const [totalQ, setTotalQ] = useState<number | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('ascendly_streak')
      if (raw) setStreak(JSON.parse(raw).count ?? 0)
      else setStreak(0)
      setTotalQ(Number(localStorage.getItem('ascendly_total_questions') ?? 0))
    } catch {
      setStreak(0)
      setTotalQ(0)
    }
  }, [])

  if (streak === null) return null
  if (streak === 0 && (!totalQ || totalQ === 0)) return null

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      color: 'var(--text-secondary)',
      fontSize: '0.875rem',
    }}>
      {streak > 0 && (
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{
              display: 'inline-flex',
              animation: 'flameFlicker 0.8s ease-in-out infinite alternate',
              filter: 'drop-shadow(0 0 4px rgba(245, 158, 11, 0.4))',
            }}>
              <Flame size={14} color="var(--accent-warning)" />
            </span>
          {streak} day streak
        </span>
      )}
      {totalQ != null && totalQ > 0 && (
        <span>{totalQ.toLocaleString()} questions answered</span>
      )}
    </div>
  )
}
