'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Flag, Grid, X } from 'lucide-react'
import MCQCard from '@/components/mcq/MCQCard'
import TestTimer from '@/components/test/TestTimer'
import { saveTestDraft, clearTestDraft } from '@/utils/testSession'
import type { TestSessionState, TestAnswer } from '@/utils/testSession'

interface TestSessionProps {
  session: TestSessionState
  subject: string
  subjectName: string
  onComplete: (session: TestSessionState) => void
}

export default function TestSession({
  session,
  subjectName,
  onComplete,
}: TestSessionProps) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, TestAnswer>>(session.answers)
  const [flagged, setFlagged] = useState<Record<string, boolean>>(session.flagged)
  const [currentIndex, setCurrentIndex] = useState(session.currentIndex)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [showTimesUp, setShowTimesUp] = useState(false)
  const [showNavModal, setShowNavModal] = useState(false)

  // answersRef: prevents stale closure in timer's onExpiry callback
  const answersRef = useRef(answers)
  const flaggedRef = useRef(flagged)

  useEffect(() => { answersRef.current = answers }, [answers])
  useEffect(() => { flaggedRef.current = flagged }, [flagged])

  const remainingSecondsRef = useRef(session.durationSeconds)

  function handleTick(seconds: number) {
    remainingSecondsRef.current = seconds
  }

  // Auto-save draft after every answer or navigation change
  useEffect(() => {
    if (Object.keys(answers).length > 0 || currentIndex > 0) {
      saveTestDraft({
        questions: session.questions,
        answers: answersRef.current,
        flagged: flaggedRef.current,
        currentIndex,
        timed: session.timed,
        showTimer: session.showTimer,
        remainingSeconds: remainingSecondsRef.current,
        subjectSlug: session.subjectSlug,
        savedAt: Date.now(),
      })
    }
  }, [answers, flagged, currentIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  const questions = session.questions
  const currentQuestion = questions[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1

  function handleAnswer(questionId: string, selectedChoiceId: string, isCorrect: boolean) {
    setAnswers(prev => {
      const next = { ...prev, [questionId]: { selectedChoiceId, isCorrect } }
      answersRef.current = next
      return next
    })
  }

  function handleNavNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  function handleJump(index: number) {
    setCurrentIndex(index)
    setShowNavModal(false)
  }

  function toggleFlag() {
    const qId = currentQuestion.id
    setFlagged(prev => {
      const next = { ...prev, [qId]: !prev[qId] }
      flaggedRef.current = next
      return next
    })
  }

  function handleSubmitClick() {
    const unansweredCount = questions.length - Object.keys(answersRef.current).length
    setShowNavModal(false)
    if (unansweredCount > 0) {
      setShowSubmitConfirm(true)
    } else {
      doSubmit()
    }
  }

  function doSubmit() {
    clearTestDraft(session.subjectSlug)
    onComplete({
      ...session,
      answers: answersRef.current,
      flagged: flaggedRef.current,
    })
  }

  function handleExpiry() {
    clearTestDraft(session.subjectSlug)
    setShowTimesUp(true)
    setTimeout(() => {
      setShowTimesUp(false)
      onComplete({
        ...session,
        answers: answersRef.current,
        flagged: flaggedRef.current,
      })
    }, 1500)
  }

  function handleSaveAndExit() {
    saveTestDraft({
      questions: session.questions,
      answers: answersRef.current,
      flagged: flaggedRef.current,
      currentIndex,
      timed: session.timed,
      showTimer: session.showTimer,
      remainingSeconds: remainingSecondsRef.current,
      subjectSlug: session.subjectSlug,
      savedAt: Date.now(),
    })
    router.push(`/${session.subjectSlug}`)
  }

  const unansweredCount = questions.length - Object.keys(answers).length
  const questionIds = questions.map(q => q.id)
  const isCurrentFlagged = !!flagged[currentQuestion?.id]
  const flaggedCount = Object.values(flagged).filter(Boolean).length

  function getModalCellStyle(index: number): React.CSSProperties {
    const qId = questionIds[index]
    const isActive = index === currentIndex
    const isAnswered = !!answers[qId]
    const isFlagged = !!flagged[qId]

    const base: React.CSSProperties = {
      position: 'relative',
      height: '44px',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid',
      fontSize: '0.875rem',
      fontWeight: 400,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 150ms ease, border-color 150ms ease',
    }

    if (isActive) {
      return { ...base, background: 'var(--accent)', borderColor: 'var(--accent)', color: 'white', fontWeight: 700 }
    }
    if (isFlagged) {
      return { ...base, background: 'color-mix(in srgb, var(--accent-warning) 15%, transparent)', borderColor: 'var(--accent-warning)', color: 'var(--accent-warning)' }
    }
    if (isAnswered) {
      return { ...base, background: 'color-mix(in srgb, var(--accent) 20%, transparent)', borderColor: 'var(--accent)', color: 'var(--text-primary)' }
    }
    return { ...base, background: 'var(--bg-card)', borderColor: 'var(--bg-border)', color: 'var(--text-muted)' }
  }

  return (
    <>
      {/* Time's Up overlay */}
      {showTimesUp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'color-mix(in srgb, var(--bg-primary) 90%, transparent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Time&apos;s Up
          </p>
        </div>
      )}

      {/* Question Navigator Modal */}
      {showNavModal && (
        <div
          onClick={() => setShowNavModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: '540px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid var(--bg-border)',
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid var(--bg-border)',
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                Question Navigator
              </span>
              <button
                onClick={() => setShowNavModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Progress summary */}
            <div
              style={{
                padding: '10px 20px',
                display: 'flex',
                gap: '16px',
                borderBottom: '1px solid var(--bg-border)',
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
              }}
            >
              <span>{Object.keys(answers).length} of {questions.length} answered</span>
              {flaggedCount > 0 && (
                <span style={{ color: 'var(--accent-warning)' }}>
                  {flaggedCount} flagged
                </span>
              )}
            </div>

            {/* Grid */}
            <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(8, 1fr)',
                  gap: '8px',
                }}
              >
                {questions.map((q, i) => {
                  const isFlagged = !!flagged[q.id]
                  return (
                    <button
                      key={i}
                      onClick={() => handleJump(i)}
                      style={getModalCellStyle(i)}
                      aria-label={`Question ${i + 1}${isFlagged ? ' (flagged)' : ''}`}
                    >
                      {i + 1}
                      {isFlagged && (
                        <Flag
                          size={8}
                          style={{
                            position: 'absolute',
                            bottom: '3px',
                            right: '3px',
                            color: 'var(--accent-warning)',
                          }}
                        />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Legend */}
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  marginTop: '16px',
                  flexWrap: 'wrap',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 3,
                      background: 'color-mix(in srgb, var(--accent) 20%, transparent)',
                      border: '1px solid var(--accent)',
                      display: 'inline-block',
                    }}
                  />
                  Answered
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 3,
                      background: 'var(--bg-card)',
                      border: '1px solid var(--bg-border)',
                      display: 'inline-block',
                    }}
                  />
                  Unanswered
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 3,
                      background: 'color-mix(in srgb, var(--accent-warning) 15%, transparent)',
                      border: '1px solid var(--accent-warning)',
                      display: 'inline-block',
                    }}
                  />
                  Flagged
                </span>
              </div>
            </div>

            {/* Modal actions */}
            <div
              style={{
                padding: '16px 20px',
                borderTop: '1px solid var(--bg-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <button
                onClick={handleSaveAndExit}
                style={{
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--bg-border)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                Save &amp; Exit
              </button>
              <button
                onClick={handleSubmitClick}
                style={{
                  padding: '10px 24px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: 'var(--accent)',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Submit Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit confirm banner */}
      {showSubmitConfirm && (
        <div
          style={{
            background: 'var(--bg-card)',
            borderLeft: '4px solid var(--accent-warning)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
            <strong>{unansweredCount} questions unanswered.</strong> Unanswered questions will be marked wrong.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => { setShowSubmitConfirm(false); doSubmit() }}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'var(--accent-danger)',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Submit Anyway
            </button>
            <button
              onClick={() => setShowSubmitConfirm(false)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--bg-border)',
                background: 'transparent',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Keep Going
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div
        style={{
          display: 'flex',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '24px 16px',
        }}
      >
        <div style={{ flex: 1, maxWidth: '720px', margin: '0 auto' }}>
          {/* Question counter + timer + flag */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Question {currentIndex + 1} of {questions.length}
            </span>

            <TestTimer
              initialSeconds={session.durationSeconds}
              timed={session.timed}
              inline
              onExpiry={handleExpiry}
              onTick={handleTick}
            />

            <button
              onClick={toggleFlag}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: isCurrentFlagged ? 'var(--accent-warning)' : 'var(--text-muted)',
                transition: 'color 150ms ease',
              }}
            >
              <Flag size={14} />
              {isCurrentFlagged ? 'Flagged' : 'Flag for Review'}
            </button>
          </div>

          {/* MCQCard — testMode hides Submit Answer; initialSelectedId restores selection on nav */}
          <MCQCard
            key={currentQuestion.id}
            question={currentQuestion}
            onAnswer={handleAnswer}
            onNext={handleNavNext}
            testMode={true}
            initialSelectedId={answers[currentQuestion.id]?.selectedChoiceId ?? null}
          />

          {/* Navigation row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '24px',
              gap: '12px',
            }}
          >
            {/* Prev */}
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                minHeight: '44px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--bg-border)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '0.875rem',
                cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                opacity: currentIndex === 0 ? 0.4 : 1,
                transition: 'color 150ms ease, border-color 150ms ease',
              }}
            >
              <ChevronLeft size={16} />
              Prev
            </button>

            {/* Questions modal trigger */}
            <button
              onClick={() => setShowNavModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                minHeight: '44px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--bg-border)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'color 150ms ease, border-color 150ms ease',
              }}
            >
              <Grid size={15} />
              Questions
            </button>

            {/* Next — becomes Submit Test on last question */}
            {isLastQuestion ? (
              <button
                onClick={handleSubmitClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 20px',
                  minHeight: '44px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: 'var(--accent)',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Submit Test
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  minHeight: '44px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--bg-border)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'color 150ms ease, border-color 150ms ease',
                }}
              >
                Next
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
