'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lightbulb, Target, BookOpen, Calculator, AlertTriangle } from 'lucide-react'
import { StudyGuide, StudyGuideSection, getVisibleSections } from '@/utils/studyGuide'
import SidebarNav from '@/components/study-guide/SidebarNav'
import ThemeSection from '@/components/study-guide/sections/ThemeSection'
import CoreConceptsSection from '@/components/study-guide/sections/CoreConceptsSection'
import KeyTermsSection from '@/components/study-guide/sections/KeyTermsSection'
import FormulasSection from '@/components/study-guide/sections/FormulasSection'
import ExamTipSection from '@/components/study-guide/sections/ExamTipSection'

const SECTION_ICONS: Record<StudyGuideSection, React.ReactNode> = {
  theme: <Lightbulb size={16} />,
  core_concepts: <Target size={16} />,
  key_terms: <BookOpen size={16} />,
  formulas: <Calculator size={16} />,
  exam_tip: <AlertTriangle size={16} />,
}

interface Props {
  guide: StudyGuide
  subject: string
  onBack: () => void
  keyTerms: { term: string; definition: string }[]
}

export default function StudyGuideReader({ guide, subject, onBack, keyTerms }: Props) {
  const router = useRouter()
  const visibleSections = getVisibleSections(guide)
  const [activeSection, setActiveSection] = useState<StudyGuideSection>(visibleSections[0].key)

  const currentIndex = visibleSections.findIndex(s => s.key === activeSection)
  const prevSection = currentIndex > 0 ? visibleSections[currentIndex - 1] : null
  const nextSection = currentIndex < visibleSections.length - 1 ? visibleSections[currentIndex + 1] : null
  const activeLabel = visibleSections[currentIndex]?.label ?? ''

  function handlePracticeNow() {
    router.push(`/${subject}/practice`)
  }

  function renderSection() {
    switch (activeSection) {
      case 'theme':
        return <ThemeSection theme={guide.theme} />
      case 'core_concepts':
        return <CoreConceptsSection concepts={guide.core_concepts} />
      case 'key_terms':
        return <KeyTermsSection terms={keyTerms} />
      case 'formulas':
        return <FormulasSection formulas={guide.formulas ?? []} />
      case 'exam_tip':
        return <ExamTipSection tip={guide.exam_tip} />
      default:
        return null
    }
  }

  return (
    <>
      <style>{`
        .sg-reader-layout { display: flex; gap: 0; min-height: calc(100dvh - 160px); }
        .sg-sidebar { display: block; }
        .sg-mobile-tabs { display: none; overflow-x: auto; gap: 4px; padding: 0 0 8px 0; }
        @media (max-width: 767px) {
          .sg-sidebar { display: none; }
          .sg-mobile-tabs { display: flex; }
          .sg-reading-pane { border-radius: var(--radius-lg); border-left: 1px solid var(--bg-border); }
        }
      `}</style>

      {/* Mobile tabs */}
      <div className="sg-mobile-tabs">
        {visibleSections.map(section => {
          const isActive = section.key === activeSection
          return (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '12px',
                fontWeight: isActive ? 600 : 400,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                border: 'none',
                background: isActive
                  ? 'color-mix(in srgb, var(--accent) 10%, transparent)'
                  : 'transparent',
                color: isActive ? 'var(--accent-hover)' : 'var(--text-secondary)',
              }}
            >
              {section.label}
            </button>
          )
        })}
      </div>

      {/* Main layout */}
      <div className="sg-reader-layout">
        <SidebarNav
          subject={subject}
          unitLabel={guide.unit}
          unitTitle={guide.theme.length > 60 ? guide.theme.slice(0, 60) + '…' : guide.theme}
          sections={visibleSections}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onPracticeNow={handlePracticeNow}
        />

        {/* Reading pane */}
        <div
          className="sg-reading-pane"
          style={{
            flex: 1,
            background: 'var(--bg-card)',
            border: '1px solid var(--bg-border)',
            borderLeft: 'none',
            borderRadius: '0 var(--radius-lg) var(--radius-lg) 0',
            padding: '28px 32px',
          }}
        >
          {/* Section header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            <span style={{ color: 'var(--accent)' }}>
              {SECTION_ICONS[activeSection]}
            </span>
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              {activeLabel}
            </h3>
          </div>

          {/* Section content */}
          {renderSection()}

          {/* Previous / Next navigation */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '28px',
              paddingTop: '24px',
              borderTop: '1px solid var(--bg-border)',
            }}
          >
            {prevSection && (
              <button
                onClick={() => setActiveSection(prevSection.key)}
                style={{
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  padding: '12px 24px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '15px',
                  fontWeight: 600,
                  border: '1px solid var(--bg-border)',
                  cursor: 'pointer',
                }}
              >
                &larr; {prevSection.label}
              </button>
            )}
            {nextSection && (
              <button
                onClick={() => setActiveSection(nextSection.key)}
                style={{
                  background: 'var(--accent)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '15px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  marginLeft: prevSection ? 'auto' : undefined,
                }}
              >
                {nextSection.label} &rarr;
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
