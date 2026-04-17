'use client'

// components/frq/FRQStimulusBlock.tsx
// Reusable stimulus display — handles image, text (with KaTeX), or both.
// Smart parsing: detects multi-section research articles and renders labeled blocks.
// Table detection: markdown pipe-tables rendered as <table>.

import React from 'react'
import InlineMath from '@/components/InlineMath'

interface FRQStimulusBlockProps {
  stimulus: string | null
  stimulusImage: string | null
}

// ─── Section parsing ──────────────────────────────────────────────────────────

const SECTION_NAMES = [
  'Introduction',
  'Participants',
  'Method',
  'Results and Discussion',
  'Results',
  'Discussion',
]

// Matches one of the known section headers on its own line
const SECTION_HEADER_RE = new RegExp(
  `^(${SECTION_NAMES.map(n => n.replace(/ /g, ' ')).join('|')})$`,
  'gm'
)

interface ParsedSection {
  name: string
  body: string
}

function parseMultiSection(text: string): ParsedSection[] | null {
  const matches = [...text.matchAll(SECTION_HEADER_RE)]
  if (matches.length < 2) return null

  return matches.map((m, i) => {
    const bodyStart = (m.index ?? 0) + m[0].length
    const bodyEnd = i + 1 < matches.length ? (matches[i + 1].index ?? text.length) : text.length
    return {
      name: m[1],
      body: text.slice(bodyStart, bodyEnd).trim(),
    }
  })
}

// ─── Table rendering ──────────────────────────────────────────────────────────

// A line is a table row if it starts and ends with | (allowing whitespace)
function isTableRow(line: string): boolean {
  const t = line.trim()
  return t.startsWith('|') && t.endsWith('|')
}

function isSeparatorRow(line: string): boolean {
  return /^\|[\s|:-]+\|$/.test(line.trim())
}

interface TextBlock {
  type: 'text' | 'table'
  content: string
  rows?: string[][]
}

function parseBodyBlocks(body: string): TextBlock[] {
  const lines = body.split('\n')
  const blocks: TextBlock[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    if (isTableRow(line)) {
      // Collect consecutive table rows
      const tableLines: string[] = []
      while (i < lines.length && isTableRow(lines[i])) {
        tableLines.push(lines[i])
        i++
      }
      // Parse into rows×cells
      const rows = tableLines
        .filter(l => !isSeparatorRow(l))
        .map(l =>
          l
            .trim()
            .slice(1, -1) // strip leading/trailing |
            .split('|')
            .map(c => c.trim())
        )
      blocks.push({ type: 'table', content: '', rows })
    } else {
      // Collect consecutive non-table lines
      const textLines: string[] = []
      while (i < lines.length && !isTableRow(lines[i])) {
        textLines.push(lines[i])
        i++
      }
      const text = textLines.join('\n').trim()
      if (text) blocks.push({ type: 'text', content: text })
    }
  }

  return blocks
}

// ─── Section body renderer ────────────────────────────────────────────────────

function SectionBody({ body }: { body: string }) {
  const blocks = parseBodyBlocks(body)

  return (
    <>
      {blocks.map((block, idx) => {
        if (block.type === 'table' && block.rows) {
          const [head, ...dataRows] = block.rows
          return (
            <div
              key={idx}
              style={{
                overflowX: 'auto',
                margin: '10px 0',
              }}
            >
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
              style={{
                height: '1px',
                background: 'var(--bg-border)',
                margin: '16px 0',
              }}
            />
          )}
          {/* Section header */}
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
          {/* Section body */}
          <SectionBody body={section.body} />
        </div>
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function FRQStimulusBlock({ stimulus, stimulusImage }: FRQStimulusBlockProps) {
  if (!stimulus && !stimulusImage) return null

  // Try to parse multi-section stimulus
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
            style={{
              maxWidth: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: 'var(--radius-md)',
            }}
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
