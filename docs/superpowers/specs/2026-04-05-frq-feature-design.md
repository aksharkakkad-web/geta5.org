# FRQ Feature Design Spec

**Date:** 2026-04-05
**Status:** Approved

---

## Overview

Add Free Response Question (FRQ) practice and AI grading to Ascendly. Students answer FRQs with text (humanities) or math-shorthand input (STEM), and Adi grades responses against College Board rubrics hardcoded into the system prompt. Grading that exceeds the daily rate limit is queued and processed on reset.

## Subjects

6 subjects get FRQs. CSP excluded (Create Performance Task is not an exam-day FRQ).

| Subject | FRQ Types | Parts/Question | Notes |
|---------|-----------|----------------|-------|
| AP Psychology | 2 FRQs | 7 pts each | Concept application to scenarios |
| AP World History | SAQ + LEQ + DBQ | Varies | Short answer, long essay, document-based |
| AP Government | 4 FRQs | 3-4 pts each | Concept app, SCOTUS comparison, quant analysis, argument essay |
| AP Calculus AB | 6 FRQs | 9 pts each, 2-4 parts | Multi-part, show work. Split: 2 calculator, 4 no-calculator |
| AP Precalculus | 4 FRQs | Varies | Multi-part, show work |
| AP Chemistry | 7 FRQs | Varies | Calculations + conceptual explanations |

## Data Schema

### `frq.schema.json`

```json
{
  "id": "string — unique (e.g., calc-ab-2024-frq-1)",
  "subject": "string — URL slug",
  "year": "number | null — null for generated",
  "source": "released | generated",
  "title": "string — e.g., Rate of Change & Accumulation",
  "related_units": ["number — unit numbers this FRQ covers"],
  "calculator_allowed": "boolean",
  "total_points": "number",
  "stimulus": "string | null — introductory text/scenario if any",
  "parts": [
    {
      "letter": "a",
      "prompt": "string — the part's question text",
      "point_value": "number",
      "rubric_criteria": [
        "string — each scoring criterion (1 per point)"
      ]
    }
  ]
}
```

**Storage:** `public/data/[subject]/frq/[question-id].json` — one file per FRQ question.

**Meta extension:** `meta.json` gains optional `frq_count` field and `frq_types` array per subject.

### Content Source

- Released FRQ PDFs (1998-2025) extracted into structured JSON by content pipeline
- Rubric PDFs analyzed once → scoring logic hardcoded into `utils/adiPrompt.ts`
- Generated FRQs supplement where released content is thin

## Supabase Schema

### `frq_submissions` table

```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id         uuid REFERENCES auth.users(id)
question_id     text NOT NULL — matches frq JSON id
subject         text NOT NULL
responses       jsonb NOT NULL — { "a": "student text...", "b": "student text..." }
grading_status  text NOT NULL DEFAULT 'pending' — pending | queued | graded
created_at      timestamptz DEFAULT now()
```

### `frq_results` table

```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
submission_id   uuid REFERENCES frq_submissions(id) UNIQUE
total_score     integer NOT NULL
max_score       integer NOT NULL
part_breakdown  jsonb NOT NULL — [{ letter, earned, max, feedback, missed }]
adi_takeaway    text NOT NULL
graded_at       timestamptz DEFAULT now()
```

RLS: users can read/write own submissions and results only.

## Adi Grading Integration

### Hardcoded Rubrics

Each subject/FRQ type gets a rubric block in `utils/adiPrompt.ts`, compiled from official College Board scoring guidelines. Loaded into system prompt only when grading that subject. ~500-800 tokens per rubric.

Example structure in the system prompt:
```
## AP Calculus AB FRQ Rubric
- Integration problems: 1pt for correct integrand setup, 1pt for correct antiderivative, 1pt for correct evaluation with bounds
- Justification: must explicitly state theorem/test used (e.g., "by the Second Derivative Test") — implicit reasoning does not earn the point
- Units: must include units in context-interpretation questions
...
```

### Grading Flexibility

GPT-4o-mini evaluates semantically, not via string matching:
- Equivalent mathematical expressions accepted
- Alternative valid solution methods earn full credit
- Minor notation differences handled gracefully
- Partial credit awarded for partially correct reasoning

### Grading API — `POST /api/frq/grade`

Request: `{ submissionId, questionId, responses: { a: "...", b: "..." } }`

Flow:
1. Check rate limit — FRQ grading costs **2 calls** against daily 30-call limit
2. If budget available → call GPT-4o-mini with question + rubric + student responses → parse structured grading → save to `frq_results` → return result
3. If no budget → update `frq_submissions.grading_status = 'queued'` → return `{ status: 'queued' }`

Response format from Adi (structured output):
```json
{
  "total_score": 7,
  "max_score": 9,
  "parts": [
    { "letter": "a", "earned": 2, "max": 2, "feedback": "...", "missed": null },
    { "letter": "b", "earned": 2, "max": 3, "feedback": "...", "missed": "Missing justification..." }
  ],
  "takeaway": "Focus on justification language when explaining max/min..."
}
```

### Queue Processing

Queued FRQs are graded when the daily limit resets (midnight EST). Processing options:
- **Supabase Edge Function on cron** — runs daily, processes FIFO
- **Lazy processing** — on first API call of the day, check for queued submissions and process before responding

FIFO order. If queue exceeds daily budget (15 FRQs at 2 calls each = 30 calls), overflow carries to the next day.

### Rate Limit Impact

| Action | Call Cost | Example Day |
|--------|-----------|-------------|
| Regular Adi chat | 1 call | 10 chats = 10 calls |
| FRQ grading (immediate) | 2 calls | 5 FRQs = 10 calls |
| FRQ grading (queued) | 0 calls now, 2 on reset | Unlimited practice |
| **Total budget** | **30 calls/day** | 10 chats + 5 FRQs + rest queued |

## Frontend

### Standalone FRQ Practice — `[subject]/frq/page.tsx`

**Flow:** Question Selection → Answer Interface → Grading Results (or Queued confirmation)

**Question Selection:**
- Glass cards listing available FRQs
- Filter chips: by type (calculator/no-calc for math), by year
- Shows source label (released year or "Generated")
- Shows related units, point total, part count

**Answer Interface:**
- Question stem displayed in accent-bordered card
- Part navigation tabs (a, b, c, d...)
- Per-part answer area:
  - **Math subjects (Calc, Precalc, Chem):** text input with math shortcuts + live KaTeX preview below
  - **Humanities (Psych, World History, Gov):** plain textarea
- `fx` button always visible near math input → opens math shortcuts reference modal
- "Save & Continue to Part (b)" + "Submit All Parts for Grading" buttons
- Auto-save draft to localStorage: `ascendly_draft_frq_[subject]`

**Math Shortcuts:**
| Shortcut | Renders As |
|----------|-----------|
| `^` | exponent (x^2 → x²) |
| `int(a,b)` | definite integral ∫ₐᵇ |
| `sqrt()` | square root √ |
| `pi`, `theta` | π, θ |
| `/` in context | fraction display |
| `lim(x->a)` | limit notation |
| `sum(i=1,n)` | summation Σ |
| `inf` | infinity ∞ |

**First-Time Math Tutorial:**
Shown once on first math FRQ interaction (stored in localStorage: `ascendly_frq_math_tutorial_seen`). This is NOT about syntax — it's about expectations. Shows a sample FRQ with a complete worked response demonstrating that students should show their work step-by-step, not just type a final answer. Emphasizes: "Show your work like you would on the real AP exam — Adi grades your process, not just your answer."

**Grading Results:**
- Score ring (matching existing MCQ results style)
- Per-part cards: green glow = full marks, amber glow = partial, red glow = zero
- Each part shows: earned/max, what earned points, what was missing (in amber callout)
- Adi's Takeaway card with diamond mascot
- "Ask Adi to Explain" button → opens Adi chat with FRQ context
- "Next Question" button

**Queued State:**
- If grading was queued: show "Queued — Adi will grade this when your daily limit resets"
- Grading Queue section accessible from subject page or profile — lists pending/graded FRQs
- When graded, results appear in queue with notification badge

### Practice Test Section II

Extends existing practice test flow in `[subject]/practice-test/page.tsx`.

**Test Setup:** New toggles:
- "Include Section II (Free Response)" — default on
- Can still toggle timed mode and show timer independently

**Flow with both sections:**
1. Section I: MCQs (existing) — with "Skip to Section II" option
2. Transition screen: "Section I Complete — Continue to Free Response?"
3. Section II: FRQs with separate timer matching real exam timing
4. "Skip Section II" option always available
5. Results: Combined MCQ + FRQ results page

**Section II Timer** (per subject, matching real AP exam):
| Subject | Section II Time |
|---------|----------------|
| AP Psychology | 100 minutes |
| AP World History | 100 minutes (SAQ 40min + LEQ/DBQ 60min) |
| AP Government | 100 minutes |
| AP Calculus AB | 90 minutes |
| AP Precalculus | 60 minutes |
| AP Chemistry | 105 minutes |

**FRQ grading in practice test:** All FRQs submitted at end of Section II → graded as a batch (or queued if over limit).

**Draft persistence:** Extended `TestDraft` to include FRQ responses. Key: `ascendly_draft_test_[subject]`.

### Navigation

- New "Free Response" link in subject page alongside existing Drills, Practice, Study Guide, Practice Test
- Subject pages for CSP hide the FRQ link entirely

## Content Pipeline

Same team structure as MCQ content: **Researcher → Planner → Writer → Reviewer**

1. **Researcher:** Analyzes uploaded released FRQ PDFs, catalogs questions by year/type/topic
2. **Planner:** Determines which released FRQs to include, identifies gaps needing generated content
3. **Writer:** Extracts released FRQs into `frq.schema.json` format, generates supplemental FRQs
4. **Reviewer:** Validates rubric criteria match official scoring guidelines, point values correct, KaTeX valid

Rubric analysis (separate from content pipeline): Analyze rubric PDFs → distill into hardcoded scoring blocks in `adiPrompt.ts`.

## Out of Scope

- Image upload / photo of handwritten work
- GPT-4o vision grading
- AP CSP FRQs (no exam-day FRQ exists)
- DBQ document image rendering (text-based document excerpts only for now)
- FRQ difficulty ratings (all released FRQs are exam-level by definition)
- Timed individual FRQ practice (timer only in practice test Section II)