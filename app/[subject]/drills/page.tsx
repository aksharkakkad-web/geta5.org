'use client'

import { useState } from 'react'
import { use } from 'react'
import UnitSelector from '@/components/drill/UnitSelector'
import DrillSession from '@/components/drill/DrillSession'
import DrillResults from '@/components/drill/DrillResults'
import type { DrillView, SessionState, DrillCard } from '@/utils/drillSession'
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
      {view === 'unit-select' && (
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
