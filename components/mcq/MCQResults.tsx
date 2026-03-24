'use client'

import React, { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { RotateCcw, ArrowLeft } from 'lucide-react'
import { getSubject } from '@/utils/subjects'
import { scramble } from '@/utils/scramble'
import { handleMCQSessionComplete } from '@/utils/mcqSession'
import type { MCQSessionState } from '@/utils/mcqSession'

interface MCQResultsProps {
  session: MCQSessionState
  subject: string
  onRetry: (retrySession: MCQSessionState) => void
  onUnitSelect: () => void
}

export default function MCQResults({ session, subject, onRetry, onUnitSelect }: MCQResultsProps) {
  const router = useRouter()
  const completedRef = useRef(false)

  useEffect(() => {
    if (!completedRef.current) {
      completedRef.current = true
      handleMCQSessionComplete(session, subject)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const correctCount = Object.values(session.answers).filter(a => a.isCorrect).length
  const totalQuestions = session.questions.length
  const pct = Math.round((correctCount / totalQuestions) * 100)
  const missedQuestions = session.questions.filter(q => !session.answers[q.id]?.isCorrect)

  const subjectData = getSubject(subject)
  const subjectDisplayName = subjectData?.name ?? subject
  const unitLabel =
    session.unitSlug === 'all'
      ? 'All Units'
      : subjectData?.units.find(u => `unit-${u.number}` === session.unitSlug)?.name ?? session.unitSlug

  const heading =
    pct >= 90 ? 'Excellent work!' :
    pct >= 70 ? 'Good progress!' :
    pct >= 50 ? 'Keep at it!' :
    'Room to grow!'

  const scoreDeg = Math.min(Math.max(pct * 3.6, 0), 360)

  const handleRetryClick = () => {
    const retrySession: MCQSessionState = {
      questions: scramble(missedQuestions),
      answers: {},
      isRetry: true,
      unitSlug: session.unitSlug,
      retryQuestionIds: missedQuestions.map(q => q.id),
    }
    onRetry(retrySession)
  }

  const visibleMissed = missedQuestions.slice(0, 5)
  const extraMissed = missedQuestions.length > 5 ? missedQuestions.length - 5 : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '560px', margin: '0 auto' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Session Complete
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>{unitLabel}</p>
      </div>

      {/* Score ring + heading */}
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

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {missedQuestions.length === 0 ? 'Perfect score!' : heading}
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {totalQuestions} questions · {unitLabel}
          </p>
        </div>
      </div>

      {/* Missed questions section */}
      {missedQuestions.length > 0 && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--bg-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px',
          }}>
            <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Missed Questions
            </span>
            <span style={{
              padding: '2px 8px',
              borderRadius: '999px',
              background: 'color-mix(in srgb, var(--accent-danger) 15%, transparent)',
              border: '1px solid color-mix(in srgb, var(--accent-danger) 30%, transparent)',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--accent-danger)',
            }}>
              {missedQuestions.length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {visibleMissed.map((question) => {
              const studentAnswer = session.answers[question.id]
              const selectedChoice = question.choices.find(c => c.id === studentAnswer?.selectedChoiceId)
              const correctChoice = question.choices.find(c => c.is_correct)
              const truncatedQuestion = question.question.length > 100
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
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '6px',
                    lineHeight: 1.4,
                  }}>
                    {truncatedQuestion}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--accent-danger)', marginBottom: '2px' }}>
                    Your answer: {selectedChoice?.text ?? '—'}
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
        {/* Retry missed — hidden when 0 missed */}
        {missedQuestions.length > 0 && (
          <button
            onClick={handleRetryClick}
            style={{
              width: '100%',
              padding: '12px 20px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'var(--accent)',
              color: 'white',
              fontSize: '0.9375rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background 150ms ease, transform 150ms ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover)'
              ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)'
              ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
            }}
          >
            <RotateCcw size={16} />
            Retry missed questions ({missedQuestions.length})
          </button>
        )}

        {/* Back to subject */}
        <button
          onClick={() => router.push('/' + subject)}
          style={{
            width: '100%',
            padding: '12px 20px',
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
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'
            ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--bg-border)'
            ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
          }}
        >
          <ArrowLeft size={16} />
          Back to {subjectDisplayName}
        </button>

        {/* Study another unit */}
        <button
          onClick={onUnitSelect}
          style={{
            width: '100%',
            padding: '10px 20px',
            background: 'transparent',
            border: 'none',
            color: 'var(--accent)',
            fontSize: '0.9375rem',
            fontWeight: 500,
            cursor: 'pointer',
            textDecoration: 'none',
            transition: 'text-decoration 150ms ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.textDecoration = 'underline'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.textDecoration = 'none'
          }}
        >
          Study another unit
        </button>
      </div>
    </div>
  )
}
