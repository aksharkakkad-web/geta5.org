'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Check, X } from 'lucide-react'
import MCQCard from '@/components/mcq/MCQCard'
import { getSubject } from '@/utils/subjects'
import { saveMCQDraft, clearMCQDraft } from '@/utils/mcqSession'
import type { MCQSessionState, MCQAnswer } from '@/utils/mcqSession'
import { lsGet, lsSet, LS_KEYS } from '@/utils/localStorage'
import { logEvent } from '@/utils/analytics'

interface MCQSessionProps {
  session: MCQSessionState
  subject: string
  onComplete: (finalSession: MCQSessionState) => void
  onStartFresh?: () => void
}

export default function MCQSession({ session, subject, onComplete, onStartFresh }: MCQSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(session.currentIndex ?? 0)
  const [answers, setAnswers] = useState<Record<string, MCQAnswer>>(session.answers ?? {})

  // Keep a ref so handleNext always sees latest answers without stale closure
  const answersRef = useRef(answers)
  answersRef.current = answers

  // Auto-save draft + update partial mastery whenever currentIndex advances
  useEffect(() => {
    if (currentIndex > 0) {
      saveMCQDraft(subject, {
        questions: session.questions,
        currentIndex,
        answers: answersRef.current,
        isRetry: session.isRetry,
        unitSlug: session.unitSlug,
        retryQuestionIds: session.retryQuestionIds,
        savedAt: Date.now(),
      })
      // Update mastery progressively so bars reflect partial sessions
      if (!session.isRetry && session.unitSlug !== 'all') {
        const ans = answersRef.current
        const answered = Object.keys(ans).length
        if (answered > 0) {
          const correct = Object.values(ans).filter(a => a.isCorrect).length
          const existing = lsGet(LS_KEYS.mastery(subject, session.unitSlug), { drillAccuracy: 0, mcqAccuracy: 0, totalAttempts: 0 })
          lsSet(LS_KEYS.mastery(subject, session.unitSlug), { ...existing, mcqAccuracy: correct / answered })
        }
      }
    }
  }, [currentIndex]) // eslint-disable-line react-hooks/exhaustive-deps

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
    const q = session.questions[currentIndex]
    logEvent({
      event_type: 'mcq_answer',
      subject,
      unit: q?.unit ?? session.unitSlug,
      metadata: { correct: isCorrect },
    })
  }

  const handleNext = () => {
    if (currentIndex + 1 >= totalQuestions) {
      clearMCQDraft(subject)
      const finalSession: MCQSessionState = {
        ...session,
        answers: { ...answersRef.current },
      }
      onComplete(finalSession)
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }

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

        {/* Right: progress + score badges + start fresh */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flex: 1,
            justifyContent: 'flex-end',
          }}
        >
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

          {/* Start fresh button */}
          {onStartFresh && (
            <button
              onClick={onStartFresh}
              style={{
                flexShrink: 0,
                padding: '4px 12px',
                borderRadius: '999px',
                border: '1px solid var(--bg-border)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Start fresh
            </button>
          )}
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
