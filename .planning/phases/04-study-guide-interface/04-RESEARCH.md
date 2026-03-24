# Phase 4: Study Guide Interface - Research

**Researched:** 2026-03-24
**Domain:** React content reader with two-column layout, KaTeX rendering, JSON data loading
**Confidence:** HIGH

## Summary

Phase 4 builds a study guide reader page at `/[subject]/study-guide`. The user chose Option B (Sidebar + Reading Pane) from the mockup. The page follows the same three-tier architecture as drill/MCQ pages: unit selector grid at top, then a two-column layout with a sticky sidebar for section navigation and a reading pane for content. Content is loaded from `/public/data/[subject]/study-guide/unit-[N].json` using the established Promise.allSettled pattern.

The core technical challenges are: (1) parsing inline KaTeX delimiters (`$...$`) embedded in text fields and rendering them through the existing `KatexRenderer` component, (2) building the two-column sidebar layout with responsive collapse on mobile, and (3) rendering the 5 study guide sections (theme, core concepts, key terms, formulas, exam tip) with appropriate styling from the mockup.

**Primary recommendation:** Build a single `StudyGuideReader` component that manages section state, with a shared `StudyGunitSelector` (simplified from existing UnitSelector pattern -- no "Study All", just unit chips). Reuse `KatexRenderer` for display-mode formulas; build a lightweight `InlineKatex` parser for `$...$` delimited text in definitions, concepts, and exam tips.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **UI Layout -- Option B: Sidebar + Reading Pane (LOCKED):** Two-column layout: left sidebar (240px) with section navigation, right reading pane with content
- Unit selector grid at top (same pattern as drill/MCQ pages)
- Sidebar is sticky with: unit label, unit title, section nav items (Central Theme, Core Concepts, Key Terms, Formulas/Diagrams, Exam Tip), and a "Practice Now" CTA button
- Active nav item highlighted with accent color background
- Reading pane pages through sections with Previous/Next navigation
- Sidebar collapses on mobile (responsive -- reading pane goes full-width)
- Content structure: theme, core_concepts[], key_terms[], formulas[], exam_tip
- URL pattern: /[subject]/study-guide
- JSON files under /public/data/[subject]/study-guide/unit-[N].json
- Same Promise.allSettled pattern as MCQ/drill pages for unit fetching

### Claude's Discretion
- Exact responsive breakpoint for sidebar collapse
- Animation/transition choices for section switching
- Whether to show a progress indicator (sections read)
- Exact mobile layout (tabs vs accordion vs scroll)

### Deferred Ideas (OUT OF SCOPE)
- Study progress tracking in localStorage (track which sections have been read)
- Bookmarking or highlighting within study guides
- Search within study guide content
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| GUIDE-01 | Study guide per unit: theme -> core concepts -> key terms -> formulas -> exam tip | JSON schema verified, 5 section types mapped to rendering components, mockup CSS patterns extracted |
| GUIDE-02 | KaTeX rendering for all formulas | Existing `KatexRenderer` component handles display-mode formulas; need inline `$...$` parser for text fields |
| GUIDE-03 | Unit selector navigation within subject | Existing UnitSelector pattern from drill/MCQ pages -- simplified version (no session start, just unit selection) |
| GUIDE-04 | Supabase study_guide_view event logged | `logEvent()` from `utils/analytics.ts` -- fire-and-forget pattern established |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **KaTeX always:** NEVER render formulas as plain text -- KaTeX always (Critical Rule #1)
- **Screenshot loop:** NEVER skip -- must verify UI visually before marking complete (Critical Rule #2)
- **Supabase fire-and-forget:** NEVER block UI on Supabase (Critical Rule #6)
- **CSS custom properties:** No hardcoded hex values -- always use `var(--*)` tokens
- **Lucide React icons:** No emojis as icons in the actual implementation
- **Design system:** Read `design-system/ascendly/MASTER.md` before building UI (no page-specific override exists)
- **Workflow:** Planner -> Coder -> Reviewer -> Tester pipeline enforced
- **Tailwind v4:** Configuration via `@theme` in globals.css, no tailwind.config.ts

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | ^16.2.1 | App Router, file-based routing | Already the project framework |
| React | ^19.2.4 | Component model | Already installed |
| KaTeX | ^0.16.40 | Math rendering (display + inline) | Already installed, existing KatexRenderer component |
| lucide-react | ^0.577.0 | Icons (BookMarked, ChevronLeft, ChevronRight, etc.) | Already installed, project standard |

### Supporting (no new dependencies needed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| utils/analytics.ts | N/A | `logEvent()` for study_guide_view event | On unit load |
| utils/subjects.ts | N/A | `getSubject()` for unit list/names | Unit selector rendering |
| utils/localStorage.ts | N/A | `lsGet`/`LS_KEYS.mastery()` for mastery bars | Unit selector mastery display |
| components/KatexRenderer.tsx | N/A | Block-mode KaTeX rendering | Formula section items |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom `$...$` parser | react-katex or rehype-katex | Adding a dependency for a ~20-line regex split is overkill; custom parser matches existing codebase patterns |

**Installation:** No new packages needed. All dependencies already installed.

## Architecture Patterns

### Recommended Project Structure
```
app/[subject]/study-guide/
  page.tsx              # Page orchestrator (client component)
components/study-guide/
  StudyGuideUnitSelector.tsx   # Simplified unit grid (no "Study All", no session start)
  StudyGuideReader.tsx         # Sidebar + reading pane layout
  SidebarNav.tsx               # Sticky sidebar with section nav
  sections/
    ThemeSection.tsx            # Theme banner rendering
    CoreConceptsSection.tsx     # Concept list
    KeyTermsSection.tsx         # Term-definition grid
    FormulasSection.tsx         # KaTeX block formulas
    ExamTipSection.tsx          # Warning callout
  InlineKatex.tsx              # Parses $...$ in text, renders mixed text+KaTeX
```

### Pattern 1: Page Orchestrator (3-view state machine)
**What:** The study guide page is simpler than drill/MCQ -- only 2 states: `unit-select` and `reading`.
**When to use:** Page-level view switching.
**Example:**
```typescript
// Follows exact pattern from app/[subject]/practice/page.tsx
type StudyGuideView = 'unit-select' | 'reading'
const [view, setView] = useState<StudyGuideView>('unit-select')
const [selectedUnit, setSelectedUnit] = useState<number | null>(null)
const [guideData, setGuideData] = useState<StudyGuide | null>(null)
```

### Pattern 2: Simplified Unit Selector (no session, just selection)
**What:** Unlike drill/MCQ UnitSelector which loads ALL unit data upfront and starts a session, the study guide version only needs to know which units have data available (existence check), then loads a single unit on selection.
**When to use:** Study guide unit selection.
**Key difference from existing UnitSelector:** Does not need to load all JSON data upfront. Fetch individual unit JSON on selection instead. Use lighter existence checks (HEAD requests or fetch the selected unit only).

### Pattern 3: Sidebar Section Navigation
**What:** Sections are an enum: `['theme', 'core_concepts', 'key_terms', 'formulas', 'exam_tip']`. Active section tracked in state. Sidebar nav items map to section keys.
**When to use:** Sidebar + reading pane layout.
**Example:**
```typescript
const SECTIONS = [
  { key: 'theme', label: 'Central Theme', icon: Lightbulb },
  { key: 'core_concepts', label: 'Core Concepts', icon: Target },
  { key: 'key_terms', label: 'Key Terms', icon: BookOpen },
  { key: 'formulas', label: 'Formulas & Diagrams', icon: Calculator },
  { key: 'exam_tip', label: 'Exam Tip', icon: AlertTriangle },
] as const
```

### Pattern 4: Inline KaTeX Parser
**What:** Study guide text fields (definitions, core concepts, exam_tip) contain inline `$...$` delimiters. Need a parser to split text into segments and render KaTeX inline.
**When to use:** Any text field that may contain inline math.
**Example:**
```typescript
// InlineKatex component
function InlineKatex({ text }: { text: string }) {
  // Split on $...$ delimiters
  const parts = text.split(/(\$[^$]+\$)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const formula = part.slice(1, -1)
          return <KatexRenderer key={i} formula={formula} displayMode={false} />
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}
```

### Pattern 5: Responsive Sidebar Collapse
**What:** Sidebar visible at >= 768px (tablet+). Below 768px, sidebar collapses -- section navigation becomes horizontal scrollable tabs above the reading pane.
**When to use:** Two-column layouts with navigation.
**Recommendation (Claude's discretion):** Use `768px` breakpoint. On mobile, render section tabs as horizontally scrollable pill buttons above the reading pane content.

### Anti-Patterns to Avoid
- **Loading all units upfront:** Unlike drill/MCQ which preloads all unit data for card counts, study guides should lazy-load per unit (they are larger text payloads)
- **Using emojis as icons in components:** The mockup HTML uses emojis for illustration only -- use Lucide React icons in actual implementation
- **Hardcoded section heights:** Content length varies per unit; never fix reading pane height
- **Scroll-based section detection (IntersectionObserver):** Overengineered for a paged reader; simple state-driven section switching is correct

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| KaTeX rendering | Custom LaTeX parser | Existing `KatexRenderer` component with `katex` library | Already built, handles errors gracefully |
| Unit metadata | Custom subject config | `getSubject()` from `utils/subjects.ts` | Already has all unit numbers and names |
| Analytics | Custom fetch wrapper | `logEvent()` from `utils/analytics.ts` | Fire-and-forget pattern already correct |
| localStorage access | Direct `window.localStorage` calls | `lsGet`/`lsSet` from `utils/localStorage.ts` | SSR-safe, error-handling built in |

## Common Pitfalls

### Pitfall 1: Schema Discrepancy Between JSON Schema and PRD Example
**What goes wrong:** The formal JSON schema (`data/schemas/study-guide.schema.json`) uses `name`/`katex_string` for formulas and `core_concepts` as plain string array. The PRD example uses `label`/`katex` for formulas and `title`/`content` objects for core_concepts.
**Why it happens:** Schema and PRD were written at different times; one was updated without the other.
**How to avoid:** The formal JSON schema file is the canonical source. Use `name`/`katex_string` for formulas, plain strings for `core_concepts`. The content generation phases (6-12) will follow the schema file. The component should be built to match the schema.
**Warning signs:** TypeScript type definitions not matching actual JSON structure.

### Pitfall 2: KaTeX SSR Hydration Mismatch
**What goes wrong:** KaTeX renders differently on server vs client, causing hydration errors.
**Why it happens:** `KatexRenderer` uses `useEffect` + `ref` pattern (client-only rendering), which is correct. But if you try to use `katex.renderToString()` in a server component, the HTML may differ.
**How to avoid:** Keep all KaTeX rendering in client components (`'use client'`). The existing `KatexRenderer` pattern is already correct -- it renders nothing on server, fills in on client via `useEffect`.
**Warning signs:** React hydration warnings in console.

### Pitfall 3: Inline `$...$` Parser Edge Cases
**What goes wrong:** Regex-based `$...$` splitting breaks on escaped dollars (`\$`), nested delimiters, or empty delimiters (`$$`).
**Why it happens:** Naive regex doesn't handle edge cases.
**How to avoid:** Use a non-greedy match `/(\$[^$]+\$)/g` which handles the common case. Study guide content is author-controlled JSON, so edge cases like `\$` are unlikely. Empty `$$` (display mode delimiter) should not appear in inline text fields per schema spec.
**Warning signs:** Broken rendering in math-heavy subjects (Calculus, Chemistry).

### Pitfall 4: Sticky Sidebar Overlapping Fixed Header
**What goes wrong:** The sticky sidebar (`position: sticky; top: 0`) sits behind or overlaps the fixed page header.
**Why it happens:** Fixed header has a height (~64px) that sticky elements must account for.
**How to avoid:** Set `top: 80px` on the sticky sidebar (64px header + 16px gap), matching the mockup's `top: 80px` value.
**Warning signs:** Sidebar content cut off at top on scroll.

### Pitfall 5: Mobile Layout -- Sidebar Not Responsive
**What goes wrong:** Two-column layout breaks on mobile, sidebar squishes or overflows.
**Why it happens:** Fixed 240px sidebar + reading pane doesn't fit on 375px screens.
**How to avoid:** At < 768px, hide the sidebar entirely and render section navigation as horizontal scrollable tabs above the reading pane. Use CSS media queries or inline style logic based on a `useMediaQuery` hook or CSS-only approach with `<style>` tags (matching existing pattern in UnitSelector components).
**Warning signs:** Horizontal scroll on mobile.

## Code Examples

### Study Guide TypeScript Types
```typescript
// utils/studyGuide.ts — matches data/schemas/study-guide.schema.json
export interface StudyGuide {
  id: string
  unit: string
  subject: string
  theme: string
  core_concepts: string[]           // Plain strings with possible $...$ inline KaTeX
  key_terms: { term: string; definition: string }[]
  formulas?: { name: string; katex_string: string }[]
  diagrams?: { type: 'table' | 'chart'; data: unknown }[]
  exam_tip: string
}

export type StudyGuideSection = 'theme' | 'core_concepts' | 'key_terms' | 'formulas' | 'exam_tip'
```

### Unit Data Fetching Pattern
```typescript
// Single unit fetch -- not preloading all units
async function fetchStudyGuide(subject: string, unitNumber: number): Promise<StudyGuide | null> {
  try {
    const res = await fetch(`/data/${subject}/study-guide/unit-${unitNumber}.json`)
    if (!res.ok) return null
    return await res.json() as StudyGuide
  } catch {
    return null
  }
}
```

### Analytics Event
```typescript
// Fire on study guide unit load (GUIDE-04)
import { logEvent } from '@/utils/analytics'
logEvent({
  event_type: 'study_guide_view',
  subject: subject,
  unit: `unit-${unitNumber}`,
})
```

### Mockup CSS Values (from Option B)
```css
/* Sidebar */
.sidebar {
  width: 240px;
  flex-shrink: 0;
  background: var(--bg-secondary);
  border: 1px solid var(--bg-border);
  border-radius: var(--radius-lg) 0 0 var(--radius-lg);
  padding: 20px 16px;
  position: sticky;
  top: 80px;
  height: fit-content;
}

/* Active nav item */
.sidebar-nav-item.active {
  background: rgba(99,102,241,0.1); /* Use color-mix(in srgb, var(--accent) 10%, transparent) */
  color: var(--accent-hover);
  font-weight: 600;
}

/* Reading pane */
.reading-pane {
  flex: 1;
  background: var(--bg-card);
  border: 1px solid var(--bg-border);
  border-left: none;
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
  padding: 28px 32px;
}

/* Theme banner */
.theme-banner {
  background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(99,102,241,0.04));
  border: 1px solid rgba(99,102,241,0.25);
  border-radius: var(--radius-md);
  padding: 16px;
}

/* Exam tip callout */
.exam-tip {
  background: rgba(245,158,11,0.08);
  border: 1px solid rgba(245,158,11,0.25);
  border-radius: var(--radius-md);
  padding: 16px;
}
```
Note: In implementation, replace `rgba()` with `color-mix(in srgb, var(--accent) %, transparent)` per project convention.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate UnitSelector per mode (drill vs MCQ) | Two nearly identical components exist | Phase 2-3 | Study guide adds a third variant; consider extracting shared UnitSelector base, but not required this phase |
| Global KaTeX CSS import | Per-component import via `KatexRenderer` | Phase 2 | Continue this pattern -- `import 'katex/dist/katex.min.css'` is in `KatexRenderer` already |

## Open Questions

1. **Schema discrepancy: core_concepts structure**
   - What we know: JSON schema says `core_concepts` is `string[]`. PRD example shows `{title, content}[]`.
   - What's unclear: Which format will content phases (6-12) actually produce?
   - Recommendation: Build component to match the JSON schema (`string[]`). If content phases produce objects, update the schema and component together. Flag in plan as a decision point.

2. **Formulas array is optional**
   - What we know: `formulas` is not in the `required` array in the JSON schema. Some units (e.g., AP Psychology) may have no formulas.
   - What's unclear: Should the Formulas section still appear in the sidebar when empty?
   - Recommendation: Hide the Formulas/Diagrams sidebar nav item and section when `formulas` is empty or undefined. Same for `diagrams`.

3. **Diagrams rendering**
   - What we know: The schema supports `table` and `chart` type diagrams. Tables need `{headers, rows}`, charts need Chart.js config.
   - What's unclear: Whether any Phase 4 test content will include diagrams.
   - Recommendation: Build the Formulas section to also render diagrams if present. Table rendering is straightforward HTML. Chart rendering can reuse any existing Chart.js patterns (or defer to content phases). Keep it simple for now -- render tables, skip charts if no content exists yet.

## Sources

### Primary (HIGH confidence)
- `data/schemas/study-guide.schema.json` -- canonical JSON schema for study guide data
- `docs/PRD.md` lines 89-123 -- study guide schema example and KaTeX inline convention
- `mockups/study-guide-mockup.html` -- Option B CSS/HTML reference (user-selected layout)
- `components/KatexRenderer.tsx` -- existing KaTeX rendering component
- `utils/analytics.ts` -- `logEvent()` fire-and-forget pattern
- `components/drill/UnitSelector.tsx` -- unit selector pattern reference
- `app/[subject]/practice/page.tsx` -- page orchestrator pattern reference

### Secondary (MEDIUM confidence)
- `design-system/ascendly/MASTER.md` -- design tokens, spacing, component specs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all dependencies already installed, no new packages
- Architecture: HIGH -- follows established patterns from Phase 2-3, mockup provides exact CSS
- Pitfalls: HIGH -- schema discrepancy verified by reading both sources; KaTeX patterns verified from existing code

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (stable -- no external dependency changes expected)
