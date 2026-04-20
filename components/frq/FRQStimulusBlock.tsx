'use client'

// components/frq/FRQStimulusBlock.tsx
// Reusable stimulus display — handles image, text (with KaTeX), or both.
// Smart parsing: detects multi-section research articles and renders labeled blocks.
// Table detection: markdown pipe-tables rendered as <table>.

import React from 'react'
import InlineMath from '@/components/InlineMath'
import {
  parseMultiSection,
  parseBodyBlocks,
  splitCitationBlock,
  type ParsedSection,
  type TextBlock,
} from './frqContentParser'

interface FRQStimulusBlockProps {
  stimulus: string | null
  stimulusImage: string | null
}

// ─── Section body renderer ────────────────────────────────────────────────────

function SectionBody({ body }: { body: string }) {
  const { body: cleanBody, citations, footnotes } = splitCitationBlock(body)
  const blocks = parseBodyBlocks(cleanBody)

  return (
    <>
      {blocks.map((block: TextBlock, idx: number) => {
        if (block.type === 'table' && block.rows) {
          const [head, ...dataRows] = block.rows
          return (
            <div key={idx} style={{ overflowX: 'auto', margin: '10px 0' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                }}
              >
                {head && head.length > 0 && (
                  <thead>
                    <tr>
                      {head.map((cell, ci) => (
                        <th
                          key={ci}
                          style={{
                            padding: '8px 12px',
                            borderBottom: '2px solid var(--bg-border)',
                            textAlign: 'left',
                            fontWeight: 600,
                            color: 'var(--text-secondary)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <InlineMath text={cell} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {dataRows.map((row, ri) => (
                    <tr
                      key={ri}
                      style={{
                        borderBottom: '1px solid var(--bg-border)',
                        background: ri % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                      }}
                    >
                      {row.map((cell, ci) => (
                        <td key={ci} style={{ padding: '8px 12px', lineHeight: 1.6 }}>
                          <InlineMath text={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
        return (
          <p
            key={idx}
            style={{
              margin: idx === 0 ? '0' : '10px 0 0',
              fontSize: '14px',
              color: 'var(--text-primary)',
              lineHeight: 2,
              letterSpacing: '0.01em',
            }}
          >
            <InlineMath text={block.content} />
          </p>
        )
      })}
      {citations.map((cite, i) => (
        <p
          key={`cite-${i}`}
          style={{ margin: '12px 0 0', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic' }}
        >
          {cite}
        </p>
      ))}
      {footnotes.map((fn, i) => (
        <p
          key={`fn-${i}`}
          style={{ margin: '8px 0 0', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5, opacity: 0.7 }}
        >
          {fn}
        </p>
      ))}
    </>
  )
}

// ─── Multi-section card ───────────────────────────────────────────────────────

function MultiSectionStimulus({ sections }: { sections: ParsedSection[] }) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--bg-border)',
        borderLeft: '3px solid var(--accent)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
      }}
    >
      {sections.map((section, idx) => (
        <div key={section.name}>
          {idx > 0 && (
            <div
              aria-hidden="true"
              style={{ height: '1px', background: 'var(--bg-border)', margin: '16px 0' }}
            />
          )}
          <div
            style={{
              fontSize: '0.6875rem',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              fontWeight: 600,
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            {section.name}
          </div>
          <SectionBody body={section.body} />
        </div>
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function FRQStimulusBlock({ stimulus, stimulusImage }: FRQStimulusBlockProps) {
  if (!stimulus && !stimulusImage) return null

  const sections = stimulus ? parseMultiSection(stimulus) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {stimulusImage && (
        <div
          style={{
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            border: '1px solid var(--bg-border)',
            background: 'var(--bg-card)',
            maxWidth: '100%',
          }}
        >
          <img
            src={stimulusImage}
            alt="Question stimulus"
            style={{ maxWidth: '100%', height: 'auto', display: 'block', borderRadius: 'var(--radius-md)' }}
          />
        </div>
      )}

      {stimulus && sections && <MultiSectionStimulus sections={sections} />}

      {stimulus && !sections && (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--bg-border)',
            borderLeft: '3px solid var(--accent)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
          }}
        >
          <SectionBody body={stimulus} />
        </div>
      )}
    </div>
  )
}
