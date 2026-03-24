'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Check, X, ChevronRight } from 'lucide-react'
import KatexRenderer from '@/components/KatexRenderer'
import { fuzzyMatch } from '@/utils/fuzzyMatch'
import { DrillCard as DrillCardType, MODE_LABELS } from '@/utils/drillSession'

interface DrillCardProps {
  card: DrillCardType
  onAnswer: (cardId: string, verdict: 'correct' | 'wrong', userInput: string) => void
  onNext: () => void
}

type CardState = 'idle' | 'typing' | 'correct' | 'wrong'

/**
 * Splits text on $...$ inline math tokens.
 * Plain text segments → <span>, math segments → <KatexRenderer />.
 */
function parseInlineMath(text: string): React.ReactNode[] {
  const regex = /\$([^$]+)\$/g
  const nodes: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>)
    }
    nodes.push(<KatexRenderer key={`math-${match.index}`} formula={match[1]} displayMode={false} />)
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    nodes.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>)
  }

  return nodes
}

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

export default function DrillCard({ card, onAnswer, onNext }: DrillCardProps) {
  const [inputValue, setInputValue] = useState('')
  const [verdict, setVerdict] = useState<'correct' | 'wrong' | null>(null)

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
    setVerdict(v)
    onAnswer(card.id, v, inputValue.trim())
  }, [inputValue, verdict, card, onAnswer])

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
        maxWidth: '560px',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: `1px solid ${cardBorder}`,
        padding: '24px',
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
          marginBottom: '16px',
        }}
      >
        {MODE_LABELS[card.mode]}
      </div>

      {/* Prompt */}
      <div
        style={{
          fontSize: '1.125rem',
          lineHeight: '1.6',
          color: 'var(--text-primary)',
          marginBottom: '24px',
        }}
      >
        {parseInlineMath(card.prompt)}
      </div>

      {/* Input */}
      {verdict === null && (
        <div style={{ marginBottom: '16px' }}>
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
              padding: '8px 0',
              fontSize: '1rem',
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
            padding: '10px 20px',
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
            padding: '10px 20px',
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
