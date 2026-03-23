'use client'
import { useEffect } from 'react'
import { logEvent } from '@/utils/analytics'

interface SubjectAnalyticsProps {
  subject: string
}

export function SubjectAnalytics({ subject }: SubjectAnalyticsProps) {
  useEffect(() => {
    void logEvent({ event_type: 'page_view', subject })
  }, [subject])

  return null
}
