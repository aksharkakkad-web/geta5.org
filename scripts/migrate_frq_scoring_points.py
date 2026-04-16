"""
Migrate AP Government FRQ JSON files from legacy rubric_criteria to structured scoring_points.
Reads College Board scoring guideline PDFs, extracts scoring criteria, and rebuilds each part.
"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

import json
import os
import re
import pymupdf

PDF_DIR = 'C:/Ascendly/content-sources/frq-pdfs/ap-government/scoring-guidelines/'
FRQ_DIR = 'C:/Ascendly/public/data/ap-government/frq/'

# ─────────────────────────────────────────────────────────────
#  PDF filename → (year, set)
# ─────────────────────────────────────────────────────────────
def pdf_key_for_json(year, set_num):
    """Return the PDF filename that covers this year/set."""
    if year == 2019:
        return 'gov sg 19.pdf'
    if set_num is None:
        return None
    set_str = f'set {set_num} ' if set_num else ''
    # e.g. 'gov sg set 1 24.pdf'
    return f'gov sg set {set_num} {str(year)[2:]}.pdf'

# ─────────────────────────────────────────────────────────────
#  Extract raw text per page from all PDFs once
# ─────────────────────────────────────────────────────────────
def load_all_pdfs():
    texts = {}
    for fn in os.listdir(PDF_DIR):
        if fn.endswith('.pdf'):
            doc = pymupdf.open(PDF_DIR + fn)
            texts[fn] = [page.get_text() for page in doc]
    return texts

# ─────────────────────────────────────────────────────────────
#  Find the page(s) for a given question number
# ─────────────────────────────────────────────────────────────
def find_question_pages(pages, question_num):
    """Return list of page texts belonging to Question question_num."""
    result = []
    in_q = False
    for text in pages:
        # Various header patterns College Board uses
        q_patterns = [
            rf'Question {question_num}[:\s]',
            rf'Question {question_num}\b',
        ]
        next_patterns = [
            rf'Question {question_num + 1}[:\s]',
            rf'Question {question_num + 1}\b',
        ]
        if any(re.search(p, text) for p in q_patterns):
            in_q = True
        elif in_q and any(re.search(p, text) for p in next_patterns):
            break
        if in_q:
            result.append(text)
    return result

# ─────────────────────────────────────────────────────────────
#  Parse scoring bullets for Q1 (Concept App), Q2 (Quant), Q3 (SCOTUS) parts
# ─────────────────────────────────────────────────────────────
def extract_bullets(text):
    """
    Extract bullet points from text.
    Handles two PDF layouts:
    1. Inline: '• Some text here'  (bullet and text on same line)
    2. Split:  '•'                  (bullet alone)
               'Some text here'     (text on next line)
    Multi-line bullet text (continuation lines) is joined until the next bullet/blank.
    """
    bullets = []
    lines = text.split('\n')
    i = 0
    while i < len(lines):
        stripped = lines[i].strip()
        if stripped == '•':
            # Split layout: content on next line(s)
            parts = []
            i += 1
            while i < len(lines):
                next_line = lines[i].strip()
                if next_line == '•' or next_line == '' or next_line.startswith('•'):
                    break
                # Stop at section headers / point counts
                if re.match(r'^\d+ point|^[A-Z]\.|^Part [A-Z]:|^Row [A-Z]', next_line):
                    break
                parts.append(next_line)
                i += 1
            combined = ' '.join(parts).strip()
            if combined:
                bullets.append(combined)
        elif stripped.startswith('•'):
            # Inline layout: bullet and text on same line
            bullet = stripped.lstrip('•').strip()
            # Collect continuation lines
            i += 1
            while i < len(lines):
                next_line = lines[i].strip()
                if next_line == '' or next_line.startswith('•') or next_line == '•':
                    break
                if re.match(r'^\d+ point|^[A-Z]\.|^Part [A-Z]:|^Row [A-Z]', next_line):
                    break
                bullet = bullet + ' ' + next_line
                i += 1
            if bullet:
                bullets.append(bullet)
        else:
            i += 1
    return bullets

def parse_simple_part(pages_text, part_letter):
    """
    For Q1/Q2/Q3 part A/B/C/D where each part earns exactly 1 point.
    Returns dict with description + alternatives.
    """
    combined = '\n'.join(pages_text)
    # Find the section for this part letter
    # Patterns: "A." or "A." at start, or "Part A:" or just the letter
    part_patterns = [
        rf'(?m)^\s*{part_letter}\.\s*\n',    # "A." on its own line
        rf'(?m)^\s*{part_letter}\.',           # "A." start of line
        rf'Part {part_letter}:',               # "Part A:"
    ]

    # Find where this part starts
    start_pos = -1
    for pat in part_patterns:
        m = re.search(pat, combined)
        if m:
            start_pos = m.start()
            break

    if start_pos == -1:
        return None

    # Find where next part starts (or end of Q section)
    next_letters = {'A': 'B', 'B': 'C', 'C': 'D', 'D': 'END'}
    next_letter = next_letters.get(part_letter, 'END')

    end_pos = len(combined)
    if next_letter != 'END':
        for pat in [
            rf'(?m)^\s*{next_letter}\.\s*\n',
            rf'(?m)^\s*{next_letter}\.',
            rf'Part {next_letter}:',
        ]:
            m = re.search(pat, combined[start_pos + 1:])
            if m:
                end_pos = start_pos + 1 + m.start()
                break

    section = combined[start_pos:end_pos]
    bullets = extract_bullets(section)
    return bullets

# ─────────────────────────────────────────────────────────────
#  Build scoring_points for Q1 — Concept Application (3 pts, 3 parts × 1pt)
# ─────────────────────────────────────────────────────────────
def build_q1_scoring_points(parts, pdf_pages):
    """parts is list of part dicts from JSON. pdf_pages is the Q1 text pages."""
    scoring_points = []
    part_letters = ['A', 'B', 'C']

    for i, part in enumerate(parts):
        letter = part_letters[i] if i < len(part_letters) else part['letter'].upper()
        bullets = parse_simple_part(pdf_pages, letter)

        alternatives = []
        if bullets:
            alternatives = [{
                'required_elements': [b],
                'correct_example': b
            } for b in bullets]
        else:
            # Fallback: extract from existing rubric_criteria
            rubric = part.get('rubric_criteria', [])
            if rubric:
                alternatives = [{
                    'required_elements': [rubric[0]],
                    'correct_example': rubric[0]
                }]

        sp = {
            'point_id': part['letter'],
            'point_value': 1,
            'description': part['prompt'],
            'alternatives': alternatives,
            'wrong_examples': [],
            'common_traps': []
        }
        scoring_points.append(sp)

    return scoring_points

# ─────────────────────────────────────────────────────────────
#  Build scoring_points for Q2 — Quantitative Analysis (4 pts, 4 parts × 1pt)
# ─────────────────────────────────────────────────────────────
def build_q2_scoring_points(parts, pdf_pages):
    """4 parts A-D, each 1pt."""
    scoring_points = []
    part_letters = ['A', 'B', 'C', 'D']

    for i, part in enumerate(parts):
        letter = part_letters[i] if i < len(part_letters) else part['letter'].upper()
        bullets = parse_simple_part(pdf_pages, letter)

        alternatives = []
        if bullets:
            alternatives = [{
                'required_elements': [b],
                'correct_example': b
            } for b in bullets]
        else:
            rubric = part.get('rubric_criteria', [])
            if rubric:
                alternatives = [{
                    'required_elements': [rubric[0]],
                    'correct_example': rubric[0]
                }]

        sp = {
            'point_id': part['letter'],
            'point_value': 1,
            'description': part['prompt'],
            'alternatives': alternatives,
            'wrong_examples': [],
            'common_traps': []
        }
        scoring_points.append(sp)

    return scoring_points

# ─────────────────────────────────────────────────────────────
#  Build scoring_points for Q3 — SCOTUS Comparison (4 pts)
#  Part a=1pt, Part b=tiered(1pt or 2pts), Part c=1pt
# ─────────────────────────────────────────────────────────────
def parse_q3_part_b(pdf_pages):
    """Parse the tiered part B of SCOTUS comparison."""
    combined = '\n'.join(pdf_pages)

    # Find Part B section
    b_start = -1
    for pat in [r'(?m)^\s*B\.\s*\n', r'(?m)^\s*B\.', r'Part B:']:
        m = re.search(pat, combined)
        if m:
            b_start = m.start()
            break

    if b_start == -1:
        return None, None

    # Find Part C to know where B ends
    c_end = len(combined)
    for pat in [r'(?m)^\s*C\.\s*\n', r'(?m)^\s*C\.', r'Part C:']:
        m = re.search(pat, combined[b_start + 1:])
        if m:
            c_end = b_start + 1 + m.start()
            break

    section = combined[b_start:c_end]

    tier1_bullets = []
    tier2_bullets = []

    # 2024+ format: "One point for describing..." / "Two points for correctly explaining..."
    # These patterns appear as descriptive text (not in the header line "B. 2 points")
    one_pt_m = re.search(r'(?i)\bone point for\b.*?(?=(?:\n\s*OR\s*\n|\btwo points?\b|$))', section, re.DOTALL)
    two_pt_m = re.search(r'(?i)\btwo points? for\b.*?(?=(?:\n[A-Z]\.|Total|Part [A-Z]|$))', section, re.DOTALL)

    if one_pt_m:
        tier1_bullets = extract_bullets(one_pt_m.group(0))
    if two_pt_m:
        tier2_bullets = extract_bullets(two_pt_m.group(0))

    # 2019-2021 format: "The first point is earned for..." / "The second point is earned for..."
    if not tier1_bullets:
        first_m = re.search(r'(?i)(?:first point|The first).*?(?=(?:Scoring Note|The second|second point))', section, re.DOTALL)
        if first_m:
            tier1_bullets = extract_bullets(first_m.group(0))

    if not tier2_bullets:
        second_m = re.search(r'(?i)(?:second point|The second).*', section, re.DOTALL)
        if second_m:
            tier2_bullets = extract_bullets(second_m.group(0))

    # Fallback: split all bullets roughly in half
    if not tier1_bullets and not tier2_bullets:
        all_bullets = extract_bullets(section)
        mid = max(1, len(all_bullets) // 2)
        tier1_bullets = all_bullets[:mid]
        tier2_bullets = all_bullets[mid:]

    return tier1_bullets, tier2_bullets

def build_q3_scoring_points(parts, pdf_pages):
    """SCOTUS: a=1pt, b=tiered(1 OR 2pts), c=1pt."""
    scoring_points = []

    for part in parts:
        letter = part['letter'].upper()

        if letter == 'B' or part.get('point_value', 1) == 2:
            # Tiered scoring
            tier1_bullets, tier2_bullets = parse_q3_part_b(pdf_pages)

            # 1-point tier
            alts1 = []
            if tier1_bullets:
                alts1 = [{'required_elements': [b], 'correct_example': b} for b in tier1_bullets]
            else:
                rubric = part.get('rubric_criteria', [])
                for r in rubric:
                    if '1 pt' in r or 'first' in r.lower():
                        alts1 = [{'required_elements': [r], 'correct_example': r}]

            sp1 = {
                'point_id': 'b1',
                'point_value': 1,
                'description': f'{part["prompt"]} (1 point — describe relevant fact/holding about the required Supreme Court case)',
                'alternatives': alts1,
                'wrong_examples': [],
                'common_traps': ['Describing only one case without explaining the comparison does not earn the 2-point tier']
            }

            # 2-point tier
            alts2 = []
            if tier2_bullets:
                alts2 = [{'required_elements': [b], 'correct_example': b} for b in tier2_bullets]
            else:
                rubric = part.get('rubric_criteria', [])
                for r in rubric:
                    if '2 pt' in r or 'second' in r.lower():
                        alts2 = [{'required_elements': [r], 'correct_example': r}]

            sp2 = {
                'point_id': 'b2',
                'point_value': 2,
                'description': f'{part["prompt"]} (2 points — correctly explains how facts of BOTH cases led to different/similar holdings)',
                'alternatives': alts2,
                'wrong_examples': [],
                'common_traps': ['Describing only one case earns 1 point, not 2', 'Must connect facts to different outcomes']
            }

            scoring_points.append(sp1)
            scoring_points.append(sp2)

        else:
            # Simple 1-point part (A or C)
            bullets = parse_simple_part(pdf_pages, letter)
            alts = []
            if bullets:
                alts = [{'required_elements': [b], 'correct_example': b} for b in bullets]
            else:
                rubric = part.get('rubric_criteria', [])
                if rubric:
                    alts = [{'required_elements': [rubric[0]], 'correct_example': rubric[0]}]

            sp = {
                'point_id': part['letter'],
                'point_value': 1,
                'description': part['prompt'],
                'alternatives': alts,
                'wrong_examples': [],
                'common_traps': []
            }
            scoring_points.append(sp)

    return scoring_points

# ─────────────────────────────────────────────────────────────
#  Build scoring_points for Q4 — Argument Essay (6 pts)
#  Row A=1pt, Row B=0-3 tiered, Row C=1pt, Row D=1pt
# ─────────────────────────────────────────────────────────────
def parse_essay_rows(pdf_pages):
    """Extract Row A, B, C, D content from the essay scoring pages."""
    combined = '\n'.join(pdf_pages)

    rows = {}
    row_names = ['A', 'B', 'C', 'D']

    for i, row in enumerate(row_names):
        next_row = row_names[i + 1] if i + 1 < len(row_names) else None

        # Find start of this row
        row_patterns = [
            rf'Row {row}\b',
            rf'Row {row}\s',
        ]
        start = -1
        for pat in row_patterns:
            m = re.search(pat, combined)
            if m:
                start = m.start()
                break

        if start == -1:
            continue

        # Find end
        end = len(combined)
        if next_row:
            for pat in [rf'Row {next_row}\b', rf'Row {next_row}\s']:
                m = re.search(pat, combined[start + 1:])
                if m:
                    end = start + 1 + m.start()
                    break

        rows[row] = combined[start:end]

    return rows

def build_q4_scoring_points(parts, pdf_pages):
    """Argument Essay: Row A=1pt, Row B=0-3, Row C=1pt, Row D=1pt."""
    rows = parse_essay_rows(pdf_pages)
    scoring_points = []

    for part in parts:
        letter = part['letter'].upper()
        pv = part.get('point_value', 1)

        if letter == 'A':
            # Row A: Thesis/Claim 0-1pt
            row_text = rows.get('A', '')
            earn_bullets = extract_bullets(row_text)
            # Filter to examples that earn the point
            earn_section = ''
            earn_m = re.search(r'Examples that earn this point:(.*?)(?:Additional Notes|$)', row_text, re.DOTALL | re.IGNORECASE)
            if earn_m:
                earn_section = earn_m.group(1)
                earn_bullets = extract_bullets(earn_section)

            dont_earn = []
            dont_m = re.search(r'Examples that do not earn this point:(.*?)(?:Examples that earn|$)', row_text, re.DOTALL | re.IGNORECASE)
            if dont_m:
                dont_earn = extract_bullets(dont_m.group(1))

            alts = [{'required_elements': ['Defensible claim establishing a line of reasoning'], 'correct_example': b} for b in earn_bullets] if earn_bullets else [{'required_elements': ['Defensible claim establishing a line of reasoning'], 'correct_example': 'Responds to the prompt with a defensible claim or thesis that establishes a line of reasoning.'}]

            sp = {
                'point_id': 'a',
                'point_value': 1,
                'description': 'Row A — Thesis/Claim: Respond to the prompt with a defensible claim or thesis that establishes a line of reasoning.',
                'alternatives': alts,
                'wrong_examples': dont_earn,
                'common_traps': ['Restating the prompt without making a claim', 'Describing the issue without taking a position']
            }
            scoring_points.append(sp)

        elif letter == 'B':
            # Row B: Evidence 0-3pt tiered
            row_text = rows.get('B', '')

            # Tier 1: 1 point
            tier1_alts = []
            tier1_m = re.search(r'(?i)(?:earn 1 point|Responses that earn 1 point)(.*?)(?:earn 2 point|Responses that earn 2 point|$)', row_text, re.DOTALL)
            if tier1_m:
                tier1_alts = extract_bullets(tier1_m.group(1))

            # Tier 2: 2 points
            tier2_alts = []
            tier2_m = re.search(r'(?i)(?:earn 2 point|Responses that earn 2 point)(.*?)(?:earn 3 point|Responses that earn 3 point|$)', row_text, re.DOTALL)
            if tier2_m:
                tier2_alts = extract_bullets(tier2_m.group(1))

            # Tier 3: 3 points
            tier3_alts = []
            tier3_m = re.search(r'(?i)(?:earn 3 point|Responses that earn 3 point)(.*?)(?:Additional Notes|$)', row_text, re.DOTALL)
            if tier3_m:
                tier3_alts = extract_bullets(tier3_m.group(1))

            # If parsing yielded little, pull all bullets and distribute
            all_bulls = extract_bullets(row_text)

            # Extract examples from row text
            examples_m = re.search(r'Examples of (?:acceptable )?(?:specific and relevant )?evidence.*?:(.*?)(?:Additional Notes|$)', row_text, re.DOTALL | re.IGNORECASE)
            example_bullets = extract_bullets(examples_m.group(1)) if examples_m else []

            def mk_alts(bullets_list, fallback_desc):
                if bullets_list:
                    return [{'required_elements': [b], 'correct_example': b} for b in bullets_list]
                return [{'required_elements': [fallback_desc], 'correct_example': fallback_desc}]

            sp0 = {
                'point_id': 'b0',
                'point_value': 0,
                'description': 'Row B — Evidence (0 points): No accurate evidence or evidence not relevant to the topic.',
                'alternatives': [{'required_elements': ['No accurate or relevant evidence'], 'correct_example': 'No points earned — evidence is inaccurate or irrelevant to the prompt.'}],
                'wrong_examples': [],
                'common_traps': []
            }

            sp1 = {
                'point_id': 'b1',
                'point_value': 1,
                'description': 'Row B — Evidence (1 point): Provides one piece of evidence relevant to the topic of the prompt.',
                'alternatives': mk_alts(tier1_alts or example_bullets[:2], 'One piece of evidence relevant to the topic.'),
                'wrong_examples': [],
                'common_traps': ['Evidence must be relevant but need not directly support a specific claim to earn 1 point']
            }

            sp2 = {
                'point_id': 'b2',
                'point_value': 2,
                'description': 'Row B — Evidence (2 points): Uses one piece of specific and relevant evidence to support the claim/thesis OR provides two pieces of relevant evidence.',
                'alternatives': mk_alts(tier2_alts or example_bullets[2:4], 'One specific and relevant piece of evidence supports the claim.'),
                'wrong_examples': [],
                'common_traps': ['To earn 2 points, the response must have earned Row A (claim/thesis)']
            }

            sp3 = {
                'point_id': 'b3',
                'point_value': 3,
                'description': 'Row B — Evidence (3 points): Uses two pieces of specific and relevant evidence to support the claim, one from a listed foundational document.',
                'alternatives': mk_alts(tier3_alts or example_bullets[4:], 'Two pieces of specific relevant evidence, one from a foundational document listed in the prompt.'),
                'wrong_examples': [],
                'common_traps': ['Must have earned Row A', 'One piece must be from a foundational document listed in the prompt']
            }

            scoring_points.extend([sp0, sp1, sp2, sp3])

        elif letter == 'C':
            # Row C: Reasoning 0-1pt
            row_text = rows.get('C', '')
            earn_bullets = []
            earn_m = re.search(r'Examples of reasoning.*?:(.*?)(?:Additional Notes|$)', row_text, re.DOTALL | re.IGNORECASE)
            if earn_m:
                earn_bullets = extract_bullets(earn_m.group(1))

            if not earn_bullets:
                earn_bullets = extract_bullets(row_text)

            alts = [{'required_elements': ['Reasoning that connects evidence to claim'], 'correct_example': b} for b in earn_bullets] if earn_bullets else [{'required_elements': ['Reasoning that connects evidence to claim'], 'correct_example': 'Explains how or why the evidence supports the claim or thesis.'}]

            sp = {
                'point_id': 'c',
                'point_value': 1,
                'description': 'Row C — Reasoning: Use reasoning (classification, process, causation, or comparison) to explain how or why the evidence supports the claim or thesis.',
                'alternatives': alts,
                'wrong_examples': [],
                'common_traps': ['Must have earned Row A and at least 2 points in Row B', 'Simply restating evidence without reasoning does not earn this point']
            }
            scoring_points.append(sp)

        elif letter == 'D':
            # Row D: Alternate Perspective 0-1pt
            row_text = rows.get('D', '')
            earn_bullets = []
            earn_m = re.search(r'Examples of acceptable responses.*?:(.*?)(?:Additional Notes|$)', row_text, re.DOTALL | re.IGNORECASE)
            if earn_m:
                earn_bullets = extract_bullets(earn_m.group(1))

            if not earn_bullets:
                earn_m2 = re.search(r'Responses that earn this point:(.*?)(?:Additional Notes|$)', row_text, re.DOTALL | re.IGNORECASE)
                if earn_m2:
                    earn_bullets = extract_bullets(earn_m2.group(1))

            dont_earn = []
            dont_m = re.search(r'Examples of responses that do not earn.*?:(.*?)(?:Responses that earn|Examples of acceptable|$)', row_text, re.DOTALL | re.IGNORECASE)
            if dont_m:
                dont_earn = extract_bullets(dont_m.group(1))

            alts = [{'required_elements': ['Describes alternate perspective AND rebuts/refutes it'], 'correct_example': b} for b in earn_bullets] if earn_bullets else [{'required_elements': ['Describes alternate perspective AND rebuts/refutes it'], 'correct_example': 'Must describe an alternate perspective AND rebut or refute that perspective.'}]

            sp = {
                'point_id': 'd',
                'point_value': 1,
                'description': 'Row D — Responds to Alternate Perspectives: Respond to an opposing or alternate perspective using rebuttal or refutation.',
                'alternatives': alts,
                'wrong_examples': dont_earn,
                'common_traps': ['Must have earned Row A', 'Simply identifying an alternate perspective without rebutting/refuting it does not earn this point']
            }
            scoring_points.append(sp)

    return scoring_points

# ─────────────────────────────────────────────────────────────
#  Main dispatcher: build scoring_points for any FRQ
# ─────────────────────────────────────────────────────────────
def build_scoring_points(frq_data, pdf_pages):
    """Dispatch to the correct builder based on frq_type."""
    frq_type = frq_data.get('frq_type', '')
    parts = frq_data.get('parts', [])

    if frq_type == 'concept_application':
        q_pages = find_question_pages(pdf_pages, 1)
        return build_q1_scoring_points(parts, q_pages if q_pages else pdf_pages)
    elif frq_type == 'quantitative_analysis':
        q_pages = find_question_pages(pdf_pages, 2)
        return build_q2_scoring_points(parts, q_pages if q_pages else pdf_pages)
    elif frq_type == 'scotus_comparison':
        q_pages = find_question_pages(pdf_pages, 3)
        return build_q3_scoring_points(parts, q_pages if q_pages else pdf_pages)
    elif frq_type == 'argument_essay':
        q_pages = find_question_pages(pdf_pages, 4)
        return build_q4_scoring_points(parts, q_pages if q_pages else pdf_pages)
    else:
        return None

# ─────────────────────────────────────────────────────────────
#  Per-part patch: merge scoring_points into each part
# ─────────────────────────────────────────────────────────────
def assign_scoring_points_to_parts(frq_data, scoring_points):
    """
    Distribute scoring_points back to each part in the JSON.
    Q1/Q2: 1 sp per part (point_id matches letter)
    Q3: part b gets both b1 and b2 sp
    Q4: parts get their row sps
    """
    frq_type = frq_data.get('frq_type', '')
    parts = frq_data.get('parts', [])

    if frq_type in ('concept_application', 'quantitative_analysis'):
        # 1-to-1 mapping: each part has one scoring_point by letter
        sp_by_id = {sp['point_id']: sp for sp in scoring_points}
        for part in parts:
            letter = part['letter']
            if letter in sp_by_id:
                # Remove rubric_criteria, add scoring_points list
                part.pop('rubric_criteria', None)
                part['scoring_points'] = [sp_by_id[letter]]

    elif frq_type == 'scotus_comparison':
        # Part a -> [a], part b -> [b1, b2], part c -> [c]
        sp_by_id = {}
        for sp in scoring_points:
            pid = sp['point_id']
            if pid not in sp_by_id:
                sp_by_id[pid] = []
            sp_by_id[pid].append(sp)

        for part in parts:
            letter = part['letter']
            if letter == 'b':
                sps = sp_by_id.get('b1', []) + sp_by_id.get('b2', [])
            else:
                sps = sp_by_id.get(letter, [])
            part.pop('rubric_criteria', None)
            part['scoring_points'] = sps

    elif frq_type == 'argument_essay':
        # Each part gets its row's scoring_points
        row_map = {'a': ['a'], 'b': ['b0', 'b1', 'b2', 'b3'], 'c': ['c'], 'd': ['d']}
        sp_by_id = {sp['point_id']: sp for sp in scoring_points}

        for part in parts:
            letter = part['letter']
            row_ids = row_map.get(letter, [letter])
            sps = [sp_by_id[rid] for rid in row_ids if rid in sp_by_id]
            part.pop('rubric_criteria', None)
            part['scoring_points'] = sps

    return frq_data

# ─────────────────────────────────────────────────────────────
#  Main migration loop
# ─────────────────────────────────────────────────────────────
def main():
    print('Loading PDFs...')
    all_pdf_texts = load_all_pdfs()

    # List all FRQ JSON files
    frq_files = sorted([f for f in os.listdir(FRQ_DIR) if f.endswith('.json') and f.startswith('gov-')])

    migrated = 0
    skipped = 0

    for fn in frq_files:
        filepath = FRQ_DIR + fn
        with open(filepath, 'r', encoding='utf-8') as f:
            frq_data = json.load(f)

        year = frq_data.get('year')
        set_num = frq_data.get('set')

        pdf_fn = pdf_key_for_json(year, set_num)

        if not pdf_fn or pdf_fn not in all_pdf_texts:
            print(f'  SKIP {fn} — no matching PDF ({pdf_fn})')
            skipped += 1
            continue

        pdf_pages = all_pdf_texts[pdf_fn]

        # Build scoring_points
        scoring_points = build_scoring_points(frq_data, pdf_pages)

        if scoring_points is None:
            print(f'  SKIP {fn} — unknown frq_type: {frq_data.get("frq_type")}')
            skipped += 1
            continue

        # Assign scoring_points to parts and remove rubric_criteria
        frq_data = assign_scoring_points_to_parts(frq_data, scoring_points)

        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(frq_data, f, indent=2, ensure_ascii=False)

        print(f'  OK  {fn}')
        migrated += 1

    print(f'\nDone: {migrated} migrated, {skipped} skipped.')

if __name__ == '__main__':
    main()
