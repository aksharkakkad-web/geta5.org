'use client'

import { useState, useEffect, use } from 'react'
import UnitSelector from '@/components/drill/UnitSelector'
import DrillSession from '@/components/drill/DrillSession'
import DrillResults from '@/components/drill/DrillResults'
import { loadDrillDraft, clearDrillDraft } from '@/utils/drillSession'
import type { DrillView, SessionState, DrillCard, DrillDraft } from '@/utils/drillSession'
import BrowseView from '@/components/drill/BrowseView'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { BackToSubject } from '@/components/ui/BackToSubject'

interface DrillsPageProps {
  params: Promise<{ subject: string }>
}

export default function DrillsPage({ params }: DrillsPageProps) {
  const { subject } = use(params)
  const [view, setView] = useState<DrillView>('unit-select')
  const [session, setSession] = useState<SessionState | null>(null)
  const [browseMode, setBrowseMode] = useState(false)
  const [browseCards, setBrowseCards] = useState<DrillCard[] | null>(null)
  const [browseUnitSlug, setBrowseUnitSlug] = useState<string | null>(null)
  const [draft, setDraft] = useState<DrillDraft | null>(null)
  const [draftChecked, setDraftChecked] = useState(false)

  useEffect(() => {
    const saved = loadDrillDraft(subject)
    setDraft(saved)
    setDraftChecked(true)
  }, [subject])

  const handleResumeDraft = () => {
    if (!draft) return
    const resumedSession: SessionState = {
      cards: draft.cards,
      workingDeck: draft.workingDeck,
      index: draft.currentIndex,
      answers: draft.answers,
      isRetry: draft.isRetry,
      unitSlug: draft.unitSlug,
    }
    setSession(resumedSession)
    setDraft(null)
    setView('session')
  }

  const handleDismissDraft = () => {
    clearDrillDraft(subject)
    setDraft(null)
  }

  const handleStart = (newSession: SessionState) => {
    setDraft(null)
    setSession(newSession)
    setView('session')
  }

  const handleComplete = (finalSession: SessionState) => {
    setSession(finalSession)
    setView('results')
  }

  const handleRetry = (retrySession: SessionState) => {
    setSession(retrySession)
    setView('session')
  }

  const handleUnitSelect = () => {
    setSession(null)
    setView('unit-select')
  }

  const handleSessionStartFresh = () => {
    clearDrillDraft(subject)
    setDraft(null)
    setSession(null)
    setView('unit-select')
  }

  const handleBrowse = (cards: DrillCard[], unitSlug: string) => {
    setBrowseCards(cards)
    setBrowseUnitSlug(unitSlug)
    setView('browse')
  }

  const handleBrowseBack = () => {
    setBrowseCards(null)
    setBrowseUnitSlug(null)
    setView('unit-select')
  }

  const isSession = view === 'session' && session

  return (
    <AuthGuard>
      <main
        style={{
          padding: '24px',
          maxWidth: isSession ? '100%' : '960px',
          margin: '0 auto',
          minHeight: isSession ? 'calc(100dvh - 64px)' : undefined,
          display: isSession ? 'flex' : undefined,
          flexDirection: isSession ? 'column' : undefined,
        }}
      >
        {view === 'unit-select' && draftChecked && (
          <>
            <BackToSubject subject={subject} />
            <UnitSelector
              subject={subject}
              onStart={handleStart}
              browseMode={browseMode}
              onBrowseToggle={setBrowseMode}
              onBrowse={handleBrowse}
              draft={draft}
              onResume={handleResumeDraft}
            />
          </>
        )}
        {isSession && (
          <DrillSession session={session!} subject={subject} onComplete={handleComplete} onStartFresh={handleSessionStartFresh} />
        )}
        {view === 'browse' && browseCards && browseUnitSlug && (
          <BrowseView
            cards={browseCards}
            unitSlug={browseUnitSlug}
            subject={subject}
            onBack={handleBrowseBack}
          />
        )}
        {view === 'results' && session && (
          <DrillResults
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
