#!/usr/bin/env python3
"""
AP Calculus AB FRQ Extractor
Extracts FRQ questions and scoring guidelines from PDFs into structured JSON files.
Adapted from extract_chem_frq_v2.py for Calculus AB specifics:
  - 6 FRQs per year (not 7)
  - FRQs 1-2: calculator_allowed=True (Part A)
  - FRQs 3-6: calculator_allowed=False (Part B)
  - frq_type: "multi_part_math" for all
  - total_points: 9 per FRQ
  - Calc AB curriculum units 1-8
"""

import pdfplumber
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

QUESTIONS_DIR = r'C:\Ascendly\content-sources\frq-pdfs\ap-calculus-ab\questions'
SG_DIR = r'C:\Ascendly\content-sources\frq-pdfs\ap-calculus-ab\scoring-guidelines'
OUTPUT_DIR = r'C:\Ascendly\public\data\ap-calculus-ab\frq'

# Only years that need NEW JSONs — 2005-2007
# (2008-2025 already have JSON files)
YEARS = [2005, 2006, 2007]

# Filename mapping: year -> question PDF filename
QUESTION_PDF_MAP = {
    2005: 'calc 05 frq.pdf',
    2006: 'calc 06 frq.pdf',
    2007: 'calc 07 frq.pdf',
    2008: 'calc 08 frq.pdf',
    2009: 'calc 09 frq.pdf',
    2010: 'calc 2010 frq.pdf',
    2011: 'calc 2011 frq.pdf',
    2012: 'calc 2012 frq.pdf',
    2013: 'calc 2013 frq.pdf',
    2014: 'calc 2014 frq.pdf',
    2015: 'calc 2015 frq.pdf',
    2016: 'calc 2016 frq.pdf',
}

# Filename mapping: year -> scoring guidelines PDF filename
SG_PDF_MAP = {
    2005: 'calc sg 05.pdf',
    2006: 'calc sg 06.pdf',
    2007: 'calc sg 07.pdf',
    2008: 'calc sg 08.pdf',
    2009: 'calc sg 09.pdf',
    2010: 'calc sg 10.pdf',
    2011: 'calc sg 11.pdf',
    2012: 'calc sg 12.pdf',
    2013: 'calc sg 13.pdf',
    2014: 'calc sg 14.pdf',
    2015: 'calc sg 15.pdf',
    2016: 'calc sg 16.pdf',
}

# Calc AB Unit names for reference
CALC_UNITS = {
    1: 'Limits and Continuity',
    2: 'Differentiation: Definition and Fundamental Properties',
    3: 'Differentiation: Composite, Implicit, and Inverse Functions',
    4: 'Contextual Applications of Differentiation',
    5: 'Analytical Applications of Differentiation',
    6: 'Integration and Accumulation of Change',
    7: 'Differential Equations',
    8: 'Applications of Integration',
}


def extract_pdf_pages(path):
    """Extract list of (page_num, text) from a PDF."""
    pages = []
    try:
        with pdfplumber.open(path) as pdf:
            for i, page in enumerate(pdf.pages):
                try:
                    text = page.extract_text() or ""
                    pages.append((i + 1, text))
                except Exception:
                    pages.append((i + 1, ""))
    except Exception as e:
        print(f"  ERROR opening {path}: {e}")
    return pages


def remove_boilerplate(text):
    """Remove PDF boilerplate from page text."""
    lines = text.split('\n')
    cleaned = []
    for line in lines:
        line_clean = line.strip()
        # Skip copyright lines
        if re.match(r'^[©\?]\s*20\d\d College Board', line_clean):
            continue
        if re.match(r'^\s*©\s*20\d\d', line_clean):
            continue
        if 'Copyright' in line_clean and 'College' in line_clean:
            continue
        if 'Visit College Board on the web' in line_clean:
            continue
        if 'Visit apcentral' in line_clean:
            continue
        if 'Visit the College Board' in line_clean:
            continue
        if 'AP Central is the official' in line_clean:
            continue
        if 'apcentral.collegeboard.com' in line_clean:
            continue
        if re.match(r'^AP\s*[\?©®]?\s*Calculus\s*AB\s*20\d\d', line_clean, re.IGNORECASE):
            continue
        if re.match(r'^AP Calculus AB 20\d\d Free-Response', line_clean, re.IGNORECASE):
            continue
        if re.match(r'^Free-Response Questions', line_clean, re.IGNORECASE):
            continue
        if re.match(r'^\d+\s*$', line_clean):  # lone page numbers
            continue
        cleaned.append(line)
    return '\n'.join(cleaned)


def clean_prompt(text):
    """Remove boilerplate that bleeds into part prompts."""
    # Remove "WRITE ALL WORK IN THE TEST BOOKLET" and everything after
    text = re.sub(r'\n?WRITE ALL WORK IN THE.*$', '', text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'\n?WRITE ALL WORK IN THE PINK.*$', '', text, flags=re.DOTALL | re.IGNORECASE)
    # Remove GO ON TO THE NEXT PAGE and everything after
    text = re.sub(r'\n?GO ON TO THE NEXT PAGE.*$', '', text, flags=re.DOTALL | re.IGNORECASE)
    # Remove copyright notice bleed
    text = re.sub(r'\n?Copyright\s*©.*$', '', text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'\n?Visit apcentral.*$', '', text, flags=re.DOTALL | re.IGNORECASE)
    # Remove "END OF PART" markers
    text = re.sub(r'\n?END OF PART.*$', '', text, flags=re.DOTALL | re.IGNORECASE)
    # Remove year + exam header that bleeds from next page
    text = re.sub(r'\n\d{4}\s*AP®?\s*CALCULUS.*$', '', text, flags=re.DOTALL | re.IGNORECASE)
    # Remove standalone page numbers at end
    text = re.sub(r'\s*-?\s*\d+\s*-?\s*$', '', text)
    return text.strip()


def split_questions_by_markers(pages):
    """
    Split pages into per-question blocks.
    Tries multiple strategies for different PDF formats.
    """
    blocks = {i: [] for i in range(1, 7)}
    current_q = None

    for pnum, raw_text in pages:
        text = remove_boilerplate(raw_text)
        if not text.strip():
            continue

        # Strategy 1: "Begin your response to QUESTION N"
        begin_match = re.search(r'Begin your response to QUESTION\s+(\d+)', text, re.IGNORECASE)
        if begin_match:
            current_q = int(begin_match.group(1))
            text = re.sub(r'Begin your response to QUESTION\s+\d+\s+on this page\.?\s*', '', text, flags=re.IGNORECASE)

        cont_match = re.search(r'Continue your response to QUESTION\s+(\d+)', text, re.IGNORECASE)
        if cont_match:
            current_q = int(cont_match.group(1))
            text = re.sub(r'Continue your response to QUESTION\s+\d+\s+on this page\.?\s*', '', text, flags=re.IGNORECASE)

        # Strategy 2: "QUESTION N" as a standalone header
        q_header = re.search(r'(?:^|\n)\s*QUESTION\s+(\d+)\s*(?:\n|$)', text, re.MULTILINE)
        if q_header and not begin_match and not cont_match:
            current_q = int(q_header.group(1))

        # Remove noise
        text = re.sub(r'GO ON TO THE NEXT PAGE\.?\s*', '', text, flags=re.IGNORECASE)
        text = re.sub(r'STOP\s*END OF EXAM.*', '', text, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r'END OF SECTION.*', '', text, flags=re.DOTALL | re.IGNORECASE)

        # Strategy 3 for older PDFs (2005-2007): detect multiple questions on the same page
        # These PDFs use "N. " format at the start of a paragraph
        if not begin_match and not cont_match and not q_header:
            # Try to detect "N. " at start of line where N is 1-6
            # This handles pages with multiple questions
            multi_q = re.split(r'(?m)^([1-6])\.\s+', text)
            if len(multi_q) > 2:
                # Multiple questions on this page
                i = 1
                while i < len(multi_q) - 1:
                    try:
                        num = int(multi_q[i].strip()) if multi_q[i].strip().isdigit() else None
                        if num and 1 <= num <= 6:
                            content = multi_q[i + 1] if i + 1 < len(multi_q) else ''
                            blocks[num].append(content.strip())
                            current_q = num
                    except (ValueError, IndexError):
                        pass
                    i += 2
                continue  # skip normal appending
            else:
                # Try to detect question number at line start
                line_q = re.match(r'^([1-6])\.\s+', text.strip())
                if line_q:
                    current_q = int(line_q.group(1))

        if current_q and 1 <= current_q <= 6:
            blocks[current_q].append(text.strip())

    result = {}
    for q_num in range(1, 7):
        combined = '\n\n'.join([p for p in blocks[q_num] if p])
        if combined.strip():
            result[q_num] = combined.strip()

    # Fallback if markers not found
    if len(result) < 3:
        result = split_questions_fallback(pages)

    return result


def split_questions_fallback(pages):
    """
    Fallback: split on question number pattern at start of block.
    Works for older PDFs where questions are just numbered paragraphs.
    """
    full_text = '\n'.join([remove_boilerplate(p[1]) for p in pages])

    # Try "N. " at start of line (question number followed by dot)
    parts = re.split(r'(?m)^([1-6])\.\s+', full_text)

    if len(parts) < 3:
        # Try just number pattern at start
        parts = re.split(r'(?m)^(PROBLEM\s+)?([1-6])[.:\)]\s+', full_text)

    result = {}
    if len(parts) >= 3:
        i = 1
        while i < len(parts) - 1:
            try:
                num_str = parts[i].strip()
                num = int(num_str) if num_str.isdigit() else None
                if num is None and i + 1 < len(parts):
                    num_str = parts[i + 1].strip()
                    num = int(num_str) if num_str.isdigit() else None
                    if num:
                        content = parts[i + 2] if i + 2 < len(parts) else ''
                        i += 3
                        if 1 <= num <= 6:
                            result[num] = f"{num}. {content.strip()}"
                        continue
                if num and 1 <= num <= 6:
                    content = parts[i + 1] if i + 1 < len(parts) else ''
                    result[num] = f"{num}. {content.strip()}"
            except (ValueError, IndexError):
                pass
            i += 2

    return result


def split_sg_by_markers(pages):
    """Split scoring guidelines into per-question blocks."""
    blocks = {i: [] for i in range(1, 7)}
    current_q = None

    for pnum, raw_text in pages:
        text = remove_boilerplate(raw_text)
        if not text.strip():
            continue

        # Check for "Question N:" or "AP Calculus AB Question N"
        q_header = re.search(r'^Question\s+(\d+)\s*[:\-]?', text, re.MULTILINE | re.IGNORECASE)
        if q_header:
            current_q = int(q_header.group(1))

        # Also detect "N points" header for scoring sections
        pts_header = re.search(r'(?:^|\n)(?:Question\s+)?(\d+)\s*[\.\-:]\s*\d+\s*points?', text, re.IGNORECASE | re.MULTILINE)
        if pts_header and not q_header:
            maybe_q = int(pts_header.group(1))
            if 1 <= maybe_q <= 6:
                current_q = maybe_q

        if current_q and 1 <= current_q <= 6:
            blocks[current_q].append(text.strip())

    result = {}
    for q_num in range(1, 7):
        combined = '\n\n'.join([p for p in blocks[q_num] if p])
        if combined.strip():
            result[q_num] = combined.strip()

    if len(result) < 3:
        full_text = '\n'.join([remove_boilerplate(p[1]) for p in pages])
        result = split_sg_fallback(full_text)

    return result


def split_sg_fallback(full_text):
    """Fallback SG splitting."""
    result = {}
    # Try "Question N:" pattern
    parts = re.split(r'(?m)^Question\s+(\d+)\s*[:\-]', full_text)

    if len(parts) < 3:
        parts = re.split(r'Question\s+(\d+)\s+', full_text)

    i = 1
    while i < len(parts) - 1:
        try:
            num = int(parts[i].strip())
            content = parts[i + 1] if i + 1 < len(parts) else ''
            if 1 <= num <= 6:
                result[num] = f"Question {num}: {content.strip()}"
        except (ValueError, IndexError):
            pass
        i += 2

    return result


def extract_parts(q_text):
    """
    Extract parts (a), (b), (c)... from question text.
    Returns list of {letter, content} dicts.
    """
    # Split on part letter markers: (a), (b), etc.
    parts_raw = re.split(r'\n(?=\([a-z]\))', q_text)

    if len(parts_raw) <= 1:
        parts_raw = re.split(r'(?=\([a-z]\))', q_text)

    parts = []
    seen_letters = set()
    for section in parts_raw:
        section = section.strip()
        if not section:
            continue
        m = re.match(r'^\(([a-z])\)\s*(.*)', section, re.DOTALL)
        if m:
            letter = m.group(1)
            if letter in seen_letters:
                continue
            seen_letters.add(letter)
            content = m.group(2).strip()
            # Clean up common suffixes
            content = re.sub(r'\s*\(No calculator is permitted\.\)\s*$', '', content, flags=re.IGNORECASE)
            # Clean boilerplate that bleeds in
            content = clean_prompt(content)
            parts.append({'letter': letter, 'content': content})

    return parts


def extract_sg_parts(sg_text):
    """Extract per-part scoring from SG text. Returns dict of {letter: text}."""
    result = {}
    sections = re.split(r'\n(?=\([a-z]\))', sg_text)
    if len(sections) <= 1:
        sections = re.split(r'(?=\([a-z]\))', sg_text)

    for section in sections:
        section = section.strip()
        m = re.match(r'^\(([a-z])\)\s*(.*)', section, re.DOTALL)
        if m:
            letter = m.group(1)
            if letter not in result:
                result[letter] = m.group(2).strip()

    return result


def extract_rubric_criteria(sg_part_text, expected_points=None):
    """Extract rubric criteria lines from SG text for one part.

    Handles both modern format (explicit "1 pt: ...") and older 2005-era format
    (N : {1 : criterion ... 1 : criterion}).
    """
    criteria = []

    # Strategy 1: modern format — lines with "1 pt:" or "N pt:"
    modern_matches = re.findall(r'\d+\s*pt\s*:.*', sg_part_text, re.IGNORECASE)
    if modern_matches:
        return [m.strip() for m in modern_matches if m.strip()]

    # Strategy 2: older format — "1 : criterion" lines
    # These appear as "1 : something" in the scoring guide
    old_format = re.findall(r'1\s*:\s*([^\n{}\d][^\n]+)', sg_part_text)
    if old_format:
        for c in old_format:
            c = c.strip()
            if len(c) > 10:
                criteria.append(c)
        if criteria:
            return criteria

    # Strategy 3: look for answer lines (lines with = or equations that aren't question text)
    answer_lines = []
    for line in sg_part_text.split('\n'):
        line = line.strip()
        if not line:
            continue
        # Skip pure question text lines (already in prompt)
        if re.match(r'^(Find|Write|Determine|Show|Calculate|Estimate|Explain|For|Is|Are|Let|Using)', line, re.IGNORECASE):
            continue
        # Lines that look like answers (contain =, numerical results, etc.)
        if ('=' in line or re.search(r'\d+\.\d+', line)) and len(line) > 10:
            answer_lines.append(line)

    if answer_lines:
        return answer_lines[:4]

    # Fallback: take first few non-empty lines
    lines = [l.strip() for l in sg_part_text.split('\n') if l.strip()]
    return lines[:3] if lines else ["See scoring guidelines"]


def extract_scoring_notes(sg_text):
    """Extract scoring notes from SG text."""
    notes = []
    for line in sg_text.split('\n'):
        line = line.strip()
        if re.match(r'^(Accept|Do not|Must|Note:|Sig fig|Alternate|Or equivalent)', line, re.IGNORECASE):
            notes.append(line)
        elif 'acceptable' in line.lower() and ':' in line:
            notes.append(line)
    return ' '.join(notes) if notes else None


def get_point_value(sg_part_text, letter):
    """Get point value for a part from SG text."""
    # Look for explicit total "Total for part (a): N points"
    total_m = re.search(rf'Total for part \({letter}\)\s+(\d+)\s*points?', sg_part_text, re.IGNORECASE)
    if total_m:
        return int(total_m.group(1))

    # Modern format: "1 pt:" occurrences
    modern_count = len(re.findall(r'\d+\s*pt\s*:', sg_part_text, re.IGNORECASE))
    if modern_count > 0:
        return modern_count

    # Older format: "N : {" notation where N is total points for this part
    # Pattern: digit followed by " : {" or " : ⎧"
    old_total = re.search(r'^(\d+)\s*:', sg_part_text[:50].strip())
    if old_total:
        n = int(old_total.group(1))
        if 1 <= n <= 6:
            return n

    # Count "1 :" occurrences which signal individual point criteria
    count_ones = len(re.findall(r'\b1\s*:', sg_part_text))
    if count_ones > 0:
        return min(count_ones, 6)

    # Count "1 point" occurrences
    count = len(re.findall(r':\s*1\s*point\b', sg_part_text, re.IGNORECASE))
    if count > 0:
        return count

    return 1


def identify_units(q_text, sg_text):
    """Map question content to AP Calculus AB units."""
    combined = (q_text + ' ' + sg_text).lower()

    unit_keywords = {
        1: ['limit', 'continuity', 'continuous', 'squeeze theorem', 'asymptote',
            'epsilon-delta', 'intermediate value', 'lim ', 'horizontal asymptote',
            'vertical asymptote', 'one-sided limit', 'limit of'],
        2: ['derivative', 'differentiation', 'power rule', 'product rule', 'quotient rule',
            'chain rule', 'differentiable', 'tangent line', 'slope of', "f'(", "g'(",
            'rate of change', 'linear approximation', 'linearization'],
        3: ['implicit differentiation', 'related rates', 'composite function',
            'inverse function', 'chain rule', 'd/dx', 'implicit', 'ln x',
            'arcsin', 'arctan', 'inverse trig'],
        4: ['position', 'velocity', 'acceleration', 'particle', 'motion',
            'speed', 'moving', 'distance traveled', 'displacement',
            'rate of change in context', 'approximation', 'l\'hopital',
            'l\'hôpital', 'related rate', 'moving along', 'linear motion'],
        5: ['mean value theorem', 'mvt', 'extreme value', 'critical point',
            'local maximum', 'local minimum', 'absolute maximum', 'absolute minimum',
            'increasing', 'decreasing', 'concave', 'inflection point',
            'first derivative test', 'second derivative test', "f''", "g''",
            'optimization', 'candidates test'],
        6: ['integral', 'antiderivative', 'riemann sum', 'definite integral',
            'indefinite integral', 'fundamental theorem', 'accumulation',
            'net change', 'average value', 'trapezoidal', 'midpoint rule',
            'left riemann', 'right riemann', '∫', 'area under', 'integral of'],
        7: ['differential equation', 'separation of variables', 'slope field',
            'exponential growth', 'exponential decay', 'dy/dx', 'particular solution',
            'general solution', 'initial condition', 'euler', 'logistic'],
        8: ['area between', 'volume', 'cross section', 'disk method', 'washer method',
            'shell method', 'revolution', 'region bounded', 'area of region',
            'solid of revolution', 'average value of function', 'accumulation function',
            'net change theorem', 'total distance', 'displacement'],
    }

    units = set()
    for unit_num, keywords in unit_keywords.items():
        for kw in keywords:
            if kw in combined:
                units.add(unit_num)
                break

    if not units:
        units.add(6)

    return sorted(list(units))


def get_title(q_text, sg_text, q_num):
    """Generate a descriptive title for Calc AB FRQ."""
    combined = (q_text + ' ' + sg_text).lower()

    checks = [
        (['particle', 'velocity', 'position', 'acceleration', 'moving along'], 'Particle Motion'),
        (['area between', 'region bounded', 'bounded by', 'area of region'], 'Area Between Curves'),
        (['volume', 'solid of revolution', 'cross section', 'disk method', 'washer'], 'Volume of Solids'),
        (['slope field', 'differential equation', 'particular solution', 'separation of variables'], 'Differential Equations & Slope Fields'),
        (['rate', 'riemann sum', 'left riemann', 'right riemann', 'trapezoidal'], 'Rate & Accumulation (Riemann Sums)'),
        (['accumulation', 'net change', 'fundamental theorem', 'definite integral'], 'Integration & Accumulation'),
        (['mean value theorem', 'mvt', 'rolle', 'extreme value theorem'], "Mean Value Theorem & Extrema"),
        (['local max', 'local min', 'absolute max', 'absolute min', 'critical', 'increasing', 'decreasing'], 'Analysis of Functions'),
        (['tangent line', 'normal line', 'linear approximation', 'linearization'], 'Tangent Lines & Linearization'),
        (['implicit differentiation', 'related rates'], 'Implicit Differentiation & Related Rates'),
        (['limit', 'continuity', 'l\'hopital', 'asymptote'], 'Limits & Continuity'),
        (['water', 'pump', 'drain', 'tank', 'flow'], 'Rate of Change — Fluid Flow'),
        (['temperature', 'cooling', 'heating', 'coffee', 'thermometer'], 'Temperature Modeling'),
        (['graph of f', 'graph of g', 'piecewise'], 'Graph Analysis'),
        (['table', 'selected values', 'data'], 'Function Analysis from Table'),
        (['average value', 'mean value of function'], 'Average Value of a Function'),
    ]

    for keywords, title in checks:
        for kw in keywords:
            if kw in combined:
                return title

    # FRQ number-based fallback
    if q_num in [1, 2]:
        return 'Applied Calculus — Part A (Calculator)'
    else:
        return 'Applied Calculus — Part B (No Calculator)'


def requires_drawing(part_text):
    """Check if a part asks for drawing/sketching."""
    draw_keywords = [
        'draw', 'sketch', 'complete the graph', 'label the graph',
        'on the axes', 'slope field', 'graph of', 'plot'
    ]
    lower = part_text.lower()
    for kw in draw_keywords:
        if kw in lower:
            return True
    return False


def get_stimulus(q_text):
    """Extract stimulus text (everything before first part letter)."""
    m = re.search(r'\([a-z]\)', q_text)
    if m:
        stimulus = q_text[:m.start()].strip()
        stimulus = re.sub(r'^\d+\.\s*', '', stimulus).strip()
        stimulus = re.sub(r'^QUESTION\s+\d+\s*', '', stimulus, flags=re.IGNORECASE).strip()
        stimulus = clean_prompt(stimulus)
        # Remove "CALCULUS AB / SECTION II" header bleed
        stimulus = re.sub(r'^CALCULUS AB.*?(?=\S)', '', stimulus, flags=re.DOTALL | re.IGNORECASE).strip()
        stimulus = re.sub(r'^SECTION II.*?(?=\S)', '', stimulus, flags=re.DOTALL | re.IGNORECASE).strip()
        if len(stimulus) > 20:
            return stimulus
    return None


def build_frq_json(year, q_num, q_text, sg_text):
    """Build the JSON object for one Calc AB FRQ."""
    q_id = f"calc-ab-{year}-frq-{q_num}"
    calc_allowed = q_num <= 2  # FRQs 1-2 are Part A (calculator allowed)

    units = identify_units(q_text, sg_text)
    title = get_title(q_text, sg_text, q_num)
    stimulus = get_stimulus(q_text)

    # Parse question parts
    q_parts = extract_parts(q_text)
    sg_parts = extract_sg_parts(sg_text)

    parts = []
    total_pts_from_parts = 0

    for p in q_parts:
        letter = p['letter']
        prompt = p['content']
        sg_section = sg_parts.get(letter, '')

        criteria = extract_rubric_criteria(sg_section) if sg_section else []
        notes = extract_scoring_notes(sg_section) if sg_section else None
        pt_val = get_point_value(sg_section, letter) if sg_section else 1
        needs_draw = requires_drawing(prompt)

        parts.append({
            "letter": letter,
            "prompt": prompt.strip(),
            "point_value": pt_val,
            "rubric_criteria": criteria,
            "scoring_notes": notes,
            "requires_drawing": needs_draw,
            "reference_image": None
        })
        total_pts_from_parts += pt_val

    if not parts:
        parts = [{
            "letter": "a",
            "prompt": q_text.strip(),
            "point_value": 9,
            "rubric_criteria": [],
            "scoring_notes": None,
            "requires_drawing": False,
            "reference_image": None
        }]

    # Calc AB FRQs are always 9 points total
    return {
        "id": q_id,
        "subject": "ap-calculus-ab",
        "year": year,
        "source": "released",
        "title": title,
        "frq_type": "multi_part_math",
        "related_units": units,
        "calculator_allowed": calc_allowed,
        "total_points": 9,
        "stimulus": stimulus,
        "stimulus_image": None,
        "documents": None,
        "parts": parts
    }


def process_year(year):
    """Process one year's questions and SG PDFs."""
    q_filename = QUESTION_PDF_MAP.get(year)
    sg_filename = SG_PDF_MAP.get(year)

    if not q_filename or not sg_filename:
        print(f"  SKIP {year}: no filename mapping defined")
        return []

    q_path = os.path.join(QUESTIONS_DIR, q_filename)
    sg_path = os.path.join(SG_DIR, sg_filename)

    if not os.path.exists(q_path):
        print(f"  SKIP {year}: questions PDF not found: {q_path}")
        return []
    if not os.path.exists(sg_path):
        print(f"  SKIP {year}: scoring guidelines PDF not found: {sg_path}")
        return []

    print(f"\nProcessing {year}...")

    q_pages = extract_pdf_pages(q_path)
    sg_pages = extract_pdf_pages(sg_path)

    q_blocks = split_questions_by_markers(q_pages)
    sg_blocks = split_sg_by_markers(sg_pages)

    print(f"  Q blocks: {sorted(q_blocks.keys())} | SG blocks: {sorted(sg_blocks.keys())}")

    filenames = []

    for q_num in range(1, 7):
        q_text = q_blocks.get(q_num, '')
        sg_text = sg_blocks.get(q_num, '')

        if not q_text and not sg_text:
            print(f"  SKIP Q{q_num}: no text found")
            continue

        frq_json = build_frq_json(year, q_num, q_text, sg_text)

        filename = f"calc-ab-{year}-frq-{q_num}"
        out_path = os.path.join(OUTPUT_DIR, f"{filename}.json")

        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(frq_json, f, indent=2, ensure_ascii=False)

        part_count = len(frq_json['parts'])
        calc = "calc" if frq_json['calculator_allowed'] else "no-calc"
        print(f"  {filename}.json — {part_count} parts, {frq_json['total_points']} pts, units {frq_json['related_units']}, [{calc}]")
        filenames.append(filename)

    return filenames


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    all_filenames = []

    for year in YEARS:
        filenames = process_year(year)
        all_filenames.extend(filenames)

    print(f"\nDone! Generated {len(all_filenames)} FRQ files for years {YEARS}.")
    return all_filenames


if __name__ == '__main__':
    main()
