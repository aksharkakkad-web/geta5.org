'use client'

import { useState } from 'react'
import { use } from 'react'
import { StudyGuideUnitSelector } from '@/components/study-guide/StudyGuideUnitSelector'
import StudyGuideReader from '@/components/study-guide/StudyGuideReader'
import { fetchStudyGuide, type StudyGuide } from '@/utils/studyGuide'
import { logEvent } from '@/utils/analytics'

interface StudyGuidePageProps {
  params: Promise<{ subject: string }>
}

type StudyGuideView = 'unit-select' | 'reading'

export default function StudyGuidePage({ params }: StudyGuidePageProps) {
  const { subject } = use(params)
  const [view, setView] = useState<StudyGuideView>('unit-select')
  const [guide, setGuide] = useState<StudyGuide | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSelectUnit = async (unitNumber: number) => {
    setLoading(true)
    const result = await fetchStudyGuide(subject, unitNumber)
    if (result === null) {
      setLoading(false)
      return
    }
    setGuide(result)
    setView('reading')
    setLoading(false)
    // Fire-and-forget analytics (Critical Rule #6: never block UI on Supabase)
    logEvent({ event_type: 'study_guide_view', subject, unit: `unit-${unitNumber}` })
  }

  const handleBack = () => {
    setGuide(null)
    setView('unit-select')
  }

  return (
    <main style={{
      padding: '24px',
      maxWidth: view === 'reading' ? '1100px' : '960px',
      margin: '0 auto',
    }}>
      {view === 'unit-select' && !loading && (
        <StudyGuideUnitSelector subject={subject} onSelectUnit={handleSelectUnit} />
      )}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Loading study guide...</span>
        </div>
      )}
      {view === 'reading' && guide && (
        <StudyGuideReader guide={guide} subject={subject} onBack={handleBack} />
      )}
    </main>
  )
}
