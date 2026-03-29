'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Check, X } from 'lucide-react'
import DrillCard from '@/components/drill/DrillCard'
import { SessionState, saveDrillDraft, clearDrillDraft, insertRetryCard } from '@/utils/drillSession'
import { getSubject } from '@/utils/subjects'
import { lsGet, lsSet, LS_KEYS } from '@/utils/localStorage'
import { logEvent } from '@/utils/analytics'

interface DrillSessionProps {
  session: SessionState
  subject: string
  onComplete: (finalSession: SessionState) => void
  onStartFresh?: () => void
}

export default function DrillSession({ session, subject, onComplete, onStartFresh }: DrillSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(session.index ?? 0)
  const [answers, setAnswers] = useState<
    Record<string, { verdict: 'correct' | 'wrong'; userInput: string }>
  >(session.answers ?? {})

  // Keep a ref so handleNext always sees latest answers without stale closure
  const answersRef = useRef(answers)
  answersRef.current = answers

  const [workingDeck, setWorkingDeck] = useState<SessionState['cards']>(() =>
    session.workingDeck ?? [...session.cards]
  )
  const workingDeckRef = useRef(workingDeck)
  workingDeckRef.current = workingDeck

  // Auto-save draft + update partial mastery whenever currentIndex advances
  useEffect(() => {
    if (currentIndex > 0) {
      saveDrillDraft(subject, {
        cards: session.cards,
        workingDeck: workingDeckRef.current,
        currentIndex,
        answers: answersRef.current,
        isRetry: session.isRetry,
        unitSlug: session.unitSlug,
        savedAt: Date.now(),
      })
      // Update mastery progressively so bars reflect partial sessions
      if (!session.isRetry && session.unitSlug !== 'all') {
        const ans = answersRef.current
        const answered = Object.keys(ans).length
        if (answered > 0) {
          const correct = Object.values(ans).filter(a => a.verdict === 'correct').length
          const existing = lsGet(LS_KEYS.mastery(subject, session.unitSlug), { drillAccuracy: 0, mcqAccuracy: 0, totalAttempts: 0 })
          lsSet(LS_KEYS.mastery(subject, session.unitSlug), { ...existing, drillAccuracy: correct / answered })
        }
      }
    }
  }, [currentIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  const totalCards = workingDeck.length
  const currentCard = workingDeck[currentIndex]

  const correctCount = Object.values(answers).filter(a => a.verdict === 'correct').length
  const wrongCount = Object.values(answers).filter(a => a.verdict === 'wrong').length

  // Build session header label
  const subjectData = getSubject(subject)
  let unitLabel: string
  if (session.unitSlug === 'all') {
    unitLabel = 'All Units'
  } else {
    const unitNumber = session.unitSlug.replace('unit-', '')
    const unitData = subjectData?.units.find(u => u.number === parseInt(unitNumber, 10))
    unitLabel = unitData ? `Unit ${unitNumber} · ${unitData.name}` : `Unit ${unitNumber}`
  }
  if (session.isRetry) {
    unitLabel = `Retry · ${unitLabel}`
  }

  const handleAnswer = (
    cardId: string,
    verdict: 'correct' | 'wrong',
    userInput: string
  ) => {
    setAnswers(prev => ({ ...prev, [cardId]: { verdict, userInput } }))
    const card = workingDeckRef.current[currentIndex]
    logEvent({
      event_type: 'drill_answer',
      subject,
      unit: card?.unit ?? session.unitSlug,
      metadata: { correct: verdict === 'correct', mode: card?.mode },
    })
  }

  const handleNext = () => {
    const cardBeingAnswered = workingDeckRef.current[currentIndex]
    const finalVerdict = answersRef.current[cardBeingAnswered.id]?.verdict

    // If wrong, splice card back into deck RETRY_INTERVAL positions ahead
    let nextDeck = workingDeckRef.current
    if (finalVerdict === 'wrong') {
      nextDeck = insertRetryCard(workingDeckRef.current, cardBeingAnswered, currentIndex)
      setWorkingDeck(nextDeck)
    }

    if (currentIndex + 1 >= nextDeck.length) {
      clearDrillDraft(subject)
      const finalSession: SessionState = {
        ...session,
        index: currentIndex + 1,
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
        <DrillCard
          key={`${currentCard.id}-${currentIndex}`}
          card={currentCard}
          onAnswer={handleAnswer}
          onNext={handleNext}
          isRetry={!!answers[currentCard.id]}
        />
      </div>
    </div>
  )
}
