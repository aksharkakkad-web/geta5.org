# Study Guide Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the study guide reader into a clean, sleek two-section layout (Overview + Key Terms) with collapsible core concepts, eliminating visual clutter.

**Architecture:** Replace the 5-tab section model with a 2–3 section model: Overview (theme + core concepts accordion + exam tip stacked) and Key Terms grid, plus Formulas tab for math subjects. No content JSON is modified — only presentation components change.

**Tech Stack:** React, TypeScript, Next.js App Router, CSS custom properties (no Tailwind changes needed)

---

## File Map

| File | Change |
|------|--------|
| `utils/studyGuide.ts` | Add `ViewSection` type + `getViewSections()` helper |
| `components/study-guide/StudyGuideReader.tsx` | Full rewrite — new layout, no mobile tab bar, footer nav |
| `components/study-guide/SidebarNav.tsx` | Restyle — SVG icons, progress %, cleaner nav items |
| `components/study-guide/sections/ThemeSection.tsx` | Redesign — left accent border, kicker, concept count metadata |
| `components/study-guide/sections/CoreConceptsSection.tsx` | Redesign — accordion with expand/collapse per item |
| `components/study-guide/sections/KeyTermsSection.tsx` | Polish — slightly larger text, better padding |
| `components/study-guide/sections/ExamTipSection.tsx` | Minor polish only |

`app/[subject]/study-guide/page.tsx` — **no changes needed** (props to StudyGuideReader are unchanged).

---

### Task 1: Add ViewSection type to utils/studyGuide.ts

**Files:**
- Modify: `utils/studyGuide.ts`

- [ ] **Step 1: Add the new type and helper after the existing `getVisibleSections` function**

In `utils/studyGuide.ts`, add after line 32:

```ts
export type ViewSection = 'overview' | 'key_terms' | 'formulas'

export const VIEW_SECTIONS: { key: ViewSection; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'key_terms', label: 'Key Terms' },
  { key: 'formulas', label: 'Formulas' },
]

export function getViewSections(guide: StudyGuide): { key: ViewSection; label: string }[] {
  return VIEW_SECTIONS.filter(s => {
    if (s.key === 'formulas') return (guide.formulas?.length ?? 0) > 0
    return true
  })
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors related to studyGuide.ts

- [ ] **Step 3: Commit**

```bash
git add utils/studyGuide.ts
git commit -m "feat(study-guide): add ViewSection type and getViewSections helper"
```

---

### Task 2: Redesign ThemeSection

**Files:**
- Modify: `components/study-guide/sections/ThemeSection.tsx`

The new design: left accent border, "Central Theme" kicker, theme text, inline metadata row showing concept count.

- [ ] **Step 1: Replace ThemeSection.tsx**

```tsx
'use client'
import InlineKatex from '@/components/study-guide/InlineKatex'

interface Props {
  theme: string
  conceptCount: number
}

export default function ThemeSection({ theme, conceptCount }: Props) {
  return (
    <div
      style={{
        borderLeft: '2px solid var(--accent)',
        paddingLeft: '20px',
        marginBottom: '32px',
      }}
    >
      <div
        style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--accent-hover)',
          marginBottom: '10px',
        }}
      >
        Central Theme
      </div>
      <div
        style={{
          fontSize: '15px',
          fontWeight: 500,
          color: 'var(--text-primary)',
          lineHeight: '1.75',
        }}
      >
        <InlineKatex text={theme} />
      </div>
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginTop: '14px',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}
        >
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{conceptCount}</span>{' '}
          core concepts
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: error on ThemeSection usage in StudyGuideReader.tsx — it now requires `conceptCount`. That's expected; will be fixed in Task 4.

- [ ] **Step 3: Commit**

```bash
git add components/study-guide/sections/ThemeSection.tsx
git commit -m "feat(study-guide): redesign ThemeSection — accent border, kicker, concept count"
```

---

### Task 3: Redesign CoreConceptsSection to accordion

**Files:**
- Modify: `components/study-guide/sections/CoreConceptsSection.tsx`

Each concept's title is derived by taking the first sentence up to the first comma or period (max 60 chars) as the preview, with the full text shown when expanded.

- [ ] **Step 1: Replace CoreConceptsSection.tsx**

```tsx
'use client'
import { useState } from 'react'
import InlineKatex from '@/components/study-guide/InlineKatex'

interface Props {
  concepts: string[]
}

function getPreview(text: string): string {
  const match = text.match(/^[^.—–,]{1,60}/)
  return match ? match[0].trimEnd() : text.slice(0, 60)
}

export default function CoreConceptsSection({ concepts }: Props) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]))

  function toggle(idx: number) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          Core Concepts
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {concepts.length} total
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '28px' }}>
        {concepts.map((concept, idx) => {
          const isOpen = expanded.has(idx)
          return (
            <div
              key={idx}
              onClick={() => toggle(idx)}
              style={{
                borderRadius: '8px',
                overflow: 'hidden',
                border: `1px solid ${isOpen ? 'var(--bg-card-hover)' : 'var(--bg-border)'}`,
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
            >
              {/* Trigger row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderBottom: isOpen ? '1px solid var(--bg-border)' : 'none',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: isOpen ? 'var(--accent-hover)' : 'var(--text-muted)',
                    flexShrink: 0,
                    width: '18px',
                  }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span
                  style={{
                    flex: 1,
                    fontSize: '13px',
                    fontWeight: 500,
                    color: isOpen ? 'var(--text-primary)' : 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {getPreview(concept)}
                </span>
                {/* Chevron */}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  style={{
                    flexShrink: 0,
                    color: isOpen ? 'var(--accent-hover)' : 'var(--text-muted)',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <path d="M3 5l4 4 4-4" />
                </svg>
              </div>

              {/* Body */}
              {isOpen && (
                <div
                  style={{
                    padding: '10px 16px 13px 46px',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.7',
                  }}
                >
                  <InlineKatex text={concept} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors in CoreConceptsSection.tsx

- [ ] **Step 3: Commit**

```bash
git add components/study-guide/sections/CoreConceptsSection.tsx
git commit -m "feat(study-guide): redesign CoreConceptsSection as collapsible accordion"
```

---

### Task 4: Polish ExamTipSection and KeyTermsSection

**Files:**
- Modify: `components/study-guide/sections/ExamTipSection.tsx`
- Modify: `components/study-guide/sections/KeyTermsSection.tsx`

Minor updates only — cleaner spacing, slightly more breathing room.

- [ ] **Step 1: Update ExamTipSection.tsx — add sub-header above, tighten styling**

```tsx
'use client'
import InlineKatex from '@/components/study-guide/InlineKatex'

interface Props {
  tip: string
}

export default function ExamTipSection({ tip }: Props) {
  return (
    <>
      {/* Sub-header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            whiteSpace: 'nowrap',
          }}
        >
          Exam Tip
        </span>
        <div style={{ flex: 1, height: '1px', background: 'var(--bg-border)' }} />
      </div>

      {/* Tip card */}
      <div
        style={{
          background: 'color-mix(in srgb, var(--accent-warning) 7%, transparent)',
          border: '1px solid color-mix(in srgb, var(--accent-warning) 18%, transparent)',
          borderRadius: '8px',
          padding: '16px 18px',
          display: 'flex',
          gap: '14px',
          alignItems: 'flex-start',
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          style={{ color: 'var(--accent-warning)', flexShrink: 0, marginTop: '2px' }}
        >
          <path d="M8 2L14 13H2L8 2z" />
          <path d="M8 7v3" />
          <circle cx="8" cy="11.5" r="0.5" fill="currentColor" />
        </svg>
        <div>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--accent-warning)',
              marginBottom: '6px',
            }}
          >
            Exam Tip
          </div>
          <div
            style={{
              fontSize: '13px',
              color: 'var(--text-primary)',
              lineHeight: '1.7',
              opacity: 0.9,
            }}
          >
            <InlineKatex text={tip} />
          </div>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Update KeyTermsSection.tsx — larger text, better padding, cleaner card**

```tsx
'use client'
import InlineKatex from '@/components/study-guide/InlineKatex'

interface Props {
  terms: { term: string; definition: string }[]
}

export default function KeyTermsSection({ terms }: Props) {
  return (
    <>
      <style>{`
        .sg-term-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        @media (max-width: 639px) {
          .sg-term-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="sg-term-grid">
        {terms.map((item, idx) => (
          <div
            key={idx}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--bg-border)',
              borderRadius: '8px',
              padding: '14px 16px',
            }}
          >
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '6px',
              }}
            >
              {item.term}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
              }}
            >
              <InlineKatex text={item.definition} />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors in these two files

- [ ] **Step 4: Commit**

```bash
git add components/study-guide/sections/ExamTipSection.tsx components/study-guide/sections/KeyTermsSection.tsx
git commit -m "feat(study-guide): polish ExamTipSection and KeyTermsSection typography"
```

---

### Task 5: Redesign SidebarNav

**Files:**
- Modify: `components/study-guide/SidebarNav.tsx`

Replace the old `StudyGuideSection`-based nav with the new `ViewSection`-based nav. Add SVG icons, progress % label, cleaner styling.

- [ ] **Step 1: Replace SidebarNav.tsx**

```tsx
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: errors in StudyGuideReader.tsx (wrong props passed to SidebarNav) — will be fixed in Task 6.

- [ ] **Step 3: Commit**

```bash
git add components/study-guide/SidebarNav.tsx
git commit -m "feat(study-guide): redesign SidebarNav — SVG icons, progress %, ViewSection type"
```

---

### Task 6: Rewrite StudyGuideReader

**Files:**
- Modify: `components/study-guide/StudyGuideReader.tsx`

This is the main orchestration component. New layout: sidebar + reading pane, no mobile tab strip at top, Overview renders ThemeSection + CoreConceptsSection + ExamTipSection stacked, footer with prev/next section navigation.

- [ ] **Step 1: Replace StudyGuideReader.tsx**

```tsx
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
          totalSections={sections.length}
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
```

- [ ] **Step 2: Verify TypeScript compiles with zero errors**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Run dev server and visually verify**

```bash
npm run dev
```
Navigate to any subject → Study Guide → select a unit. Check:
- Sidebar shows "Overview" and "Key Terms" (+ "Formulas" for math subjects)
- Overview section shows theme (left border), concepts accordion, exam tip stacked
- First concept is expanded by default; clicking toggles others
- Footer shows "1 of 2 sections" with Next → button
- Key Terms tab shows the term grid

- [ ] **Step 4: Commit**

```bash
git add components/study-guide/StudyGuideReader.tsx
git commit -m "feat(study-guide): rewrite reader — Overview tab merges theme/concepts/tip, clean footer nav"
```

---

### Task 7: Screenshot loop verification

- [ ] **Step 1: Trigger screenshot loop**

Say: "UI work is done. Please paste a screenshot so I can verify it looks correct before marking this complete."

- [ ] **Step 2: Verify in screenshot**
  - Sidebar: clean nav items, SVG icons, progress bar with %, Practice Now CTA
  - Overview: accent border left on theme, kicker label, concept count metadata
  - Concepts: numbered accordion rows, first one open, chevron arrow
  - Exam Tip: appears below accordion with sub-header divider
  - Key Terms: 2-column grid with clean card typography
  - Footer: "1 of 2 sections" + Next button
  - No visual clutter or emoji icons

- [ ] **Step 3: If screenshot looks good — final commit**

```bash
git add -A
git commit -m "feat(study-guide): complete visual redesign — sleek layout, accordion concepts, clean sections"
```
