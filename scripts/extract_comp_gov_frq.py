#!/usr/bin/env python3
"""
AP Comparative Government FRQ Extractor Stub

No PDFs collected yet — script ready to run when content-sources/frq-pdfs/ap-comparative-government/
is populated with College Board released exam PDFs.

Usage:
  1. Drop question PDFs into:
       content-sources/frq-pdfs/ap-comparative-government/questions/
  2. Drop scoring guideline PDFs into:
       content-sources/frq-pdfs/ap-comparative-government/scoring-guidelines/
  3. Run: python scripts/extract_comp_gov_frq.py

Output:
  - public/data/ap-comparative-government/frq/<id>.json  (one file per FRQ)
  - public/data/ap-comparative-government/frq/manifest.json (updated)

FRQ type mapping (AP Comp Gov exam structure):
  FRQ-1 → conceptual_analysis   (Concept Application)
  FRQ-2 → quantitative_analysis (Quantitative Analysis — typically involves data)
  FRQ-3 → comparative_analysis  (Comparative Government — compare two course countries)
  FRQ-4 → argument_essay        (Argument Essay)

ID prefix: comp-gov-
Subject slug: ap-comparative-government
"""

import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

QUESTIONS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    'content-sources', 'frq-pdfs', 'ap-comparative-government', 'questions'
)
SCORING_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    'content-sources', 'frq-pdfs', 'ap-comparative-government', 'scoring-guidelines'
)
FRQ_OUT_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    'public', 'data', 'ap-comparative-government', 'frq'
)
MANIFEST_PATH = os.path.join(FRQ_OUT_DIR, 'manifest.json')

SUBJECT_SLUG = 'ap-comparative-government'
ID_PREFIX = 'comp-gov-'

# FRQ position → frq_type mapping (1-indexed position within exam)
FRQ_TYPE_MAP = {
    1: 'conceptual_analysis',
    2: 'quantitative_analysis',
    3: 'comparative_analysis',
    4: 'argument_essay',
}


def get_pdf_files(directory: str) -> list[str]:
    """Return sorted list of PDF filenames in a directory."""
    if not os.path.isdir(directory):
        return []
    return sorted(
        f for f in os.listdir(directory)
        if f.lower().endswith('.pdf')
    )


def make_frq_id(year: int, frq_number: int) -> str:
    """Generate FRQ ID, e.g. comp-gov-2024-frq-1."""
    return f'{ID_PREFIX}{year}-frq-{frq_number}'


def extract_year_from_filename(filename: str) -> int | None:
    """
    Attempt to extract a 4-digit year from a filename.
    E.g. 'comp-gov-2024-questions.pdf' → 2024
    Returns None if no year found.
    """
    import re
    match = re.search(r'(20\d{2})', filename)
    return int(match.group(1)) if match else None


def build_stub_frq(frq_id: str, year: int, frq_number: int,
                   question_pdf: str, scoring_pdf: str) -> dict:
    """
    Build a stub FRQ JSON object.
    Rubric criteria and parts must be filled in manually after extraction.
    """
    frq_type = FRQ_TYPE_MAP.get(frq_number, 'multi_part_text')
    return {
        'id': frq_id,
        'subject': SUBJECT_SLUG,
        'year': year,
        'source': 'released',
        'title': f'AP Comp Gov {year} FRQ {frq_number}',
        'frq_type': frq_type,
        'related_units': [],  # TODO: fill after extraction
        'total_points': 0,    # TODO: fill after extraction
        'calculator_allowed': False,
        'stimulus': None,
        'stimulus_image': None,
        'source_pdf': f'/pdfs/frq/ap-comparative-government/{question_pdf}',
        'source_scoring_guideline_pdf': f'/pdfs/frq/ap-comparative-government/{scoring_pdf}',
        'set': None,
        'parts': []  # TODO: fill after extraction
    }


def update_manifest(frq_ids: list[str]) -> None:
    """Merge new FRQ IDs into the manifest (preserving existing, no duplicates)."""
    existing: list[str] = []
    if os.path.exists(MANIFEST_PATH):
        with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
            existing = json.load(f)

    merged = existing + [i for i in frq_ids if i not in existing]
    merged.sort()

    with open(MANIFEST_PATH, 'w', encoding='utf-8') as f:
        json.dump(merged, f, indent=2, ensure_ascii=False)
    print(f'  Manifest updated: {len(merged)} FRQ(s) total.')


def main() -> None:
    question_pdfs = get_pdf_files(QUESTIONS_DIR)
    scoring_pdfs = get_pdf_files(SCORING_DIR)

    if not question_pdfs:
        print(
            f'No FRQ PDFs found in {QUESTIONS_DIR} — nothing to extract.\n'
            'Drop College Board question PDFs there and re-run this script.'
        )
        sys.exit(0)

    print(f'Found {len(question_pdfs)} question PDF(s) in {QUESTIONS_DIR}')
    print(f'Found {len(scoring_pdfs)} scoring PDF(s) in {SCORING_DIR}')

    os.makedirs(FRQ_OUT_DIR, exist_ok=True)
    new_ids: list[str] = []

    for q_pdf in question_pdfs:
        year = extract_year_from_filename(q_pdf)
        if year is None:
            print(f'  WARN: Could not extract year from "{q_pdf}" — skipping.')
            continue

        # Find matching scoring guideline (best-effort by year)
        sg_pdf = next(
            (s for s in scoring_pdfs if str(year) in s),
            q_pdf.replace('questions', 'scoring-guidelines')
        )

        for frq_number in range(1, 5):  # FRQ 1–4
            frq_id = make_frq_id(year, frq_number)
            out_path = os.path.join(FRQ_OUT_DIR, f'{frq_id}.json')

            if os.path.exists(out_path):
                print(f'  SKIP (exists): {frq_id}.json')
                new_ids.append(frq_id)
                continue

            stub = build_stub_frq(frq_id, year, frq_number, q_pdf, sg_pdf)
            with open(out_path, 'w', encoding='utf-8') as f:
                json.dump(stub, f, indent=2, ensure_ascii=False)
            print(f'  Created stub: {frq_id}.json  (type: {stub["frq_type"]})')
            new_ids.append(frq_id)

    if new_ids:
        update_manifest(new_ids)
        print(f'\nDone! Generated {len(new_ids)} stub FRQ file(s).')
        print('Next step: open each stub JSON and fill in `parts`, `rubric_criteria`, and `total_points`.')
    else:
        print('\nNothing to do — all PDFs already processed.')


if __name__ == '__main__':
    main()
