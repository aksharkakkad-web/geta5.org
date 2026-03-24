---
phase: 04-study-guide-interface
plan: "01"
subsystem: study-guide
tags: [study-guide, katex, inline-katex, sidebar, tdd]
dependency_graph:
  requires:
    - components/KatexRenderer.tsx
    - utils/subjects.ts
  provides:
    - utils/studyGuide.ts
    - components/study-guide/InlineKatex.tsx
    - components/study-guide/StudyGuideReader.tsx
    - components/study-guide/SidebarNav.tsx
    - components/study-guide/sections/ThemeSection.tsx
    - components/study-guide/sections/CoreConceptsSection.tsx
    - components/study-guide/sections/KeyTermsSection.tsx
    - components/study-guide/sections/FormulasSection.tsx
    - components/study-guide/sections/ExamTipSection.tsx
  affects:
    - app/[subject]/study-guide/ (Plan 02 wires these into page orchestrator)
tech_stack:
  added: []
  patterns:
    - InlineKatex $...$ delimiter splitting pattern (mirrors MCQ stimulus approach)
    - sg-reader-layout / sg-sidebar / sg-mobile-tabs CSS class responsive collapse
    - getVisibleSections filter for formulas when guide has none
key_files:
  created:
    - utils/studyGuide.ts
    - utils/__tests__/studyGuide.test.ts
    - components/study-guide/InlineKatex.tsx
    - components/study-guide/SidebarNav.tsx
    - components/study-guide/StudyGuideReader.tsx
    - components/study-guide/sections/ThemeSection.tsx
    - components/study-guide/sections/CoreConceptsSection.tsx
    - components/study-guide/sections/KeyTermsSection.tsx
    - components/study-guide/sections/FormulasSection.tsx
    - components/study-guide/sections/ExamTipSection.tsx
    - public/data/ap-psychology/study-guide/unit-1.json
  modified: []
decisions:
  - "InlineKatex uses /($[^$]+$)/g regex split — same $ delimiter pattern as study guide schema description"
  - "SidebarNav receives unitTitle as truncated theme string (60 chars) — Plan 02 can override with actual unit name from subjects.ts"
  - "StudyGuideReader initializes activeSection to visibleSections[0].key, not hardcoded 'theme' — handles guides without formulas cleanly"
metrics:
  duration: "4m 37s"
  completed_date: "2026-03-24"
  tasks_completed: 2
  files_created: 11
---

# Phase 4 Plan 01: Study Guide Components Summary

**One-liner:** Study guide reader with 5-section sidebar layout, InlineKatex $...$ parser, KaTeX display formulas, and responsive mobile tab collapse.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Types, InlineKatex, and fixture JSON | 30eb85e | utils/studyGuide.ts, InlineKatex.tsx, unit-1.json |
| 2 | Section components, SidebarNav, StudyGuideReader | 33e679d | 7 components |

## What Was Built

### Task 1: StudyGuide types + InlineKatex + fixture JSON (TDD)

**`utils/studyGuide.ts`** exports:
- `StudyGuide` interface matching the JSON schema exactly (formulas optional with `katex_string`)
- `StudyGuideSection` union type: `'theme' | 'core_concepts' | 'key_terms' | 'formulas' | 'exam_tip'`
- `SECTIONS` config array with 5 entries: Central Theme, Core Concepts, Key Terms, Formulas & Diagrams, Exam Tip
- `getVisibleSections(guide)` — filters out `formulas` when `guide.formulas` is undefined or empty
- `fetchStudyGuide(subject, unitNumber)` — fetches `/data/${subject}/study-guide/unit-${unitNumber}.json`, returns null on 404 or error

**`components/study-guide/InlineKatex.tsx`** — splits text on `$...$` delimiter regex, renders `<KatexRenderer displayMode={false}>` for math segments and `<span>` for plain text. Fast path for text with no `$` characters.

**`public/data/ap-psychology/study-guide/unit-1.json`** — AP Psychology Unit 1 (Biological Bases of Behavior) fixture JSON: 6 core concepts (2 with inline KaTeX for voltage values), 8 key terms, 2 formulas with KaTeX strings, exam tip.

**12 TDD tests** covering all type contracts, SECTIONS config, fetchStudyGuide 404/throw/success, and getVisibleSections filtering.

### Task 2: Section components + SidebarNav + StudyGuideReader

Five section components (all `'use client'`):
- **ThemeSection**: accent gradient banner with InlineKatex
- **CoreConceptsSection**: numbered list with accent bullet numbers and InlineKatex per concept
- **KeyTermsSection**: responsive 2-column grid (`sg-term-grid`) — term name in accent-hover, definition via InlineKatex
- **FormulasSection**: KaTeX display-mode block per formula (centered), formula name label above
- **ExamTipSection**: warning callout with AlertTriangle icon, "EXAM TIP" label, InlineKatex for tip text

**SidebarNav**: 240px sticky sidebar (top: 80px), section nav with accent `color-mix` active state, lucide-react section icons (Lightbulb/Target/BookOpen/Calculator/AlertTriangle), "Practice Now" CTA button.

**StudyGuideReader**: Two-column flex layout with `sg-reader-layout` class. Manages `activeSection` state initialized to first visible section. Renders sidebar + reading pane. Section header shows icon + label. Previous/Next navigation at bottom of reading pane. Mobile responsive: below 768px, `sg-sidebar` hides and `sg-mobile-tabs` horizontal scrollable tab bar appears.

## Verification Results

- `npx tsc --noEmit`: Zero errors
- `npx jest utils/__tests__/studyGuide.test.ts --no-coverage`: 12/12 tests pass
- All section files exist in `components/study-guide/sections/`
- All acceptance criteria met

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all components render real content from the `StudyGuide` prop. Fixture JSON provides real AP Psychology content. Plan 02 wires these into the page orchestrator with unit selection.

## Self-Check: PASSED

Files verified:
- utils/studyGuide.ts: FOUND
- components/study-guide/InlineKatex.tsx: FOUND
- components/study-guide/StudyGuideReader.tsx: FOUND
- components/study-guide/SidebarNav.tsx: FOUND
- components/study-guide/sections/ThemeSection.tsx: FOUND
- components/study-guide/sections/CoreConceptsSection.tsx: FOUND
- components/study-guide/sections/KeyTermsSection.tsx: FOUND
- components/study-guide/sections/FormulasSection.tsx: FOUND
- components/study-guide/sections/ExamTipSection.tsx: FOUND
- public/data/ap-psychology/study-guide/unit-1.json: FOUND

Commits verified:
- 882810b (RED test commit): FOUND
- 30eb85e (GREEN feat commit): FOUND
- 33e679d (Task 2 feat commit): FOUND
