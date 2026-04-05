'use client'

import { useCallback, useRef } from 'react'
import { useAdi } from '@/components/adi/AdiProvider'

const LONG_SESSION_INTERVAL = 10
const LONG_SESSION_NUDGES = [
  "I'm here if you need me — tap me!",
  'Want to review what we\'ve covered? — tap me!',
]

export function useAdiNudge() {
  const { showNudge, setQuestion, isOpen } = useAdi()
  const hasNudgedRef = useRef(false)
  const questionCountRef = useRef(0)

  const triggerWrongAnswer = useCallback((opts: {
    unit: string
    questionId: string
    userAnswer: string
    isCorrect: boolean
  }) => {
    setQuestion(opts)

    questionCountRef.current++

    if (!opts.isCorrect && !hasNudgedRef.current) {
      hasNudgedRef.current = true
      showNudge('I can explain this one — tap me!')
      return
    }

    if (
      questionCountRef.current % LONG_SESSION_INTERVAL === 0 &&
      !isOpen &&
      !hasNudgedRef.current
    ) {
      hasNudgedRef.current = true
      const idx = Math.floor(questionCountRef.current / LONG_SESSION_INTERVAL) % LONG_SESSION_NUDGES.length
      showNudge(LONG_SESSION_NUDGES[idx])
    }
  }, [showNudge, setQuestion, isOpen])

  return { triggerWrongAnswer }
}
