# FRQ Detailed Rubric Breakdown — Design Spec

**Date:** 2026-04-16
**Status:** Approved

---

## Overview

Replace the current FRQ results screen (score ring + generic feedback) with a comprehensive rubric breakdown that shows every scoring point, highlights evidence from the student's response, and provides grounded improvement suggestions from Adi. Accuracy target: 95%+ alignment with real AP reader scoring.

## Scope

### Backend — Data Enrichment (Level 2)
- Extract structured rubric data from ~63 College Board scoring guideline PDFs in `content-sources/frq-pdfs/*/scoring-guidelines/`
- Migrate all FRQ JSONs from legacy `rubric_criteria: string[]` to structured `scoring_points[]` format
- Each scoring point gets: `alternatives[]` with `required_elements[]` and `correct_example`, `wrong_examples[]`, `common_traps[]`

### Backend — Prompt Engineering
- Add per-FRQ-type calibration blocks to grading prompt (2-3 scored examples per type from scoring guidelines)
- Add explicit task verb definitions per subject (`describe` vs `explain` vs `identify`)
- Add `suggestion` field to output schema — anchored to `correct_example` from structured data
- Add `confidence` field (0-1 float) — Adi flags uncertain grading rather than presenting it as authoritative
- Bake all new fields into the single grading call (no extra API calls)

### Frontend — Breakdown UI
- New `FRQBreakdown` component replacing current `FRQResults`
- Per-part expandable cards with scoring point sub-rows
- Evidence highlighting: map `student_evidence_quote` onto student's response text with color-coded inline highlights
- Earned = subtle indigo glow, Missed = soft amber glow (no traffic-light green/red)
- Adi suggestion block per missed point: "Why you missed this" + "A stronger response" (personalized rewrite grounded in correct_example)
- Consistent rendering across all FRQ types (DBQ, LEQ, SAQ, Gov×4, Math, Chem, Psych)
- Simple thumbs up/down per rubric row → logged to Supabase as weak signal (not used for auto-correction)

### Supabase — Feedback Table
- `frq_feedback` table: submission_id, point_id, vote (up/down), created_at
- Weak signal only — used for manual review of which criteria need tuning, never auto-applied

## Data Schema Changes

### FRQ JSON: `scoring_points[]` (structured format, replaces `rubric_criteria`)

```json
{
  "parts": [{
    "letter": "a",
    "prompt": "...",
    "point_value": 2,
    "scoring_points": [
      {
        "point_id": "a1",
        "point_value": 1,
        "description": "Correct average value formula and setup",
        "alternatives": [
          {
            "required_elements": [
              "Writes average value integral: 1/(b-a) * integral from a to b",
              "Correct bounds: 0 to 4"
            ],
            "correct_example": "The average number of acres is (1/4) * integral from 0 to 4 of C(t) dt"
          }
        ],
        "wrong_examples": [
          "Writes integral without the 1/4 factor",
          "Uses C'(t) instead of C(t) in the integrand"
        ],
        "common_traps": [
          "Forgetting the 1/(b-a) factor in the average value formula"
        ]
      }
    ]
  }]
}
```

### Grading Output Schema (additions)

```json
{
  "parts": [{
    "letter": "a",
    "point_results": [{
      "point_id": "a1",
      "earned": 0,
      "max": 1,
      "confidence": 0.85,
      "sub_results": [
        { "element": "...", "student_evidence_quote": "...", "met": false }
      ],
      "reasoning": "...",
      "suggestion": "You set up the integral correctly but forgot the 1/4 factor. The average value formula requires dividing by the interval length: (1/4) * integral from 0 to 4 of C(t) dt."
    }],
    "feedback": "...",
    "missed": "..."
  }]
}
```

### Supabase: `frq_feedback` table

```sql
CREATE TABLE frq_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES frq_submissions(id),
  point_id text NOT NULL,
  vote text NOT NULL CHECK (vote IN ('up', 'down')),
  created_at timestamptz DEFAULT now()
);
```

## FRQ Type Rendering Map

| FRQ Type | Parts | Breakdown Pattern | Special UI |
|----------|-------|-------------------|------------|
| DBQ (7pt) | 1 part, 7 rubric rows | Named rows: Thesis, Context, Evidence×3, Sourcing, Complexity | Essay text with multi-color highlights per row |
| LEQ (6pt) | 1 part, 6 rubric rows | Named rows: same minus doc evidence | Same as DBQ |
| SAQ (3×1pt) | 3 parts, 1pt each | Per-part binary earned/missed | Simple cards with evidence highlight |
| Gov Concept App (3pt) | 3 parts: Describe/Explain/Explain | Task verb labels per part | Show verb distinction in feedback |
| Gov Quant Analysis (4pt) | 4 parts: Identify/Describe/Conclude/Explain | Progressive demand labels | Flag cognitive level mismatch |
| Gov SCOTUS (4pt) | 3 parts, Part b=2pt split | b1 (case facts) + b2 (comparison) | Sub-row display within Part b |
| Gov Argument Essay (6pt) | Thesis + Evidence(0-3) + Reasoning + Rebuttal | Tiered evidence display | Progress indicator for 0-3 tier |
| Psych AAQ/EBQ (7pt) | 7 parts, 1pt each | Per-part checklist | Flag identify vs. describe vs. explain |
| Math multi-part (9pt) | 4 parts, 2-3pt each | P1/P2/P3 sub-point pills | Show setup vs. answer distinction |
| Chemistry (4-10pt) | Mixed parts | Calc + justify + drawing-skipped | Flag "justify required" vs. calc-only |

## UI Design Direction

Reference mockup: `docs/superpowers/mockups/frq-breakdown-v2.html`

- Glass morphism cards with backdrop-blur, subtle borders
- Indigo accent (earned), amber accent (missed) — no green/red
- Left accent bars on rubric rows
- Evidence highlights as soft translucent underlines, not solid blocks
- Adi suggestion blocks with diamond icon, "Why you missed this" + "A stronger response"
- Expandable cards (collapsed for full-credit parts, expanded for missed)
- Score ring with gradient glow at top
- Thumbs up/down as small ghost icons, bottom-right of each rubric row, no label

## Scoring Guideline PDF Inventory

| Subject | PDFs | Years | Content |
|---------|------|-------|---------|
| AP World History | 9 | 2021-2025 | SAQ + DBQ + LEQ rubrics with examples |
| AP Government | 11 | 2019-2025 | All 4 FRQ types with decision rules |
| AP Calculus AB | 20 | 2005-2025 | Per-question scoring with point-by-point criteria |
| AP Chemistry | 11 | 2014-2025 | Long + short FRQ scoring |
| AP Psychology | 10 | 2021-2025 | AAQ + EBQ with acceptable examples |
| AP Precalculus | 2 | 2024-2025 | Multi-part scoring |

## Accuracy Strategy

1. **Structured scoring_points** — AI gets unambiguous criteria with explicit correct/wrong examples instead of vague free-text
2. **Per-FRQ-type calibration** — 2-3 real scored examples per type baked into prompt
3. **Task verb definitions** — explicit describe/explain/identify boundaries per subject
4. **Grounded suggestions** — improvement hints reference `correct_example`, not hallucinated
5. **Confidence scoring** — uncertain grades flagged to student rather than presented as authoritative
6. **Evidence verification** — server-side quote validation (already exists, enhanced with LaTeX normalization)
7. **Two-pass auditor** — strict mode auditor catches false positives (already exists)
8. **Feedback signal** — thumbs up/down logged as weak monitoring signal for manual review

## Non-Goals

- Auto-correction from feedback votes (too gameable)
- Sample student essay display (copyright concerns with College Board material)
- Vision-based grading for drawing parts (separate feature, already tracked)
- New FRQ types or generated FRQs
