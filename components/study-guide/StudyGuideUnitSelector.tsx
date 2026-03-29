'use client'

import { useState, useEffect } from 'react'
import { getSubject } from '@/utils/subjects'

interface StudyGuideUnitSelectorProps {
  subject: string
  onSelectUnit: (unitNumber: number) => void
}

export function StudyGuideUnitSelector({ subject, onSelectUnit }: StudyGuideUnitSelectorProps) {
  const [availability, setAvailability] = useState<Record<number, boolean>>({})
  const [loading, setLoading] = useState(true)

  const subjectInfo = getSubject(subject)
  const units = subjectInfo?.units ?? []

  useEffect(() => {
    if (!subjectInfo) {
      setLoading(false)
      return
    }

    const checks = units.map(async (unit) => {
      try {
        const res = await fetch(`/data/${subject}/study-guide/unit-${unit.number}.json`, { method: 'HEAD' })
        return { number: unit.number, available: res.ok }
      } catch {
        return { number: unit.number, available: false }
      }
    })

    Promise.allSettled(checks).then((results) => {
      const newAvailability: Record<number, boolean> = {}
      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          newAvailability[result.value.number] = result.value.available
        } else {
          newAvailability[units[idx].number] = false
        }
      })
      setAvailability(newAvailability)
      setLoading(false)
    })
  }, [subject]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Loading study guides...</span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Page header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Study Guide
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Select a unit to start reading.
        </p>
      </div>

      {/* Unit grid */}
      <div className="sg-unit-selector-grid">
        {units.map((unit) => {
          const isAvailable = availability[unit.number] ?? false
          return (
            <UnitCard
              key={unit.number}
              unitNumber={unit.number}
              unitName={unit.name}
              isAvailable={isAvailable}
              onSelectUnit={onSelectUnit}
            />
          )
        })}
      </div>

      <style>{`
        .sg-unit-selector-grid { display: grid; gap: 16px; grid-template-columns: 1fr; }
        @media (min-width: 640px) { .sg-unit-selector-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .sg-unit-selector-grid { grid-template-columns: repeat(3, 1fr); } }
      `}</style>
    </div>
  )
}

interface UnitCardProps {
  unitNumber: number
  unitName: string
  isAvailable: boolean
  onSelectUnit: (unitNumber: number) => void
}

function UnitCard({ unitNumber, unitName, isAvailable, onSelectUnit }: UnitCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={() => isAvailable && onSelectUnit(unitNumber)}
      onMouseEnter={() => isAvailable && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${hovered && isAvailable ? 'var(--accent)' : 'var(--bg-border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        cursor: isAvailable ? 'pointer' : 'not-allowed',
        opacity: isAvailable ? 1 : 0.6,
        transform: hovered && isAvailable ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'transform 200ms ease, border-color 200ms ease',
      }}
    >
      {/* Unit number label */}
      <div style={{
        fontSize: '12px',
        color: 'var(--text-muted)',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}>
        Unit {unitNumber}
      </div>

      {/* Unit name */}
      <div style={{
        fontSize: '14px',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginTop: '4px',
        lineHeight: '1.3',
      }}>
        {unitName}
      </div>

      {/* Coming soon */}
      {!isAvailable && (
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
          Coming soon
        </div>
      )}

    </div>
  )
}
