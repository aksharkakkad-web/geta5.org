'use client'

import { useState, use, useEffect } from 'react'
import { getSubject } from '@/utils/subjects'
import { AP_TEST_CONFIG } from '@/utils/testConfig'
import { composeTest, loadTestDraft, clearTestDraft } from '@/utils/testSession'
import TestSetup from '@/components/test/TestSetup'
import TestSession from '@/components/test/TestSession'
import TestResults from '@/components/test/TestResults'
import ReferenceSheetSidebar from '@/components/tools/ReferenceSheetSidebar'
import ChemReferenceSheet from '@/components/tools/ChemReferenceSheet'
import CSPReferenceSheet from '@/components/tools/CSPReferenceSheet'
import type { TestSessionState, TestDraft } from '@/utils/testSession'
import type { MCQ } from '@/utils/mcqSession'
import { AuthGuard } from '@/components/auth/AuthGuard'

type TestView = 'setup' | 'session' | 'results'

interface PracticeTestPageProps {
  params: Promise<{ subject: string }>
}

export default function PracticeTestPage({ params }: PracticeTestPageProps) {
  const { subject } = use(params)
  const [view, setView] = useState<TestView>('setup')
  const [session, setSession] = useState<TestSessionState | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [testDraft, setTestDraft] = useState<TestDraft | null>(null)
  const [draftChecked, setDraftChecked] = useState(false)

  useEffect(() => {
    const saved = loadTestDraft(subject)
    setTestDraft(saved)
    setDraftChecked(true)
  }, [subject])

  function formatRemaining(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return s > 0 ? `${m}m ${s}s` : `${m}m`
  }

  function handleResumeTest() {
    if (!testDraft) return
    const restoredSession: TestSessionState = {
      questions: testDraft.questions,
      answers: testDraft.answers,
      flagged: testDraft.flagged,
      currentIndex: testDraft.currentIndex,
      timed: testDraft.timed,
      showTimer: testDraft.showTimer,
      durationSeconds: testDraft.remainingSeconds,
      subjectSlug: testDraft.subjectSlug,
    }
    setSession(restoredSession)
    setTestDraft(null)
    setView('session')
  }

  function handleDismissTestDraft() {
    clearTestDraft(subject)
    setTestDraft(null)
  }

  const subjectData = getSubject(subject)
  const config = AP_TEST_CONFIG[subject]

  if (!subjectData || !config) {
    return (
      <main style={{ padding: '40px', color: 'var(--text-primary)' }}>
        Subject not found.
      </main>
    )
  }

  async function loadQuestions(): Promise<Map<string, MCQ[]>> {
    const unitNumbers = subjectData!.units.map(u => u.number)

    const results = await Promise.allSettled(
      unitNumbers.map(n =>
        fetch(`/data/${subject}/mcq/unit-${n}.json`)
          .then(res => {
            if (!res.ok) return null
            return res.json().then((data: { questions: MCQ[] }) => data.questions)
          })
          .catch(() => null)
      )
    )

    const questionsByUnit = new Map<string, MCQ[]>()
    results.forEach((result, i) => {
      const unitSlug = `unit-${unitNumbers[i]}`
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        questionsByUnit.set(unitSlug, result.value)
      }
    })

    return questionsByUnit
  }

  async function handleStart(timed: boolean, showTimer: boolean) {
    setLoadError(null)
    try {
      const questionsByUnit = await loadQuestions()

      if (questionsByUnit.size === 0) {
        setLoadError('empty')
        return
      }

      const questions = composeTest(questionsByUnit, config.questionCount)

      if (questions.length === 0) {
        setLoadError('empty')
        return
      }

      const newSession: TestSessionState = {
        questions,
        answers: {},
        flagged: {},
        currentIndex: 0,
        timed,
        showTimer,
        durationSeconds: config.durationMinutes * 60,
        subjectSlug: subject,
        startedAt: Date.now(),
      }

      setSession(newSession)
      setView('session')
    } catch {
      setLoadError('error')
    }
  }

  function handleComplete(finalSession: TestSessionState) {
    setSession(finalSession)
    setView('results')
  }

  async function handleRetake() {
    setView('setup')
    setSession(null)
  }

  const isSession = view === 'session' && session

  return (
    <AuthGuard requireAuth>
    <main
      style={{
        maxWidth: isSession ? undefined : '960px',
        margin: isSession ? undefined : '0 auto',
        minHeight: 'calc(100dvh - 64px)',
      }}
    >
      {/* Empty state */}
      {loadError === 'empty' && (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No questions available for this subject yet. Content is being added.
        </div>
      )}

      {/* Error state */}
      {loadError === 'error' && (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Couldn&apos;t load test questions. Check your connection and try again.
        </div>
      )}

      {/* Setup view — resume prompt if draft exists */}
      {view === 'setup' && draftChecked && testDraft && !loadError && (
        <div
          style={{
            maxWidth: '480px',
            margin: '80px auto 0',
            padding: '0 24px',
          }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--bg-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px 24px',
            }}
          >
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Unfinished practice test
            </p>
            <p style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {subjectData.name}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: testDraft.timed ? '8px' : '24px' }}>
              {Object.keys(testDraft.answers).length} of {testDraft.questions.length} questions answered
            </p>
            {testDraft.timed && (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                {formatRemaining(testDraft.remainingSeconds)} remaining
              </p>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleResumeTest}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: 'var(--accent)',
                  color: 'white',
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Continue Test
              </button>
              <button
                onClick={handleDismissTestDraft}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--bg-border)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                }}
              >
                Start New Test
              </button>
            </div>
          </div>
        </div>
      )}
      {view === 'setup' && draftChecked && !testDraft && !loadError && (
        <TestSetup
          subjectSlug={subject}
          subjectName={subjectData.name}
          questionCount={config.questionCount}
          durationMinutes={config.durationMinutes}
          onStart={handleStart}
        />
      )}

      {/* Session view */}
      {isSession && (
        <TestSession
          session={session!}
          subject={subject}
          subjectName={subjectData.name}
          onComplete={handleComplete}
        />
      )}

      {/* Results view */}
      {view === 'results' && session && (
        <TestResults
          session={session}
          subject={subject}
          onRetake={handleRetake}
        />
      )}
    </main>

    {(subject === 'ap-chemistry' || subject === 'ap-computer-science-principles') && (
      <ReferenceSheetSidebar title={subject === 'ap-chemistry' ? 'AP Chemistry Reference' : 'AP CSP Reference'}>
        {subject === 'ap-chemistry' ? <ChemReferenceSheet /> : <CSPReferenceSheet />}
      </ReferenceSheetSidebar>
    )}
    </AuthGuard>
  )
}
