'use client'

import React, { useState, useEffect } from 'react'
import { Check, ChevronRight } from 'lucide-react'
import { DrillCard as DrillCardType } from '@/utils/drillSession'
import { parseInlineMath } from '@/utils/parseInlineMath'
import { playCorrect, playWrong } from '@/utils/sounds'

interface MatchingCardProps {
  cards: DrillCardType[]
  onComplete: (verdicts: Record<string, 'correct' | 'wrong'>) => void
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export default function MatchingCard({ cards, onComplete }: MatchingCardProps) {
  const [terms] = useState(() => shuffleArray(cards))
  const [defs]  = useState(() => shuffleArray(cards))

  const [selectedTermId, setSelectedTermId] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [wrongAttempts, setWrongAttempts] = useState<Set<string>>(new Set())
  const [flashWrong, setFlashWrong] = useState<Set<string>>(new Set())
  const [allDone, setAllDone] = useState(false)

  // keyboard Enter → continue when done
  useEffect(() => {
    if (!allDone) return
    let ready = false
    const id = setTimeout(() => { ready = true }, 0)
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && ready && !(document.activeElement?.classList.contains('adi-input'))) handleContinue()
    }
    window.addEventListener('keydown', handler)
    return () => { clearTimeout(id); window.removeEventListener('keydown', handler) }
  }, [allDone]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleTermClick(cardId: string) {
    if (matched.has(cardId) || allDone) return
    setSelectedTermId(prev => prev === cardId ? null : cardId)
  }

  function handleDefClick(cardId: string) {
    if (matched.has(cardId) || allDone || selectedTermId === null) return

    if (selectedTermId === cardId) {
      playCorrect()
      setMatched(prev => {
        const next = new Set(prev)
        next.add(cardId)
        if (next.size === cards.length) setAllDone(true)
        return next
      })
      setSelectedTermId(null)
    } else {
      playWrong()
      const termId = selectedTermId
      setWrongAttempts(prev => new Set([...prev, termId]))
      setFlashWrong(new Set([termId, cardId]))
      setTimeout(() => setFlashWrong(new Set()), 500)
      setSelectedTermId(null)
    }
  }

  function handleContinue() {
    const verdicts: Record<string, 'correct' | 'wrong'> = {}
    for (const c of cards) {
      verdicts[c.id] = wrongAttempts.has(c.id) ? 'wrong' : 'correct'
    }
    onComplete(verdicts)
  }

  const borderColor = allDone ? 'var(--accent-success)' : 'var(--bg-border)'

  return (
    <div className="mx-auto w-full" style={{ maxWidth: '880px', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: `1px solid ${borderColor}`, padding: '52px 64px', transition: 'border-color 300ms ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Matching Round
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '8px' }}>
            Connect each term to its definition
          </div>
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', flexShrink: 0, paddingTop: '4px' }}>
          <span style={{ color: 'var(--accent-success)', fontWeight: 600 }}>{matched.size}</span> / {cards.length} matched
        </div>
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Terms */}
        <div>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Terms
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {terms.map(card => {
              const isMatched  = matched.has(card.id)
              const isSelected = selectedTermId === card.id
              const isFlash    = flashWrong.has(card.id)
              return (
                <button
                  key={card.id}
                  onClick={() => handleTermClick(card.id)}
                  disabled={isMatched}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${isMatched ? 'color-mix(in srgb, var(--accent-success) 30%, transparent)' : isFlash ? 'var(--accent-danger)' : isSelected ? 'var(--accent)' : 'var(--bg-border)'}`,
                    background: isMatched ? 'color-mix(in srgb, var(--accent-success) 8%, transparent)' : isFlash ? 'color-mix(in srgb, var(--accent-danger) 10%, transparent)' : isSelected ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'var(--bg-secondary)',
                    color: isMatched ? 'var(--text-muted)' : 'var(--text-primary)',
                    fontSize: '0.9375rem', fontWeight: 600, textAlign: 'left',
                    cursor: isMatched ? 'default' : 'pointer',
                    transition: 'border-color 150ms ease, background 150ms ease',
                    fontFamily: 'inherit',
                    opacity: isMatched ? 0.6 : 1,
                    animation: isFlash ? 'shakeX 0.4s ease' : 'none',
                    boxShadow: isSelected ? '0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent)' : 'none',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}
                >
                  {isMatched && <Check size={14} style={{ color: 'var(--accent-success)', flexShrink: 0 }} />}
                  {parseInlineMath(card.answer ?? '')}
                </button>
              )
            })}
          </div>
        </div>

        {/* Definitions */}
        <div>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Definitions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {defs.map(card => {
              const isMatched     = matched.has(card.id)
              const isFlash       = flashWrong.has(card.id)
              const termSelected  = selectedTermId !== null
              return (
                <button
                  key={card.id}
                  onClick={() => handleDefClick(card.id)}
                  disabled={isMatched || !termSelected}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${isMatched ? 'color-mix(in srgb, var(--accent-success) 30%, transparent)' : isFlash ? 'var(--accent-danger)' : 'var(--bg-border)'}`,
                    background: isMatched ? 'color-mix(in srgb, var(--accent-success) 8%, transparent)' : isFlash ? 'color-mix(in srgb, var(--accent-danger) 10%, transparent)' : termSelected ? 'var(--bg-card)' : 'var(--bg-secondary)',
                    color: isMatched ? 'var(--text-muted)' : 'var(--text-secondary)',
                    fontSize: '0.875rem', textAlign: 'left', lineHeight: '1.5',
                    cursor: isMatched || !termSelected ? 'default' : 'pointer',
                    transition: 'border-color 150ms ease, background 150ms ease',
                    fontFamily: 'inherit',
                    opacity: isMatched ? 0.6 : (!termSelected ? 0.5 : 1),
                    animation: isFlash ? 'shakeX 0.4s ease' : 'none',
                    display: 'flex', alignItems: 'flex-start', gap: '8px',
                  }}
                >
                  {isMatched && <Check size={14} style={{ color: 'var(--accent-success)', flexShrink: 0, marginTop: '2px' }} />}
                  {parseInlineMath(card.prompt)}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Hint text */}
      {!allDone && (
        <div style={{ textAlign: 'center', fontSize: '0.8125rem', color: selectedTermId ? 'var(--accent)' : 'var(--text-muted)', transition: 'color 150ms ease', marginBottom: '0' }}>
          {selectedTermId ? 'Now click the matching definition →' : 'Click a term to start matching'}
        </div>
      )}

      {/* All done — success + continue */}
      {allDone && (
        <>
          <div style={{ borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: '16px', background: 'color-mix(in srgb, var(--accent-success) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-success) 30%, transparent)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Check size={16} style={{ color: 'var(--accent-success)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--accent-success)' }}>
              All matched!
            </span>
            {wrongAttempts.size > 0 && (
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                ({wrongAttempts.size} with wrong attempt{wrongAttempts.size > 1 ? 's' : ''} — will be retried)
              </span>
            )}
          </div>
          <button
            onClick={handleContinue}
            style={{ width: '100%', padding: '13px 20px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--accent-success)', color: 'white', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'inherit' }}
          >
            Continue <ChevronRight size={16} />
          </button>
        </>
      )}
    </div>
  )
}
