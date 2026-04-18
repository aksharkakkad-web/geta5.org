# AP Psychology FRQ Content Audit — 2026-04-17

## Summary

- **Files audited:** 30 JSON files + 16 images
- **Auto-fixed:** 22 JSON files (73%)
- **Manual intervention required:** 3 items (2 files with empty rubrics, 1 wrong image)
- **Code changes:** 5 component files updated (frqContentParser.ts, FRQDocumentContent.tsx, FRQStimulusBlock.tsx, FRQEBQLayout.tsx, FRQDBQLayout.tsx)

---

## Part 1: Code Fixes

### Changes Made

| Commit | File | Change |
|--------|------|--------|
| 685f536 | `components/frq/frqContentParser.ts` | Created — shared parsing utilities (section headers, tables, citations) |
| bd5b409 | `components/frq/FRQStimulusBlock.tsx` | Refactored to import from frqContentParser (removed 121 lines of duplicate code) |
| 014a41d | `components/frq/FRQDocumentContent.tsx` | Created — smart document renderer for EBQ/DBQ layouts |
| e882e5e | `components/frq/FRQEBQLayout.tsx` | Replaced raw `{activeDoc.content}` / `{doc.content}` with `<FRQDocumentContent>` (desktop + mobile) |
| e882e5e | `components/frq/FRQDBQLayout.tsx` | Same replacement (desktop + mobile accordion) |

### Result

Research article documents now render with labeled section headers (Introduction, Participants, Method, Results and Discussion), styled tables from markdown pipe syntax, and separated APA citations/footnotes — instead of raw pre-wrap text.

---

## Part 2: JSON Content Audit

### ✅ Files with No Issues (8)

- psych-2025-set1-frq-2.json
- psych-2025-set2-frq-2.json
- psych-gen-a2.json
- psych-gen-b2.json
- psych-gen-c2.json
- psych-gen-d2.json
- psych-gen-e2.json
- psych-2021-set2-frq-1.json *(structurally valid — but see 🚨 MANUAL below)*

### ⚠️ Files with Auto-Fixed Issues (22)

#### 2021 Files (commit 96aad3d)

**psych-2021-set1-frq-1.json**
- Collapsed mid-sentence `\n` in stimulus

**psych-2021-set1-frq-2.json**
- Rewrote inline grade table (no delimiters) as markdown pipe table
- Fixed malformed part e prompt ("Explain how Explain the ethical flaw...")

**psych-2021-set2-frq-2.json**
- Rewrote inline results table ("Group A Group B Mean...") as markdown pipe table
- Fixed malformed part e prompt (same double-template pattern)

#### 2022 Files (commit 96aad3d)

**psych-2022-set1-frq-1.json**
- Fixed OCR split-word artifacts ("W hile" → "While", "T he" → "The")
- Collapsed mid-sentence `\n` breaks

**psych-2022-set1-frq-2.json**
- Collapsed 2 mid-sentence `\n` breaks in stimulus

**psych-2022-set2-frq-1.json**
- Fixed OCR split-word artifacts throughout stimulus and part prompts
- Removed dangling `"movie."` fragments prepended to parts d/e/f prompts

**psych-2022-set2-frq-2.json**
- Fixed OCR artifacts in stimulus ("W eb\nsite" → "Website")
- Removed dangling `"site."` fragments from parts e/f/g prompts

#### 2023 Files (commit 472745f)

**psych-2023-set1-frq-1.json**
- Removed erroneous authoritarian parenting block prepended to part g (neuroticism) description

**psych-2023-set1-frq-2.json**
- Completed truncated stimulus (was cut off mid-sentence at "has a distant style (permissive and")

**psych-2023-set2-frq-1.json**
- Stripped description contamination in parts c (extraversion) and f (actor-observer bias) — each had the previous part's full acceptable/unacceptable examples prepended

**psych-2023-set2-frq-2.json**
- Rewrote garbled inline results table across parts d/e/f/g prompts as markdown pipe table (Observed vs Personally Played: mean 6.31 vs 2.04, SD 1.25 vs 0.80, p < 0.001)

#### 2024 Files (commit 472745f)

**psych-2024-set1-frq-1.json**
- Fixed systematic description mismatch: parts e (motor cortex) and f (cognitive map) had each other's descriptions swapped
- Removed PDF footer artifacts from part g wrong_examples ("Total for question 1", "© 2024 College Board")
- Consolidated split wrong-example sentence fragments

**psych-2024-set1-frq-2.json**
- Fixed garbled part c prompt (AP rubric instruction text was embedded inside broken template)
- Removed authoritarian description contamination from part g (conscientiousness)
- Fixed curly double-quote characters used as JSON string delimiters in part g

**psych-2024-set2-frq-1.json**
- Fixed systematic description/scoring mismatch across parts c–g: all descriptions were shifted one position (social facilitation described kinesthetic sense, kinesthetic described context-dependent memory, etc.)
- Removed PDF artifact from wrong_examples
- Consolidated split sentence fragments

**psych-2024-set2-frq-2.json**
- Completed truncated scoring_notes in part f ("...to earn the")
- Completed truncated wrong_examples entries in part g

#### 2025 Files (commit 0cbbe67)

**psych-2025-set1-frq-1.json**
- Rewrote garbled table ("Mean Percentages of Correct, Misled, and Incorrect Responses") — column headers had been split across 4 lines with no delimiters; data rows had no pipe syntax
- Collapsed ~80-char PDF wrap line breaks throughout prose

**psych-2025-set2-frq-1.json**
- Reconstructed severely garbled table ("Total Number of Person-Oriented Dog Behaviors for Each Trial") — repeated header blocks, behavior labels split from their data across separate lines; rebuilt as 6-column pipe table with all 6 rows (Baseline, Owner crying, Owner laughing, Stranger crying, Stranger laughing, Totals)
- Collapsed mid-sentence line wraps

#### Gen Files (commit 0cbbe67)

**psych-gen-a1.json, psych-gen-b1.json, psych-gen-c1.json, psych-gen-d1.json, psych-gen-e1.json**
- Each had a "Mean Scores by Condition" table without leading/trailing `|` and without separator row — converted to full markdown pipe table format

### 🚨 Items Requiring Manual Intervention

#### 1. psych-2021-set2-frq-1.json — Empty Scoring Rubric

**Issue:** All 7 `scoring_points` entries contain placeholder content. Each `description` is `"Correctly applies [concept] to the scenario."` and every `correct_example` is `""`. No real rubric criteria exist.

**Action required:** A content agent must write substantive scoring criteria for all 7 parts based on the 2021 AP Psychology FRQ scoring guidelines (Set 2, Question 1). This question covers: classical conditioning, operant conditioning, observational learning, cognitive-social learning, cognitive map, social facilitation, and self-efficacy.

#### 2. psych-2021-set2-frq-2.json — Partially Empty Scoring Rubric

**Issue:** Parts a–d and f–g have the same placeholder pattern (`description: "Correctly applies [concept]..."`, `correct_example: ""`). Part e has real content (the study design checklist).

**Action required:** Write substantive scoring criteria for parts a–d and f–g based on 2021 AP Psychology FRQ scoring guidelines (Set 2, Question 2). This question covers: independent variable, dependent variable, operational definition, experimental group, hypothesis, scatter plot, correlation.

#### 3. psych-2025-set1-frq-2-doc3.png — Wrong Image

**Issue:** Source 3 of psych-2025-set1-frq-2.json is supposed to show a human study about performance improvement when observed by an evaluator or monitored electronically. The image currently stored as `doc3.png` shows the two-monkey conflict/non-conflict trial diagram (the baboon study from Source 2's experiment), not a human study.

**Action required:** Source the correct image from the 2025 AP Psychology exam release (Form 2, FRQ 2, Source 3 — human performance monitoring study) and replace `public/data/ap-psychology/frq/images/psych-2025-set1-frq-2-doc3.png`.

---

## Part 3: Image Audit

### All 16 Images Exist ✅

No missing files.

### Duplicate / Orphaned Images

The following 8 images are exact duplicates of the referenced stimulus images and are not referenced by any JSON file. They appear to be superseded drafts and can be deleted:

| Orphaned file | Duplicate of |
|---------------|-------------|
| `2022-psych-set-1-frq-p3-img1.png` | `psych-2022-set1-frq-2-stimulus.png` |
| `2022-psych-set-2-frq-p3-img1.png` | `psych-2022-set2-frq-2-stimulus.png` |
| `2024-psych-set-1-frq-p3-img1.png` | `psych-2024-set1-frq-2-stimulus.png` |
| `2024-psych-set-2-frq-p3-img1.png` | `psych-2024-set2-frq-2-stimulus.png` |
| `2025-psych-set-1-frq-p8-img1.png` | `psych-2025-set1-frq-2-doc1.png` |
| `2025-psych-set-1-frq-p9-img1.png` | `psych-2025-set1-frq-2-doc2.png` |
| `2025-psych-set-1-frq-p10-img1.png` | `psych-2025-set1-frq-2-doc3.png` *(both wrong)* |
| `2025-psych-set-2-frq-p5-img1.png` | `psych-2025-set2-frq-1-stimulus.png` |

---

## Verification Checklist

- [x] All 30 JSON files pass JSON.parse
- [x] All image paths in JSON resolve to real files
- [x] No garbled tables remain (no lines matching `/^\d+\s+\d+\s*$/` in content fields after fixes)
- [x] All scoring note cross-checks passed (except 2021-set2 files which have no real rubric content)
- [x] Total points match across all files
- [x] FRQEBQLayout.tsx and FRQDBQLayout.tsx use FRQDocumentContent — no raw `{content}` renders
- [x] TypeScript compiles (errors in pre-existing test files only, unrelated to this work)
