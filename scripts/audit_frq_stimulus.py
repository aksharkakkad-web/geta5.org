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

# Only flag split-word OCR artifacts when the leading capital is NOT "A" or "I"
# (both are valid standalone English words — "A total of 127", "Group A was told",
# "Would I be helped" — which produced false positives in initial tuning run).
SPLIT_WORD_RE = re.compile(r'\b(?!A |I )[B-HJ-Z] [a-z]{2,}\b')

# Preceded-by markers that indicate the single uppercase letter is a label
# (Group B, Store A, Source 1, Condition C, Part D) rather than a split word.
LABEL_PRECEDING_RE = re.compile(
    r'\b(group|store|source|condition|part|section|chapter|table|figure|phase|stage|set|type)\s+$',
    re.IGNORECASE,
)
BROKEN_HYPHEN_RE = re.compile(r'\b[a-z]+- [a-z]+\b')
MULTI_NEWLINE_RE = re.compile(r'\n{3,}')
TERMINAL_PUNCT = set('.!?"\')]|') | {'.”', '."'}

# Terms that signal the PDF continuation is the FRQ prompt parts (stored in
# parts[]) rather than missing stimulus text. Used to suppress the "PDF
# appears to continue past JSON text" heuristic.
PROMPT_PART_MARKERS = (
    'part a', 'part b', 'part c', 'part d', 'part e', 'part f',
    '• explain', '• state', '• identify', '• describe', '• propose',
    'explain how', 'state the', 'identify the', 'describe the',
    'directions', 'using the source', 'using the sources',
    'your response should', 'for part b', 'for part c',
    # Footnotes in EBQ source citations ("1: language referencing...") —
    # these are APA note annotations, not missing stimulus content.
    '1: language', '2: language', '1: p value', '2: p value',
    '1: racial', '2: racial',
)


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

    # Heuristic 2: missing terminal punctuation (only check non-trivial stimuli)
    stripped = text.rstrip()
    if len(stripped) >= 200 and stripped and stripped[-1] not in TERMINAL_PUNCT:
        if not stripped.endswith('|'):  # table rows end with pipe
            issues.append(f'No terminal punctuation (ends: "...{stripped[-30:]}")')

    # Heuristic 3: split-word OCR artifacts
    for m in SPLIT_WORD_RE.finditer(text):
        # Skip if the uppercase letter is preceded by a label word like
        # "Group B was" / "Store A had" / "Source 1..."
        preceding = text[max(0, m.start()-20):m.start()]
        if LABEL_PRECEDING_RE.search(preceding):
            continue
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
            # Suppress when the tail is a markdown table — PDF tables are
            # structurally different and will not substring-match.
            text_stripped = text.rstrip()
            tail_is_table = text_stripped.endswith('|') or '| ---' in text_stripped[-200:] or '|---' in text_stripped[-200:]
            if end_idx < 0 and not tail_is_table:
                issues.append('Last 30 words not found in PDF — possibly rewritten or missing')
            if end_idx < 0:
                # Skip the continuation check since we can't anchor
                end_idx = -1
            else:
                # Check if the paragraph continues in the PDF beyond end_idx
                tail = pdf_normalized[end_idx + len(last_30_norm):end_idx + len(last_30_norm) + 200]
                # If PDF continues with more prose (not just footer/boilerplate)
                if re.search(r'[a-z]{4,}\s+[a-z]{4,}\s+[a-z]{4,}', tail):
                    tail_lower = tail.lower()
                    # Cheap boilerplate filter + prompt-part detection
                    if ('college board' not in tail_lower
                            and 'go on to' not in tail_lower
                            and not any(marker in tail_lower for marker in PROMPT_PART_MARKERS)):
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
        # Normalize Windows backslashes to forward slashes before splitting
        normalized = r['file'].replace('\\', '/')
        parts = normalized.split('/')
        subj = parts[2] if len(parts) >= 3 else 'unknown'  # public/data/<subject>/...
        by_subject.setdefault(subj, []).append(r)

    for subj in sorted(by_subject):
        lines.append(f'## {subj} ({len(by_subject[subj])} files)')
        lines.append('')
        for r in by_subject[subj]:
            file_display = r['file'].replace('\\', '/')
            lines.append(f"### `{file_display}`")
            if 'error' in r:
                lines.append(f"- **Error:** {r['error']}")
                lines.append('')
                continue
            pdf_display = r['pdf'].replace('\\', '/')
            lines.append(f"- **Source PDF:** `{pdf_display}`")
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
