#!/usr/bin/env python3
"""
Migrate AP Psychology FRQ JSON files from legacy rubric_criteria
to structured scoring_points using College Board scoring guideline PDFs.

Handles:
- 2021 set 1: old format scoring guidelines
- 2021 set 2: no scoring guidelines PDF (questions PDF only) -> use rubric_criteria
- 2022-2024 sets 1 & 2: old format scoring guidelines
- 2025 sets 1 & 2: new table format scoring guidelines
- psych-gen-*: no PDFs -> use rubric_criteria fallback
"""
import sys
import os
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

from pdfminer.high_level import extract_text

PDF_DIR = r"C:\Ascendly\content-sources\frq-pdfs\ap-psychology\scoring-guidelines"
FRQ_DIR = r"C:\Ascendly\public\data\ap-psychology\frq"

# Map (year, set_num) to PDF filename; None means no scoring guidelines available
PDF_MAP = {
    (2021, 1): "2021 sg psych set 1.pdf",
    (2021, 2): None,  # Only questions PDF available, not scoring guidelines
    (2022, 1): "2022 sg psych set 1.pdf",
    (2022, 2): "2022 sg psych set 2.pdf",
    (2023, 1): "2023 sg psych set 1.pdf",
    (2023, 2): "2023 sg psych set 2.pdf",
    (2024, 1): "2024 sg psych set 1.pdf",
    (2024, 2): "2024 sg psych set 2.pdf",
    (2025, 1): "2025 psych sg set 1.pdf",
    (2025, 2): "2025 sg psych set 2.pdf",
}

# FRQ JSON files to process with year/set/frq_num metadata
FRQ_FILES = [
    ("psych-2021-set1-frq-1.json", 2021, 1, 1),
    ("psych-2021-set1-frq-2.json", 2021, 1, 2),
    ("psych-2021-set2-frq-1.json", 2021, 2, 1),
    ("psych-2021-set2-frq-2.json", 2021, 2, 2),
    ("psych-2022-set1-frq-1.json", 2022, 1, 1),
    ("psych-2022-set1-frq-2.json", 2022, 1, 2),
    ("psych-2022-set2-frq-1.json", 2022, 2, 1),
    ("psych-2022-set2-frq-2.json", 2022, 2, 2),
    ("psych-2023-set1-frq-1.json", 2023, 1, 1),
    ("psych-2023-set1-frq-2.json", 2023, 1, 2),
    ("psych-2023-set2-frq-1.json", 2023, 2, 1),
    ("psych-2023-set2-frq-2.json", 2023, 2, 2),
    ("psych-2024-set1-frq-1.json", 2024, 1, 1),
    ("psych-2024-set1-frq-2.json", 2024, 1, 2),
    ("psych-2024-set2-frq-1.json", 2024, 2, 1),
    ("psych-2024-set2-frq-2.json", 2024, 2, 2),
    ("psych-2025-set1-frq-1.json", 2025, 1, 1),
    ("psych-2025-set1-frq-2.json", 2025, 1, 2),
    ("psych-2025-set2-frq-1.json", 2025, 2, 1),
    ("psych-2025-set2-frq-2.json", 2025, 2, 2),
]

LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g']

# Lines that indicate page headers/footers and should be stripped
NOISE_PATTERNS = [
    r'^©\s*20\d\d\s*College Board',
    r'^AP®\s*Psychology\s*\d{4}\s*Scoring Guidelines',
    r'^AP®\s*Psychology\s*Scoring Guidelines',
    r'^College Board',
]


def is_noise_line(line):
    """Return True if the line is a header/footer artifact."""
    line = line.strip()
    return any(re.match(p, line, re.IGNORECASE) for p in NOISE_PATTERNS)


# ─────────────────────────────────────────────────────────────────────────────
# PDF TEXT EXTRACTION
# ─────────────────────────────────────────────────────────────────────────────

def get_pdf_text(year, set_num):
    """Return full PDF text for the given year/set, or None if unavailable."""
    key = (year, set_num)
    pdf_filename = PDF_MAP.get(key)
    if not pdf_filename:
        return None
    pdf_path = os.path.join(PDF_DIR, pdf_filename)
    if not os.path.exists(pdf_path):
        print(f"    PDF not found: {pdf_path}")
        return None
    try:
        return extract_text(pdf_path)
    except Exception as e:
        print(f"    Error reading PDF: {e}")
        return None


def clean_pdf_text(text):
    """Remove page header/footer noise from extracted PDF text."""
    lines = text.split('\n')
    cleaned = []
    for line in lines:
        if not is_noise_line(line):
            cleaned.append(line)
    return '\n'.join(cleaned)


# ─────────────────────────────────────────────────────────────────────────────
# OLD FORMAT PARSER (2021-2024)
# ─────────────────────────────────────────────────────────────────────────────

def extract_question_section_old(text, frq_num):
    """
    Split the PDF text into the section for Question 1 or Question 2.
    Old format (2021-2024): "Question 1: ..." and "Question 2: ..."
    """
    q1_match = re.search(r'Question\s+1[:\s]', text)
    q2_match = re.search(r'Question\s+2[:\s]', text)

    if frq_num == 1:
        if q1_match and q2_match:
            return text[q1_match.start():q2_match.start()]
        elif q1_match:
            return text[q1_match.start():]
        return text
    else:
        if q2_match:
            return text[q2_match.start():]
        return text


def parse_old_format(text, frq_num, n_parts):
    """
    Parse scoring data from old format (2021-2024) PDFs.

    Two sub-formats exist:
    A) 2021-2023 format: "[Concept Name]\n1 point\n[Description]\nAcceptable..."
    B) 2024 format: "[Description-part-1]\n1 point\n[Description-part-2]\nAcceptable..."
       (some parts in 2024 have the description split around the "1 point" marker)

    Returns list of dicts (one per part): {concept_name, description, acceptable, unacceptable}
    """
    text = clean_pdf_text(text)
    section = extract_question_section_old(text, frq_num)

    # Split at "1 point" markers
    parts_raw = re.split(r'\n\s*1 point\s*\n', section)

    if len(parts_raw) < 2:
        parts_raw = re.split(r'1 point\s*\n', section)

    results = []

    for i in range(1, len(parts_raw)):
        if len(results) >= n_parts:
            break

        prev_chunk = parts_raw[i - 1]
        block_text = parts_raw[i]

        # Determine which sub-format this is
        # Get the last meaningful line from prev_chunk
        last_line = last_meaningful_line(prev_chunk)

        # In 2021-2023: last_line is a concept name (short, not a paragraph continuation)
        # In 2024: last_line might be part of the description (ends mid-sentence)
        desc_prefix = ""
        concept_name = ""

        if last_line and is_description_prefix(last_line):
            # 2024-style: the prev_chunk ends with part of the description
            # Extract that description prefix (everything after the last full sentence/header)
            desc_prefix = extract_description_prefix(prev_chunk)
        else:
            # 2021-2023 style: last_line is the concept name
            concept_name = last_line

        # Strip trailing concept name from current block
        block_text = strip_trailing_concept_name(block_text)

        part_data = parse_one_point_block(block_text, concept_name, desc_prefix)
        results.append(part_data)

    return results


def is_description_prefix(line):
    """
    Return True if the line looks like it's the beginning/middle of a description
    rather than a concept name heading.

    Clues for description prefix:
    - Ends without period (truncated sentence)
    - Contains "must indicate", "Response must", etc.
    - Is longer than typical concept names (> 50 chars)
    """
    line = line.strip()
    if not line:
        return False
    # Typical description prefixes contain these phrases
    if re.search(r'Response must|must indicate|must include|the response', line, re.IGNORECASE):
        return True
    # Long lines that end without period are likely truncated descriptions
    if len(line) > 50 and not line.endswith('.') and not line.endswith(':'):
        return True
    return False


def extract_description_prefix(prev_chunk):
    """
    Extract the description prefix text from the end of the previous chunk.
    This is the text that belongs to the current criterion's description
    but appeared before the "1 point" marker.

    We find the start of the description by looking for "Response must indicate"
    or similar, or by taking everything after the last blank line.
    """
    # Find the last occurrence of description-starting patterns
    patterns = [
        r'Response must indicate',
        r'The response must indicate',
        r'must indicate',
    ]
    for pat in patterns:
        matches = list(re.finditer(pat, prev_chunk, re.IGNORECASE))
        if matches:
            last_match = matches[-1]
            prefix = prev_chunk[last_match.start():].strip()
            # Normalize whitespace
            prefix = re.sub(r'[ \t]+', ' ', prefix)
            prefix = re.sub(r'(?<!\n)\n(?!\n)', ' ', prefix)
            return prefix.strip()

    # Fallback: take text after the last double blank line
    double_nl_match = list(re.finditer(r'\n\n', prev_chunk))
    if double_nl_match:
        last_dbl = double_nl_match[-1]
        prefix = prev_chunk[last_dbl.end():].strip()
        if prefix and len(prefix) > 20:
            prefix = re.sub(r'[ \t]+', ' ', prefix)
            prefix = re.sub(r'(?<!\n)\n(?!\n)', ' ', prefix)
            return prefix.strip()

    return ""


def last_meaningful_line(text):
    """
    Return the last non-empty, non-noise line from text.
    Used to extract concept name from the chunk preceding '1 point'.
    """
    lines = text.split('\n')
    skip_patterns = [
        r'^Part [A-C]\s',
        r'^General Considerations',
        r'^Question [12]',
        r'^\d+\.\s',
        r'^Explain how each',
        r'^Explain the following',
        r'^For each of the following',
        r'^Scoring Guidelines',
    ]
    for line in reversed(lines):
        line = line.strip()
        if not line:
            continue
        if is_noise_line(line):
            continue
        if any(re.match(p, line, re.IGNORECASE) for p in skip_patterns):
            continue
        # Skip very long lines (they're scenario text, not concept names)
        if len(line) > 120:
            continue
        return line
    return ""


def strip_trailing_concept_name(block_text):
    """
    Strip the last non-empty, non-noise lines from a block that look like they
    are the concept name heading for the NEXT criterion.

    The concept name appears after all the acceptable/unacceptable sections,
    after the last bullet point, on its own line.
    """
    lines = block_text.rstrip().split('\n')

    # Find the position of the last "Unacceptable" bullet section
    last_unacc = -1
    for i, line in enumerate(lines):
        if re.search(r'Unacceptable', line, re.IGNORECASE):
            last_unacc = i

    if last_unacc == -1:
        # No unacceptable section - find end of acceptable bullets
        last_bullet = -1
        for i, line in enumerate(lines):
            if line.strip().startswith('•'):
                last_bullet = i
        if last_bullet == -1:
            return block_text
        # Check if there's extra text after the last bullet
        end_idx = last_bullet + 1
    else:
        end_idx = last_unacc + 1

    # Find the last bullet AFTER the unacceptable header
    for i in range(end_idx, len(lines)):
        if lines[i].strip().startswith('•'):
            end_idx = i + 1

    # Now lines[end_idx:] might contain:
    # - continuation of the last bullet (non-empty lines immediately after)
    # - blank lines
    # - concept name for next criterion
    # We want to keep continuation lines but strip the concept name

    # Advance past any continuation text that logically belongs to last bullet
    # (continuation = non-empty line that doesn't look like a new concept name)
    while end_idx < len(lines):
        line = lines[end_idx].strip()
        if not line:
            end_idx += 1
            continue
        # If it looks like a concept name (short, title-case-ish, no bullet)
        # and we've already passed all bullets, stop here
        break

    # Strip everything from end_idx onward that looks like noise/next-concept-name
    trimmed_lines = []
    for i, line in enumerate(lines):
        if i >= end_idx:
            # Keep only if it's clearly continuation of bullet content
            # (i.e., it appears immediately after a bullet with no blank lines in between
            # - but our end_idx already accounts for this)
            stripped = line.strip()
            if stripped and not is_noise_line(stripped):
                # Check if this is continuation of last bullet or new concept name
                # New concept name: short line, follows blank lines
                pass
            break
        trimmed_lines.append(line)

    # Simpler approach: just use lines up to end_idx
    return '\n'.join(lines[:end_idx])


def parse_one_point_block(block, concept_name="", desc_prefix=""):
    """
    Parse a single scoring criterion block (text after the '1 point' marker).

    desc_prefix: Optional description text that appeared BEFORE "1 point" in 2024 format.
    Returns dict: {concept_name, description, acceptable, unacceptable, scoring_notes}
    """
    # Split at "Acceptable explanations include:"
    acc_split = re.split(
        r'Acceptable explanations include\s*:|Acceptable responses include\s*:',
        block, maxsplit=1, flags=re.IGNORECASE
    )

    if len(acc_split) == 2:
        description_raw = acc_split[0]
        after_acc = acc_split[1]
    else:
        description_raw = block
        after_acc = ""

    # Split at "Unacceptable explanations include:"
    unacc_split = re.split(
        r'Unacceptable explanations include\s*:|Unacceptable responses include\s*:',
        after_acc, maxsplit=1, flags=re.IGNORECASE
    )
    acceptable_raw = unacc_split[0]
    unacceptable_raw = unacc_split[1] if len(unacc_split) > 1 else ""

    # Build description: if we have a desc_prefix, join it with the text after "1 point"
    if desc_prefix:
        description = clean_description(desc_prefix + " " + description_raw)
    else:
        description = clean_description(description_raw)

    # Parse bullets
    acceptable_bullets = parse_bullets_from_text(acceptable_raw)
    unacceptable_bullets = parse_bullets_from_text(unacceptable_raw)

    # Look for scoring notes
    scoring_notes = None
    note_match = re.search(r'NOTE[:\s]+(.+?)(?=\n\n|$)', block, re.DOTALL | re.IGNORECASE)
    if note_match:
        scoring_notes = re.sub(r'\s+', ' ', note_match.group(1)).strip()

    return {
        "concept_name": concept_name,
        "description": description,
        "acceptable": acceptable_bullets,
        "unacceptable": unacceptable_bullets,
        "scoring_notes": scoring_notes,
    }


def clean_description(text):
    """
    Clean a description block:
    - Remove noise lines (headers/footers)
    - Normalize whitespace
    - Remove leading "1 point" if present
    """
    lines = text.split('\n')
    good_lines = []
    for line in lines:
        if is_noise_line(line):
            continue
        good_lines.append(line)
    text = '\n'.join(good_lines).strip()

    # Remove leading "1 point" text if present
    text = re.sub(r'^1\s*point\s*\n?', '', text, flags=re.IGNORECASE).strip()

    # Normalize whitespace within the description
    # Replace multiple spaces/tabs with single space
    text = re.sub(r'[ \t]+', ' ', text)
    # Join wrapped lines (single \n that aren't blank lines)
    text = re.sub(r'(?<!\n)\n(?!\n)', ' ', text)
    # Collapse multiple blank lines to double newline
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Final cleanup
    text = text.strip()

    return text


def parse_bullets_from_text(text):
    """
    Extract bullet points from text, correctly joining multi-line bullets.

    In AP Psych PDFs, a bullet like:
        •  Malia thinks that fate determines her life, so she doesn't take proactive steps to do her

        paper.

    Gets extracted as three lines: the bullet line, a blank line, and "paper."
    We need to join these into one complete bullet.

    Strategy:
    - Process line by line
    - When we see a bullet (•), start accumulating text
    - When we see another bullet or a clearly new section, finish the current bullet
    - "Continuation" lines: non-empty lines that follow the current bullet (even after blank lines)
      - BUT: a short capitalized line that looks like a concept name → new section
    """
    bullets = []
    lines = text.split('\n')

    # Remove noise lines
    lines = [l for l in lines if not is_noise_line(l.strip())]

    current_bullet_parts = []
    in_bullet = False

    for i, line in enumerate(lines):
        stripped = line.strip()

        # Bullet starter
        if stripped.startswith('•') or (stripped.startswith('-') and len(stripped) > 2):
            # Save previous bullet if any
            if current_bullet_parts:
                bullet_text = ' '.join(current_bullet_parts).strip()
                if bullet_text and len(bullet_text) > 5:
                    bullets.append(bullet_text)
                current_bullet_parts = []

            # Start new bullet
            cleaned = re.sub(r'^[•\-]\s*', '', stripped)
            if cleaned:
                current_bullet_parts = [cleaned]
            in_bullet = True
            continue

        if not stripped:
            # Blank line - might be within a wrapped bullet, might be end
            # We'll handle this by looking ahead: if next non-empty line looks like
            # a continuation (lowercase start or part of a sentence), keep going
            # For now, just skip blank lines within bullets
            continue

        if in_bullet:
            # Check if this line is a continuation of the current bullet
            # or a new section (context note, concept name, etc.)

            # Context notes like "Responses that include...", "Responses that refer to..."
            if re.match(r'^Responses that (include|refer|do not|address)', stripped, re.IGNORECASE):
                # This is a context note for the acceptable section, not a bullet continuation
                if current_bullet_parts:
                    bullet_text = ' '.join(current_bullet_parts).strip()
                    if bullet_text and len(bullet_text) > 5:
                        bullets.append(bullet_text)
                    current_bullet_parts = []
                in_bullet = False
                continue

            # Check if this looks like a concept name (new section heading)
            # Concept names: short-ish, don't start with lowercase articles,
            # don't have "or" etc.
            if looks_like_concept_name(stripped):
                if current_bullet_parts:
                    bullet_text = ' '.join(current_bullet_parts).strip()
                    if bullet_text and len(bullet_text) > 5:
                        bullets.append(bullet_text)
                    current_bullet_parts = []
                in_bullet = False
                continue

            # Otherwise, it's a continuation of the current bullet
            current_bullet_parts.append(stripped)

        else:
            # Not in a bullet - check if this is a context note we should skip
            # Context notes describe the type of acceptable responses
            if re.match(r'^Responses that (include|refer|do not|address)', stripped, re.IGNORECASE):
                continue
            # Other non-bullet substantive lines - ignore (they're descriptors)

    # Save last bullet
    if current_bullet_parts:
        bullet_text = ' '.join(current_bullet_parts).strip()
        if bullet_text and len(bullet_text) > 5:
            bullets.append(bullet_text)

    return bullets


def looks_like_concept_name(text):
    """
    Return True if text looks like a new concept name heading
    rather than a continuation of a bullet.

    Concept names are typically:
    - Short (< 80 chars)
    - Don't end with sentence-ending punctuation within the text
    - Often capitalized / title-case
    - Examples: "Divergent thinking", "Efferent neurons", "Incentive Theory"
    """
    if len(text) > 80:
        return False
    if len(text) < 4:
        return False

    # If it starts with a lowercase word that makes it clearly a sentence continuation
    # (e.g., "paper.", "grade from her teacher."), it's a continuation
    first_word = text.split()[0]
    if first_word.islower() and len(first_word) > 2:
        return False

    # If it ends with a period and is a short phrase, it could be either
    # But if it's just one or two words, likely a concept name
    words = text.split()
    if len(words) <= 4 and not text.endswith(','):
        return True

    return False


# ─────────────────────────────────────────────────────────────────────────────
# NEW FORMAT PARSER (2025)
# ─────────────────────────────────────────────────────────────────────────────

def extract_question_section_new(text, frq_num):
    """
    Split PDF text into the section for FRQ 1 or FRQ 2 (2025 format).
    """
    frq1_match = re.search(r'FRQ\s*1[:\s]|(?:Question|FRQ)\s+1\b', text)
    frq2_match = re.search(r'FRQ\s*2[:\s]|(?:Question|FRQ)\s+2\b', text)

    if frq_num == 1:
        if frq1_match and frq2_match:
            return text[frq1_match.start():frq2_match.start()]
        elif frq1_match:
            return text[frq1_match.start():]
        return text
    else:
        if frq2_match:
            return text[frq2_match.start():]
        return text


def parse_new_format(text, frq_num, n_parts):
    """
    Parse scoring data from new table format (2025) PDFs.

    Each Part section:
        Part A / Part B / etc.
        [Reporting Category label]
        0 points  Scoring Criteria  1 point  (columns in table)
        [Does not earn criteria]    [Earns criteria]
        Decision Rules and Scoring Notes
        (0-1 points)
        Responses that do not earn this point:  /  Responses that earn this point:
        • Example                               / • Example

    Returns list of dicts per part letter.
    """
    text = clean_pdf_text(text)
    section = extract_question_section_new(text, frq_num)

    # Find all "Part X" markers in the section
    part_pattern = re.compile(r'\nPart ([A-G])(?:\s*\n|\s+)', re.IGNORECASE)
    part_matches = list(part_pattern.finditer(section))

    results = []

    for i, match in enumerate(part_matches):
        if len(results) >= n_parts:
            break

        part_letter = match.group(1).lower()
        start = match.end()
        end = part_matches[i + 1].start() if i + 1 < len(part_matches) else len(section)
        content = section[start:end]

        part_data = parse_new_format_part(content, part_letter)
        results.append(part_data)

    return results


def parse_new_format_part(content, part_letter):
    """
    Parse a single Part section from 2025 new format.

    The 2025 PDF uses a two-column table format. After PDF text extraction,
    the columns are interleaved, making it hard to cleanly separate earn/not-earn bullets.

    Strategy:
    - Extract description from the positive criterion (right column header)
    - For examples: try to find clearly labeled "Examples that earn" section
      (these appear AFTER "Examples that do not earn" header, both on same line,
      then bullets follow. We can't reliably separate them from the extracted text.)
    - Point value from "(0-N points)" marker

    Returns dict: {part_letter, point_value, description, acceptable, unacceptable, scoring_notes}
    """
    # Determine point value
    pts_match = re.search(r'\(0[–\-](\d+)\s*points?\)', content, re.IGNORECASE)
    point_value = int(pts_match.group(1)) if pts_match else 1

    # Extract the positive criterion description
    earn_criterion = extract_earn_criterion(content)

    # For 2025, the "Examples that earn" and "Examples that do not earn" sections
    # appear as two headers on adjacent lines, followed by the bullet stream
    # (columns interleaved). We extract bullets from these sections with care.

    acceptable_bullets = []
    unacceptable_bullets = []

    # Find the "Examples that do not earn" and "Examples that earn" block
    # They typically appear together, and then bullets follow
    # In the stream: [do-not-earn header] then [earn header] then [interleaved bullets]
    # We take ALL the bullets and note that they appear in "examples" section

    # First try: find clearly separated earn/not-earn examples by looking at
    # whether the "earn" header comes BEFORE or AFTER the "do not earn" header
    not_earn_pos = [m.start() for m in re.finditer(r'Examples that do not earn this point\s*:', content, re.IGNORECASE)]
    earn_pos = [m.start() for m in re.finditer(r'Examples that earn this point\s*:', content, re.IGNORECASE)]

    if earn_pos and not_earn_pos:
        # Find the last pair (they might appear multiple times for 2-pt parts)
        last_not_earn = not_earn_pos[-1]
        last_earn = earn_pos[-1]

        if last_not_earn < last_earn:
            # Normal ordering: "not earn" then "earn" — bullets follow earn header
            earn_start = last_earn
            earn_match = re.search(r'Examples that earn this point\s*:(.*?)(?=Additional Note|© 20|Reporting|\Z)', content[earn_start:], re.DOTALL | re.IGNORECASE)
            if earn_match:
                all_bullets = parse_bullets_from_text(earn_match.group(1))
                # The bullets here are the EARN examples (not the not-earn ones)
                # because in 2025, the headers appear together then the earn examples
                # come after, while the not-earn examples appear earlier in the stream
                not_earn_match = re.search(r'Examples that do not earn this point\s*:(.*?)(?=Examples that earn|Additional Note|\Z)', content[:last_earn], re.DOTALL | re.IGNORECASE)
                if not_earn_match:
                    unacceptable_bullets = parse_bullets_from_text(not_earn_match.group(1))
                # The bullets after "earn" header are all earn examples
                acceptable_bullets = all_bullets
        else:
            # "earn" comes first then "not earn" — unusual but handle it
            earn_match = re.search(r'Examples that earn this point\s*:(.*?)(?=Examples that do not|Additional Note|\Z)', content[:last_not_earn], re.DOTALL | re.IGNORECASE)
            if earn_match:
                acceptable_bullets = parse_bullets_from_text(earn_match.group(1))

    # Fallback: try "Responses that earn" pattern (appears in Decision Rules section)
    if not acceptable_bullets:
        responses_earn = re.finditer(
            r'Responses that earn this point\s*:(.*?)(?=Responses that do not|Additional Note|Decision Rules|© 20|\Z)',
            content, re.DOTALL | re.IGNORECASE
        )
        for m in responses_earn:
            bullets = parse_bullets_from_text(m.group(1))
            acceptable_bullets.extend(bullets)
        acceptable_bullets = deduplicate(acceptable_bullets)

    if not unacceptable_bullets:
        responses_not_earn = re.finditer(
            r'Responses that do not earn this point\s*:(.*?)(?=Responses that earn|Additional Note|Examples|© 20|\Z)',
            content, re.DOTALL | re.IGNORECASE
        )
        for m in responses_not_earn:
            bullets = parse_bullets_from_text(m.group(1))
            unacceptable_bullets.extend(bullets)
        unacceptable_bullets = deduplicate(unacceptable_bullets)

    # Scoring notes
    scoring_notes = None
    note_match = re.search(r'Additional Notes?\s*:(.*?)(?=\n\nPart [A-G]|\Z)', content, re.DOTALL | re.IGNORECASE)
    if note_match:
        notes_text = re.sub(r'\s+', ' ', note_match.group(1)).strip()
        if notes_text:
            scoring_notes = notes_text[:500]

    return {
        "part_letter": part_letter,
        "point_value": point_value,
        "description": earn_criterion,
        "acceptable": acceptable_bullets,
        "unacceptable": unacceptable_bullets,
        "scoring_notes": scoring_notes,
    }


def extract_earn_criterion(content):
    """
    Extract the positive scoring criterion from 2025 new-format content.
    The 1-point criterion is typically a sentence starting with
    "Accurately", "States", "Correctly", "Proposes", "Uses", "Explains", "Identifies", etc.

    These appear in the right column of the scoring table, AFTER the left-column
    negative criterion ("Does not accurately...").
    """
    # Pattern: look for the positive criterion that follows the negative criterion
    # In 2025 format: "Does not [X]\n\n[Positive criterion]"
    # or just: "[Positive criterion]" starting with an earn-type verb

    # First approach: find the positive criterion after "Does not..." text
    # The structure in extracted text is: "Does not X\n\nPositive X"
    after_does_not = re.search(
        r'Does not [^\n]+(?:\n[^\n]+)*?\n\n([^\n]+(?:\n[^\n]{10,})*)',
        content,
        re.IGNORECASE
    )
    if after_does_not:
        candidate = after_does_not.group(1).strip()
        # Check if this looks like a positive criterion
        earn_verbs = r'^(?:Accurately|States|Correctly|Proposes|Uses|Explains|Identifies|Applies|Describes)'
        if re.match(earn_verbs, candidate, re.IGNORECASE):
            # Grab the full criterion including continuation lines
            desc = collect_criterion_text(content, after_does_not.start(1))
            if desc:
                return desc

    # Fallback: find any sentence starting with an earn verb
    earn_verbs = r'(?:Accurately|States|Correctly|Proposes|Uses|Explains|Identifies|Applies|Describes)'
    m = re.search(r'(?:^|\n)(' + earn_verbs + r'[^\n]{5,})', content, re.IGNORECASE)
    if m:
        desc = collect_criterion_text(content, m.start(1))
        if desc:
            return desc

    return ""


def collect_criterion_text(content, start_pos):
    """
    Starting at start_pos, collect the full criterion text including continuation lines.
    Stops at blank lines or section headers.
    Returns cleaned text string.
    """
    text = content[start_pos:]
    lines = text.split('\n')
    collected = []

    for i, line in enumerate(lines):
        stripped = line.strip()

        if i == 0:
            if stripped:
                collected.append(stripped)
            continue

        if not stripped:
            # Blank line - might be end of criterion or just formatting
            # If we have something, check next non-empty line
            if collected:
                # Look ahead for continuation
                future_lines = [l.strip() for l in lines[i+1:i+3] if l.strip()]
                if future_lines and not re.match(
                    r'^(?:Responses|Examples|Decision|Additional|Part [A-G]|0 points|1 point|© 20|AP®)',
                    future_lines[0], re.IGNORECASE
                ):
                    # Check if it's a sentence continuation (lowercase start, or prep)
                    if future_lines[0][0].islower() or future_lines[0].startswith('the '):
                        continue  # Skip blank, continue to next line
                break
        else:
            # Non-empty line - check if it's part of criterion or a new section
            if re.match(
                r'^(?:Responses|Examples|Decision|Additional|Part [A-G]|0 points|1 point|© 20|AP®|Does not|Reporting)',
                stripped, re.IGNORECASE
            ):
                break
            collected.append(stripped)

    result = ' '.join(collected).strip()
    result = re.sub(r'\s+', ' ', result)
    return result[:400] if result else ""


def extract_examples_section(content, patterns):
    """
    Extract bullet examples from content using the given regex patterns.
    Returns deduplicated list of bullet strings.
    """
    bullets = []
    for pat in patterns:
        for m in re.finditer(pat, content, re.DOTALL | re.IGNORECASE):
            section_text = m.group(1)
            bullets.extend(parse_bullets_from_text(section_text))
    return deduplicate(bullets)


def deduplicate(lst):
    """Remove duplicates preserving order."""
    seen = set()
    result = []
    for item in lst:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result


# ─────────────────────────────────────────────────────────────────────────────
# FALLBACK: Convert rubric_criteria to scoring_points
# ─────────────────────────────────────────────────────────────────────────────

def scoring_points_from_rubric_criteria(part):
    """
    Build scoring_points from existing rubric_criteria strings.
    Used when no scoring guidelines PDF is available.
    Returns a list with one (or more for 2-point parts) scoring_point object(s).
    """
    letter = part.get('letter', 'a')
    point_value = part.get('point_value', 1)
    rubric = part.get('rubric_criteria', [])

    if not rubric:
        return None

    # Clean individual items: remove curly quotes, clean up truncation artifacts
    cleaned_items = []
    for item in rubric:
        item = item.strip()
        # Fix curly quotes to straight quotes
        item = item.replace('\u201c', '"').replace('\u201d', '"')
        item = item.replace('\u2018', "'").replace('\u2019', "'")
        # Remove leading "1 pt: " prefix
        item = re.sub(r'^1\s*pt[:\s]\s*', '', item).strip()
        if item:
            cleaned_items.append(item)

    if not cleaned_items:
        return None

    main_desc = cleaned_items[0]
    alternative_texts = cleaned_items[1:]

    # Build alternatives
    alternatives = []
    for item in alternative_texts:
        if item and len(item) > 5:
            alternatives.append({
                "required_elements": [item],
                "correct_example": item
            })

    if not alternatives:
        alternatives = [{
            "required_elements": [main_desc],
            "correct_example": ""
        }]

    if point_value == 2:
        # 2-point parts (e.g., 2025 FRQ1 part F argumentation)
        return [
            {
                "point_id": f"{letter}1",
                "point_value": 1,
                "description": f"Partial credit (1 pt): {main_desc}",
                "alternatives": alternatives[:len(alternatives)//2 + 1] if alternatives else [{"required_elements": [main_desc], "correct_example": ""}],
                "wrong_examples": [],
                "common_traps": []
            },
            {
                "point_id": f"{letter}2",
                "point_value": 1,
                "description": f"Full credit (2 pts): {main_desc}",
                "alternatives": alternatives[len(alternatives)//2:] if len(alternatives) > 1 else alternatives,
                "wrong_examples": [],
                "common_traps": ["Must use a specific research finding to accurately explain the psychological concept"]
            }
        ]

    return [{
        "point_id": f"{letter}1",
        "point_value": point_value,
        "description": main_desc,
        "alternatives": alternatives,
        "wrong_examples": [],
        "common_traps": []
    }]


# ─────────────────────────────────────────────────────────────────────────────
# BUILD scoring_points FROM PDF DATA
# ─────────────────────────────────────────────────────────────────────────────

def build_scoring_point_from_pdf_part(part, pdf_part_data, format_type="old"):
    """
    Build scoring_point(s) list from parsed PDF data for one part.
    Returns: list of scoring_point dicts
    """
    letter = part.get('letter', 'a')
    point_value = part.get('point_value', 1)

    description = pdf_part_data.get('description', '')
    if not description:
        concept = pdf_part_data.get('concept_name', '')
        if concept:
            description = f"Response must correctly apply {concept} to the scenario."

    acceptable = pdf_part_data.get('acceptable', [])
    unacceptable = pdf_part_data.get('unacceptable', [])

    # Build alternatives from acceptable examples
    alternatives = []
    for bullet in acceptable:
        if bullet and len(bullet) > 5:
            alternatives.append({
                "required_elements": [bullet],
                "correct_example": bullet
            })

    if not alternatives:
        alternatives = [{
            "required_elements": [description] if description else ["Correct response required"],
            "correct_example": ""
        }]

    wrong_examples = [b for b in unacceptable if b and len(b) > 5][:5]
    common_traps = []

    # For 2-point parts
    if point_value == 2:
        sp1 = {
            "point_id": f"{letter}1",
            "point_value": 1,
            "description": f"Partial credit (1 pt): Uses evidence from the study but does not fully explain how the concept is supported or refuted.",
            "alternatives": alternatives[:max(1, len(alternatives)//2)],
            "wrong_examples": wrong_examples,
            "common_traps": []
        }
        sp2 = {
            "point_id": f"{letter}2",
            "point_value": 1,
            "description": f"Full credit (2 pts): Uses specific evidence from the study to accurately explain how the results support or refute the psychological concept.",
            "alternatives": alternatives[max(1, len(alternatives)//2):] or alternatives,
            "wrong_examples": [],
            "common_traps": ["Must accurately interpret results — not just cite evidence", "The psychological concept or hypothesis must be explicitly identified in the AP Psychology CED"]
        }
        return [sp1, sp2]

    return [{
        "point_id": f"{letter}1",
        "point_value": point_value,
        "description": description,
        "alternatives": alternatives,
        "wrong_examples": wrong_examples,
        "common_traps": common_traps
    }]


def build_scoring_point_2025(part, pdf_part_data):
    """
    Build scoring_point(s) for 2025 format.

    Uses:
    - PDF for the description (positive criterion from right column header)
    - rubric_criteria for examples, with heuristic classification of earn/not-earn
      (because 2025 PDFs have interleaved two-column tables that make extraction unreliable)
    """
    letter = part.get('letter', 'a')
    point_value = part.get('point_value', 1)

    # Get description from PDF (e.g., "Accurately identifies the research method...")
    description = pdf_part_data.get('description', '')

    # Get rubric criteria and classify each as earn/not-earn
    rubric = part.get('rubric_criteria', [])
    alternatives = []
    wrong_examples = []

    for i, item in enumerate(rubric):
        item = item.strip()
        item = item.replace('\u201c', '"').replace('\u201d', '"')
        item = item.replace('\u2018', "'").replace('\u2019', "'")
        item = re.sub(r'^1\s*pt[:\s]\s*', '', item).strip()
        if not item or len(item) < 5:
            continue

        if i == 0:
            # First item is the main criterion description
            if not description:
                description = item
            continue

        # Classify: use heuristics to detect "not earn" items
        if looks_like_wrong_example(item):
            wrong_examples.append(item)
        else:
            alternatives.append({
                "required_elements": [item],
                "correct_example": item
            })

    # Also incorporate clearly-good examples from PDF if PDF parsing worked
    pdf_acceptable = pdf_part_data.get('acceptable', [])
    existing_texts = {a['correct_example'] for a in alternatives}
    for b in pdf_acceptable:
        if b and len(b) > 5 and b not in existing_texts:
            # Verify this doesn't look like a wrong example
            if not looks_like_wrong_example(b):
                alternatives.append({
                    "required_elements": [b],
                    "correct_example": b
                })

    if not alternatives:
        alternatives = [{
            "required_elements": [description or "Correct response required"],
            "correct_example": ""
        }]

    if point_value == 2:
        sp1 = {
            "point_id": f"{letter}1",
            "point_value": 1,
            "description": "Partial credit (1 pt): Uses evidence from the study but does not fully explain how the concept is supported or refuted, or explains without using a specific research finding.",
            "alternatives": alternatives[:max(1, len(alternatives)//2)],
            "wrong_examples": wrong_examples[:3],
            "common_traps": []
        }
        sp2 = {
            "point_id": f"{letter}2",
            "point_value": 1,
            "description": "Full credit (2 pts): Uses a specific result from the study to accurately explain how the results support or refute the psychological concept, with correctly interpreted evidence.",
            "alternatives": alternatives[max(1, len(alternatives)//2):] or alternatives,
            "wrong_examples": [],
            "common_traps": ["Must accurately interpret results — not just cite evidence", "Must explicitly identify the psychological concept/theory from the AP Psychology CED"]
        }
        return [sp1, sp2]

    return [{
        "point_id": f"{letter}1",
        "point_value": point_value,
        "description": description,
        "alternatives": alternatives,
        "wrong_examples": wrong_examples[:5],
        "common_traps": []
    }]


def looks_like_wrong_example(text):
    """
    Return True if the text looks like a wrong/not-earn example rather than a correct answer.

    Indicators of wrong examples in AP Psych 2025 scoring guidelines:
    - Starts with "The response does not..."
    - Contains "does not accurately", "is not", "no identification"
    - Contains phrases indicating they got something wrong
    - Is a quotation that contains clearly incorrect content
    """
    text_lower = text.lower()

    # Clear "does not earn" patterns
    if re.match(r'^the response does not', text_lower):
        return True
    if re.match(r'^the response includes no', text_lower):
        return True
    if 'does not accurately' in text_lower:
        return True
    if 'not accurately' in text_lower:
        return True

    # Quoted wrong answers (e.g., "The researchers used a correlational study.")
    # These are harder to identify — we rely on context/position
    # If it's a quote that contains "case study", "correlational", "survey" etc.
    # when the question is about experiments, it's likely wrong
    if text.startswith('"') or text.startswith('\u201c'):
        wrong_keywords = ['case study', 'correlational', 'survey method', 'naturalistic', 'studied memory']
        if any(kw in text_lower for kw in wrong_keywords):
            return True

    return False


# ─────────────────────────────────────────────────────────────────────────────
# MAIN PROCESSING
# ─────────────────────────────────────────────────────────────────────────────

def process_frq_file(filename, year, set_num, frq_num):
    """Process a single released FRQ JSON file."""
    json_path = os.path.join(FRQ_DIR, filename)
    if not os.path.exists(json_path):
        print(f"    JSON not found: {json_path}")
        return False

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    json_parts = data.get('parts', [])
    n_parts = len(json_parts)

    if n_parts == 0:
        print(f"    No parts found")
        return False

    # Try to get PDF data
    pdf_text = get_pdf_text(year, set_num)
    pdf_parts_data = []

    if pdf_text:
        is_new_format = year >= 2025
        try:
            if is_new_format:
                pdf_parts_data = parse_new_format(pdf_text, frq_num, n_parts)
            else:
                pdf_parts_data = parse_old_format(pdf_text, frq_num, n_parts)
            print(f"    Parsed {len(pdf_parts_data)} parts from PDF ({'new' if is_new_format else 'old'} format)")
        except Exception as e:
            print(f"    Error parsing PDF: {e}")
            import traceback
            traceback.print_exc()
            pdf_parts_data = []

    modified = False

    for i, part in enumerate(json_parts):
        scoring_points = None

        # For 2025 format: use PDF for description, rubric_criteria for examples
        # (because 2025 tables have interleaved columns that make bullet extraction unreliable)
        if year >= 2025 and pdf_parts_data and i < len(pdf_parts_data):
            try:
                scoring_points = build_scoring_point_2025(
                    part, pdf_parts_data[i]
                )
            except Exception as e:
                letter = part.get('letter', '?')
                print(f"    Error building 2025 SP for part {letter}: {e}")

        # For old format (2021-2024): use PDF data
        elif pdf_parts_data and i < len(pdf_parts_data):
            try:
                scoring_points = build_scoring_point_from_pdf_part(
                    part, pdf_parts_data[i],
                    format_type="old"
                )
            except Exception as e:
                letter = part.get('letter', '?')
                print(f"    Error building SP for part {letter}: {e}")

        # Fall back to rubric_criteria
        if not scoring_points:
            scoring_points = scoring_points_from_rubric_criteria(part)
            if scoring_points and pdf_parts_data:
                print(f"    Part {part.get('letter', '?')}: using rubric_criteria fallback")

        if scoring_points:
            if 'rubric_criteria' in part:
                del part['rubric_criteria']
            part['scoring_points'] = scoring_points
            modified = True

    if modified:
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write('\n')
        return True

    return False


def process_gen_file(filename):
    """
    Process a generated (psych-gen-*) FRQ file using rubric_criteria fallback.
    """
    json_path = os.path.join(FRQ_DIR, filename)
    if not os.path.exists(json_path):
        return False

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    modified = False

    for part in data.get('parts', []):
        if 'scoring_points' in part and part['scoring_points']:
            continue

        sp = scoring_points_from_rubric_criteria(part)
        if sp:
            if 'rubric_criteria' in part:
                del part['rubric_criteria']
            part['scoring_points'] = sp
            modified = True

    if modified:
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write('\n')
        return True

    return False


def get_gen_files():
    """Get all psych-gen-*.json files."""
    gen_files = [
        fn for fn in os.listdir(FRQ_DIR)
        if fn.startswith('psych-gen-') and fn.endswith('.json')
    ]
    return sorted(gen_files)


def main():
    print("=" * 65)
    print("AP Psychology FRQ Migration: rubric_criteria -> scoring_points")
    print("=" * 65)
    print()

    success = 0
    failed = 0

    print("Processing released exam FRQ files...")
    for filename, year, set_num, frq_num in FRQ_FILES:
        has_pdf = PDF_MAP.get((year, set_num)) is not None
        print(f"\n  {filename} (year={year}, set={set_num}, frq={frq_num}, has_pdf={has_pdf})")
        try:
            result = process_frq_file(filename, year, set_num, frq_num)
            if result:
                print(f"    OK - migrated")
                success += 1
            else:
                print(f"    -- no changes")
        except Exception as e:
            print(f"    ERROR: {e}")
            import traceback
            traceback.print_exc()
            failed += 1

    print("\nProcessing generated (psych-gen-*) FRQ files...")
    for fn in get_gen_files():
        print(f"\n  {fn}")
        try:
            result = process_gen_file(fn)
            if result:
                print(f"    OK - migrated (rubric_criteria fallback)")
                success += 1
            else:
                print(f"    -- no changes")
        except Exception as e:
            print(f"    ERROR: {e}")
            failed += 1

    # Verification pass
    print()
    print("=" * 65)
    print(f"Results: {success} migrated, {failed} errors")
    print()
    print("VERIFICATION:")

    total_parts = 0
    parts_with_sp = 0
    parts_with_rc = 0

    for fn in sorted(os.listdir(FRQ_DIR)):
        if not fn.endswith('.json') or fn == 'manifest.json':
            continue
        json_path = os.path.join(FRQ_DIR, fn)
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            for part in data.get('parts', []):
                total_parts += 1
                if 'scoring_points' in part and part['scoring_points']:
                    parts_with_sp += 1
                if 'rubric_criteria' in part and part['rubric_criteria']:
                    parts_with_rc += 1
        except Exception as e:
            print(f"  Error reading {fn}: {e}")

    pct_sp = parts_with_sp / total_parts * 100 if total_parts else 0
    print(f"  Total parts: {total_parts}")
    print(f"  Have scoring_points: {parts_with_sp} ({pct_sp:.1f}%)")
    print(f"  Still have rubric_criteria: {parts_with_rc}")

    if parts_with_rc > 0:
        print("\n  Files still with rubric_criteria:")
        for fn in sorted(os.listdir(FRQ_DIR)):
            if not fn.endswith('.json') or fn == 'manifest.json':
                continue
            json_path = os.path.join(FRQ_DIR, fn)
            try:
                with open(json_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                for part in data.get('parts', []):
                    if 'rubric_criteria' in part and part['rubric_criteria']:
                        print(f"    {fn}: part ({part.get('letter', '?')})")
            except:
                pass


if __name__ == "__main__":
    main()
