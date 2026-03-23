'use client'
import { useEffect, useState } from 'react'
import { MasteryBar } from './MasteryBar'
import type { SubjectUnit } from '@/utils/subjects'

interface UnitProgressGridProps {
  subject: string
  units: SubjectUnit[]
}

interface MasteryData {
  drillAccuracy: number
  mcqAccuracy: number
  totalAttempts: number
}

export function UnitProgressGrid({ subject, units }: UnitProgressGridProps) {
  const [masteryMap, setMasteryMap] = useState<Record<number, number> | null>(null)

  useEffect(() => {
    const map: Record<number, number> = {}
    units.forEach(unit => {
      try {
        const raw = localStorage.getItem(`ascendly_mastery_${subject}_${unit.number}`)
        if (raw) {
          const data: MasteryData = JSON.parse(raw)
          const accuracy = data.totalAttempts > 0
            ? ((data.drillAccuracy + data.mcqAccuracy) / 2) * 100
            : 0
          map[unit.number] = Math.round(accuracy)
        } else {
          map[unit.number] = 0
        }
      } catch {
        map[unit.number] = 0
      }
    })
    setMasteryMap(map)
  }, [subject, units])

  return (
    <section>
      <h2 style={{
        fontSize: '1.25rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: '16px',
      }}>
        Unit Progress
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {units.map(unit => (
          <div key={unit.number}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px',
            }}>
              <span style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
              }}>
                Unit {unit.number}: {unit.name}
              </span>
              <span style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                minWidth: '32px',
                textAlign: 'right',
              }}>
                {masteryMap ? `${masteryMap[unit.number]}%` : '—'}
              </span>
            </div>
            <MasteryBar value={masteryMap ? masteryMap[unit.number] : 0} />
          </div>
        ))}
      </div>
    </section>
  )
}
