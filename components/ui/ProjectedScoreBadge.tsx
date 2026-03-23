'use client'
import { useEffect, useState } from 'react'

interface ProjectedScoreBadgeProps {
  subject: string
}

interface ScoreData {
  projectedScore: 1 | 2 | 3 | 4 | 5
  accuracy: number
}

export function ProjectedScoreBadge({ subject }: ProjectedScoreBadgeProps) {
  const [score, setScore] = useState<number | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`ascendly_score_${subject}`)
      if (raw) {
        const data: ScoreData = JSON.parse(raw)
        setScore(data.projectedScore)
      }
    } catch {
      // ignore
    }
  }, [subject])

  if (score === null) return null

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--bg-border)',
      borderRadius: 'var(--radius-sm)',
      padding: '4px 10px',
      fontSize: '0.875rem',
      color: 'var(--text-secondary)',
    }}>
      Projected Score:
      <strong style={{ color: 'var(--accent)', fontWeight: 700 }}>{score}</strong>
      <span style={{ color: 'var(--text-muted)' }}>/5</span>
    </span>
  )
}
