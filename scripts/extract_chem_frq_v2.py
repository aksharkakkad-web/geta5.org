#!/usr/bin/env python3
"""
AP Chemistry FRQ Extractor v2
Extracts FRQ questions and scoring guidelines from PDFs into structured JSON files.
Uses page-level markers for robust question boundary detection.
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
        # Skip boilerplate lines
        if re.match(r'^[©\?]\s*20\d\d College Board', line_clean):
            continue
        if 'Visit College Board on the web' in line_clean:
            continue
        if 'AP Central is the official' in line_clean:
            continue
        if re.match(r'^AP\s*\??\s*Chemistry 20\d\d (Free-Response|Scoring)', line_clean):
            continue
        if re.match(r'^\d+\s*$', line_clean):  # lone page numbers
            continue
        cleaned.append(line)
    return '\n'.join(cleaned)


def split_questions_by_markers(pages, pdf_type='questions'):
    """
    Split pages into per-question blocks using 'Begin your response to QUESTION N' markers.
    Falls back to question-number detection if markers are absent.
    """
    blocks = {i: [] for i in range(1, 8)}
    current_q = None

    for pnum, raw_text in pages:
        text = remove_boilerplate(raw_text)
        if not text.strip():
            continue

        # Check for "Begin your response to QUESTION N"
        begin_match = re.search(r'Begin your response to QUESTION\s+(\d+)', text, re.IGNORECASE)
        if begin_match:
            current_q = int(begin_match.group(1))
            # Remove the marker from text
            text = re.sub(r'Begin your response to QUESTION\s+\d+\s+on this page\.?\s*', '', text, flags=re.IGNORECASE)

        # Check for "Continue your response to QUESTION N"
        cont_match = re.search(r'Continue your response to QUESTION\s+(\d+)', text, re.IGNORECASE)
        if cont_match:
            current_q = int(cont_match.group(1))
            text = re.sub(r'Continue your response to QUESTION\s+\d+\s+on this page\.?\s*', '', text, flags=re.IGNORECASE)

        # Remove GO ON TO THE NEXT PAGE
        text = re.sub(r'GO ON TO THE NEXT PAGE\.?\s*', '', text, flags=re.IGNORECASE)
        text = re.sub(r'STOP\s*END OF EXAM.*', '', text, flags=re.DOTALL | re.IGNORECASE)

        if current_q and 1 <= current_q <= 7:
            blocks[current_q].append(text.strip())

    # Join all pages for each question
    result = {}
    for q_num in range(1, 8):
        combined = '\n\n'.join([p for p in blocks[q_num] if p])
        if combined.strip():
            result[q_num] = combined.strip()

    # Fallback: if markers not found, split on question number pattern
    if len(result) < 3:
        result = split_questions_fallback(pages)

    return result


def split_questions_fallback(pages):
    """
    Fallback question splitting by question number at start of line.
    Only matches "N." where N is 1-7 at the very start of a paragraph.
    """
    full_text = '\n'.join([remove_boilerplate(p[1]) for p in pages])

    # Split on lines that start with "N." where N is 1-7
    # Use a more careful regex: line starts with digit 1-7 followed by period and space/newline
    parts = re.split(r'(?m)^([1-7])\.\s+', full_text)

    if len(parts) < 3:
        return {}

    result = {}
    # parts[0] is prefix, then [num, content, num, content, ...]
    i = 1
    while i < len(parts) - 1:
        try:
            num = int(parts[i])
            content = parts[i + 1] if i + 1 < len(parts) else ''
            if 1 <= num <= 7:
                result[num] = f"{num}. {content.strip()}"
        except (ValueError, IndexError):
            pass
        i += 2

    return result


def split_sg_by_markers(pages):
    """Split scoring guidelines into per-question blocks."""
    blocks = {i: [] for i in range(1, 8)}
    current_q = None

    # Try page-by-page approach
    for pnum, raw_text in pages:
        text = remove_boilerplate(raw_text)
        if not text.strip():
            continue

        # Check for "Question N: Long/Short Answer N points" pattern
        q_header = re.search(r'^Question\s+(\d+)\s*[:\-]?\s*(Long|Short)?\s*Answer', text, re.MULTILINE | re.IGNORECASE)
        if q_header:
            current_q = int(q_header.group(1))

        if current_q and 1 <= current_q <= 7:
            blocks[current_q].append(text.strip())

    result = {}
    for q_num in range(1, 8):
        combined = '\n\n'.join([p for p in blocks[q_num] if p])
        if combined.strip():
            result[q_num] = combined.strip()

    # Fallback: split whole text
    if len(result) < 3:
        full_text = '\n'.join([remove_boilerplate(p[1]) for p in pages])
        result = split_sg_fallback(full_text)

    return result


def split_sg_fallback(full_text):
    """Fallback SG splitting using Question N header pattern."""
    result = {}
    parts = re.split(r'(?m)^Question\s+(\d+)\s*[:\-]', full_text)

    if len(parts) < 3:
        # Try "Question N " pattern
        parts = re.split(r'Question\s+(\d+)\s+', full_text)

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

    return result


def extract_parts(q_text):
    """
    Extract parts (a), (b), (c)... from question text.
    Each part may have sub-parts (i), (ii), etc.
    Returns list of {letter, content} dicts.
    """
    # Split on main part letters: (a), (b), ... at start of line or after newline
    # The pattern \n(?=\([a-z]\)) works if there's a newline before the part
    # Also handle (a) right after stimulus with no newline
    parts_raw = re.split(r'\n(?=\([a-z]\))', q_text)

    if len(parts_raw) <= 1:
        # Try splitting anywhere
        parts_raw = re.split(r'(?=\([a-z]\))', q_text)

    parts = []
    for section in parts_raw:
        section = section.strip()
        if not section:
            continue
        m = re.match(r'^\(([a-z])\)\s*(.*)', section, re.DOTALL)
        if m:
            letter = m.group(1)
            content = m.group(2).strip()
            parts.append({'letter': letter, 'content': content})

    return parts


def extract_sg_parts(sg_text):
    """
    Extract per-part scoring from SG text.
    Returns dict of {letter: text}.
    """
    result = {}
    sections = re.split(r'\n(?=\([a-z]\))', sg_text)
    if len(sections) <= 1:
        sections = re.split(r'(?=\([a-z]\))', sg_text)

    for section in sections:
        section = section.strip()
        m = re.match(r'^\(([a-z])\)\s*(.*)', section, re.DOTALL)
        if m:
            letter = m.group(1)
            content = m.group(2).strip()
            result[letter] = content

    return result


def extract_rubric_criteria(sg_part_text):
    """Extract rubric criteria from SG text for one part."""
    criteria = []

    lines = sg_part_text.split('\n')
    buffer = []

    for line in lines:
        line = line.strip()
        if not line:
            if buffer:
                criteria.append(' '.join(buffer))
                buffer = []
            continue

        # Lines with point awards
        if re.search(r':\s*\d+\s*points?', line, re.IGNORECASE):
            if buffer:
                criteria.append(' '.join(buffer))
                buffer = []
            criteria.append(line)
        elif line.startswith('For ') and ':' in line:
            if buffer:
                criteria.append(' '.join(buffer))
                buffer = []
            buffer = [line]
        elif buffer:
            buffer.append(line)
        elif re.match(r'^[A-Z]', line) and len(line) > 20:
            # Looks like an answer line
            criteria.append(line)

    if buffer:
        criteria.append(' '.join(buffer))

    # If nothing found, take first 3 non-empty lines
    if not criteria:
        criteria = [l.strip() for l in sg_part_text.split('\n') if l.strip()][:4]

    # Deduplicate while preserving order
    seen = set()
    deduped = []
    for c in criteria:
        if c not in seen:
            seen.add(c)
            deduped.append(c)

    return deduped


def extract_scoring_notes(sg_text):
    """Extract scoring notes from SG text."""
    notes = []
    for line in sg_text.split('\n'):
        line = line.strip()
        if re.match(r'^Accept ', line, re.IGNORECASE):
            notes.append(line)
        elif re.match(r'^(Do not|Must|Note:|Sig fig)', line, re.IGNORECASE):
            notes.append(line)
        elif 'acceptable' in line.lower() and ':' in line:
            notes.append(line)

    return ' '.join(notes) if notes else None


def get_total_points(q_num, sg_text):
    """Extract total points for a question."""
    m = re.search(rf'Total for question\s+{q_num}\s+(\d+)\s*points?', sg_text, re.IGNORECASE)
    if m:
        return int(m.group(1))

    m = re.search(r'(?:Long|Short)\s+Answer\s+(\d+)\s*points?', sg_text[:500], re.IGNORECASE)
    if m:
        return int(m.group(1))

    # Default by question number
    return 10 if q_num <= 3 else 4


def get_point_value(sg_part_text, letter, default_total=None):
    """Get point value for a part."""
    total_m = re.search(rf'Total for part \({letter}\)\s+(\d+)\s*points?', sg_part_text, re.IGNORECASE)
    if total_m:
        return int(total_m.group(1))

    # Count "1 point" occurrences
    count = len(re.findall(r':\s*1\s*point\b', sg_part_text, re.IGNORECASE))
    if count > 0:
        return count

    return 1


def identify_units(q_text, sg_text):
    """Map question content to AP Chemistry units."""
    combined = (q_text + ' ' + sg_text).lower()

    unit_keywords = {
        1: ['atomic structure', 'electron configuration', 'periodic trend', 'ionization energy',
            'electronegativity', 'atomic radius', 'photoelectron', 'coulomb', 'orbital', 'subshell',
            'quantum', 'spectroscopy', 'emission spectrum', 'planck', 'bohr', 'photon'],
        2: ['lewis', 'bond angle', 'molecular geometry', 'vsepr', 'polarity', 'ionic bond',
            'covalent bond', 'formal charge', 'resonance', 'lattice energy', 'hybridization',
            'sp3', 'sp2', ' sp ', 'alloy', 'metallic', 'substitutional', 'interstitial',
            'oxidation number', 'oxidation state'],
        3: ['intermolecular', 'imf', 'hydrogen bond', 'london dispersion', 'dipole-dipole',
            'vapor pressure', 'boiling point', 'viscosity', 'surface tension', 'chromatography',
            'dissolution', 'miscible', 'solubility of gas', 'specific heat', 'heat capacity'],
        4: ['stoichiometry', 'limiting reagent', 'limiting reactant', 'mole ratio',
            'precipitation', 'net ionic equation', 'redox', 'oxidation-reduction',
            'electrochemistry', 'electrolysis', 'electroplating', 'half-reaction',
            'titration', 'volumetric', 'molarity', 'molar mass'],
        5: ['kinetics', 'rate law', 'rate constant', 'half-life', 'activation energy',
            'rate-determining step', 'reaction order', 'collision theory', 'reaction mechanism',
            'catalyst', 'arrhenius', 'integrated rate law', 'rate of appearance',
            'rate of disappearance'],
        6: ['thermodynamics', 'enthalpy', 'entropy', 'gibbs free energy', 'calorimetry',
            'hess', 'specific heat capacity', 'heat of formation', 'delta h', 'delta s', 'delta g',
            'endothermic', 'exothermic', 'calorimeter', 'bond energy', 'bond dissociation',
            'thermochemistry', 'standard enthalpy', 'heat of reaction'],
        7: ['equilibrium constant', 'le chatelier', 'kc', 'kp', 'ka', 'kb', 'ksp',
            'solubility product', 'reaction quotient', 'buffer solution', 'henderson-hasselbalch',
            'equivalence point', 'half-equivalence', 'weak acid', 'weak base', 'diprotic',
            'titration curve', 'equilibrium expression', 'equilibrium position'],
        8: ['acid-base', 'ph =', 'poh =', 'pka', 'pkb', 'buffer', 'weak acid dissociation',
            'strong acid', 'conjugate acid', 'conjugate base', 'neutralization',
            'amphoteric', 'polyprotic', 'acid dissociation', 'base dissociation',
            'autoionization of water'],
        9: ['gibbs', 'spontaneous', 'cell potential', 'standard reduction potential',
            'nernst equation', 'electrochemical', 'galvanic cell', 'voltaic cell',
            'faraday', 'thermodynamically favorable', 'delta g = -nfe',
            'electrolytic cell', 'standard cell potential'],
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
    """Generate a descriptive title."""
    combined = (q_text + ' ' + sg_text).lower()

    # Topic detection in priority order
    checks = [
        (['acid-base titration', 'titration curve', 'equivalence point', 'half-equivalence'], 'Acid-Base Titration & Buffer Chemistry'),
        (['buffer solution', 'henderson', 'pka'], 'Buffer Solutions & Acid-Base Equilibrium'),
        (['le chatelier', 'equilibrium constant', 'kc', 'reaction quotient'], "Equilibrium & Le Chatelier's Principle"),
        (['solubility product', 'ksp', 'molar solubility'], 'Solubility Equilibrium & Ksp'),
        (['rate law', 'rate constant', 'reaction order', 'integrated rate'], 'Chemical Kinetics & Rate Laws'),
        (['activation energy', 'arrhenius', 'catalyst'], 'Reaction Mechanisms & Kinetics'),
        (['galvanic cell', 'voltaic cell', 'cell potential', 'standard reduction potential'], 'Electrochemical Cells & Cell Potential'),
        (['electroplating', 'electrolysis', 'faraday', 'electrochemistry'], 'Electrochemistry & Redox Reactions'),
        (['enthalpy', 'calorimeter', 'specific heat', 'heat of reaction', 'thermochemistry'], 'Thermochemistry & Calorimetry'),
        (['gibbs free energy', 'delta g', 'spontaneous', 'thermodynamically favorable'], 'Thermodynamics & Gibbs Free Energy'),
        (['entropy', 'delta s', 'endothermic'], 'Entropy & Thermodynamics'),
        (['lewis', 'vsepr', 'bond angle', 'hybridization', 'molecular geometry'], 'Lewis Structures & Molecular Geometry'),
        (['intermolecular', 'imf', 'hydrogen bond', 'london dispersion'], 'Intermolecular Forces & Physical Properties'),
        (['atomic radius', 'ionization energy', 'electron configuration', 'coulomb'], 'Atomic Structure & Periodic Trends'),
        (['alloy', 'substitutional', 'interstitial', 'metallic bonding'], 'Metallic Bonding & Alloys'),
        (['stoichiometry', 'limiting reactant', 'mole ratio', 'yield'], 'Stoichiometry & Limiting Reagents'),
        (['gas law', 'ideal gas', 'pv = nrt', 'partial pressure'], 'Gas Laws & Properties'),
        (['oxidation state', 'redox', 'oxidation number'], 'Redox Reactions & Oxidation States'),
        (['chromatography', 'dissolution', 'solubility'], 'Solutions & Separation Techniques'),
        (['acid dissociation', 'weak acid', 'ph', 'poh', 'conjugate'], 'Acid-Base Chemistry'),
        (['equilibrium'], 'Chemical Equilibrium'),
    ]

    for keywords, title in checks:
        for kw in keywords:
            if kw in combined:
                return title

    # Unit-based fallback
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
    """Check if a part asks for drawing/sketching."""
    draw_keywords = [
        'draw', 'sketch', 'complete the lewis', 'lewis diagram', 'particulate diagram',
        'draw an arrow', 'draw a graph', 'draw the curve', 'plot', 'draw an x',
        'label', 'complete the diagram', 'draw a box', 'draw a particle'
    ]
    lower = part_text.lower()
    for kw in draw_keywords:
        if kw in lower:
            return True
    return False


def get_stimulus(q_text):
    """Extract stimulus text (everything before first part letter)."""
    # Find first occurrence of (a) or similar
    m = re.search(r'\([a-z]\)', q_text)
    if m:
        stimulus = q_text[:m.start()].strip()
        # Remove leading question number
        stimulus = re.sub(r'^\d+\.\s*', '', stimulus).strip()
        if len(stimulus) > 30:
            return stimulus
    return None


def build_frq_json(year, q_num, q_text, sg_text):
    """Build the JSON object for one FRQ."""
    q_id = f"chem-{year}-frq-{q_num}"

    total_pts = get_total_points(q_num, sg_text)
    units = identify_units(q_text, sg_text)
    title = get_title(q_text, sg_text, units)
    stimulus = get_stimulus(q_text)

    # Parse question parts
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
        # Minimal fallback
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
    """Process one year's questions and SG PDFs."""
    q_path = os.path.join(QUESTIONS_DIR, f'{year} chem frq.pdf')
    sg_path = os.path.join(SG_DIR, f'{year} chem sg.pdf')

    if not os.path.exists(q_path):
        print(f"  SKIP {year}: questions PDF not found")
        return []
    if not os.path.exists(sg_path):
        print(f"  SKIP {year}: scoring guidelines PDF not found")
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

        part_count = len(frq_json['parts'])
        print(f"  {filename}.json — {part_count} parts, {frq_json['total_points']} pts, units {frq_json['related_units']}")
        filenames.append(filename)

    return filenames


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    all_filenames = []

    for year in YEARS:
        filenames = process_year(year)
        all_filenames.extend(filenames)

    manifest_path = os.path.join(OUTPUT_DIR, 'manifest.json')
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(all_filenames, f, indent=2)

    print(f"\nDone! Generated {len(all_filenames)} FRQ files.")
    print(f"Manifest: {manifest_path}")
    return all_filenames


if __name__ == '__main__':
    main()
