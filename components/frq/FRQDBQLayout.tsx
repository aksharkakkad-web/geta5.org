'use client'

// components/frq/FRQDBQLayout.tsx
// Split-screen DBQ layout: left panel = documents, right panel = essay editor.
// Mobile: stacked accordion for documents + single essay textarea.

import React, { useState, useEffect } from 'react'
import type { FRQ } from '@/utils/frqSession'
import InlineMath from '@/components/InlineMath'

interface FRQDBQLayoutProps {
  question: FRQ
  responses: Record<string, string>
  onResponseChange: (partLetter: string, value: string) => void
  onSubmit: () => void
  onSaveDraft: () => void
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

// ─── Textarea with focus styling ─────────────────────────────────────────────

interface EssayTextareaProps {
  value: string
  onChange: (v: string) => void
  minHeight: number
  placeholder?: string
}

function EssayTextarea({ value, onChange, minHeight, placeholder = 'Write your essay here...' }: EssayTextareaProps) {
  const [focused, setFocused] = useState(false)
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      spellCheck
      style={{
        background: 'var(--bg-primary)',
        border: focused ? '1px solid var(--accent)' : '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-md)',
        padding: '14px',
        fontSize: '14px',
        color: 'var(--text-primary)',
        width: '100%',
        minHeight: `${minHeight}px`,
        resize: 'vertical',
        fontFamily: 'inherit',
        lineHeight: 1.8,
        outline: 'none',
        boxSizing: 'border-box',
        boxShadow: focused ? '0 0 0 3px rgba(99, 102, 241, 0.15)' : 'none',
        transition: 'border-color 150ms ease, box-shadow 150ms ease',
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

// ─── Desktop split-screen ─────────────────────────────────────────────────────

function DesktopDBQ({ question, responses, onResponseChange, onSubmit, onSaveDraft }: FRQDBQLayoutProps) {
  const [activeDocIndex, setActiveDocIndex] = useState(0)
  const docs = question.documents ?? []
  const essayValue = responses.essay ?? ''
  const wc = wordCount(essayValue)
  const activeDoc = docs[activeDocIndex]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Prompt bar */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 20px',
          boxShadow: '0 0 24px rgba(99, 102, 241, 0.08)',
        }}
      >
        <span
          style={{
            background: 'linear-gradient(135deg, var(--accent), #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 700,
            marginRight: '10px',
          }}
        >
          DBQ
        </span>
        <span style={{ color: 'var(--text-primary)', fontSize: '14px', lineHeight: 1.6 }}>
          <InlineMath text={question.parts[0]?.prompt ?? question.title} />
        </span>
      </div>

      {/* Split panel */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '12px',
          minHeight: '480px',
        }}
      >
        {/* LEFT — Document panel */}
        <div
          style={{
            flex: 1,
            background: 'var(--bg-card)',
            border: '1px solid var(--bg-border)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Tab bar */}
          {docs.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                borderBottom: '1px solid var(--bg-border)',
                overflowX: 'auto',
                flexShrink: 0,
              }}
            >
              {docs.map((doc, idx) => {
                const isActive = idx === activeDocIndex
                return (
                  <button
                    key={doc.doc_number}
                    type="button"
                    onClick={() => setActiveDocIndex(idx)}
                    style={{
                      position: 'relative',
                      padding: '10px 16px',
                      fontSize: '13px',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? 'var(--accent-hover)' : 'var(--text-muted)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      transition: 'color 150ms ease',
                    }}
                  >
                    Doc {doc.doc_number}
                    {isActive && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '2px',
                          background: 'linear-gradient(90deg, var(--accent), #a855f7)',
                          boxShadow: '0 0 8px rgba(99, 102, 241, 0.5)',
                        }}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Document content */}
          {activeDoc && (
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px',
              }}
            >
              {/* Source badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.15)',
                  borderRadius: '999px',
                  marginBottom: '14px',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--accent-hover)',
                    fontWeight: 500,
                    fontStyle: 'italic',
                  }}
                >
                  {activeDoc.source}
                </span>
              </div>

              {/* Document image */}
              {activeDoc.image && (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    border: '1px solid var(--bg-border)',
                    marginBottom: '12px',
                  }}
                >
                  <img
                    src={activeDoc.image}
                    alt={`Document ${activeDoc.doc_number}`}
                    style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                  />
                </div>
              )}

              {/* Document text */}
              <p
                style={{
                  fontSize: '14.5px',
                  color: 'var(--text-primary)',
                  lineHeight: 2,
                  letterSpacing: '0.01em',
                  margin: 0,
                }}
              >
                {activeDoc.content}
              </p>
            </div>
          )}

          {docs.length === 0 && (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                fontSize: '14px',
              }}
            >
              No documents provided
            </div>
          )}
        </div>

        {/* RIGHT — Essay panel */}
        <div
          style={{
            width: '420px',
            flexShrink: 0,
            background: 'rgba(5, 5, 10, 0.6)',
            border: '1px solid var(--bg-border)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Panel header */}
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--bg-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--accent-success)',
                  boxShadow: '0 0 6px rgba(34, 197, 94, 0.4)',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Writing
              </span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {wc} {wc === 1 ? 'word' : 'words'}
            </span>
          </div>

          {/* Textarea area */}
          <div style={{ flex: 1, padding: '16px' }}>
            <EssayTextarea
              value={essayValue}
              onChange={(v) => onResponseChange('essay', v)}
              minHeight={280}
            />
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '0 16px 16px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
              flexShrink: 0,
            }}
          >
            <GhostButton onClick={onSaveDraft}>Save Draft</GhostButton>
            <GradientButton onClick={onSubmit}>Submit for Grading</GradientButton>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Mobile stacked layout ───────────────────────────────────────────────────

function MobileDBQ({ question, responses, onResponseChange, onSubmit, onSaveDraft }: FRQDBQLayoutProps) {
  const [expandedDocIndex, setExpandedDocIndex] = useState(0)
  const docs = question.documents ?? []
  const essayValue = responses.essay ?? ''

  const toggleDoc = (idx: number) => {
    setExpandedDocIndex(prev => (prev === idx ? -1 : idx))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Prompt card */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 16px',
          boxShadow: '0 0 24px rgba(99, 102, 241, 0.08)',
        }}
      >
        <span
          style={{
            background: 'linear-gradient(135deg, var(--accent), #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 700,
            marginRight: '8px',
          }}
        >
          DBQ
        </span>
        <span style={{ color: 'var(--text-primary)', fontSize: '14px', lineHeight: 1.6 }}>
          <InlineMath text={question.parts[0]?.prompt ?? question.title} />
        </span>
      </div>

      {/* Documents accordion */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {docs.map((doc, idx) => {
          const isExpanded = expandedDocIndex === idx
          return (
            <div
              key={doc.doc_number}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--bg-border)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              {/* Accordion header */}
              <button
                type="button"
                onClick={() => toggleDoc(idx)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: isExpanded ? 'rgba(99, 102, 241, 0.06)' : 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  transition: 'background 150ms ease',
                }}
              >
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: isExpanded ? 600 : 500,
                    color: isExpanded ? 'var(--accent-hover)' : 'var(--text-secondary)',
                  }}
                >
                  Document {doc.doc_number} — {doc.source}
                </span>
                <span
                  style={{
                    color: isExpanded ? 'var(--accent-hover)' : 'var(--text-muted)',
                    fontSize: '12px',
                    transition: 'color 150ms ease',
                  }}
                >
                  {isExpanded ? '▲' : '▼'}
                </span>
              </button>

              {/* Accordion content */}
              {isExpanded && (
                <div
                  style={{
                    borderTop: '1px solid var(--bg-border)',
                    padding: '12px 14px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                  }}
                >
                  {doc.image && (
                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '12px',
                        marginBottom: '10px',
                        border: '1px solid var(--bg-border)',
                      }}
                    >
                      <img
                        src={doc.image}
                        alt={`Document ${doc.doc_number}`}
                        style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                      />
                    </div>
                  )}
                  <p
                    style={{
                      margin: 0,
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.7,
                    }}
                  >
                    {doc.content}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Essay textarea */}
      <EssayTextarea
        value={essayValue}
        onChange={(v) => onResponseChange('essay', v)}
        minHeight={200}
      />

      {/* Full-width submit */}
      <button
        type="button"
        onClick={onSubmit}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, var(--accent), #7c3aed)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          fontWeight: 600,
          fontSize: '14px',
          border: 'none',
          cursor: 'pointer',
          transition: 'opacity 150ms ease, transform 150ms ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.9'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        Submit for Grading
      </button>
    </div>
  )
}

// ─── Shared button components ─────────────────────────────────────────────────

function GhostButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'transparent',
        color: hovered ? 'var(--text-primary)' : 'var(--text-secondary)',
        padding: '10px 20px',
        borderRadius: 'var(--radius-md)',
        fontSize: '14px',
        border: hovered ? '1px solid var(--accent)' : '1px solid var(--bg-border)',
        cursor: 'pointer',
        transition: 'border-color 150ms ease, color 150ms ease',
        fontWeight: 500,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  )
}

function GradientButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'linear-gradient(135deg, var(--accent), #7c3aed)',
        color: 'white',
        padding: '10px 20px',
        borderRadius: 'var(--radius-md)',
        fontWeight: 600,
        fontSize: '14px',
        border: 'none',
        cursor: 'pointer',
        transition: 'opacity 150ms ease, transform 150ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '0.9'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '1'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {children}
    </button>
  )
}

// ─── Root component — responsive switch ──────────────────────────────────────

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    setIsDesktop(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return isDesktop
}

export default function FRQDBQLayout(props: FRQDBQLayoutProps) {
  const isDesktop = useIsDesktop()
  return isDesktop ? <DesktopDBQ {...props} /> : <MobileDBQ {...props} />
}
