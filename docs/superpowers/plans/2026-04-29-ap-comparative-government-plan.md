# AP Comparative Government Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add AP Comparative Government as 9th subject — full content suite (drills, MCQ, study guide, vocab via drills) + new "Countries" hub (mirrors `docs-cases`) + FRQ scaffolding ready for user to drop in CB PDFs later.

**Architecture:** Reuse existing dynamic `[subject]` routing. Add new `/countries` route mirroring `/docs-cases` (Comp-Gov-only, by slug). New `countries.json` data file with country items keyed by regime category. Subagent-driven content generation in parallel: one Researcher (Sonnet), three content Writers (Sonnet) for drills/MCQ/study-guide, one Countries Writer (Sonnet), one Adi Writer (Sonnet), one Reviewer (Sonnet). UI scaffolding done in main thread by adapting `components/docs-cases/`.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind v4, KaTeX, Sonnet subagents, JSON Schema validation, Python FRQ extractor (deferred — stub script).

**Spec:** [`docs/superpowers/specs/2026-04-29-ap-comparative-government-design.md`](../specs/2026-04-29-ap-comparative-government-design.md)

**CED reference:** `.planning/ced-outlines/ap-comparative-government-and-politics-CED.md` (1,097 lines)

---

## Track 1 — Plumbing (sequential, must complete before Track 2)

### Task 1.1: Register subject in subjects.ts

**Files:**
- Modify: `utils/subjects.ts:124` (insert before closing `]`)

- [x] **Step 1: Add new subject entry to SUBJECTS array**

Insert as the 9th and final subject entry (after `ap-chemistry`):

```ts
  {
    slug: 'ap-comparative-government',
    name: 'AP Comp Gov',
    examDate: '2026-05-05T12:00:00',
    units: [
      { number: 1, name: 'Political Systems, Regimes, and Governments' },
      { number: 2, name: 'Political Institutions' },
      { number: 3, name: 'Political Culture and Participation' },
      { number: 4, name: 'Party and Electoral Systems and Citizen Organizations' },
      { number: 5, name: 'Political and Economic Changes and Development' },
    ],
  },
```

- [x] **Step 2: TypeScript check passes**

Run: `npx tsc --noEmit utils/subjects.ts`
Expected: no errors

### Task 1.2: Add SVG icon

**Files:**
- Modify: `components/3d/SubjectIcon.tsx:163` (insert before closing `}` of ICONS map)

- [x] **Step 1: Add icon entry**

Insert into the `ICONS` map (before the closing `}` and after the `'ap-chemistry'` entry):

```tsx
  'ap-comparative-government': {
    colors: ['#fda4af', '#e11d48', '#fb7185'],
    lightColors: ['#9f1239', '#881337', '#be123c'],
    glow: '#e11d48',
    lightGlow: '#9f1239',
    render: (c, gid) => (
      <>
        {/* Globe outline (wireframe — distinct from world-history's filled globe) */}
        <circle cx="40" cy="32" r="20" fill="none" stroke={`url(#${gid})`} strokeWidth="2" />
        {/* Latitude lines */}
        <ellipse cx="40" cy="32" rx="20" ry="6" fill="none" stroke={c[2]} strokeWidth="0.7" opacity={0.5} />
        <ellipse cx="40" cy="32" rx="20" ry="14" fill="none" stroke={c[2]} strokeWidth="0.7" opacity={0.4} />
        {/* Longitude line (vertical meridian) */}
        <ellipse cx="40" cy="32" rx="6" ry="20" fill="none" stroke={c[2]} strokeWidth="0.7" opacity={0.5} />
        {/* Six country pins — distributed across globe */}
        <circle cx="32" cy="22" r="2" fill={c[1]} />
        <circle cx="48" cy="24" r="2" fill={c[1]} />
        <circle cx="28" cy="34" r="2" fill={c[1]} />
        <circle cx="52" cy="36" r="2" fill={c[1]} />
        <circle cx="36" cy="44" r="2" fill={c[1]} />
        <circle cx="46" cy="46" r="2" fill={c[1]} />
        {/* Inner highlight on a couple of pins */}
        <circle cx="32" cy="22" r="0.8" fill={c[2]} opacity={0.9} />
        <circle cx="48" cy="24" r="0.8" fill={c[2]} opacity={0.9} />
      </>
    ),
  },
```

- [x] **Step 2: TypeScript check**

Run: `npx tsc --noEmit components/3d/SubjectIcon.tsx`
Expected: no errors

### Task 1.3: Extend frq_type enum with comparative_analysis

**Files:**
- Modify: `data/schemas/frq.schema.json:30-43`

- [x] **Step 1: Add `comparative_analysis` to frq_type enum**

Update the enum array under `properties.frq_type.enum` to include `"comparative_analysis"` as the last entry. The full enum becomes:

```json
"enum": [
  "multi_part_math",
  "multi_part_text",
  "dbq",
  "saq",
  "leq",
  "essay",
  "argument_essay",
  "concept_application",
  "scotus_comparison",
  "quantitative_analysis",
  "comparative_analysis"
]
```

Update the description after the enum to add: `comparative_analysis: AP Comp Gov-specific FRQ-3 — student compares two course countries on a given political concept; renders as multi-part text.`

- [x] **Step 2: Validate schema is parseable**

Run: `node -e "JSON.parse(require('fs').readFileSync('data/schemas/frq.schema.json'))"`
Expected: no output (success)

### Task 1.4: Create countries schema

**Files:**
- Create: `data/schemas/countries.schema.json`

- [x] **Step 1: Write schema file**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Countries",
  "description": "Per-subject country reference (currently AP Comparative Government only)",
  "type": "object",
  "required": ["subject", "items"],
  "properties": {
    "subject": { "type": "string" },
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "id", "title", "regime_type", "regime_category",
          "byline", "key_takeaway", "summary",
          "key_institutions", "required_cases", "comparative_themes",
          "paired_with", "exam_appearance", "sections", "adi_prompts"
        ],
        "properties": {
          "id": { "type": "string", "enum": ["uk", "russia", "china", "iran", "mexico", "nigeria"] },
          "title": { "type": "string" },
          "regime_type": { "type": "string" },
          "regime_category": { "type": "string", "enum": ["democratic", "hybrid", "authoritarian"] },
          "byline": { "type": "string" },
          "key_takeaway": { "type": "string" },
          "summary": { "type": "string" },
          "key_institutions": { "type": "array", "items": { "type": "string" } },
          "required_cases": { "type": "array", "items": { "type": "string" } },
          "comparative_themes": { "type": "array", "items": { "type": "string" } },
          "paired_with": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["id", "title", "relation"],
              "properties": {
                "id": { "type": "string" },
                "title": { "type": "string" },
                "relation": { "type": "string" }
              }
            }
          },
          "exam_appearance": { "type": "string" },
          "sections": {
            "type": "array",
            "minItems": 5,
            "maxItems": 5,
            "items": {
              "type": "object",
              "required": ["label", "title", "blurb", "adi_prompt"],
              "properties": {
                "label": { "type": "string" },
                "title": { "type": "string" },
                "blurb": { "type": "string" },
                "adi_prompt": { "type": "string" }
              }
            }
          },
          "adi_prompts": {
            "type": "object",
            "required": ["quiz", "explain"],
            "properties": {
              "quiz": { "type": "string" },
              "explain": { "type": "string" }
            }
          }
        }
      }
    }
  }
}
```

- [x] **Step 2: Validate schema is parseable**

Run: `node -e "JSON.parse(require('fs').readFileSync('data/schemas/countries.schema.json'))"`
Expected: no output (success)

### Task 1.5: Create empty data directory + FRQ scaffold

**Files:**
- Create: `public/data/ap-comparative-government/frq/manifest.json`
- Create: `public/data/ap-comparative-government/frq/images/image-manifest.json`
- Create: `content-sources/frq-pdfs/ap-comparative-government/questions/.gitkeep`
- Create: `content-sources/frq-pdfs/ap-comparative-government/scoring-guidelines/.gitkeep`

- [x] **Step 1: Create empty manifest**

`public/data/ap-comparative-government/frq/manifest.json`:
```json
[]
```

- [x] **Step 2: Create empty image manifest**

`public/data/ap-comparative-government/frq/images/image-manifest.json`:
```json
{}
```

- [x] **Step 3: Create source PDF holding directories**

```bash
mkdir -p content-sources/frq-pdfs/ap-comparative-government/questions
mkdir -p content-sources/frq-pdfs/ap-comparative-government/scoring-guidelines
touch content-sources/frq-pdfs/ap-comparative-government/questions/.gitkeep
touch content-sources/frq-pdfs/ap-comparative-government/scoring-guidelines/.gitkeep
```

### Task 1.6: Create Python FRQ extractor stub

**Files:**
- Create: `scripts/extract_comp_gov_frq.py`

- [x] **Step 1: Write extractor stub adapted from extract_gov_frq.py**

Read the existing `scripts/extract_gov_frq.py` to use as a template, then create `scripts/extract_comp_gov_frq.py` with:
- Same paired-PDF parsing pattern (questions + scoring-guidelines)
- ID prefix: `comp-gov-`
- Subject slug: `ap-comparative-government`
- frq_type mapping: FRQ-1 → `conceptual_analysis`, FRQ-2 → `quantitative_analysis`, FRQ-3 → `comparative_analysis`, FRQ-4 → `argument_essay`
- Header docstring explicitly noting: "No PDFs collected yet — script ready to run when content-sources/frq-pdfs/ap-comparative-government/ is populated."
- Print a clear "no PDFs found, exiting" message when called with empty source dirs (do not error)

- [x] **Step 2: Smoke test: run with empty dirs, expect graceful exit**

Run: `python scripts/extract_comp_gov_frq.py`
Expected: exit code 0, message like "No FRQ PDFs found in content-sources/frq-pdfs/ap-comparative-government/questions/ — nothing to extract."

### Task 1.7: Commit plumbing

- [x] **Step 1: Stage and commit**

```bash
git add utils/subjects.ts \
  components/3d/SubjectIcon.tsx \
  data/schemas/frq.schema.json \
  data/schemas/countries.schema.json \
  public/data/ap-comparative-government/ \
  content-sources/frq-pdfs/ap-comparative-government/ \
  scripts/extract_comp_gov_frq.py
git commit -m "feat(comp-gov): scaffold subject plumbing — registration, icon, FRQ stubs"
```

---

## Track 2 — Researcher subagent (blocks Tracks 3 + 4)

### Task 2.1: Dispatch Researcher subagent

**Files:**
- Create: `.planning/phases/15-ap-comparative-government-content/RESEARCH.md` (subagent output)
- Create: `.planning/phases/15-ap-comparative-government-content/meta-draft.json` (subagent output)
- Create: `.planning/phases/15-ap-comparative-government-content/15-CONTEXT.md` (manually before dispatch)

- [ ] **Step 1: Write phase CONTEXT.md (sets the rules for this content phase)**

Create `.planning/phases/15-ap-comparative-government-content/15-CONTEXT.md`:

```markdown
# Phase 15 Context — AP Comparative Government Content

**Wave:** Standalone (post-launch addition, not part of original waves)
**Subject slug:** `ap-comparative-government`
**ID prefix:** `comp-gov`
**Display name:** AP Comp Gov

## CED Source (single source of truth)
`.planning/ced-outlines/ap-comparative-government-and-politics-CED.md` (extracted from CB PDF 2026-04-29).

All unit names, weights, learning objectives, key terms, and country examples come from this markdown — nowhere else. No web research permitted for content selection.

## Unit Structure (verified from CED)
| Unit | Name | CB Weight |
|------|------|-----------|
| 1 | Political Systems, Regimes, and Governments | 18–27% |
| 2 | Political Institutions | 22–33% |
| 3 | Political Culture and Participation | 11–18% |
| 4 | Party and Electoral Systems and Citizen Organizations | 13–18% |
| 5 | Political and Economic Changes and Development | 16–24% |

## Course Countries
**Six** countries: China, Iran, Mexico, Nigeria, Russia, United Kingdom. (Note: 6, not 5.)

## Drill Modes (typed:MC = 70:30)
- `definition_to_term` — political concepts, institutions, regime terms
- `significance_to_person` — Putin, Xi, Khamenei, AMLO, Obasanjo, Cameron/Sunak/Starmer (current PM at time of CED), etc.
- `significance_to_event` — 1979 Iranian Revolution, 1991 Soviet collapse, 1994 Mexican peso crisis, 2014 Crimea annexation, etc.
- `concept_mc` — comparative scenarios (1–3 sentences)
- 8–15 `is_key_term: true` per unit (typed-recall only, never concept_mc)
- No `name_to_formula`, no `significance_to_case`

## MCQ Standards
- ~85% stimulus rate (text passages, charts, tables — comparative subject)
- 50–100 MCQs per unit (target ~75)
- 20/45/35 easy/medium/hard
- College Board register: "Which of the following best explains…"
- Per-choice explanations required
- Stimuli: comparative tables (e.g., GDP per capita across 6 countries), party system diagrams, electoral system charts, country-specific text passages

## Study Guide Standards
- One per unit, key terms sourced from `is_key_term: true` drill cards
- Country-comparative themes called out where relevant
- No KaTeX (no formulas in this subject)

## Countries Hub
Six items in `countries.json`. Each has 5 sections: Government Structure, Electoral System, Party System, Civil Society, Political Economy. Schema in `data/schemas/countries.schema.json`.

## Content Pipeline
Researcher [Sonnet] → Planner [Sonnet] → Writer [Sonnet] → Reviewer [Sonnet] → Commit. Standard G1–G10 quality gates.
```

- [ ] **Step 2: Dispatch Researcher subagent (Sonnet, foreground — blocks downstream)**

Use the `Agent` tool with `subagent_type: general-purpose`, `model: sonnet`, with this prompt:

> You are the Researcher for AP Comparative Government content generation (Phase 15 of the Ascendly project — adding the 9th AP subject).
>
> **Working directory:** C:\Ascendly
>
> **Your single source of truth (read this in full first):** `.planning/ced-outlines/ap-comparative-government-and-politics-CED.md`
>
> **Also read for context (in this order):**
> 1. `.planning/phases/15-ap-comparative-government-content/15-CONTEXT.md`
> 2. `CLAUDE.md` Critical Rules + Content Standards Summary sections
> 3. `data/schemas/drill-card.schema.json`, `data/schemas/mcq.schema.json`, `data/schemas/study-guide.schema.json`, `data/schemas/countries.schema.json`
> 4. ONE existing Gov drill file for calibration: `public/data/ap-government/drills/unit-1.json` (just look at structure, do not copy content)
> 5. ONE existing Gov MCQ file: `public/data/ap-government/mcq/unit-1.json`
> 6. The Gov docs-cases.json for the country-hub structural template: `public/data/ap-government/docs-cases.json`
>
> **Web research is FORBIDDEN.** All content selection comes from the CED markdown only.
>
> **Your output:**
>
> 1. `.planning/phases/15-ap-comparative-government-content/RESEARCH.md` containing:
>    - Unit-by-unit topic and learning-objective inventory (from CED)
>    - Per-unit list of testable terms, people, events, concepts
>    - Per-unit list of country-specific examples (which country illustrates which concept)
>    - 8–15 candidate `is_key_term` terms per unit (highest yield for AP exam)
>    - Stimulus type breakdown for MCQs per unit (text vs table vs chart)
>    - Country-by-country institutional inventory (6 countries × ~10 institutions each)
>    - Comparative themes that recur across the course (e.g., federalism, electoral system, civil society, regime change)
>    - Required cases/examples per country (CED-mandated)
>
> 2. `.planning/phases/15-ap-comparative-government-content/meta-draft.json` matching `data/schemas/meta.schema.json` for the subject (5 units, weights, learning objective codes from CED).
>
> 3. `.planning/phases/15-ap-comparative-government-content/PLAN.md` with per-unit question plans for the three Writers:
>    - **Drills writer plan**: per unit, target counts by mode (definition_to_term, significance_to_person, significance_to_event, concept_mc), the specific terms/people/events to cover, which 8–15 are `is_key_term`. Total drill counts per unit.
>    - **MCQ writer plan**: per unit, target ~75 MCQs, breakdown by stimulus type (text/table/chart), difficulty distribution, country usage distribution (each MCQ should call out which country/countries it tests).
>    - **Study guide writer plan**: per unit, theme list, core concepts, exam tips, country comparisons to highlight.
>    - **Countries writer plan**: per country, the 5 sections to fill, key institutions, required cases, paired-with relationships.
>
> Be exhaustive — Writers run in parallel and won't have time to interpret. Tight, structured, no fluff.
>
> **Deliverables checklist:**
> - [ ] RESEARCH.md (~300–500 lines, structured)
> - [ ] meta-draft.json (valid JSON)
> - [ ] PLAN.md (~200–300 lines, structured for parallel consumption by 4 Writers)
>
> Report back with: file paths created, total line counts, any CED ambiguities you flagged for human review (do not invent answers).

- [ ] **Step 3: Verify outputs land**

Run: `ls .planning/phases/15-ap-comparative-government-content/`
Expected: `15-CONTEXT.md`, `RESEARCH.md`, `meta-draft.json`, `PLAN.md`

---

## Track 3 — Content writers (parallel after Track 2)

### Task 3.1: Drills writer subagent

**Files:**
- Create: `public/data/ap-comparative-government/drills/unit-1.json`
- Create: `public/data/ap-comparative-government/drills/unit-2.json`
- Create: `public/data/ap-comparative-government/drills/unit-3.json`
- Create: `public/data/ap-comparative-government/drills/unit-4.json`
- Create: `public/data/ap-comparative-government/drills/unit-5.json`

- [ ] **Step 1: Dispatch Drills Writer subagent (Sonnet, background)**

Use the `Agent` tool with `subagent_type: general-purpose`, `model: sonnet`, `run_in_background: true`. Prompt:

> You are the Drills Writer for AP Comparative Government (Phase 15).
>
> **Working directory:** C:\Ascendly
>
> **Read first:**
> 1. `.planning/phases/15-ap-comparative-government-content/PLAN.md` (your assignment is the Drills section)
> 2. `.planning/phases/15-ap-comparative-government-content/RESEARCH.md` (full vocab and term inventory)
> 3. `.planning/phases/15-ap-comparative-government-content/15-CONTEXT.md` (rules)
> 4. `data/schemas/drill-card.schema.json` (output must validate)
> 5. `public/data/ap-government/drills/unit-1.json` (calibration example — match structure exactly)
>
> **Output:** Five files, one per unit:
> - `public/data/ap-comparative-government/drills/unit-1.json`
> - `public/data/ap-comparative-government/drills/unit-2.json`
> - `public/data/ap-comparative-government/drills/unit-3.json`
> - `public/data/ap-comparative-government/drills/unit-4.json`
> - `public/data/ap-comparative-government/drills/unit-5.json`
>
> **Rules:**
> - Drill modes used: `definition_to_term`, `significance_to_person`, `significance_to_event`, `concept_mc`. Nothing else.
> - Typed:MC ratio target: 70:30 per unit
> - 8–15 `is_key_term: true` per unit, typed-recall modes only (never concept_mc)
> - ID prefix: `comp-gov-d-{unit}-{seq}` (e.g., `comp-gov-d-1-001`)
> - **CRITICAL**: Write each unit file in a single Write call ≤ 25 cards. If a unit needs more, use multiple Write calls (read existing, append, write back). Avoid 32k token limit issues.
> - All terms/people/events come from RESEARCH.md — do not invent
> - For comparative concepts, prefer cards that name the country illustrating the concept (e.g., "Asymmetric federalism — Russia's federal subjects vary in autonomy")
>
> **Deliverables checklist:**
> - [ ] All 5 unit JSON files created and schema-valid
> - [ ] Each file has typed:MC ratio close to 70:30
> - [ ] 8–15 `is_key_term: true` per unit
> - [ ] Total drill count: report per-unit count and grand total
>
> Report back with: file paths, per-unit counts, per-unit `is_key_term` counts, any RESEARCH.md gaps you noticed.

### Task 3.2: MCQ writer subagent

**Files:**
- Create: `public/data/ap-comparative-government/mcq/unit-{1-5}.json`

- [ ] **Step 1: Dispatch MCQ Writer subagent (Sonnet, background)**

Same Agent tool pattern. Prompt:

> You are the MCQ Writer for AP Comparative Government (Phase 15).
>
> **Working directory:** C:\Ascendly
>
> **Read first:**
> 1. `.planning/phases/15-ap-comparative-government-content/PLAN.md` (your assignment is the MCQ section)
> 2. `.planning/phases/15-ap-comparative-government-content/RESEARCH.md`
> 3. `.planning/phases/15-ap-comparative-government-content/15-CONTEXT.md`
> 4. `data/schemas/mcq.schema.json` (output must validate)
> 5. `public/data/ap-government/mcq/unit-1.json` (calibration — text-heavy comparative subject most analogous)
>
> **Output:** `public/data/ap-comparative-government/mcq/unit-{1..5}.json`
>
> **Rules:**
> - 50–100 MCQs per unit (target ~75)
> - 20/45/35 easy/medium/hard split
> - ~85% stimulus rate (text/table/chart). Stimulus types from PLAN.md.
> - 4 choices per MCQ. Per-choice explanation REQUIRED (correct answer + each distractor).
> - Correct-answer position: distribute evenly across A/B/C/D (no positional bias)
> - **Length-bias check**: correct answer must NOT be systematically the longest choice. After writing each unit, verify the avg length of correct vs incorrect choices is within 10%.
> - College Board register: "Which of the following best explains…"
> - ID prefix: `comp-gov-mcq-{unit}-{seq}`
> - **CRITICAL**: Write each unit in chunks of ≤ 20–25 MCQs per Write call. Use multiple appending writes if needed.
> - Stimuli must reference course countries by name (e.g., "The following table shows electoral turnout in Russia, Iran, and Mexico from 2000 to 2020:") — comparative is the point.
> - Charts/tables in stimulus: use the existing JSON stimulus types from the schema (no inline images for MCQs in this subject).
>
> **Deliverables checklist:**
> - [ ] All 5 unit JSON files created and schema-valid
> - [ ] Per-unit MCQ count 50–100
> - [ ] Length-bias check: avg correct/incorrect within 10%
> - [ ] Position distribution: correct answer roughly 25% per position
>
> Report back with: file paths, per-unit MCQ counts, length-bias measurements, position distribution.

### Task 3.3: Study guide writer subagent

**Files:**
- Create: `public/data/ap-comparative-government/study-guide/unit-{1-5}.json`

- [ ] **Step 1: Dispatch Study Guide Writer subagent (Sonnet, background)**

Same pattern. Prompt:

> You are the Study Guide Writer for AP Comparative Government (Phase 15).
>
> **Working directory:** C:\Ascendly
>
> **Read first:**
> 1. `.planning/phases/15-ap-comparative-government-content/PLAN.md` (Study Guide section)
> 2. `.planning/phases/15-ap-comparative-government-content/RESEARCH.md`
> 3. `.planning/phases/15-ap-comparative-government-content/15-CONTEXT.md`
> 4. `data/schemas/study-guide.schema.json` (output must validate)
> 5. `public/data/ap-government/study-guide/unit-1.json` (calibration)
> 6. `public/data/ap-comparative-government/drills/unit-1.json` (so you can pull `is_key_term: true` cards as the unit's key terms — they are sourced from drill cards)
>
> **Output:** `public/data/ap-comparative-government/study-guide/unit-{1..5}.json`
>
> **Rules:**
> - One file per unit
> - Key terms array sourced from `is_key_term: true` drill cards in `drills/unit-{N}.json`
> - Country-comparative themes called out where relevant — every major theme should reference at least 2 of the 6 countries
> - Subject "AP Comp Gov" tone — accessible but exam-aligned
> - No KaTeX (no formulas in this subject)
> - Structure: theme → core_concepts → exam_tip
>
> **Deliverables:**
> - [ ] 5 schema-valid JSON files
> - [ ] Key terms in each match `is_key_term: true` cards from corresponding drill file
>
> Note: This subagent depends on Drills (Task 3.1) finishing for accurate key term sourcing. If Drills not yet complete, hold and wait, OR draft against PLAN.md's `is_key_term` candidate list — Reviewer will reconcile.
>
> Report back with: file paths, line counts, any deviations from the PLAN.

---

## Track 4 — Countries + Adi (parallel after Track 2)

### Task 4.1: Countries writer subagent

**Files:**
- Create: `public/data/ap-comparative-government/countries.json`

- [ ] **Step 1: Dispatch Countries Writer subagent (Sonnet, background)**

Use Agent tool. Prompt:

> You are the Countries Writer for AP Comparative Government (Phase 15).
>
> **Working directory:** C:\Ascendly
>
> **Read first:**
> 1. `.planning/phases/15-ap-comparative-government-content/PLAN.md` (Countries section)
> 2. `.planning/phases/15-ap-comparative-government-content/RESEARCH.md` (country institutional inventory + required cases)
> 3. `.planning/phases/15-ap-comparative-government-content/15-CONTEXT.md`
> 4. `data/schemas/countries.schema.json` (output must validate)
> 5. `public/data/ap-government/docs-cases.json` (structural template — your output mirrors this exactly)
>
> **Output:** `public/data/ap-comparative-government/countries.json`
>
> **Schema:**
> ```json
> {
>   "subject": "ap-comparative-government",
>   "items": [ /* 6 country objects */ ]
> }
> ```
>
> **6 countries:** uk, russia, china, iran, mexico, nigeria. Use `regime_category` of `democratic` (UK, Mexico, Nigeria), `hybrid` (Russia), `authoritarian` (China, Iran). [Note: confirm with PLAN.md — CB classifications can shift; PLAN.md is authoritative.]
>
> **Per-country fields (all required):**
> - `id`, `title`, `regime_type`, `regime_category`
> - `byline` — single-line takeaway
> - `key_takeaway` — single sentence
> - `summary` — 4–6 sentence paragraph
> - `key_institutions[]` — array of strings (~10 items each)
> - `required_cases[]` — CED-mandated examples for that country (e.g., for UK: 2014 Scottish independence referendum, 2016 Brexit referendum)
> - `comparative_themes[]` — themes this country illustrates
> - `paired_with[]` — countries most often compared (`{id, title, relation}`). Each country should have 2–3 pairings.
> - `exam_appearance` — string describing FRQ/MCQ usage
> - `sections[]` — exactly 5 sections in this order:
>   1. Government Structure
>   2. Electoral System
>   3. Party System
>   4. Civil Society
>   5. Political Economy
>   Each section: `{label, title, blurb (3-5 sentences), adi_prompt}`
>   adi_prompt format: "Quiz me on [country]'s [topic]. Give me 4 AP-style multiple choice questions one at a time, wait for my answer, then tell me if I'm right and explain why before moving to the next."
> - `adi_prompts: { quiz, explain }` — top-level country prompts
>
> **Rules:**
> - Content from CED only — required cases must be CED-mandated, not invented
> - Tone: factual, AP-aligned, comparative-aware
> - No country bias — give equal depth to authoritarian and democratic regimes
>
> **Deliverables:**
> - [ ] 1 schema-valid JSON file with all 6 countries × 5 sections each
> - [ ] All 6 country IDs present
> - [ ] Each country has 2–3 paired_with entries
>
> Report back with: file path, total country count (should be 6), total section count (should be 30), any CED gaps you noticed.

### Task 4.2: Adi context writer subagent

**Files:**
- Create: `public/data/ap-comparative-government/adi-context.json`

- [ ] **Step 1: Dispatch Adi Context Writer subagent (Sonnet, background)**

Same pattern. Prompt:

> You are the Adi Context Writer for AP Comparative Government (Phase 15).
>
> **Working directory:** C:\Ascendly
>
> **Read first:**
> 1. `.planning/phases/15-ap-comparative-government-content/RESEARCH.md`
> 2. `public/data/ap-government/adi-context.json` (calibration — match structure)
> 3. `.planning/ced-outlines/ap-comparative-government-and-politics-CED.md` (single source of truth)
>
> **Output:** `public/data/ap-comparative-government/adi-context.json`
>
> Match the structure of `ap-government/adi-context.json` exactly. Differences:
> - Subject: `ap-comparative-government`
> - 6 country-specific framings (Adi must answer questions like "compare UK and Russia legislatures" intelligently)
> - 5 unit summaries (per CED unit structure)
> - Comparative themes that cross-cut the course
>
> Report back with: file path, line count.

### Task 4.3: Add `hasCountriesHub` gating helper

**Files:**
- Create: `utils/countries.ts`

- [ ] **Step 1: Write the types + loader + gating function**

```ts
// utils/countries.ts
export type RegimeCategory = 'democratic' | 'hybrid' | 'authoritarian'

export interface CountryPairedWith {
  id: string
  title: string
  relation: string
}

export interface CountryAdiPrompts {
  quiz: string
  explain: string
}

export interface CountrySection {
  label: string
  title: string
  blurb: string
  adi_prompt: string
}

export interface CountryItem {
  id: 'uk' | 'russia' | 'china' | 'iran' | 'mexico' | 'nigeria'
  title: string
  regime_type: string
  regime_category: RegimeCategory
  byline: string
  key_takeaway: string
  summary: string
  key_institutions: string[]
  required_cases: string[]
  comparative_themes: string[]
  paired_with: CountryPairedWith[]
  exam_appearance: string
  sections: CountrySection[]
  adi_prompts: CountryAdiPrompts
}

export interface CountriesData {
  subject: 'ap-comparative-government'
  items: CountryItem[]
}

/** Check if a subject has a Countries hub. Only AP Comp Gov for now. */
export function hasCountriesHub(subject: string): boolean {
  return subject === 'ap-comparative-government'
}

/** Human-readable category label for the tab UI. */
export function regimeCategoryLabel(category: RegimeCategory): string {
  if (category === 'democratic') return 'Democratic'
  if (category === 'hybrid') return 'Hybrid'
  return 'Authoritarian'
}

/** Order countries within a category alphabetically by title for stable display. */
export function sortCountries(items: CountryItem[]): CountryItem[] {
  return [...items].sort((a, b) => a.title.localeCompare(b.title))
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit utils/countries.ts`
Expected: no errors

---

## Track 5 — Countries UI components (parallel with Tracks 3 + 4, only depends on schema/types from Task 4.3)

### Task 5.1: Create CountryCard component

**Files:**
- Create: `components/countries/CountryCard.tsx`

- [ ] **Step 1: Adapt DocCaseCard**

Read `components/docs-cases/DocCaseCard.tsx` end-to-end first (60+ lines). Then create the analog at `components/countries/CountryCard.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { CountryItem } from '@/utils/countries'

interface CountryCardProps {
  item: CountryItem
  subject: string
}

export function CountryCard({ item, subject }: CountryCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={`/${subject}/countries/${item.id}`}
      style={{ textDecoration: 'none', display: 'block', height: '100%' }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? 'var(--bg-card-hover)' : 'var(--bg-card)',
          border: `1px solid ${hovered ? 'var(--accent)' : 'var(--bg-border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          height: '100%',
          cursor: 'pointer',
          transition: 'background 150ms ease, border-color 150ms ease, transform 150ms ease',
          transform: hovered ? 'translateY(-2px)' : 'none',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{
          fontSize: '0.6875rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          fontWeight: 600,
          marginBottom: '10px',
        }}>
          {item.regime_type}
        </div>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: '0 0 6px 0',
          lineHeight: 1.3,
        }}>
          {item.title}
        </h3>
        <p style={{
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.45,
          margin: 0,
          flex: 1,
        }}>
          {item.byline}
        </p>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit components/countries/CountryCard.tsx`
Expected: no errors

### Task 5.2: Create CountriesHubClient component

**Files:**
- Create: `components/countries/CountriesHubClient.tsx`

- [ ] **Step 1: Adapt DocsCasesHubClient**

Read `components/docs-cases/DocsCasesHubClient.tsx` end-to-end (~120 lines). Create the analog with regime-category tabs:

```tsx
'use client'

import { useState, useMemo } from 'react'
import type { CountryItem, RegimeCategory } from '@/utils/countries'
import { sortCountries } from '@/utils/countries'
import { CountryCard } from './CountryCard'

interface CountriesHubClientProps {
  items: CountryItem[]
  subject: string
}

const TABS: { key: RegimeCategory; label: string }[] = [
  { key: 'democratic', label: 'Democratic' },
  { key: 'hybrid', label: 'Hybrid' },
  { key: 'authoritarian', label: 'Authoritarian' },
]

export function CountriesHubClient({ items, subject }: CountriesHubClientProps) {
  const [tab, setTab] = useState<RegimeCategory>('democratic')

  const grouped = useMemo(() => {
    const out: Record<RegimeCategory, CountryItem[]> = { democratic: [], hybrid: [], authoritarian: [] }
    for (const item of items) out[item.regime_category].push(item)
    for (const k of Object.keys(out) as RegimeCategory[]) out[k] = sortCountries(out[k])
    return out
  }, [items])

  const visible = grouped[tab]

  return (
    <>
      <div
        role="tablist"
        aria-label="Regime category"
        style={{
          display: 'flex',
          gap: '4px',
          padding: '4px',
          background: 'var(--bg-card)',
          border: '1px solid var(--bg-border)',
          borderRadius: '999px',
          width: 'fit-content',
          marginBottom: '32px',
        }}
      >
        {TABS.map(t => (
          <TabButton
            key={t.key}
            active={tab === t.key}
            onClick={() => setTab(t.key)}
            count={grouped[t.key].length}
            label={t.label}
          />
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
      }}>
        {visible.map(item => (
          <CountryCard key={item.id} item={item} subject={subject} />
        ))}
      </div>
    </>
  )
}

function TabButton({
  active,
  onClick,
  count,
  label,
}: {
  active: boolean
  onClick: () => void
  count: number
  label: string
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        padding: '8px 18px',
        borderRadius: '999px',
        fontSize: '0.875rem',
        fontWeight: 500,
        color: active ? 'white' : 'var(--text-secondary)',
        background: active ? 'var(--accent)' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        transition: 'background 150ms ease, color 150ms ease',
      }}
    >
      {label}
      <span style={{
        marginLeft: '8px',
        fontSize: '0.75rem',
        opacity: 0.7,
      }}>{count}</span>
    </button>
  )
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit components/countries/CountriesHubClient.tsx`
Expected: no errors

### Task 5.3: Create CountrySections component

**Files:**
- Create: `components/countries/CountrySections.tsx`

- [ ] **Step 1: Adapt DocCaseSections**

Read `components/docs-cases/DocCaseSections.tsx` first. Then create the analog:

```tsx
'use client'

import type { CountrySection } from '@/utils/countries'
import { AdiQuizBlock } from '@/components/docs-cases/AdiQuizBlock'

interface CountrySectionsProps {
  sections: CountrySection[]
  subject: string
}

export function CountrySections({ sections, subject }: CountrySectionsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {sections.map((section, idx) => (
        <section
          key={idx}
          style={{
            padding: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--bg-border)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <div style={{
            fontSize: '0.6875rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            fontWeight: 600,
            marginBottom: '8px',
          }}>
            {section.label}
          </div>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: '0 0 12px 0',
          }}>
            {section.title}
          </h3>
          <p style={{
            fontSize: '0.9375rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            margin: '0 0 16px 0',
          }}>
            {section.blurb}
          </p>
          <AdiQuizBlock prompt={section.adi_prompt} subject={subject} />
        </section>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Verify AdiQuizBlock import path**

Run: `ls components/docs-cases/AdiQuizBlock.tsx`
Expected: file exists. If signature differs from `{ prompt, subject }`, adjust the import call site.

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit components/countries/CountrySections.tsx`
Expected: no errors

### Task 5.4: Create countries hub page route

**Files:**
- Create: `app/[subject]/countries/page.tsx`

- [ ] **Step 1: Read the docs-cases hub page for the pattern**

Run: `cat app/[subject]/docs-cases/page.tsx`

- [ ] **Step 2: Write the countries hub page**

```tsx
import { notFound } from 'next/navigation'
import { promises as fs } from 'fs'
import path from 'path'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { BackToSubject } from '@/components/ui/BackToSubject'
import { CountriesHubClient } from '@/components/countries/CountriesHubClient'
import { hasCountriesHub, type CountriesData } from '@/utils/countries'

interface CountriesPageProps {
  params: Promise<{ subject: string }>
}

export default async function CountriesPage({ params }: CountriesPageProps) {
  const { subject } = await params
  if (!hasCountriesHub(subject)) notFound()

  const filePath = path.join(process.cwd(), 'public', 'data', subject, 'countries.json')
  const raw = await fs.readFile(filePath, 'utf-8')
  const data: CountriesData = JSON.parse(raw)

  return (
    <AuthGuard>
      <main style={{ padding: '24px', maxWidth: '960px', margin: '0 auto' }}>
        <BackToSubject subject={subject} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Course Countries
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '24px' }}>
          The six countries comparatively studied in AP Comp Gov.
        </p>
        <CountriesHubClient items={data.items} subject={subject} />
      </main>
    </AuthGuard>
  )
}
```

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit app/[subject]/countries/page.tsx`
Expected: no errors (or only errors unrelated to this file)

### Task 5.5: Create country detail page route

**Files:**
- Create: `app/[subject]/countries/[slug]/page.tsx`

- [ ] **Step 1: Read the docs-cases detail page**

Run: `cat 'app/[subject]/docs-cases/[slug]/page.tsx'`

- [ ] **Step 2: Write the country detail page**

```tsx
import { notFound } from 'next/navigation'
import { promises as fs } from 'fs'
import path from 'path'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { CountrySections } from '@/components/countries/CountrySections'
import { hasCountriesHub, type CountriesData } from '@/utils/countries'

interface CountryDetailPageProps {
  params: Promise<{ subject: string; slug: string }>
}

export default async function CountryDetailPage({ params }: CountryDetailPageProps) {
  const { subject, slug } = await params
  if (!hasCountriesHub(subject)) notFound()

  const filePath = path.join(process.cwd(), 'public', 'data', subject, 'countries.json')
  const raw = await fs.readFile(filePath, 'utf-8')
  const data: CountriesData = JSON.parse(raw)
  const item = data.items.find(c => c.id === slug)
  if (!item) notFound()

  return (
    <AuthGuard>
      <main style={{ padding: '24px', maxWidth: '960px', margin: '0 auto' }}>
        <a href={`/${subject}/countries`} style={{
          color: 'var(--text-secondary)',
          fontSize: '0.875rem',
          textDecoration: 'none',
          marginBottom: '16px',
          display: 'inline-block',
        }}>← Back to Countries</a>
        <div style={{
          fontSize: '0.6875rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          fontWeight: 600,
          marginBottom: '8px',
          marginTop: '16px',
        }}>
          {item.regime_type}
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {item.title}
        </h1>
        <p style={{
          fontSize: '1rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: '24px',
        }}>
          {item.summary}
        </p>
        <div style={{
          padding: '16px 20px',
          background: 'var(--bg-card)',
          border: '1px solid var(--accent)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '32px',
        }}>
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--accent)',
            fontWeight: 600,
            marginBottom: '4px',
          }}>KEY TAKEAWAY</div>
          <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
            {item.key_takeaway}
          </p>
        </div>
        <CountrySections sections={item.sections} subject={subject} />
      </main>
    </AuthGuard>
  )
}
```

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit 'app/[subject]/countries/[slug]/page.tsx'`
Expected: no errors

### Task 5.6: Surface Countries tile on subject hub page

**Files:**
- Modify: `app/[subject]/page.tsx` (locate where docs-cases tile is conditionally rendered)

- [ ] **Step 1: Find the existing docs-cases gating**

Run: `grep -n "hasDocsCases\|docs-cases" app/\[subject\]/page.tsx`

- [ ] **Step 2: Add countries tile next to docs-cases tile, gated by `hasCountriesHub`**

Mirror whatever pattern docs-cases uses. The tile should:
- Link to `/[subject]/countries`
- Title: "Course Countries"
- Subtitle: "Six countries · regime spectrum"
- Render only when `hasCountriesHub(subject)` returns true

Import: `import { hasCountriesHub } from '@/utils/countries'`

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit 'app/[subject]/page.tsx'`
Expected: no errors

### Task 5.7: Commit Track 5 (UI scaffold)

- [ ] **Step 1: Stage and commit**

```bash
git add utils/countries.ts \
  components/countries/ \
  app/[subject]/countries/ \
  app/[subject]/page.tsx
git commit -m "feat(comp-gov): countries hub UI scaffold (route + components)"
```

---

## Track 6 — Reviewer subagent (gate, after Tracks 3 + 4 complete)

### Task 6.1: Dispatch Reviewer subagent

- [ ] **Step 1: Verify all content writers completed**

Run: `ls public/data/ap-comparative-government/{drills,mcq,study-guide}/unit-{1..5}.json countries.json adi-context.json meta.json`
Expected: all 18 files exist

- [ ] **Step 2: Generate meta.json from meta-draft.json**

```bash
cp .planning/phases/15-ap-comparative-government-content/meta-draft.json \
   public/data/ap-comparative-government/meta.json
```

- [ ] **Step 3: Dispatch Reviewer subagent (Sonnet, foreground)**

Use Agent tool. Prompt:

> You are the Content Reviewer for AP Comparative Government (Phase 15) — the gate before this content can be merged.
>
> **Working directory:** C:\Ascendly
>
> **Read first:**
> 1. `.planning/phases/15-ap-comparative-government-content/15-CONTEXT.md` (rules)
> 2. `.planning/phases/15-ap-comparative-government-content/PLAN.md` (writer assignments)
> 3. `.planning/CONTENT-WAVES.md` (G1–G10 quality gates — your checklist)
> 4. `data/schemas/*.schema.json` (validation reference)
>
> **Inspect for compliance:**
> - `public/data/ap-comparative-government/meta.json`
> - `public/data/ap-comparative-government/drills/unit-{1..5}.json`
> - `public/data/ap-comparative-government/mcq/unit-{1..5}.json`
> - `public/data/ap-comparative-government/study-guide/unit-{1..5}.json`
> - `public/data/ap-comparative-government/countries.json`
> - `public/data/ap-comparative-government/adi-context.json`
>
> **Validate per gate:**
> - **G1 Schema validity**: All files validate against their schemas (use `node` to JSON.parse + check required fields)
> - **G2 CED alignment**: All concepts/terms/people/events trace back to CED markdown
> - **G3 Drill mode purity**: Only `definition_to_term`, `significance_to_person`, `significance_to_event`, `concept_mc`. No `name_to_formula`, no `significance_to_case`.
> - **G4 Typed:MC ratio**: ~70:30 per unit
> - **G5 is_key_term coverage**: 8–15 per unit, typed-only
> - **G6 MCQ stimulus rate**: ~85% per unit
> - **G7 MCQ length-bias**: correct vs incorrect answer length within 10% per unit
> - **G8 MCQ position distribution**: correct answer ~25% per A/B/C/D position per unit
> - **G9 Per-choice explanations**: every MCQ has explanation for correct AND each distractor
> - **G10 Country coverage**: every unit's MCQs and drills reference all 6 course countries (not just 1–2 favorites). Countries.json has all 6.
>
> **Report format:**
> Per gate: PASS / FAIL / WARNING with specific file paths and counts. If any gate FAILS, list the smallest set of corrections needed (ID-level, not file rewrites).
>
> Do NOT modify content yourself — your job is to find issues and report. The user will dispatch a fix-pass subagent if needed.
>
> **Final verdict:** "READY TO COMMIT" or "BLOCKED — see fixes" at top of report.

- [ ] **Step 4: If Reviewer reports BLOCKED, dispatch fix-pass subagent**

If verdict is BLOCKED, dispatch a Sonnet subagent with the Reviewer's report to make the targeted fixes, then re-run Task 6.1.

If verdict is READY, proceed to Track 7.

---

## Track 7 — Final integration

### Task 7.1: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add to Subjects (Live) list — change 8 → 9**

Find the `## Subjects (Live)` section. Add `9. AP Comparative Government` to the list.

- [ ] **Step 2: Add `/[subject]/countries` row to Feature Surfaces table**

In the Feature Surfaces table:

```
| `/[subject]/countries` | Course Countries | Yes (Comp Gov only) |
```

- [ ] **Step 3: Add Phase Tracker row in Post-Launch Additions**

Add a new row:

```
| 15 | AP Comparative Government Content | Complete |
```

- [ ] **Step 4: Add decisions log entry**

```
- 2026-04-29: AP Comparative Government added as 9th subject — establishes the per-subject "Countries" hub pattern (mirrors docs-cases for any subject with required country/regional comparisons). FRQ scaffold ready, content awaiting CB PDF drop.
```

### Task 7.2: Add changelog entry

**Files:**
- Modify: `public/data/changelog.json:1` (insert at top)

- [ ] **Step 1: Insert new entry at top of array**

```json
{
  "id": "2026-04-29-ap-comp-gov",
  "date": "2026-04-29",
  "type": "content",
  "title": "AP Comparative Government is here",
  "body": "Practice AP Comp Gov with full drill, vocab, MCQ, and study guide coverage across all 5 units, plus a dedicated Countries hub for the 6 course countries (UK, Russia, China, Iran, Mexico, Nigeria). FRQs coming soon."
}
```

### Task 7.3: Run dev server, screenshot loop on Countries hub

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Manually verify in browser**

Navigate to:
1. `/` — verify AP Comp Gov card appears with rose-red SVG icon
2. `/ap-comparative-government` — verify hub renders with Countries tile
3. `/ap-comparative-government/drills` — verify drills load
4. `/ap-comparative-government/practice` — verify MCQs load
5. `/ap-comparative-government/vocab` — verify browse mode works (auth-gated)
6. `/ap-comparative-government/study-guide` — verify study guide renders (auth-gated)
7. `/ap-comparative-government/countries` — verify hub with 3 tabs (Democratic / Hybrid / Authoritarian) and 6 country cards
8. `/ap-comparative-government/countries/uk` — verify detail page with 5 sections + Adi prompts
9. `/ap-comparative-government/frq` — verify empty state renders cleanly

- [ ] **Step 3: Ask user for screenshot confirmation**

Per CLAUDE.md Critical Rule #2: "UI work is done. Please paste a screenshot so I can verify it looks correct before marking this complete."

Wait for user confirmation before final commit.

### Task 7.4: Final commit + push

- [ ] **Step 1: Stage everything**

```bash
git add public/data/ap-comparative-government/ \
  public/data/changelog.json \
  CLAUDE.md \
  .planning/phases/15-ap-comparative-government-content/
git commit -m "feat(comp-gov): add AP Comparative Government as 9th subject

- Subject registration, SVG icon (rose-red, globe + 6 country pins)
- Drills, MCQs, study guide for all 5 units (Researcher → Writer → Reviewer pipeline)
- Countries hub at /[subject]/countries (6 country items × 5 sections, mirrors docs-cases)
- FRQ scaffold (empty manifest + extractor stub) ready for CB PDF drop
- Adi context for country-aware tutoring
- frq_type schema extended with comparative_analysis enum"
```

- [ ] **Step 2: Push to origin/main**

```bash
git push origin main
```

---

## Quality Gates (referenced from .planning/CONTENT-WAVES.md)

| Gate | What it checks | Owner |
|------|----------------|-------|
| G1 | Schema validity (all JSONs validate) | Reviewer (Task 6.1) |
| G2 | CED alignment (no invented content) | Reviewer |
| G3 | Drill mode purity | Reviewer |
| G4 | Typed:MC ratio (~70:30 per unit) | Reviewer |
| G5 | is_key_term coverage (8–15 per unit) | Reviewer |
| G6 | MCQ stimulus rate (~85%) | Reviewer |
| G7 | MCQ length-bias (correct vs incorrect within 10%) | Reviewer |
| G8 | MCQ position distribution (~25% per A/B/C/D) | Reviewer |
| G9 | Per-choice explanations | Reviewer |
| G10 | Country coverage (all 6 across units) | Reviewer |
| G11 | Countries.json schema + 6 items × 5 sections | Reviewer |

## Notes for the executor

- **Token budget**: Each Writer must chunk its writes (≤25 cards or ≤25 MCQs per Write call). 32k token limit applies.
- **Worktree isolation**: This whole plan can run in the main worktree (no conflicts between subagents because each writes to its own files). If the user prefers, dispatch each Writer in a worktree.
- **No FRQ generation in this plan**: FRQ scaffold is empty by design. User will drop CB PDFs in `content-sources/frq-pdfs/ap-comparative-government/{questions,scoring-guidelines}/` and run `python scripts/extract_comp_gov_frq.py` later.
- **Screenshot loop is mandatory** before Task 7.4 final commit.
- **Reviewer is mandatory** before Track 7 — never skip.
