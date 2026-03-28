'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StudyGuide, ViewSection, getViewSections } from '@/utils/studyGuide'
import SidebarNav from '@/components/study-guide/SidebarNav'
import ThemeSection from '@/components/study-guide/sections/ThemeSection'
import CoreConceptsSection from '@/components/study-guide/sections/CoreConceptsSection'
import KeyTermsSection from '@/components/study-guide/sections/KeyTermsSection'
import FormulasSection from '@/components/study-guide/sections/FormulasSection'
import ExamTipSection from '@/components/study-guide/sections/ExamTipSection'

interface Props {
  guide: StudyGuide
  subject: string
  onBack: () => void
  keyTerms: { term: string; definition: string }[]
}

export default function StudyGuideReader({ guide, subject, onBack, keyTerms }: Props) {
  const router = useRouter()
  const sections = getViewSections(guide)
  const [activeSection, setActiveSection] = useState<ViewSection>(sections[0].key)

  const currentIndex = sections.findIndex(s => s.key === activeSection)
  const prevSection = currentIndex > 0 ? sections[currentIndex - 1] : null
  const nextSection = currentIndex < sections.length - 1 ? sections[currentIndex + 1] : null

  function handlePracticeNow() {
    router.push(`/${subject}/practice`)
  }

  function renderContent() {
    switch (activeSection) {
      case 'overview':
        return (
          <>
            <ThemeSection
              theme={guide.theme}
              conceptCount={guide.core_concepts.length}
            />
            <CoreConceptsSection concepts={guide.core_concepts} />
            <ExamTipSection tip={guide.exam_tip} />
          </>
        )
      case 'key_terms':
        return <KeyTermsSection terms={keyTerms} />
      case 'formulas':
        return <FormulasSection formulas={guide.formulas ?? []} />
      default:
        return null
    }
  }

  const sectionLabel = sections[currentIndex]?.label ?? ''

  return (
    <>
      <style>{`
        .sg-reader-layout { display: flex; gap: 0; min-height: calc(100dvh - 160px); }
        .sg-sidebar { display: block; }
        @media (max-width: 767px) {
          .sg-sidebar { display: none; }
          .sg-reading-pane { border-radius: var(--radius-lg) !important; border-left: 1px solid var(--bg-border) !important; }
        }
      `}</style>

      <div className="sg-reader-layout">
        <SidebarNav
          subject={subject}
          unitLabel={guide.unit}
          unitTitle={guide.theme.length > 55 ? guide.theme.slice(0, 55) + '…' : guide.theme}
          sections={sections}
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
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Content area */}
          <div style={{ flex: 1, padding: '32px 36px' }}>
            {/* Section eyebrow */}
            <div
              style={{
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--accent-hover)',
                marginBottom: '20px',
              }}
            >
              {sectionLabel}
            </div>

            {renderContent()}
          </div>

          {/* Footer navigation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 36px',
              borderTop: '1px solid var(--bg-border)',
            }}
          >
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {currentIndex + 1} of {sections.length} sections
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {prevSection && (
                <button
                  onClick={() => setActiveSection(prevSection.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'transparent',
                    border: '1px solid var(--bg-border)',
                    color: 'var(--text-secondary)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  ← {prevSection.label}
                </button>
              )}
              {nextSection && (
                <button
                  onClick={() => setActiveSection(nextSection.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'var(--accent)',
                    border: 'none',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {nextSection.label} →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
