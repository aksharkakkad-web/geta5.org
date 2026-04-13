#!/usr/bin/env python3
"""
AP Chemistry FRQ Extractor
Extracts FRQ questions and scoring guidelines from PDFs into structured JSON files.
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


def extract_pdf_text(path):
    """Extract all text from a PDF, returning list of page texts."""
    pages = []
    try:
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                try:
                    text = page.extract_text() or ""
                    pages.append(text)
                except Exception as e:
                    pages.append(f"[PAGE ERROR: {e}]")
    except Exception as e:
        print(f"  ERROR opening {path}: {e}")
    return pages


def clean_text(text):
    """Remove common PDF artifacts and normalize whitespace."""
    # Remove copyright lines
    text = re.sub(r'[©?]\s*20\d\d College Board\.?.*', '', text)
    text = re.sub(r'Visit College Board on the web:.*', '', text)
    text = re.sub(r'AP Central is the official.*', '', text)
    text = re.sub(r'GO ON TO THE NEXT PAGE\.?', '', text)
    text = re.sub(r'Continue your response to QUESTION \d+ on this page\.', '', text)
    text = re.sub(r'Begin your response to QUESTION \d+ on this page\.', '', text)
    text = re.sub(r'AP\? Chemistry 20\d\d Free-Response Questions', '', text)
    text = re.sub(r'AP\? Chemistry 20\d\d Scoring Guidelines', '', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = text.strip()
    return text


def get_full_text(pages):
    """Combine all pages into one text block."""
    return '\n\n'.join(pages)


def split_questions(full_text, year):
    """Split full question text into individual question blocks."""
    # Find question boundaries
    # Pattern: "1." or "Question 1" at line start
    # Try splitting on "Begin your response to QUESTION N"
    blocks = {}

    # Split on question number patterns
    # Pattern used in most years: question starts with number followed by period or dot
    parts = re.split(r'\n(?=\d+\.\s)', full_text)

    if len(parts) < 7:
        # Try alternate split pattern
        parts = re.split(r'(?=^(?:QUESTION\s*)?\d+[\.\s])', full_text, flags=re.MULTILINE)

    for part in parts:
        part = part.strip()
        if not part:
            continue
        # Check if this starts with a question number
        m = re.match(r'^(\d+)[\.\s]', part)
        if m:
            num = int(m.group(1))
            if 1 <= num <= 7:
                blocks[num] = part

    return blocks


def split_sg_questions(full_text):
    """Split scoring guidelines into per-question blocks."""
    blocks = {}
    # Pattern: "Question N:" or "Question N "
    parts = re.split(r'\n(?=Question\s+\d+[:\s])', full_text)

    for part in parts:
        part = part.strip()
        if not part:
            continue
        m = re.match(r'^Question\s+(\d+)', part, re.IGNORECASE)
        if m:
            num = int(m.group(1))
            if 1 <= num <= 7:
                blocks[num] = part

    # If that didn't work, try splitting on "Question N: Long/Short Answer"
    if len(blocks) < 3:
        parts = re.split(r'(?=Question\s+\d+\s*:)', full_text)
        for part in parts:
            part = part.strip()
            if not part:
                continue
            m = re.match(r'^Question\s+(\d+)', part, re.IGNORECASE)
            if m:
                num = int(m.group(1))
                if 1 <= num <= 7:
                    blocks[num] = part

    return blocks


def extract_parts_from_question(q_text):
    """Extract individual parts (a), (b), etc. from question text."""
    parts = []

    # Split on part letters: (a), (b), etc.
    # Also handles (i), (ii), (iii) as sub-parts

    # First, split on main parts (a)-(g)
    main_parts = re.split(r'\n(?=\([a-z]\))', q_text)

    if len(main_parts) <= 1:
        # Try alternate: "(a)" at start of line or after newline
        main_parts = re.split(r'(?=\([a-z]\))', q_text)

    for part in main_parts:
        part = part.strip()
        if not part:
            continue
        m = re.match(r'^\(([a-z])\)\s*(.*)', part, re.DOTALL)
        if m:
            letter = m.group(1)
            content = m.group(2).strip()
            parts.append({
                'letter': letter,
                'content': content
            })

    return parts


def extract_parts_from_sg(sg_text):
    """Extract rubric criteria per part from scoring guidelines."""
    parts_rubric = {}

    # Split on part letters
    part_sections = re.split(r'\n(?=\([a-z]\))', sg_text)
    if len(part_sections) <= 1:
        part_sections = re.split(r'(?=\([a-z]\))', sg_text)

    for section in part_sections:
        section = section.strip()
        if not section:
            continue
        m = re.match(r'^\(([a-z])\)\s*(.*)', section, re.DOTALL)
        if m:
            letter = m.group(1)
            content = m.group(2).strip()
            parts_rubric[letter] = content

    return parts_rubric


def get_point_value_from_sg(sg_text, letter):
    """Try to extract point value for a given part from scoring guidelines."""
    # Look for patterns like "1 point", "2 points", "Total for part (x) N points"
    # within the section for that letter
    total_match = re.search(
        rf'Total for part \({letter}\)\s+(\d+)\s*points?',
        sg_text, re.IGNORECASE
    )
    if total_match:
        return int(total_match.group(1))

    # Count "1 point" occurrences in the section
    count = len(re.findall(r':\s*1\s*point', sg_text, re.IGNORECASE))
    if count > 0:
        return count

    # Default
    return 1


def get_total_points(q_num, sg_text):
    """Extract total points for a question from scoring guidelines."""
    m = re.search(
        rf'Total for question\s+{q_num}\s+(\d+)\s*points?',
        sg_text, re.IGNORECASE
    )
    if m:
        return int(m.group(1))

    # Check header: "Long Answer 10 points" or "Short Answer 4 points"
    m = re.search(r'(?:Long|Short)\s+Answer\s+(\d+)\s*points?', sg_text, re.IGNORECASE)
    if m:
        return int(m.group(1))

    # Default based on question number
    if q_num <= 3:
        return 10
    return 4


def extract_rubric_criteria(sg_part_text):
    """Extract list of rubric criteria from a part's scoring guidelines text."""
    criteria = []

    # Extract point-earning criteria
    # Patterns: "For the correct X: 1 point", "For a correct X: 1 point"
    for line in sg_part_text.split('\n'):
        line = line.strip()
        if not line:
            continue
        # Look for point award lines
        if re.search(r':\s*\d+\s*points?', line, re.IGNORECASE):
            criteria.append(line)
        elif line.startswith('For ') and ':' in line:
            criteria.append(line)

    if not criteria:
        # Fallback: return the first meaningful sentences
        sentences = [s.strip() for s in sg_part_text.split('\n') if s.strip()]
        criteria = sentences[:3]

    return criteria


def extract_scoring_notes(sg_part_text):
    """Extract scoring notes (accept/reject, sig figs, etc.) from SG text."""
    notes = []
    patterns = [
        r'Accept.*?(?=\n|$)',
        r'Do not.*?(?=\n|$)',
        r'Sig fig.*?(?=\n|$)',
        r'Note:.*?(?=\n|$)',
        r'Acceptable.*?(?=\n|$)',
    ]
    for pattern in patterns:
        for m in re.finditer(pattern, sg_part_text, re.IGNORECASE):
            note = m.group(0).strip()
            if note not in notes:
                notes.append(note)

    return ' '.join(notes) if notes else None


def classify_frq_type(q_num):
    """All AP Chem FRQs are multi_part_math."""
    return "multi_part_math"


def identify_units(q_text, sg_text):
    """Map question content to AP Chemistry units."""
    combined = (q_text + ' ' + sg_text).lower()
    units = set()

    unit_keywords = {
        1: ['atomic structure', 'electron configuration', 'periodic trend', 'ionization energy',
            'electronegativity', 'atomic radius', 'photoelectron', 'coulomb', 'orbital', 'subshell',
            'quantum', 'spectroscopy', 'emission spectrum'],
        2: ['lewis', 'bond', 'molecular geometry', 'vsepr', 'polarity', 'ionic', 'covalent',
            'formal charge', 'resonance', 'lattice energy', 'electronegativity', 'hybridization',
            'sp3', 'sp2', 'alloy', 'metallic', 'substitutional', 'interstitial'],
        3: ['intermolecular', 'imf', 'hydrogen bond', 'london dispersion', 'dipole',
            'vapor pressure', 'boiling point', 'viscosity', 'surface tension', 'solubility',
            'chromatography', 'dissolution', 'miscible'],
        4: ['reaction', 'stoichiometry', 'limiting reagent', 'limiting reactant', 'mole',
            'precipitation', 'net ionic', 'oxidation', 'reduction', 'redox', 'oxidation state',
            'oxidation number', 'electrochemistry', 'electrolysis', 'electrolytic', 'electroplating',
            'half-reaction', 'titration', 'volumetric'],
        5: ['kinetics', 'rate law', 'rate constant', 'half-life', 'activation energy',
            'rate-determining', 'order', 'collision', 'reaction mechanism', 'catalyst',
            'arrhenius', 'integrated rate'],
        6: ['thermodynamics', 'enthalpy', 'entropy', 'gibbs', 'calorimetry', 'hess',
            'specific heat', 'heat of formation', 'delta h', 'delta s', 'delta g',
            'endothermic', 'exothermic', 'calorimeter', 'bond energy'],
        7: ['equilibrium', 'le chatelier', 'kc', 'kp', 'ka', 'kb', 'ksp', 'solubility product',
            'reaction quotient', 'buffer', 'henderson', 'equivalence point', 'half-equivalence',
            'weak acid', 'weak base', 'diprotic', 'titration curve'],
        8: ['acid', 'base', 'ph', 'poh', 'pka', 'pkb', 'buffer', 'titration', 'weak acid',
            'strong acid', 'conjugate', 'neutralization', 'amphoteric', 'polyprotic'],
        9: ['gibbs', 'spontaneous', 'cell potential', 'standard reduction', 'nernst',
            'electrochemical', 'electrolysis', 'faraday', 'galvanic', 'voltaic',
            'thermodynamically favorable'],
    }

    for unit_num, keywords in unit_keywords.items():
        for kw in keywords:
            if kw in combined:
                units.add(unit_num)
                break

    # Ensure at least one unit
    if not units:
        units.add(4)

    return sorted(list(units))


def get_title(q_num, q_text, units):
    """Generate a descriptive title based on question content."""
    q_lower = q_text.lower()

    # Try to identify main topic
    if 'titration' in q_lower and ('buffer' in q_lower or 'pka' in q_lower or 'acid' in q_lower):
        return "Acid-Base Titration & Buffer Chemistry"
    if 'equilibrium' in q_lower and 'le chatelier' in q_lower:
        return "Equilibrium & Le Chatelier's Principle"
    if 'kinetics' in q_lower or 'rate law' in q_lower or 'rate constant' in q_lower:
        return "Chemical Kinetics & Rate Laws"
    if 'electrochemistry' in q_lower or 'electroplating' in q_lower or 'cell potential' in q_lower:
        return "Electrochemistry & Redox Reactions"
    if 'calorimetry' in q_lower or ('enthalpy' in q_lower and 'specific heat' in q_lower):
        return "Thermochemistry & Calorimetry"
    if 'gibbs' in q_lower or ('entropy' in q_lower and 'enthalpy' in q_lower):
        return "Thermodynamics & Gibbs Free Energy"
    if 'lewis' in q_lower and ('vsepr' in q_lower or 'geometry' in q_lower or 'bond angle' in q_lower):
        return "Lewis Structures & Molecular Geometry"
    if 'solubility' in q_lower and ('ksp' in q_lower or 'precipit' in q_lower):
        return "Solubility Equilibrium & Ksp"
    if 'buffer' in q_lower:
        return "Buffer Solutions & Acid-Base Equilibrium"
    if 'galvanic' in q_lower or 'voltaic' in q_lower or 'cell potential' in q_lower:
        return "Electrochemical Cells & Cell Potential"
    if 'stoichiometry' in q_lower or 'limiting' in q_lower:
        return "Stoichiometry & Reaction Analysis"
    if 'gas' in q_lower and ('pressure' in q_lower or 'ideal gas' in q_lower):
        return "Gas Laws & Properties"
    if 'intermolecular' in q_lower or 'imf' in q_lower:
        return "Intermolecular Forces & Physical Properties"
    if 'atomic' in q_lower or 'orbital' in q_lower or 'electron configuration' in q_lower:
        return "Atomic Structure & Properties"
    if 'oxidation' in q_lower or 'redox' in q_lower:
        return "Redox Reactions & Oxidation States"
    if 'entropy' in q_lower:
        return "Entropy & Spontaneity"
    if 'enthalpy' in q_lower:
        return "Enthalpy & Thermochemistry"
    if 'acid' in q_lower or 'ph' in q_lower or 'base' in q_lower:
        return "Acid-Base Chemistry"
    if 'equilibrium' in q_lower:
        return "Chemical Equilibrium"

    # Unit-based fallback
    unit_titles = {
        1: "Atomic Structure & Properties",
        2: "Molecular Structure & Bonding",
        3: "Intermolecular Forces & Properties",
        4: "Chemical Reactions & Stoichiometry",
        5: "Chemical Kinetics",
        6: "Thermochemistry & Calorimetry",
        7: "Chemical Equilibrium",
        8: "Acid-Base Chemistry",
        9: "Electrochemistry & Applications of Thermodynamics",
    }
    if units:
        return unit_titles.get(units[0], "Chemical Reactions")
    return "AP Chemistry Free Response"


def requires_drawing(part_text):
    """Check if a part asks for drawing."""
    keywords = ['draw', 'sketch', 'complete the lewis', 'lewis diagram', 'particulate',
                'diagram', 'arrow', 'represent', 'plot', 'graph']
    lower = part_text.lower()
    for kw in keywords:
        if kw in lower:
            return True
    return False


def get_stimulus(q_text, q_num):
    """Extract the stimulus/intro text before part (a)."""
    # Text before the first "(a)" is the stimulus
    m = re.split(r'\([a-z]\)', q_text, maxsplit=1)
    if m:
        stimulus = m[0].strip()
        # Remove the question number prefix
        stimulus = re.sub(r'^\d+[\.\s]+', '', stimulus).strip()
        if len(stimulus) > 20:
            return stimulus
    return None


def build_frq_json(year, q_num, q_text, sg_text):
    """Build the JSON object for one FRQ question."""
    q_id = f"chem-{year}-frq-{q_num}"

    # Get total points
    total_pts = get_total_points(q_num, sg_text)

    # Get units
    units = identify_units(q_text, sg_text)

    # Get title
    title = get_title(q_num, q_text, units)

    # Get stimulus
    stimulus_text = get_stimulus(q_text, q_num)

    # Parse parts
    q_parts_raw = extract_parts_from_question(q_text)
    sg_parts_raw = extract_parts_from_sg(sg_text)

    parts = []
    for p in q_parts_raw:
        letter = p['letter']
        prompt = p['content']

        # Get corresponding SG section
        sg_section = sg_parts_raw.get(letter, '')

        # Extract rubric criteria
        criteria = extract_rubric_criteria(sg_section)

        # Extract scoring notes
        notes = extract_scoring_notes(sg_section)

        # Estimate point value
        pt_val = get_point_value_from_sg(sg_section, letter)

        # Check requires_drawing
        needs_draw = requires_drawing(prompt)

        part_obj = {
            "letter": letter,
            "prompt": prompt.strip(),
            "point_value": pt_val,
            "rubric_criteria": criteria,
            "scoring_notes": notes,
            "requires_drawing": needs_draw,
            "reference_image": None
        }
        parts.append(part_obj)

    # If we couldn't parse any parts, create a minimal structure
    if not parts:
        parts = [{
            "letter": "a",
            "prompt": "See original question PDF.",
            "point_value": total_pts,
            "rubric_criteria": [],
            "scoring_notes": None,
            "requires_drawing": False,
            "reference_image": None
        }]

    frq = {
        "id": q_id,
        "subject": "ap-chemistry",
        "year": year,
        "source": "released",
        "title": title,
        "frq_type": "multi_part_math",
        "related_units": units,
        "calculator_allowed": True,
        "total_points": total_pts,
        "stimulus": stimulus_text,
        "stimulus_image": None,
        "documents": None,
        "parts": parts
    }

    return frq


def process_year(year):
    """Process one year's FRQ questions and scoring guidelines."""
    q_path = os.path.join(QUESTIONS_DIR, f'{year} chem frq.pdf')
    sg_path = os.path.join(SG_DIR, f'{year} chem sg.pdf')

    if not os.path.exists(q_path):
        print(f"  SKIP {year}: questions PDF not found")
        return []
    if not os.path.exists(sg_path):
        print(f"  SKIP {year}: scoring guidelines PDF not found")
        return []

    print(f"\nProcessing {year}...")

    # Extract text
    q_pages = extract_pdf_text(q_path)
    sg_pages = extract_pdf_text(sg_path)

    q_full = get_full_text([clean_text(p) for p in q_pages])
    sg_full = get_full_text([clean_text(p) for p in sg_pages])

    # Split into per-question blocks
    q_blocks = split_questions(q_full, year)
    sg_blocks = split_sg_questions(sg_full)

    print(f"  Found Q blocks: {sorted(q_blocks.keys())}")
    print(f"  Found SG blocks: {sorted(sg_blocks.keys())}")

    filenames = []

    for q_num in range(1, 8):
        q_text = q_blocks.get(q_num, '')
        sg_text = sg_blocks.get(q_num, '')

        if not q_text and not sg_text:
            print(f"  SKIP Q{q_num}: no text found")
            continue

        frq_json = build_frq_json(year, q_num, q_text, sg_text)

        filename = f"chem-{year}-frq-{q_num}"
        out_path = os.path.join(OUTPUT_DIR, f"{filename}.json")

        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(frq_json, f, indent=2, ensure_ascii=False)

        print(f"  Wrote {filename}.json ({len(frq_json['parts'])} parts, {frq_json['total_points']} pts)")
        filenames.append(filename)

    return filenames


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    all_filenames = []

    for year in YEARS:
        filenames = process_year(year)
        all_filenames.extend(filenames)

    # Write manifest
    manifest_path = os.path.join(OUTPUT_DIR, 'manifest.json')
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(all_filenames, f, indent=2)

    print(f"\nDone! Generated {len(all_filenames)} FRQ files.")
    print(f"Manifest written to {manifest_path}")

    return all_filenames


if __name__ == '__main__':
    main()
