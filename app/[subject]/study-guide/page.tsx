'use client'

import { useState } from 'react'
import { use } from 'react'
import { StudyGuideUnitSelector } from '@/components/study-guide/StudyGuideUnitSelector'
import StudyGuideReader from '@/components/study-guide/StudyGuideReader'
import { fetchStudyGuide, fetchDrillKeyTerms, type StudyGuide } from '@/utils/studyGuide'
import { logEvent } from '@/utils/analytics'
import { AdiIdleNudge } from '@/components/adi/AdiIdleNudge'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { BackToSubject } from '@/components/ui/BackToSubject'

interface StudyGuidePageProps {
  params: Promise<{ subject: string }>
}

type StudyGuideView = 'unit-select' | 'reading'

export default function StudyGuidePage({ params }: StudyGuidePageProps) {
  const { subject } = use(params)
  const [view, setView] = useState<StudyGuideView>('unit-select')
  const [guide, setGuide] = useState<StudyGuide | null>(null)
  const [keyTerms, setKeyTerms] = useState<{ term: string; definition: string }[]>([])
  const [loading, setLoading] = useState(false)

  const handleSelectUnit = async (unitNumber: number) => {
    setLoading(true)
    const [result, terms] = await Promise.all([
      fetchStudyGuide(subject, unitNumber),
      fetchDrillKeyTerms(subject, unitNumber),
    ])
    if (result === null) {
      setLoading(false)
      return
    }
    setGuide(result)
    setKeyTerms(terms)
    setView('reading')
    setLoading(false)
    logEvent({ event_type: 'study_guide_view', subject, unit: `unit-${unitNumber}` })
  }

  const handleBack = () => {
    setGuide(null)
    setKeyTerms([])
    setView('unit-select')
  }

  return (
    <AuthGuard requireAuth>
      <main style={{
        padding: '24px',
        maxWidth: view === 'reading' ? '1100px' : '960px',
        margin: '0 auto',
      }}>
        {view === 'unit-select' && !loading && (
          <>
            <BackToSubject subject={subject} />
            <StudyGuideUnitSelector subject={subject} onSelectUnit={handleSelectUnit} />
          </>
        )}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Loading study guide...</span>
          </div>
        )}
        {view === 'reading' && guide && (
          <>
            <StudyGuideReader guide={guide} subject={subject} onBack={handleBack} keyTerms={keyTerms} />
            <AdiIdleNudge />
          </>
        )}
      </main>
    </AuthGuard>
  )
}
