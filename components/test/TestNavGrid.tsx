'use client'

import React from 'react'
import { Flag } from 'lucide-react'
import type { TestAnswer } from '@/utils/testSession'

interface TestNavGridProps {
  totalQuestions: number
  currentIndex: number
  answers: Record<string, TestAnswer>
  flagged: Record<string, boolean>
  questionIds: string[]
  onJump: (index: number) => void
}

export default function TestNavGrid({
  totalQuestions,
  currentIndex,
  answers,
  flagged,
  questionIds,
  onJump,
}: TestNavGridProps) {
  function getCellStyle(index: number): React.CSSProperties {
    const qId = questionIds[index]
    const isCurrentActive = index === currentIndex
    const isAnswered = !!answers[qId]
    const isFlagged = !!flagged[qId]

    const base: React.CSSProperties = {
      position: 'relative',
      minHeight: '44px',
      minWidth: '36px',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid',
      fontSize: '0.875rem',
      fontWeight: 400,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 150ms ease, border-color 150ms ease',
      padding: '4px',
    }

    if (isCurrentActive) {
      return {
        ...base,
        background: 'var(--accent)',
        borderColor: 'var(--accent)',
        color: 'white',
      }
    }

    if (isFlagged) {
      return {
        ...base,
        background: 'color-mix(in srgb, var(--accent-warning) 15%, transparent)',
        borderColor: 'var(--accent-warning)',
        color: 'var(--accent-warning)',
      }
    }

    if (isAnswered) {
      return {
        ...base,
        background: 'color-mix(in srgb, var(--accent) 20%, transparent)',
        borderColor: 'var(--accent)',
        color: 'var(--text-primary)',
      }
    }

    return {
      ...base,
      background: 'var(--bg-card)',
      borderColor: 'var(--bg-border)',
      color: 'var(--text-muted)',
    }
  }

  return (
    <>
      <style>{`
        .test-nav-grid {
          display: grid;
          grid-template-columns: repeat(10, 1fr);
          gap: 6px;
          padding: 12px 16px;
        }
        @media (max-width: 767px) {
          .test-nav-grid {
            display: flex;
            overflow-x: auto;
            white-space: nowrap;
            padding: 8px 16px;
            gap: 6px;
            scroll-behavior: smooth;
          }
          .test-nav-grid::-webkit-scrollbar {
            height: 4px;
          }
          .test-nav-grid::-webkit-scrollbar-thumb {
            background: var(--bg-border);
            border-radius: 2px;
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .test-nav-grid {
            grid-template-columns: repeat(8, 1fr);
          }
        }
      `}</style>
      <div className="test-nav-grid">
        {Array.from({ length: totalQuestions }, (_, i) => {
          const qId = questionIds[i]
          const isFlagged = !!flagged[qId]

          return (
            <button
              key={i}
              onClick={() => onJump(i)}
              style={getCellStyle(i)}
              aria-label={`Question ${i + 1}${isFlagged ? ' (flagged)' : ''}`}
            >
              {i + 1}
              {isFlagged && (
                <Flag
                  size={10}
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    right: '4px',
                    color: 'var(--accent-warning)',
                  }}
                />
              )}
            </button>
          )
        })}
      </div>
    </>
  )
}
