'use client'
import { Lightbulb, Target, BookOpen, Calculator, AlertTriangle } from 'lucide-react'
import { SECTIONS, StudyGuideSection } from '@/utils/studyGuide'

const SECTION_ICONS: Record<StudyGuideSection, React.ReactNode> = {
  theme: <Lightbulb size={14} />,
  core_concepts: <Target size={14} />,
  key_terms: <BookOpen size={14} />,
  formulas: <Calculator size={14} />,
  exam_tip: <AlertTriangle size={14} />,
}

interface Props {
  subject: string
  unitLabel: string
  unitTitle: string
  sections: typeof SECTIONS
  activeSection: StudyGuideSection
  onSectionChange: (section: StudyGuideSection) => void
  onPracticeNow: () => void
}

export default function SidebarNav({
  unitLabel,
  unitTitle,
  sections,
  activeSection,
  onSectionChange,
  onPracticeNow,
}: Props) {
  return (
    <div
      className="sg-sidebar"
      style={{
        width: '240px',
        flexShrink: 0,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-lg) 0 0 var(--radius-lg)',
        padding: '20px 16px',
        position: 'sticky',
        top: '80px',
        height: 'fit-content',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          marginBottom: '8px',
        }}
      >
        {unitLabel}
      </div>
      <div
        style={{
          fontSize: '14px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--bg-border)',
        }}
      >
        {unitTitle}
      </div>

      {/* Section nav items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {sections.map(section => {
          const isActive = section.key === activeSection
          return (
            <button
              key={section.key}
              onClick={() => onSectionChange(section.key)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: isActive ? 'var(--accent-hover)' : 'var(--text-secondary)',
                background: isActive
                  ? 'color-mix(in srgb, var(--accent) 10%, transparent)'
                  : 'transparent',
                fontWeight: isActive ? 600 : 400,
                border: 'none',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'currentColor',
                  flexShrink: 0,
                }}
              />
              {SECTION_ICONS[section.key]}
              {section.label}
            </button>
          )
        })}
      </nav>

      {/* Practice Now CTA */}
      <div
        style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid var(--bg-border)',
        }}
      >
        <button
          onClick={onPracticeNow}
          style={{
            width: '100%',
            background: 'var(--accent)',
            color: 'white',
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 600,
            textAlign: 'center',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Practice Now
        </button>
      </div>
    </div>
  )
}
