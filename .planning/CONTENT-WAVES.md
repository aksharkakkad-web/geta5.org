# Content Generation — Wave Strategy

> Orchestration doc for parallel content generation across Phases 6–12.
> Each wave runs multiple subjects simultaneously via isolated worktree agents.

---

## Wave Architecture

### Wave 1 — Text-Heavy Subjects (4 parallel agents)

| Agent | Phase | Subject | Units | Special Requirements |
|-------|-------|---------|-------|---------------------|
| W1-A | 6 | AP Psychology | 8 | Regenerate all 8 units via new pipeline (prior content lacked CED research) |
| W1-B | 7 | AP World History | 9 | Heavy stimulus: passages, tables |
| W1-C | 8 | AP Government | 5 | Stimulus: passages, tables, graphs |
| W1-D | 11 | AP CSP | 5 | College Board pseudocode only (Critical Rule #5) |

### Wave 2 — Math/Formula-Heavy Subjects (3 parallel agents)

| Agent | Phase | Subject | Units | Special Requirements |
|-------|-------|---------|-------|---------------------|
| W2-E | 9 | AP Calculus AB | 8 | Heavy KaTeX, graph stimuli |
| W2-F | 10 | AP Precalculus | 4 | Heavy KaTeX, graph stimuli |
| W2-G | 12 | AP Chemistry | 9 | Chemistry Checker required (Critical Rule #7), balanced equations |

### Why This Split
- Wave 1 subjects are text/concept-heavy — straightforward JSON generation
- Wave 2 subjects need heavy KaTeX and Chemistry Checker — benefit from Wave 1 lessons learned
- AP CSP in Wave 1 despite pseudocode requirement — it's structural, not mathematical

---

## Per-Agent Pipeline

Each agent runs the **full Content Pipeline** autonomously within its worktree:

```
1. RESEARCH  [Sonnet] — WebSearch/WebFetch College Board CED; produce RESEARCH.md + draft meta.json
2. PLAN      [Sonnet] — Read RESEARCH.md; produce PLAN.md (per-unit topics, stimulus types, difficulty targets, drill coverage list)
3. WRITE     [Sonnet] — Read PLAN.md; generate meta.json + all unit JSON files (drills, MCQs, study guides)
4. REVIEW    [Opus]   — Validate schema, curriculum accuracy, KaTeX, all 10 quality gates (G1–G10) — final gate before commit
5. COMMIT              — Atomic commit per subject in worktree branch
```

**Model rationale:** Researcher/Planner/Writer are structured, high-volume, schema-driven — Sonnet handles these well and avoids Opus rate limit pressure during parallel wave execution. Reviewer is the single quality gate before content ships — Opus's judgment is reserved for this critical step.

### Agent Dispatch Template

Each content agent receives:
1. This file (`CONTENT-WAVES.md`) — orchestration context
2. `CLAUDE.md` — project rules + critical rules
3. **`docs/superpowers/specs/2026-03-26-drill-mcq-redesign.md`** — REQUIRED: new drill mode taxonomy, single canonical answer, is_key_term rules, concept_mc format, MCQ realism standards, stimulus rate targets per subject, distractor quality standards, CB question language
4. `docs/PRD.md` → `data_schemas` + `content_agent_team` sections
5. `data/schemas/*.schema.json` — canonical JSON schemas
6. `public/data/ap-psychology/` — reference fixture files (calibration — format only; content will be regenerated)
7. Phase-specific `XX-CONTEXT.md` — subject details, unit list, updated drill modes

### Quality Gates (Non-Negotiable)

Every agent must pass ALL gates before its commit is accepted:

| Gate | Check | Fail Action |
|------|-------|-------------|
| G1: Schema | Every JSON file validates against `data/schemas/*.schema.json` | Fix and re-validate |
| G2: Difficulty | 20% easy / 45% medium / 35% hard (±5% tolerance per unit) | Rebalance |
| G3: MCQ Count | 50–100 MCQs per unit | Add/remove questions |
| G4: Drill Coverage | Every testable term, formula, person, concept covered; typed:MC split matches subject profile | Add missing cards |
| G5: KaTeX | All math in KaTeX — zero plain text formulas | Convert to KaTeX |
| G6: Explanations | Every MCQ choice + every concept_mc choice has specific explanation (no vague) | Rewrite vague ones |
| G7: Correct Answers | Exactly 1 `is_correct: true` per question / per concept_mc; no `alternate_answers` field present | Fix |
| G8: ID Uniqueness | No duplicate IDs within a subject | Renumber |
| G8b: Key Terms | 8–15 cards per unit have `is_key_term: true`; none are `concept_mc` mode | Fix |
| G8c: Drill Modes | Only approved modes per subject profile; no `term_to_definition`, `formula_to_type`, `event_to_date`, `concept_to_example` | Fix |
| G8d: MCQ Stimulus Rate | Stimulus % meets target for subject (see redesign spec Section 3.1) | Add stimulus questions |
| G9: Pseudocode (CSP) | College Board syntax only — no Python/Java | Rewrite |
| G10: Chemistry | All equations balanced, KaTeX verified by Chemistry Checker | Fix equations |

### Difficulty Distribution Target
```
Per unit (50-100 MCQs):
  Easy:   20% (±5%) — ~10-20 questions
  Medium: 45% (±5%) — ~22-45 questions
  Hard:   35% (±5%) — ~17-35 questions
```

---

## File Output Structure

Each agent produces files under `public/data/[subject-slug]/`:

```
public/data/[subject-slug]/
  meta.json                    # Subject metadata (units, exam info, CB percentages)
  drills/
    unit-1.json ... unit-N.json
  mcq/
    unit-1.json ... unit-N.json
  study-guide/
    unit-1.json ... unit-N.json
```

### File Format — Wrapper Structure

**MCQ files** (`mcq/unit-N.json`):
```json
{
  "subject": "ap-psychology",
  "unit": "unit-1",
  "unit_name": "Biological Bases of Behavior",
  "questions": [ /* array of MCQ objects per mcq.schema.json */ ]
}
```

**Drill files** (`drills/unit-N.json`):
```json
{
  "subject": "ap-psychology",
  "unit": "unit-1",
  "unit_name": "Biological Bases of Behavior",
  "cards": [ /* array of Drill objects per drill.schema.json */ ]
}
```

**Study Guide files** (`study-guide/unit-N.json`):
```json
/* Single StudyGuide object per study-guide.schema.json — no wrapper */
```

**Meta file** (`meta.json`):
```json
/* Single SubjectMeta object per meta.schema.json */
```

---

## Merge Strategy

1. Each Wave 1 agent works in an isolated git worktree on branch `content/[subject-slug]`
2. All 4 Wave 1 agents run concurrently
3. After Wave 1 completes, merge all 4 branches into `master` (no conflicts — different directories)
4. Spot-check one subject's output before launching Wave 2
5. Wave 2 agents work the same way on branches `content/[subject-slug]`
6. After Wave 2 completes, merge all 3 branches into `master`

### Worktree Branch Naming
```
content/ap-psychology       (Wave 1)
content/ap-world-history    (Wave 1)
content/ap-government       (Wave 1)
content/ap-csp              (Wave 1)
content/ap-calculus-ab      (Wave 2)
content/ap-precalculus      (Wave 2)
content/ap-chemistry        (Wave 2)
```

---

## Orchestrator Checklist

### Pre-Wave 1
- [x] Phase 5 complete (practice test interface works)
- [x] Drill/MCQ redesign spec approved (`docs/superpowers/specs/2026-03-26-drill-mcq-redesign.md`)
- [x] Schema files updated: `drill.schema.json` (new modes, no alternate_answers, is_key_term, choices), `study-guide.schema.json` (key_terms removed)
- [x] PRD.md schemas updated to match new schemas + drill profiles
- [x] All 7 content CONTEXT.md files updated with correct drill modes
- [x] `feat/session-persistence` merged to main
- [x] DrillCard updated: `name_to_formula` mode (live KaTeX preview, formatting help modal) + `concept_mc` mode (multiple choice UI)
- [x] Formula notation parser utility built
- [x] Study guide component updated to source key terms from `is_key_term: true` drill cards
- [x] Existing `public/data/` content cleared (all content regenerated per new spec)

### Wave 1 Launch
- [ ] Dispatch 4 parallel agents (W1-A through W1-D) with worktree isolation
- [ ] Each agent receives: CONTENT-WAVES.md + CLAUDE.md + PRD.md + schemas + fixtures + phase CONTEXT.md

### Wave 1 → Wave 2 Gate
- [ ] All 4 Wave 1 branches merged
- [ ] Spot-check: pick 1 random unit from 1 random subject, verify schema + content quality
- [ ] Fix any systematic issues before Wave 2

### Wave 2 Launch
- [ ] Dispatch 3 parallel agents (W2-E through W2-G) with worktree isolation
- [ ] AP Chemistry agent must run Chemistry Checker subagent

### Post-Wave 2
- [ ] All 3 Wave 2 branches merged
- [ ] Full cross-subject validation: every subject has meta.json + all unit files
- [ ] Update CLAUDE.md Phase Tracker (Phases 6–12 → Complete)
- [ ] Update STATE.md + ROADMAP.md progress tables

---

## ID Convention

| Subject | Prefix | MCQ Example | Drill Example |
|---------|--------|-------------|---------------|
| AP Psychology | `psych` | `psych-u1-q001` | `psych-u1-d001` |
| AP World History | `whist` | `whist-u1-q001` | `whist-u1-d001` |
| AP Government | `gov` | `gov-u1-q001` | `gov-u1-d001` |
| AP Calculus AB | `calc` | `calc-u1-q001` | `calc-u1-d001` |
| AP Precalculus | `precalc` | `precalc-u1-q001` | `precalc-u1-d001` |
| AP CSP | `csp` | `csp-u1-q001` | `csp-u1-d001` |
| AP Chemistry | `chem` | `chem-u1-q001` | `chem-u1-d001` |

Study guide IDs: `[prefix]-sg-unit-[N]` (e.g., `psych-sg-unit-1`)
