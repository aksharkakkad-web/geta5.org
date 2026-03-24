'use client'

import { useState, useEffect } from 'react'
import { Layers } from 'lucide-react'
import { getSubject } from '@/utils/subjects'
import { scramble } from '@/utils/scramble'
import { lsGet, LS_KEYS } from '@/utils/localStorage'
import type { MCQSessionState, MCQ } from '@/utils/mcqSession'

interface MCQUnitSelectorProps {
  subject: string
  onStart: (session: MCQSessionState) => void
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

export default function UnitSelector({ subject, onStart }: MCQUnitSelectorProps) {
  const [unitData, setUnitData] = useState<Record<number, MCQ[] | null>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const subjectInfo = getSubject(subject)
    if (!subjectInfo) {
      setLoading(false)
      return
    }

    const fetches = subjectInfo.units.map(async (unit) => {
      const res = await fetch(`/data/${subject}/mcq/unit-${unit.number}.json`)
      if (res.ok) {
        const data = await res.json()
        return { number: unit.number, questions: data.questions as MCQ[] }
      }
      return { number: unit.number, questions: null }
    })

    Promise.allSettled(fetches).then((results) => {
      const newUnitData: Record<number, MCQ[] | null> = {}
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          newUnitData[result.value.number] = result.value.questions
        }
      })
      // For rejected promises, re-map via index
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

  const allLoadedQuestions: MCQ[] = Object.values(unitData)
    .filter((questions): questions is MCQ[] => questions !== null)
    .flat()

  const totalQuestionCount = allLoadedQuestions.length
  const studyAllDisabled = totalQuestionCount === 0

  const handleStudyAll = () => {
    if (studyAllDisabled) return
    onStart({
      questions: scramble(allLoadedQuestions),
      answers: {},
      isRetry: false,
      unitSlug: 'all',
    })
  }

  const handleUnitClick = (unitNumber: number, questions: MCQ[]) => {
    onStart({
      questions: scramble(questions),
      answers: {},
      isRetry: false,
      unitSlug: `unit-${unitNumber}`,
    })
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Loading questions...</span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Page header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Practice Questions
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Pick a unit to practice multiple choice questions.
        </p>
      </div>

      {/* Unit grid */}
      <div
        className="mcq-unit-selector-grid"
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
            {studyAllDisabled ? 'No content yet' : `${totalQuestionCount} questions`}
          </div>
        </div>

        {/* Unit cards */}
        {units.map((unit) => {
          const questions = unitData[unit.number]
          const isLoaded = questions !== null && questions !== undefined
          const gradient = UNIT_GRADIENTS[unit.number] ?? DEFAULT_GRADIENT
          const emoji = UNIT_EMOJIS[unit.number] ?? '📖'
          const masteryData = lsGet(LS_KEYS.mastery(subject, `unit-${unit.number}`), {
            drillAccuracy: 0,
            mcqAccuracy: 0,
            totalAttempts: 0,
          })
          const masteryPct = masteryData.mcqAccuracy * 100

          return (
            <div
              key={unit.number}
              onClick={() => isLoaded && handleUnitClick(unit.number, questions!)}
              style={{
                background: 'var(--bg-card)',
                border: `1px solid var(--bg-border)`,
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                cursor: isLoaded ? 'pointer' : 'not-allowed',
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

              {/* Card content */}
              <div style={{ padding: '16px' }}>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  textTransform: 'uppercase',
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

                {/* Question count */}
                <div style={{
                  fontSize: '0.8125rem',
                  color: isLoaded ? 'var(--text-secondary)' : 'var(--text-muted)',
                  marginBottom: '12px',
                }}>
                  {isLoaded ? `${questions!.length} questions` : 'Coming soon'}
                </div>

                {/* Mastery bar */}
                <div style={{
                  height: '4px',
                  background: 'var(--mastery-empty)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${masteryPct}%`,
                    background: 'var(--accent)',
                    borderRadius: '999px',
                    transition: 'width 400ms ease',
                  }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <style>{`
        .mcq-unit-selector-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 640px) {
          .mcq-unit-selector-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .mcq-unit-selector-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  )
}
