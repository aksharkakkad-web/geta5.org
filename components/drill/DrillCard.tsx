'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Check, X, ChevronRight } from 'lucide-react'
import KatexRenderer from '@/components/KatexRenderer'
import { fuzzyMatch } from '@/utils/fuzzyMatch'
import { parseInlineMath } from '@/utils/parseInlineMath'
import { DrillCard as DrillCardType, MODE_LABELS } from '@/utils/drillSession'
import { playCorrect, playWrong } from '@/utils/sounds'

interface DrillCardProps {
  card: DrillCardType
  onAnswer: (cardId: string, verdict: 'correct' | 'wrong', userInput: string) => void
  onNext: () => void
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

function getCardBorderColor(state: CardState): string {
  switch (state) {
    case 'correct':
      return 'var(--accent-success)'
    case 'wrong':
      return 'var(--accent-danger)'
    default:
      return 'var(--bg-border)'
  }
}

function ConceptMcCard({ card, onAnswer, onNext }: DrillCardProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [verdict, setVerdict] = useState<'correct' | 'wrong' | null>(null)

  const choices = card.choices ?? []

  function handleSelect(idx: number) {
    if (verdict !== null) return
    const choice = choices[idx]
    const v: 'correct' | 'wrong' = choice.is_correct ? 'correct' : 'wrong'
    if (choice.is_correct) playCorrect(); else playWrong()
    setSelectedIdx(idx)
    setVerdict(v)
    onAnswer(card.id, v, choice.text)
  }

  useEffect(() => {
    if (verdict === null) return
    let ready = false
    const id = setTimeout(() => { ready = true }, 0)
    const handler = (e: KeyboardEvent) => { if (e.key === 'Enter' && ready) onNext() }
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

  return (
    <div
      className="mx-auto w-full"
      style={{
        maxWidth: '880px',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        border: `1px solid ${verdict === 'correct' ? 'var(--accent-success)' : verdict === 'wrong' ? 'var(--accent-danger)' : 'var(--bg-border)'}`,
        padding: '52px 64px',
        transition: 'border-color 200ms ease',
      }}
    >
      {/* Mode tag */}
      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px' }}>
        {MODE_LABELS[card.mode]}
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
                {choice.explanation}
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

export default function DrillCard({ card, onAnswer, onNext }: DrillCardProps) {
  const [inputValue, setInputValue] = useState('')
  const [verdict, setVerdict] = useState<'correct' | 'wrong' | null>(null)

  if (card.mode === 'concept_mc') {
    return <ConceptMcCard card={card} onAnswer={onAnswer} onNext={onNext} />
  }

  const cardState: CardState =
    verdict === 'correct'
      ? 'correct'
      : verdict === 'wrong'
        ? 'wrong'
        : inputValue.trim().length > 0
          ? 'typing'
          : 'idle'

  // Reset state when card changes
  useEffect(() => {
    setInputValue('')
    setVerdict(null)
  }, [card.id])

  const handleSubmit = useCallback(() => {
    if (!inputValue.trim() || verdict !== null) return
    const isCorrect = fuzzyMatch(inputValue.trim(), card.answer, card.alternate_answers ?? [])
    const v: 'correct' | 'wrong' = isCorrect ? 'correct' : 'wrong'
    if (isCorrect) playCorrect(); else playWrong()
    setVerdict(v)
    onAnswer(card.id, v, inputValue.trim())
  }, [inputValue, verdict, card, onAnswer])

  // After verdict is shown, next Enter advances — but only after a setTimeout(0)
  // so the same keydown that submitted the answer doesn't immediately fire onNext.
  useEffect(() => {
    if (verdict === null) return
    let ready = false
    const id = setTimeout(() => { ready = true }, 0)
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && ready) onNext()
    }
    window.addEventListener('keydown', handler)
    return () => {
      clearTimeout(id)
      window.removeEventListener('keydown', handler)
    }
  }, [verdict, onNext])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  const cardBorder = getCardBorderColor(cardState)
  const inputBorder = getInputBorderColor(cardState)
  const isSubmitDisabled = inputValue.trim().length === 0 || verdict !== null

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
      {/* Mode tag */}
      <div
        style={{
          color: 'var(--text-muted)',
          fontSize: '0.75rem',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '20px',
        }}
      >
        {MODE_LABELS[card.mode]}
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
            {card.katex_required ? (
              <strong>
                <KatexRenderer formula={card.answer} displayMode={false} />
              </strong>
            ) : (
              <strong style={{ color: 'var(--text-primary)' }}>{card.answer}</strong>
            )}
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
              {card.katex_required ? (
                <strong style={{ color: 'var(--text-primary)' }}>
                  <KatexRenderer formula={card.answer} displayMode={false} />
                </strong>
              ) : (
                <strong style={{ color: 'var(--text-primary)' }}>{card.answer}</strong>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Next card button */}
      {verdict !== null && (
        <button
          onClick={onNext}
          style={{
            width: '100%',
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
      )}
    </div>
  )
}
