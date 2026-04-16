'use client'

import React, { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Check, X, Calculator } from 'lucide-react'
import MCQCard from '@/components/mcq/MCQCard'
import DesmosPanel from '@/components/tools/DesmosPanel'
import { getSubject } from '@/utils/subjects'
import { saveMCQDraft, clearMCQDraft } from '@/utils/mcqSession'
import type { MCQSessionState, MCQAnswer } from '@/utils/mcqSession'
import { lsGet, lsSet, LS_KEYS } from '@/utils/localStorage'
import { logEvent } from '@/utils/analytics'
import { syncStats } from '@/utils/persistence'
import { shouldBlockAccess } from '@/utils/freeTrialGate'
import { useAuth } from '@/contexts/AuthContext'

interface MCQSessionProps {
  session: MCQSessionState
  subject: string
  onComplete: (finalSession: MCQSessionState) => void
  onStartFresh?: () => void
}

export default function MCQSession({ session, subject, onComplete, onStartFresh }: MCQSessionProps) {
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()
  const [currentIndex, setCurrentIndex] = useState(session.currentIndex ?? 0)
  const [answers, setAnswers] = useState<Record<string, MCQAnswer>>(session.answers ?? {})
  const [desmosOpen, setDesmosOpen] = useState(false)
  const [gateBlocked, setGateBlocked] = useState(false)

  const isCalcSubject = subject === 'ap-calculus-ab' || subject === 'ap-precalculus'

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

  useEffect(() => {
    if (isCalcSubject && !session.questions[currentIndex]?.calculator_allowed) {
      setDesmosOpen(false)
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
    const currentAnswer = answersRef.current[session.questions[currentIndex]?.id]

    // Increment counters for ALL users
    const newTotal = lsGet<number>(LS_KEYS.totalQuestions, 0) + 1
    lsSet(LS_KEYS.totalQuestions, newTotal)
    const newMcq = lsGet<number>(LS_KEYS.mcqCount, 0) + 1
    lsSet(LS_KEYS.mcqCount, newMcq)
    if (currentAnswer?.isCorrect) {
      lsSet(LS_KEYS.mcqCorrect, lsGet<number>(LS_KEYS.mcqCorrect, 0) + 1)
    }

    // Sync to Supabase immediately so stats persist even if tab is closed
    syncStats()

    // Check freemium gate only for unauthenticated users
    if (!isAuthenticated) {
      if (shouldBlockAccess()) {
        setGateBlocked(true)
        return
      }
    }

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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100dvh - 120px)', position: 'relative' }}>

      {/* Freemium gate overlay — blocks interaction when limit is reached */}
      {gateBlocked && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(5, 5, 8, 0.92)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--bg-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '40px 32px',
              maxWidth: '420px',
              width: '100%',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            {/* Adi diamond icon */}
            <div
              aria-hidden="true"
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '10px',
                transform: 'rotate(45deg)',
                background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
                boxShadow: '0 0 24px color-mix(in srgb, var(--accent) 40%, transparent)',
                flexShrink: 0,
              }}
            />
            <div>
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0,
                  marginBottom: '10px',
                  fontFamily: 'var(--font-outfit)',
                  lineHeight: 1.3,
                }}
              >
                You&apos;ve used your 3 free questions
              </h2>
              <p
                style={{
                  fontSize: '0.9375rem',
                  color: 'var(--text-secondary)',
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                Sign up for free to keep practicing — unlimited drills, practice questions, and more.
              </p>
            </div>
            <a
              href={`/signup?redirect=${encodeURIComponent(pathname)}`}
              style={{
                marginTop: '8px',
                display: 'block',
                width: '100%',
                padding: '13px 0',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent)',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 700,
                textDecoration: 'none',
                textAlign: 'center',
                fontFamily: 'var(--font-outfit)',
                transition: 'background 150ms ease, transform 150ms ease',
              }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLAnchorElement).style.background = 'var(--accent-hover)'
                ;(e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLAnchorElement).style.background = 'var(--accent)'
                ;(e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'
              }}
            >
              Sign Up Free
            </a>
          </div>
        </div>
      )}

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

          {/* Calculator button — only for calc subjects on calculator-allowed questions */}
          {isCalcSubject && currentQuestion?.calculator_allowed === true && (
            <button
              onClick={() => setDesmosOpen(o => !o)}
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 10px',
                borderRadius: '999px',
                background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
                border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
                color: 'var(--accent)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Calculator size={14} />
              Calculator
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
            key={currentQuestion.id}
            question={currentQuestion}
            onAnswer={handleAnswer}
            onNext={handleNext}
          />
        </div>
      </div>

      {desmosOpen && <DesmosPanel onClose={() => setDesmosOpen(false)} />}
    </div>
  )
}
