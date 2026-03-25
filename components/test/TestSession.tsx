'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Flag, Eye, EyeOff } from 'lucide-react'
import MCQCard from '@/components/mcq/MCQCard'
import TestTimer from '@/components/test/TestTimer'
import TestNavGrid from '@/components/test/TestNavGrid'
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
  const [answers, setAnswers] = useState<Record<string, TestAnswer>>(session.answers)
  const [flagged, setFlagged] = useState<Record<string, boolean>>(session.flagged)
  const [currentIndex, setCurrentIndex] = useState(session.currentIndex)
  const [showTimer, setShowTimer] = useState(session.showTimer)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [showTimesUp, setShowTimesUp] = useState(false)

  // answersRef: prevents stale closure in timer's onExpiry callback (Pitfall 1)
  const answersRef = useRef(answers)
  const flaggedRef = useRef(flagged)

  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  useEffect(() => {
    flaggedRef.current = flagged
  }, [flagged])

  const questions = session.questions
  const currentQuestion = questions[currentIndex]

  const correctCount = Object.values(answers).filter(a => a.isCorrect).length
  const wrongCount = Object.values(answers).filter(a => !a.isCorrect).length

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
    setShowSubmitConfirm(false)
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
    if (unansweredCount > 0) {
      setShowSubmitConfirm(true)
    } else {
      doSubmit()
    }
  }

  function doSubmit() {
    onComplete({
      ...session,
      answers: answersRef.current,
      flagged: flaggedRef.current,
    })
  }

  function handleExpiry() {
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

  const unansweredCount = questions.length - Object.keys(answers).length
  const questionIds = questions.map(q => q.id)
  const isCurrentFlagged = !!flagged[currentQuestion?.id]

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
            animation: 'fadeIn 300ms ease-in',
          }}
        >
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          `}</style>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Time&apos;s Up
          </p>
        </div>
      )}

      {/* Session header — sticky */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--bg-border)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        {/* Left: subject label */}
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
          {subjectName} &mdash; Practice Test
        </div>

        {/* Center: timer */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <TestTimer
            initialSeconds={session.durationSeconds}
            timed={session.timed}
            visible={showTimer}
            onExpiry={handleExpiry}
          />
        </div>

        {/* Right: controls + tally */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* Timer show/hide toggle */}
          {session.timed && (
            <button
              onClick={() => setShowTimer(!showTimer)}
              aria-label={showTimer ? 'Hide timer' : 'Show timer'}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {showTimer ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}

          {/* Correct tally */}
          {correctCount > 0 && (
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '999px',
                background: 'color-mix(in srgb, var(--accent-success) 15%, transparent)',
                border: '1px solid color-mix(in srgb, var(--accent-success) 30%, transparent)',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--accent-success)',
              }}
            >
              {correctCount}
            </span>
          )}

          {/* Wrong tally */}
          {wrongCount > 0 && (
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '999px',
                background: 'color-mix(in srgb, var(--accent-danger) 15%, transparent)',
                border: '1px solid color-mix(in srgb, var(--accent-danger) 30%, transparent)',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--accent-danger)',
              }}
            >
              {wrongCount}
            </span>
          )}
        </div>
      </div>

      {/* Nav grid */}
      <div style={{ borderBottom: '1px solid var(--bg-border)' }}>
        <TestNavGrid
          totalQuestions={questions.length}
          currentIndex={currentIndex}
          answers={answers}
          flagged={flagged}
          questionIds={questionIds}
          onJump={handleJump}
        />
      </div>

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

      {/* Main content — desktop: sidebar + question; mobile: stacked */}
      <div
        style={{
          display: 'flex',
          gap: '0',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '24px 16px',
        }}
      >
        {/* Question area */}
        <div style={{ flex: 1, maxWidth: '720px', margin: '0 auto' }}>
          {/* Question counter + flag */}
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

            {/* Flag for Review button */}
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

          {/* MCQCard — key on question id so it resets internal state when navigating */}
          <MCQCard
            key={currentQuestion.id}
            question={currentQuestion}
            onAnswer={handleAnswer}
            onNext={handleNavNext}
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

            {/* Submit Test */}
            <button
              onClick={handleSubmitClick}
              style={{
                padding: '10px 24px',
                minHeight: '44px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'var(--accent)',
                color: 'white',
                fontSize: '0.9375rem',
                fontWeight: 700,
                cursor: 'pointer',
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
              Submit Test
            </button>

            {/* Next */}
            <button
              onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
              disabled={currentIndex === questions.length - 1}
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
                cursor: currentIndex === questions.length - 1 ? 'not-allowed' : 'pointer',
                opacity: currentIndex === questions.length - 1 ? 0.4 : 1,
                transition: 'color 150ms ease, border-color 150ms ease',
              }}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
