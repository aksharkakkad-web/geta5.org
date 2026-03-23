# Ascendly — Product Reference Document (PRD)

---

## product_vision

Ascendly is a free, no-signup AP exam prep web app. Students can practice drills, attempt MCQs with stimulus, read study guides, and take full practice tests — all without creating an account. All progress is stored in localStorage. The app is deployed on Vercel at ascendly.vercel.app.

**Core Promise:** The best free AP prep tool on the internet. No paywalls, no accounts, no friction.

**Target Users:** High school students preparing for AP exams, particularly those who cannot afford paid prep services.

**Success Metric:** Students improve their projected AP score after using Ascendly for 2+ weeks.

---

## design_philosophy

- **Dark theme only.** Clean, modern, focused. No light mode.
- **Zero friction.** No signup, no login, no onboarding walls. Open and start practicing immediately.
- **Real content only.** No lorem ipsum, no placeholder text, no "coming soon" sections visible to users.
- **Mobile-first.** Every screen must be fully functional and polished on mobile.
- **Performance-first.** No unnecessary dependencies. Fast load times.
- **Confidence-building UX.** Immediate feedback, progress visibility, streak tracking, projected score display.
- **Accessibility.** Sufficient color contrast, keyboard navigability, semantic HTML.
- **KaTeX everywhere formulas appear.** Never render math as plain text.

---

## launch_subjects

1. AP Psychology
2. AP World History
3. AP Government
4. AP Calculus AB
5. AP Precalculus
6. AP Computer Science Principles (AP CSP)
7. AP Chemistry

---

## tech_stack

- **Framework:** Next.js 14, App Router, TypeScript
- **Styling:** Tailwind CSS + CSS custom properties (dark theme via globals.css)
- **Formulas:** KaTeX — required for all mathematical and chemical expressions
- **Charts:** Chart.js — for stimulus graphs in MCQs and study guides
- **Storage:** localStorage only — no database for user data
- **Analytics:** Supabase free tier — anonymous event logging only, no PII ever
- **Deployment:** Vercel (free tier)
- **Package Manager:** npm

---

## folder_structure

```
/app                  → Next.js App Router pages and layouts
  /[subject]          → Subject hub pages
    /drills           → Drill practice pages
    /practice         → MCQ practice pages
    /study-guide      → Study guide pages
    /practice-test    → Full practice test pages
/components           → Reusable React components
  /ui                 → Base UI components (buttons, cards, modals)
  /drill              → Drill-specific components
  /mcq                → MCQ-specific components
  /study-guide        → Study guide components
  /practice-test      → Practice test components
  /layout             → Header, footer, navigation
/data                 → JSON content files + schemas
  /psychology         → AP Psychology content JSONs
  /world-history      → AP World History content JSONs
  /government         → AP Government content JSONs
  /calculus-ab        → AP Calculus AB content JSONs
  /precalculus        → AP Precalculus content JSONs
  /csp                → AP CSP content JSONs
  /chemistry          → AP Chemistry content JSONs
/utils                → Utility functions
  localStorage.ts     → Read/write localStorage helpers
  scoring.ts          → Score calculation and projection
  streak.ts           → Streak tracking logic
  fuzzyMatch.ts       → Fuzzy matching for drill free-response
  scramble.ts         → Answer choice scrambling (runtime only)
  analytics.ts        → Supabase fire-and-forget event logging
/lib                  → External service clients
  supabase.ts         → Supabase client initialization
/styles               → Global styles
  globals.css         → CSS custom properties, dark theme base styles
/docs                 → Documentation
  PRD.md              → This file
  (research docs, phase plans as created)
/public               → Static assets
```

---

## supabase_anonymous_logging

**Purpose:** Understand which subjects/units are most used, track engagement patterns, identify content gaps. No PII ever stored.

**Rules:**
- Always fire-and-forget: `logEvent(...).catch(() => {})` — never await in UI path
- Never block rendering or user interaction on Supabase
- Never store any user-identifying information
- Catch all errors silently

**Events Table Schema:**

Table name: `events`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Auto-generated primary key |
| event_type | text | e.g. "drill_completed", "mcq_answered", "practice_test_started" |
| subject | text | e.g. "ap-psychology", "ap-calculus-ab" |
| unit | text | Nullable — unit number/name if applicable |
| metadata | jsonb | Nullable — additional context (score, accuracy, question_id, etc.) |
| created_at | timestamptz | Auto-generated timestamp |

**Event Types (planned):**
- `page_view` — subject hub visited
- `drill_started` — drill session begun
- `drill_completed` — drill session finished (metadata: accuracy, unit)
- `mcq_answered` — single MCQ answered (metadata: correct: bool, difficulty)
- `practice_test_started` — full practice test begun
- `practice_test_completed` — full practice test finished (metadata: score, unit_scores)
- `study_guide_viewed` — study guide opened (metadata: unit)

---

## seo_requirements

- Every page must have a unique `<title>` and `<meta name="description">` via Next.js metadata API
- Subject pages: "AP [Subject] Prep — Free Practice | Ascendly"
- Homepage: "Ascendly — Free AP Exam Prep. No Signup."
- Use semantic HTML: `<main>`, `<nav>`, `<article>`, `<section>`, `<h1>`–`<h3>` hierarchy
- robots.txt allowing all crawlers
- sitemap.xml generated at build time
- Open Graph tags for social sharing on all major pages
- No noindex tags on any content pages

---

## content_standards

### MCQ Standards
- **Difficulty distribution per unit:** 20% easy / 45% medium / 35% hard
- **Count per unit per subject:** 50–100 questions minimum
- **Every MCQ must have:**
  - A stem (question text)
  - Exactly 4 answer choices (A, B, C, D)
  - A correct answer
  - An explanation for the correct answer
  - An explanation for each distractor (why it is wrong)
  - A difficulty tag: "easy" | "medium" | "hard"
  - A unit tag
  - An optional stimulus (passage, graph spec, table, pseudocode)
- **Stimulus types:** text passages, Chart.js graph specifications, HTML tables, College Board pseudocode (CSP only)
- **Answer scrambling:** Scramble at render time only — never change JSON order

### Drill Standards
- **Coverage:** Every testable term, formula, person, concept, event, process — no fixed count
- **Drill types:**
  - Flashcard (term → definition, or definition → term)
  - Fill-in-the-blank (formula completion, key term recall)
  - Free-response short answer with fuzzy match scoring
- **Every drill card must have:**
  - A front (prompt)
  - A back (answer)
  - A unit tag
  - A subject tag
  - An optional hint

### Study Guide Standards
- **Structure per unit:**
  1. Theme / Big Idea
  2. Core Concepts (narrative paragraphs)
  3. Key Terms (term + definition)
  4. Formulas (KaTeX rendered — never plain text)
  5. Exam Tip (specific, actionable, College Board–aligned)
- **All formulas must be KaTeX** — no exceptions

### AP CSP Specific Rules
- Never use real Python or real Java in any content
- Always use College Board pseudocode (the official AP CSP pseudocode reference)
- Pseudocode blocks must use the exact College Board syntax and formatting

### AP Chemistry Specific Rules
- Checker agent must approve all chemical formulas before Coder integrates
- All chemical equations must be balanced and KaTeX-rendered
- Thermodynamics, kinetics, equilibrium, electrochemistry must all use KaTeX

---

## app_structure

### Homepage (`/`)
- Hero: tagline, subject picker grid
- No auth, no modal walls
- Subject cards with subject name and "Start Practicing" CTA
- Streak display (from localStorage) if streak > 0
- Total questions answered (from localStorage)

### Subject Hub (`/[subject]`)
- Subject name + AP exam date countdown
- Four mode cards: Drills, Practice Questions, Study Guide, Practice Test
- Unit progress grid (mastery % per unit from localStorage)
- Projected score display (from localStorage)

### Drill Page (`/[subject]/drills`)
- Unit selector
- Card-flip interface for flashcard drills
- Fill-in / free-response interface for term drills
- Accuracy tracking per session → written to localStorage mastery key
- Supabase: fire `drill_completed` on session end

### Practice Questions Page (`/[subject]/practice`)
- Unit selector + difficulty filter
- One MCQ at a time
- Stimulus rendered above question when present (Chart.js for graphs, HTML for tables, code block for pseudocode)
- Immediate feedback after selection: correct/incorrect banner + explanation panel showing all choice explanations
- Score tracker in session header
- Supabase: fire `mcq_answered` on each answer

### Study Guide Page (`/[subject]/study-guide`)
- Unit selector (sidebar or tabs)
- Renders study guide content per unit: theme → concepts → key terms → formulas → exam tip
- All formulas KaTeX-rendered
- Supabase: fire `study_guide_viewed` on unit open

### Practice Test Page (`/[subject]/practice-test`)
- Timed full-length test (College Board timing)
- All questions shown in sequence with navigation
- Submit at end → score report with unit breakdown
- Score stored to localStorage
- Supabase: fire `practice_test_completed` with score metadata

---

## data_schemas

### MCQ Schema (`/data/[subject]/mcq/unit-[n].json`)

```json
{
  "subject": "ap-psychology",
  "unit": "1",
  "unit_name": "Biological Bases of Behavior",
  "questions": [
    {
      "id": "psych-u1-001",
      "difficulty": "medium",
      "stimulus": null,
      "stem": "Which neurotransmitter is most associated with mood regulation and is targeted by SSRIs?",
      "choices": [
        { "letter": "A", "text": "Dopamine" },
        { "letter": "B", "text": "Serotonin" },
        { "letter": "C", "text": "Acetylcholine" },
        { "letter": "D", "text": "GABA" }
      ],
      "correct": "B",
      "explanations": {
        "A": "Dopamine is associated with reward and motor control, not primarily mood regulation targeted by SSRIs.",
        "B": "Correct. SSRIs (Selective Serotonin Reuptake Inhibitors) specifically target serotonin reuptake, making serotonin more available in the synapse.",
        "C": "Acetylcholine is involved in muscle activation and memory, not the primary target of SSRIs.",
        "D": "GABA is the primary inhibitory neurotransmitter, associated with reducing anxiety, but is not the target of SSRIs."
      }
    }
  ]
}
```

### Drill Schema (`/data/[subject]/drills/unit-[n].json`)

```json
{
  "subject": "ap-psychology",
  "unit": "1",
  "unit_name": "Biological Bases of Behavior",
  "cards": [
    {
      "id": "psych-u1-d001",
      "type": "flashcard",
      "front": "Synapse",
      "back": "The junction between two neurons where neurotransmitters are released from the axon terminal of the presynaptic neuron and bind to receptors on the postsynaptic neuron.",
      "hint": "Think: the gap between neurons"
    },
    {
      "id": "psych-u1-d002",
      "type": "fill-in",
      "prompt": "The _______ lobe is responsible for processing visual information.",
      "answer": "occipital",
      "hint": "Located at the back of the skull"
    }
  ]
}
```

### Study Guide Schema (`/data/[subject]/study-guide/unit-[n].json`)

> **KaTeX in text fields:** The `definition`, `exam_tip`, and `content` fields may contain inline math using `$...$` delimiters (e.g. `"...written as $\lim_{x \to c} f(x)$"`). The StudyGuide component must parse these fields for `$...$` markers and render them through KatexRenderer inline. Never store raw LaTeX without delimiters in text fields — it will render as plain text.

```json
{
  "subject": "ap-calculus-ab",
  "unit": "1",
  "unit_name": "Limits and Continuity",
  "theme": "Understanding how functions behave as inputs approach a value — the foundation of all calculus.",
  "core_concepts": [
    {
      "title": "The Limit Concept",
      "content": "A limit describes the value a function approaches as the input approaches a given point. It does not require the function to be defined at that point."
    }
  ],
  "key_terms": [
    {
      "term": "Limit",
      "definition": "The value that a function f(x) approaches as x approaches a given value c, written as lim_{x→c} f(x)."
    }
  ],
  "formulas": [
    {
      "label": "Definition of a Limit",
      "katex": "\\lim_{x \\to c} f(x) = L"
    },
    {
      "label": "Squeeze Theorem",
      "katex": "\\text{If } g(x) \\leq f(x) \\leq h(x) \\text{ and } \\lim_{x \\to c} g(x) = \\lim_{x \\to c} h(x) = L, \\text{ then } \\lim_{x \\to c} f(x) = L"
    }
  ],
  "exam_tip": "On the AP exam, if a limit question involves 0/0 or ∞/∞, immediately apply L'Hôpital's Rule or factor/cancel. Never leave an indeterminate form as your answer."
}
```

### Stimulus Schema (embedded in MCQ)

**Graph stimulus:**
```json
{
  "type": "graph",
  "chart_type": "line",
  "title": "Population Growth Over Time",
  "x_label": "Year",
  "y_label": "Population (millions)",
  "datasets": [
    {
      "label": "Country A",
      "data": [10, 15, 22, 31, 45],
      "color": "#4ade80"
    }
  ],
  "x_values": [1960, 1970, 1980, 1990, 2000]
}
```

**Text passage stimulus:**
```json
{
  "type": "passage",
  "text": "The following excerpt is from a 1948 speech by President Harry Truman..."
}
```

**Table stimulus:**
```json
{
  "type": "table",
  "headers": ["Element", "Atomic Number", "Atomic Mass"],
  "rows": [
    ["Hydrogen", "1", "1.008"],
    ["Helium", "2", "4.003"]
  ]
}
```

**Pseudocode stimulus (AP CSP only):**
```json
{
  "type": "pseudocode",
  "code": "PROCEDURE findMax(numList)\n{\n  max ← numList[1]\n  FOR EACH item IN numList\n  {\n    IF item > max\n    {\n      max ← item\n    }\n  }\n  RETURN max\n}"
}
```

---

## coding_agent_team

Four roles handle all implementation work in a strict sequential pipeline:

### Planner
- Receives the feature or task description
- Breaks work into discrete, testable objectives (one objective = one verifiable outcome)
- Defines acceptance criteria for each objective — Tester uses these verbatim
- Identifies files to create/modify, component contracts, data shapes, and edge cases
- Produces a written plan before any code is written
- **Output**: Task list with objectives, file map, acceptance criteria, and any open questions

### Coder
- Receives the Planner's written plan — does NOT start without it
- Implements exactly what the plan specifies: components, pages, utilities, integrations
- Follows all Critical Rules without exception
- Uses TypeScript strictly — no `any` types
- Writes clean, well-commented code
- Integrates content JSON into components exactly as schematized
- **Output**: Working implementation + summary of what was built and any deviations from plan

### Reviewer
- Receives Coder's output and the original Planner spec
- Reviews all changed code for bugs, logic errors, edge cases, and regressions
- Checks TypeScript correctness, Critical Rules compliance, and schema adherence
- Verifies KaTeX rendering on all formula content
- Verifies mobile responsiveness and dark mode correctness
- Verifies answer scrambling correctness (20+ render test) when applicable
- **Output**: Approved (with notes) OR Rejected (with exact file, line, issue, and required fix) — returns to Coder on rejection

### Tester
- Receives the Planner's acceptance criteria and Reviewer's approval
- Tests each objective from the plan: does the implementation actually satisfy it?
- Checks real content renders correctly (no placeholder text)
- Checks localStorage reads/writes correctly
- Checks Supabase events fire and fail silently
- **Output**: Pass (all objectives met) OR Fail (lists which objectives failed and why) — returns to Coder on failure

---

## content_agent_team

Three roles handle all content creation in a strict sequential pipeline:

### Researcher
- Receives the subject and unit to be written
- Researches College Board curriculum: official course description, exam format, question types, stimulus types, skill categories, and difficulty distribution
- Identifies all testable terms, formulas, people, concepts, and events for the unit
- Identifies common misconceptions and distractor patterns used on the real exam
- For AP Chemistry: catalogs all formulas and equations that need KaTeX formatting
- For AP CSP: identifies all pseudocode patterns used on the real exam
- **Output**: Research brief — structured summary of everything the Writer needs to produce accurate, on-spec content

### Writer
- Receives the Researcher's brief — does NOT start without it
- Writes all MCQs, drills, and study guides for the unit
- Follows content standards exactly: 20% easy / 45% medium / 35% hard, 50–100 MCQs per unit, drills cover every testable term/concept
- Writes per-choice explanations for every MCQ option (correct + all distractors)
- Uses College Board pseudocode for AP CSP — never real Python/Java
- All formulas written in KaTeX — never plain text math
- Scrambles nothing — answer order is fixed in JSON, scrambled at render time only
- **Output**: Complete JSON files matching canonical schemas (drill.schema.json, mcq.schema.json, study-guide.schema.json)

### Reviewer
- Receives Writer's JSON output and the Researcher's brief
- Verifies every question maps to the correct unit and College Board curriculum
- Verifies difficulty tags are accurate (not inflated or deflated)
- Verifies all answer choices are plausible — no obviously wrong distractors
- Verifies all correct answers are actually correct
- Verifies all per-choice explanations are accurate and explain the reasoning clearly
- Verifies all formulas are valid KaTeX — no plain text math
- Verifies AP CSP pseudocode is correct College Board syntax
- For AP Chemistry: verifies all equations are balanced and KaTeX notation is correct
- **Output**: Approved (with notes) OR Rejected (with exact question index, issue, and required fix) — returns to Writer on rejection

---

## agent_team_communication

### Full Pipeline (Content → Code)
1. **Researcher** completes research brief for subject/unit
2. **Researcher → Writer**: hands off research brief with subject, unit, and all findings
3. **Writer** completes JSON files
4. **Writer → Reviewer (Content)**: hands off JSON files + research brief
5. **Reviewer (Content)** approves OR rejects back to Writer with specific issues
6. **Reviewer (Content) → Planner**: hands off approved JSON + unit spec
7. **Planner** produces implementation plan (objectives, file map, acceptance criteria)
8. **Planner → Coder**: hands off written plan
9. **Coder** implements
10. **Coder → Reviewer (Code)**: hands off implementation + plan summary
11. **Reviewer (Code)** approves OR rejects back to Coder with exact file/line/issue
12. **Reviewer (Code) → Tester**: hands off approved code + Planner's acceptance criteria
13. **Tester** tests against each objective — passes OR fails back to Coder with failed objectives
14. **Tester** passes → unit marked done in phase tracker, CLAUDE.md updated

### Handoff Message Format
Every handoff must include:
```
FROM: [role]
TO: [role]
SUBJECT: [subject] / Unit [N] — [unit name]
STATUS: [Approved / Rejected / Passed / Failed]
FILES: [list of files created or changed]
NOTES: [summary of work done or issues found]
ACTION REQUIRED: [what the receiving agent must do]
```

Every rejection must additionally include:
```
ISSUES:
- [file path or question index]: [exact problem] → [required fix]
```

### Communication Standards
- No agent starts work without receiving the prior agent's output
- No agent marks work done without the appropriate downstream approval
- Rejections go back exactly one step — not to the start of the pipeline
- CLAUDE.md phase tracker updated immediately when a unit reaches Tester pass

---

## build_phases

### Phase 0 — Project Setup & Documentation
**Goal:** Establish the project foundation before any code is written.

**Tasks:**
1. Create `CLAUDE.md` with full project context, rules, and phase tracker
2. Create `docs/PRD.md` (this document) with all specifications
3. Initialize Next.js 14 project with TypeScript, Tailwind CSS, App Router
4. Install dependencies: KaTeX, Chart.js, Supabase JS client
5. Configure `tailwind.config.ts` with custom dark theme colors
6. Create `styles/globals.css` with CSS custom properties for dark theme
7. Create `lib/supabase.ts` with Supabase client initialization
8. Create `utils/analytics.ts` with fire-and-forget logEvent function
9. Create `utils/localStorage.ts` with all read/write helpers for defined keys
10. Create `utils/scoring.ts` with projected score calculation logic
11. Create `utils/streak.ts` with streak tracking logic
12. Create `utils/scramble.ts` with runtime answer scrambling utility
13. Create `utils/fuzzyMatch.ts` with fuzzy matching for drill free-response
14. Create `/data` folder structure with empty placeholder JSONs per subject
15. Create `public/robots.txt` and initial `public/sitemap.xml`
16. Deploy empty app to Vercel — confirm deployment works

**Completion criteria:** Project runs locally, deploys to Vercel, all utilities exist, no content yet.

---

### Phase 1 — Core Shell & Navigation
**Goal:** Build the full navigational skeleton of the app with real UI (no placeholder content).

**Tasks:**
1. Build root layout (`app/layout.tsx`) with dark theme, KaTeX CSS import, metadata defaults
2. Build global header component: Ascendly logo, active subject display (from localStorage), streak badge
3. Build global footer component: subject links, about blurb
4. Build homepage (`app/page.tsx`): hero tagline, subject picker grid (7 subjects), streak display, total questions answered
5. Build subject hub page (`app/[subject]/page.tsx`): subject name, exam countdown, four mode cards, unit progress grid, projected score
6. Build 404 page with navigation back to home
7. Implement subject routing: URL slugs for all 7 subjects
8. Implement active subject tracking in localStorage on subject hub visit
9. Implement projected score display logic pulling from localStorage
10. Implement streak display on homepage pulling from localStorage

**UI Checker tasks:**
- Screenshot loop on homepage (desktop + mobile)
- Screenshot loop on each subject hub (desktop + mobile)
- Verify streak badge renders correctly at streak=0, streak=5, streak=30
- Verify unit progress grid renders at 0%, 50%, 100% mastery

**Completion criteria:** Full navigation works, all 7 subject hubs accessible, UI polished on desktop and mobile.

---

### Phase 2 — Drill Interface
**Goal:** Build the complete drill practice interface, ready to accept content JSON.

**Tasks:**
1. Build drill page layout (`app/[subject]/drills/page.tsx`)
2. Build unit selector component (dropdown or tab strip)
3. Build flashcard component: front/back flip animation, keyboard support (spacebar to flip, arrow keys to navigate)
4. Build fill-in-the-blank component: text input, submit, fuzzy match scoring
5. Build session progress bar (cards remaining, accuracy %)
6. Build session results screen: accuracy, mastered count, retry wrong answers CTA
7. Implement mastery write to localStorage on session complete
8. Implement streak update on session complete
9. Implement `drill_completed` Supabase event fire on session complete
10. Implement hint reveal toggle on each card
11. Build empty-state screen when no content JSON exists yet for a unit (dev-only message)

**UI Checker tasks:**
- Screenshot loop on drill page with sample content (desktop + mobile)
- Verify flip animation is smooth
- Verify keyboard navigation works
- Verify fuzzy match accepts reasonable alternate spellings

**Completion criteria:** Drill interface fully functional, accepts any valid drill JSON, UI polished.

---

### Phase 3 — Practice Questions Interface
**Goal:** Build the complete MCQ practice interface.

**Tasks:**
1. Build practice page layout (`app/[subject]/practice/page.tsx`)
2. Build unit selector + difficulty filter (All / Easy / Medium / Hard)
3. Build MCQ card component: stem, 4 choices, selection state
4. Build stimulus renderer: routes to correct component based on stimulus.type
   - `PassageStimulus` component: styled text block
   - `GraphStimulus` component: Chart.js rendering from graph spec
   - `TableStimulus` component: HTML table with dark theme styling
   - `PseudocodeStimulus` component: monospace code block with College Board formatting
5. Build answer feedback component: correct/incorrect banner, full explanations panel (all 4 choices)
6. Build session score tracker in header (X / Y correct)
7. Build session results screen with accuracy and unit breakdown
8. Implement mastery write to localStorage on session end
9. Implement `mcq_answered` Supabase event fire on each answer
10. Implement answer scrambling via `utils/scramble.ts` at render time — never modify JSON
11. Build empty-state screen when no content JSON exists yet

**UI Checker tasks:**
- Screenshot loop: question with no stimulus (desktop + mobile)
- Screenshot loop: question with text passage stimulus
- Screenshot loop: question with graph stimulus (Chart.js rendered)
- Screenshot loop: question with table stimulus
- Screenshot loop: question with pseudocode stimulus (CSP)
- Screenshot loop: answer feedback panel with all 4 explanations
- Verify answer scrambling across 20+ renders shows no positional bias

**Completion criteria:** Full MCQ interface functional, all stimulus types render correctly, UI polished.

---

### Phase 4 — Study Guide Interface
**Goal:** Build the complete study guide reading interface.

**Tasks:**
1. Build study guide page layout (`app/[subject]/study-guide/page.tsx`)
2. Build unit selector sidebar (desktop) / dropdown (mobile)
3. Build study guide content renderer:
   - Theme/big idea banner
   - Core concepts section (heading + paragraph per concept)
   - Key terms section (term + definition cards)
   - Formulas section (KaTeX-rendered formula cards)
   - Exam tip section (highlighted tip box)
4. Implement KaTeX rendering for all formula fields
5. Implement `study_guide_viewed` Supabase event fire on unit open
6. Build empty-state screen when no study guide JSON exists yet

**UI Checker tasks:**
- Screenshot loop: study guide unit with formulas (desktop + mobile)
- Verify KaTeX renders correctly and does not fall back to plain text
- Verify all sections visible and readable on mobile

**Completion criteria:** Study guide interface complete, KaTeX confirmed rendering, UI polished.

---

### Phase 5 — Practice Test Interface
**Goal:** Build the full practice test experience.

**Tasks:**
1. Build practice test page layout (`app/[subject]/practice-test/page.tsx`)
2. Build test start screen: subject name, question count, time limit, start CTA
3. Build test navigation: question list sidebar (desktop), prev/next buttons, question number indicator
4. Build test timer component: counts down from College Board time limit, warns at 5 minutes remaining
5. Build question renderer: same MCQ card + stimulus renderer as Phase 3 (reuse components)
6. Build test submission flow: confirm submit modal → score report
7. Build score report: total score, per-unit breakdown, projected AP score (1–5), review wrong answers CTA
8. Implement score write to localStorage on test complete
9. Implement `practice_test_completed` Supabase event fire with score metadata
10. Implement test state persistence in localStorage (resume if navigated away accidentally)

**UI Checker tasks:**
- Screenshot loop: test in progress (desktop + mobile)
- Screenshot loop: timer at normal, warning, and expired states
- Screenshot loop: score report (desktop + mobile)
- Verify navigation between questions works without losing answers

**Completion criteria:** Full practice test flow works end-to-end, score report polished.

---

### Phase 6 — AP Psychology Content
**Goal:** Write and integrate all AP Psychology content.

**Units:** (Per College Board CED)
1. Biological Bases of Behavior
2. Sensation and Perception
3. Learning
4. Cognitive Psychology
5. Developmental Psychology
6. Motivation, Emotion, and Personality
7. Clinical Psychology
8. Social Psychology

**Tasks per unit:**
1. Content Writer: write 50–100 MCQs (20/45/35 difficulty split), full drills, full study guide → per schema
2. Content Checker: review all content for accuracy, difficulty tagging, distractor quality
3. Coder: integrate JSONs, verify rendering in all three interfaces
4. UI Checker: screenshot loop in drill, practice, and study guide interfaces with real content

**Completion criteria:** All 8 units have complete MCQ, drill, and study guide JSONs; all render correctly.

---

### Phase 7 — AP World History Content
**Goal:** Write and integrate all AP World History content.

**Units:** (Per College Board CED)
1. The Global Tapestry (c. 1200–1450)
2. Networks of Exchange (c. 1200–1450)
3. Land-Based Empires (c. 1450–1750)
4. Transoceanic Interconnections (c. 1450–1750)
5. Revolutions (c. 1750–1900)
6. Consequences of Industrialization (c. 1750–1900)
7. Global Conflict (c. 1900–present)
8. Cold War and Decolonization (c. 1900–present)
9. Globalization (c. 1900–present)

**Tasks per unit:** Same as Phase 6.

**Stimulus note:** World History MCQs frequently use text passages, maps described as tables, and charts. All graph stimuli use Chart.js.

**Completion criteria:** All 9 units complete.

---

### Phase 8 — AP Government Content
**Goal:** Write and integrate all AP Government content.

**Units:** (Per College Board CED)
1. Foundations of American Democracy
2. Interactions Among Branches of Government
3. Civil Liberties and Civil Rights
4. American Political Ideologies and Beliefs
5. Political Participation

**Tasks per unit:** Same as Phase 6.

**Required documents coverage:** The 9 required foundational documents (Federalist No. 10, Brutus No. 1, etc.) must each appear in at least 3 MCQs as text passage stimuli.

**Completion criteria:** All 5 units complete, all 9 required documents covered in stimulus questions.

---

### Phase 9 — AP Calculus AB Content
**Goal:** Write and integrate all AP Calculus AB content.

**Units:** (Per College Board CED)
1. Limits and Continuity
2. Differentiation: Definition and Fundamental Properties
3. Differentiation: Composite, Implicit, and Inverse Functions
4. Contextual Applications of Differentiation
5. Analytical Applications of Differentiation
6. Integration and Accumulation of Change
7. Differential Equations
8. Applications of Integration

**Tasks per unit:** Same as Phase 6, with additional requirements:
- ALL formulas in MCQ stems, choices, study guides, and drill cards must be KaTeX
- No formula may appear as plain text anywhere

**Completion criteria:** All 8 units complete, KaTeX confirmed on every formula.

---

### Phase 10 — AP Precalculus Content
**Goal:** Write and integrate all AP Precalculus content.

**Units:** (Per College Board CED)
1. Polynomial and Rational Functions
2. Exponential and Logarithmic Functions
3. Trigonometric and Polar Functions
4. Functions Involving Parameters, Vectors, and Matrices

**Tasks per unit:** Same as Phase 9 (all formulas KaTeX).

**Completion criteria:** All 4 units complete, KaTeX confirmed.

---

### Phase 11 — AP CSP Content
**Goal:** Write and integrate all AP Computer Science Principles content.

**Units:** (Per College Board CED)
1. Creative Development
2. Data
3. Algorithms and Programming
4. Computing Systems and Networks
5. Impact of Computing

**Tasks per unit:** Same as Phase 6, with additional requirements:
- ALL code in MCQ stimuli must be College Board pseudocode — never Python, never Java
- Pseudocode must use exact College Board syntax (arrows for assignment, DISPLAY, INPUT, FOR EACH, REPEAT UNTIL, PROCEDURE, etc.)
- Content Checker must verify pseudocode syntax on every question

**Completion criteria:** All 5 units complete, pseudocode verified on all code stimuli.

---

### Phase 12 — AP Chemistry Content
**Goal:** Write and integrate all AP Chemistry content.

**Units:** (Per College Board CED)
1. Atomic Structure and Properties
2. Molecular and Ionic Compound Structure and Properties
3. Intermolecular Forces and Properties
4. Chemical Reactions
5. Kinetics
6. Thermodynamics
7. Equilibrium
8. Acids and Bases
9. Electrochemistry

**Tasks per unit:**
1. Content Writer: write content per schema
2. Chemistry Checker: review ALL formulas, equations, and chemical expressions — must be balanced and KaTeX-ready
3. Content Checker: review after Chemistry Checker approves
4. Coder: integrate (no chemistry content may be integrated without Chemistry Checker sign-off)
5. UI Checker: screenshot loop confirming KaTeX renders correctly for all chemical expressions

**Completion criteria:** All 9 units complete, all formulas Chemistry Checker–approved, KaTeX confirmed.

---

### Phase 13 — Retention Mechanics & Polish
**Goal:** Add all engagement and retention features, perform full app polish pass.

**Tasks:**
1. Implement full streak system: daily streak tracking, streak display on homepage and subject hub, streak milestone badges (7-day, 30-day, 100-day)
2. Implement projected score display: per-subject score card on subject hub, score trend if multiple test scores exist
3. Implement mastery grid: color-coded unit mastery visualization on subject hub (0–33% red, 34–66% yellow, 67–100% green)
4. Implement total questions answered counter on homepage
5. Build "Quick Review" mode: pulls the 20 most-missed questions from localStorage history and queues them
6. Build recommended study path: based on mastery scores, suggest lowest-mastery unit to study next
7. Full mobile polish pass: every screen reviewed on 375px and 390px widths
8. Full keyboard accessibility pass: every interactive element keyboard-reachable
9. Performance audit: Lighthouse score target ≥ 90 on all major pages
10. SEO audit: verify all pages have unique titles, descriptions, and OG tags
11. Final Supabase event audit: verify all events fire correctly and never block UI

**UI Checker tasks:**
- Screenshot loop on every page after polish pass
- Mobile screenshot loop on every page (375px viewport)
- Verify streak milestones display correctly
- Verify mastery grid color coding is correct and accessible

**Completion criteria:** All retention features work, Lighthouse ≥ 90, full mobile polish confirmed.

---

### Phase 14 — Launch
**Goal:** Ship to production.

**Tasks:**
1. Final content audit: verify no unit is missing MCQs, drills, or study guide
2. Final UI audit: verify no placeholder text anywhere in the app
3. Final formula audit: verify no plain-text math anywhere
4. Final pseudocode audit: verify no real Python/Java in AP CSP content
5. Verify Supabase events table exists and is receiving events in production
6. Configure Vercel production deployment with correct environment variables
7. Set custom domain: ascendly.vercel.app
8. Generate and submit sitemap.xml to Google Search Console
9. Write and publish robots.txt
10. Run final Lighthouse audit on production URL — must pass ≥ 90
11. Update CLAUDE.md phase tracker to mark Phase 14 complete
12. Announce launch

**Completion criteria:** App live at ascendly.vercel.app, all content complete, all audits passed.

---

## critical_rules

These rules are absolute. No agent may violate them under any circumstance.

1. **NEVER render formulas as plain text — KaTeX always.**
   Every mathematical expression, formula, equation, or chemical expression must be rendered via KaTeX. No exceptions. If a formula cannot be KaTeX-rendered, flag it for review — do not ship it as plain text.

2. **NEVER skip the screenshot loop — UI must be polished before marking done.**
   Every component and page must go through a screenshot review loop with the UI Checker before being marked complete. "Works in the browser" is not sufficient. Visual polish must be confirmed.

3. **NEVER show placeholder text in screenshot loops — real content only.**
   All screenshot loops must use real content from actual JSON files or representative sample data matching the exact schema. Lorem ipsum, "TODO", "coming soon", or empty states are not acceptable in any screenshot that marks a task done.

4. **NEVER scramble answer choices in JSON — scrambling at render time only.**
   JSON files must always store answer choices in their canonical order (A, B, C, D). The `utils/scramble.ts` utility scrambles at render time. This ensures content integrity and makes answer validation reliable.

5. **NEVER use real Python/Java in AP CSP — College Board pseudocode only.**
   All code examples, stimuli, and drill content in AP CSP must use the official College Board pseudocode reference syntax. Real programming language syntax (Python, Java, JavaScript, etc.) is prohibited.

6. **NEVER block UI on Supabase — always fire-and-forget, catch silently.**
   All Supabase calls must use the pattern: `logEvent(...).catch(() => {})`. Never await a Supabase call in a render path or user interaction handler. If Supabase is down, the user must never notice.

7. **AP Chemistry: Checker must approve all formulas before Coder integrates.**
   No AP Chemistry content may be integrated into the codebase until the Chemistry Checker has reviewed and approved all chemical formulas and equations in that unit. This is a hard gate.

8. **Every MCQ must have per-choice explanations (correct + each distractor).**
   Every multiple choice question must have an explanation for the correct answer AND an explanation for why each incorrect answer (distractor) is wrong. Questions without complete explanations must be sent back to the Content Writer.

9. **Answer scrambling must be verified across 20+ renders — no positional bias.**
   The UI Checker must verify answer scrambling by reviewing 20+ renders of the same question to confirm that no answer choice consistently appears in the same position. Positional bias in scrambling is a disqualifying bug.

10. **Update CLAUDE.md immediately when any architectural decision is made.**
    Any change to the tech stack, folder structure, localStorage keys, Supabase schema, or data schemas must be reflected in CLAUDE.md before the implementing agent moves to the next task. CLAUDE.md is the source of truth for all future agents.
