'use client'

// components/frq/FRQDocumentContent.tsx
// Smart document content renderer for FRQ EBQ and DBQ layouts.
// Parses research article sections, markdown tables, APA citations, and footnotes.

import React from 'react'
import InlineMath from '@/components/InlineMath'
import {
  parseMultiSection,
  parseBodyBlocks,
  splitCitationBlock,
  type ParsedSection,
  type TextBlock,
} from './frqContentParser'

// ─── Table renderer ───────────────────────────────────────────────────────────

function TableBlock({ rows }: { rows: string[][] }) {
  const [head, ...dataRows] = rows
  return (
    <div style={{ overflowX: 'auto', margin: '10px 0' }}>
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
                  {cell}
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
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Section body ─────────────────────────────────────────────────────────────

function SectionBody({ body }: { body: string }) {
  const { body: cleanBody, citations, footnotes } = splitCitationBlock(body)
  const blocks = parseBodyBlocks(cleanBody)

  return (
    <>
      {blocks.map((block: TextBlock, idx: number) => {
        if (block.type === 'table' && block.rows) {
          return <TableBlock key={idx} rows={block.rows} />
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
          style={{
            margin: '12px 0 0',
            fontSize: '12px',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            fontStyle: 'italic',
          }}
        >
          {cite}
        </p>
      ))}
      {footnotes.map((fn, i) => (
        <p
          key={`fn-${i}`}
          style={{
            margin: '8px 0 0',
            fontSize: '11px',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            opacity: 0.7,
          }}
        >
          {fn}
        </p>
      ))}
    </>
  )
}

// ─── Multi-section layout ─────────────────────────────────────────────────────

function MultiSectionContent({ sections }: { sections: ParsedSection[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
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

// ─── Root export ──────────────────────────────────────────────────────────────

interface FRQDocumentContentProps {
  content: string | null
}

export default function FRQDocumentContent({ content }: FRQDocumentContentProps) {
  if (!content) return null

  const sections = parseMultiSection(content)

  if (sections) {
    return <MultiSectionContent sections={sections} />
  }

  // Fallback: single-block content (no section headers detected)
  const { body, citations, footnotes } = splitCitationBlock(content)
  const blocks = parseBodyBlocks(body)

  return (
    <>
      {blocks.map((block: TextBlock, idx: number) => {
        if (block.type === 'table' && block.rows) {
          return <TableBlock key={idx} rows={block.rows} />
        }
        return (
          <p
            key={idx}
            style={{
              margin: idx === 0 ? '0' : '10px 0 0',
              fontSize: '14.5px',
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
          style={{
            margin: '12px 0 0',
            fontSize: '12px',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            fontStyle: 'italic',
          }}
        >
          {cite}
        </p>
      ))}
      {footnotes.map((fn, i) => (
        <p
          key={`fn-${i}`}
          style={{
            margin: '8px 0 0',
            fontSize: '11px',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            opacity: 0.7,
          }}
        >
          {fn}
        </p>
      ))}
    </>
  )
}
