'use client'
import { useState } from 'react'
import KatexRenderer from '@/components/KatexRenderer'
import InlineKatex from '@/components/study-guide/InlineKatex'

interface FormulaItem {
  name: string
  katex_string: string
  description?: string
  example?: string
}

interface Props {
  formulas: FormulaItem[]
}

export default function FormulasSection({ formulas }: Props) {
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState<Set<number>>(new Set())
  const [done, setDone] = useState(false)

  if (formulas.length === 0) return null

  const formula = formulas[current]
  const knownCount = known.size

  function flip() {
    setFlipped(true)
  }

  function advance(markKnown: boolean) {
    const newKnown = new Set(known)
    if (markKnown) newKnown.add(current)
    setKnown(newKnown)
    setFlipped(false)

    if (current + 1 >= formulas.length) {
      setDone(true)
    } else {
      setCurrent(current + 1)
    }
  }

  function restart() {
    setCurrent(0)
    setFlipped(false)
    setKnown(new Set())
    setDone(false)
  }

  if (done) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '40px 24px',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '32px' }}>
          {knownCount === formulas.length ? '🎉' : '📚'}
        </div>
        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
          {knownCount === formulas.length
            ? 'You know all the formulas!'
            : `${knownCount} of ${formulas.length} formulas known`}
        </div>
        {knownCount < formulas.length && (
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Keep reviewing the ones you missed.
          </div>
        )}
        <button
          onClick={restart}
          style={{
            marginTop: '8px',
            padding: '10px 24px',
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Review Again
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {current + 1} / {formulas.length}
        </span>
        <span style={{ fontSize: '13px', color: 'var(--accent-success)' }}>
          {knownCount} known
        </span>
      </div>

      {/* Progress bar */}
      <div style={{
        height: '3px',
        background: 'var(--bg-border)',
        borderRadius: '99px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${((current) / formulas.length) * 100}%`,
          background: 'var(--accent)',
          borderRadius: '99px',
          transition: 'width 300ms ease',
        }} />
      </div>

      {/* Flip card */}
      <div
        style={{
          perspective: '1000px',
          height: flipped ? 'auto' : '180px',
          minHeight: '180px',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            minHeight: '180px',
            transformStyle: 'preserve-3d',
            transition: 'transform 400ms ease',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front */}
          <div
            onClick={!flipped ? flip : undefined}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              minHeight: '180px',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              background: 'var(--bg-card)',
              border: '1px solid var(--bg-border)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '24px',
              cursor: 'pointer',
              textAlign: 'center',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3), 0 12px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Formula
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
              <InlineKatex text={formula.name} />
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Tap to reveal
            </div>
          </div>

          {/* Back */}
          <div
            style={{
              position: flipped ? 'relative' : 'absolute',
              top: 0,
              left: 0,
              right: 0,
              minHeight: '180px',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'var(--bg-card)',
              border: '1px solid var(--bg-border)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '24px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              <InlineKatex text={formula.name} />
            </div>

            {/* Formula */}
            <div style={{ textAlign: 'center' }}>
              <KatexRenderer formula={formula.katex_string} displayMode={true} />
            </div>

            {/* Description */}
            {formula.description && (
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                <InlineKatex text={formula.description} />
              </div>
            )}

            {/* Example */}
            {formula.example && (
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', opacity: 0.75, fontStyle: 'italic' }}>
                <InlineKatex text={formula.example} />
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                onClick={() => advance(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'transparent',
                  border: '1px solid var(--bg-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Still learning
              </button>
              <button
                onClick={() => advance(true)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'color-mix(in srgb, var(--accent-success) 15%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--accent-success) 40%, transparent)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--accent-success)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Know it ✓
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
