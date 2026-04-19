# FRQ Stimulus Completeness — Design

**Date:** 2026-04-19
**Author:** Claude (with akshar.kakkad@gmail.com)
**Status:** Draft

## Problem

Two related defects affect FRQ stimulus quality across the app:

1. **Missing EBQ source text.** `psych-2025-set1-frq-2.json` (Social Psychology — Social Facilitation and Performance EBQ) has all three source documents stored as images only. The `content` field is `null` for every source, so users see graphs and figures but no Introduction, Participants, Method, or Results and Discussion text. The other 2025 EBQ (`psych-2025-set2-frq-2.json`, Bystander Effect) has full text content extracted and serves as the working template.

2. **Truncated/cut-off stimulus across all FRQs.** The original PDF extractor occasionally dropped or split words ("T he", "W hile", incomplete final sentences). The 2026-04-17 audit (`AUDIT-REPORT-2026-04-17.md`) repaired 22 AP Psychology files, but the user reports residual truncations are still visible. Other subjects (Calc AB, Calc BC, Chemistry, Government, Precalculus, World History — 391 additional files) were never audited for OCR truncation.

3. **One wrong image** still outstanding from the prior audit: `psych-2025-set1-frq-2-doc3.png` shows the Source 2 baboon experiment instead of the Source 3 human evaluator/electronic-monitoring study.

## Goal

Every FRQ stimulus and EBQ source document presents complete, accurate text matching the original College Board PDF. No mid-sentence truncations, no missing background paragraphs, no image-only sources where the source has accompanying text.

## Non-Goals

- Rewriting or paraphrasing College Board content
- Replacing any image stimulus with text (figures, graphs, and tables that are inherently visual stay as images — text is added *alongside*, not instead of)
- Auditing scoring guidelines, rubrics, or part prompts (already covered by prior audit)
- Auditing generated FRQs (`*-gen-*.json`) — they have no source PDF to compare against

## Scope

**421 FRQ JSON files across 7 subjects:**
| Subject | Count |
|---|---|
| AP Calculus AB | 120 |
| AP Calculus BC | 78 |
| AP Chemistry | 77 |
| AP Government | 44 |
| AP Precalculus | 24 |
| AP Psychology | 30 |
| AP World History | 48 |

All source PDFs available at `content-sources/frq-pdfs/<subject>/questions/*.pdf`.

## Architecture

Three sequential stages, each with its own validation gate.

### Stage 1 — Fix Social Facilitation EBQ (immediate, scoped)

**Inputs:**
- `content-sources/frq-pdfs/ap-psychology/questions/2025 psych set 1 frq.pdf`
- Existing `psych-2025-set1-frq-2.json`
- Format reference: `psych-2025-set2-frq-2.json` (Bystander Effect — same structure)

**Steps:**
1. Extract Source 1, Source 2, Source 3 prose text from the PDF using `pdfplumber` (more reliable than the original extractor — preserves whitespace and handles multi-column layouts better).
2. Format each source's `content` field as plain text with `\n`-separated section labels matching the Bystander Effect template:
   ```
   Introduction
   <intro paragraph>
   Participants
   <participants paragraph>
   Method
   <method paragraph(s)>
   Results and Discussion
   <results paragraph(s) + any inline markdown table>
   <APA citation as final line>
   ```
3. Keep `image: <existing path>` populated alongside `content` — the EBQ layout (`FRQEBQLayout.tsx` lines 264–285) already renders both image and text when both are present.
4. Replace `psych-2025-set1-frq-2-doc3.png` with the correct human study image extracted from the source PDF (page 10, per the prior audit).

**Validation:**
- Run `npm run build` — must compile cleanly
- Visually load the EBQ in the dev server, confirm all 3 sources show both image and prose text
- Diff against PDF text by character count — within 5% tolerance

### Stage 2 — Spot-check Bystander Effect EBQ

**Steps:**
1. Re-extract `2025 psych set 2 frq.pdf` Sources 1–3 with `pdfplumber`
2. Diff against existing `content` fields in `psych-2025-set2-frq-2.json`
3. If discrepancies >20 characters, patch them; otherwise mark complete

### Stage 3 — Truncation audit across all 421 FRQs

**Phase 3a — Scanner (report-only, no writes):**

Build `scripts/audit-frq-stimulus.py` that:
1. For each FRQ JSON file, identifies the source PDF by filename convention (e.g., `psych-2025-set1-frq-2.json` → `2025 psych set 1 frq.pdf`)
2. Extracts the corresponding stimulus region from the PDF using `pdfplumber`
3. Compares extracted PDF text to the JSON's `stimulus` and `documents[].content` fields
4. Flags as suspicious if any of:
   - JSON text is >20 characters shorter than PDF region
   - JSON text ends without terminal punctuation (`.`, `?`, `!`, `"`, `)`, `|`)
   - JSON contains telltale OCR artifacts: `\b[A-Z] [a-z]+\b` (split words like "T he"), `\b[a-z]+- [a-z]+\b` (broken hyphens)
   - JSON has 3+ consecutive `\n` (likely lost paragraph)

**Output:** `.planning/audits/2026-04-19-frq-truncation-report.md` with one section per flagged file:
```
## <subject>/<filename>
**Issue:** <auto-classified type>
**Current text (last 100 chars):** ...
**PDF text (last 100 chars):** ...
**Suggested patch:** <replacement string OR "manual review needed">
```

**Phase 3b — Apply fixes (manual review + write):**

For each entry in the report:
1. Human (or content-pipeline subagent) reviews PDF context to confirm the patch is correct
2. JSON file is updated via direct edit (small diff) or by Sonnet content agent (larger restructures, e.g., reformatting tables)
3. Each subject batch commits as `content(<subject>): repair truncated FRQ stimulus`

**Why report-first, not auto-patch:**
- Some FRQs have intentionally short stimuli (e.g., "Consider the function f(x) = ...")
- Stage 1 would corrupt good files if run blindly
- A report lets us tune the heuristics on the first batch before scaling

**Validation:**
- After each subject batch: `npm run build` passes
- Re-run scanner: zero flagged files (or all remaining flags are documented false positives)

## Components & Files Touched

| File | Stage | Change |
|---|---|---|
| `public/data/ap-psychology/frq/psych-2025-set1-frq-2.json` | 1 | Populate `content` for 3 sources |
| `public/data/ap-psychology/frq/images/psych-2025-set1-frq-2-doc3.png` | 1 | Replace wrong image |
| `public/data/ap-psychology/frq/psych-2025-set2-frq-2.json` | 2 | Patch only if diff found |
| `scripts/audit-frq-stimulus.py` | 3a | New — scanner + reporter |
| `.planning/audits/2026-04-19-frq-truncation-report.md` | 3a | New — output |
| `public/data/<subject>/frq/*.json` | 3b | Targeted patches per report findings |

**No component code changes.** `FRQEBQLayout.tsx` and `FRQDocumentContent.tsx` already render image+text correctly.

## Data Flow

```
Source PDF (College Board)
   ↓ pdfplumber.extract_text(page_range)
Extracted text (Python string)
   ↓ format_as_ebq_section() OR diff_against_json()
Either:
   → Direct JSON write (Stage 1, Stage 2 patch)
   → Markdown report entry (Stage 3a)
   ↓ human/agent review
   → Targeted JSON Edit (Stage 3b)
```

## Error Handling

- **PDF page mismatch (Stage 3 file naming convention fails):** Scanner logs `WARN: no PDF found for <file>`, skips, continues
- **PDF extraction fails entirely on a file:** Scanner logs error, skips, continues — does not abort the run
- **JSON parse error:** Scanner logs file path + parse error, skips — these are pre-existing bugs unrelated to this work
- **Image replacement (Stage 1):** If correct image cannot be cleanly extracted from PDF page 10, fall back to flagging in `IMAGE-AUDIT-ISSUES.md` for manual replacement (matches prior audit's existing pattern)

## Testing

**Stage 1:**
- Build passes
- Visual confirmation in browser (screenshot loop) — user verifies all 3 source tabs show prose text + image
- Sources match PDF (manual char-count check)

**Stage 2:**
- Build passes
- Diff report shows zero significant discrepancies OR documented patches applied

**Stage 3a:**
- Scanner runs on full 421-file corpus without crashing
- Report file generated and human-readable
- At least one known-good file (e.g., `psych-2025-set2-frq-2.json` after Stage 2) shows zero flags

**Stage 3b:**
- Per-subject builds pass
- Re-run scanner: flag count converges to zero or documented false positives
- Spot-check 2–3 patched files in browser

## Open Questions

None. The plan is concrete enough to execute.

## Decisions

- **2026-04-19:** Use `pdfplumber` for re-extraction (better whitespace handling than the original tool that produced the OCR artifacts)
- **2026-04-19:** Report-first for Stage 3 (auto-patching would corrupt intentionally-short stimuli)
- **2026-04-19:** Keep images alongside text in EBQ sources — `FRQEBQLayout` already supports both renderings
- **2026-04-19:** Skip generated FRQs (`*-gen-*.json`) from Stage 3 — no source PDF to compare against, and they were authored fresh, not extracted
