#!/usr/bin/env python3
"""
migrate_calc_bc_frq.py
Fixes per-part point_value in AP Calculus BC FRQ JSON files.
Extracts correct point values from College Board scoring guide PDFs.

Three formats handled:
  2021-2024: "Total for part (X) N point(s)" pattern
  2025:      "Point N (PN)" sequential labels tracked per part section
  2012-2019: Old curly-brace format — MAX of N: tokens per part section
"""

import json
import os
import re
import sys
import pdfplumber

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = "C:/Ascendly"
SG_DIR   = os.path.join(BASE_DIR, "content-sources/frq-pdfs/ap-calculus-bc/scoring-guidelines")
FRQ_DIR  = os.path.join(BASE_DIR, "public/data/ap-calculus-bc/frq")

SG_PDF_MAP = {
    2012: 'bc sg 12.pdf',
    2013: 'bc sg 13.pdf',
    2014: 'bc sg 14.pdf',
    2015: 'bc sg 15.pdf',
    2016: 'bc sg 16.pdf',
    2017: 'bc sg 17.pdf',
    2018: 'bc sg 18.pdf',
    2019: 'bc sg 19.pdf',
    2021: 'bc sg 21.pdf',
    2022: 'bc sg 22.pdf',
    2023: 'bc sg 23.pdf',
    2024: 'bc sg 24.pdf',
    2025: 'bc sg 25.pdf',
}


# ---------------------------------------------------------------------------
# 2021-2024: "Total for part (X) N point(s)" extraction
# ---------------------------------------------------------------------------

def extract_new_format(pdf_path):
    """
    Returns dict: {(q_num, part_letter): point_value}
    Uses 'Total for part (X) N point(s)' pattern.
    Relies on 'Question N 9 points' to track question number.
    """
    result = {}

    with pdfplumber.open(pdf_path) as pdf:
        pages_text = [p.extract_text() or "" for p in pdf.pages]

    full_text = "\n".join(pages_text)

    # Split by question boundaries
    q_split_pattern = r'Question\s+(\d+)\s+9\s+points?'
    parts = re.split(q_split_pattern, full_text, flags=re.IGNORECASE)

    current_q = None
    for chunk in parts:
        if re.fullmatch(r'\d+', chunk.strip()):
            current_q = int(chunk.strip())
            continue
        if current_q is None:
            continue
        hits = re.findall(
            r'Total for part \(([a-f])\)\s+(\d+)\s+points?',
            chunk, re.IGNORECASE
        )
        for letter, pts in hits:
            key = (current_q, letter.lower())
            result[key] = int(pts)

    return result


# ---------------------------------------------------------------------------
# 2025: "Point N (PN)" sequential label extraction
# ---------------------------------------------------------------------------

def extract_2025(pdf_path):
    """
    2025 format uses 'Point N (PN)' sequential labels.
    Process page by page, tracking current question and part.
    Count Point labels per (question, part) pair.
    """
    result = {}
    current_q = None
    current_part = None
    # Track all part-header positions found across pages for current question
    # Once a new question starts, reset

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""

            # Check for question header on this page
            q_match = re.search(r'Question\s+(\d+)\s+9\s+points?', text, re.IGNORECASE)
            if q_match:
                current_q = int(q_match.group(1))
                current_part = None

            if current_q is None:
                continue

            # Find all Point N (PN) labels on this page
            point_matches = list(re.finditer(r'Point\s+(\d+)\s+\(P\d+\)', text))
            point_positions = [(m.start(), int(m.group(1))) for m in point_matches]

            if not point_positions:
                # Still update current_part from part headers
                part_hdr = find_part_headers(text)
                if part_hdr:
                    current_part = part_hdr[-1]
                continue

            # Find part header positions on this page
            part_header_positions = find_part_header_positions(text)

            if part_header_positions:
                # Assign each point to the most recent part header before it
                for pt_pos, pt_num in point_positions:
                    active_part = current_part
                    for hdr_pos, hdr_letter in part_header_positions:
                        if hdr_pos <= pt_pos:
                            active_part = hdr_letter

                    if active_part:
                        key = (current_q, active_part)
                        result[key] = result.get(key, 0) + 1

                # Update current_part to last part on this page
                current_part = part_header_positions[-1][1]
            else:
                # No part headers on this page — all points go to current_part
                if current_part:
                    key = (current_q, current_part)
                    result[key] = result.get(key, 0) + len(point_positions)
                else:
                    # Points before any named part — assign to 'a'
                    current_part = 'a'
                    key = (current_q, 'a')
                    result[key] = result.get(key, 0) + len(point_positions)

    return result


def find_part_headers(text):
    """Return list of part letters found as section headers."""
    patterns = [
        r'(?:^|\n)([A-F])\s+(?:Find|Use|At|Is|Write|For|Assume|The|Consider|Let|Show|'
        r'Determine|Does|Based|Give|Verify|What|How|Which|Using|Define|Explain|A\s+particle)',
        r'(?m)^([A-F])\s+[A-Z][a-z]',
    ]
    found = []
    seen = set()
    for pat in patterns:
        for m in re.finditer(pat, text):
            letter = m.group(1).lower()
            if letter not in seen:
                seen.add(letter)
                found.append(letter)
    return found


def find_part_header_positions(text):
    """Return list of (position, part_letter) for part headers in text."""
    patterns = [
        r'(?:^|\n)([A-F])\s+(?:Find|Use|At|Is|Write|For|Assume|The|Consider|Let|Show|'
        r'Determine|Does|Based|Give|Verify|What|How|Which|Using|Define|Explain|A\s+particle)',
        r'(?m)^([A-F])\s+[A-Z][a-z]',
    ]
    positions = {}  # letter -> first position
    for pat in patterns:
        for m in re.finditer(pat, text):
            letter = m.group(1).lower()
            if letter not in positions:
                positions[letter] = m.start()

    # Return (position, letter) tuples sorted by position
    return sorted((pos, letter) for letter, pos in positions.items())


# ---------------------------------------------------------------------------
# 2012-2019: Old curly-brace format extraction
# ---------------------------------------------------------------------------

def extract_old_format(pdf_path):
    """
    2012-2019 format: '{ N :' or standalone 'N :' patterns.
    For each part section, find MAX of N: tokens = outer total.
    The outer scoring total is always the highest number in the section.
    Sub-items are '1:' with text; 2-point sub-criteria appear as '2:' but
    are always wrapped in a larger outer N, so MAX still gives the correct total.
    """
    result = {}

    with pdfplumber.open(pdf_path) as pdf:
        pages_text = [p.extract_text() or "" for p in pdf.pages]

    full_text = "\n".join(pages_text)

    # Split into question blocks using "Question N" header
    # Old format: "Question 1", "Question 2", etc. on separate lines
    q_split_pattern = r'(?:^|\n)\s*Question\s+(\d)\s*\n'
    q_chunks = re.split(q_split_pattern, full_text, flags=re.IGNORECASE)

    current_q = None
    for chunk in q_chunks:
        stripped = chunk.strip()
        if re.fullmatch(r'\d', stripped):
            current_q = int(stripped)
            continue
        if current_q is None or current_q > 6:
            continue

        pts = extract_old_format_question(chunk, current_q)
        result.update(pts)

    return result


def extract_old_format_question(text, q_num):
    """
    For one question block (old format), extract per-part point values.
    Returns dict: {(q_num, part_letter): point_value}

    Algorithm:
    1. Split text by part labels "(a)", "(b)", etc.
    2. For each part's section, find all N: tokens.
    3. The MAX value = outer total points for that part.
       (Single-point parts have only "1:" tokens, MAX=1)
    """
    result = {}

    # Split by "(a)", "(b)", "(c)", "(d)", "(e)", "(f)"
    # Each part label appears twice: once in question, once in scoring
    # We use ALL occurrences and accumulate N: tokens per letter

    part_sections = {}  # letter -> concatenated text for that part

    # Find all (letter) occurrences
    part_matches = list(re.finditer(r'\(([a-f])\)', text))

    for i, match in enumerate(part_matches):
        letter = match.group(1)
        start = match.end()
        end = part_matches[i + 1].start() if i + 1 < len(part_matches) else len(text)
        section_text = text[start:end]

        if letter not in part_sections:
            part_sections[letter] = ""
        part_sections[letter] += " " + section_text

    for letter, section in part_sections.items():
        # Find all N: tokens (1-9)
        n_tokens = re.findall(r'(?:^|[\s\{])(\d)\s*:', section)
        n_values = [int(n) for n in n_tokens if 1 <= int(n) <= 9]

        if n_values:
            total = max(n_values)
            result[(q_num, letter)] = total

    return result


# ---------------------------------------------------------------------------
# Main extractor dispatcher
# ---------------------------------------------------------------------------

# Hardcoded overrides for questions where auto-extraction fails due to
# "global" CB points (units, g'=f, etc.) that aren't attributed to a single part.
# Values verified manually from PDF text.
MANUAL_OVERRIDES = {
    (2013, 4): {'a': 1, 'b': 3, 'c': 2, 'd': 3},  # g'=f global pt in b
    (2016, 3): {'a': 2, 'b': 1, 'c': 4, 'd': 2},  # g'=f global pt -> a
    (2017, 1): {'a': 2, 'b': 1, 'c': 2, 'd': 4},  # units global pt -> d
    (2018, 1): {'a': 2, 'b': 2, 'c': 1, 'd': 4},  # clear from text
    (2021, 4): {'a': 2, 'b': 3, 'c': 2, 'd': 2},  # g'=f global pt -> a
    (2025, 2): {'a': 1, 'b': 3, 'c': 3, 'd': 2},  # polar: P1/P2-P4/P5-P7/P8-P9
    (2025, 3): {'a': 2, 'b': 2, 'c': 2, 'd': 3},  # P1-P2/P3-P4/P5-P6/P7-P9
}


def extract_point_map(year, pdf_path):
    """Extract per-part point values from a scoring guide PDF."""
    if 2021 <= year <= 2024:
        return extract_new_format(pdf_path)
    elif year == 2025:
        return extract_2025(pdf_path)
    else:  # 2012-2019
        return extract_old_format(pdf_path)


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------

def validate_question(q_map, q_num, expected_parts):
    """Check all parts present and sum to 9. Returns (is_valid, total, missing)."""
    total = 0
    missing = []
    for letter in expected_parts:
        key = (q_num, letter)
        if key in q_map:
            total += q_map[key]
        else:
            missing.append(letter)
    return (total == 9 and not missing), total, missing


# ---------------------------------------------------------------------------
# JSON updater
# ---------------------------------------------------------------------------

def build_scoring_points(letter, point_value):
    """Build placeholder scoring_points with correct count."""
    return [
        {
            "point_id": f"{letter}{i}",
            "point_value": 1,
            "description": f"See College Board scoring guidelines for part ({letter}), point {i}",
            "alternatives": [
                {"required_elements": [f"Correct response for part ({letter}), point {i}"]}
            ]
        }
        for i in range(1, point_value + 1)
    ]


def is_placeholder_sp(scoring_points):
    """True if scoring_points contains only generic placeholder entries."""
    if not scoring_points:
        return True
    return all(
        "See College Board scoring guidelines" in (sp.get("description") or "")
        or "Correct response for part" in str(sp.get("alternatives", ""))
        for sp in scoring_points
    )


def update_frq_file(filepath, point_map):
    """Update a single FRQ JSON file. Returns (changed, message)."""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    frq_id = data.get("id", "")
    q_match = re.search(r'-frq-(\d+)$', frq_id)
    if not q_match:
        return False, "Cannot parse question number"

    q_num = int(q_match.group(1))
    parts = data.get("parts", [])
    changed = False

    for part in parts:
        letter = part.get("letter", "").lower()
        key = (q_num, letter)
        if key not in point_map:
            continue

        new_pv = point_map[key]
        old_pv = part.get("point_value", 1)

        if new_pv != old_pv:
            part["point_value"] = new_pv
            changed = True

        # Rebuild scoring_points if placeholder or wrong count
        current_sp = part.get("scoring_points", [])
        if is_placeholder_sp(current_sp) or len(current_sp) != new_pv:
            part["scoring_points"] = build_scoring_points(letter, new_pv)
            changed = True

    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    return changed, "OK"


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print("AP Calculus BC FRQ Point Value Migration")
    print("=" * 60)

    # Pre-scan JSON files to know expected parts per (year, q_num)
    json_files = sorted(f for f in os.listdir(FRQ_DIR)
                        if f.startswith("calc-bc-") and f.endswith(".json"))
    q_parts_seen = {}  # (year, q_num) -> [part letters in order]

    for fname in json_files:
        m = re.match(r'calc-bc-(\d{4})-frq-(\d+)\.json', fname)
        if not m:
            continue
        year, q_num = int(m.group(1)), int(m.group(2))
        with open(os.path.join(FRQ_DIR, fname), encoding='utf-8') as f:
            d = json.load(f)
        q_parts_seen[(year, q_num)] = [p['letter'].lower() for p in d.get('parts', [])]

    # Step 1: Build full point map from all PDFs
    full_point_map = {}  # (year, q_num, letter) -> point_value
    extraction_issues = []

    for year, pdf_name in sorted(SG_PDF_MAP.items()):
        pdf_path = os.path.join(SG_DIR, pdf_name)
        if not os.path.exists(pdf_path):
            print(f"  SKIP {year}: PDF not found")
            continue

        print(f"\n  Extracting {year}...")
        try:
            raw_map = extract_point_map(year, pdf_path)
        except Exception as e:
            print(f"    ERROR: {e}")
            extraction_issues.append(f"{year}: {e}")
            continue

        for q_num in range(1, 7):
            expected_parts = q_parts_seen.get((year, q_num), [])
            if not expected_parts:
                continue

            # Check for manual override first
            override = MANUAL_OVERRIDES.get((year, q_num))
            if override:
                for letter in expected_parts:
                    full_point_map[(year, q_num, letter)] = override.get(letter, 1)
                vals = [override.get(l, 1) for l in expected_parts]
                print(f"    Q{q_num} {expected_parts} → {vals} = {sum(vals)} ✓ (manual)")
                continue

            q_map = {(q, l): v for (q, l), v in raw_map.items() if q == q_num}
            is_valid, total, missing = validate_question(q_map, q_num, expected_parts)

            part_vals = [q_map.get((q_num, l), '?') for l in expected_parts]

            if is_valid:
                for letter in expected_parts:
                    full_point_map[(year, q_num, letter)] = q_map[(q_num, letter)]
                print(f"    Q{q_num} {expected_parts} → {part_vals} = {total} ✓")
            else:
                # Fallback: distribute 9 pts across N parts as evenly as possible
                n = len(expected_parts)
                base = 9 // n
                extra = 9 % n
                fallback = [base + (1 if i < extra else 0) for i in range(n)]
                issue = f"{year} Q{q_num}: extracted={part_vals} total={total} missing={missing} → fallback={fallback}"
                print(f"    Q{q_num} WARNING: {issue}")
                extraction_issues.append(issue)
                for i, letter in enumerate(expected_parts):
                    full_point_map[(year, q_num, letter)] = fallback[i]

    # Step 2: Apply to JSON files
    print(f"\n{'='*60}")
    print("Updating JSON files...")
    updated = 0
    skipped = 0
    errors = []

    for fname in json_files:
        m = re.match(r'calc-bc-(\d{4})-frq-(\d+)\.json', fname)
        if not m:
            continue
        year, q_num = int(m.group(1)), int(m.group(2))

        point_map_slice = {
            (q, l): v
            for (yr, q, l), v in full_point_map.items()
            if yr == year and q == q_num
        }

        if not point_map_slice:
            print(f"  SKIP {fname}: no point data")
            skipped += 1
            continue

        filepath = os.path.join(FRQ_DIR, fname)
        try:
            changed, msg = update_frq_file(filepath, point_map_slice)
            if changed:
                updated += 1
                print(f"  UPDATED: {fname}")
            else:
                skipped += 1
        except Exception as e:
            errors.append(f"{fname}: {e}")
            print(f"  ERROR: {fname}: {e}")

    print(f"\n{'='*60}")
    print(f"Updated: {updated}  |  Skipped: {skipped}  |  Errors: {len(errors)}")
    if errors:
        for e in errors:
            print(f"  {e}")
    if extraction_issues:
        print(f"\nFallback used for:")
        for issue in extraction_issues:
            print(f"  {issue}")
    else:
        print("\nAll point values extracted successfully from PDFs.")


if __name__ == "__main__":
    main()
