'use client'

import { useState } from 'react'
import { FlaskConical, X } from 'lucide-react'
import ChemReferenceSheet from './ChemReferenceSheet'
import ChemPeriodicTable from './ChemPeriodicTable'
import ChemReductionPotentials from './ChemReductionPotentials'
import ChemConstants from './ChemConstants'
import CSPReferenceSheet from './CSPReferenceSheet'

const CHEM_TABS = ['Formulas', 'Periodic Table', 'Reduction Potentials', 'Constants'] as const
type ChemTab = typeof CHEM_TABS[number]

interface Props {
  subject: string
}

export default function ReferenceSheetModal({ subject }: Props) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<ChemTab>('Formulas')

  const isChem = subject === 'ap-chemistry'
  const isCSP = subject === 'ap-computer-science-principles'
  const title = isChem ? 'AP Chemistry Reference Sheet' : 'AP CSP Reference'
  const isPeriodicTable = isChem && activeTab === 'Periodic Table'

  if (!isChem && !isCSP) return null

  return (
    <>
      {/* Floating trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: '104px',
          right: '24px',
          zIndex: 100,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          borderRadius: '999px',
          background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
          border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
          color: 'var(--accent)',
          fontSize: '0.875rem',
          fontWeight: 600,
          fontFamily: 'var(--font-outfit)',
          cursor: 'pointer',
          letterSpacing: '0.01em',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          transition: 'background 150ms ease, border-color 150ms ease',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLButtonElement
          el.style.background = 'color-mix(in srgb, var(--accent) 25%, transparent)'
          el.style.borderColor = 'color-mix(in srgb, var(--accent) 50%, transparent)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLButtonElement
          el.style.background = 'color-mix(in srgb, var(--accent) 15%, transparent)'
          el.style.borderColor = 'color-mix(in srgb, var(--accent) 30%, transparent)'
        }}
      >
        <FlaskConical size={15} />
        Reference
      </button>

      {/* Modal overlay */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.72)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 300,
            }}
          />

          {/* Modal box */}
          <div
            style={{
              position: 'fixed',
              top: '5vh',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'min(96vw, 980px)',
              height: '90vh',
              background: 'var(--bg-card)',
              border: '1px solid var(--bg-border)',
              borderRadius: '16px',
              zIndex: 301,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: '1px solid var(--bg-border)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FlaskConical size={16} style={{ color: 'var(--accent)' }} />
                <span style={{
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-outfit)',
                  color: 'var(--text-primary)',
                }}>
                  {title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close reference sheet"
                style={{
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'color 150ms ease, background 150ms ease',
                  flexShrink: 0,
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.color = 'var(--text-primary)'
                  el.style.background = 'var(--bg-border)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.color = 'var(--text-muted)'
                  el.style.background = 'transparent'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Tab bar (chem only) */}
            {isChem && (
              <div style={{
                display: 'flex',
                padding: '0 16px',
                borderBottom: '1px solid var(--bg-border)',
                flexShrink: 0,
                overflowX: 'auto',
                gap: '2px',
              }}>
                {CHEM_TABS.map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '9px 13px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      fontFamily: 'var(--font-outfit)',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.01em',
                      color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
                      borderBottom: activeTab === tab
                        ? '2px solid var(--accent)'
                        : '2px solid transparent',
                      transition: 'color 150ms ease, border-color 150ms ease',
                      marginBottom: '-1px',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}

            {/* Content */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: isPeriodicTable ? 'auto' : 'hidden',
                padding: '20px 24px',
              }}
            >
              {isCSP && <CSPReferenceSheet />}
              {isChem && activeTab === 'Formulas' && <ChemReferenceSheet />}
              {isChem && activeTab === 'Periodic Table' && <ChemPeriodicTable />}
              {isChem && activeTab === 'Reduction Potentials' && <ChemReductionPotentials />}
              {isChem && activeTab === 'Constants' && <ChemConstants />}
            </div>
          </div>
        </>
      )}
    </>
  )
}
