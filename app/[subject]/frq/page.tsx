'use client'

import { useState, useEffect, use } from 'react'
import { Calculator } from 'lucide-react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import DesmosPanel from '@/components/tools/DesmosPanel'
import ReferenceSheetSidebar from '@/components/tools/ReferenceSheetSidebar'
import ChemReferenceSheet from '@/components/tools/ChemReferenceSheet'
import CSPReferenceSheet from '@/components/tools/CSPReferenceSheet'
import FRQQuestionSelect from '@/components/frq/FRQQuestionSelect'
import FRQDBQLayout from '@/components/frq/FRQDBQLayout'
import FRQEssayLayout from '@/components/frq/FRQEssayLayout'
import FRQMultiPartLayout from '@/components/frq/FRQMultiPartLayout'
import FRQMultiPartMathLayout from '@/components/frq/FRQMultiPartMathLayout'
import FRQSAQLayout from '@/components/frq/FRQSAQLayout'
import FRQSubmitModal from '@/components/frq/FRQSubmitModal'
import FRQResults from '@/components/frq/FRQResults'
import FRQMathTutorial from '@/components/frq/FRQMathTutorial'
import FRQShortcutsModal from '@/components/frq/FRQShortcutsModal'
import InlineMath from '@/components/InlineMath'
import {
  hasFRQs,
  isMathSubject,
  isDBQType,
  isMathType,
  isSAQType,
  isEssayType,
  saveFRQDraft,
  loadFRQDraft,
  clearFRQDraft,
  hasMathTutorialSeen,
  setMathTutorialSeen,
} from '@/utils/frqSession'
import type { FRQ, FRQGradingResult, GradingStrictness, FRQDraft } from '@/utils/frqSession'
import { logEvent } from '@/utils/analytics'
import { lsGet, lsSet, LS_KEYS } from '@/utils/localStorage'
import { saveStats } from '@/utils/persistence'

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'loading' | 'select' | 'answer' | 'submitting' | 'results' | 'queued'

interface PageProps {
  params: Promise<{ subject: string }>
}

// ─── Subject slug → display name ──────────────────────────────────────────────

const SUBJECT_DISPLAY_NAMES: Record<string, string> = {
  'ap-psychology': 'AP Psychology',
  'ap-world-history': 'AP World History',
  'ap-government': 'AP Government',
  'ap-calculus-ab': 'AP Calculus AB',
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

  const [phase, setPhase] = useState<Phase>('loading')
  const [questions, setQuestions] = useState<FRQ[]>([])
  const [selectedQuestion, setSelectedQuestion] = useState<FRQ | null>(null)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [gradingResult, setGradingResult] = useState<FRQGradingResult | null>(null)
  const [gradingStrictness, setGradingStrictness] = useState<GradingStrictness>('moderate')
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showMathTutorial, setShowMathTutorial] = useState(false)
  const [remainingCalls, setRemainingCalls] = useState(30)
  const [error, setError] = useState<string | null>(null)
  const [desmosOpen, setDesmosOpen] = useState(false)

  const isRefSubject = subject === 'ap-chemistry' || subject === 'ap-computer-science-principles'
  const refTitle = subject === 'ap-chemistry' ? 'AP Chemistry Reference' : 'AP CSP Reference'

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
    if (isMathSubject(subject) && !selectedQuestion?.calculator_allowed) {
      setDesmosOpen(false)
    }
  }, [selectedQuestion, subject])

  // ─── Select ───────────────────────────────────────────────────────────────

  function handleSelect(q: FRQ) {
    setSelectedQuestion(q)

    // Restore draft if exists for this question
    const draft: FRQDraft | null = loadFRQDraft(subject)
    if (draft && draft.questionId === q.id) {
      setResponses(draft.responses)
    } else {
      setResponses({})
    }

    setPhase('answer')

    // Math subjects: show tutorial overlay on first visit
    if (isMathSubject(subject) && !hasMathTutorialSeen()) {
      setShowMathTutorial(true)
    }
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
    })
  }

  function handleOpenSubmitModal() {
    setShowSubmitModal(true)
  }

  function handleBackToSelect() {
    setSelectedQuestion(null)
    setResponses({})
    setGradingResult(null)
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
        clearFRQDraft(subject)
        setPhase('results')

        // Increment counters
        const partCount = selectedQuestion.parts?.length ?? 1
        const prevTotal = lsGet<number>(LS_KEYS.totalQuestions, 0)
        lsSet(LS_KEYS.totalQuestions, prevTotal + partCount)
        const prevFrq = lsGet<number>(LS_KEYS.frqCount, 0)
        lsSet(LS_KEYS.frqCount, prevFrq + 1)

        // Sync stats to Supabase
        const streak = lsGet<{ count: number; lastPracticeDate: string } | null>(LS_KEYS.streak, null)
        saveStats(
          prevTotal + partCount,
          streak?.count ?? 0,
          streak?.lastPracticeDate ?? null,
          lsGet<number>(LS_KEYS.drillCount, 0),
          lsGet<number>(LS_KEYS.mcqCount, 0),
          prevFrq + 1,
        )

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
    console.log('TODO: open adi panel')
  }

  function handleNextQuestion() {
    setSelectedQuestion(null)
    setResponses({})
    setGradingResult(null)
    setError(null)
    setPhase('select')
  }

  function handleRetry() {
    setResponses({})
    setGradingResult(null)
    setError(null)
    setPhase('answer')
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

        {/* ── Select ─────────────────────────────────────────────────────── */}
        {phase === 'select' && (
          <div>
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
                onSelect={handleSelect}
              />
            )}
          </div>
        )}

        {/* ── Answer ─────────────────────────────────────────────────────── */}
        {phase === 'answer' && selectedQuestion && (
          <div>
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
        {phase === 'results' && gradingResult && (
          <FRQResults
            result={gradingResult}
            strictness={gradingStrictness}
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
                  Your answer has been saved. Adi will grade it when your daily limit resets.
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
      </main>

      {desmosOpen && <DesmosPanel onClose={() => setDesmosOpen(false)} />}

      {isRefSubject && (
        <ReferenceSheetSidebar title={refTitle}>
          {subject === 'ap-chemistry' ? <ChemReferenceSheet /> : <CSPReferenceSheet />}
        </ReferenceSheetSidebar>
      )}
    </AuthGuard>
  )
}
