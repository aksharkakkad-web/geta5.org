'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Check, X, ChevronRight } from 'lucide-react'
import KatexRenderer from '@/components/KatexRenderer'
import { fuzzyMatch } from '@/utils/fuzzyMatch'
import { parseInlineMath } from '@/utils/parseInlineMath'
import { DrillCard as DrillCardType, MODE_LABELS } from '@/utils/drillSession'
import { playCorrect, playWrong } from '@/utils/sounds'
import { useAdiNudge } from '@/hooks/useAdiNudge'
import TapToSelectCard from '@/components/drill/TapToSelectCard'
import type { CardPresentStyle } from '@/utils/drillStyles'

interface DrillCardProps {
  card: DrillCardType
  onAnswer: (cardId: string, verdict: 'correct' | 'wrong', userInput: string) => void
  onNext: () => void
  isRetry?: boolean
  presentStyle?: CardPresentStyle
  sessionCards?: DrillCardType[]
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

type CardState = 'idle' | 'typing' | 'correct' | 'wrong'

function getInputBorderColor(state: CardState): string {
  switch (state) {
    case 'typing':
      return 'var(--accent)'
    case 'correct':
      return 'var(--accent-success)'
    case 'wrong':
      return 'var(--accent-danger)'
    default:
      return 'var(--bg-border)'
  }
}

function getCardBorderColor(state: CardState, isRetry?: boolean): string {
  switch (state) {
    case 'correct':
      return 'var(--accent-success)'
    case 'wrong':
      return 'var(--accent-danger)'
    default:
      return isRetry ? 'var(--accent-warning)' : 'var(--bg-border)'
  }
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function ConceptMcCard({ card, onAnswer, onNext, isRetry }: DrillCardProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [verdict, setVerdict] = useState<'correct' | 'wrong' | null>(null)
  const [shuffledChoices, setShuffledChoices] = useState<typeof card.choices>(() =>
    shuffleArray(card.choices ?? [])
  )
  const { triggerWrongAnswer } = useAdiNudge(card)

  useEffect(() => {
    setSelectedIdx(null)
    setVerdict(null)
    setShuffledChoices(shuffleArray(card.choices ?? []))
  }, [card.id])

  const choices = shuffledChoices ?? []

  function handleSelect(idx: number) {
    if (verdict !== null) return
    const choice = choices[idx]
    const v: 'correct' | 'wrong' = choice.is_correct ? 'correct' : 'wrong'
    if (choice.is_correct) playCorrect(); else playWrong()
    setSelectedIdx(idx)
    setVerdict(v)
    onAnswer(card.id, v, choice.text)
    triggerWrongAnswer({ unit: card.unit, questionId: card.id, userAnswer: choice.text, isCorrect: v === 'correct' })
  }

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

  const LABELS = ['A', 'B', 'C', 'D']

  function choiceStyle(idx: number): React.CSSProperties {
    if (verdict === null) {
      return { background: 'var(--bg-secondary)', border: '1px solid var(--bg-border)', cursor: 'pointer' }
    }
    const choice = choices[idx]
    if (choice.is_correct) {
      return {
        background: 'color-mix(in srgb, var(--accent-success) 10%, transparent)',
        border: '1px solid color-mix(in srgb, var(--accent-success) 30%, transparent)',
        cursor: 'default',
      }
    }
    if (idx === selectedIdx) {
      return {
        background: 'color-mix(in srgb, var(--accent-danger) 10%, transparent)',
        border: '1px solid color-mix(in srgb, var(--accent-danger) 30%, transparent)',
        cursor: 'default',
      }
    }
    return { background: 'var(--bg-secondary)', border: '1px solid var(--bg-border)', opacity: 0.45, cursor: 'default' }
  }

  const mcFeedbackAnimation = verdict === 'correct'
    ? 'correctPulse 0.6s ease'
    : verdict === 'wrong'
    ? 'shakeX 0.4s ease'
    : 'none'

  return (
    <div
      className="mx-auto w-full"
      style={{
        maxWidth: '880px',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        border: `1px solid ${verdict === 'correct' ? 'var(--accent-success)' : verdict === 'wrong' ? 'var(--accent-danger)' : isRetry ? 'var(--accent-warning)' : 'var(--bg-border)'}`,
        padding: '52px 64px',
        transition: 'border-color 200ms ease',
        animation: mcFeedbackAnimation,
      }}
    >
      {/* Mode tag + retry badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {MODE_LABELS[card.mode]}
        </span>
        {isRetry && <RetryBadge />}
      </div>

      {/* Prompt */}
      <div style={{ fontSize: '1.5rem', lineHeight: '1.65', color: 'var(--text-primary)', marginBottom: '32px', fontWeight: 500 }}>
        {parseInlineMath(card.prompt)}
      </div>

      {/* Choices */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: verdict !== null ? '24px' : '0' }}>
        {choices.map((choice, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              width: '100%',
              textAlign: 'left',
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              transition: 'opacity 150ms ease, border-color 150ms ease',
              ...choiceStyle(idx),
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span style={{
                flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%',
                background: 'var(--bg-border)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)',
              }}>
                {LABELS[idx]}
              </span>
              <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                {parseInlineMath(choice.text)}
              </span>
            </div>
            {verdict !== null && (
              <div style={{
                marginLeft: '32px', fontSize: '0.8125rem',
                color: choice.is_correct ? 'var(--accent-success)' : 'var(--text-muted)',
                lineHeight: '1.5',
              }}>
                {parseInlineMath(choice.explanation)}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Next card button */}
      {verdict !== null && (
        <button
          onClick={onNext}
          style={{
            width: '100%', padding: '13px 20px', borderRadius: 'var(--radius-md)', border: 'none',
            background: verdict === 'correct' ? 'var(--accent-success)' : 'var(--accent-danger)',
            color: 'white', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}
        >
          Next card <ChevronRight size={16} />
        </button>
      )}
    </div>
  )
}

function FormulaCard({ card, onAnswer, onNext, isRetry }: DrillCardProps) {
  const [revealed, setRevealed] = useState(false)
  const [verdict, setVerdict] = useState<'correct' | 'wrong' | null>(null)
  const { triggerWrongAnswer } = useAdiNudge(card)

  useEffect(() => {
    setRevealed(false)
    setVerdict(null)
  }, [card.id])

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

  const cardBorder =
    verdict === 'correct' ? 'var(--accent-success)'
    : verdict === 'wrong' ? 'var(--accent-danger)'
    : isRetry ? 'var(--accent-warning)'
    : 'var(--bg-border)'

  function handleKnew() {
    playCorrect()
    setVerdict('correct')
    onAnswer(card.id, 'correct', '')
    triggerWrongAnswer({ unit: card.unit, questionId: card.id, userAnswer: '', isCorrect: true })
  }

  function handleDidntKnow() {
    playWrong()
    setVerdict('wrong')
    onAnswer(card.id, 'wrong', '')
    triggerWrongAnswer({ unit: card.unit, questionId: card.id, userAnswer: '', isCorrect: false })
  }

  return (
    <div
      className="mx-auto w-full"
      style={{
        maxWidth: '880px',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        border: `1px solid ${cardBorder}`,
        padding: '52px 64px',
        transition: 'border-color 200ms ease',
      }}
    >
      {/* Mode tag + retry badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {MODE_LABELS[card.mode]}
        </span>
        {isRetry && <RetryBadge />}
      </div>

      {/* Prompt */}
      <div style={{ fontSize: '1.5rem', lineHeight: '1.65', color: 'var(--text-primary)', marginBottom: '32px', fontWeight: 500 }}>
        {parseInlineMath(card.prompt)}
      </div>

      {/* Reveal area */}
      {!revealed && verdict === null && (
        <button
          onClick={() => setRevealed(true)}
          autoFocus
          style={{
            width: '100%', padding: '13px 20px', borderRadius: 'var(--radius-md)', border: 'none',
            background: 'var(--accent)', color: 'white',
            fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer',
          }}
        >
          Show Formula
        </button>
      )}

      {/* Formula + self-grade buttons */}
      {revealed && verdict === null && (
        <>
          <div style={{
            padding: '20px 24px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--bg-border)',
            marginBottom: '20px',
            textAlign: 'center',
            fontSize: '1.25rem',
          }}>
            <KatexRenderer formula={card.answer ?? ''} displayMode={true} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleDidntKnow}
              style={{
                flex: 1, padding: '13px 20px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--bg-border)', background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)', fontSize: '0.9375rem', fontWeight: 500, cursor: 'pointer',
              }}
            >
              I didn&apos;t know this
            </button>
            <button
              onClick={handleKnew}
              style={{
                flex: 1, padding: '13px 20px', borderRadius: 'var(--radius-md)',
                border: 'none', background: 'var(--accent-success)',
                color: 'white', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              I knew this
            </button>
          </div>
        </>
      )}

      {/* Post-verdict feedback */}
      {verdict === 'correct' && (
        <>
          <div style={{
            borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '16px',
            background: 'color-mix(in srgb, var(--accent-success) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--accent-success) 30%, transparent)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-success)', fontWeight: 600, marginBottom: '12px' }}>
              <Check size={18} /><span>Nice work!</span>
            </div>
            <div style={{ textAlign: 'center', fontSize: '1.1rem' }}>
              <KatexRenderer formula={card.answer ?? ''} displayMode={true} />
            </div>
          </div>
          <button
            onClick={onNext}
            style={{
              width: '100%', padding: '13px 20px', borderRadius: 'var(--radius-md)', border: 'none',
              background: 'var(--accent-success)', color: 'white',
              fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}
          >
            Next card <ChevronRight size={16} />
          </button>
        </>
      )}

      {verdict === 'wrong' && (
        <>
          <div style={{
            borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '16px',
            background: 'color-mix(in srgb, var(--accent-danger) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--accent-danger) 30%, transparent)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-danger)', fontWeight: 600, marginBottom: '12px' }}>
              <X size={18} /><span>Keep practicing</span>
            </div>
            <div style={{ textAlign: 'center', fontSize: '1.1rem' }}>
              <KatexRenderer formula={card.answer ?? ''} displayMode={true} />
            </div>
          </div>
          <button
            onClick={onNext}
            style={{
              width: '100%', padding: '13px 20px', borderRadius: 'var(--radius-md)', border: 'none',
              background: 'var(--accent-danger)', color: 'white',
              fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}
          >
            Next card <ChevronRight size={16} />
          </button>
        </>
      )}
    </div>
  )
}

function DefaultCard({ card, onAnswer, onNext, isRetry }: DrillCardProps) {
  const [inputValue, setInputValue] = useState('')
  const [verdict, setVerdict] = useState<'correct' | 'wrong' | null>(null)
  const { triggerWrongAnswer } = useAdiNudge(card)

  // Reset state when card changes
  useEffect(() => {
    setInputValue('')
    setVerdict(null)
  }, [card.id])

  const handleSubmit = useCallback(() => {
    if (!inputValue.trim() || verdict !== null) return
    const input = inputValue.trim()

    // Strip LaTeX backslashes, grouping symbols, and all spaces — normalises
    // plain-text input (e.g. "log_b(M)-log_b(N)") against LaTeX answers
    const norm = (s: string) =>
      s.replace(/\\/g, '')
       .replace(/[(){}[\]]/g, '')
       .replace(/\s+/g, '')
       .toLowerCase()

    let isCorrect: boolean

    if (card.mode === 'name_to_formula') {
      const answer = card.answer ?? ''
      const eqIdx = answer.indexOf('=')
      if (eqIdx !== -1) {
        // Take everything after the first '=' as the right-hand side
        const rhs = answer.slice(eqIdx + 1).trim()
        // Correct if input matches the RHS or the full answer (both normalised)
        isCorrect = norm(input) === norm(rhs) || norm(input) === norm(answer)
      } else {
        isCorrect = norm(input) === norm(answer)
      }
    } else {
      // All other typed-recall modes: fuzzy match with built-in normalisation
      // (lowercase, trim, collapse spaces, Levenshtein tolerance)
      isCorrect = fuzzyMatch(input, card.answer ?? '', [])
    }
    const v: 'correct' | 'wrong' = isCorrect ? 'correct' : 'wrong'
    if (isCorrect) playCorrect(); else playWrong()
    setVerdict(v)
    onAnswer(card.id, v, inputValue.trim())
    triggerWrongAnswer({ unit: card.unit, questionId: card.id, userAnswer: inputValue.trim(), isCorrect: v === 'correct' })
  }, [inputValue, verdict, card, onAnswer, triggerWrongAnswer])

  // After verdict is shown, next Enter advances — but only after a setTimeout(0)
  // so the same keydown that submitted the answer doesn't immediately fire onNext.
  useEffect(() => {
    if (verdict === null) return
    let ready = false
    const id = setTimeout(() => { ready = true }, 0)
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && ready && !(document.activeElement?.classList.contains('adi-input'))) onNext()
    }
    window.addEventListener('keydown', handler)
    return () => {
      clearTimeout(id)
      window.removeEventListener('keydown', handler)
    }
  }, [verdict, onNext])

  const cardState: CardState =
    verdict === 'correct'
      ? 'correct'
      : verdict === 'wrong'
        ? 'wrong'
        : inputValue.trim().length > 0
          ? 'typing'
          : 'idle'

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  const cardBorder = getCardBorderColor(cardState, isRetry)
  const inputBorder = getInputBorderColor(cardState)
  const isSubmitDisabled = inputValue.trim().length === 0 || verdict !== null

  const feedbackAnimation = verdict === 'correct'
    ? 'correctPulse 0.6s ease'
    : verdict === 'wrong'
    ? 'shakeX 0.4s ease'
    : 'none'

  return (
    <div
      className="mx-auto w-full"
      style={{
        maxWidth: '880px',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        border: `1px solid ${cardBorder}`,
        padding: '52px 64px',
        transition: 'border-color 200ms ease',
        animation: feedbackAnimation,
      }}
    >
      {/* Mode tag + retry badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {MODE_LABELS[card.mode]}
        </span>
        {isRetry && <RetryBadge />}
      </div>

      {/* Prompt */}
      <div
        style={{
          fontSize: '1.5rem',
          lineHeight: '1.65',
          color: 'var(--text-primary)',
          marginBottom: '40px',
          fontWeight: 500,
        }}
      >
        {parseInlineMath(card.prompt)}
      </div>

      {/* Input */}
      {verdict === null && (
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer..."
            autoFocus
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${inputBorder}`,
              borderRadius: 0,
              padding: '12px 0',
              fontSize: '1.25rem',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'border-color 150ms ease',
            }}
          />
        </div>
      )}

      {/* Check Answer button */}
      {verdict === null && (
        <button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          style={{
            width: '100%',
            padding: '13px 20px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: isSubmitDisabled ? 'var(--bg-border)' : 'var(--accent)',
            color: isSubmitDisabled ? 'var(--text-muted)' : 'white',
            fontSize: '0.9375rem',
            fontWeight: 600,
            cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
            opacity: isSubmitDisabled ? 0.5 : 1,
            transition: 'background 150ms ease, opacity 150ms ease, transform 150ms ease',
            marginBottom: '0',
          }}
          onMouseEnter={e => {
            if (!isSubmitDisabled) {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover)'
              ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
            }
          }}
          onMouseLeave={e => {
            if (!isSubmitDisabled) {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)'
              ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
            }
          }}
        >
          Check Answer
        </button>
      )}

      {/* Correct feedback */}
      {verdict === 'correct' && (
        <div
          style={{
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '16px',
            background: 'color-mix(in srgb, var(--accent-success) 10%, transparent)',
            border: `1px solid color-mix(in srgb, var(--accent-success) 30%, transparent)`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--accent-success)',
              fontWeight: 600,
              marginBottom: '8px',
            }}
          >
            <Check size={18} />
            <span>Correct!</span>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Answer: </span>
            <strong style={{ color: 'var(--text-primary)' }}>{parseInlineMath(card.answer ?? '')}</strong>
          </div>
        </div>
      )}

      {/* Wrong feedback */}
      {verdict === 'wrong' && (
        <div
          style={{
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '16px',
            background: 'color-mix(in srgb, var(--accent-danger) 10%, transparent)',
            border: `1px solid color-mix(in srgb, var(--accent-danger) 30%, transparent)`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--accent-danger)',
              fontWeight: 600,
              marginBottom: '8px',
            }}
          >
            <X size={18} />
            <span>Not quite</span>
          </div>
          <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ color: 'var(--text-muted)' }}>
              You wrote:{' '}
              <span style={{ color: 'var(--accent-danger)' }}>{inputValue}</span>
            </span>
            <span style={{ color: 'var(--text-muted)' }}>
              Correct:{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{parseInlineMath(card.answer ?? '')}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Bottom actions row */}
      {verdict !== null && (
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* I knew this — override wrong to correct */}
          {verdict === 'wrong' && (
            <button
              onClick={() => {
                playCorrect()
                setVerdict('correct')
                onAnswer(card.id, 'correct', inputValue.trim())
              }}
              style={{
                flex: 1,
                padding: '11px 20px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--bg-border)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              I knew this
            </button>
          )}

          {/* Next card */}
          <button
            onClick={onNext}
            style={{
              flex: verdict === 'wrong' ? 1 : undefined,
              width: verdict === 'correct' ? '100%' : undefined,
              padding: '13px 20px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: verdict === 'correct' ? 'var(--accent-success)' : 'var(--accent-danger)',
              color: 'white',
              fontSize: '0.9375rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'opacity 150ms ease, transform 150ms ease',
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLButtonElement).style.opacity = '0.85'
              ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLButtonElement).style.opacity = '1'
              ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
            }}
          >
            Next card
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

export default function DrillCard({ card, onAnswer, onNext, isRetry, presentStyle, sessionCards }: DrillCardProps) {
  if (card.mode === 'concept_mc') return <ConceptMcCard card={card} onAnswer={onAnswer} onNext={onNext} isRetry={isRetry} />
  if (card.mode === 'name_to_formula') return <FormulaCard card={card} onAnswer={onAnswer} onNext={onNext} isRetry={isRetry} />
  if (presentStyle === 'tap' && sessionCards && sessionCards.length >= 4) {
    return <TapToSelectCard card={card} sessionCards={sessionCards} onAnswer={onAnswer} onNext={onNext} isRetry={isRetry} />
  }
  return <DefaultCard card={card} onAnswer={onAnswer} onNext={onNext} isRetry={isRetry} />
}
