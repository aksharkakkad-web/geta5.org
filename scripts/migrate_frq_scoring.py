#!/usr/bin/env python3
"""
AP Chemistry FRQ Migration: rubric_criteria -> scoring_points
Handles all 11 years (2014-2025, no 2020).
"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

import json
import re
import PyPDF2
from pathlib import Path

PDF_DIR = Path("content-sources/frq-pdfs/ap-chemistry/scoring-guidelines")
FRQ_DIR = Path("public/data/ap-chemistry/frq")

YEARS = [2014, 2015, 2016, 2017, 2018, 2019, 2021, 2022, 2023, 2024, 2025]


# ============================================================
# PDF TEXT EXTRACTION
# ============================================================

def read_pdf_pages(year):
    """Return list of page text strings."""
    pdf_path = PDF_DIR / f"{year} chem sg.pdf"
    if not pdf_path.exists():
        return None
    try:
        with open(pdf_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            return [p.extract_text() or "" for p in reader.pages]
    except Exception as e:
        print(f"  ERROR reading PDF for {year}: {e}")
        return None


# ============================================================
# EXTRACT SCORING CRITERIA FROM PDF TEXT
# ============================================================

def extract_question_scoring(pdf_pages, question_num):
    """
    Extract all scoring text blocks for a given question number from PDF.
    Returns a dict: { part_letter: [list of scoring blocks] }
    Also handles sub-parts like (d)(i), (d)(ii).
    """
    full_text = "\n".join(pdf_pages)

    # Find the question section
    # Try to find "Question N" header
    q_start_patterns = [
        rf"Question\s+{question_num}[:\.]?\s*(?:Long|Short)\s+Answer",
        rf"Question\s+{question_num}\b",
        rf"\({question_num}\)\s",  # Sometimes formatted as (1), (2)...
    ]

    q_start = -1
    for pattern in q_start_patterns:
        m = re.search(pattern, full_text, re.IGNORECASE)
        if m:
            q_start = m.start()
            break

    if q_start == -1:
        return {}

    # Find end of this question (start of next question or end of text)
    next_q_patterns = [
        rf"Question\s+{question_num+1}[:\.]?\s*(?:Long|Short)\s+Answer",
        rf"Question\s+{question_num+1}\b",
        rf"Total\s+for\s+question\s+{question_num}\b",
    ]

    q_end = len(full_text)
    for pattern in next_q_patterns:
        m = re.search(pattern, full_text[q_start+10:], re.IGNORECASE)
        if m:
            q_end = q_start + 10 + m.start()
            break

    question_text = full_text[q_start:q_end]
    return parse_question_scoring(question_text)


def parse_question_scoring(question_text):
    """
    Parse scoring from question text. Returns dict:
    { 'a': [...criteria lines...], 'b': [...], 'di': [...], 'dii': [...], ... }
    """
    result = {}

    # Split into lines for processing
    lines = question_text.split('\n')

    current_key = None
    current_lines = []

    # Part patterns - two-level hierarchy
    # Level 1: (a), (b), (c) etc.
    # Level 2: (i), (ii), (iii) etc. (sub-parts)

    main_part_re = re.compile(r'^\s*\(([a-z])\)\s*(.*)')
    sub_part_re = re.compile(r'^\s*\(([ivxlc]+)\)\s*(.*)', re.IGNORECASE)

    current_main = None
    current_sub = None

    for line in lines:
        # Check for main part
        mm = main_part_re.match(line)
        if mm:
            # Save previous
            if current_key is not None:
                result[current_key] = current_lines[:]

            current_main = mm.group(1)
            current_sub = None
            current_key = current_main
            rest = mm.group(2).strip()
            current_lines = [rest] if rest else []
            continue

        if current_main is None:
            continue

        # Check for sub-part
        sm = sub_part_re.match(line)
        if sm:
            sub = sm.group(1).lower()
            # Save previous sub-part
            if current_key is not None:
                result[current_key] = current_lines[:]

            current_sub = sub
            current_key = f"{current_main}{sub}"
            rest = sm.group(2).strip()
            current_lines = [rest] if rest else []
            continue

        # Add line to current bucket
        if line.strip():
            current_lines.append(line.strip())

    # Save last
    if current_key is not None:
        result[current_key] = current_lines[:]

    return result


def find_scoring_lines(text_lines):
    """
    From a list of text lines for a part, find all scoring criteria.
    Returns list of scoring blocks, each with description and correct example.
    """
    # Patterns indicating a scoring line
    earned_patterns = [
        r'1 point is earned for',
        r'For the correct',
        r'For a correct',
        r'For a valid',
        r'For the correct answer',
        r'Accept one of the following',
        r'points?\s+(?:are|is) earned',
    ]

    scoring_blocks = []
    current_block = []
    in_block = False

    for line in text_lines:
        is_scoring_line = any(re.search(p, line, re.IGNORECASE) for p in earned_patterns)

        if is_scoring_line:
            if current_block:
                scoring_blocks.append(current_block[:])
            current_block = [line]
            in_block = True
        elif in_block:
            current_block.append(line)

    if current_block:
        scoring_blocks.append(current_block)

    return scoring_blocks


def extract_criterion_text(lines):
    """Extract the scoring criterion description from a block of lines."""
    # First try to find "1 point is earned for ..." pattern
    full = ' '.join(lines)

    m = re.search(r'1 point is earned for ([^\.]+)', full, re.IGNORECASE)
    if m:
        return m.group(1).strip()

    # Try "For the correct/valid ..."
    m = re.search(r'^For (the correct|a correct|a valid|the correct answer)[^\n]*', full, re.IGNORECASE)
    if m:
        return m.group(0).strip()

    # Return first non-empty line
    for line in lines:
        if line.strip():
            return line.strip()

    return "Provide a correct response"


def extract_correct_example(lines):
    """Extract the correct example/answer from a block of lines."""
    # Lines that contain actual content (answer text)
    content_lines = []

    for line in lines:
        line = line.strip()
        if not line:
            continue
        # Skip the scoring annotation lines
        if re.search(r'1 point is earned|point is earned for', line, re.IGNORECASE):
            continue
        if re.match(r'^For (the|a) (correct|valid)', line, re.IGNORECASE):
            continue
        content_lines.append(line)

    return ' '.join(content_lines[:3]).strip()  # Take first 3 content lines


# ============================================================
# BUILD SCORING_POINTS FROM PDF DATA
# ============================================================

def build_scoring_points_from_pdf(part, q_scoring_map, question_num, year):
    """
    Build scoring_points for a part using PDF-extracted scoring data.
    q_scoring_map: dict from parse_question_scoring()
    """
    letter = part['letter']
    point_value = part['point_value']

    # Get text for this part and any sub-parts
    part_keys = [k for k in q_scoring_map.keys() if k.startswith(letter)]

    if not part_keys:
        return None

    scoring_points = []
    point_counter = 0

    # Determine if this is a multi-subpart part
    has_subparts = any(len(k) > 1 for k in part_keys)

    if has_subparts:
        # Handle sub-parts
        # Sort by sub-part: a, ai, aii, aiii, ...
        sorted_keys = sorted(part_keys, key=lambda k: (k[0], len(k), k[1:]))

        for key in sorted_keys:
            lines = q_scoring_map[key]
            if not lines:
                continue

            # Find scoring criteria in these lines
            scoring_in_lines = find_scoring_in_lines(lines)

            for criterion in scoring_in_lines:
                point_counter += 1
                sub_id = key[len(letter):]  # Everything after the letter
                point_id = f"{letter}{sub_id}{point_counter}" if sub_id else f"{letter}{point_counter}"

                # Determine description and examples
                description = criterion.get('description', 'Provide a correct response')
                correct_example = criterion.get('correct_example', '')
                alternatives = criterion.get('alternatives', [])
                wrong_examples = criterion.get('wrong_examples', [])
                common_traps = criterion.get('common_traps', [])

                sp = {
                    "point_id": point_id,
                    "point_value": 1,
                    "description": description,
                    "alternatives": build_alternatives(criterion),
                    "wrong_examples": wrong_examples,
                    "common_traps": common_traps
                }
                scoring_points.append(sp)
    else:
        # Simple part
        lines = q_scoring_map.get(letter, [])
        if not lines:
            return None

        scoring_in_lines = find_scoring_in_lines(lines)

        for i, criterion in enumerate(scoring_in_lines):
            point_counter += 1
            point_id = f"{letter}{point_counter}"

            sp = {
                "point_id": point_id,
                "point_value": 1,
                "description": criterion.get('description', 'Provide a correct response'),
                "alternatives": build_alternatives(criterion),
                "wrong_examples": criterion.get('wrong_examples', []),
                "common_traps": criterion.get('common_traps', [])
            }
            scoring_points.append(sp)

    return scoring_points if scoring_points else None


def find_scoring_in_lines(lines):
    """
    Find individual scoring criteria in a list of lines.
    Returns list of criterion dicts.
    """
    criteria = []

    all_text = '\n'.join(lines)

    # Split by "1 point is earned" pattern
    # But also look for the "For the correct..." pattern used in newer PDFs

    # First approach: look for "1 point is earned for X"
    earned_matches = list(re.finditer(
        r'1 point is earned for ([^\n]+(?:\n(?!1 point)[^\n]+)*)',
        all_text, re.IGNORECASE
    ))

    # Second approach: look for "For the correct/valid X"
    for_matches = list(re.finditer(
        r'For (?:the correct|a correct|a valid)[^\n]+',
        all_text, re.IGNORECASE
    ))

    # Collect all preceding content (the answer text) before each scoring marker
    if earned_matches:
        full_lines = all_text.split('\n')

        # Split content around earned markers
        earned_positions = [(m.start(), m.end(), m.group(1).strip()) for m in earned_matches]

        for i, (start, end, criterion_desc) in enumerate(earned_positions):
            # Find the content before this scoring marker
            section_start = earned_positions[i-1][1] if i > 0 else 0
            content = all_text[section_start:start].strip()

            # Find alternatives
            alternatives = extract_alternatives(content)

            criteria.append({
                'description': clean_text(criterion_desc),
                'correct_example': extract_main_example(content),
                'alternatives': alternatives,
                'wrong_examples': [],
                'common_traps': []
            })
    elif for_matches:
        # Newer format
        for m in for_matches:
            criteria.append({
                'description': clean_text(m.group(0)),
                'correct_example': '',
                'alternatives': [],
                'wrong_examples': [],
                'common_traps': []
            })
    else:
        # Fallback: treat all content as a single criterion
        if any(l.strip() for l in lines):
            criteria.append({
                'description': 'Provide a correct response',
                'correct_example': ' '.join(l.strip() for l in lines if l.strip())[:200],
                'alternatives': [],
                'wrong_examples': [],
                'common_traps': []
            })

    return criteria


def extract_alternatives(text):
    """Extract 'Accept one of the following' alternatives."""
    if 'Accept one of the following' not in text and 'OR' not in text:
        return []

    alts = []
    # Look for bullet points
    bullets = re.findall(r'[•\-]\s*(.+?)(?=[•\-]|$)', text, re.DOTALL)
    for b in bullets:
        clean = b.strip().replace('\n', ' ')
        if clean:
            alts.append(clean[:200])

    # Look for OR alternatives
    if not alts:
        or_parts = re.split(r'\bOR\b', text, flags=re.IGNORECASE)
        if len(or_parts) > 1:
            alts = [p.strip()[:200] for p in or_parts if p.strip()]

    return alts[:4]  # Max 4 alternatives


def extract_main_example(text):
    """Extract the main correct answer example from content text."""
    # Clean up the text
    text = text.strip()

    # Remove bullet points and alternatives markers
    text = re.sub(r'Accept one of the following[:\s]*', '', text, flags=re.IGNORECASE)

    # Take first substantial line (likely to be the main answer)
    lines = [l.strip() for l in text.split('\n') if l.strip()]

    # Skip lines that look like they're just formatting/labels
    good_lines = []
    for line in lines:
        if re.match(r'^[•\-\*]', line):
            good_lines.append(line.lstrip('•-* '))
        elif len(line) > 10:
            good_lines.append(line)

    return ' '.join(good_lines[:3])[:300] if good_lines else ''


def build_alternatives(criterion):
    """Build alternatives array from criterion dict."""
    alts = criterion.get('alternatives', [])
    correct_ex = criterion.get('correct_example', '')
    description = criterion.get('description', '')

    required = [description] if description and description != 'Provide a correct response' else []
    if not required:
        required = ['Provide a correct response']

    if alts:
        return [{"required_elements": required, "correct_example": alt} for alt in alts]
    else:
        return [{"required_elements": required, "correct_example": correct_ex}]


def clean_text(text):
    """Clean up extracted text."""
    if not text:
        return 'Provide a correct response'
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove trailing punctuation
    text = text.rstrip(' .,')
    # Truncate if too long
    if len(text) > 300:
        text = text[:297] + '...'
    return text.strip()


# ============================================================
# RUBRIC-BASED SCORING POINTS (for files with rubric_criteria)
# ============================================================

def build_scoring_points_from_rubric(part):
    """
    Build scoring_points from existing rubric_criteria.
    """
    rubric = part.get('rubric_criteria', [])
    if not rubric:
        return None

    letter = part['letter']
    point_value = part['point_value']

    # Detect sub-part structure
    subpart_re = re.compile(r'^\(([ivx]+)\)\s*(.*)', re.IGNORECASE)
    has_subparts = any(subpart_re.match(l) for l in rubric)

    scoring_points = []

    if has_subparts:
        # Collect sub-parts
        current_sub = None
        subparts = {}
        order = []

        for line in rubric:
            match = subpart_re.match(line)
            if match:
                current_sub = match.group(1).lower()
                subparts[current_sub] = {
                    'first': match.group(2).strip(),
                    'rest': []
                }
                order.append(current_sub)
            elif current_sub:
                subparts[current_sub]['rest'].append(line)

        for sub in order:
            sp_data = subparts[sub]
            all_lines = ([sp_data['first']] if sp_data['first'] else []) + sp_data['rest']
            all_lines = [l for l in all_lines if l.strip()]

            if not all_lines:
                continue

            desc, alts, examples = parse_rubric_block(all_lines)

            sp = {
                "point_id": f"{letter}{sub}1",
                "point_value": 1,
                "description": desc,
                "alternatives": build_rubric_alternatives(desc, examples, alts),
                "wrong_examples": [],
                "common_traps": []
            }
            scoring_points.append(sp)

    else:
        # Simple part - split into point blocks
        blocks = []
        current = []

        for line in rubric:
            if re.match(r'^For ', line, re.IGNORECASE) and current:
                blocks.append(current[:])
                current = [line]
            else:
                current.append(line)
        if current:
            blocks.append(current)

        for i, block in enumerate(blocks):
            block = [l for l in block if l.strip()]
            if not block:
                continue

            desc, alts, examples = parse_rubric_block(block)

            sp = {
                "point_id": f"{letter}{i+1}",
                "point_value": 1,
                "description": desc,
                "alternatives": build_rubric_alternatives(desc, examples, alts),
                "wrong_examples": [],
                "common_traps": []
            }
            scoring_points.append(sp)

    return scoring_points if scoring_points else None


def parse_rubric_block(lines):
    """Parse a block of rubric lines into description, alternatives, and examples."""
    description = ''
    alternatives = []
    examples = []

    in_alts = False

    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue

        if i == 0:
            description = line
        elif 'Accept one of the following' in line:
            in_alts = True
            alternatives.append("Accept one of the following correct responses")
        elif line.startswith('•') and in_alts:
            alternatives.append(line.lstrip('• ').strip())
        elif re.match(r'^For (the|a) (correct|valid)', line, re.IGNORECASE):
            # Additional scoring point embedded
            examples.append(line)
        else:
            examples.append(line)

    if not description:
        description = lines[0] if lines else 'Provide a correct response'

    return description, alternatives, examples


def build_rubric_alternatives(description, examples, alternatives):
    """Build alternatives structure from rubric data."""
    required = [description] if description else ['Provide a correct response']

    if alternatives:
        alt_items = [a for a in alternatives if a != "Accept one of the following correct responses"]
        if alt_items:
            return [{"required_elements": required, "correct_example": alt} for alt in alt_items]

    correct_ex = ' '.join(e for e in examples if not re.match(r'^For (the|a)', e, re.IGNORECASE))[:200]
    return [{"required_elements": required, "correct_example": correct_ex.strip()}]


# ============================================================
# GENERATE SCORING POINTS FROM SCRATCH (for empty rubric, no PDF)
# ============================================================

def build_scoring_points_from_scratch(part, year, question_num, pdf_pages):
    """
    Build scoring_points from scratch using PDF text + part context.
    Used when rubric_criteria is empty.
    """
    letter = part['letter']
    point_value = part['point_value']
    prompt = part.get('prompt', '')

    # Try to get from PDF scoring map
    if pdf_pages:
        q_scoring = extract_question_scoring(pdf_pages, question_num)
        if q_scoring:
            sp = build_scoring_points_from_pdf(part, q_scoring, question_num, year)
            if sp:
                return sp

    # Generate based on prompt content and point value
    return generate_scoring_points_from_prompt(part)


def generate_scoring_points_from_prompt(part):
    """
    Generate scoring_points based on the part prompt when no other source is available.
    Uses the question type to create meaningful scoring criteria.
    """
    letter = part['letter']
    point_value = part['point_value']
    prompt = part.get('prompt', '').lower()

    scoring_points = []

    # Analyze the type of question from the prompt
    is_calculation = any(w in prompt for w in ['calculate', 'determine the value', 'compute', 'find the'])
    is_justify = any(w in prompt for w in ['justify', 'explain', 'why', 'because', 'reasoning'])
    is_predict = any(w in prompt for w in ['predict', 'will it be', 'compare'])
    is_identify = any(w in prompt for w in ['identify', 'name', 'write', 'balance'])
    is_draw = part.get('requires_drawing', False)

    # Check for sub-parts in the prompt
    subpart_pattern = re.compile(r'\(([ivx]+)\)', re.IGNORECASE)
    subparts = subpart_pattern.findall(prompt)

    if subparts and len(subparts) > 1:
        # Multi-subpart question
        for i, sub in enumerate(subparts):
            sub_lower = sub.lower()

            # Determine the type from context
            sub_prompt_parts = re.split(r'\([ivx]+\)', prompt, flags=re.IGNORECASE)
            sub_prompt = sub_prompt_parts[i+1].strip()[:200] if i+1 < len(sub_prompt_parts) else ''

            sub_is_calc = any(w in sub_prompt for w in ['calculate', 'determine', 'compute', 'value'])
            sub_is_justify = any(w in sub_prompt for w in ['justify', 'explain', 'why'])
            sub_is_identify = any(w in sub_prompt for w in ['identify', 'write', 'name', 'equation'])

            if sub_is_calc:
                description = f"Calculate the correct value for part ({letter})({sub_lower})"
                req_elements = [
                    "Correct mathematical setup or formula",
                    "Correct numerical answer with appropriate significant figures and units"
                ]
                common_traps = ["Incorrect significant figures", "Missing or wrong units"]
            elif sub_is_justify:
                description = f"Provide a correct answer with valid justification for part ({letter})({sub_lower})"
                req_elements = [
                    "State the correct answer (higher/lower/same, agree/disagree, etc.)",
                    "Provide a chemically valid justification connecting to the relevant principle"
                ]
                common_traps = ["Stating answer without justification", "Incorrect chemical reasoning"]
            elif sub_is_identify:
                description = f"Correctly identify/write the answer for part ({letter})({sub_lower})"
                req_elements = ["Correct identification, equation, or written response"]
                common_traps = []
            else:
                description = f"Provide a correct response for part ({letter})({sub_lower})"
                req_elements = ["Correct response addressing the question"]
                common_traps = []

            sp = {
                "point_id": f"{letter}{sub_lower}1",
                "point_value": 1,
                "description": description,
                "alternatives": [{"required_elements": req_elements, "correct_example": ""}],
                "wrong_examples": [],
                "common_traps": common_traps
            }
            scoring_points.append(sp)
    else:
        # Single point question
        if is_calculation:
            scoring_points.append({
                "point_id": f"{letter}1",
                "point_value": 1,
                "description": f"Calculate the correct value with setup and answer",
                "alternatives": [{
                    "required_elements": [
                        "Correct mathematical setup or formula application",
                        "Correct numerical answer with appropriate sig figs and units"
                    ],
                    "correct_example": ""
                }],
                "wrong_examples": ["Correct setup but arithmetic error", "Answer without units"],
                "common_traps": ["Incorrect significant figures", "Missing units"]
            })
        elif is_justify:
            scoring_points.append({
                "point_id": f"{letter}1",
                "point_value": 1,
                "description": f"State the correct answer with a valid chemical justification",
                "alternatives": [{
                    "required_elements": [
                        "Correct answer stated explicitly",
                        "Valid justification based on chemical principles"
                    ],
                    "correct_example": ""
                }],
                "wrong_examples": ["Correct answer but no justification", "Vague reasoning"],
                "common_traps": ["Stating answer without connecting to the underlying chemical principle"]
            })
        elif is_identify or is_predict:
            scoring_points.append({
                "point_id": f"{letter}1",
                "point_value": 1,
                "description": f"Provide the correct identification or prediction",
                "alternatives": [{
                    "required_elements": ["Correct identification, equation, or comparison"],
                    "correct_example": ""
                }],
                "wrong_examples": [],
                "common_traps": []
            })
        else:
            # Generic
            for i in range(point_value):
                scoring_points.append({
                    "point_id": f"{letter}{i+1}",
                    "point_value": 1,
                    "description": f"Provide a correct response for part ({letter})",
                    "alternatives": [{
                        "required_elements": ["Correct and complete response"],
                        "correct_example": ""
                    }],
                    "wrong_examples": [],
                    "common_traps": []
                })

    return scoring_points if scoring_points else None


# ============================================================
# MAIN PROCESSING
# ============================================================

def process_frq_file(json_path, year, question_num, pdf_pages, q_scoring_map):
    """Process a single FRQ JSON file."""
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"    ERROR reading JSON: {e}")
        return False

    modified = False

    for part in data.get('parts', []):
        letter = part['letter']

        # Skip drawing parts entirely
        if part.get('requires_drawing', False):
            continue

        # Skip parts that already have scoring_points
        if 'scoring_points' in part and part['scoring_points']:
            # Still clean up old rubric_criteria if present
            if 'rubric_criteria' in part:
                del part['rubric_criteria']
                modified = True
            continue

        # Determine how to build scoring_points
        rubric = part.get('rubric_criteria', [])
        sp = None

        if rubric:
            # Has rubric_criteria - use that
            sp = build_scoring_points_from_rubric(part)
        elif pdf_pages and q_scoring_map:
            # No rubric but PDF available - extract from PDF
            sp = build_scoring_points_from_pdf(part, q_scoring_map, question_num, year)

        if sp is None:
            # Fallback: generate from prompt
            sp = generate_scoring_points_from_prompt(part)

        if sp:
            part['scoring_points'] = sp
            if 'rubric_criteria' in part:
                del part['rubric_criteria']
            modified = True

    if modified:
        try:
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"    ERROR writing JSON: {e}")
            return False

    return False


def main():
    print("AP Chemistry FRQ Migration: rubric_criteria -> scoring_points")
    print("=" * 65)

    total_files = 0
    total_modified = 0
    total_errors = 0
    year_stats = {}

    for year in YEARS:
        print(f"\nYear {year}:")

        # Load PDF
        pdf_pages = read_pdf_pages(year)
        if pdf_pages:
            readable = sum(1 for p in pdf_pages if len(p.strip()) > 50)
            print(f"  PDF: {len(pdf_pages)} pages, {readable} readable")
        else:
            print(f"  PDF: not available")

        year_modified = 0

        # Process each question
        for q_num in range(1, 8):
            json_filename = f"chem-{year}-frq-{q_num}.json"
            json_path = FRQ_DIR / json_filename

            if not json_path.exists():
                print(f"  WARNING: {json_filename} not found")
                total_errors += 1
                continue

            total_files += 1

            # Extract scoring from PDF for this question
            q_scoring_map = {}
            if pdf_pages:
                q_scoring_map = extract_question_scoring(pdf_pages, q_num)

            result = process_frq_file(json_path, year, q_num, pdf_pages, q_scoring_map)

            if result:
                print(f"  ✓ {json_filename}")
                total_modified += 1
                year_modified += 1
            else:
                # Check if it has scoring_points already
                try:
                    data = json.loads(json_path.read_text(encoding='utf-8'))
                    has_any_sp = any(
                        'scoring_points' in p and p['scoring_points']
                        for p in data.get('parts', [])
                        if not p.get('requires_drawing', False)
                    )
                    if has_any_sp:
                        print(f"  = {json_filename} (already done)")
                    else:
                        print(f"  - {json_filename} (no changes)")
                except:
                    print(f"  - {json_filename}")

        year_stats[year] = year_modified

    print(f"\n{'=' * 65}")
    print(f"SUMMARY: {total_modified}/{total_files} files updated")
    print(f"By year: {year_stats}")

    # Verification pass
    print(f"\nVERIFICATION:")
    total_parts = 0
    parts_with_sp = 0
    parts_with_old_rc = 0

    for f in sorted(FRQ_DIR.glob('chem-*.json')):
        try:
            data = json.loads(f.read_text(encoding='utf-8'))
            for part in data.get('parts', []):
                if part.get('requires_drawing', False):
                    continue
                total_parts += 1
                if 'scoring_points' in part and part['scoring_points']:
                    parts_with_sp += 1
                if 'rubric_criteria' in part and part['rubric_criteria']:
                    parts_with_old_rc += 1
        except:
            pass

    print(f"  Non-drawing parts: {total_parts}")
    print(f"  Have scoring_points: {parts_with_sp} ({parts_with_sp/total_parts*100:.1f}%)")
    print(f"  Still have rubric_criteria: {parts_with_old_rc}")

    if parts_with_old_rc > 0:
        print(f"\nPARTS STILL WITH rubric_criteria:")
        for f in sorted(FRQ_DIR.glob('chem-*.json')):
            try:
                data = json.loads(f.read_text(encoding='utf-8'))
                for part in data.get('parts', []):
                    if part.get('requires_drawing', False):
                        continue
                    if 'rubric_criteria' in part and part['rubric_criteria']:
                        print(f"    {f.name}: part ({part['letter']})")
            except:
                pass


if __name__ == "__main__":
    main()
