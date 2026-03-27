'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Check, X, ChevronRight } from 'lucide-react'
import KatexRenderer from '@/components/KatexRenderer'
import { fuzzyMatch } from '@/utils/fuzzyMatch'
import { parseInlineMath } from '@/utils/parseInlineMath'
import { DrillCard as DrillCardType, MODE_LABELS } from '@/utils/drillSession'
import { playCorrect, playWrong } from '@/utils/sounds'
import { parseFormula, compareFormulas } from '@/utils/formulaParser'

interface DrillCardProps {
  card: DrillCardType
  onAnswer: (cardId: string, verdict: 'correct' | 'wrong', userInput: string) => void
  onNext: () => void
  isRetry?: boolean
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
        border: `1px solid ${verdict === 'correct' ? 'var(--accent-success)' : verdict === 'wrong' ? 'var(--accent-danger)' : isRetry ? 'var(--accent-warning)' : 'var(--bg-border)'}`,
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

const NOTATION_TABLE = [
  { input: 'x^2',      renders: 'x^{2}' },
  { input: 'x_0',      renders: 'x_{0}' },
  { input: '(a)/(b)',  renders: '\\frac{a}{b}' },
  { input: 'sqrt(x)',  renders: '\\sqrt{x}' },
  { input: '+-',       renders: '\\pm' },
  { input: 'int(f)',   renders: '\\int f' },
  { input: 'inf',      renders: '\\infty' },
  { input: 'Delta',    renders: '\\Delta' },
  { input: 'theta',    renders: '\\theta' },
  { input: 'pi',       renders: '\\pi' },
  { input: 'lambda',   renders: '\\lambda' },
  { input: 'mu',       renders: '\\mu' },
]

function FormulaCard({ card, onAnswer, onNext, isRetry }: DrillCardProps) {
  const [inputValue, setInputValue] = useState('')
  const [verdict, setVerdict] = useState<'correct' | 'wrong' | null>(null)
  const [showModal, setShowModal] = useState(false)

  const previewKatex = parseFormula(inputValue)

  useEffect(() => {
    setInputValue('')
    setVerdict(null)
    setShowModal(false)
  }, [card.id])

  const handleSubmit = useCallback(() => {
    if (!inputValue.trim() || verdict !== null) return
    const isCorrect = compareFormulas(inputValue, card.answer ?? '')
    const v: 'correct' | 'wrong' = isCorrect ? 'correct' : 'wrong'
    if (isCorrect) playCorrect(); else playWrong()
    setVerdict(v)
    onAnswer(card.id, v, inputValue)
  }, [inputValue, verdict, card, onAnswer])

  useEffect(() => {
    if (verdict === null) return
    let ready = false
    const id = setTimeout(() => { ready = true }, 0)
    const handler = (e: KeyboardEvent) => { if (e.key === 'Enter' && ready) onNext() }
    window.addEventListener('keydown', handler)
    return () => { clearTimeout(id); window.removeEventListener('keydown', handler) }
  }, [verdict, onNext])

  const cardState: CardState =
    verdict === 'correct' ? 'correct'
    : verdict === 'wrong' ? 'wrong'
    : inputValue.trim().length > 0 ? 'typing'
    : 'idle'
  const inputBorder = getInputBorderColor(cardState)
  const cardBorder = getCardBorderColor(cardState, isRetry)
  const isSubmitDisabled = inputValue.trim().length === 0 || verdict !== null

  return (
    <>
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--bg-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '32px',
              maxWidth: '420px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Notation Reference</span>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.25rem', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--bg-border)' }}>Type</th>
                  <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--bg-border)' }}>Renders as</th>
                </tr>
              </thead>
              <tbody>
                {NOTATION_TABLE.map(row => (
                  <tr key={row.input}>
                    <td style={{ padding: '6px 8px', fontFamily: 'monospace', color: 'var(--accent)', borderBottom: '1px solid var(--bg-border)' }}>{row.input}</td>
                    <td style={{ padding: '6px 8px', color: 'var(--text-primary)', borderBottom: '1px solid var(--bg-border)' }}>
                      <KatexRenderer formula={row.renders} displayMode={false} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {MODE_LABELS[card.mode]}
          </span>
          {isRetry && <RetryBadge />}
        </div>

        {card.format_hint && (
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '10px', fontStyle: 'italic' }}>
            {card.format_hint}
          </div>
        )}

        <div style={{ fontSize: '1.5rem', lineHeight: '1.65', color: 'var(--text-primary)', marginBottom: '32px', fontWeight: 500 }}>
          {card.prompt}
        </div>

        {verdict === null && (
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
              placeholder="Type your formula…"
              autoFocus
              style={{
                width: '100%', background: 'transparent', border: 'none',
                borderBottom: `2px solid ${inputBorder}`, borderRadius: 0,
                padding: '12px 0', fontSize: '1.25rem', color: 'var(--text-primary)',
                outline: 'none', transition: 'border-color 150ms ease',
              }}
            />
            {inputValue.trim() && (
              <div style={{ marginTop: '10px', minHeight: '28px', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                <KatexRenderer formula={previewKatex} displayMode={false} />
              </div>
            )}
            <button
              onClick={() => setShowModal(true)}
              style={{ marginTop: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '0.8125rem', padding: 0, textDecoration: 'underline' }}
            >
              formatting help
            </button>
          </div>
        )}

        {verdict === null && (
          <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            style={{
              width: '100%', padding: '13px 20px', borderRadius: 'var(--radius-md)', border: 'none',
              background: isSubmitDisabled ? 'var(--bg-border)' : 'var(--accent)',
              color: isSubmitDisabled ? 'var(--text-muted)' : 'white',
              fontSize: '0.9375rem', fontWeight: 600,
              cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
              opacity: isSubmitDisabled ? 0.5 : 1,
            }}
          >
            Check Answer
          </button>
        )}

        {verdict === 'correct' && (
          <div style={{ borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '16px', background: 'color-mix(in srgb, var(--accent-success) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-success) 30%, transparent)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-success)', fontWeight: 600, marginBottom: '8px' }}>
              <Check size={18} /><span>Correct!</span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Answer: </span>
              <strong><KatexRenderer formula={card.answer ?? ''} displayMode={false} /></strong>
            </div>
          </div>
        )}

        {verdict === 'wrong' && (
          <div style={{ borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '16px', background: 'color-mix(in srgb, var(--accent-danger) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-danger) 30%, transparent)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-danger)', fontWeight: 600, marginBottom: '8px' }}>
              <X size={18} /><span>Not quite</span>
            </div>
            <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ color: 'var(--text-muted)' }}>You wrote: <span style={{ color: 'var(--accent-danger)', fontFamily: 'monospace' }}>{inputValue}</span></span>
              <span style={{ color: 'var(--text-muted)' }}>Correct: <strong style={{ color: 'var(--text-primary)' }}><KatexRenderer formula={card.answer ?? ''} displayMode={false} /></strong></span>
            </div>
          </div>
        )}

        {verdict !== null && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {verdict === 'wrong' && (
              <button
                onClick={() => {
                  playCorrect()
                  setVerdict('correct')
                  onAnswer(card.id, 'correct', inputValue)
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
            <button
              onClick={onNext}
              style={{
                flex: verdict === 'wrong' ? 1 : undefined,
                width: verdict === 'correct' ? '100%' : undefined,
                padding: '13px 20px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: verdict === 'correct' ? 'var(--accent-success)' : 'var(--accent-danger)',
                color: 'white', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
            >
              Next card <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  )
}

function DefaultCard({ card, onAnswer, onNext, isRetry }: DrillCardProps) {
  const [inputValue, setInputValue] = useState('')
  const [verdict, setVerdict] = useState<'correct' | 'wrong' | null>(null)

  // Reset state when card changes
  useEffect(() => {
    setInputValue('')
    setVerdict(null)
  }, [card.id])

  const handleSubmit = useCallback(() => {
    if (!inputValue.trim() || verdict !== null) return
    const isCorrect = fuzzyMatch(inputValue.trim(), card.answer ?? '', [])
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
                <KatexRenderer formula={card.answer ?? ''} displayMode={false} />
              </strong>
            ) : (
              <strong style={{ color: 'var(--text-primary)' }}>{card.answer ?? ''}</strong>
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
                  <KatexRenderer formula={card.answer ?? ''} displayMode={false} />
                </strong>
              ) : (
                <strong style={{ color: 'var(--text-primary)' }}>{card.answer ?? ''}</strong>
              )}
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

export default function DrillCard({ card, onAnswer, onNext, isRetry }: DrillCardProps) {
  if (card.mode === 'concept_mc') return <ConceptMcCard card={card} onAnswer={onAnswer} onNext={onNext} isRetry={isRetry} />
  if (card.mode === 'name_to_formula') return <FormulaCard card={card} onAnswer={onAnswer} onNext={onNext} isRetry={isRetry} />
  return <DefaultCard card={card} onAnswer={onAnswer} onNext={onNext} isRetry={isRetry} />
}
