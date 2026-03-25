'use client'

import React, { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { RotateCcw, BookOpen, ArrowLeft } from 'lucide-react'
import { getSubject } from '@/utils/subjects'
import { projectScore } from '@/utils/scoring'
import { handleTestComplete, computePerUnitAccuracy } from '@/utils/testSession'
import type { TestSessionState } from '@/utils/testSession'

interface TestResultsProps {
  session: TestSessionState
  subject: string
  onRetake: () => void
}

function getScorePillStyle(score: number): React.CSSProperties {
  let color: string
  switch (score) {
    case 5:
      color = 'var(--accent-success)'
      break
    case 4:
      color = 'var(--accent)'
      break
    case 3:
      color = 'var(--accent-warning)'
      break
    default:
      color = 'var(--accent-danger)'
  }
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: `color-mix(in srgb, ${color} 15%, transparent)`,
    border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
    fontSize: '1.25rem',
    fontWeight: 700,
    color,
  }
}

export default function TestResults({ session, subject, onRetake }: TestResultsProps) {
  const router = useRouter()
  const completedRef = useRef(false)

  useEffect(() => {
    if (!completedRef.current) {
      completedRef.current = true
      handleTestComplete(session, subject)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const correctCount = Object.values(session.answers).filter(a => a.isCorrect).length
  const totalQuestions = session.questions.length
  const pct = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
  const projectedScore = projectScore(correctCount / Math.max(totalQuestions, 1))
  const perUnitResults = computePerUnitAccuracy(session.questions, session.answers)
  const missedQuestions = session.questions.filter(q => !session.answers[q.id]?.isCorrect)

  const subjectData = getSubject(subject)
  const subjectName = subjectData?.name ?? subject

  const scoreDeg = Math.min(Math.max((pct / 100) * 360, 0), 360)

  const visibleMissed = missedQuestions.slice(0, 5)
  const extraMissed = missedQuestions.length > 5 ? missedQuestions.length - 5 : 0

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        maxWidth: '640px',
        margin: '0 auto',
        padding: '32px 16px',
      }}
    >
      <style>{`
        @keyframes bar-enter {
          from { width: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .accuracy-bar-fill { transition: none !important; animation: none !important; }
        }
      `}</style>

      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Test Complete
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{subjectName}</p>
      </div>

      {/* Score ring */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div
          className="score-ring"
          style={{ '--score-deg': scoreDeg } as React.CSSProperties}
        >
          <div className="score-ring-inner">
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
              {pct}%
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>score</span>
          </div>
        </div>

        {/* Score metadata */}
        <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {correctCount} / {totalQuestions} correct &middot; Projected AP Score:
          </p>
          <div style={getScorePillStyle(projectedScore)}>
            {projectedScore}
          </div>
        </div>
      </div>

      {/* Per-unit breakdown */}
      {perUnitResults.length > 0 && (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--bg-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
          }}
        >
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Unit Breakdown
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {perUnitResults.map((unit) => {
              const unitPct = Math.round(unit.accuracy * 100)
              const unitDisplayName = subjectData?.units.find(
                u => `unit-${u.number}` === unit.unitNumber || u.name === unit.unitNumber
              )?.name ?? unit.unitName
              return (
                <div key={unit.unitNumber} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      flex: '0 0 auto',
                      maxWidth: '160px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {unitDisplayName}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: '4px',
                      background: 'var(--mastery-empty)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      className="accuracy-bar-fill"
                      style={{
                        height: '100%',
                        width: `${unitPct}%`,
                        background: 'var(--mastery-fill)',
                        borderRadius: '2px',
                        transition: 'width 400ms ease-out',
                        animation: 'bar-enter 400ms ease-out',
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-muted)',
                      flex: '0 0 40px',
                      textAlign: 'right',
                    }}
                  >
                    {unitPct}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Missed questions */}
      {missedQuestions.length > 0 && (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--bg-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Missed Questions
            </h2>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '999px',
                background: 'color-mix(in srgb, var(--accent-danger) 15%, transparent)',
                border: '1px solid color-mix(in srgb, var(--accent-danger) 30%, transparent)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--accent-danger)',
              }}
            >
              {missedQuestions.length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {visibleMissed.map((question) => {
              const studentAnswer = session.answers[question.id]
              const selectedChoice = question.choices.find(c => c.id === studentAnswer?.selectedChoiceId)
              const correctChoice = question.choices.find(c => c.is_correct)
              const truncatedQ = question.question.length > 100
                ? question.question.slice(0, 100) + '...'
                : question.question

              return (
                <div
                  key={question.id}
                  style={{
                    paddingBottom: '12px',
                    borderBottom: '1px solid var(--bg-border)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: '6px',
                      lineHeight: 1.4,
                    }}
                  >
                    {truncatedQ}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--accent-danger)', marginBottom: '2px' }}>
                    Your answer: {selectedChoice?.text ?? '(unanswered)'}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--accent-success)' }}>
                    Correct: {correctChoice?.text ?? '—'}
                  </div>
                </div>
              )
            })}

            {extraMissed > 0 && (
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', paddingTop: '4px' }}>
                + {extraMissed} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* CTAs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Retake Test */}
        <button
          onClick={onRetake}
          style={{
            width: '100%',
            padding: '14px 20px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: 'var(--accent)',
            color: 'white',
            fontSize: '0.9375rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background 150ms ease, transform 150ms ease',
          }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover)'
            ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)'
            ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
          }}
        >
          <RotateCcw size={16} />
          Retake Test
        </button>

        {/* Practice by Unit */}
        <button
          onClick={() => router.push(`/${subject}/practice`)}
          style={{
            width: '100%',
            padding: '14px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--bg-border)',
            background: 'transparent',
            color: 'var(--text-primary)',
            fontSize: '0.9375rem',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'border-color 150ms ease, transform 150ms ease',
          }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'
            ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--bg-border)'
            ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
          }}
        >
          <BookOpen size={16} />
          Practice by Unit
        </button>

        {/* Back to Subject */}
        <button
          onClick={() => router.push(`/${subject}`)}
          style={{
            width: '100%',
            padding: '14px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--bg-border)',
            background: 'transparent',
            color: 'var(--text-primary)',
            fontSize: '0.9375rem',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'border-color 150ms ease, transform 150ms ease',
          }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'
            ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--bg-border)'
            ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
          }}
        >
          <ArrowLeft size={16} />
          Back to {subjectName}
        </button>
      </div>
    </div>
  )
}
