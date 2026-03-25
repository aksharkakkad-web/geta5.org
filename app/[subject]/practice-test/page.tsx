'use client'

import { useState, use } from 'react'
import { getSubject } from '@/utils/subjects'
import { AP_TEST_CONFIG } from '@/utils/testConfig'
import { composeTest } from '@/utils/testSession'
import TestSetup from '@/components/test/TestSetup'
import TestSession from '@/components/test/TestSession'
import TestResults from '@/components/test/TestResults'
import type { TestSessionState } from '@/utils/testSession'
import type { MCQ } from '@/utils/mcqSession'

type TestView = 'setup' | 'session' | 'results'

interface PracticeTestPageProps {
  params: Promise<{ subject: string }>
}

export default function PracticeTestPage({ params }: PracticeTestPageProps) {
  const { subject } = use(params)
  const [view, setView] = useState<TestView>('setup')
  const [session, setSession] = useState<TestSessionState | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

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

      {/* Setup view */}
      {view === 'setup' && !loadError && (
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
  )
}
