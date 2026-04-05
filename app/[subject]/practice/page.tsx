'use client'

import { useState, useEffect, use } from 'react'
import UnitSelector from '@/components/mcq/UnitSelector'
import MCQSession from '@/components/mcq/MCQSession'
import MCQResults from '@/components/mcq/MCQResults'
import { loadMCQDraft, clearMCQDraft } from '@/utils/mcqSession'
import type { MCQView, MCQSessionState, MCQDraft } from '@/utils/mcqSession'
import { AuthGuard } from '@/components/auth/AuthGuard'

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

  const handleSessionStartFresh = () => {
    clearMCQDraft(subject)
    setDraft(null)
    setSession(null)
    setView('unit-select')
  }

  const isSession = view === 'session' && session

  return (
    <AuthGuard>
      <main style={{
        padding: '24px',
        maxWidth: isSession ? '100%' : '960px',
        margin: '0 auto',
        minHeight: isSession ? 'calc(100dvh - 64px)' : undefined,
        display: isSession ? 'flex' : undefined,
        flexDirection: isSession ? 'column' : undefined,
      }}>
        {view === 'unit-select' && draftChecked && (
          <UnitSelector
            subject={subject}
            onStart={handleStart}
            draft={draft}
            onResume={handleResumeDraft}
          />
        )}
        {isSession && (
          <MCQSession session={session!} subject={subject} onComplete={handleComplete} onStartFresh={handleSessionStartFresh} />
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
    </AuthGuard>
  )
}
