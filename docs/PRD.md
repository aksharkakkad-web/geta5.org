# Ascendly — Agent Reference (PRD)

> **What's here:** Data schemas, agent role specs + reading lists, handoff format, SEO.
> **What's NOT here (do not re-read if you already have CLAUDE.md):**
> - Project overview, tech stack, critical rules, phase tracker, decisions → `CLAUDE.md`
> - UI tokens, component specs, pre-delivery checklist → `design-system/ascendly/MASTER.md`
> - Current phase position, session continuity → `.planning/STATE.md`
> - Requirements checklist, out-of-scope → `.planning/PROJECT.md`

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

### MCQ Schema (`/public/data/[subject]/mcq/unit-[n].json`)

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
      },
      "unit_objective": "CED-1.A"
    }
  ]
}
```

**Required fields per question:** id, difficulty (easy|medium|hard), stimulus (null or object), stem, choices (exactly 4, letters A–D), correct (letter), explanations (object keyed A–D with per-choice text), unit_objective.

### Drill Schema (`/public/data/[subject]/drills/unit-[n].json`)

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

**Required fields per card:** id, type (flashcard|fill-in), front+back (flashcard) or prompt+answer (fill-in). hint is optional.

### Study Guide Schema (`/public/data/[subject]/study-guide/unit-[n].json`)

> **KaTeX in text fields:** The `definition`, `exam_tip`, and `content` fields may contain inline math using `$...$` delimiters (e.g. `"...written as $\lim_{x \to c} f(x)$"`). The StudyGuide component must parse these fields for `$...$` markers and render them through KatexRenderer inline. Never store raw LaTeX without delimiters — it will render as plain text.

```json
{
  "subject": "ap-calculus-ab",
  "unit": "1",
  "unit_name": "Limits and Continuity",
  "theme": "Understanding how functions behave as inputs approach a value — the foundation of all calculus.",
  "core_concepts": [
    {
      "title": "The Limit Concept",
      "content": "A limit describes the value a function approaches as the input approaches a given point."
    }
  ],
  "key_terms": [
    {
      "term": "Limit",
      "definition": "The value that a function f(x) approaches as x approaches a given value c, written as $\\lim_{x \\to c} f(x)$."
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
  "exam_tip": "On the AP exam, if a limit question involves 0/0 or ∞/∞, immediately apply L'Hôpital's Rule or factor/cancel."
}
```

### Stimulus Schema (embedded in MCQ `stimulus` field)

**Graph stimulus:**
```json
{
  "type": "graph",
  "chart_type": "line",
  "title": "Population Growth Over Time",
  "x_label": "Year",
  "y_label": "Population (millions)",
  "datasets": [
    { "label": "Country A", "data": [10, 15, 22, 31, 45], "color": "#4ade80" }
  ],
  "x_values": [1960, 1970, 1980, 1990, 2000]
}
```

**Text passage stimulus:**
```json
{ "type": "passage", "text": "The following excerpt is from a 1948 speech by President Harry Truman..." }
```

**Table stimulus:**
```json
{
  "type": "table",
  "headers": ["Element", "Atomic Number", "Atomic Mass"],
  "rows": [["Hydrogen", "1", "1.008"], ["Helium", "2", "4.003"]]
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

### Researcher

**Required reading before starting (in this order):**
1. `CLAUDE.md` → Content Standards Summary, Critical Rules, Subjects list
2. `docs/PRD.md` → `data_schemas` section (understand all JSON field requirements + stimulus types)
3. `public/data/[subject]/mcq/unit-1.json` if it exists — use as a calibration reference for style and depth
4. Web research: College Board CED for the target subject (official course description + exam format)
- Do NOT read `design-system/ascendly/MASTER.md` — UI only, irrelevant to content

**Responsibilities:**
- Researches College Board curriculum: CED, exam format, question types, stimulus types, skill categories, difficulty distribution
- Identifies all testable terms, formulas, people, concepts, events, common misconceptions
- Records which stimulus types apply to this unit (passage / table / graph / pseudocode / none)
- For AP Chemistry: catalogs all equations needing KaTeX, confirms they are balanced
- For AP CSP: identifies all pseudocode patterns from the real exam (College Board syntax only)
- **Output:** Research brief — everything Writer needs for accurate, on-spec content

### Writer

**Required reading before starting (in this order):**
1. Researcher's brief (received via handoff — do not start without it)
2. `docs/PRD.md` → `data_schemas` section (the exact JSON structure to output)
3. `CLAUDE.md` → Critical Rules (KaTeX, scramble, pseudocode rules)
- Do NOT read `design-system/ascendly/MASTER.md` — UI only, irrelevant

**Responsibilities:**
- Writes MCQs, drills, and study guides following content standards exactly
- Per-choice explanations for every MCQ option (correct + all distractors)
- College Board pseudocode for AP CSP only — never real Python/Java
- All formulas in KaTeX — never plain text math
- Scrambles nothing in JSON — scrambling at render time only
- **Output:** Complete JSON files matching canonical schemas

### Reviewer

**Required reading before starting (in this order):**
1. Writer's JSON output + Researcher's brief (received via handoff)
2. `docs/PRD.md` → `data_schemas` (verify structure compliance)
3. `CLAUDE.md` → Critical Rules (verify KaTeX, scramble, pseudocode, per-choice explanation rules)
- Do NOT read `design-system/ascendly/MASTER.md` — UI only, irrelevant

**Responsibilities:**
- Verifies curriculum alignment, difficulty tags, plausible distractors, correct answers
- Verifies all per-choice explanations are accurate and clear
- Verifies all formulas are valid KaTeX — no plain text math
- For AP Chemistry: verifies all equations are balanced
- **Output:** Approved OR Rejected (exact question index, issue, required fix) → returns to Writer

---

## agent_team_communication

### Full Pipeline (Content → Code)
1. **Researcher** completes research brief for subject/unit
2. **Researcher → Writer:** research brief with subject, unit, all findings
3. **Writer** completes JSON files
4. **Writer → Reviewer (Content):** JSON files + research brief
5. **Reviewer (Content)** approves OR rejects back to Writer with specific issues
6. **Reviewer (Content) → Planner:** approved JSON + unit spec
7. **Planner** produces implementation plan (objectives, file map, acceptance criteria)
8. **Planner → Coder:** written plan
9. **Coder** implements
10. **Coder → Reviewer (Code):** implementation + plan summary
11. **Reviewer (Code)** approves OR rejects back to Coder with exact file/line/issue
12. **Reviewer (Code) → Tester:** approved code + Planner's acceptance criteria
13. **Tester** tests each objective — passes OR fails back to Coder with failed objectives
14. **Tester passes** → unit marked done in phase tracker, CLAUDE.md updated

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
