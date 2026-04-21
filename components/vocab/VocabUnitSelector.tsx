'use client'

import React, { useState, useEffect } from 'react'
import { Layers } from 'lucide-react'
import { getSubject, getVocabLabel } from '@/utils/subjects'
import type { DrillCard } from '@/utils/drillSession'

interface VocabUnitSelectorProps {
  subject: string
  onBrowse: (cards: DrillCard[], unitSlug: string) => void
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

export default function VocabUnitSelector({ subject, onBrowse }: VocabUnitSelectorProps) {
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
      const units = subjectInfo.units
      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          newUnitData[result.value.number] = result.value.cards
        } else {
          newUnitData[units[idx].number] = null
        }
      })
      setUnitData(newUnitData)
      setLoading(false)
    })
  }, [subject])

  const subjectInfo = getSubject(subject)
  const units = subjectInfo?.units ?? []
  const label = getVocabLabel(subject)

  const allLoadedCards: DrillCard[] = Object.values(unitData)
    .filter((cards): cards is DrillCard[] => cards !== null)
    .flat()

  const totalCardCount = allLoadedCards.length
  const browseAllDisabled = totalCardCount === 0

  const handleBrowseAll = () => {
    if (browseAllDisabled) return
    onBrowse(allLoadedCards, 'all')
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Loading {label.toLowerCase()}...</span>
      </div>
    )
  }

  const itemNoun = label === 'Formulas' ? 'formulas' : 'terms'
  const pageSubtitle = label === 'Formulas'
    ? 'Pick a unit to browse its formulas.'
    : 'Pick a unit to browse its key terms.'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {label}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          {pageSubtitle}
        </p>
      </div>

      <div
        className="vocab-selector-grid"
        style={{ display: 'grid', gap: '16px' }}
      >
        <div
          onClick={handleBrowseAll}
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
            cursor: browseAllDisabled ? 'not-allowed' : 'pointer',
            opacity: browseAllDisabled ? 0.5 : 1,
            pointerEvents: browseAllDisabled ? 'none' : 'auto',
            transition: 'transform 200ms ease, border-color 200ms ease',
          }}
          onMouseEnter={e => {
            if (!browseAllDisabled) {
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
              Browse All
            </span>
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
            {browseAllDisabled ? 'No content yet' : `${totalCardCount} ${itemNoun}`}
          </div>
        </div>

        {units.map((unit) => {
          const cards = unitData[unit.number]
          const isLoaded = cards !== null && cards !== undefined
          const gradient = UNIT_GRADIENTS[unit.number] ?? DEFAULT_GRADIENT
          const emoji = UNIT_EMOJIS[unit.number] ?? '📖'

          return (
            <div
              key={unit.number}
              onClick={() => isLoaded && onBrowse(cards!, `unit-${unit.number}`)}
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
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.08em',
                  color: 'var(--text-muted)',
                  marginBottom: '6px',
                }}>
                  Unit {unit.number}
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
                <div style={{
                  fontSize: '0.8125rem',
                  color: isLoaded ? 'var(--text-secondary)' : 'var(--text-muted)',
                }}>
                  {isLoaded ? `${cards!.length} ${itemNoun}` : 'Coming soon'}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <style>{`
        .vocab-selector-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 640px) {
          .vocab-selector-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .vocab-selector-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  )
}
