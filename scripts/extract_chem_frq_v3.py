#!/usr/bin/env python3
"""
AP Chemistry FRQ Extractor v3
Robust extraction with correct main-part vs sub-part handling.
"""

import pdfplumber
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

QUESTIONS_DIR = r'C:\Ascendly\content-sources\frq-pdfs\ap-chemistry\questions'
SG_DIR = r'C:\Ascendly\content-sources\frq-pdfs\ap-chemistry\scoring-guidelines'
OUTPUT_DIR = r'C:\Ascendly\public\data\ap-chemistry\frq'

YEARS = [2014, 2015, 2016, 2017, 2018, 2019, 2021, 2022, 2023, 2024, 2025]

# Main part letters only — excludes roman numeral patterns (i, ii, iii, iv, v, vi, vii, viii, ix, x)
ROMAN_NUMERALS = {'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii'}
# Main parts are typically a-g for AP chem
MAIN_PART_PATTERN = re.compile(r'\n\(([a-h])\)', re.IGNORECASE)
MAIN_PART_PATTERN_LOOSE = re.compile(r'(?=\(([a-h])\))', re.IGNORECASE)


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
    """Remove PDF boilerplate lines."""
    lines = text.split('\n')
    cleaned = []
    for line in lines:
        stripped = line.strip()
        if not stripped:
            cleaned.append('')
            continue
        # Skip copyright/header lines
        skip_patterns = [
            r'^[©\?\uf0e9]\s*20\d\d College Board',
            r'^Visit College Board on the web',
            r'^AP Central is the official',
            r'^AP\s*[\?®]\s*Chemistry 20\d\d (Free-Response|Scoring)',
            r'^\d+\s*$',  # Standalone page numbers
        ]
        skip = False
        for pat in skip_patterns:
            if re.match(pat, stripped, re.IGNORECASE):
                skip = True
                break
        if not skip:
            cleaned.append(line)
    result = '\n'.join(cleaned)
    result = re.sub(r'\n{3,}', '\n\n', result)
    return result.strip()


def split_questions_by_markers(pages):
    """
    Split PDF pages into per-question blocks.
    Uses 'Begin your response to QUESTION N' / 'Continue your response to QUESTION N' markers.
    """
    blocks = {i: [] for i in range(1, 8)}
    current_q = None

    for pnum, raw_text in pages:
        text = remove_boilerplate(raw_text)
        if not text.strip():
            continue

        # Check for Begin/Continue markers
        begin_m = re.search(r'Begin your response to QUESTION\s+(\d+)', text, re.IGNORECASE)
        cont_m = re.search(r'Continue your response to QUESTION\s+(\d+)', text, re.IGNORECASE)

        if begin_m:
            current_q = int(begin_m.group(1))
        elif cont_m:
            current_q = int(cont_m.group(1))

        # Strip the markers from the text
        text = re.sub(r'(?:Begin|Continue) your response to QUESTION\s+\d+\s+on this page\.?\s*', '', text, flags=re.IGNORECASE)
        text = re.sub(r'GO ON TO THE NEXT PAGE\.?\s*', '', text, flags=re.IGNORECASE)
        text = re.sub(r'STOP\s*\n*END OF EXAM.*', '', text, flags=re.DOTALL | re.IGNORECASE)

        # Also strip directions page boilerplate
        text = re.sub(r'CHEMISTRY\s*\nSECTION II.*?(?=\d+\.)', '', text, flags=re.DOTALL)

        text = text.strip()
        if current_q and 1 <= current_q <= 7 and text:
            blocks[current_q].append(text)

    result = {}
    for q_num in range(1, 8):
        combined = '\n\n'.join([p for p in blocks[q_num] if p])
        if combined.strip():
            result[q_num] = combined.strip()

    if len(result) < 3:
        result = split_questions_fallback(pages)

    return result


def split_questions_fallback(pages):
    """
    Fallback: split on question number patterns at line start.
    Handles 2025 format where questions start with 'N. Answer the...' with no Begin marker.
    Each question is on its own page (or starts a new page).
    """
    # Strategy: each page starts a new question if it begins with "N." where N is 1-7
    result = {}
    current_q = None
    current_pages = []

    for pnum, raw_text in pages:
        text = remove_boilerplate(raw_text)
        if not text.strip():
            continue

        # Check if this page starts a new question
        # 2025 format: page starts with "N. " at very beginning
        first_line = text.split('\n')[0].strip() if text else ''
        q_start = re.match(r'^([1-7])\.\s+', first_line)
        if not q_start:
            # Try multiline: "N." at start of text block
            q_start = re.match(r'^([1-7])\.\s+', text.lstrip())

        if q_start:
            # Save previous question
            if current_q and current_pages:
                combined = '\n\n'.join(current_pages)
                existing = result.get(current_q, '')
                result[current_q] = (existing + '\n\n' + combined).strip() if existing else combined.strip()
            current_q = int(q_start.group(1))
            current_pages = [text]
        elif current_q:
            current_pages.append(text)

    # Save last question
    if current_q and current_pages:
        combined = '\n\n'.join(current_pages)
        existing = result.get(current_q, '')
        result[current_q] = (existing + '\n\n' + combined).strip() if existing else combined.strip()

    # If still no result, try whole-text split
    if len(result) < 3:
        full = '\n\n'.join([remove_boilerplate(p[1]) for p in pages])
        parts = re.split(r'(?m)^([1-7])\.\s+', full)
        i = 1
        while i < len(parts) - 1:
            try:
                num = int(parts[i].strip())
                content = parts[i + 1] if i + 1 < len(parts) else ''
                if 1 <= num <= 7:
                    existing = result.get(num, '')
                    result[num] = (existing + '\n\n' + content).strip() if existing else content.strip()
            except (ValueError, IndexError):
                pass
            i += 2

    return result


def split_sg_by_markers(pages):
    """Split scoring guidelines by question markers."""
    blocks = {i: [] for i in range(1, 8)}
    current_q = None

    for pnum, raw_text in pages:
        text = remove_boilerplate(raw_text)
        if not text.strip():
            continue

        # "Question N: Long/Short Answer N points" header
        q_header = re.search(r'^Question\s+(\d+)\s*[:\-]?\s*(?:Long|Short)?\s*Answer', text, re.MULTILINE | re.IGNORECASE)
        if q_header:
            current_q = int(q_header.group(1))

        if current_q and 1 <= current_q <= 7:
            blocks[current_q].append(text.strip())

    result = {}
    for q_num in range(1, 8):
        combined = '\n\n'.join([p for p in blocks[q_num] if p])
        if combined.strip():
            result[q_num] = combined.strip()

    if len(result) < 3:
        full = '\n\n'.join([remove_boilerplate(p[1]) for p in pages])
        result = split_sg_fallback(full)

    return result


def split_sg_fallback(full_text):
    """Fallback SG splitter."""
    result = {}
    # Try "Question N:" then "Question N " patterns
    for pattern in [r'(?m)^Question\s+(\d+)\s*:', r'Question\s+(\d+)\s+']:
        parts = re.split(pattern, full_text)
        if len(parts) >= 5:
            i = 1
            while i < len(parts) - 1:
                try:
                    num = int(parts[i].strip())
                    content = parts[i + 1] if i + 1 < len(parts) else ''
                    if 1 <= num <= 7:
                        result[num] = f"Question {num}: {content.strip()}"
                except (ValueError, IndexError):
                    pass
                i += 2
            if len(result) >= 3:
                break
    return result


def extract_parts(q_text):
    """
    Extract main parts (a)-(h) from question text.
    Sub-parts (i), (ii), etc. stay inside the parent part's content.

    Handles:
    - Standard format: (a), (b), (c)... — 2014-2024
    - Uppercase format: A., B., C... — 2025+
    - Chemical state symbol false positives: (g), (l), (s) in NO(g), H2O(l) etc.

    Key algorithm: collect ALL (a)-(h) at line starts, then filter to only keep
    those that form a valid sequential alphabet sequence starting from (a).
    Chemical state symbols (g), (l) etc. break the sequence and are discarded.
    """
    # Try uppercase format first (2025+): "A. " followed by text
    uppercase_sections = re.split(r'\n(?=[A-H]\.\s+[A-Za-z])', q_text)
    if len(uppercase_sections) > 2:
        parts = []
        for section in uppercase_sections:
            section = section.strip()
            m = re.match(r'^([A-H])\.\s+(.*)', section, re.DOTALL)
            if m:
                letter = m.group(1).lower()
                content = m.group(2).strip()
                parts.append({'letter': letter, 'content': content})
        if len(parts) >= 2:
            return parts

    # Standard format: find all (a)-(h) at start of lines
    lines = q_text.split('\n')
    candidates = []  # (line_index, letter, following_text)

    for i, line in enumerate(lines):
        stripped = line.strip()
        m = re.match(r'^\(([a-h])\)(.*)', stripped, re.IGNORECASE)
        if m:
            letter = m.group(1).lower()
            following = m.group(2).strip()
            candidates.append((i, letter, following))

    if not candidates:
        return []

    # Filter: keep only candidates that form a STRICT forward sequence
    # starting from 'a': a, b, c, d, e, f... (no jumps allowed)
    # This is the safest approach for AP Chem FRQs which always use consecutive letters
    selected = []
    expected_next = 'a'

    for line_idx, letter, following in candidates:
        if letter == expected_next:
            selected.append((line_idx, letter, following))
            next_ord = ord(expected_next) + 1
            expected_next = chr(next_ord) if next_ord <= ord('h') else 'z'
        # Do NOT allow jumps — strict sequential only

    if not selected:
        return []

    # Build parts from line ranges
    parts = []
    for idx, (line_idx, letter, _) in enumerate(selected):
        next_line_idx = selected[idx + 1][0] if idx + 1 < len(selected) else len(lines)
        part_lines = lines[line_idx:next_line_idx]
        first = part_lines[0].strip()
        first = re.sub(r'^\([a-h]\)\s*', '', first, flags=re.IGNORECASE)
        part_lines[0] = first
        content = '\n'.join(part_lines).strip()
        if content:
            parts.append({'letter': letter, 'content': content})

    return parts


def extract_sg_parts(sg_text):
    """
    Extract per-part SG text, keyed by part letter. Sub-parts stay with parent.

    Handles formats:
    - Standard: (a) For..., (b) For..., etc.
    - 2025 SG: A (i) For..., B (i) For..., etc.
    """
    result = {}

    # Standard format: split on \n(x) where x is a-h
    # Use simple newline + (x) pattern — less strict than question extraction
    # because SG doesn't have chemical state symbol false positives
    sections = re.split(r'\n(?=\([a-h]\))', sg_text)

    if len(sections) > 1:
        for section in sections:
            section = section.strip()
            m = re.match(r'^\(([a-h])\)\s*(.*)', section, re.DOTALL | re.IGNORECASE)
            if m:
                letter = m.group(1).lower()
                content = m.group(2).strip()
                result[letter] = content
        if result:
            return result

    # 2025 SG format: "A (i) For..." at start of line
    # Split on newline + single uppercase letter + whitespace
    sections_2025 = re.split(r'\n(?=[A-H]\s+(?:\(|For\b))', sg_text)
    if len(sections_2025) > 1:
        for section in sections_2025:
            section = section.strip()
            m = re.match(r'^([A-H])\s+(.*)', section, re.DOTALL)
            if m:
                letter = m.group(1).lower()
                content = m.group(2).strip()
                result[letter] = content

    return result


def extract_rubric_criteria(sg_part_text):
    """Extract rubric criteria from a part's SG text."""
    criteria = []
    current_criterion = []

    for line in sg_part_text.split('\n'):
        line_stripped = line.strip()
        if not line_stripped:
            if current_criterion:
                criteria.append(' '.join(current_criterion))
                current_criterion = []
            continue

        # Skip "Total for question/part" lines at the end
        if re.match(r'^Total for (question|part)', line_stripped, re.IGNORECASE):
            if current_criterion:
                criteria.append(' '.join(current_criterion))
                current_criterion = []
            continue

        # Skip cross-question bleed
        if re.match(r'^Question\s+\d+', line_stripped, re.IGNORECASE):
            break

        # Lines that award points
        if re.search(r':\s*\d+\s*points?$', line_stripped, re.IGNORECASE):
            if current_criterion:
                criteria.append(' '.join(current_criterion))
                current_criterion = []
            criteria.append(line_stripped)
        elif re.match(r'^For (the |a |an |correct|one)', line_stripped, re.IGNORECASE) and ':' in line_stripped:
            if current_criterion:
                criteria.append(' '.join(current_criterion))
                current_criterion = []
            current_criterion = [line_stripped]
        elif current_criterion:
            # Continuation of previous criterion
            current_criterion.append(line_stripped)
        elif re.match(r'^[A-Z]', line_stripped) and len(line_stripped) > 15:
            # Standalone answer/explanation line
            criteria.append(line_stripped)

    if current_criterion:
        criteria.append(' '.join(current_criterion))

    # Deduplicate, limit length
    seen = set()
    deduped = []
    for c in criteria:
        c_norm = c.strip()
        if c_norm and c_norm not in seen and len(c_norm) > 5:
            seen.add(c_norm)
            deduped.append(c_norm)

    return deduped[:12]  # cap at 12 criteria


def extract_scoring_notes(sg_part_text):
    """Extract accept/reject/sig-fig notes."""
    notes = []
    for line in sg_part_text.split('\n'):
        line_s = line.strip()
        if re.match(r'^Accept\b', line_s, re.IGNORECASE):
            notes.append(line_s)
        elif re.match(r'^(Do not accept|Must show|Note:|Sig fig|Error|Award)', line_s, re.IGNORECASE):
            notes.append(line_s)
        elif re.match(r'^Acceptable range', line_s, re.IGNORECASE):
            notes.append(line_s)

    return ' '.join(notes[:3]) if notes else None


def get_total_points(q_num, sg_text):
    """Extract total points from SG text."""
    m = re.search(rf'Total for question\s+{q_num}\s+(\d+)\s*points?', sg_text, re.IGNORECASE)
    if m:
        return int(m.group(1))
    m = re.search(r'(?:Long|Short)\s+Answer\s+(\d+)\s*points?', sg_text[:500], re.IGNORECASE)
    if m:
        return int(m.group(1))
    return 10 if q_num <= 3 else 4


def get_point_value(sg_part_text, letter):
    """Get point value for a part."""
    # "Total for part (x) N points"
    total_m = re.search(rf'Total for part \({re.escape(letter)}\)\s+(\d+)\s*points?', sg_part_text, re.IGNORECASE)
    if total_m:
        return int(total_m.group(1))

    # Count explicit "1 point" awards
    count = len(re.findall(r':\s*1\s*point\b', sg_part_text, re.IGNORECASE))
    if count > 0:
        return min(count, 6)  # reasonable cap

    return 1


def identify_units(q_text, sg_text):
    """Map question to AP Chemistry units."""
    combined = (q_text + ' ' + sg_text).lower()

    unit_keywords = {
        1: ['atomic structure', 'electron configuration', 'periodic trend', 'ionization energy',
            'electronegativity', 'atomic radius', 'photoelectron spectroscopy', 'coulomb',
            'orbital', 'quantum number', 'emission spectrum', 'planck', 'photon energy',
            'effective nuclear charge', 'zeff'],
        2: ['lewis structure', 'lewis diagram', 'bond angle', 'molecular geometry', 'vsepr',
            'formal charge', 'resonance structure', 'lattice energy', 'hybridization',
            'sp3', 'sp2', 'alloy', 'metallic bonding', 'substitutional alloy', 'interstitial alloy',
            'oxidation number', 'oxidation state', 'ionic compound'],
        3: ['intermolecular force', 'imf', 'hydrogen bond', 'london dispersion', 'dipole-dipole',
            'vapor pressure', 'boiling point', 'viscosity', 'surface tension', 'chromatography',
            'specific heat capacity', 'heat capacity', 'molar absorptivity', "beer-lambert"],
        4: ['stoichiometry', 'limiting reactant', 'limiting reagent', 'mole ratio', 'theoretical yield',
            'precipitation reaction', 'net ionic equation', 'redox reaction', 'oxidation-reduction',
            'electrochemistry', 'electroplating', 'electrolysis', 'half-reaction',
            'titration', 'molarity', 'molar mass', 'moles of'],
        5: ['kinetics', 'rate law', 'rate constant', 'half-life', 'activation energy',
            'rate-determining step', 'reaction order', 'collision theory', 'catalyst',
            'arrhenius equation', 'integrated rate', 'rate of appearance', 'rate of disappearance',
            'second order', 'first order', 'zero order'],
        6: ['enthalpy', 'entropy', 'gibbs', 'calorimetry', "hess's law", 'heat of formation',
            'standard enthalpy', 'endothermic', 'exothermic', 'calorimeter', 'bond energy',
            'thermochemistry', 'delta h', 'heat of reaction', 'q = mc'],
        7: ['equilibrium constant', 'le chatelier', 'reaction quotient',
            'ksp', 'solubility product', 'buffer solution', 'henderson-hasselbalch',
            'equivalence point', 'half-equivalence point', 'weak acid', 'weak base',
            'diprotic acid', 'equilibrium expression', 'kc', 'kp', 'common ion'],
        8: ['acid dissociation', 'base dissociation', 'pka', 'pkb', 'conjugate acid',
            'conjugate base', 'strong acid', 'strong base', 'autoionization', 'amphoteric',
            'polyprotic', 'titration curve', 'acid-base', 'ka =', 'kb =',
            'ph = ', 'poh = ', 'buffer capacity'],
        9: ['standard reduction potential', 'nernst equation', 'galvanic cell', 'voltaic cell',
            'faraday', 'thermodynamically favorable', 'delta g = -nfe', 'electrolytic cell',
            'standard cell potential', 'ecell', 'e° cell', 'spontaneous reaction'],
    }

    units = set()
    for unit_num, keywords in unit_keywords.items():
        for kw in keywords:
            if kw in combined:
                units.add(unit_num)
                break

    if not units:
        units.add(4)

    return sorted(list(units))


def get_title(q_text, sg_text, units):
    """Generate descriptive title from question content."""
    combined = (q_text + ' ' + sg_text).lower()

    checks = [
        # Most specific first
        (['acid-base titration', 'titration curve', 'equivalence point', 'half-equivalence point'],
         'Acid-Base Titration & Buffer Chemistry'),
        (['solubility product', 'ksp', 'molar solubility'],
         'Solubility Equilibrium & Ksp'),
        (['henderson-hasselbalch', 'buffer solution', 'buffer capacity'],
         'Buffer Solutions & Acid-Base Equilibrium'),
        (['le chatelier', 'equilibrium constant', 'kc', 'reaction quotient'],
         "Chemical Equilibrium & Le Chatelier's Principle"),
        (['integrated rate', 'rate-determining step', 'rate constant', 'activation energy', 'arrhenius'],
         'Chemical Kinetics & Rate Laws'),
        (['galvanic cell', 'voltaic cell', 'standard reduction potential', 'nernst'],
         'Electrochemical Cells & Cell Potential'),
        (['electroplating', 'electrolysis', 'faraday'],
         'Electrochemistry & Electrolysis'),
        (['hess', 'heat of formation', 'bond energy', 'thermochemistry', 'calorimeter', 'specific heat capacity'],
         'Thermochemistry & Calorimetry'),
        (['gibbs', 'thermodynamically favorable', 'spontaneous'],
         'Thermodynamics & Gibbs Free Energy'),
        (['intermolecular force', 'london dispersion', 'hydrogen bond', 'dipole-dipole'],
         'Intermolecular Forces & Physical Properties'),
        (['lewis structure', 'lewis diagram', 'vsepr', 'bond angle', 'hybridization'],
         'Lewis Structures & Molecular Geometry'),
        (['substitutional alloy', 'interstitial alloy', 'metallic bonding'],
         'Metallic Bonding & Alloys'),
        (['photoelectron spectroscopy', 'electron configuration', 'ionization energy', 'atomic radius'],
         'Atomic Structure & Periodic Trends'),
        (['stoichiometry', 'limiting reactant', 'limiting reagent', 'mole ratio'],
         'Stoichiometry & Limiting Reagents'),
        (['gas law', 'pv = nrt', 'ideal gas', 'partial pressure'],
         'Gas Laws & Properties'),
        (['oxidation state', 'oxidation number', 'redox'],
         'Redox Reactions & Oxidation States'),
        (['chromatography', 'Beer-Lambert', 'molar absorptivity'],
         'Solutions & Separation Techniques'),
        (['acid dissociation', 'weak acid', 'pka', 'conjugate'],
         'Acid-Base Chemistry'),
        (['entropy', 'delta s'],
         'Entropy & Thermodynamics'),
        (['equilibrium'],
         'Chemical Equilibrium'),
    ]

    for keywords, title in checks:
        for kw in keywords:
            if kw in combined:
                return title

    unit_titles = {
        1: 'Atomic Structure & Properties',
        2: 'Molecular Structure & Bonding',
        3: 'Intermolecular Forces & Properties',
        4: 'Chemical Reactions & Stoichiometry',
        5: 'Chemical Kinetics',
        6: 'Thermochemistry & Calorimetry',
        7: 'Chemical Equilibrium',
        8: 'Acid-Base Chemistry',
        9: 'Electrochemistry & Applications of Thermodynamics',
    }
    if units:
        return unit_titles.get(units[0], 'AP Chemistry Free Response')
    return 'AP Chemistry Free Response'


def requires_drawing(part_text):
    """Check if part asks for drawing/sketching."""
    draw_kw = ['draw', 'sketch', 'complete the lewis', 'complete the diagram', 'particulate diagram',
               'draw an arrow', 'draw the curve', 'draw a graph', 'plot the', 'draw an x',
               'draw a box', 'draw a particle', 'draw a lewis']
    lower = part_text.lower()
    return any(kw in lower for kw in draw_kw)


def get_stimulus(q_text):
    """Extract stimulus text before the first main part (a)."""
    # Find first (a), (b) etc.
    m = re.search(r'\n\([a-h]\)', q_text)
    if m:
        stimulus_raw = q_text[:m.start()].strip()
    else:
        m2 = re.search(r'\([a-h]\)', q_text)
        if m2:
            stimulus_raw = q_text[:m2.start()].strip()
        else:
            return None

    # Remove directions boilerplate
    stimulus_raw = re.sub(
        r'CHEMISTRY\s*\nSECTION II.*?(?:\d+ Questions.*?significant figures\.)',
        '', stimulus_raw, flags=re.DOTALL
    )
    stimulus_raw = re.sub(r'(?:CHEMISTRY|SECTION II|Time[—-]\d+ hour.*?)\n', '', stimulus_raw, flags=re.IGNORECASE)
    stimulus_raw = re.sub(r'Directions:.*?significant figures\.', '', stimulus_raw, flags=re.DOTALL)
    stimulus_raw = stimulus_raw.strip()

    if len(stimulus_raw) > 30:
        return stimulus_raw
    return None


def build_frq_json(year, q_num, q_text, sg_text):
    """Build JSON for one FRQ."""
    q_id = f"chem-{year}-frq-{q_num}"
    total_pts = get_total_points(q_num, sg_text)
    units = identify_units(q_text, sg_text)
    title = get_title(q_text, sg_text, units)
    stimulus = get_stimulus(q_text)

    q_parts = extract_parts(q_text)
    sg_parts = extract_sg_parts(sg_text)

    parts = []
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

    if not parts:
        parts = [{
            "letter": "a",
            "prompt": q_text.strip(),
            "point_value": total_pts,
            "rubric_criteria": [],
            "scoring_notes": None,
            "requires_drawing": False,
            "reference_image": None
        }]

    return {
        "id": q_id,
        "subject": "ap-chemistry",
        "year": year,
        "source": "released",
        "title": title,
        "frq_type": "multi_part_math",
        "related_units": units,
        "calculator_allowed": True,
        "total_points": total_pts,
        "stimulus": stimulus,
        "stimulus_image": None,
        "documents": None,
        "parts": parts
    }


def process_year(year):
    q_path = os.path.join(QUESTIONS_DIR, f'{year} chem frq.pdf')
    sg_path = os.path.join(SG_DIR, f'{year} chem sg.pdf')

    if not os.path.exists(q_path) or not os.path.exists(sg_path):
        print(f"  SKIP {year}: PDF missing")
        return []

    print(f"\nProcessing {year}...")

    q_pages = extract_pdf_pages(q_path)
    sg_pages = extract_pdf_pages(sg_path)

    q_blocks = split_questions_by_markers(q_pages)
    sg_blocks = split_sg_by_markers(sg_pages)

    print(f"  Q blocks: {sorted(q_blocks.keys())} | SG blocks: {sorted(sg_blocks.keys())}")

    filenames = []
    for q_num in range(1, 8):
        q_text = q_blocks.get(q_num, '')
        sg_text = sg_blocks.get(q_num, '')

        if not q_text and not sg_text:
            print(f"  SKIP Q{q_num}: no text")
            continue

        frq_json = build_frq_json(year, q_num, q_text, sg_text)

        filename = f"chem-{year}-frq-{q_num}"
        out_path = os.path.join(OUTPUT_DIR, f"{filename}.json")

        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(frq_json, f, indent=2, ensure_ascii=False)

        n_parts = len(frq_json['parts'])
        print(f"  {filename}.json — {n_parts} parts, {frq_json['total_points']} pts, units {frq_json['related_units']}")
        filenames.append(filename)

    return filenames


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    all_filenames = []

    for year in YEARS:
        all_filenames.extend(process_year(year))

    manifest_path = os.path.join(OUTPUT_DIR, 'manifest.json')
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(all_filenames, f, indent=2)

    print(f"\nDone! {len(all_filenames)} FRQ files generated.")
    print(f"Manifest: {manifest_path}")


if __name__ == '__main__':
    main()
