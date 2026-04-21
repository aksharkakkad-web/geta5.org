'use client'

import { useState, use } from 'react'
import VocabUnitSelector from '@/components/vocab/VocabUnitSelector'
import BrowseView from '@/components/drill/BrowseView'
import type { DrillCard } from '@/utils/drillSession'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { BackToSubject } from '@/components/ui/BackToSubject'

type VocabView = 'unit-select' | 'browse'

interface VocabPageProps {
  params: Promise<{ subject: string }>
}

export default function VocabPage({ params }: VocabPageProps) {
  const { subject } = use(params)
  const [view, setView] = useState<VocabView>('unit-select')
  const [browseCards, setBrowseCards] = useState<DrillCard[] | null>(null)
  const [browseUnitSlug, setBrowseUnitSlug] = useState<string | null>(null)

  const handleBrowse = (cards: DrillCard[], unitSlug: string) => {
    setBrowseCards(cards)
    setBrowseUnitSlug(unitSlug)
    setView('browse')
  }

  const handleBack = () => {
    setBrowseCards(null)
    setBrowseUnitSlug(null)
    setView('unit-select')
  }

  return (
    <AuthGuard>
      <main
        style={{
          padding: '24px',
          maxWidth: '960px',
          margin: '0 auto',
        }}
      >
        {view === 'unit-select' && (
          <>
            <BackToSubject subject={subject} />
            <VocabUnitSelector subject={subject} onBrowse={handleBrowse} />
          </>
        )}
        {view === 'browse' && browseCards && browseUnitSlug && (
          <BrowseView
            cards={browseCards}
            unitSlug={browseUnitSlug}
            subject={subject}
            onBack={handleBack}
          />
        )}
      </main>
    </AuthGuard>
  )
}
