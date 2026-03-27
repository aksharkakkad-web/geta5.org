'use client'

import { useState, useEffect, use } from 'react'
import UnitSelector from '@/components/mcq/UnitSelector'
import MCQSession from '@/components/mcq/MCQSession'
import MCQResults from '@/components/mcq/MCQResults'
import { loadMCQDraft, clearMCQDraft } from '@/utils/mcqSession'
import type { MCQView, MCQSessionState, MCQDraft } from '@/utils/mcqSession'

interface PracticePageProps {
  params: Promise<{ subject: string }>
}

export default function PracticePage({ params }: PracticePageProps) {
  const { subject } = use(params)
  const [view, setView] = useState<MCQView>('unit-select')
  const [session, setSession] = useState<MCQSessionState | null>(null)
  const [draft, setDraft] = useState<MCQDraft | null>(null)
  const [draftChecked, setDraftChecked] = useState(false)

  useEffect(() => {
    const saved = loadMCQDraft(subject)
    setDraft(saved)
    setDraftChecked(true)
  }, [subject])

  const handleResumeDraft = () => {
    if (!draft) return
    const resumedSession: MCQSessionState = {
      questions: draft.questions,
      currentIndex: draft.currentIndex,
      answers: draft.answers,
      isRetry: draft.isRetry,
      unitSlug: draft.unitSlug,
      retryQuestionIds: draft.retryQuestionIds,
    }
    setSession(resumedSession)
    setDraft(null)
    setView('session')
  }

  const handleDismissDraft = () => {
    clearMCQDraft(subject)
    setDraft(null)
  }

  const handleStart = (newSession: MCQSessionState) => {
    setSession(newSession)
    setView('session')
  }

  const handleComplete = (finalSession: MCQSessionState) => {
    setSession(finalSession)
    setView('results')
  }

  const handleRetry = (retrySession: MCQSessionState) => {
    setSession(retrySession)
    setView('session')
  }

  const handleUnitSelect = () => {
    setSession(null)
    setView('unit-select')
  }

  const isSession = view === 'session' && session

  return (
    <main style={{
      padding: '24px',
      maxWidth: isSession ? '100%' : '960px',
      margin: '0 auto',
      minHeight: isSession ? 'calc(100dvh - 64px)' : undefined,
      display: isSession ? 'flex' : undefined,
      flexDirection: isSession ? 'column' : undefined,
    }}>
      {view === 'unit-select' && draftChecked && draft && (
        <div
          style={{
            maxWidth: '480px',
            margin: '80px auto 0',
            background: 'var(--bg-card)',
            border: '1px solid var(--bg-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px 24px',
          }}
        >
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Unfinished session
          </p>
          <p style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {draft.unitSlug === 'all' ? 'All Units' : `Unit ${draft.unitSlug.replace('unit-', '')}`}
            {draft.isRetry ? ' · Retry' : ''}
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {Object.keys(draft.answers).length} of {draft.questions.length} questions answered
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleResumeDraft}
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
              Continue
            </button>
            <button
              onClick={handleDismissDraft}
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
              Start Fresh
            </button>
          </div>
        </div>
      )}
      {view === 'unit-select' && draftChecked && !draft && (
        <UnitSelector subject={subject} onStart={handleStart} />
      )}
      {isSession && (
        <MCQSession session={session!} subject={subject} onComplete={handleComplete} />
      )}
      {view === 'results' && session && (
        <MCQResults
          session={session}
          subject={subject}
          onRetry={handleRetry}
          onUnitSelect={handleUnitSelect}
        />
      )}
    </main>
  )
}
