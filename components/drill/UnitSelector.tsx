'use client'

import React, { useState, useEffect } from 'react'
import { Layers } from 'lucide-react'
import { getSubject } from '@/utils/subjects'
import { scramble } from '@/utils/scramble'
import type { DrillCard, SessionState, DrillDraft } from '@/utils/drillSession'

interface UnitSelectorProps {
  subject: string
  onStart: (session: SessionState) => void
  browseMode: boolean
  onBrowseToggle: (value: boolean) => void
  onBrowse: (cards: DrillCard[], unitSlug: string) => void
  draft?: DrillDraft | null
  onResume?: () => void
}

const UNIT_GRADIENTS: Record<number, string> = {
  1: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  2: 'linear-gradient(135deg, #1a2e1a 0%, #162e3e 100%)',
  3: 'linear-gradient(135deg, #2e1a2e 0%, #3e1628 100%)',
  4: 'linear-gradient(135deg, #1a2e2e 0%, #163e2e 100%)',
  5: 'linear-gradient(135deg, #2e2e1a 0%, #3e3616 100%)',
  6: 'linear-gradient(135deg, #2e1a1a 0%, #3e1616 100%)',
  7: 'linear-gradient(135deg, #1a1a2e 0%, #28163e 100%)',
  8: 'linear-gradient(135deg, #1a2e28 0%, #163e28 100%)',
  9: 'linear-gradient(135deg, #2e281a 0%, #3e2816 100%)',
}
const DEFAULT_GRADIENT = 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'

const UNIT_EMOJIS: Record<number, string> = {
  1: '🧬', 2: '👁️', 3: '📚', 4: '🧠', 5: '👶',
  6: '💡', 7: '🏥', 8: '👥', 9: '🌍',
}

export default function UnitSelector({ subject, onStart, browseMode, onBrowseToggle, onBrowse, draft, onResume }: UnitSelectorProps) {
  const [unitData, setUnitData] = useState<Record<number, DrillCard[] | null>>({})
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const subjectInfo = getSubject(subject)
    if (!subjectInfo) {
      setLoading(false)
      return
    }

    const fetches = subjectInfo.units.map(async (unit) => {
      const res = await fetch(`/data/${subject}/drills/unit-${unit.number}.json`)
      if (res.ok) {
        const data = await res.json()
        return { number: unit.number, cards: data.cards as DrillCard[] }
      }
      return { number: unit.number, cards: null }
    })

    Promise.allSettled(fetches).then((results) => {
      const newUnitData: Record<number, DrillCard[] | null> = {}
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          newUnitData[result.value.number] = result.value.cards
        }
      })
      // For rejected promises, we need unit numbers — re-map via index
      const units = subjectInfo.units
      results.forEach((result, idx) => {
        if (result.status === 'rejected') {
          newUnitData[units[idx].number] = null
        }
      })
      setUnitData(newUnitData)
      setLoading(false)
    })
  }, [subject])

  const subjectInfo = getSubject(subject)
  const units = subjectInfo?.units ?? []

  const allLoadedCards: DrillCard[] = Object.values(unitData)
    .filter((cards): cards is DrillCard[] => cards !== null)
    .flat()

  const totalCardCount = allLoadedCards.length
  const studyAllDisabled = totalCardCount === 0

  const handleStudyAll = () => {
    if (studyAllDisabled) return
    if (browseMode) {
      onBrowse(allLoadedCards, 'all')
      return
    }
    if (draft && draft.unitSlug === 'all') {
      onResume?.()
      return
    }
    onStart({ cards: scramble(allLoadedCards), index: 0, answers: {}, isRetry: false, unitSlug: 'all', startedAt: Date.now() })
  }

  const handleUnitClick = (unitNumber: number, cards: DrillCard[]) => {
    if (browseMode) {
      onBrowse(cards, `unit-${unitNumber}`)
      return
    }
    const unitSlug = `unit-${unitNumber}`
    if (draft && draft.unitSlug === unitSlug) {
      onResume?.()
      return
    }
    onStart({ cards: scramble(cards), index: 0, answers: {}, isRetry: false, unitSlug, startedAt: Date.now() })
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Loading drills...</span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Page header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Drills
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Pick a unit to start drilling terms, concepts, and key people.
        </p>
      </div>

      {/* Quiz / Browse toggle */}
      <div
        style={{
          display: 'flex',
          background: 'var(--bg-card)',
          border: '1px solid var(--bg-border)',
          borderRadius: 'var(--radius-md)',
          padding: '3px',
          width: 'fit-content',
        }}
      >
        {([
          { value: false, icon: '⚡', label: 'Quiz' },
          { value: true, icon: '📖', label: 'Browse' },
        ] as const).map(({ value, icon, label }) => (
          <button
            key={label}
            onClick={() => onBrowseToggle(value)}
            style={{
              padding: '7px 18px',
              borderRadius: '6px',
              border: 'none',
              background: browseMode === value ? 'var(--accent)' : 'transparent',
              color: browseMode === value ? 'white' : 'var(--text-muted)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 150ms ease, color 150ms ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Unit grid */}
      <div
        className="unit-selector-grid"
        style={{ display: 'grid', gap: '16px' }}
      >
        {/* Study All card — full-width */}
        <div
          onClick={handleStudyAll}
          style={{
            gridColumn: '1 / -1',
            background: 'var(--bg-card)',
            border: `2px solid var(--accent)`,
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            cursor: studyAllDisabled ? 'not-allowed' : 'pointer',
            opacity: studyAllDisabled ? 0.5 : 1,
            pointerEvents: studyAllDisabled ? 'none' : 'auto',
            transition: 'transform 200ms ease, border-color 200ms ease',
          }}
          onMouseEnter={e => {
            if (!studyAllDisabled) {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
            }
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Layers size={20} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Study All
            </span>
            {draft?.unitSlug === 'all' && (
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'var(--accent)',
                background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
                border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
                borderRadius: '999px',
                padding: '2px 8px',
              }}>
                In Progress
              </span>
            )}
          </div>
          <div style={{
            padding: '4px 10px',
            borderRadius: '999px',
            background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
            border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--accent)',
            whiteSpace: 'nowrap',
          }}>
            {studyAllDisabled ? 'No content yet' : `${totalCardCount} cards`}
          </div>
        </div>

        {/* Unit cards */}
        {units.map((unit) => {
          const cards = unitData[unit.number]
          const isLoaded = cards !== null && cards !== undefined
          const gradient = UNIT_GRADIENTS[unit.number] ?? DEFAULT_GRADIENT
          const emoji = UNIT_EMOJIS[unit.number] ?? '📖'
          const hasDraft = draft?.unitSlug === `unit-${unit.number}`

          return (
            <div
              key={unit.number}
              onClick={() => isLoaded && handleUnitClick(unit.number, cards!)}
              style={{
                background: 'var(--bg-card)',
                border: `1px solid var(--bg-border)`,
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                cursor: isLoaded ? 'pointer' : 'default',
                opacity: isLoaded ? 1 : 0.6,
                transition: 'transform 200ms ease, border-color 200ms ease',
              }}
              onMouseEnter={e => {
                if (isLoaded) {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.transform = 'translateY(-2px)'
                  el.style.borderColor = 'var(--accent)'
                }
              }}
              onMouseLeave={e => {
                if (isLoaded) {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.transform = 'translateY(0)'
                  el.style.borderColor = 'var(--bg-border)'
                }
              }}
            >
              {/* Art area */}
              <div
                style={{
                  height: '96px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: gradient,
                }}
              >
                <span style={{ fontSize: '1.875rem' }}>{emoji}</span>
              </div>

              <div style={{ padding: '16px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '6px',
                }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.08em',
                    color: 'var(--text-muted)',
                  }}>
                    Unit {unit.number}
                  </span>
                  {hasDraft && (
                    <span style={{
                      fontSize: '0.6875rem',
                      fontWeight: 500,
                      color: 'var(--accent)',
                      background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
                      border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
                      borderRadius: '999px',
                      padding: '1px 7px',
                    }}>
                      In Progress
                    </span>
                  )}
                </div>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '10px',
                  lineHeight: '1.3',
                }}>
                  {unit.name}
                </h3>

                {/* Card count */}
                <div style={{
                  fontSize: '0.8125rem',
                  color: isLoaded ? 'var(--text-secondary)' : 'var(--text-muted)',
                }}>
                  {isLoaded ? `${cards!.length} cards` : 'Coming soon'}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <style>{`
        .unit-selector-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 640px) {
          .unit-selector-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .unit-selector-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  )
}
