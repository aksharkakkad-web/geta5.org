'use client'

import React, { useState, useRef } from 'react'
import { Check, X } from 'lucide-react'
import MCQCard from '@/components/mcq/MCQCard'
import { getSubject } from '@/utils/subjects'
import type { MCQSessionState, MCQAnswer } from '@/utils/mcqSession'

interface MCQSessionProps {
  session: MCQSessionState
  subject: string
  onComplete: (finalSession: MCQSessionState) => void
}

export default function MCQSession({ session, subject, onComplete }: MCQSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, MCQAnswer>>({})

  // Keep a ref so handleNext always sees latest answers without stale closure
  const answersRef = useRef(answers)
  answersRef.current = answers

  const totalQuestions = session.questions.length
  const currentQuestion = session.questions[currentIndex]

  const correctCount = Object.values(answers).filter(a => a.isCorrect).length
  const wrongCount = Object.values(answers).filter(a => !a.isCorrect).length

  // Build session header label
  const subjectData = getSubject(subject)
  let unitLabel: string
  if (session.unitSlug === 'all') {
    unitLabel = 'All Units'
  } else {
    const unitNumber = session.unitSlug.replace('unit-', '')
    const unitData = subjectData?.units.find(u => u.number === parseInt(unitNumber, 10))
    unitLabel = unitData ? `Unit ${unitNumber} - ${unitData.name}` : `Unit ${unitNumber}`
  }
  if (session.isRetry) {
    unitLabel = `Retry - ${unitLabel}`
  }

  const handleAnswer = (questionId: string, selectedChoiceId: string, isCorrect: boolean) => {
    setAnswers(prev => ({ ...prev, [questionId]: { selectedChoiceId, isCorrect } }))
  }

  const handleNext = () => {
    if (currentIndex + 1 >= totalQuestions) {
      const finalSession: MCQSessionState = {
        ...session,
        answers: { ...answersRef.current },
      }
      onComplete(finalSession)
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const progressPercent = (currentIndex / totalQuestions) * 100

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100dvh - 120px)' }}>
      {/* Session header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        {/* Left: unit label */}
        <span
          style={{
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            flexShrink: 0,
          }}
        >
          {unitLabel}
        </span>

        {/* Right: progress + score badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flex: 1,
            justifyContent: 'flex-end',
          }}
        >
          {/* Progress bar + count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '200px' }}>
            <div
              style={{
                flex: 1,
                background: 'var(--mastery-empty)',
                borderRadius: '999px',
                height: '6px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  background: 'var(--accent)',
                  height: '100%',
                  borderRadius: '999px',
                  transition: 'width 400ms ease',
                }}
              />
            </div>
            <span
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {currentIndex} of {totalQuestions}
            </span>
          </div>

          {/* Score badges */}
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            {/* Correct badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '999px',
                background: 'color-mix(in srgb, var(--accent-success) 15%, transparent)',
                border: '1px solid color-mix(in srgb, var(--accent-success) 30%, transparent)',
                color: 'var(--accent-success)',
                fontSize: '0.8125rem',
                fontWeight: 600,
              }}
            >
              <Check size={12} />
              <span>{correctCount}</span>
            </div>

            {/* Wrong badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '999px',
                background: 'color-mix(in srgb, var(--accent-danger) 15%, transparent)',
                border: '1px solid color-mix(in srgb, var(--accent-danger) 30%, transparent)',
                color: 'var(--accent-danger)',
                fontSize: '0.8125rem',
                fontWeight: 600,
              }}
            >
              <X size={12} />
              <span>{wrongCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card area — fills remaining height, card centered within it */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '24px',
        paddingBottom: '24px',
      }}>
        <div style={{ maxWidth: '720px', width: '100%' }}>
          <MCQCard
            question={currentQuestion}
            onAnswer={handleAnswer}
            onNext={handleNext}
          />
        </div>
      </div>
    </div>
  )
}
