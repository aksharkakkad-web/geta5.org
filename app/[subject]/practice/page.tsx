'use client'

import { useState } from 'react'
import { use } from 'react'
import UnitSelector from '@/components/mcq/UnitSelector'
import MCQSession from '@/components/mcq/MCQSession'
import MCQResults from '@/components/mcq/MCQResults'
import type { MCQView, MCQSessionState } from '@/utils/mcqSession'

interface PracticePageProps {
  params: Promise<{ subject: string }>
}

export default function PracticePage({ params }: PracticePageProps) {
  const { subject } = use(params)
  const [view, setView] = useState<MCQView>('unit-select')
  const [session, setSession] = useState<MCQSessionState | null>(null)

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
      {view === 'unit-select' && (
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
