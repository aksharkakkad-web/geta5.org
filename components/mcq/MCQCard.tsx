'use client'

import React, { useState, useEffect } from 'react'
import { Check, X } from 'lucide-react'
import KatexRenderer from '@/components/KatexRenderer'
import StimulusRenderer from '@/components/mcq/StimulusRenderer'
import { scramble } from '@/utils/scramble'
import type { MCQ, MCQChoice } from '@/utils/mcqSession'
import { playCorrect, playWrong } from '@/utils/sounds'

// ─── Types ────────────────────────────────────────────────────────────────────

interface MCQCardProps {
  question: MCQ
  onAnswer: (questionId: string, selectedChoiceId: string, isCorrect: boolean) => void
  onNext: () => void
  /** Test mode: choice click records answer immediately, no feedback reveal */
  testMode?: boolean
  /** Restore prior selection when navigating back in test mode */
  initialSelectedId?: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LABELS = ['A', 'B', 'C', 'D'] as const

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function MCQCard({ question, onAnswer, onNext, testMode = false, initialSelectedId = null }: MCQCardProps) {
  // Scramble choices ONCE on mount via initializer (per Critical Rule #4 and plan spec)
  const [scrambledChoices, setScrambledChoices] = useState<MCQChoice[]>(
    () => scramble(question.choices)
  )
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId)
  const [submitted, setSubmitted] = useState<boolean>(false)

  // Reset state when question changes (next question)
  useEffect(() => {
    setScrambledChoices(scramble(question.choices))
    setSelectedId(initialSelectedId)
    setSubmitted(false)
  }, [question.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Assign display labels positionally (A/B/C/D) after scramble
  // displayLabel is for visual rendering ONLY — correctness uses choice.is_correct
  const labeledChoices = scrambledChoices.map((choice, i) => ({
    ...choice,
    displayLabel: LABELS[i],
  }))

  function handleSubmit() {
    if (!selectedId || submitted) return
    setSubmitted(true)
    const selected = scrambledChoices.find(c => c.id === selectedId)!
    if (selected.is_correct) playCorrect(); else playWrong()
    onAnswer(question.id, selectedId, selected.is_correct)
  }

  function handleTestSelect(choice: MCQChoice) {
    if (choice.id === selectedId) return
    setSelectedId(choice.id)
    onAnswer(question.id, choice.id, choice.is_correct)
  }

  function getChoiceStyle(choice: MCQChoice & { displayLabel: string }): React.CSSProperties {
    const isSelected = choice.id === selectedId
    const base: React.CSSProperties = {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '14px 16px',
      borderRadius: 'var(--radius-md)',
      transition: 'border-color 150ms ease, background 150ms ease',
      cursor: submitted ? 'default' : 'pointer',
    }

    // Test mode: only selection highlight, no correct/wrong feedback
    if (testMode) {
      if (isSelected) {
        return {
          ...base,
          border: '2px solid var(--accent)',
          background: 'color-mix(in srgb, var(--accent) 10%, var(--bg-card))',
        }
      }
      return {
        ...base,
        border: '1px solid var(--bg-border)',
        background: 'var(--bg-card)',
      }
    }

    if (!submitted) {
      if (isSelected) {
        return {
          ...base,
          border: '2px solid var(--accent)',
          background: 'color-mix(in srgb, var(--accent) 10%, var(--bg-card))',
        }
      }
      return {
        ...base,
        border: '1px solid var(--bg-border)',
        background: 'var(--bg-card)',
      }
    }

    // Submitted states (drill mode only)
    if (choice.is_correct) {
      return {
        ...base,
        border: '2px solid var(--accent-success)',
        background: 'color-mix(in srgb, var(--accent-success) 10%, transparent)',
      }
    }
    if (isSelected) {
      return {
        ...base,
        border: '2px solid var(--accent-danger)',
        background: 'color-mix(in srgb, var(--accent-danger) 10%, transparent)',
      }
    }
    return {
      ...base,
      opacity: 0.6,
      border: '1px solid var(--bg-border)',
      background: 'var(--bg-card)',
    }
  }

  return (
    <div>
      {/* Stimulus */}
      <div style={{ marginBottom: stimulus_has_content(question) ? '20px' : 0 }}>
        <StimulusRenderer stimulus={question.stimulus ?? { type: 'none' }} />
      </div>

      {/* Question text */}
      <div
        style={{
          fontSize: '1.0625rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          lineHeight: 1.5,
          marginTop: 16,
          marginBottom: 20,
        }}
      >
        {parseInlineMath(question.question)}
      </div>

      {/* Choices list */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: submitted ? 'none' : 'auto',
        }}
      >
        {labeledChoices.map(choice => (
          <div key={choice.id}>
            {/* Choice card */}
            <div
              style={getChoiceStyle(choice)}
              onClick={() => {
                if (testMode) {
                  handleTestSelect(choice)
                } else if (!submitted) {
                  setSelectedId(choice.id)
                }
              }}
              role="button"
              tabIndex={submitted ? -1 : 0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  if (testMode) handleTestSelect(choice)
                  else if (!submitted) setSelectedId(choice.id)
                }
              }}
            >
              {/* Display label circle */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  flexShrink: 0,
                }}
              >
                {choice.displayLabel}
              </div>

              {/* Choice text */}
              <div style={{ flex: 1, lineHeight: 1.5 }}>
                {parseInlineMath(choice.text)}
              </div>

              {/* Feedback icon (drill mode only, after submit) */}
              {!testMode && submitted && choice.is_correct && (
                <Check size={16} color="var(--accent-success)" style={{ flexShrink: 0 }} />
              )}
              {!testMode && submitted && !choice.is_correct && choice.id === selectedId && (
                <X size={16} color="var(--accent-danger)" style={{ flexShrink: 0 }} />
              )}
            </div>

            {/* Explanation reveal (drill mode only, all 4 choices after submit) */}
            {!testMode && submitted && (
              <div
                style={{
                  marginTop: 8,
                  paddingTop: 8,
                  borderTop: '1px solid var(--bg-border)',
                  fontSize: '0.8125rem',
                  lineHeight: 1.5,
                  color: choice.is_correct ? 'var(--accent-success)' : 'var(--text-secondary)',
                  paddingLeft: '40px',
                }}
              >
                {choice.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Submit Answer button — drill mode only */}
      {!testMode && selectedId !== null && !submitted && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
          <button
            onClick={handleSubmit}
            style={{
              background: 'var(--accent)',
              color: 'white',
              padding: '12px 32px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              fontSize: '0.9375rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Submit Answer
          </button>
        </div>
      )}

      {/* Next Question button — drill mode only */}
      {!testMode && submitted && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
          <button
            onClick={onNext}
            style={{
              background: 'var(--accent)',
              color: 'white',
              padding: '12px 32px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              fontSize: '0.9375rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Next Question
          </button>
        </div>
      )}
    </div>
  )
}

// Helper to detect if stimulus has renderable content
function stimulus_has_content(question: MCQ): boolean {
  return question.stimulus != null && question.stimulus.type !== 'none' && question.stimulus.content != null
}
