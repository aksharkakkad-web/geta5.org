'use client'

import { useEffect } from 'react'
import { useAdi } from '@/components/adi/AdiProvider'

interface SessionResult {
  subject: string
  unit: string
  totalAnswered: number
  correct: number
  wrong?: number
  accuracy: number // 0-1
  weakTopics?: string[] // optional: card IDs or topic names that were wrong
  mode: 'drill' | 'mcq' | 'practice-test'
}

export function useAdiResults(result: SessionResult) {
  const { showNudge, sendMessage, messages, isOpen } = useAdi()

  useEffect(() => {
    // Nudge after 2s so results page has rendered
    const timer = setTimeout(() => {
      showNudge('I reviewed your session — tap me for a breakdown!')
    }, 2000)
    return () => clearTimeout(timer)
  }, [showNudge])

  // When Adi opens and has no messages yet, auto-send the analysis
  useEffect(() => {
    if (!isOpen || messages.length > 0) return

    const accuracy = Math.round(result.accuracy * 100)
    const prompt = buildResultsPrompt(result, accuracy)

    // Small delay so panel animation completes first
    const timer = setTimeout(() => {
      sendMessage(prompt)
    }, 300)
    return () => clearTimeout(timer)
  }, [isOpen, messages.length, result, sendMessage])
}

function buildResultsPrompt(result: SessionResult, accuracy: number): string {
  const sessionType =
    result.mode === 'drill'
      ? 'drill session'
      : result.mode === 'mcq'
        ? 'practice session'
        : 'practice test'
  const unitLabel = result.unit.replace('unit-', 'Unit ')

  let prompt = `I just finished a ${sessionType} on ${unitLabel}. Here's how I did: ${result.correct}/${result.totalAnswered} correct (${accuracy}%). `

  if (accuracy >= 80) {
    prompt += 'I did pretty well. What should I focus on to get even stronger for the AP exam?'
  } else if (accuracy >= 50) {
    prompt +=
      'I got some wrong. Can you identify the key concepts I need to review and give me the most important things to know for the AP exam?'
  } else {
    prompt +=
      'I struggled on this one. Can you walk me through the most critical concepts for this unit and what the AP exam focuses on most?'
  }

  return prompt
}
