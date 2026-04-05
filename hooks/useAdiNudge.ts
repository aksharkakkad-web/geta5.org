'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useAdi } from '@/components/adi/AdiProvider'

const LONG_SESSION_INTERVAL = 10
const LONG_SESSION_NUDGES = [
  "I'm here if you need me — tap me!",
  'Want to review what we\'ve covered? — tap me!',
]

/**
 * Hook for components that display questions/cards.
 *
 * @param currentCard — pass the card/question currently being displayed.
 *   Adi's context syncs immediately so the user can ask about it before answering.
 */
export function useAdiNudge(currentCard?: { id: string; unit: string } | null) {
  const { showNudge, setQuestion, isOpen } = useAdi()
  const hasNudgedRef = useRef(false)
  const questionCountRef = useRef(0)

  // Sync context whenever the displayed card changes (before any answer)
  useEffect(() => {
    if (currentCard) {
      setQuestion({ questionId: currentCard.id, unit: currentCard.unit })
    }
  }, [currentCard?.id, currentCard?.unit, setQuestion])

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
