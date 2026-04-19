# FRQ Scoring Guideline Enrichment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend every FRQ JSON with `official_rubric` + `sample_responses` per scoring point so the grader has concrete earn/no-earn anchors instead of just structural presence checks. Fixes the "6/6 on weak essay" failure mode identified during strict-mode testing of `gov-2019-frq-4`.

**Architecture:** Schema-first. Add two optional fields to `FRQScoringPoint`. Update the grader prompt to render them when present. Extract from official CB scoring guideline PDFs (released FRQs) or synthesize from released templates (generated FRQs). Backward-compatible: FRQs without the new fields still grade as before.

**Tech Stack:** TypeScript (Next.js 14, App Router), existing `utils/frqGradingPrompt.ts` prompt builder, `utils/frqSession.ts` type definitions. PDF reading via Claude Code Read tool. No new dependencies.

---

## FRQ inventory (scoped)

| Subject | Released | Generated | Total | PDFs available |
|---|---|---|---|---|
| ap-psychology | 20 | 10 | 30 | Yes |
| ap-world-history | 48 | 0 | 48 | Yes |
| ap-government | 44 | 0 | 44 | Yes |
| ap-calculus-ab | 120 | 0 | 120 | Yes |
| ap-precalculus | 8 | 16 | 24 | Yes (sparse — CED is 2024+) |
| ap-chemistry | 77 | 0 | 77 | Yes |
| ap-calculus-bc | 78 | 0 | 78 | Yes |
| **Total** | **395** | **26** | **421** | — |

CSP has no FRQ content and is skipped.

---

## File Structure

**New/modified files:**
- Modify: `utils/frqSession.ts` — add two optional fields to `FRQScoringPoint`
- Modify: `utils/frqGradingPrompt.ts:276-292` — `renderScoringPoints` renders new fields when present
- Modify: `public/data/{subject}/frq/*.json` — ~421 files, additive enrichment only (do not touch existing fields)
- Create: `docs/superpowers/plans/2026-04-18-frq-scoring-guideline-enrichment.md` — this file

**Already existing (reference material):**
- `content-sources/frq-pdfs/{subject}/scoring-guidelines/*.pdf` — source of truth for released FRQs
- `content-sources/frq-pdfs/{subject}/questions/*.pdf` — question PDFs if needed for context

---

## Task 1: Schema Extension

**Files:**
- Modify: `utils/frqSession.ts:32-45` — add fields to `FRQScoringAlternative` and `FRQScoringPoint`

- [ ] **Step 1: Add new types**

Edit `utils/frqSession.ts` to extend the `FRQScoringPoint` interface. Replace the existing `FRQScoringAlternative` and `FRQScoringPoint` interfaces (lines 31-45) with:

```ts
/** One way a student can earn a scoring point — ALL required_elements must be present. */
export interface FRQScoringAlternative {
  required_elements: string[]  // ALL must be present to earn via this alternative
  correct_example: string      // plain example response demonstrating this alternative
}

/** Annotated student response sample for grader calibration.
 * source='cb_guideline' = extracted verbatim or near-verbatim from the College
 * Board scoring guideline PDF. source='synthesized' = constructed by an LLM
 * based on the rubric when no CB sample existed (older exams or generated FRQs). */
export interface FRQSampleResponse {
  response: string              // the sample student response text
  earned: boolean               // did this sample earn the point?
  commentary: string            // 1-2 sentence scorer commentary explaining the verdict
  source: 'cb_guideline' | 'synthesized'
}

/** One earnable AP point with alternatives, wrong examples, and optional traps. */
export interface FRQScoringPoint {
  point_id: string              // e.g., "a1", "b2" — unique within the FRQ
  point_value: number           // almost always 1 (AP points are binary)
  description: string           // plain-English what this point tests
  alternatives: FRQScoringAlternative[]  // any ONE earns the point
  wrong_examples: string[]      // responses that would NOT earn the point
  common_traps?: string[]       // optional pitfalls/misconceptions
  official_rubric?: string      // verbatim or paraphrased CB rubric language for this point
  sample_responses?: FRQSampleResponse[]  // 2-3 annotated samples anchoring earn/no-earn
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No new errors introduced by this change. Existing errors in `utils/__tests__/parseInlineMath.test.ts` and `studyGuide.test.ts` are pre-existing and unrelated.

- [ ] **Step 3: Commit**

```bash
git add utils/frqSession.ts
git commit -m "feat(frq): add official_rubric + sample_responses fields to FRQScoringPoint

Backward-compatible optional fields. Populated by a separate enrichment
pass from College Board scoring guideline PDFs (released FRQs) or
synthesis from released templates (generated FRQs).
"
```

---

## Task 2: Grader Prompt Rendering Update

**Files:**
- Modify: `utils/frqGradingPrompt.ts:276-292` — update `renderScoringPoints`

- [ ] **Step 1: Update renderScoringPoints**

The existing function (lines 276-292) formats `alternatives`, `wrong_examples`, `common_traps` into the prompt. Add two new blocks when the new fields are present. Replace the `renderScoringPoints` function with:

```ts
function renderScoringPoints(points: FRQScoringPoint[]): string {
  return points.map(sp => {
    const alts = sp.alternatives.map((alt, i) => {
      const elements = alt.required_elements.map(e => `          - ${e}`).join('\n')
      return `        Alternative ${i + 1} — ALL of:\n${elements}\n        Reference example: ${alt.correct_example}`
    }).join('\n')
    const wrongs = sp.wrong_examples.map(w => `        - ${w}`).join('\n')
    const traps = sp.common_traps?.length
      ? `\n      COMMON TRAPS:\n${sp.common_traps.map(t => `        - ${t}`).join('\n')}`
      : ''
    const officialRubric = sp.official_rubric
      ? `\n      OFFICIAL COLLEGE BOARD RUBRIC LANGUAGE:\n        ${sp.official_rubric}`
      : ''
    const samples = sp.sample_responses?.length
      ? `\n      ANNOTATED SAMPLE RESPONSES (use these to calibrate your grading):\n${sp.sample_responses.map((s, i) => {
          const verdict = s.earned ? 'EARNED' : 'DID NOT EARN'
          const src = s.source === 'cb_guideline' ? 'from CB scoring guideline' : 'synthesized from rubric'
          return `        Sample ${i + 1} (${verdict}, ${src}):\n          Response: "${s.response}"\n          Commentary: ${s.commentary}`
        }).join('\n')}`
      : ''
    return `    POINT ${sp.point_id} [${sp.point_value} pt]: ${sp.description}
      ALTERNATIVES (any ONE earns the point):
${alts}
      WRONG ANSWERS (0 points):
${wrongs}${traps}${officialRubric}${samples}`
  }).join('\n\n')
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No new errors.

- [ ] **Step 3: Smoke test — render one FRQ that already has the new fields**

Temporarily add the fields to one FRQ (e.g., `public/data/ap-government/frq/gov-2019-frq-4.json` Row D) with a single sample response, then call `buildFRQGradingPrompt` via a one-off script to print the prompt and confirm the new sections appear. Revert the file after confirming. (Optional — skip if pressed for time; Task 5 validates end-to-end.)

- [ ] **Step 4: Commit**

```bash
git add utils/frqGradingPrompt.ts
git commit -m "feat(frq): grader prompt renders official_rubric + sample_responses when present

No behavior change for FRQs without the new fields. FRQs that have
enriched scoring guidelines now give the LLM explicit CB-derived
rubric language and earn/no-earn sample anchors.
"
```

---

## Tasks 3a–3g: Per-Subject Released FRQ Enrichment (Parallel)

Each of these tasks is independent and can run in parallel (different directories, no shared state). Each is a single Sonnet subagent dispatch.

### Task 3a: Enrich ap-psychology (20 released FRQs)
### Task 3b: Enrich ap-world-history (48 released FRQs)
### Task 3c: Enrich ap-government (44 released FRQs)
### Task 3d: Enrich ap-calculus-ab (120 released FRQs — may chunk)
### Task 3e: Enrich ap-precalculus (8 released FRQs)
### Task 3f: Enrich ap-chemistry (77 released FRQs)
### Task 3g: Enrich ap-calculus-bc (78 released FRQs)

**Subagent brief (same pattern for all seven subjects, substitute `{subject}`):**

Each subagent receives:
- Target subject
- Path to scoring-guideline PDFs: `content-sources/frq-pdfs/{subject}/scoring-guidelines/`
- Path to FRQ JSONs: `public/data/{subject}/frq/`
- Instruction to process only files where `source == "released"`
- Schema reference (the new types from Task 1)
- Anti-hallucination guardrails

**Files each subagent modifies:**
- `public/data/{subject}/frq/*.json` (released only) — add `official_rubric` and `sample_responses` to each `scoring_point` in each `part`

- [ ] **Step 1: Draft the subagent brief**

The brief instructs the agent to:
1. Map each PDF to its FRQ JSON(s). CB PDFs typically contain multiple questions per year; split by "Question N" headers and match to corresponding JSON files by year + question number.
2. For each scoring point in each FRQ JSON:
   - Extract the official rubric language from the PDF verbatim (or near-verbatim) → `official_rubric`
   - Find 2-3 sample student responses in the PDF (if present) → `sample_responses` with `source: "cb_guideline"`
   - If the PDF has no sample responses, synthesize 2 samples (1 earning, 1 not earning) based strictly on the `required_elements` and `wrong_examples` already in the JSON → `source: "synthesized"`
3. **Anti-hallucination rules:** synthesized samples MUST use only concepts/facts/terminology present in either (a) the PDF's rubric text or (b) the FRQ JSON's existing fields. Do NOT invent new historical figures, dates, equations, theorems, or AP terminology. If the agent is uncertain, it omits the sample rather than guessing.
4. Write files incrementally — after each FRQ JSON update, commit that file. Per existing project feedback, never accumulate >25 changes before writing.
5. Log PDF-to-JSON mapping decisions to a run log so I can spot-check.

- [ ] **Step 2: Dispatch the seven subagents**

Seven parallel Sonnet subagents, one per subject. Large subjects (ap-calculus-ab: 120, ap-chemistry: 77, ap-calculus-bc: 78) may need to be chunked by year range if the agent reports running low on context — but start with one agent per subject and escalate only if needed.

- [ ] **Step 3: Review each subagent's mapping log**

Spot-check 2-3 FRQ files per subject to confirm:
- `official_rubric` is present and matches the PDF
- `sample_responses` are present (at least 2, ideally from `cb_guideline`)
- Synthesized samples only use terminology from the rubric — no invented facts
- File is still valid JSON

- [ ] **Step 4: Commit per subject**

Each subagent should commit as it goes; the parent agent verifies the commits landed cleanly on main.

---

## Task 4: Generated FRQ Synthesis

Generated FRQs have no CB scoring guideline — the rubric must be synthesized from a released FRQ of the same `frq_type` as a template.

**Subjects with generated FRQs:**
- ap-psychology: 10 generated
- ap-precalculus: 16 generated

**Files:**
- Modify: `public/data/ap-psychology/frq/*.json` (generated only — 10 files)
- Modify: `public/data/ap-precalculus/frq/*.json` (generated only — 16 files)

- [ ] **Step 1: Subagent brief for generated FRQ synthesis**

Each agent:
1. Reads a released FRQ from the same subject+frq_type (already enriched in Task 3) as the template
2. For each scoring point in the generated FRQ:
   - Derive `official_rubric` by adapting the released FRQ's rubric language to the generated FRQ's topic (preserving the CB-style phrasing)
   - Construct 2-3 `sample_responses` (1 earning, 1-2 not earning) based strictly on the generated FRQ's existing `required_elements` and `correct_example` → all mark `source: "synthesized"`
3. Anti-hallucination: all sample content must derive from the generated FRQ's existing fields — the agent is NOT generating new content, just packaging existing content into the sample-response format
4. Writes incrementally, commits per file

- [ ] **Step 2: Dispatch two subagents (psychology + precalculus) in parallel**

- [ ] **Step 3: Spot-check 3 files per subject**

Confirm synthesized samples are plausible earning/not-earning examples that match the existing rubric structure, not inventions.

- [ ] **Step 4: Commit**

Subagents commit as they go; parent verifies.

---

## Task 5: Validation — Re-grade the Test Case

**Files:**
- Reference only: `public/data/ap-government/frq/gov-2019-frq-4.json` (enriched by Task 3c)

- [ ] **Step 1: Submit the weak essay through the strict grader**

Reproduce the failing test case: submit the 4-paragraph "expanded national government" essay through the FRQ grading API with `strictness: "strict"`.

- [ ] **Step 2: Verify the score**

Expected result: total_score = 5/6 (not 6/6). Specifically:
- a (Thesis): 1/1
- b (Evidence): 3/3
- c (Reasoning): 1/1
- d (Rebuttal): 0/1 — the grader should now cite the "generic reaffirm" sample response as the matching failure pattern and deny the point

If Row D still earns, inspect the grading result to see why. Likely fix: strengthen the `sample_responses` for `d1` in `gov-2019-frq-4.json` to include a sample matching the exact student text. Do NOT relax any strict-mode rules — the failure would indicate the samples need to be more on-point.

- [ ] **Step 3: Regression-test a strong essay**

Submit a clearly strong rebuttal (e.g., the reference example from the FRQ JSON) and confirm it still scores 6/6. This ensures the new samples aren't causing over-denial.

- [ ] **Step 4: Document the outcome**

Update `CLAUDE.md` "Decisions Log" with a single line:
```
- 2026-04-18: FRQ scoring guidelines extracted from CB PDFs and embedded per-question (official_rubric + sample_responses on each scoring_point). Grader prompt renders these when present. Fixes strict-mode over-awarding on essay rebuttals.
```

- [ ] **Step 5: Final commit**

```bash
git add CLAUDE.md
git commit -m "docs: record FRQ scoring guideline enrichment in decisions log"
```

---

## Self-Review Notes

- **Spec coverage:** Task 1 (schema) + Task 2 (prompt render) + Tasks 3a-3g (released) + Task 4 (generated) + Task 5 (validation) cover the user's full scope (b=all subjects, b=rubric+samples, a=new fields).
- **Anti-hallucination:** Guardrails built into both Task 3 and Task 4 subagent briefs. Synthesized content must derive from existing rubric/JSON material.
- **Backward compatibility:** The two new fields are optional. FRQs without them grade the same as before. The rendering function only adds sections when fields are present.
- **Parallelism:** Tasks 3a-3g are independent (different subject directories). Task 4 subagents are independent. Total parallel dispatch after Tasks 1-2 complete: 7 + 2 = 9 agents.
- **Cost:** ~421 FRQs × ~2-3 minutes per FRQ at Sonnet rates. Running 9 agents in parallel reduces wall time significantly.
