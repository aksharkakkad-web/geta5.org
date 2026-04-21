'use client'

import { useState, useEffect, useRef, use } from 'react'
import { Calculator } from 'lucide-react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import DesmosPanel from '@/components/tools/DesmosPanel'
import ReferenceSheetModal from '@/components/tools/ReferenceSheetModal'
import FRQQuestionSelect from '@/components/frq/FRQQuestionSelect'
import FRQReadyScreen from '@/components/frq/FRQReadyScreen'
import FRQTimerBar from '@/components/frq/FRQTimerBar'
import FRQDBQLayout from '@/components/frq/FRQDBQLayout'
import FRQEBQLayout from '@/components/frq/FRQEBQLayout'
import FRQEssayLayout from '@/components/frq/FRQEssayLayout'
import FRQMultiPartLayout from '@/components/frq/FRQMultiPartLayout'
import FRQMultiPartMathLayout from '@/components/frq/FRQMultiPartMathLayout'
import FRQSAQLayout from '@/components/frq/FRQSAQLayout'
import FRQSubmitModal from '@/components/frq/FRQSubmitModal'
import FRQResults from '@/components/frq/FRQResults'
import FRQBreakdown from '@/components/frq/FRQBreakdown'
import FRQMathTutorial from '@/components/frq/FRQMathTutorial'
import FRQShortcutsModal from '@/components/frq/FRQShortcutsModal'
import FRQSourceLinks from '@/components/frq/FRQSourceLinks'
import InlineMath from '@/components/InlineMath'
import {
  hasFRQs,
  isMathSubject,
  isDBQType,
  isEBQType,
  isMathType,
  isSAQType,
  isEssayType,
  saveFRQDraft,
  loadFRQDraft,
  clearFRQDraft,
  hasMathTutorialSeen,
  setMathTutorialSeen,
  getQuestionSeconds,
  getTimedModePreference,
  setTimedModePreference,
  getLastStrictness,
  loadFRQCompletions,
  saveFRQCompletion,
} from '@/utils/frqSession'
import type { FRQ, FRQGradingResult, GradingStrictness, FRQDraft, FRQCompletion } from '@/utils/frqSession'
import { logEvent } from '@/utils/analytics'
import { lsGet, lsSet, LS_KEYS } from '@/utils/localStorage'
import { syncStats } from '@/utils/persistence'
import { useAdi } from '@/components/adi/AdiProvider'
import { BackToSubject } from '@/components/ui/BackToSubject'

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'loading' | 'select' | 'ready' | 'answer' | 'submitting' | 'results' | 'queued'

interface PageProps {
  params: Promise<{ subject: string }>
}

// ─── Subject slug → display name ──────────────────────────────────────────────

const SUBJECT_DISPLAY_NAMES: Record<string, string> = {
  'ap-psychology': 'AP Psychology',
  'ap-world-history': 'AP World History',
  'ap-government': 'AP Government',
  'ap-calculus-ab': 'AP Calculus AB',
  'ap-calculus-bc': 'AP Calculus BC',
  'ap-precalculus': 'AP Precalculus',
  'ap-computer-science-principles': 'AP Computer Science Principles',
  'ap-chemistry': 'AP Chemistry',
}

function getDisplayName(subject: string): string {
  return SUBJECT_DISPLAY_NAMES[subject] ?? subject
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FRQPage({ params }: PageProps) {
  const { subject } = use(params)
  const adi = useAdi()

  const [phase, setPhase] = useState<Phase>('loading')
  const [questions, setQuestions] = useState<FRQ[]>([])
  const [selectedQuestion, setSelectedQuestion] = useState<FRQ | null>(null)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [gradingResult, setGradingResult] = useState<FRQGradingResult | null>(null)
  const [gradingStrictness, setGradingStrictness] = useState<GradingStrictness>('moderate')
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | undefined>(undefined)
  const [gradingResponses, setGradingResponses] = useState<Record<string, string>>({})
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showMathTutorial, setShowMathTutorial] = useState(false)
  const [remainingCalls, setRemainingCalls] = useState(30)
  const [error, setError] = useState<string | null>(null)
  const [queuedMessage, setQueuedMessage] = useState<string>('Your answer has been saved. Adi will grade it when your daily limit resets.')
  const [desmosOpen, setDesmosOpen] = useState(false)
  const [timedMode, setTimedMode] = useState(true)
  const [timerStartedAt, setTimerStartedAt] = useState<number | null>(null)
  const [showTimesUp, setShowTimesUp] = useState(false)
  const [completions, setCompletions] = useState<Record<string, FRQCompletion>>({})
  const timerCancelledRef = useRef(false)


  // ─── Loading ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!hasFRQs(subject)) {
      setPhase('select')
      return
    }

    async function load() {
      try {
        // Fetch manifest and usage in parallel
        const [manifestRes, usageRes] = await Promise.allSettled([
          fetch(`/data/${subject}/frq/manifest.json`),
          fetch('/api/adi-usage'),
        ])

        // Parse usage
        if (usageRes.status === 'fulfilled' && usageRes.value.ok) {
          try {
            const usageData = await usageRes.value.json()
            const remaining = (usageData.limit ?? 30) - (usageData.count ?? 0)
            setRemainingCalls(Math.max(0, remaining))
          } catch {
            // Non-blocking — keep default
          }
        }

        // Parse manifest
        if (manifestRes.status === 'rejected' || !manifestRes.value.ok) {
          setPhase('select')
          setQuestions([])
          return
        }

        let ids: string[]
        try {
          ids = await manifestRes.value.json()
        } catch {
          setPhase('select')
          setQuestions([])
          return
        }

        // Fetch all question files in parallel
        const questionResults = await Promise.allSettled(
          ids.map(id => fetch(`/data/${subject}/frq/${id}.json`).then(r => r.ok ? r.json() : null))
        )

        const loaded: FRQ[] = questionResults
          .filter((r): r is PromiseFulfilledResult<FRQ | null> => r.status === 'fulfilled' && r.value !== null)
          .map(r => r.value as FRQ)

        setQuestions(loaded)
        setPhase('select')
      } catch {
        setPhase('select')
        setQuestions([])
      }
    }

    load()
  }, [subject])

  useEffect(() => {
    setCompletions(loadFRQCompletions(subject))
  }, [subject])

  useEffect(() => {
    if (isMathSubject(subject) && !selectedQuestion?.calculator_allowed) {
      setDesmosOpen(false)
    }
  }, [selectedQuestion, subject])

  // ─── Select ───────────────────────────────────────────────────────────────

  function handleSelect(q: FRQ) {
    setSelectedQuestion(q)
    timerCancelledRef.current = false

    // Restore draft if exists for this question
    const draft: FRQDraft | null = loadFRQDraft(subject)
    if (draft && draft.questionId === q.id) {
      setResponses(draft.responses)
      setTimerStartedAt(draft.timerStartedAt ?? null)
      setTimedMode(draft.timedMode ?? getTimedModePreference())
    } else {
      setResponses({})
      setTimerStartedAt(null)
      setTimedMode(getTimedModePreference())
    }

    setPhase('ready')
  }

  function handleTimedModeChange(timed: boolean) {
    setTimedMode(timed)
    setTimedModePreference(timed)
  }

  function handleStart() {
    const now = Date.now()
    if (timedMode) {
      setTimerStartedAt(now)
    } else {
      setTimerStartedAt(null)
    }
    setPhase('answer')

    // Math subjects: show tutorial overlay on first visit
    if (isMathSubject(subject) && !hasMathTutorialSeen()) {
      setShowMathTutorial(true)
    }
  }

  function handleTimerExpire() {
    if (timerCancelledRef.current) return
    timerCancelledRef.current = true
    setShowTimesUp(true)
    setTimeout(() => {
      setShowTimesUp(false)
      handleSubmit(getLastStrictness())
    }, 3000)
  }

  function handleMathTutorialClose() {
    setMathTutorialSeen()
    setShowMathTutorial(false)
  }

  // ─── Answer ───────────────────────────────────────────────────────────────

  function handleResponseChange(letter: string, value: string) {
    setResponses(prev => {
      const next = { ...prev, [letter]: value }
      if (selectedQuestion) {
        saveFRQDraft({
          questionId: selectedQuestion.id,
          subject,
          responses: next,
          currentPart: letter,
          savedAt: Date.now(),
          timedMode,
          timerStartedAt,
        })
      }
      return next
    })
  }

  function handleSaveDraft() {
    if (!selectedQuestion) return
    saveFRQDraft({
      questionId: selectedQuestion.id,
      subject,
      responses,
      currentPart: Object.keys(responses).at(-1) ?? '',
      savedAt: Date.now(),
      timedMode,
      timerStartedAt,
    })
  }

  function handleOpenSubmitModal() {
    setShowSubmitModal(true)
  }

  function handleBackToSelect() {
    timerCancelledRef.current = true
    setTimerStartedAt(null)
    setShowTimesUp(false)
    setSelectedQuestion(null)
    setResponses({})
    setGradingResult(null)
    setGradingSubmissionId(undefined)
    setGradingResponses({})
    setError(null)
    setPhase('select')
  }

  // ─── Submit ───────────────────────────────────────────────────────────────

  async function handleSubmit(strictness: GradingStrictness) {
    if (!selectedQuestion) return
    setShowSubmitModal(false)
    setPhase('submitting')
    setError(null)

    try {
      const res = await fetch('/api/frq/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: selectedQuestion.id,
          subject,
          responses,
          strictness,
        }),
      })

      const data = await res.json()

      if (data.status === 'graded') {
        setGradingResult(data.result)
        setGradingStrictness(strictness)
        setGradingSubmissionId(data.submissionId ?? undefined)
        setGradingResponses({ ...responses })
        clearFRQDraft(subject)
        saveFRQCompletion(subject, selectedQuestion.id, data.result.total_score, data.result.max_score, responses)
        setCompletions(loadFRQCompletions(subject))
        setPhase('results')

        // Increment counters
        const partCount = selectedQuestion.parts?.length ?? 1
        lsSet(LS_KEYS.totalQuestions, lsGet<number>(LS_KEYS.totalQuestions, 0) + partCount)
        lsSet(LS_KEYS.frqCount, lsGet<number>(LS_KEYS.frqCount, 0) + 1)

        // Sync stats to Supabase
        syncStats()

        // Fire analytics
        logEvent({
          event_type: 'frq_completed',
          subject,
          unit: selectedQuestion.related_units?.[0] ? `unit-${selectedQuestion.related_units[0]}` : undefined,
          metadata: {
            question_id: selectedQuestion.id,
            frq_type: selectedQuestion.frq_type,
            strictness,
            parts_count: partCount,
            score: data.result?.total_score ?? undefined,
            max_score: data.result?.max_score ?? undefined,
          },
        })
      } else if (data.status === 'queued') {
        clearFRQDraft(subject)
        setQueuedMessage(data.message ?? 'Your answer has been saved. Adi will grade it when your daily limit resets.')
        setPhase('queued')
      } else {
        // Server returned an error shape
        const message = data.message ?? 'Something went wrong. Please try again.'
        setError(message)
        setPhase('answer')
      }
    } catch {
      setError('Could not reach the server. Check your connection and try again.')
      setPhase('answer')
    }
  }

  // ─── Results ──────────────────────────────────────────────────────────────

  function handleAskAdi() {
    if (!selectedQuestion || !gradingResult) return
    const unit = selectedQuestion.related_units?.[0]
      ? `unit-${selectedQuestion.related_units[0]}`
      : ''
    adi.setFRQContext({
      questionId: selectedQuestion.id,
      unit,
      frqResponses: gradingResponses,
      frqResult: {
        total_score: gradingResult.total_score,
        max_score: gradingResult.max_score,
        takeaway: gradingResult.takeaway,
        parts: gradingResult.parts.map(p => ({
          letter: p.letter,
          earned: p.earned,
          max: p.max,
          feedback: p.feedback,
          missed: p.missed,
        })),
      },
    })
    adi.open()
    adi.sendMessage(`I just finished this FRQ and got ${gradingResult.total_score}/${gradingResult.max_score}. Can you explain what I did right and wrong, and how I can improve?`)
  }

  function handleNextQuestion() {
    timerCancelledRef.current = true
    setTimerStartedAt(null)
    setShowTimesUp(false)
    setSelectedQuestion(null)
    setResponses({})
    setGradingResult(null)
    setGradingSubmissionId(undefined)
    setGradingResponses({})
    setError(null)
    setPhase('select')
  }

  function handleRetry() {
    timerCancelledRef.current = false
    setTimerStartedAt(null)
    setShowTimesUp(false)
    setResponses({})
    setGradingResult(null)
    setGradingSubmissionId(undefined)
    setGradingResponses({})
    setError(null)
    setTimedMode(getTimedModePreference())
    setPhase('ready')
  }

  // ─── Render helpers ───────────────────────────────────────────────────────

  function renderAnswerLayout() {
    if (!selectedQuestion) return null
    const props = {
      question: selectedQuestion,
      responses,
      onResponseChange: handleResponseChange,
      onSubmit: handleOpenSubmitModal,
      onSaveDraft: handleSaveDraft,
    }

    if (isEBQType(selectedQuestion.frq_type)) {
      return <FRQEBQLayout {...props} />
    }
    if (isDBQType(selectedQuestion.frq_type)) {
      return <FRQDBQLayout {...props} />
    }
    if (isSAQType(selectedQuestion.frq_type)) {
      return <FRQSAQLayout {...props} />
    }
    if (isMathType(selectedQuestion.frq_type)) {
      return <FRQMultiPartMathLayout {...props} onShowShortcuts={() => setShowShortcuts(true)} />
    }
    if (isEssayType(selectedQuestion.frq_type)) {
      return <FRQEssayLayout {...props} />
    }
    // Default: concept_application, scotus_comparison, quantitative_analysis, multi_part_text
    return <FRQMultiPartLayout {...props} />
  }

  const displayName = getDisplayName(subject)

  // ─── Phases ───────────────────────────────────────────────────────────────

  // No FRQs for this subject
  if (!hasFRQs(subject) && phase !== 'loading') {
    return (
      <AuthGuard requireAuth>
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
            This subject does not have FRQ practice.
          </p>
        </main>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requireAuth>
      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '24px',
        }}
      >
        {/* ── Loading ────────────────────────────────────────────────────── */}
        {phase === 'loading' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '40vh',
            }}
          >
            <p
              style={{
                fontSize: '0.9375rem',
                color: 'var(--text-muted)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            >
              Loading questions...
            </p>
          </div>
        )}

        {/* ── Ready ──────────────────────────────────────────────────────── */}
        {phase === 'ready' && selectedQuestion && (
          <FRQReadyScreen
            question={selectedQuestion}
            subject={subject}
            timedMode={timedMode}
            onTimedModeChange={handleTimedModeChange}
            onStart={handleStart}
            onBack={() => {
              setSelectedQuestion(null)
              setResponses({})
              setPhase('select')
            }}
          />
        )}

        {/* ── Select ─────────────────────────────────────────────────────── */}
        {phase === 'select' && (
          <div>
            <BackToSubject subject={subject} />
            {/* Page header */}
            <div style={{ marginBottom: '28px' }}>
              <h1
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0,
                  marginBottom: '6px',
                  fontFamily: 'var(--font-outfit)',
                }}
              >
                FRQ Practice
              </h1>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  margin: 0,
                }}
              >
                {displayName}
              </p>
            </div>

            {/* No questions available */}
            {questions.length === 0 ? (
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--bg-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '40px 24px',
                  textAlign: 'center',
                }}
              >
                <p
                  style={{
                    fontSize: '0.9375rem',
                    color: 'var(--text-secondary)',
                    margin: 0,
                  }}
                >
                  No FRQ questions available yet. Check back soon!
                </p>
              </div>
            ) : (
              <FRQQuestionSelect
                questions={questions}
                subject={subject}
                completions={completions}
                onSelect={handleSelect}
              />
            )}
          </div>
        )}

        {/* ── Answer ─────────────────────────────────────────────────────── */}
        {phase === 'answer' && selectedQuestion && (
          <div>
            {/* Timer bar */}
            {timedMode && timerStartedAt !== null && (
              <FRQTimerBar
                totalSeconds={getQuestionSeconds(selectedQuestion)}
                startedAt={timerStartedAt}
                onExpire={handleTimerExpire}
              />
            )}

            {/* Error banner */}
            {error && (
              <div
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <span
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--accent-danger)',
                    lineHeight: 1.5,
                  }}
                >
                  {error}
                </span>
                <button
                  onClick={() => setError(null)}
                  aria-label="Dismiss error"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent-danger)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    lineHeight: 1,
                    padding: '2px 4px',
                    flexShrink: 0,
                    transition: 'opacity 150ms ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.7' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
                >
                  &times;
                </button>
              </div>
            )}

            {/* Back button */}
            <button
              onClick={handleBackToSelect}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 0',
                marginBottom: '20px',
                transition: 'color 150ms ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
            >
              <svg
                aria-hidden="true"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
              >
                <path
                  d="M9 2L4 7L9 12"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back to questions
            </button>

            {/* Question title + metadata */}
            <div style={{ marginBottom: '24px' }}>
              <h2
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  margin: 0,
                  marginBottom: '6px',
                  lineHeight: 1.4,
                  fontFamily: 'var(--font-outfit)',
                }}
              >
                {isMathSubject(subject)
                  ? <InlineMath text={selectedQuestion.title} />
                  : selectedQuestion.title}
              </h2>
              {selectedQuestion.source_pdf && (
                <div style={{ marginTop: '10px' }}>
                  <FRQSourceLinks pdfHref={selectedQuestion.source_pdf} />
                </div>
              )}
            </div>

            {/* Calculator button — math subjects, calculator-allowed questions only */}
            {isMathSubject(subject) && selectedQuestion.calculator_allowed === true && (
              <button
                onClick={() => setDesmosOpen(o => !o)}
                style={{
                  display: 'inline-flex',
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
                  marginBottom: '16px',
                }}
              >
                <Calculator size={14} />
                Calculator
              </button>
            )}

            {/* Layout component */}
            {renderAnswerLayout()}

            {/* Modals */}
            <FRQShortcutsModal
              open={showShortcuts}
              onClose={() => setShowShortcuts(false)}
            />
          </div>
        )}

        {/* ── Submitting ─────────────────────────────────────────────────── */}
        {phase === 'submitting' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '40vh',
              gap: '16px',
            }}
          >
            <div
              aria-hidden="true"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                transform: 'rotate(45deg)',
                background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
                boxShadow: '0 0 20px color-mix(in srgb, var(--accent) 35%, transparent)',
                animation: 'pulse 1.5s ease-in-out infinite',
                flexShrink: 0,
              }}
            />
            <p
              style={{
                fontSize: '0.9375rem',
                color: 'var(--text-secondary)',
                animation: 'pulse 1.5s ease-in-out infinite',
                margin: 0,
              }}
            >
              Adi is grading your response...
            </p>
          </div>
        )}

        {/* ── Results ────────────────────────────────────────────────────── */}
        {phase === 'results' && gradingResult && selectedQuestion && (
          <FRQBreakdown
            question={selectedQuestion}
            result={gradingResult}
            responses={gradingResponses}
            strictness={gradingStrictness}
            submissionId={gradingSubmissionId}
            onAskAdi={handleAskAdi}
            onNextQuestion={handleNextQuestion}
            onRetry={handleRetry}
          />
        )}

        {/* ── Queued ─────────────────────────────────────────────────────── */}
        {phase === 'queued' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '40vh',
            }}
          >
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--bg-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '40px 32px',
                maxWidth: '448px',
                width: '100%',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              {/* Adi icon */}
              <div
                aria-hidden="true"
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '10px',
                  transform: 'rotate(45deg)',
                  background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px color-mix(in srgb, var(--accent) 35%, transparent)',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    transform: 'rotate(-45deg)',
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: 'white',
                    fontFamily: 'var(--font-outfit)',
                  }}
                >
                  A
                </span>
              </div>

              <div>
                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    margin: 0,
                    marginBottom: '8px',
                    fontFamily: 'var(--font-outfit)',
                  }}
                >
                  Response Queued
                </h2>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {queuedMessage}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedQuestion(null)
                  setResponses({})
                  setGradingResult(null)
                  setError(null)
                  setPhase('select')
                }}
                style={{
                  marginTop: '8px',
                  padding: '11px 24px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: 'var(--accent)',
                  color: 'white',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 150ms ease, transform 150ms ease',
                  fontFamily: 'var(--font-outfit)',
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
                Back to Questions
              </button>
            </div>
          </div>
        )}

        {/* ── Modals (rendered outside phase blocks so they overlay any phase) */}
        <FRQMathTutorial
          open={showMathTutorial}
          onClose={handleMathTutorialClose}
        />
        <FRQSubmitModal
          open={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          onSubmit={handleSubmit}
          remainingCalls={remainingCalls}
        />

        {/* ── Time's Up overlay ───────────────────────────────────────────── */}
        {showTimesUp && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 'var(--radius-lg)',
                padding: '40px 48px',
                textAlign: 'center',
                maxWidth: '340px',
                width: '100%',
              }}
            >
              <p
                style={{
                  margin: '0 0 8px',
                  fontSize: '2rem',
                  lineHeight: 1,
                }}
              >
                ⏱
              </p>
              <h2
                style={{
                  margin: '0 0 8px',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--accent-danger, #ef4444)',
                  fontFamily: 'var(--font-outfit)',
                }}
              >
                Time&apos;s Up
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                }}
              >
                Submitting your response…
              </p>

              {/* Drain bar */}
              <div
                style={{
                  marginTop: '20px',
                  height: '3px',
                  borderRadius: '2px',
                  background: 'var(--bg-border)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    background: 'var(--accent-danger, #ef4444)',
                    animation: 'timesup-drain 3s linear forwards',
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {desmosOpen && <DesmosPanel onClose={() => setDesmosOpen(false)} />}

      <ReferenceSheetModal subject={subject} />
    </AuthGuard>
  )
}
