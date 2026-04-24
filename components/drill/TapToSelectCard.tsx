'use client'

import React, { useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import { DrillCard as DrillCardType, MODE_LABELS } from '@/utils/drillSession'
import { parseInlineMath } from '@/utils/parseInlineMath'
import { playCorrect, playWrong } from '@/utils/sounds'
import { useAdiNudge } from '@/hooks/useAdiNudge'

interface TapToSelectCardProps {
  card: DrillCardType
  sessionCards: DrillCardType[]
  onAnswer: (cardId: string, verdict: 'correct' | 'wrong', userInput: string) => void
  onNext: () => void
  isRetry?: boolean
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const VOCAB_MODES = new Set(['definition_to_term', 'significance_to_person', 'significance_to_event', 'significance_to_case'])

function generateOptions(card: DrillCardType, allCards: DrillCardType[]) {
  const correctAnswer = card.answer?.trim() ?? ''
  const seen = new Set<string>([correctAnswer.toLowerCase()])
  const distractors: string[] = []

  const pool = shuffleArray([
    ...allCards.filter(c => c.id !== card.id && c.mode === card.mode && c.answer?.trim()),
    ...allCards.filter(c => c.id !== card.id && c.mode !== card.mode && VOCAB_MODES.has(c.mode) && c.answer?.trim()),
  ])

  for (const c of pool) {
    if (distractors.length >= 3) break
    const a = c.answer!.trim()
    if (!seen.has(a.toLowerCase())) {
      seen.add(a.toLowerCase())
      distractors.push(a)
    }
  }

  while (distractors.length < 3) distractors.push('—')

  return shuffleArray([
    { text: correctAnswer, isCorrect: true },
    ...distractors.map(t => ({ text: t, isCorrect: false })),
  ])
}

function RetryBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '2px 8px', borderRadius: '999px',
      background: 'color-mix(in srgb, var(--accent-warning) 15%, transparent)',
      border: '1px solid color-mix(in srgb, var(--accent-warning) 40%, transparent)',
      color: 'var(--accent-warning)', fontSize: '0.6875rem',
      fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
    }}>
      Try again
    </span>
  )
}

const LABELS = ['A', 'B', 'C', 'D']

export default function TapToSelectCard({ card, sessionCards, onAnswer, onNext, isRetry }: TapToSelectCardProps) {
  const [options] = useState(() => generateOptions(card, sessionCards))
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [verdict, setVerdict] = useState<'correct' | 'wrong' | null>(null)
  const { triggerWrongAnswer } = useAdiNudge(card)

  useEffect(() => {
    if (verdict === null) return
    let ready = false
    const id = setTimeout(() => { ready = true }, 0)
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && ready && !(document.activeElement?.classList.contains('adi-input'))) onNext()
    }
    window.addEventListener('keydown', handler)
    return () => { clearTimeout(id); window.removeEventListener('keydown', handler) }
  }, [verdict, onNext])

  function handleSelect(idx: number) {
    if (verdict !== null) return
    const option = options[idx]
    const v: 'correct' | 'wrong' = option.isCorrect ? 'correct' : 'wrong'
    if (option.isCorrect) playCorrect(); else playWrong()
    setSelectedIdx(idx)
    setVerdict(v)
    onAnswer(card.id, v, option.text)
    triggerWrongAnswer({ unit: card.unit, questionId: card.id, userAnswer: option.text, isCorrect: v === 'correct' })
  }

  function choiceStyle(idx: number): React.CSSProperties {
    if (verdict === null) return { background: 'var(--bg-secondary)', border: '1px solid var(--bg-border)', cursor: 'pointer' }
    const option = options[idx]
    if (option.isCorrect) return {
      background: 'color-mix(in srgb, var(--accent-success) 10%, transparent)',
      border: '1px solid color-mix(in srgb, var(--accent-success) 30%, transparent)',
      cursor: 'default',
    }
    if (idx === selectedIdx) return {
      background: 'color-mix(in srgb, var(--accent-danger) 10%, transparent)',
      border: '1px solid color-mix(in srgb, var(--accent-danger) 30%, transparent)',
      cursor: 'default',
    }
    return { background: 'var(--bg-secondary)', border: '1px solid var(--bg-border)', opacity: 0.45, cursor: 'default' }
  }

  const cardBorder = verdict === 'correct' ? 'var(--accent-success)' : verdict === 'wrong' ? 'var(--accent-danger)' : isRetry ? 'var(--accent-warning)' : 'var(--bg-border)'
  const feedbackAnim = verdict === 'correct' ? 'correctPulse 0.6s ease' : verdict === 'wrong' ? 'shakeX 0.4s ease' : 'none'

  return (
    <div className="mx-auto w-full" style={{ maxWidth: '880px', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: `1px solid ${cardBorder}`, padding: '52px 64px', transition: 'border-color 200ms ease', animation: feedbackAnim }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {MODE_LABELS[card.mode]}
        </span>
        {isRetry && <RetryBadge />}
      </div>

      <div style={{ fontSize: '1.5rem', lineHeight: '1.65', color: 'var(--text-primary)', marginBottom: '32px', fontWeight: 500 }}>
        {parseInlineMath(card.prompt)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: verdict !== null ? '24px' : '0' }}>
        {options.map((option, idx) => (
          <button key={idx} onClick={() => handleSelect(idx)} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', width: '100%', textAlign: 'left', padding: '14px 16px', borderRadius: 'var(--radius-md)', transition: 'opacity 150ms ease, border-color 150ms ease', fontFamily: 'inherit', ...choiceStyle(idx) }}>
            <span style={{ flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%', background: 'var(--bg-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {LABELS[idx]}
            </span>
            <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
              {parseInlineMath(option.text)}
            </span>
          </button>
        ))}
      </div>

      {verdict !== null && (
        <button onClick={onNext} style={{ width: '100%', padding: '13px 20px', borderRadius: 'var(--radius-md)', border: 'none', background: verdict === 'correct' ? 'var(--accent-success)' : 'var(--accent-danger)', color: 'white', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'inherit' }}>
          Next card <ChevronRight size={16} />
        </button>
      )}
    </div>
  )
}
