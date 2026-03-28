'use client'
import { ViewSection } from '@/utils/studyGuide'

const NAV_ICONS: Record<ViewSection, React.ReactNode> = {
  overview: (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6" /><path d="M8 5v3l2 2" />
    </svg>
  ),
  key_terms: (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="12" height="12" rx="2" /><path d="M5 5h6M5 8h6M5 11h4" />
    </svg>
  ),
  formulas: (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 13l3-10 2 6 2-3 3 3" />
    </svg>
  ),
}

interface Section { key: ViewSection; label: string }

interface Props {
  subject: string
  unitLabel: string
  unitTitle: string
  sections: Section[]
  activeSection: ViewSection
  totalSections: number
  onSectionChange: (section: ViewSection) => void
  onPracticeNow: () => void
}

export default function SidebarNav({
  unitLabel,
  unitTitle,
  sections,
  activeSection,
  totalSections,
  onSectionChange,
  onPracticeNow,
}: Props) {
  const currentIndex = sections.findIndex(s => s.key === activeSection)
  const progressPct = Math.round(((currentIndex + 1) / totalSections) * 100)

  return (
    <div
      className="sg-sidebar"
      style={{
        width: '210px',
        flexShrink: 0,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-lg) 0 0 var(--radius-lg)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: '80px',
        height: 'fit-content',
      }}
    >
      <div
        style={{
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: '6px',
        }}
      >
        {unitLabel}
      </div>
      <div
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          lineHeight: '1.45',
          marginBottom: '24px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--bg-border)',
        }}
      >
        {unitTitle}
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {sections.map(section => {
          const isActive = section.key === activeSection
          return (
            <button
              key={section.key}
              onClick={() => onSectionChange(section.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 10px',
                borderRadius: '8px',
                fontSize: '13px',
                cursor: 'pointer',
                color: isActive ? 'var(--accent-hover)' : 'var(--text-secondary)',
                background: isActive
                  ? 'color-mix(in srgb, var(--accent) 10%, transparent)'
                  : 'transparent',
                fontWeight: isActive ? 500 : 400,
                border: 'none',
                textAlign: 'left',
                width: '100%',
                fontFamily: 'inherit',
              }}
            >
              <span style={{ opacity: isActive ? 1 : 0.6, flexShrink: 0 }}>
                {NAV_ICONS[section.key]}
              </span>
              {section.label}
            </button>
          )
        })}
      </nav>

      {/* Progress + CTA */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '20px',
          borderTop: '1px solid var(--bg-border)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              color: 'var(--text-muted)',
            }}
          >
            Progress
          </span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--accent-hover)',
            }}
          >
            {progressPct}%
          </span>
        </div>
        <div
          style={{
            height: '3px',
            background: 'var(--bg-border)',
            borderRadius: '2px',
            overflow: 'hidden',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPct}%`,
              background: 'var(--accent)',
              borderRadius: '2px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <button
          onClick={onPracticeNow}
          style={{
            width: '100%',
            background: 'var(--accent)',
            color: 'white',
            padding: '10px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Practice Now
        </button>
      </div>
    </div>
  )
}
