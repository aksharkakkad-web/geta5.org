# Ascendly — Agent Reference (PRD)

> **What's here:** Data schemas, agent role specs + reading lists, handoff format, SEO, parallel content pipeline.
> **What's NOT here (do not re-read if you already have CLAUDE.md):**
> - Project overview, tech stack, critical rules, phase tracker, decisions → `CLAUDE.md`
> - UI tokens, component specs, pre-delivery checklist → `design-system/ascendly/MASTER.md`
> - Current phase position, session continuity → `.planning/STATE.md`
> - Requirements checklist, out-of-scope → `.planning/PROJECT.md`
> - Content wave orchestration → `.planning/CONTENT-WAVES.md`

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

## data_schemas

> **Canonical source of truth:** `data/schemas/*.schema.json` files.
> The examples below show the exact JSON format that the app code expects.
> Content agents MUST match this format exactly — any deviation will break rendering.

### MCQ File Format (`/public/data/[subject]/mcq/unit-[n].json`)

Each file is a **wrapper object** containing a `questions` array:

```json
{
  "subject": "ap-psychology",
  "unit": "unit-1",
  "unit_name": "Biological Bases of Behavior",
  "questions": [
    {
      "id": "psych-u1-q001",
      "unit": "unit-1",
      "subject": "ap-psychology",
      "difficulty": "easy",
      "stimulus": { "type": "none" },
      "question": "Which part of the neuron receives incoming signals from other neurons?",
      "choices": [
        { "id": "A", "text": "Dendrites", "is_correct": true, "explanation": "Dendrites are branching extensions that receive signals from other neurons and transmit them toward the cell body." },
        { "id": "B", "text": "Axon terminals", "is_correct": false, "explanation": "Axon terminals release neurotransmitters to send signals — they transmit outgoing signals, not receive incoming ones." },
        { "id": "C", "text": "Myelin sheath", "is_correct": false, "explanation": "The myelin sheath insulates the axon to speed up signal transmission; it does not receive signals." },
        { "id": "D", "text": "Nucleus", "is_correct": false, "explanation": "The nucleus contains the cell's DNA and directs cell functions, but is not involved in receiving neural signals." }
      ],
      "unit_objective": "PSY-1.A.1"
    }
  ]
}
```

**Required fields per question:** `id`, `unit`, `subject`, `difficulty` (easy|medium|hard), `stimulus` (object with `type` + optional `content`), `question` (string), `choices` (exactly 4, ids A–D, each with `id`/`text`/`is_correct`/`explanation`), `unit_objective`.

**Key rules:**
- Exactly one choice has `is_correct: true`
- Choices stored in A/B/C/D order — scrambled at render time only (Critical Rule #4)
- `explanation` is inline per choice — NOT a separate object
- `question` field, NOT `stem`

### Stimulus Types (embedded in MCQ `stimulus` field)

**No stimulus:**
```json
{ "type": "none" }
```

**Text passage:**
```json
{
  "type": "text",
  "content": "A researcher studies a patient who suffered damage to the left hemisphere..."
}
```

**Table:**
```json
{
  "type": "table",
  "content": {
    "headers": ["Neurotransmitter", "Primary Function"],
    "rows": [
      ["Dopamine", "Reward, motivation, motor control"],
      ["Serotonin", "Mood regulation, sleep"]
    ]
  }
}
```

**Chart (Chart.js config):**
```json
{
  "type": "chart",
  "content": {
    "type": "line",
    "data": {
      "labels": [1960, 1970, 1980, 1990, 2000],
      "datasets": [{
        "label": "Population (millions)",
        "data": [10, 15, 22, 31, 45],
        "borderColor": "#4ade80"
      }]
    }
  }
}
```

**College Board pseudocode (AP CSP only):**
```json
{
  "type": "code",
  "content": "PROCEDURE findMax(numList)\n{\n  max ← numList[1]\n  FOR EACH item IN numList\n  {\n    IF (item > max)\n    {\n      max ← item\n    }\n  }\n  RETURN max\n}"
}
```

### Drill File Format (`/public/data/[subject]/drills/unit-[n].json`)

Each file is a **wrapper object** containing a `cards` array:

```json
{
  "subject": "ap-psychology",
  "unit": "unit-1",
  "unit_name": "Biological Bases of Behavior",
  "cards": [
    {
      "id": "psych-u1-d001",
      "unit": "unit-1",
      "subject": "ap-psychology",
      "mode": "definition_to_term",
      "prompt": "The neurological process by which we assign meaning to stimuli through our prior experiences and expectations",
      "answer": "Top-down processing",
      "is_key_term": true,
      "difficulty": "medium"
    },
    {
      "id": "psych-u1-d002",
      "unit": "unit-1",
      "subject": "ap-psychology",
      "mode": "significance_to_person",
      "prompt": "Developed classical conditioning through experiments with dogs and salivation",
      "answer": "Ivan Pavlov",
      "is_key_term": false,
      "difficulty": "easy"
    },
    {
      "id": "calc-u1-d001",
      "unit": "unit-1",
      "subject": "ap-calculus-ab",
      "mode": "name_to_formula",
      "prompt": "Power Rule",
      "answer": "\\frac{d}{dx}[x^n] = nx^{n-1}",
      "is_key_term": true,
      "difficulty": "easy",
      "katex_required": true,
      "format_hint": "Use x^n for exponents"
    },
    {
      "id": "psych-u1-d010",
      "unit": "unit-1",
      "subject": "ap-psychology",
      "mode": "concept_mc",
      "prompt": "A researcher gives participants a word list, waits 30 minutes, then tests recall. Participants remember the first and last words best. Which phenomenon does this demonstrate?",
      "answer": "",
      "is_key_term": false,
      "difficulty": "medium",
      "choices": [
        { "text": "Serial position effect", "is_correct": true, "explanation": "The primacy and recency effects together form the serial position effect — better recall at both ends of a list." },
        { "text": "Proactive interference", "is_correct": false, "explanation": "Proactive interference is when older memories disrupt recall of newer ones — not relevant to position-based recall patterns." },
        { "text": "Encoding specificity", "is_correct": false, "explanation": "Encoding specificity is about matching retrieval cues to encoding context, not about list position." },
        { "text": "Spacing effect", "is_correct": false, "explanation": "The spacing effect is about distributed practice over time improving recall, not about position within a single list." }
      ]
    }
  ]
}
```

**Required fields per card:** `id`, `unit`, `subject`, `mode`, `prompt`, `answer`, `difficulty`, `is_key_term`.
**Optional fields:** `katex_required` (boolean — name_to_formula only), `format_hint` (string — name_to_formula only), `choices` (array — concept_mc only).

**Rules:**
- **No `alternate_answers`** — exactly one canonical answer per card
- `is_key_term: true` on 8–15 cards per unit; never on `concept_mc` cards
- `answer` field is empty string `""` for `concept_mc` (correctness via `choices[].is_correct`)

**Drill modes:**
| Mode | Prompt | Answer | Subjects |
|------|--------|--------|----------|
| `definition_to_term` | Definition of a concept | The term | All |
| `significance_to_person` | What someone is known for | Person's name | Psych, World, Gov |
| `significance_to_event` | What an event is / its impact | Event name | World History |
| `significance_to_case` | What a case established | Case name (e.g. *Marbury v. Madison*) | Gov |
| `name_to_formula` | Formula name | Typed formula (student uses simple notation, live KaTeX preview) | Calc, Precalc, Chemistry |
| `concept_mc` | Short scenario or question | Select correct choice | All |

**Subject drill profiles (typed-recall : MC split):**
| Subject | Active Typed-Recall Modes | Split |
|---------|--------------------------|-------|
| AP Psychology | `definition_to_term`, `significance_to_person` | 75:25 |
| AP World History | `definition_to_term`, `significance_to_person`, `significance_to_event` | 75:25 |
| AP Government | `definition_to_term`, `significance_to_person`, `significance_to_case` | 70:30 |
| AP Calculus AB | `name_to_formula`, `definition_to_term` | 65:35 |
| AP Precalculus | `name_to_formula`, `definition_to_term` | 70:30 |
| AP CSP | `definition_to_term` | 50:50 |
| AP Chemistry | `name_to_formula`, `definition_to_term` | 60:40 |

### Study Guide File Format (`/public/data/[subject]/study-guide/unit-[n].json`)

Single object (NO wrapper):

```json
{
  "id": "psy-sg-unit-1",
  "unit": "Unit 1",
  "subject": "AP Psychology",
  "theme": "The nervous system coordinates all behavior and mental processes through electrochemical signals.",
  "core_concepts": [
    "Neurons are the basic building blocks of the nervous system — each consists of a cell body, dendrites, and an axon.",
    "Resting membrane potential is approximately $-70$ mV; action potentials fire when threshold of $-55$ mV is crossed."
  ],
  "formulas": [
    {
      "name": "Resting Membrane Potential",
      "katex_string": "V_{rest} \\approx -70 \\text{ mV}"
    }
  ],
  "exam_tip": "FRQ questions often ask you to apply brain region knowledge to a case study — always name the specific lobe."
}
```

**Required fields:** `id`, `unit`, `subject`, `theme`, `core_concepts` (5–8 strings), `exam_tip`.
**Optional fields:** `formulas` (array of `{name, katex_string}`), `diagrams` (array of `{type, data}`).

> **Key terms removed from study guide schema.** The study guide page renders its "Key Terms" section by reading all drill cards for that unit where `is_key_term: true` (term = card.answer, definition = card.prompt). This eliminates divergence — one source of truth.

**KaTeX in text fields:** `core_concepts`, `definition`, and `exam_tip` fields may contain inline math using `$...$` delimiters. The StudyGuide component parses these and renders through KatexRenderer.

### Subject Meta File Format (`/public/data/[subject]/meta.json`)

```json
{
  "subject_id": "ap-psychology",
  "subject_name": "AP Psychology",
  "exam_date": "2026-05-05",
  "total_mcq_count": 100,
  "units": [
    {
      "unit_id": "unit-1",
      "unit_name": "Biological Bases of Behavior",
      "unit_number": 1,
      "college_board_percentage": 8,
      "learning_objectives": ["PSY-1.A", "PSY-1.B", "PSY-1.C"]
    }
  ]
}
```

**Required fields:** `subject_id`, `subject_name`, `exam_date`, `total_mcq_count`, `units` array.
**Per-unit required:** `unit_id`, `unit_name`, `unit_number`, `college_board_percentage`, `learning_objectives`.

---

## coding_agent_team

### Planner

**Required reading before starting (in this order):**
1. `CLAUDE.md` — full context: tech stack, critical rules, phase tracker, decisions log
2. `design-system/ascendly/MASTER.md` — UI tokens and component specs (if task involves UI)
3. `design-system/ascendly/pages/[page].md` — page-specific overrides if file exists
4. `.planning/STATE.md` — current phase position and recent decisions
5. `.planning/codebase/` — STRUCTURE.md and CONVENTIONS.md at minimum; others as needed

**Responsibilities:**
- Breaks work into discrete, testable objectives (one objective = one verifiable outcome)
- Defines acceptance criteria for each objective — Tester uses these verbatim
- Identifies files to create/modify, component contracts, data shapes, and edge cases
- **Output:** Task list with objectives, file map, acceptance criteria, open questions

### Coder

**Required reading before starting (in this order):**
1. Planner's written plan (received via handoff — do not start without it)
2. `CLAUDE.md` → Critical Rules
3. `design-system/ascendly/MASTER.md` (if task involves UI)
4. Any existing files being modified — read before editing

**Responsibilities:**
- Implements exactly what the plan specifies
- TypeScript strictly — no `any` types
- **Output:** Working implementation + summary of what was built and any deviations

### Reviewer (Code)

**Required reading before starting (in this order):**
1. Coder's output + Planner's original plan (received via handoff)
2. `CLAUDE.md` → Critical Rules (the checklist to verify against)
3. `design-system/ascendly/MASTER.md` → Pre-Delivery Checklist (if UI work)

**Responsibilities:**
- Checks bugs, TypeScript correctness, Critical Rules compliance, schema adherence
- Verifies KaTeX, mobile responsiveness, dark mode correctness
- Verifies answer scrambling correctness (20+ render test) when applicable
- **Output:** Approved (with notes) OR Rejected (exact file, line, issue, required fix) → returns to Coder

### Tester

**Required reading before starting (in this order):**
1. Planner's acceptance criteria + Reviewer's approval (received via handoff)
2. `CLAUDE.md` → localStorage keys (to verify read/write correctness)

**Responsibilities:**
- Tests each objective: does the implementation actually satisfy it?
- Checks real content renders (no placeholder text), localStorage reads/writes, Supabase fires silently
- **Output:** Pass OR Fail (lists failed objectives) → returns to Coder on failure

---

## content_agent_team

> **For parallel content generation (Phases 6–12):** see `.planning/CONTENT-WAVES.md` for wave orchestration.
> Each content agent runs the full pipeline below autonomously within its worktree.

### Researcher

**Model:** Sonnet (structured web research + summarization — judgment-light)

**Required reading before starting (in this order):**
1. `CLAUDE.md` → Content Standards Summary, Critical Rules, Subjects list
2. `docs/superpowers/specs/2026-03-26-drill-mcq-redesign.md` — **mandatory** drill mode taxonomy, MCQ realism standards, distractor quality rules, stimulus rate targets
3. `docs/PRD.md` → `data_schemas` section (understand all JSON field requirements + stimulus types)
4. `data/schemas/*.schema.json` — canonical JSON schemas (these override PRD examples if any conflict)
5. `public/data/ap-psychology/` — all 3 fixture files as calibration reference for style and depth
6. Phase-specific `XX-CONTEXT.md` — subject details, unit list, special rules
7. Web research: College Board CED for the target subject (official course description + exam format)
- Do NOT read `design-system/ascendly/MASTER.md` — UI only, irrelevant to content

**Responsibilities:**
- Researches College Board curriculum: CED, exam format, question types, stimulus types, skill categories, difficulty distribution
- Identifies all testable terms, formulas, people, concepts, events, common misconceptions
- Records which stimulus types apply to each unit (text / table / chart / code / none)
- Produces `meta.json` data: unit names, CB percentage weights, learning objective codes
- For AP Chemistry: catalogs all equations needing KaTeX, confirms they are balanced
- For AP CSP: identifies all pseudocode patterns from the real exam (College Board syntax only)
- **Output:** Research brief (RESEARCH.md) + draft meta.json — everything Writer needs for accurate content

### Planner (Content)

**Model:** Sonnet (structured planning against a known schema — judgment-light)

**Required reading before starting (in this order):**
1. Researcher's RESEARCH.md (received via handoff — do not start without it)
2. `docs/superpowers/specs/2026-03-26-drill-mcq-redesign.md` — drill profiles per subject (typed:MC split), MCQ stimulus rate targets, distractor quality standards
3. `docs/PRD.md` → `data_schemas` section (understand output requirements per file type)
4. Phase-specific `XX-CONTEXT.md` — unit list and subject-specific rules

**Responsibilities:**
- Reads RESEARCH.md and produces a structured PLAN.md for the Writer to execute against
- Maps each College Board learning objective to specific question types (which unit, what difficulty, what stimulus type)
- Ensures the 20/45/35 difficulty split is planned explicitly per unit before writing begins
- Identifies which units need stimulus-based questions (text passage / table / chart / code) vs. standalone
- Lists all testable terms, people, events, formulas that drills must cover — acts as a drill coverage checklist
- For AP CSP: identifies which pseudocode patterns are required per unit from the CED
- **Output:** PLAN.md — per-unit question plan with topic map, stimulus types, difficulty targets, drill coverage list

### Writer

**Model:** Sonnet (JSON generation against explicit schema — mechanical, high-volume)

**Required reading before starting (in this order):**
1. Planner's PLAN.md (received via handoff — do not start without it)
2. Researcher's RESEARCH.md (received alongside PLAN.md)
3. `docs/superpowers/specs/2026-03-26-drill-mcq-redesign.md` — drill mode taxonomy, single canonical answer rule, is_key_term rules, concept_mc format, MCQ distractor quality, CB question language
4. `docs/PRD.md` → `data_schemas` section (the exact JSON structure to output)
5. `data/schemas/*.schema.json` — validate output structure against these
6. `public/data/ap-psychology/` — fixture files as format calibration
7. `CLAUDE.md` → Critical Rules (KaTeX, scramble, pseudocode rules)
- Do NOT read `design-system/ascendly/MASTER.md` — UI only, irrelevant

**Responsibilities:**
- Writes MCQs, drills, and study guides following content standards exactly
- Per-choice explanations for every MCQ option (correct + all distractors)
- College Board pseudocode for AP CSP only — never real Python/Java
- All formulas in KaTeX — never plain text math
- Scrambles nothing in JSON — scrambling at render time only
- Maintains difficulty distribution: 20% easy / 45% medium / 35% hard (±5%)
- **Output:** Complete JSON files matching canonical schemas + wrapper format

### Reviewer (Content)

**Model:** Sonnet (Opus only for AP Calculus AB and AP Chemistry — KaTeX/equation correctness is highest risk there)

**Required reading before starting (in this order):**
1. Writer's JSON output + Researcher's RESEARCH.md + Planner's PLAN.md (received via handoff)
2. `docs/superpowers/specs/2026-03-26-drill-mcq-redesign.md` — the checklist of what the Reviewer must verify
3. `docs/PRD.md` → `data_schemas` (verify structure compliance)
4. `data/schemas/*.schema.json` — validate every file against schema
5. `.planning/CONTENT-WAVES.md` → Quality Gates table
6. `CLAUDE.md` → Critical Rules (verify KaTeX, scramble, pseudocode, per-choice explanation rules)
- Do NOT read `design-system/ascendly/MASTER.md` — UI only, irrelevant

**Responsibilities:**
- Runs ALL 10 quality gates from CONTENT-WAVES.md (G1–G10)
- Verifies curriculum alignment, difficulty tags, plausible distractors, correct answers
- Verifies all per-choice explanations are accurate and specific (not vague)
- Verifies all formulas are valid KaTeX — no plain text math
- Verifies difficulty distribution per unit (20/45/35 ±5%)
- Verifies ID uniqueness within the subject
- For AP Chemistry: verifies all equations are balanced (Chemistry Checker gate)
- For AP CSP: verifies no Python/Java — College Board pseudocode only
- **Output:** Approved OR Rejected (exact file, question index, issue, required fix) → returns to Writer

---

## agent_team_communication

### Full Pipeline (Content → Code)
1. **Researcher** performs College Board CED web research, produces RESEARCH.md + draft meta.json
2. **Researcher → Planner (Content):** RESEARCH.md handoff
3. **Planner (Content)** produces PLAN.md (per-unit topic map, stimulus types, difficulty targets, drill coverage list)
4. **Planner → Writer:** PLAN.md + RESEARCH.md handoff
5. **Writer** completes JSON files per PLAN.md
6. **Writer → Reviewer (Content):** JSON files + RESEARCH.md + PLAN.md
7. **Reviewer (Content)** approves OR rejects back to Writer with specific issues
8. **Reviewer (Content) → Planner (Code):** approved JSON + unit spec
9. **Planner (Code)** produces implementation plan (objectives, file map, acceptance criteria)
10. **Planner → Coder:** written plan
11. **Coder** implements
12. **Coder → Reviewer (Code):** implementation + plan summary
13. **Reviewer (Code)** approves OR rejects back to Coder with exact file/line/issue
14. **Reviewer (Code) → Tester:** approved code + Planner's acceptance criteria
15. **Tester** tests each objective — passes OR fails back to Coder with failed objectives
16. **Tester passes** → unit marked done in phase tracker, CLAUDE.md updated

### Parallel Content Pipeline (Phases 6–12)

For parallel execution, steps 9–16 (code integration) are **deferred** until all content is generated. The content agents only run steps 1–8:

```
Per worktree agent:
  1. Researcher → RESEARCH.md + draft meta.json (via College Board CED web research)
  2. Planner → PLAN.md (per-unit topic/stimulus/difficulty breakdown + drill coverage list)
  3. Writer → all unit JSON files (drills/ + mcq/ + study-guide/ + meta.json)
  4. Reviewer (Content) → approve or reject back to Writer
  5. On approval → atomic commit in worktree branch
  6. Branch merged to master after wave gate check
```

Code integration (steps 9–16) is unnecessary because the UI components (Phases 2–5) already handle all JSON formats. Content files just need to exist in the right paths.

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
- No agent marks work done without appropriate downstream approval
- Rejections go back exactly one step — not to the start of the pipeline
- CLAUDE.md phase tracker updated immediately when a unit reaches Tester pass
