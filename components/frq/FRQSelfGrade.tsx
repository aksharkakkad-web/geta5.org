'use client'

import React, { useState } from 'react'
import { Copy, Check, ExternalLink } from 'lucide-react'
import type { FRQ } from '@/utils/frqSession'
import { isMathSubject } from '@/utils/frqSession'
import InlineMath from '@/components/InlineMath'
import FRQSourceLinks from './FRQSourceLinks'

interface FRQSelfGradeProps {
  question: FRQ
  responses: Record<string, string>
  subject: string
  onNextQuestion: () => void
  onRetry: () => void
}

/** Build a paste-ready prompt that a student can drop into Gemini, ChatGPT, Claude, etc. */
function buildExternalAIPrompt(q: FRQ, responses: Record<string, string>): string {
  const lines: string[] = []

  lines.push('Please grade my AP exam free-response question (FRQ) like an AP reader would. For each part, tell me what I earned, what I missed, and how to improve. Use the rubric below — do not invent extra criteria.')
  lines.push('')
  lines.push(`Subject: ${q.subject}`)
  lines.push(`Question: ${q.title}`)
  lines.push(`Total points: ${q.total_points}`)
  lines.push('')

  if (q.stimulus) {
    lines.push('STIMULUS / SOURCE:')
    lines.push(q.stimulus)
    lines.push('')
  }

  if (q.documents && q.documents.length > 0) {
    lines.push('DOCUMENTS:')
    q.documents.forEach((doc) => {
      lines.push(`Document ${doc.doc_number} — ${doc.source}`)
      lines.push(doc.content)
      lines.push('')
    })
  }

  lines.push('PARTS, RUBRIC, AND MY RESPONSE:')
  lines.push('')
  q.parts.forEach((part) => {
    lines.push(`Part (${part.letter}) — ${part.point_value} point${part.point_value === 1 ? '' : 's'}`)
    lines.push(`Prompt: ${part.prompt}`)
    if (part.rubric_criteria && part.rubric_criteria.length > 0) {
      lines.push('Rubric criteria:')
      part.rubric_criteria.forEach((c) => lines.push(`  - ${c}`))
    }
    if (part.scoring_points && part.scoring_points.length > 0) {
      lines.push('Earnable points:')
      part.scoring_points.forEach((sp) => {
        lines.push(`  - [${sp.point_id}] ${sp.description}`)
      })
    }
    if (part.scoring_notes) {
      lines.push(`Notes: ${part.scoring_notes}`)
    }
    const myResp = responses[part.letter]?.trim() || '(no response written)'
    lines.push('My response:')
    lines.push(myResp)
    lines.push('')
  })

  lines.push('Please return: (1) score per part out of the maximum, (2) total score, (3) one specific improvement for each part I missed.')

  return lines.join('\n')
}

export default function FRQSelfGrade({
  question,
  responses,
  subject,
  onNextQuestion,
  onRetry,
}: FRQSelfGradeProps) {
  const [copied, setCopied] = useState(false)
  const isMath = isMathSubject(subject)

  async function handleCopy() {
    const text = buildExternalAIPrompt(question, responses)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      // Fallback: select via temporary textarea for clipboard-blocked contexts.
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2200)
      } catch {
        // last resort — silent fail; user can still read text inline
      }
      document.body.removeChild(ta)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ── Banner: AI grading paused ─────────────────────────────────────── */}
      <div
        role="status"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          padding: '14px 18px',
          borderRadius: 'var(--radius-lg)',
          background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
          border: '1px solid color-mix(in srgb, var(--accent) 32%, transparent)',
        }}
      >
        <div
          style={{
            fontSize: '0.9375rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-outfit)',
          }}
        >
          AI grading is paused — grade externally
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Due to high demand and limited grading resources, our AI grader is on
          pause. Your response is below alongside the official rubric. Use the
          copy button to drop everything into your own AI tool (Gemini,
          ChatGPT, Claude) for feedback, or self-grade against the rubric.
        </div>
      </div>

      {/* ── Question header ───────────────────────────────────────────────── */}
      <div>
        <h2
          style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0,
            marginBottom: '6px',
            lineHeight: 1.4,
            fontFamily: 'var(--font-outfit)',
          }}
        >
          {isMath ? <InlineMath text={question.title} /> : question.title}
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
          {question.total_points} point{question.total_points === 1 ? '' : 's'} total
        </p>
        {(question.source_pdf || question.source_scoring_guideline_pdf) && (
          <div style={{ marginTop: '10px' }}>
            <FRQSourceLinks
              pdfHref={question.source_pdf}
              scoringGuidelineHref={question.source_scoring_guideline_pdf}
              showScoringGuideline={Boolean(question.source_scoring_guideline_pdf)}
            />
          </div>
        )}
      </div>

      {/* ── Copy-for-external-AI button ───────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          alignItems: 'center',
          padding: '14px 16px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-card)',
          border: '1px solid var(--bg-border)',
        }}
      >
        <div style={{ flex: '1 1 220px', minWidth: 0 }}>
          <div
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '2px',
              fontFamily: 'var(--font-outfit)',
            }}
          >
            Grade with your own AI
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
            Copies the question, rubric, and your response in one block. Paste it into Gemini, ChatGPT, or Claude and ask for feedback.
          </div>
        </div>
        <button
          onClick={handleCopy}
          aria-live="polite"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: copied ? 'var(--accent-success, #10b981)' : 'var(--accent)',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-outfit)',
            transition: 'background 150ms ease, transform 150ms ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            if (!copied) {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover)'
              ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
            }
          }}
          onMouseLeave={(e) => {
            if (!copied) {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)'
              ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
            }
          }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy for external AI'}
        </button>
      </div>

      {/* ── Per-part: response + rubric ───────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {question.parts.map((part) => {
          const myResp = responses[part.letter]?.trim() || ''
          return (
            <section
              key={part.letter}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--bg-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              {/* Part header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '10px',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-outfit)',
                  }}
                >
                  Part ({part.letter})
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {part.point_value} point{part.point_value === 1 ? '' : 's'}
                </span>
              </div>

              {/* Prompt */}
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  margin: 0,
                  lineHeight: 1.55,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {isMath ? <InlineMath text={part.prompt} /> : part.prompt}
              </p>

              {/* My response */}
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '6px',
                  }}
                >
                  Your response
                </div>
                <div
                  style={{
                    fontSize: '0.875rem',
                    color: myResp ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontStyle: myResp ? 'normal' : 'italic',
                    lineHeight: 1.6,
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'color-mix(in srgb, var(--bg-border) 30%, transparent)',
                    border: '1px solid var(--bg-border)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {myResp || 'No response written for this part.'}
                </div>
              </div>

              {/* Rubric */}
              {(part.rubric_criteria?.length || part.scoring_points?.length) && (
                <div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: '6px',
                    }}
                  >
                    Rubric — what earns the point{part.point_value === 1 ? '' : 's'}
                  </div>
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    {part.scoring_points && part.scoring_points.length > 0
                      ? part.scoring_points.map((sp) => (
                          <li
                            key={sp.point_id}
                            style={{
                              fontSize: '0.8125rem',
                              color: 'var(--text-secondary)',
                              lineHeight: 1.55,
                              padding: '10px 12px',
                              borderRadius: 'var(--radius-md)',
                              background: 'color-mix(in srgb, var(--accent) 5%, transparent)',
                              border: '1px solid color-mix(in srgb, var(--accent) 18%, transparent)',
                            }}
                          >
                            <span
                              style={{
                                display: 'inline-block',
                                fontSize: '0.6875rem',
                                fontWeight: 700,
                                color: 'var(--accent)',
                                background: 'color-mix(in srgb, var(--accent) 16%, transparent)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                marginRight: '8px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                              }}
                            >
                              {sp.point_id}
                            </span>
                            {sp.description}
                          </li>
                        ))
                      : part.rubric_criteria.map((c, i) => (
                          <li
                            key={i}
                            style={{
                              fontSize: '0.8125rem',
                              color: 'var(--text-secondary)',
                              lineHeight: 1.55,
                              padding: '10px 12px',
                              borderRadius: 'var(--radius-md)',
                              background: 'color-mix(in srgb, var(--accent) 5%, transparent)',
                              border: '1px solid color-mix(in srgb, var(--accent) 18%, transparent)',
                            }}
                          >
                            {c}
                          </li>
                        ))}
                  </ul>
                </div>
              )}

              {part.scoring_notes && (
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                    lineHeight: 1.5,
                  }}
                >
                  Note: {part.scoring_notes}
                </div>
              )}
            </section>
          )
        })}
      </div>

      {/* ── Scoring guidelines link (if available) ────────────────────────── */}
      {question.source_scoring_guideline_pdf && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'color-mix(in srgb, var(--bg-border) 25%, transparent)',
            border: '1px solid var(--bg-border)',
          }}
        >
          <ExternalLink size={14} aria-hidden="true" style={{ flexShrink: 0 }} />
          <span>
            Want the official answer key? See the{' '}
            <a
              href={question.source_scoring_guideline_pdf}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--accent)',
                textDecoration: 'underline',
                fontWeight: 600,
              }}
            >
              College Board scoring guidelines
            </a>
            .
          </span>
        </div>
      )}

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          marginTop: '4px',
        }}
      >
        <button
          onClick={onRetry}
          style={{
            flex: '1 1 160px',
            padding: '11px 18px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--bg-border)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            fontSize: '0.9375rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-outfit)',
            transition: 'border-color 150ms ease, color 150ms ease',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--text-muted)'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--bg-border)'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'
          }}
        >
          Try this FRQ again
        </button>
        <button
          onClick={onNextQuestion}
          style={{
            flex: '1 1 160px',
            padding: '11px 18px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: 'var(--accent)',
            color: 'white',
            fontSize: '0.9375rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-outfit)',
            transition: 'background 150ms ease, transform 150ms ease',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover)'
            ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)'
            ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
          }}
        >
          Pick another FRQ
        </button>
      </div>
    </div>
  )
}
