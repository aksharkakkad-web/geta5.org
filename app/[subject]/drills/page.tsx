'use client'

import { useState, useEffect, use } from 'react'
import UnitSelector from '@/components/drill/UnitSelector'
import DrillSession from '@/components/drill/DrillSession'
import DrillResults from '@/components/drill/DrillResults'
import { loadDrillDraft, clearDrillDraft } from '@/utils/drillSession'
import type { DrillView, SessionState, DrillCard, DrillDraft } from '@/utils/drillSession'
import BrowseView from '@/components/drill/BrowseView'

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
            {Object.keys(draft.answers).length} of {draft.cards.length} cards answered
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
        <UnitSelector
          subject={subject}
          onStart={handleStart}
          browseMode={browseMode}
          onBrowseToggle={setBrowseMode}
          onBrowse={handleBrowse}
        />
      )}
      {isSession && (
        <DrillSession session={session!} subject={subject} onComplete={handleComplete} />
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
  )
}
