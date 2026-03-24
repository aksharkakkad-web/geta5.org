# Phase 4: Study Guide Interface - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning
**Source:** User UI mockup selection (mockups/study-guide-mockup.html — Option B)

<domain>
## Phase Boundary

Build a per-unit study guide reader with sidebar navigation and reading pane layout. The study guide page shows structured AP content: theme, core concepts, key terms, formulas (KaTeX), and exam tips. Students select a unit, then navigate sections via a sticky sidebar while reading content in the main pane.

</domain>

<decisions>
## Implementation Decisions

### UI Layout — Option B: Sidebar + Reading Pane (LOCKED)
- Two-column layout: left sidebar (240px) with section navigation, right reading pane with content
- Unit selector grid at top (same pattern as drill/MCQ pages — UnitSelector component reuse)
- Sidebar is sticky with: unit label, unit title, section nav items (Central Theme, Core Concepts, Key Terms, Formulas/Diagrams, Exam Tip), and a "Practice Now" CTA button
- Active nav item highlighted with accent color background
- Reading pane pages through sections with Previous/Next navigation
- Sidebar collapses on mobile (responsive — reading pane goes full-width with section tabs or accordion)

### Content Structure (from PRD study guide schema)
- Each unit has: theme, core_concepts[], key_terms[], formulas[], exam_tip
- Theme: banner-style block with accent border
- Core concepts: list of name + description items
- Key terms: term + definition pairs
- Formulas: KaTeX-rendered mathematical expressions (NEVER plain text)
- Exam tip: highlighted callout box with warning accent color

### Navigation
- URL pattern: /[subject]/study-guide (parallel to /[subject]/drills and /[subject]/practice)
- Subject page needs a new card/link to Study Guide
- Back navigation to subject page

### Data Loading
- JSON files under /public/data/[subject]/study-guide/unit-[N].json
- Same Promise.allSettled pattern as MCQ/drill pages for unit fetching
- 404s silently become null (units not yet created)

### Claude's Discretion
- Exact responsive breakpoint for sidebar collapse
- Animation/transition choices for section switching
- Whether to show a progress indicator (sections read)
- Exact mobile layout (tabs vs accordion vs scroll)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `design-system/ascendly/MASTER.md` — UI tokens, component specs, colors, typography
- `mockups/study-guide-mockup.html` — Layout B reference mockup (the selected design)

### Data Schemas
- `docs/PRD.md` — Study guide JSON schema definition
- `data/schemas/` — JSON schema files (if present)

### Existing Patterns
- `app/[subject]/practice/page.tsx` — MCQ page orchestrator (unit selector + content pattern)
- `app/[subject]/drills/page.tsx` — Drill page orchestrator (same pattern)
- `components/drill/DrillSession.tsx` — Data loading pattern reference
- `utils/localStorage.ts` — Mastery data access

</canonical_refs>

<specifics>
## Specific Ideas

- Reuse UnitSelector component from drill/MCQ pages
- Score ring or mastery indicator per section could show study progress
- "Practice Now" button in sidebar links to /[subject]/practice?unit=N
- KaTeX must be imported and configured correctly — check existing KaTeX usage patterns

</specifics>

<deferred>
## Deferred Ideas

- Study progress tracking in localStorage (track which sections have been read) — nice-to-have, not in phase requirements
- Bookmarking or highlighting within study guides
- Search within study guide content

</deferred>

---

*Phase: 04-study-guide-interface*
*Context gathered: 2026-03-24 via user mockup selection*
