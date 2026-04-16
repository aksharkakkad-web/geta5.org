#!/usr/bin/env python3
"""
Final targeted enrichment pass for AP Chemistry FRQ scoring_points.

Handles:
1. 2025 files: description contains answer — split into clean description + correct_example
2. 2014-2016: Page-based PDF extraction (no "Question N" headers)
3. All years: Second-pass for remaining empty correct_example fields
4. Multi-criteria parts: better matching of point_id to PDF criteria blocks

Rules:
- Never touch requires_drawing: true parts
- Never modify rubric_criteria fields
- Preserve all existing non-empty correct_example values
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


# ================================================================
# PDF TEXT EXTRACTION
# ================================================================

def read_pdf_pages(year):
    """Return list of page text strings."""
    fname = f"{year} chem sg.pdf"
    path = os.path.join(PDF_DIR, fname)
    if not os.path.exists(path):
        return None
    pages = []
    with open(path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            text = page.extract_text()
            pages.append(text or "")
    return pages


# Page mappings for years without "Question N:" headers
# Format: {question_num: [0-based page indices]}
PAGE_MAPS = {
    2014: {
        1: [1, 2, 3],      # KI tablet
        2: [4, 5, 6],      # propanoic acid
        3: [7, 8, 9],      # galvanic cell / Sn+Cu
        4: [10, 11, 12],   # CaCO3 decomposition
        5: [13, 14],       # ClF3 / fluorides
        6: [15, 16],       # PP/PVC polymers
        7: [17],           # cis-2-butene kinetics
    },
    2016: {
        1: [1, 2],         # LiCl/NaCl enthalpy of solution
        2: [3, 4],         # NaHCO3/acetic acid
        3: [5, 6, 7],      # unknown metal M + iodine
        4: [8],            # Phenol Ka
        5: [9, 10],        # C4H6 kinetics (1,3-butadiene)
        6: [11],           # Ba2+ EDTA
        7: [12],           # unknown monoprotic acid
    },
}


def get_question_text(year, q_num, pdf_pages):
    """Get text for a specific question from PDF pages."""
    if year in PAGE_MAPS:
        page_indices = PAGE_MAPS[year].get(q_num)
        if not page_indices:
            return ""
        return "\n\n".join(pdf_pages[i] for i in page_indices if i < len(pdf_pages))

    # Standard format: look for "Question N" header
    full_text = "\n\n".join(pdf_pages)
    q_pattern = re.compile(
        r'Question\s+' + str(q_num) + r'\s*(?::|:?\s*(?:Long|Short)\s+Answer)?',
        re.IGNORECASE
    )
    next_q_pattern = re.compile(
        r'Question\s+' + str(q_num + 1) + r'\s*(?::|:?\s*(?:Long|Short)\s+Answer)?',
        re.IGNORECASE
    )
    m_start = q_pattern.search(full_text)
    if not m_start:
        return ""
    m_end = next_q_pattern.search(full_text, m_start.end())
    if m_end:
        return full_text[m_start.start():m_end.start()]
    return full_text[m_start.start():]


# ================================================================
# PARSE SCORING CRITERIA FROM QUESTION TEXT
# ================================================================

def parse_scoring_blocks(q_text):
    """
    Parse a question text into scoring criterion blocks per part/subpart.
    Returns dict: {key: [(description, answer)]}
    where key = 'a', 'b', 'ai', 'aii', etc.
    """
    result = {}

    # Normalize whitespace
    text = re.sub(r' +', ' ', q_text)

    # Split into lines
    lines = text.split('\n')

    current_key = None
    current_content = []

    # Patterns for part markers
    main_re = re.compile(r'^\s*\(\s*([a-z])\s*\)\s*(.*)', re.IGNORECASE)
    sub_re = re.compile(r'^\s*\(\s*(i{1,3}v?|iv|vi{0,3}|ix|x)\s*\)\s*(.*)', re.IGNORECASE)

    # Also handle 2025 format: "A (i)", "B", "C (i)" etc.
    cap_re = re.compile(r'^\s*([A-Z])\s*(?:\(\s*(i{1,3}v?|iv|vi{0,3}|ix|x)\s*\))?\s*For\s+', re.IGNORECASE)

    current_main = None
    current_sub = None

    for line in lines:
        # Check for main part
        mm = main_re.match(line)
        if mm:
            if current_key:
                result.setdefault(current_key, [])
                result[current_key].append('\n'.join(current_content))
            current_main = mm.group(1).lower()
            current_sub = None
            current_key = current_main
            rest = mm.group(2).strip()
            current_content = [rest] if rest else []
            continue

        # Check for sub-part
        if current_main:
            sm = sub_re.match(line)
            if sm:
                if current_key:
                    result.setdefault(current_key, [])
                    result[current_key].append('\n'.join(current_content))
                current_sub = sm.group(1).lower()
                current_key = f"{current_main}{current_sub}"
                rest = sm.group(2).strip()
                current_content = [rest] if rest else []
                continue

        if current_key:
            current_content.append(line)

    if current_key and current_content:
        result.setdefault(current_key, [])
        result[current_key].append('\n'.join(current_content))

    return result


def extract_criteria_from_block(text_block):
    """
    From a text block for a part, extract individual scoring criteria.
    Returns list of (criterion_description, answer_example) tuples.
    """
    criteria = []

    # Pattern 1 (older format): "content... 1 point is earned for criterion."
    # The content before the "1 point is earned" is the answer, the rest is the criterion

    # Find all "1 point is earned for..." positions
    earned_re = re.compile(r'1 point is earned for ([^\n]+(?:\n(?!\d+ point)[^\n]*)*)', re.IGNORECASE)
    for_re = re.compile(r'For\s+(?:the\s+|a\s+|an\s+)?(?:correct|valid|balanced|complete|appropriate|a correct)\s+([^:\n]+)', re.IGNORECASE)

    earned_matches = list(earned_re.finditer(text_block))
    for_matches = list(for_re.finditer(text_block))

    if earned_matches:
        # Split content by "1 point is earned" positions
        prev_end = 0
        for i, m in enumerate(earned_matches):
            # Content before this criterion is the answer
            answer_text = text_block[prev_end:m.start()].strip()
            criterion = clean_criterion(m.group(1))

            # Clean up the answer
            answer = clean_answer(answer_text)

            if criterion or answer:
                criteria.append((criterion, answer))

            prev_end = m.end()

    elif for_matches:
        # Newer format: "For the correct X:" followed by the answer
        for i, m in enumerate(for_matches):
            criterion = clean_criterion(m.group(0))

            # Find end of this section (start of next "For..." or end)
            if i + 1 < len(for_matches):
                section_end = for_matches[i + 1].start()
            else:
                section_end = len(text_block)

            section = text_block[m.end():section_end].strip()
            answer = clean_answer(section)

            criteria.append((criterion, answer))

    else:
        # Fallback: treat everything as one block
        all_text = clean_answer(text_block)
        if all_text:
            criteria.append(("Provide a correct response", all_text))

    return criteria


def clean_criterion(text):
    """Clean a scoring criterion description."""
    text = re.sub(r'\s+', ' ', text).strip()
    # Remove trailing "N point" markers
    text = re.sub(r'\s*\d+\s*point[s]?\s*$', '', text, flags=re.IGNORECASE).strip()
    text = text.rstrip('.,;: ')
    if len(text) > 300:
        text = text[:297] + '...'
    return text


def clean_answer(text):
    """Clean an answer example text."""
    if not text:
        return ''
    # Remove headers/footers
    text = re.sub(r'AP® Chemistry.*?Scoring Guidelines\s*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'© \d{4}.*?College Board.*?\n', '', text, flags=re.IGNORECASE)
    text = re.sub(r'Visit the College Board.*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'Question \d+.*?\n', '', text, flags=re.IGNORECASE)
    # Remove "1 point is earned for..." lines
    text = re.sub(r'1 point is earned for[^\n]*\n?', '', text, flags=re.IGNORECASE)
    # Remove "For the correct..." lines
    text = re.sub(r'For\s+(?:the\s+|a\s+|an\s+)?(?:correct|valid|balanced|complete)[^\n]*\n?', '',
                  text, flags=re.IGNORECASE)
    # Remove "Accept one of the following" markers
    text = re.sub(r'Accept one of the following[^\n]*\n?', '', text, flags=re.IGNORECASE)
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    text = text.strip('.,;: ')
    if len(text) > 500:
        text = text[:497] + '...'
    return text


# ================================================================
# 2025 SPECIAL HANDLING
# ================================================================

def fix_2025_scoring_point(sp):
    """
    For 2025 files: description contains "For the correct X: Point NN answer"
    Split into clean description and correct_example.
    """
    desc = sp.get('description', '')
    if not desc:
        return sp

    alts = sp.get('alternatives', [])
    if alts and alts[0].get('correct_example', ''):
        return sp  # Already has example, skip

    # Pattern: "For the correct X: Point NN actual_answer"
    # or just "actual_answer" (description IS the answer)

    # Check for "Point NN" pattern in description
    point_m = re.search(r'Point\s+\d+\s*(.*?)$', desc, re.IGNORECASE | re.DOTALL)
    for_m = re.search(r'^(For\s+(?:the\s+|a\s+|an\s+)?(?:correct|valid|balanced|appropriate|a correct)[^:]*):?\s*(.*)', desc, re.IGNORECASE | re.DOTALL)

    if point_m:
        # Has "Point NN" - split there
        answer = point_m.group(1).strip()
        # Clean criterion (everything before "Point NN")
        criterion_part = desc[:point_m.start()].strip().rstrip(':').strip()
        if criterion_part:
            sp['description'] = clean_criterion(criterion_part)
        if answer:
            if alts:
                for alt in alts:
                    if not alt.get('correct_example', ''):
                        alt['correct_example'] = answer[:500]
            modified = True
    elif for_m:
        # Has "For the correct X:" with answer after
        criterion = for_m.group(1).strip()
        answer = for_m.group(2).strip()
        if criterion:
            sp['description'] = clean_criterion(criterion)
        if answer and alts:
            for alt in alts:
                if not alt.get('correct_example', ''):
                    alt['correct_example'] = answer[:500]
    elif desc and alts:
        # Description IS the answer (no criterion prefix)
        # Check if it looks like an answer (contains chemical content)
        if (re.search(r'mol|kJ|°C|pH|Ka|Ksp|equilibrium|g/mol|atm|M |V|= ', desc) or
                len(desc) > 30):
            # Move description to correct_example
            for alt in alts:
                if not alt.get('correct_example', ''):
                    alt['correct_example'] = desc[:500]
            sp['description'] = "Provide a correct response"

    return sp


# ================================================================
# GENERAL SCORING POINT ENRICHMENT
# ================================================================

def enrich_scoring_point(sp, part_key, scoring_blocks):
    """
    Try to enrich a scoring_point from the parsed scoring blocks.
    """
    alts = sp.get('alternatives', [])
    if not alts:
        return sp

    # Check if already has content
    if all(alt.get('correct_example', '') for alt in alts):
        return sp

    point_id = sp.get('point_id', '')

    # Parse point_id to get part info
    m = re.match(r'^([a-z])((?:i{1,3}v?|iv|vi{0,3}|ix|x)?)(\d+)$', point_id, re.IGNORECASE)
    if m:
        part_letter = m.group(1).lower()
        sub_roman = m.group(2).lower() or None
        point_num = int(m.group(3))
    else:
        part_letter = point_id[0].lower() if point_id else 'a'
        sub_roman = None
        point_num = 1

    # Build lookup key
    key = f"{part_letter}{sub_roman}" if sub_roman else part_letter

    # Get scoring content for this key
    blocks = scoring_blocks.get(key) or scoring_blocks.get(part_letter) or []

    # Also try alternative key formats
    if not blocks and sub_roman:
        # Try without sub
        blocks = scoring_blocks.get(part_letter, [])

    if not blocks:
        return sp

    # Combine all text in blocks
    combined = '\n'.join(blocks)
    criteria_list = extract_criteria_from_block(combined)

    if not criteria_list:
        return sp

    # If there are multiple scoring points in this part, pick the right one
    # point_num indicates which criterion to use (1-based)
    if len(criteria_list) >= point_num:
        criterion, answer = criteria_list[point_num - 1]
    else:
        criterion, answer = criteria_list[0] if criteria_list else ('', '')

    # Enrich alternatives
    for alt in alts:
        if not alt.get('correct_example', '') and answer:
            alt['correct_example'] = answer

    # Update description if it's placeholder
    current_desc = sp.get('description', '')
    if criterion and (
        not current_desc or
        current_desc in ['Provide a correct response', 'Correct and complete response'] or
        len(current_desc) < 20
    ):
        sp['description'] = criterion

    return sp


# ================================================================
# PROCESS INDIVIDUAL FILES
# ================================================================

def process_file(json_path, year, q_num, pdf_pages):
    """Process a single FRQ file. Returns True if modified."""
    with open(json_path, encoding='utf-8') as f:
        data = json.load(f)

    # Get PDF text for this question
    q_text = get_question_text(year, q_num, pdf_pages) if pdf_pages else ""

    # Parse scoring blocks from question text
    scoring_blocks = parse_scoring_blocks(q_text) if q_text else {}

    modified = False

    for part in data.get('parts', []):
        # NEVER touch drawing parts
        if part.get('requires_drawing', False):
            continue

        sps = part.get('scoring_points', [])
        if not sps:
            continue

        part_letter = part.get('letter', '').lower()

        for sp in sps:
            orig = json.dumps(sp, ensure_ascii=False)

            if year == 2025:
                sp = fix_2025_scoring_point(sp)

            # Try general enrichment
            sp = enrich_scoring_point(sp, part_letter, scoring_blocks)

            if json.dumps(sp, ensure_ascii=False) != orig:
                modified = True

            # Update in place
            idx = sps.index(next(s for s in sps if s.get('point_id') == sp.get('point_id')), 0)
            sps[idx] = sp

    if modified:
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    return modified


def process_file_safe(json_path, year, q_num, pdf_pages):
    """Process a single FRQ file safely. Returns True if modified."""
    with open(json_path, encoding='utf-8') as f:
        data = json.load(f)

    # Get PDF text for this question
    q_text = get_question_text(year, q_num, pdf_pages) if pdf_pages else ""

    # Parse scoring blocks from question text
    scoring_blocks = parse_scoring_blocks(q_text) if q_text else {}

    modified = False

    for part in data.get('parts', []):
        # NEVER touch drawing parts
        if part.get('requires_drawing', False):
            continue

        sps = part.get('scoring_points', [])
        if not sps:
            continue

        part_letter = part.get('letter', '').lower()

        for i, sp in enumerate(sps):
            orig = json.dumps(sp, ensure_ascii=False)

            if year == 2025:
                sp = fix_2025_scoring_point(sp)

            # Try general enrichment
            sp = enrich_scoring_point(sp, part_letter, scoring_blocks)

            new_str = json.dumps(sp, ensure_ascii=False)
            if new_str != orig:
                sps[i] = sp
                modified = True

    if modified:
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    return modified


# ================================================================
# MAIN
# ================================================================

def main():
    print("AP Chemistry FRQ - Final Scoring Points Enrichment")
    print("=" * 60)

    total_modified = 0

    for year in YEARS:
        print(f"\nYear {year}:")

        pdf_pages = read_pdf_pages(year)
        if pdf_pages:
            readable = sum(1 for p in pdf_pages if len(p.strip()) > 100)
            print(f"  PDF: {len(pdf_pages)} pages ({readable} readable)")
        else:
            print(f"  PDF: not found")

        for q_num in range(1, 8):
            json_fname = f"chem-{year}-frq-{q_num}.json"
            json_path = os.path.join(FRQ_DIR, json_fname)

            if not os.path.exists(json_path):
                continue

            modified = process_file_safe(json_path, year, q_num, pdf_pages)
            status = "ENRICHED" if modified else "unchanged"
            print(f"  {json_fname}: {status}")

            if modified:
                total_modified += 1

    print(f"\n{'=' * 60}")
    print(f"Total files modified: {total_modified}")

    # Verification
    total_sps = 0
    empty_sps = 0
    still_empty = []

    for year in YEARS:
        for q_num in range(1, 8):
            fname = f"chem-{year}-frq-{q_num}.json"
            path = os.path.join(FRQ_DIR, fname)
            if not os.path.exists(path):
                continue
            with open(path, encoding='utf-8') as f:
                data = json.load(f)
            for part in data.get('parts', []):
                if part.get('requires_drawing', False):
                    continue
                for sp in part.get('scoring_points', []):
                    total_sps += 1
                    alts = sp.get('alternatives', [])
                    if not alts or not alts[0].get('correct_example', ''):
                        empty_sps += 1
                        still_empty.append(f"{fname} part={part['letter']} {sp.get('point_id')}")

    print(f"\nVERIFICATION:")
    print(f"  Total scoring_points (non-drawing): {total_sps}")
    print(f"  With correct_example populated: {total_sps - empty_sps} ({(total_sps - empty_sps)/total_sps*100:.1f}%)")
    print(f"  Still empty: {empty_sps}")

    if still_empty:
        print(f"\nStill empty ({len(still_empty)}):")
        for item in still_empty[:20]:
            print(f"  {item}")
        if len(still_empty) > 20:
            print(f"  ... and {len(still_empty) - 20} more")


if __name__ == "__main__":
    main()
