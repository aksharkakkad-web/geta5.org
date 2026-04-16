#!/usr/bin/env python3
"""
Enrich AP Chemistry FRQ scoring_points with real content from College Board scoring guideline PDFs.

Targets scoring_points that have empty correct_example fields and populates them
with the actual answers/criteria extracted from the PDFs.

Rules:
- Parts with requires_drawing: true are NEVER touched
- Only enriches scoring_points that already exist (doesn't create new ones)
- Populates correct_example if currently empty
- Preserves all existing fields
"""

import sys
import os
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

import PyPDF2

PDF_DIR = "C:/Ascendly/content-sources/frq-pdfs/ap-chemistry/scoring-guidelines"
FRQ_DIR = "C:/Ascendly/public/data/ap-chemistry/frq"

YEARS = [2014, 2015, 2016, 2017, 2018, 2019, 2021, 2022, 2023, 2024, 2025]


def read_pdf_text(year):
    """Read all pages from PDF and return as single text."""
    fname = f"{year} chem sg.pdf"
    path = os.path.join(PDF_DIR, fname)
    if not os.path.exists(path):
        return None
    pages = []
    with open(path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            text = page.extract_text()
            if text:
                pages.append(text)
    return "\n\n".join(pages)


def split_into_questions(full_text):
    """
    Split the full PDF text into per-question sections.
    Returns dict: {question_num: text}
    """
    # Match "Question N:" or "Question N\n" or "Question N " patterns
    # Also handle "Total for question N" as terminators
    q_pattern = re.compile(
        r'Question\s+(\d+)\s*(?::|:?\s*(?:Long|Short)\s+Answer)?',
        re.IGNORECASE
    )

    # Find all question starts
    matches = list(q_pattern.finditer(full_text))
    if not matches:
        return {}

    sections = {}
    for i, m in enumerate(matches):
        q_num = int(m.group(1))
        start = m.start()
        # End is start of next question (or end of text)
        if i + 1 < len(matches):
            end = matches[i + 1].start()
        else:
            end = len(full_text)

        # Only keep first occurrence of each question number
        if q_num not in sections:
            sections[q_num] = full_text[start:end]

    return sections


def normalize_roman(s):
    """Convert roman numeral string to sort key."""
    roman_map = {'i': 1, 'ii': 2, 'iii': 3, 'iv': 4, 'v': 5, 'vi': 6, 'vii': 7, 'viii': 8}
    return roman_map.get(s.lower(), 0)


def parse_part_sections(q_text):
    """
    Parse question text into per-part sections.
    Returns dict: {
        'a': {'main': text, 'sub': {'i': text, 'ii': text, ...}},
        'b': {'main': text, 'sub': {}},
        ...
    }
    """
    result = {}

    # Find all part markers: (a), (b), etc.
    main_part_re = re.compile(r'\(\s*([a-z])\s*\)(?!\s*\()', re.IGNORECASE)
    main_matches = list(main_part_re.finditer(q_text))

    if not main_matches:
        return result

    for i, mm in enumerate(main_matches):
        letter = mm.group(1).lower()
        start = mm.start()
        end = main_matches[i + 1].start() if i + 1 < len(main_matches) else len(q_text)

        part_text = q_text[start:end]

        # Find sub-parts within this part
        sub_re = re.compile(r'\(\s*(i{1,3}v?|iv|vi{0,3}|ix|x)\s*\)', re.IGNORECASE)
        sub_matches = list(sub_re.finditer(part_text))

        subs = {}
        if sub_matches:
            for j, sm in enumerate(sub_matches):
                sub_label = sm.group(1).lower()
                sub_start = sm.start()
                sub_end = sub_matches[j + 1].start() if j + 1 < len(sub_matches) else len(part_text)
                subs[sub_label] = part_text[sub_start:sub_end]

        # Deduplicate: only keep first occurrence of each letter
        if letter not in result:
            result[letter] = {
                'main': part_text,
                'sub': subs
            }

    return result


def extract_answer_from_section(section_text):
    """
    Extract the answer/example text from a scoring section.
    The pattern is:
    - "For the correct X:" → criterion line
    - Following text → the actual answer
    - "1 point" → terminator

    Returns (description, correct_example, alternatives_list)
    """
    # Split by "N point" lines to get content blocks
    # Each block is: [criterion line] + [answer content] + "1 point"

    # Find scoring criterion markers
    # Patterns: "1 point is earned for X", "For the correct X:", "For a correct X:", "For a valid X:"

    description = ""
    correct_example = ""
    alternatives = []

    text = section_text

    # Check for "Accept one of the following" pattern (multi-alternative)
    if re.search(r'Accept one of the following', text, re.IGNORECASE):
        # Extract bullet alternatives
        bullets = []
        # Look for • bullets
        bullet_matches = list(re.finditer(r'[•●]\s*(.+?)(?=[•●]|\d+\s*point|$)', text, re.DOTALL))
        for bm in bullet_matches:
            content = clean_line(bm.group(1))
            if content and len(content) > 5:
                bullets.append(content[:400])

        # Also try OR-separated alternatives
        if not bullets:
            or_parts = re.split(r'\bOR\b', text, flags=re.IGNORECASE)
            for part in or_parts:
                content = clean_line(part)
                if content and len(content) > 10:
                    bullets.append(content[:400])

        if bullets:
            alternatives = bullets
            correct_example = bullets[0]

    # Extract the scoring criterion description
    # Pattern 1: "For the correct/valid/balanced X"
    for_m = re.search(
        r'For\s+(?:the\s+|a\s+|an\s+)?(?:correct|valid|balanced|complete|appropriate)\s+([^:1\n]+?)(?::|1\s+point|\n)',
        text, re.IGNORECASE
    )
    if for_m:
        desc_content = clean_line(for_m.group(0))
        # Remove trailing ": 1 point" type endings
        desc_content = re.sub(r'\s*[:\s]+\d+\s*point[s]?\s*$', '', desc_content, flags=re.IGNORECASE).strip()
        description = desc_content[:300]

    # Pattern 2: "1 point is earned for X"
    if not description:
        earned_m = re.search(r'1 point is earned for ([^\.]+)', text, re.IGNORECASE)
        if earned_m:
            description = clean_line(earned_m.group(0))[:300]

    # Extract answer example: text between criterion line and "1 point" marker
    # or text that looks like a chemical answer
    if not correct_example:
        # Remove criterion lines and point markers, what remains is the answer
        answer_text = text

        # Remove "For the correct/valid..." lines
        answer_text = re.sub(
            r'For\s+(?:the\s+|a\s+|an\s+)?(?:correct|valid|balanced|complete|appropriate)[^\n]*',
            '', answer_text, flags=re.IGNORECASE
        )
        # Remove "1 point is earned for..." lines
        answer_text = re.sub(r'1 point is earned for[^\n]*', '', answer_text, flags=re.IGNORECASE)
        # Remove "N point" standalone markers
        answer_text = re.sub(r'\b\d+\s+point[s]?\s*$', '', answer_text, flags=re.IGNORECASE | re.MULTILINE)
        # Remove "Total for part" lines
        answer_text = re.sub(r'Total for part[^\n]*', '', answer_text, flags=re.IGNORECASE)
        # Remove header lines
        answer_text = re.sub(r'AP® Chemistry.*?Scoring Guidelines.*?\n', '', answer_text, flags=re.IGNORECASE)
        answer_text = re.sub(r'© \d{4} College Board', '', answer_text, flags=re.IGNORECASE)
        # Remove "Accept one of the following" lines
        answer_text = re.sub(r'Accept one of the following.*?\n', '', answer_text, flags=re.IGNORECASE)

        # Clean and extract meaningful content
        lines = [clean_line(l) for l in answer_text.split('\n')]
        content_lines = [l for l in lines if l and len(l) > 5 and not re.match(r'^\(\s*[a-z]\s*\)$', l)]

        if content_lines:
            correct_example = ' '.join(content_lines[:4])[:500]

    return description, correct_example, alternatives


def clean_line(text):
    """Clean up a text line."""
    if not text:
        return ""
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    # Remove leading/trailing punctuation artifacts
    text = text.strip('.,;:')
    return text


def build_point_id_info(point_id):
    """
    Parse a point_id like 'a1', 'ai1', 'aii1', 'b1', 'di1', 'eiii1'
    into (part_letter, sub_roman, point_num)
    """
    m = re.match(r'^([a-z])((?:i{1,3}v?|iv|vi{0,3}|ix|x)?)(\d+)$', point_id, re.IGNORECASE)
    if m:
        return m.group(1).lower(), m.group(2).lower() or None, int(m.group(3))
    # Fallback
    m2 = re.match(r'^([a-z])(\d+)$', point_id, re.IGNORECASE)
    if m2:
        return m2.group(1).lower(), None, int(m2.group(2))
    return point_id[0].lower() if point_id else 'a', None, 1


def get_scoring_section_for_point(part_sections, part_letter, sub_roman, point_num):
    """
    Get the relevant text section for a given scoring_point.
    """
    part_data = part_sections.get(part_letter)
    if not part_data:
        return None

    if sub_roman and part_data['sub']:
        # Try exact sub-part match
        sub_text = part_data['sub'].get(sub_roman)
        if sub_text:
            return sub_text
        # Try all sub-parts if sub not found
        # Could be point 2 within a sub-part
        if part_data['sub']:
            subs = sorted(part_data['sub'].keys(), key=normalize_roman)
            if subs:
                # Return the sub-part that could contain this point
                idx = min(normalize_roman(sub_roman) - 1, len(subs) - 1)
                if idx >= 0:
                    return part_data['sub'].get(subs[idx])

    # No sub-parts or sub not found - use main part text
    # But if we have sub-parts and no sub match, split main text by "1 point" occurrences
    main_text = part_data['main']

    if not sub_roman:
        # Split by scoring criteria if there are multiple points in this part
        # Find all "For the correct..." or "1 point" markers
        criteria_starts = list(re.finditer(
            r'(?:For\s+(?:the|a|an)\s+(?:correct|valid|balanced|complete)|1 point is earned for)',
            main_text, re.IGNORECASE
        ))

        if len(criteria_starts) > 1 and point_num <= len(criteria_starts):
            # Multiple criteria in this section - get the right one
            idx = point_num - 1
            start = criteria_starts[idx].start()
            end = criteria_starts[idx + 1].start() if idx + 1 < len(criteria_starts) else len(main_text)
            return main_text[start:end]

    return main_text


def process_frq_file(json_path, year, q_num, part_sections):
    """
    Enrich a single FRQ JSON file with PDF-extracted scoring content.
    Returns True if modified.
    """
    with open(json_path, encoding='utf-8') as f:
        data = json.load(f)

    modified = False

    for part in data.get('parts', []):
        # RULE: Never touch drawing parts
        if part.get('requires_drawing', False):
            continue

        # Only process parts with scoring_points
        sps = part.get('scoring_points', [])
        if not sps:
            continue

        part_letter = part.get('letter', '').lower()

        for sp in sps:
            # Check if correct_example is empty
            alts = sp.get('alternatives', [])
            if not alts:
                continue

            # Check if all alternatives have empty correct_example
            needs_enrichment = any(not alt.get('correct_example', '') for alt in alts)
            if not needs_enrichment:
                continue

            point_id = sp.get('point_id', '')
            _, sub_roman, point_num = build_point_id_info(point_id)

            # Get relevant PDF section
            section_text = get_scoring_section_for_point(
                part_sections, part_letter, sub_roman, point_num
            )

            if not section_text:
                continue

            # Extract answer content from section
            description, correct_example, alternatives_list = extract_answer_from_section(section_text)

            # Enrich each alternative that has empty correct_example
            for i, alt in enumerate(alts):
                if not alt.get('correct_example', ''):
                    if alternatives_list and i < len(alternatives_list):
                        alt['correct_example'] = alternatives_list[i]
                        modified = True
                    elif correct_example:
                        alt['correct_example'] = correct_example
                        modified = True

            # Also update description if it's placeholder
            current_desc = sp.get('description', '')
            is_placeholder = (
                not current_desc or
                current_desc in [
                    'Provide a correct response',
                    'Correct and complete response',
                ] or
                (current_desc.startswith('Correctly identify') and len(current_desc) < 60) or
                (current_desc.startswith('Provide a correct') and len(current_desc) < 60) or
                (current_desc.startswith('Calculate the correct') and len(current_desc) < 60) or
                (current_desc.startswith('State the correct') and len(current_desc) < 60)
            )

            if is_placeholder and description:
                sp['description'] = description
                modified = True

    if modified:
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    return modified


def process_year(year):
    """Process all FRQ files for a given year."""
    print(f"\n--- {year} ---")

    pdf_text = read_pdf_text(year)
    if not pdf_text:
        print(f"  No PDF, skipping")
        return 0

    q_sections = split_into_questions(pdf_text)
    print(f"  Found question sections: {sorted(q_sections.keys())}")

    modified_count = 0

    for q_num in range(1, 8):
        json_fname = f"chem-{year}-frq-{q_num}.json"
        json_path = os.path.join(FRQ_DIR, json_fname)

        if not os.path.exists(json_path):
            continue

        q_text = q_sections.get(q_num, "")
        if not q_text:
            print(f"  {json_fname}: no PDF section found")
            continue

        # Parse per-part sections from question text
        part_sections = parse_part_sections(q_text)

        modified = process_frq_file(json_path, year, q_num, part_sections)

        if modified:
            print(f"  ENRICHED: {json_fname}")
            modified_count += 1
        else:
            print(f"  unchanged: {json_fname}")

    return modified_count


def verification_report():
    """Print a summary of enrichment status."""
    total = 0
    populated = 0
    empty = 0

    for fname in sorted(os.listdir(FRQ_DIR)):
        if not fname.endswith('.json') or fname == 'manifest.json':
            continue
        with open(os.path.join(FRQ_DIR, fname), encoding='utf-8') as f:
            data = json.load(f)
        for part in data.get('parts', []):
            if part.get('requires_drawing', False):
                continue
            for sp in part.get('scoring_points', []):
                total += 1
                alts = sp.get('alternatives', [])
                if alts and alts[0].get('correct_example', ''):
                    populated += 1
                else:
                    empty += 1

    print(f"\nVERIFICATION:")
    print(f"  Total scoring_points (non-drawing): {total}")
    print(f"  With correct_example populated: {populated} ({populated/total*100:.1f}% if total else 0)")
    print(f"  Still empty: {empty}")


def main():
    print("AP Chemistry FRQ Scoring Points Enrichment")
    print("Populating empty correct_example fields from College Board PDFs")
    print("=" * 65)

    total_modified = 0

    for year in YEARS:
        count = process_year(year)
        total_modified += count

    print(f"\n{'=' * 65}")
    print(f"Files enriched: {total_modified}")

    verification_report()


if __name__ == "__main__":
    main()
