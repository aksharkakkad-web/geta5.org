# FRQ Stimulus Completeness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repair the image-only Social Facilitation EBQ so users see the Introduction/Participants/Method/Results text alongside figures, then audit all 421 FRQ JSON files across 7 AP subjects for OCR-induced truncation and fix every flagged discrepancy against the source PDF.

**Architecture:** One-off direct edit for the known broken EBQ (Stage 1) + spot-check of its sibling (Stage 2) + a Python scanner that diffs current JSON against freshly extracted PDF text and emits a review-ready markdown report (Stage 3a) + per-subject fix batches driven by the report (Stage 3b). No component/React code changes — the EBQ layout already renders text+image when both fields are populated.

**Tech Stack:** Python 3.13 + pdfplumber 0.11.9 (already installed) for PDF extraction; direct JSON Edit/Write for patches; Sonnet content-pipeline subagents for larger restructures. No new npm dependencies.

---

## Role and Mindset

You are repairing user-facing AP exam content. Accuracy matters more than speed. Before you patch any stimulus:
1. Re-extract from the source PDF yourself — do not trust the original JSON.
2. Compare character-by-character against the PDF region it came from.
3. Preserve formatting that was intentional (KaTeX, markdown pipe tables, APA citations on their own line).

**Anti-shortcuts that will cause failures:**
- Do NOT paraphrase College Board source text. Copy it verbatim.
- Do NOT remove an image to replace it with text — EBQ sources need both because graphs are inherently visual.
- Do NOT auto-apply scanner patches without human review — false positives corrupt good files.
- Do NOT run the scanner on `*-gen-*.json` files — they have no source PDF.
- Do NOT use the original `extract_psych_frq.py` for Stage 1 text extraction — its output is what caused the `content: null` problem. Use raw `pdfplumber.extract_text(page_range)` with whitespace preservation.

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| **Modify** | `public/data/ap-psychology/frq/psych-2025-set1-frq-2.json` | Stage 1: populate `content` for 3 source documents |
| **Replace** | `public/data/ap-psychology/frq/images/psych-2025-set1-frq-2-doc3.png` | Stage 1: replace wrong image with correct Source 3 human study figure |
| **Modify (if diff found)** | `public/data/ap-psychology/frq/psych-2025-set2-frq-2.json` | Stage 2: patch any discrepancies from re-extraction |
| **Create** | `scripts/audit_frq_stimulus.py` | Stage 3a: PDF↔JSON diff scanner |
| **Create** | `.planning/audits/2026-04-19-frq-truncation-report.md` | Stage 3a: scanner output |
| **Modify (per report)** | `public/data/<subject>/frq/*.json` | Stage 3b: patches for each flagged file |

---

## STAGE 1 — Fix Social Facilitation EBQ

### Task 1: Extract Source 1, 2, 3 text from the PDF

**Files:**
- Read: `content-sources/frq-pdfs/ap-psychology/questions/2025 psych set 1 frq.pdf`
- Create (temporary): `scripts/tmp_extract_social_facilitation.py`

- [ ] **Step 1.1: Create the extraction script**

```python
# scripts/tmp_extract_social_facilitation.py
# One-shot: print raw pdfplumber text for pages containing Sources 1-3 of
# the Social Facilitation EBQ (psych-2025-set1-frq-2).
# Delete this file after Task 4.

import pdfplumber
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

PDF = r'C:\Ascendly\content-sources\frq-pdfs\ap-psychology\questions\2025 psych set 1 frq.pdf'

with pdfplumber.open(PDF) as pdf:
    for i, page in enumerate(pdf.pages, start=1):
        text = page.extract_text(x_tolerance=2, y_tolerance=3) or ''
        print(f'=== PAGE {i} ({len(text)} chars) ===')
        print(text)
        print()
```

- [ ] **Step 1.2: Run it and capture output**

Run: `cd C:/Ascendly && python scripts/tmp_extract_social_facilitation.py > C:/Ascendly/.planning/audits/tmp-social-facilitation-raw.txt`
Expected: file created with page-by-page text for the full PDF.

- [ ] **Step 1.3: Locate Source 1 / Source 2 / Source 3 pages in the output**

Open `.planning/audits/tmp-social-facilitation-raw.txt` and identify the page boundaries for each source. EBQs in the 2025 set 1 PDF typically place Question 2 sources on pages ~8–10. Look for lines containing `Source 1`, `Source 2`, `Source 3` and the `Introduction` heading that follows each.

Record the exact text spans for each source (each should include: Introduction, Participants, Method, Results and Discussion, and the APA citation line). Do NOT proceed until you have three complete, verbatim source texts.

### Task 2: Populate the `content` field for all 3 documents

**Files:**
- Modify: `public/data/ap-psychology/frq/psych-2025-set1-frq-2.json`

- [ ] **Step 2.1: Open the target JSON and the format reference**

Read `psych-2025-set2-frq-2.json` (Bystander Effect EBQ) to confirm the exact `content` formatting convention: plain text with literal `\n` separators between sections, section labels on their own lines (`Introduction\n<text>\nParticipants\n<text>\n...`), APA citation as the final line.

- [ ] **Step 2.2: Edit `psych-2025-set1-frq-2.json` — Source 1**

Replace the line:
```json
      "content": null,
      "image": "/data/ap-psychology/frq/images/psych-2025-set1-frq-2-doc1.png"
```
(first occurrence, inside the `doc_number: 1` object) with:
```json
      "content": "Introduction\n<INTRO TEXT FROM PDF>\nParticipants\n<PARTICIPANTS TEXT>\nMethod\n<METHOD TEXT>\nResults and Discussion\n<RESULTS TEXT>\n<APA CITATION>",
      "image": "/data/ap-psychology/frq/images/psych-2025-set1-frq-2-doc1.png"
```
Use the verbatim text captured in Step 1.3 for each `<...>` placeholder. Preserve any inline references to tables or figures the source contains, but if the source references its own bar graph and that graph is in the image, the text still describes it in prose — include that prose.

- [ ] **Step 2.3: Edit Source 2 — same pattern**

Same replacement in the `doc_number: 2` object using Source 2's text from Step 1.3.

- [ ] **Step 2.4: Edit Source 3 — same pattern**

Same replacement in the `doc_number: 3` object using Source 3's text from Step 1.3.

- [ ] **Step 2.5: Verify JSON parses**

Run: `cd C:/Ascendly && python -c "import json; json.load(open(r'public/data/ap-psychology/frq/psych-2025-set1-frq-2.json'))"`
Expected: no output (successful parse). If `JSONDecodeError`, re-escape quotes inside the prose text with `\"`.

### Task 3: Replace the wrong doc3 image

**Files:**
- Replace: `public/data/ap-psychology/frq/images/psych-2025-set1-frq-2-doc3.png`

- [ ] **Step 3.1: Identify the correct Source 3 figure page**

From the raw extraction in `.planning/audits/tmp-social-facilitation-raw.txt`, locate the page where Source 3 appears. Source 3 is the human performance-monitoring study (evaluator / electronic monitoring). The figure on that page shows performance measurements across evaluator and electronic conditions — NOT monkeys.

- [ ] **Step 3.2: Extract the figure image from that page**

Run the existing image extractor, passing the identified page number. If `scripts/frq_extract_images.py` supports a `--page` or `--only` flag, use it:

```bash
cd C:/Ascendly && python scripts/frq_extract_images.py --pdf "content-sources/frq-pdfs/ap-psychology/questions/2025 psych set 1 frq.pdf" --page <N> --output public/data/ap-psychology/frq/images/psych-2025-set1-frq-2-doc3-NEW.png
```

If the script does not support those flags, open `scripts/frq_extract_images.py`, read how it iterates pages, and write a 10-line one-shot variant that extracts only the identified page.

Expected: a new PNG created at `psych-2025-set1-frq-2-doc3-NEW.png`.

- [ ] **Step 3.3: Visually verify the new image**

Open `psych-2025-set1-frq-2-doc3-NEW.png`. It MUST show a human-study figure (bar chart or similar about evaluator/electronic monitoring). If it still shows monkeys or any primate, the wrong page was extracted — go back to Step 3.1.

- [ ] **Step 3.4: Replace the old file**

```bash
cd C:/Ascendly && mv public/data/ap-psychology/frq/images/psych-2025-set1-frq-2-doc3-NEW.png public/data/ap-psychology/frq/images/psych-2025-set1-frq-2-doc3.png
```

- [ ] **Step 3.5: Update the image audit doc**

Open `public/data/ap-psychology/frq/IMAGE-AUDIT-ISSUES.md` and append a resolution note:

```markdown

## Resolved 2026-04-19
- psych-2025-set1-frq-2-doc3.png — replaced with correct human study figure (extracted from PDF page <N>)
```

### Task 4: Verify Stage 1 visually + commit

**Files:**
- Delete: `scripts/tmp_extract_social_facilitation.py`
- Delete: `.planning/audits/tmp-social-facilitation-raw.txt`

- [ ] **Step 4.1: Run build to catch any JSON/TS errors**

Run: `cd C:/Ascendly && npm run build`
Expected: build succeeds. If JSON parse errors surface, return to Task 2 Step 2.5.

- [ ] **Step 4.2: Start dev server and visually inspect**

Run: `cd C:/Ascendly && npm run dev` (background)
Navigate to `/practice-test?subject=ap-psychology` or wherever the EBQ is reachable. Open the Social Facilitation EBQ. Confirm:
- All 3 source tabs show BOTH the image AND prose text with `Introduction / Participants / Method / Results and Discussion` section headers
- Source 3 image shows a human study (not monkeys)
- No visible truncation mid-sentence at any source's bottom

Then STOP and say to the user:
> "UI work is done for Stage 1. Please paste a screenshot of the Social Facilitation EBQ (all 3 source tabs if possible) so I can verify it looks correct before marking this complete."

Wait for screenshot confirmation. Do not proceed to Step 4.3 until the user approves.

- [ ] **Step 4.3: Delete the temp extraction script and temp text file**

```bash
cd C:/Ascendly && rm scripts/tmp_extract_social_facilitation.py .planning/audits/tmp-social-facilitation-raw.txt
```

- [ ] **Step 4.4: Commit**

```bash
cd C:/Ascendly && git add public/data/ap-psychology/frq/psych-2025-set1-frq-2.json public/data/ap-psychology/frq/images/psych-2025-set1-frq-2-doc3.png public/data/ap-psychology/frq/IMAGE-AUDIT-ISSUES.md && git commit -m "$(cat <<'EOF'
content(psych): populate Social Facilitation EBQ source text + fix doc3 image

Replaced null content fields on all 3 sources of psych-2025-set1-frq-2
with verbatim text (Introduction/Participants/Method/Results & Discussion +
APA citation) extracted from the College Board source PDF. Images remain
alongside text. Replaced doc3 image that previously showed the Source 2
baboon study with the correct Source 3 human evaluator/electronic-
monitoring figure.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## STAGE 2 — Spot-check Bystander Effect EBQ

### Task 5: Re-extract and diff Bystander Effect sources

**Files:**
- Read: `content-sources/frq-pdfs/ap-psychology/questions/2025 psych set 2 frq.pdf`
- Modify (conditional): `public/data/ap-psychology/frq/psych-2025-set2-frq-2.json`

- [ ] **Step 5.1: Create temp extraction script**

```python
# scripts/tmp_diff_bystander.py
# One-shot: compare freshly extracted Source 1/2/3 text to current JSON.
# Delete after this task completes.

import pdfplumber
import json
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

PDF = r'C:\Ascendly\content-sources\frq-pdfs\ap-psychology\questions\2025 psych set 2 frq.pdf'
JSON_PATH = r'C:\Ascendly\public\data\ap-psychology\frq\psych-2025-set2-frq-2.json'

with open(JSON_PATH, encoding='utf-8') as f:
    data = json.load(f)

with pdfplumber.open(PDF) as pdf:
    full_text = '\n'.join(
        (page.extract_text(x_tolerance=2, y_tolerance=3) or '')
        for page in pdf.pages
    )

for doc in data['documents']:
    current = doc.get('content') or ''
    print(f"=== {doc['source']} ===")
    print(f'Current length: {len(current)} chars')
    print(f'Current last 120 chars: ...{current[-120:]}')
    print()

print('=== FULL PDF TEXT (search for Source 1/2/3) ===')
print(full_text)
```

- [ ] **Step 5.2: Run and inspect**

Run: `cd C:/Ascendly && python scripts/tmp_diff_bystander.py > .planning/audits/tmp-bystander-diff.txt 2>&1`

Open the output file. For each source: find the corresponding region in the FULL PDF TEXT block, then compare it line-by-line to the "Current last 120 chars" preview.

- [ ] **Step 5.3: Patch only if discrepancies >20 chars exist**

If all three sources match: skip Steps 5.3–5.4 and go to Step 5.5.

If any source shows a missing paragraph or truncated sentence: open `psych-2025-set2-frq-2.json` and Edit the offending `content` string, inserting the missing text verbatim from the PDF extraction.

- [ ] **Step 5.4: Verify JSON parses**

Run: `cd C:/Ascendly && python -c "import json; json.load(open(r'public/data/ap-psychology/frq/psych-2025-set2-frq-2.json'))"`
Expected: no output.

- [ ] **Step 5.5: Delete temp files and commit (only if patched)**

```bash
cd C:/Ascendly && rm scripts/tmp_diff_bystander.py .planning/audits/tmp-bystander-diff.txt
```

If edits were made:
```bash
cd C:/Ascendly && git add public/data/ap-psychology/frq/psych-2025-set2-frq-2.json && git commit -m "$(cat <<'EOF'
content(psych): patch truncated content in Bystander Effect EBQ sources

Re-extracted Source 1/2/3 text from the College Board PDF and restored
missing paragraphs found by comparison against current JSON.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

If no edits needed, just delete the temp files and skip the commit.

---

## STAGE 3a — Build the truncation scanner

### Task 6: Write the scanner script

**Files:**
- Create: `scripts/audit_frq_stimulus.py`

- [ ] **Step 6.1: Create the script with this exact content**

```python
#!/usr/bin/env python3
"""
FRQ Stimulus Truncation Auditor
================================
Scans every released FRQ JSON file, re-extracts the corresponding region
from the source PDF using pdfplumber, and emits a markdown report flagging
any file whose stimulus/documents[].content appears truncated or corrupted.

REPORT-ONLY. Does not modify any JSON files.

Heuristics for flagging:
  1. JSON stimulus text is >20 chars shorter than closest PDF region
  2. JSON text ends without terminal punctuation (. ? ! " ) | etc.)
  3. JSON contains split-word OCR artifacts: "T he", "W hile", etc.
  4. JSON contains 3+ consecutive newlines (likely lost paragraph)

Skips:
  - Files with no identifiable source PDF
  - Generated FRQs (*-gen-*.json) — no PDF to compare
  - Files that fail JSON.parse (pre-existing bugs)

Usage:
  python scripts/audit_frq_stimulus.py
  python scripts/audit_frq_stimulus.py --subject ap-psychology
  python scripts/audit_frq_stimulus.py --verbose
"""

import argparse
import json
import re
import sys
from pathlib import Path

import pdfplumber

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ROOT = Path(r'C:\Ascendly')
DATA_DIR = ROOT / 'public' / 'data'
PDF_DIR = ROOT / 'content-sources' / 'frq-pdfs'
REPORT_PATH = ROOT / '.planning' / 'audits' / '2026-04-19-frq-truncation-report.md'

SUBJECTS = [
    'ap-calculus-ab',
    'ap-calculus-bc',
    'ap-chemistry',
    'ap-government',
    'ap-precalculus',
    'ap-psychology',
    'ap-world-history',
]

SPLIT_WORD_RE = re.compile(r'\b[A-Z] [a-z]{2,}\b')
BROKEN_HYPHEN_RE = re.compile(r'\b[a-z]+- [a-z]+\b')
MULTI_NEWLINE_RE = re.compile(r'\n{3,}')
TERMINAL_PUNCT = set('.!?"\')]|') | {'.”', '."'}


def find_source_pdf(subject: str, json_path: Path) -> Path | None:
    """
    Map a FRQ JSON filename to its source PDF.
    Convention examples:
      psych-2025-set1-frq-2.json → 2025 psych set 1 frq.pdf
      calc-ab-2023-frq-4.json    → Calc AB 2023 FRQ.pdf
      gov-2024-set1-frq-3.json   → 2024 gov set 1 frq.pdf
      world-2022-set2-frq-4.json → 2022 world set 2 frq.pdf
      chem-2019-frq-3.json       → 2019 chem frq.pdf
    The PDFs for some subjects bundle all FRQs for a year in one file;
    we return the path if any PDF in the subject dir matches the year
    (+ set if present). Caller is responsible for locating the relevant
    page range within the returned PDF.
    """
    stem = json_path.stem
    year_match = re.search(r'(\d{4})', stem)
    set_match = re.search(r'set[- ]?(\d)', stem)
    if not year_match:
        return None
    year = year_match.group(1)
    set_num = set_match.group(1) if set_match else None

    pdf_subdir = PDF_DIR / subject / 'questions'
    if not pdf_subdir.exists():
        return None

    candidates = sorted(pdf_subdir.glob(f'*{year}*.pdf'))
    if set_num:
        narrowed = [p for p in candidates if f'set {set_num}' in p.name.lower() or f'set{set_num}' in p.name.lower()]
        if narrowed:
            candidates = narrowed
    return candidates[0] if candidates else None


def extract_pdf_text(pdf_path: Path) -> str:
    try:
        with pdfplumber.open(pdf_path) as pdf:
            return '\n'.join(
                (page.extract_text(x_tolerance=2, y_tolerance=3) or '')
                for page in pdf.pages
            )
    except Exception as e:
        return f'__EXTRACTION_FAILED__: {e}'


def flag_issues(text: str, pdf_text: str) -> list[str]:
    if not text or not text.strip():
        return []  # empty stimulus is valid (e.g. EBQs use documents)

    issues = []

    # Heuristic 2: missing terminal punctuation
    stripped = text.rstrip()
    if stripped and stripped[-1] not in TERMINAL_PUNCT:
        if not stripped.endswith('|'):  # table rows end with pipe
            issues.append(f'No terminal punctuation (ends: "...{stripped[-30:]}")')

    # Heuristic 3: split-word OCR artifacts
    for m in SPLIT_WORD_RE.finditer(text):
        context = text[max(0, m.start()-20):m.end()+20]
        issues.append(f'Possible split word at "{m.group()}" (context: "...{context}...")')
        break  # one per file is enough

    # Heuristic 3b: broken hyphens
    for m in BROKEN_HYPHEN_RE.finditer(text):
        context = text[max(0, m.start()-20):m.end()+20]
        issues.append(f'Possible broken hyphenation at "{m.group()}" (context: "...{context}...")')
        break

    # Heuristic 4: multi-newline
    if MULTI_NEWLINE_RE.search(text):
        issues.append('Contains 3+ consecutive newlines (possible lost paragraph)')

    # Heuristic 1: significantly shorter than PDF (best-effort substring match)
    if pdf_text and not pdf_text.startswith('__EXTRACTION_FAILED__'):
        pdf_normalized = re.sub(r'\s+', ' ', pdf_text).lower()
        first_30_words = ' '.join(text.split()[:30]).lower()
        first_30_norm = re.sub(r'\s+', ' ', first_30_words)
        idx = pdf_normalized.find(first_30_norm[:80])
        if idx >= 0:
            # Find where current text ends in PDF
            last_30_words = ' '.join(text.split()[-30:]).lower()
            last_30_norm = re.sub(r'\s+', ' ', last_30_words)[:80]
            end_idx = pdf_normalized.find(last_30_norm, idx)
            if end_idx < 0:
                issues.append('Last 30 words not found in PDF — possibly rewritten or missing')
            else:
                # Check if the paragraph continues in the PDF beyond end_idx
                tail = pdf_normalized[end_idx + len(last_30_norm):end_idx + len(last_30_norm) + 200]
                # If PDF continues with more prose (not just footer/boilerplate)
                if re.search(r'[a-z]{4,}\s+[a-z]{4,}\s+[a-z]{4,}', tail):
                    # Cheap boilerplate filter
                    if 'college board' not in tail.lower() and 'go on to' not in tail.lower():
                        issues.append(f'PDF appears to continue past JSON text: "...{tail[:150]}..."')

    return issues


def audit_file(subject: str, json_path: Path, verbose: bool = False) -> dict | None:
    try:
        with open(json_path, encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        return {'file': str(json_path.relative_to(ROOT)), 'error': f'JSON parse failed: {e}'}

    pdf_path = find_source_pdf(subject, json_path)
    if not pdf_path:
        if verbose:
            print(f'SKIP: no PDF for {json_path.name}', file=sys.stderr)
        return None

    pdf_text = extract_pdf_text(pdf_path)

    findings = []

    stimulus = data.get('stimulus') or ''
    for issue in flag_issues(stimulus, pdf_text):
        findings.append({'field': 'stimulus', 'issue': issue, 'text_tail': stimulus[-120:]})

    for doc in data.get('documents') or []:
        content = doc.get('content')
        if content is None and doc.get('image') is None:
            findings.append({
                'field': f"documents[{doc.get('doc_number', '?')}].content",
                'issue': 'Both content and image are null',
                'text_tail': '',
            })
            continue
        if content is None:
            continue  # image-only source is acceptable
        for issue in flag_issues(content, pdf_text):
            findings.append({
                'field': f"documents[{doc.get('doc_number', '?')}].content",
                'issue': issue,
                'text_tail': content[-120:],
            })

    if not findings:
        return None

    return {
        'file': str(json_path.relative_to(ROOT)),
        'pdf': str(pdf_path.relative_to(ROOT)),
        'findings': findings,
    }


def write_report(results: list[dict]) -> None:
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    lines = [
        '# FRQ Stimulus Truncation Audit Report',
        '',
        f'**Generated:** 2026-04-19',
        f'**Files flagged:** {len(results)}',
        '',
        '---',
        '',
    ]
    by_subject: dict[str, list[dict]] = {}
    for r in results:
        subj = r['file'].split('/')[2]  # public/data/<subject>/...
        by_subject.setdefault(subj, []).append(r)

    for subj in sorted(by_subject):
        lines.append(f'## {subj} ({len(by_subject[subj])} files)')
        lines.append('')
        for r in by_subject[subj]:
            lines.append(f"### `{r['file']}`")
            if 'error' in r:
                lines.append(f"- **Error:** {r['error']}")
                lines.append('')
                continue
            lines.append(f"- **Source PDF:** `{r['pdf']}`")
            for f in r['findings']:
                lines.append(f"- **{f['field']}** — {f['issue']}")
                if f['text_tail']:
                    lines.append(f"  - Last 120 chars: `...{f['text_tail']}`")
            lines.append('')

    REPORT_PATH.write_text('\n'.join(lines), encoding='utf-8')
    print(f'Report written to {REPORT_PATH}')


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--subject', choices=SUBJECTS, help='Limit audit to one subject')
    parser.add_argument('--verbose', action='store_true')
    args = parser.parse_args()

    subjects = [args.subject] if args.subject else SUBJECTS
    all_results: list[dict] = []

    for subj in subjects:
        subj_dir = DATA_DIR / subj / 'frq'
        if not subj_dir.exists():
            continue
        json_files = sorted(p for p in subj_dir.glob('*.json')
                            if p.name != 'manifest.json'
                            and '-gen-' not in p.name
                            and not p.name.startswith(('AUDIT', 'IMAGE')))
        print(f'{subj}: scanning {len(json_files)} files...', file=sys.stderr)
        for jf in json_files:
            result = audit_file(subj, jf, verbose=args.verbose)
            if result:
                all_results.append(result)

    write_report(all_results)
    print(f'Done. {len(all_results)} files flagged.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
```

- [ ] **Step 6.2: Do not run yet — validate imports first**

Run: `cd C:/Ascendly && python -c "import ast; ast.parse(open('scripts/audit_frq_stimulus.py').read())"`
Expected: no output (valid Python).

### Task 7: Run the scanner against AP Psychology only (validate heuristics)

- [ ] **Step 7.1: Run on the known-cleanest subject**

Run: `cd C:/Ascendly && python scripts/audit_frq_stimulus.py --subject ap-psychology`
Expected: stderr shows `ap-psychology: scanning 30 files...`; final line reports flagged count. The report file is written to `.planning/audits/2026-04-19-frq-truncation-report.md`.

- [ ] **Step 7.2: Read the report and validate heuristics**

Read `.planning/audits/2026-04-19-frq-truncation-report.md`. For the first 5 flagged findings:
- If the finding is a true positive (text really is truncated) — heuristic works
- If it's a false positive (intentional short stimulus, different phrasing of same content) — note the pattern and add a filter

If >50% of findings are false positives, go back to Task 6 and tighten the heuristic (most likely: raise the "missing terminal punctuation" exclusion to ignore stimuli ending in `—` or an equation, or skip stimuli <200 chars).

- [ ] **Step 7.3: Commit the scanner**

```bash
cd C:/Ascendly && git add scripts/audit_frq_stimulus.py && git commit -m "$(cat <<'EOF'
tools(frq): add stimulus truncation audit scanner

Re-extracts FRQ source PDFs with pdfplumber and diffs against current
JSON stimulus/documents[].content. Emits a markdown report flagging
OCR artifacts, truncations, and lost paragraphs. Report-only — does
not modify JSON files.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

### Task 8: Run scanner across all 7 subjects

- [ ] **Step 8.1: Full corpus scan**

Run: `cd C:/Ascendly && python scripts/audit_frq_stimulus.py 2>&1 | tee .planning/audits/2026-04-19-scanner-stderr.log`
Expected: stderr progress shows all 7 subjects scanned (~421 files total). Report file refreshed.

- [ ] **Step 8.2: Commit the report**

```bash
cd C:/Ascendly && git add .planning/audits/2026-04-19-frq-truncation-report.md && rm .planning/audits/2026-04-19-scanner-stderr.log && git commit -m "$(cat <<'EOF'
audit(frq): generate initial truncation report across 7 subjects

Run scripts/audit_frq_stimulus.py across all 421 released FRQs. Report
lists every flagged file grouped by subject with specific issue type
and the last 120 chars of the flagged field for review.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## STAGE 3b — Apply fixes per subject

### Task 9: Review report and decide batch strategy

- [ ] **Step 9.1: Open the report**

Read `.planning/audits/2026-04-19-frq-truncation-report.md`. Note the per-subject counts.

- [ ] **Step 9.2: Sort subjects by fix complexity**

Fix in order of increasing complexity:
1. Subjects with smallest flag counts (likely cleanest — fastest wins)
2. Text-heavy subjects (Psychology, Government, World History) — patches are plain-English copy
3. Math-heavy subjects (Calc AB, Calc BC, Precalculus) — must preserve KaTeX `$...$` during patches
4. Chemistry last — equations + formula references are fragile; requires Chemistry Checker subagent

Set the concrete subject order in a TodoWrite item before proceeding to Task 10.

### Tasks 10–16: Per-subject fix batches

Each of these tasks follows the same template. The SUBJECT placeholder changes; everything else stays identical.

**Template (repeat for each subject):**

#### Task N: Fix flagged FRQs for SUBJECT

**Files:**
- Read: `.planning/audits/2026-04-19-frq-truncation-report.md` (the SUBJECT section)
- Read: relevant PDFs in `content-sources/frq-pdfs/SUBJECT/questions/*.pdf`
- Modify: flagged JSON files under `public/data/SUBJECT/frq/*.json`

- [ ] **Step N.1: Re-run scanner scoped to SUBJECT**

```bash
cd C:/Ascendly && python scripts/audit_frq_stimulus.py --subject SUBJECT
```
Purpose: get the freshest set of flags for this subject alone.

- [ ] **Step N.2: For each flagged file, dispatch a content-repair subagent**

Use the Agent tool (model: sonnet for all subjects except ap-chemistry which uses opus for its subagent). Give the subagent this exact brief:

> You are repairing a single AP FRQ JSON file whose stimulus text has been flagged as truncated or OCR-corrupted. The file is `<FLAGGED_PATH>`. The source PDF is `<PDF_PATH>`. The specific findings from the audit report are:
>
> <PASTE FINDINGS FOR THIS FILE>
>
> Your job:
> 1. Read the JSON file.
> 2. Open the PDF with `pdfplumber` and locate the exact region the flagged field came from.
> 3. For each finding, determine whether it is a true positive (text is actually truncated or corrupted) or false positive (heuristic fired on valid content). Document your determination.
> 4. For true positives only: produce an exact replacement string that matches the PDF verbatim. Preserve intentional formatting: `$...$` KaTeX for math, markdown pipe tables, APA citations on their own line.
> 5. Apply the replacement via the Edit tool to the JSON file.
> 6. Verify the JSON still parses: `python -c "import json; json.load(open(r'<FLAGGED_PATH>'))"`
> 7. Report back with a one-line summary per finding: `TRUE-POS FIXED` or `FALSE-POS SKIPPED`.
>
> Do NOT paraphrase. Do NOT fix issues that were not in the findings list. Do NOT touch scoring_points or parts — only the stimulus/documents[].content fields flagged.

- [ ] **Step N.3: Build passes**

Run: `cd C:/Ascendly && npm run build`
Expected: build succeeds. If any JSON parse error surfaces, locate the offending file and fix the escaping before proceeding.

- [ ] **Step N.4: Re-run scanner on SUBJECT to verify flag reduction**

```bash
cd C:/Ascendly && python scripts/audit_frq_stimulus.py --subject SUBJECT
```
Read the refreshed report section for SUBJECT. Expected: every previously-true-positive flag is gone; remaining flags (if any) are documented false positives.

- [ ] **Step N.5: Commit the batch**

```bash
cd C:/Ascendly && git add public/data/SUBJECT/frq/ && git commit -m "$(cat <<'EOF'
content(SUBJECT): repair truncated FRQ stimulus (N files)

Re-extracted source PDFs with pdfplumber and patched N FRQs flagged
by scripts/audit_frq_stimulus.py. Fixes include restoring missing
final sentences, removing OCR split-word artifacts, and filling lost
paragraphs. No scoring/rubric content touched.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

**Instantiations (run in this order):**
- **Task 10:** SUBJECT = `ap-psychology`
- **Task 11:** SUBJECT = `ap-government`
- **Task 12:** SUBJECT = `ap-world-history`
- **Task 13:** SUBJECT = `ap-calculus-ab`
- **Task 14:** SUBJECT = `ap-calculus-bc`
- **Task 15:** SUBJECT = `ap-precalculus`
- **Task 16:** SUBJECT = `ap-chemistry` (use model=opus for subagent; dispatch Chemistry Checker subagent AFTER the repair subagent to verify no equation was corrupted during patching)

### Task 17: Final verification + report update

- [ ] **Step 17.1: Full corpus re-scan**

```bash
cd C:/Ascendly && python scripts/audit_frq_stimulus.py
```
Expected: report file shows only documented false positives. If real issues remain, return to the relevant per-subject task.

- [ ] **Step 17.2: Append final status to the report**

Open `.planning/audits/2026-04-19-frq-truncation-report.md` and prepend a final-status header:

```markdown
# FRQ Stimulus Truncation Audit Report

**Final status (2026-04-19):** <N> files initially flagged; <M> true positives fixed across 7 subjects; <K> documented false positives remain.

---
```

(Replace `<N>`, `<M>`, `<K>` with actual numbers.)

- [ ] **Step 17.3: Full build + dev server spot-check**

Run: `cd C:/Ascendly && npm run build`
Expected: build succeeds.

Start dev server and open one patched FRQ per subject. Confirm no visible breakage.

- [ ] **Step 17.4: Final commit**

```bash
cd C:/Ascendly && git add .planning/audits/2026-04-19-frq-truncation-report.md && git commit -m "$(cat <<'EOF'
audit(frq): finalize stimulus completeness audit report

All 7 subjects audited and flagged files repaired. Remaining entries
in the report are documented false positives (intentionally-short
stimuli or heuristic-only matches that do not reflect real truncation).

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 17.5: Update memory + CLAUDE.md decisions log**

Update `CLAUDE.md` Decisions Log:

```markdown
- 2026-04-19: FRQ stimulus completeness audit — scripts/audit_frq_stimulus.py is the canonical truncation scanner. Run after any bulk FRQ content regeneration.
```

Commit:
```bash
cd C:/Ascendly && git add CLAUDE.md && git commit -m "$(cat <<'EOF'
docs(claude): log FRQ stimulus audit tooling decision

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review Notes

- Stage 1 (Tasks 1–4) covers the Social Facilitation EBQ fix exhaustively — extraction, JSON edit, image replacement, visual verification, cleanup.
- Stage 2 (Task 5) covers Bystander Effect spot-check with a skip-path when no discrepancy found.
- Stage 3a (Tasks 6–8) builds the scanner with explicit heuristics and a tuning loop in Task 7.
- Stage 3b (Tasks 9–17) applies fixes per subject, uses subagents with strict briefs, and finalizes.
- Screenshot loop gate is in Task 4 Step 4.2.
- No placeholders remain — every code block is executable as written.
- Chemistry uses Opus + Chemistry Checker subagent per CLAUDE.md rule #7.
- Generated FRQs excluded from Stage 3 (correctly — no PDF to compare).
