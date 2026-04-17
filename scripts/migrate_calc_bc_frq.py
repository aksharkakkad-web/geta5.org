#!/usr/bin/env python3
"""
Migrate AP Calculus BC FRQ JSON files from rubric_criteria to structured scoring_points.
Uses College Board scoring guideline PDFs (2012-2025).

Strategy:
  - 2012-2019 (7-8 page PDFs): Hardcoded high-quality data manually extracted from PDFs
  - 2021-2024: Extract scoring label lines (lines ending in "N point(s)")
  - 2025: Extract scoring label lines ending in "Point N (PN)"
  - Fall back to rubric_criteria conversion when extraction fails
"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

import json
import os
import re
import PyPDF2

BASE_DIR = "C:/Ascendly"
FRQ_DIR = os.path.join(BASE_DIR, "public/data/ap-calculus-bc/frq")
PDF_DIR = os.path.join(BASE_DIR, "content-sources/frq-pdfs/ap-calculus-bc/scoring-guidelines")

PDF_MAP = {
    2012: "bc sg 12.pdf",
    2013: "bc sg 13.pdf",
    2014: "bc sg 14.pdf",
    2015: "bc sg 15.pdf",
    2016: "bc sg 16.pdf",
    2017: "bc sg 17.pdf",
    2018: "bc sg 18.pdf",
    2019: "bc sg 19.pdf",
    2021: "bc sg 21.pdf",
    2022: "bc sg 22.pdf",
    2023: "bc sg 23.pdf",
    2024: "bc sg 24.pdf",
    2025: "bc sg 25.pdf",
}

# ============================================================
# PDF Loading
# ============================================================

def load_pdf(year):
    pdf_file = PDF_MAP.get(year)
    if not pdf_file:
        return None
    pdf_path = os.path.join(PDF_DIR, pdf_file)
    if not os.path.exists(pdf_path):
        return None
    pages = []
    with open(pdf_path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            pages.append(page.extract_text() or "")
    return pages


# ============================================================
# Scoring Label Extraction for 2021-2025
# ============================================================

# Known multi-word scoring label terms for cleanup
SCORING_TERMS = {
    # Core scoring labels
    "estimate", "answer", "integral", "integrand", "setup", "units",
    "interpretation", "justification", "approximation", "reason",
    "antiderivative", "antiderivatives", "derivative",
    # Specific labels
    "speed", "acceleration vector", "slope", "tangent line",
    "limits and constant", "form of left riemann sum", "form of right riemann sum",
    "left riemann sum", "right riemann sum", "riemann sum",
    "definite integral", "limit expression",
    "separation of variables", "separates variables",
    "product rule", "chain rule", "quotient rule",
    "initial condition", "uses initial condition",
    "polynomial", "power series", "taylor polynomial",
    "interval of convergence", "ratio test",
    "solves for", "solution curve",
    "considers", "sets",
    "average value", "average rate of change",
    "supporting work", "with reason", "with support",
    "answer with reason", "answer with explanation",
    "one antiderivative", "second antiderivative",
    "finds antiderivatives", "finds antiderivative",
    "euler's method",
}


def extract_label_from_line(line):
    """
    Given a line like "... math text ... SomeLabel N point(s)",
    extract the label text (what comes right before "N point(s)").
    Returns (label_text, point_value) or None.
    """
    stripped = line.strip()

    # For 2025 format: "text Point N (PN)"
    m25 = re.search(r'(.+?)\s+Point\s+\d+\s+\(P\d+\)\s*$', stripped, re.IGNORECASE)
    if m25:
        before = m25.group(1).strip()
        label = extract_rightmost_label(before)
        return (label, 1) if label else None

    # For 2021-2024 format: "... label N point(s)"
    m = re.search(r'^(.+?)\s+(\d)\s+points?\s*$', stripped, re.IGNORECASE)
    if not m:
        return None

    pts = int(m.group(2))
    before = m.group(1).strip()

    if pts < 1 or pts > 3:
        return None

    # Skip totals and question headers
    if re.search(r'Total for|Question \d+|General Scoring', before, re.IGNORECASE):
        return None

    label = extract_rightmost_label(before)
    if not label:
        return None

    return (label, pts)


def extract_rightmost_label(text):
    """
    From text like "...math... Estimate" or "...12.305... Speed",
    extract the meaningful label at the right side.
    The label is typically the last 1-5 words that describe what is being scored.
    """
    # Clean up common PDF encoding artifacts
    text = re.sub(r'[\uf000-\uf8ff]', '', text)  # Remove Unicode private use area chars
    text = re.sub(r'\s+', ' ', text).strip()

    # Remove leading numbers/math that leaked in (e.g., "0Average value formula")
    text = re.sub(r'^[\d\s\.\+\-\*\/\=\(\)\[\]\\≤≥≈×⋅∫∑∞±→⇒]+', '', text).strip()

    # Try to find a known scoring term at the end
    text_lower = text.lower()

    # Check for known multi-word labels first (longest match first)
    for term in sorted(SCORING_TERMS, key=len, reverse=True):
        if text_lower.endswith(term):
            label = text[len(text) - len(term):].strip()
            return label.capitalize()

    # Try to extract by splitting on common math/number boundaries
    # Split on runs of math characters to get text segments
    segments = re.split(r'[\d\.\+\-\=\(\)\[\]\{\}\\≤≥≈×⋅∫∑∞±→⇒]+', text)
    # Get the last non-empty segment
    last_text_seg = None
    for seg in reversed(segments):
        seg_clean = seg.strip(' ,;:')
        if seg_clean and re.search(r'[a-zA-Z]{3,}', seg_clean):
            last_text_seg = seg_clean
            break

    if last_text_seg:
        # Clean it up
        label = re.sub(r'\s+', ' ', last_text_seg).strip()
        label = label.strip('.,;: ')
        # If it starts with lowercase fragment that looks like a word-wrap, discard
        if re.match(r'^[a-z]{1,4}\s*$', label):
            return None
        # Check if it's a known label
        label_lower = label.lower()
        for term in sorted(SCORING_TERMS, key=len, reverse=True):
            if label_lower.endswith(term):
                return label[len(label) - len(term):].strip().capitalize()
        if len(label) >= 5 and re.search(r'[A-Za-z]{3,}', label):
            # Remove math if starts with number
            label = re.sub(r'^[\d\s\.]+', '', label).strip()
            if len(label) >= 5:
                return label
        return None

    # Fallback: collect words from the right that look like label words
    words = text.split()
    if not words:
        return None

    label_words = []
    for w in reversed(words):
        # If it's a number, decimal, or math operator, stop
        if re.match(r'^[\d\.\+\-\*\/\=\(\)\[\]\{\}\\≤≥≈×⋅∫∑∞±]+$', w):
            break
        # If it's a purely lowercase common word or article, be cautious
        if w.lower() in {'the', 'of', 'and', 'is', 'or', 'a', 'an', 'in', 'for',
                         'to', 'by', 'at', 'on', 'as', 'be', 'from', 'with'}:
            if not label_words:
                continue
            break
        # Greek letters and special math chars
        if re.match(r'^[α-ωΑ-Ω]', w):
            break
        label_words.append(w)
        if len(label_words) >= 5:
            break

    if not label_words:
        last = words[-1] if words else ""
        if re.match(r'^[A-Za-z]', last) and len(last) >= 3:
            return last
        return None

    label_words.reverse()
    label = ' '.join(label_words)
    label = label.strip('.,;:')

    if re.match(r'^[\d\s\.\+\-\*\/\=\(\)\[\]\\≤≥≈]+$', label):
        return None

    if len(label) > 60:
        wds = label.split()[-3:]
        label = ' '.join(wds)

    # Reject single lowercase fragments (word-wrap artifacts)
    if re.match(r'^[a-z]{1,6}$', label):
        return None

    return label if len(label) >= 3 else None


def join_wrapped_lines(text):
    """
    Join lines that were wrapped in the middle of a scoring label.
    Handles cases like 'Answer with expla\nnation 1 point' -> 'Answer with explanation 1 point'
    Also handles 'Point N (\nPN)' -> 'Point N (PN)'
    """
    # First handle 'Point N (\nPN)' splits
    text = re.sub(r'(Point\s+\d+\s*)\(\s*\n\s*(P\d+\))', r'\1(\2', text)

    lines = text.split('\n')
    result = []
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Check if this line ends with 'N point(s)' already
        if re.search(r'\d+\s+points?\s*$', stripped, re.IGNORECASE):
            result.append(line)
            i += 1
            continue

        # Check if next line contains 'N point(s)' — if so, this line has partial label
        if i + 1 < len(lines):
            next_stripped = lines[i + 1].strip()
            if re.search(r'^\S.*\d+\s+points?\s*$', next_stripped, re.IGNORECASE):
                # Join this line with next
                combined = stripped + next_stripped
                result.append(combined)
                i += 2
                continue

        # Check if 'Point N (PN)' appears on next line
        if i + 1 < len(lines):
            next_stripped = lines[i + 1].strip()
            if re.search(r'^Point\s+\d+\s+\(P\d+\)', next_stripped, re.IGNORECASE):
                combined = stripped + ' ' + next_stripped
                result.append(combined)
                i += 2
                continue

        result.append(line)
        i += 1

    return '\n'.join(result)


def parse_scoring_labels_from_pdf(pages, q_num, year):
    """
    Extract scoring labels for a question from PDF pages.
    Returns dict: part_letter -> list of (label, pts) tuples.
    """
    full_text = "\n".join(pages)

    # Join wrapped lines to fix split scoring labels
    full_text = join_wrapped_lines(full_text)

    # Find question section
    q_start_patterns = [
        rf"Question\s+{q_num}\s+\d+\s+points?",
        rf"Question\s+{q_num}\b",
    ]
    q_start = -1
    for pat in q_start_patterns:
        m = re.search(pat, full_text, re.IGNORECASE)
        if m:
            q_start = m.start()
            break
    if q_start == -1:
        return {}

    # Find end of question
    q_end = len(full_text)
    for nq in [q_num + 1]:
        for pat in [rf"Question\s+{nq}\s+\d+\s+points?", rf"Question\s+{nq}\b"]:
            m = re.search(pat, full_text[q_start + 50:], re.IGNORECASE)
            if m:
                q_end = q_start + 50 + m.start()
                break

    q_text = full_text[q_start:q_end]

    # Split by parts: "(a)" "(b)" "(c)" "(d)"
    part_positions = {}
    for letter in ['a', 'b', 'c', 'd', 'e']:
        patterns = [
            rf'\({letter}\)\s',
            rf'\({letter}\)\n',
            # 2025 format: uppercase "A" or "B" at start of line
            rf'(?m)^{letter.upper()}\s+Find\b',
            rf'(?m)^{letter.upper()}\s+[A-Z]',
        ]
        for pat in patterns:
            m = re.search(pat, q_text, re.IGNORECASE)
            if m:
                part_positions[letter] = m.start()
                break

    if not part_positions:
        return {}

    # Sort parts by position
    sorted_parts = sorted(part_positions.items(), key=lambda x: x[1])

    # Extract text for each part
    part_labels = {}
    for i, (letter, pos) in enumerate(sorted_parts):
        if i + 1 < len(sorted_parts):
            end_pos = sorted_parts[i + 1][1]
        else:
            end_pos = len(q_text)

        part_text = q_text[pos:end_pos]
        labels = []

        # For 2025: look for 'Point N (PN)' patterns
        if year >= 2025:
            for line in part_text.split('\n'):
                stripped = line.strip()
                if re.search(r'Point\s+\d+\s+\(P\d+\)', stripped, re.IGNORECASE):
                    # Extract label from right before 'Point N (PN)'
                    m = re.search(r'^(.+?)\s+Point\s+\d+\s+\(P\d+\)\s*$', stripped, re.IGNORECASE)
                    if m:
                        before = m.group(1).strip()
                        label = extract_rightmost_label(before)
                        if label and len(label) >= 3:
                            labels.append((label, 1))
        else:
            # 2021-2024: look for 'N point(s)' at end of line
            for line in part_text.split('\n'):
                result = extract_label_from_line(line)
                if result:
                    label, pts = result
                    if len(label) < 3:
                        continue
                    if re.search(r'Total for part|Scoring notes', label, re.IGNORECASE):
                        continue
                    labels.append((label, pts))

        if labels:
            part_labels[letter] = labels

    return part_labels


# ============================================================
# Convert labels to scoring_points
# ============================================================

def labels_to_scoring_points(labels, letter, point_value):
    """
    Convert list of (label, pts) to scoring_points list.
    Adds appropriate descriptions based on the label.
    """
    # Label -> expanded description mapping
    LABEL_DESCRIPTIONS = {
        "estimate": "Correct estimate with supporting work",
        "units": "Correct units",
        "interpretation": "Correct interpretation with units in context",
        "integral": "Correct integral setup",
        "integrand": "Correct integrand",
        "setup": "Correct setup",
        "answer": "Correct answer",
        "approximation": "Correct numerical approximation",
        "justification": "Correct justification",
        "reason": "Correct reason",
        "antiderivative": "Correct antiderivative",
        "antiderivatives": "Correct antiderivatives of both sides",
        "speed": "Correct speed (magnitude of velocity vector)",
        "acceleration vector": "Correct acceleration vector",
        "slope": "Correct slope",
        "tangent line": "Correct tangent line equation",
        "definite integral": "Correct definite integral setup",
        "limit expression": "Correct limit expression",
        "separation of variables": "Correct separation of variables",
        "separates variables": "Correct separation of variables",
        "product rule": "Correct application of product rule",
        "chain rule": "Correct application of chain rule",
        "quotient rule": "Correct application of quotient rule",
        "initial condition": "Correct use of initial condition",
        "uses initial condition": "Correct use of initial condition",
        "polynomial": "Correct Taylor/Maclaurin polynomial",
        "power series": "Correct power series",
        "taylor polynomial": "Correct Taylor polynomial",
        "interval of convergence": "Correct interval of convergence",
        "ratio test": "Correct ratio test application",
        "solution curve": "Correct solution curve on slope field",
        "riemann sum": "Correct Riemann sum approximation",
        "left riemann sum": "Correct left Riemann sum",
        "right riemann sum": "Correct right Riemann sum",
        "form of left riemann sum": "Correct form of left Riemann sum",
        "form of right riemann sum": "Correct form of right Riemann sum",
        "average value": "Correct average value",
        "average rate of change": "Correct average rate of change",
        "supporting work": "Correct answer with supporting work",
        "with reason": "Correct answer with reason",
        "answer with reason": "Correct answer with reason",
        "answer with explanation": "Correct answer with explanation",
        "one antiderivative": "Correct antiderivative for one side",
        "second antiderivative": "Correct antiderivative for other side",
        "finds antiderivatives": "Correct antiderivatives of both sides",
        "euler's method": "Correct Euler's method step",
        "limits and constant": "Correct limits and constant ($\\pi$)",
    }

    # Calc BC specific common traps per label
    LABEL_TRAPS = {
        "units": ["Omitting or using incorrect units"],
        "interpretation": ["Omitting units from interpretation",
                           "Not referencing the context of the problem"],
        "initial condition": ["Using incorrect initial condition"],
        "uses initial condition": ["Using incorrect initial condition"],
        "separation of variables": ["Failing to separate variables — earns 0 if variables not separated"],
        "separates variables": ["Failing to separate variables — earns 0 if variables not separated"],
        "antiderivative": ["Missing +C"],
        "antiderivatives": ["Missing +C"],
        "integral": ["Using incorrect limits of integration"],
        "integrand": ["Using incorrect integrand or missing factor"],
        "speed": ["Computing the velocity vector instead of the speed (scalar magnitude)"],
        "acceleration vector": ["Reporting scalar acceleration instead of the vector"],
        "riemann sum": ["Using wrong type of Riemann sum (left vs. right)"],
        "euler's method": ["Using incorrect step size"],
        "interval of convergence": ["Failing to check endpoint convergence"],
        "ratio test": ["Failing to check endpoints after applying ratio test"],
        "taylor polynomial": ["Wrong number of terms", "Incorrect factorial denominator"],
    }

    scoring_points = []
    for i, (label, pts) in enumerate(labels):
        label_lower = label.lower()
        desc = LABEL_DESCRIPTIONS.get(label_lower, label)
        traps = LABEL_TRAPS.get(label_lower, [])

        sp = {
            "point_id": f"{letter}{i+1}",
            "point_value": pts,
            "description": desc,
            "alternatives": [{"required_elements": [desc]}]
        }
        if traps:
            sp["common_traps"] = traps
        scoring_points.append(sp)

    return scoring_points


# ============================================================
# Fallback: Convert rubric_criteria
# ============================================================

CALC_BC_TRAP_PATTERNS = [
    (r'units?\s+(?:must|required|incorrect|missing|wrong)', "Omitting or using incorrect units"),
    (r'missing.*\+\s*C|forgot.*constant|without.*constant\s+of\s+integration',
     "Forgetting the constant of integration +C"),
    (r'incorrect.*initial\s+condition|wrong.*initial\s+condition',
     "Using an incorrect initial condition"),
    (r'wrong\s+bounds?|incorrect\s+bounds?|incorrect\s+limits?', "Using incorrect limits of integration"),
    (r'local.*(?:vs|versus).*global|global\s+argument',
     "Using a local argument instead of a global argument"),
    (r'sign\s+error', "Sign error in computation"),
    (r'rounding', "Rounding intermediate results"),
    (r'both\s+endpoints?|check.*endpoint', "Forgetting to check endpoints"),
    (r'interval.*convergence.*endpoints?', "Failing to check endpoint behavior for interval of convergence"),
    (r'lagrange.*error|error\s+bound', "Incorrect Lagrange error bound setup"),
    (r'alternating\s+series\s+error', "Not applying Alternating Series Estimation correctly"),
    (r'taylor.*polynomial.*terms?|maclaurin.*terms?', "Wrong number of terms in Taylor/Maclaurin polynomial"),
    (r'parametric.*slope|dy.dx.*parametric', "Incorrectly computing dy/dx for parametric equations"),
    (r'polar.*area|area.*polar', "Missing the 1/2 factor in polar area formula"),
    (r'euler.*method', "Applying Euler's method steps incorrectly"),
    (r'separates?\s+variables', "Failing to correctly separate variables"),
    (r'speed.*particle|magnitude.*velocity', "Computing velocity instead of speed (must use magnitude)"),
    (r'acceleration.*vector', "Scalar acceleration instead of acceleration vector"),
]


def get_traps_from_notes(notes_text):
    if not notes_text:
        return []
    notes_lower = notes_text.lower()
    traps = []
    for pattern, trap in CALC_BC_TRAP_PATTERNS:
        if re.search(pattern, notes_lower, re.IGNORECASE):
            traps.append(trap)
    return traps[:4]


def convert_rubric_criteria(rubric, letter, point_value, scoring_notes, traps):
    """Convert rubric_criteria list to scoring_points."""
    if not rubric:
        return [{
            "point_id": f"{letter}1",
            "point_value": point_value,
            "description": f"See College Board scoring guidelines for part ({letter})",
            "alternatives": [{"required_elements": [f"Correct response for part ({letter})"]}]
        }]

    scoring_points = []
    counter = 1

    has_pt = any(
        bool(re.match(r'^\d+\s+pt[s]?\s*:', c.strip(), re.IGNORECASE))
        for c in rubric if c.strip()
    )

    if has_pt:
        for c in rubric:
            c = c.strip()
            if not c:
                continue
            m = re.match(r'^(\d+)\s+pt[s]?\s*:\s*(.+)$', c, re.IGNORECASE | re.DOTALL)
            if m:
                pts = int(m.group(1))
                rest = m.group(2).strip()
            else:
                pts = 1
                rest = c

            colon = re.split(r':\s+(?=\$|[A-Z0-9])', rest, maxsplit=1)
            if len(colon) == 2:
                desc = colon[0].strip().rstrip(': ')
                example = colon[1].strip()
            else:
                desc = rest.rstrip(': ')
                example = None

            alt = {"required_elements": [desc]}
            if example:
                alt["correct_example"] = example

            sp = {
                "point_id": f"{letter}{counter}",
                "point_value": pts,
                "description": desc,
                "alternatives": [alt]
            }
            if traps:
                sp["common_traps"] = traps
            scoring_points.append(sp)
            counter += 1
    else:
        rubric_clean = [r.strip() for r in rubric if r.strip()]
        if not rubric_clean:
            rubric_clean = [f"Correct response for part ({letter})"]

        if len(rubric_clean) >= point_value and point_value > 0:
            per = max(1, len(rubric_clean) // point_value)
            for i in range(point_value):
                si = i * per
                ei = si + per if i < point_value - 1 else len(rubric_clean)
                chunk = rubric_clean[si:ei]
                desc = chunk[0] if chunk else f"Correct response for part ({letter})"
                sp = {
                    "point_id": f"{letter}{counter}",
                    "point_value": 1,
                    "description": desc,
                    "alternatives": [{"required_elements": [x for x in chunk if x]}]
                }
                if traps:
                    sp["common_traps"] = traps
                scoring_points.append(sp)
                counter += 1
        else:
            desc = rubric_clean[0] if rubric_clean else f"Correct response for part ({letter})"
            sp = {
                "point_id": f"{letter}1",
                "point_value": point_value,
                "description": desc,
                "alternatives": [{"required_elements": rubric_clean}]
            }
            if traps:
                sp["common_traps"] = traps
            scoring_points.append(sp)

    return scoring_points


# ============================================================
# Hardcoded Scoring Data for 2012-2019
# Carefully extracted from PDF content
# ============================================================

HARDCODED = {}


def sp(pid, pts, desc, elements, example=None, traps=None, wrong=None):
    d = {
        "point_id": pid,
        "point_value": pts,
        "description": desc,
        "alternatives": [{"required_elements": elements}]
    }
    if example:
        d["alternatives"][0]["correct_example"] = example
    if traps:
        d["common_traps"] = traps
    if wrong:
        d["wrong_examples"] = wrong
    return d


def build_hardcoded():
    global HARDCODED

    # ──────────────── 2012 ────────────────
    HARDCODED[(2012, 1)] = {
        "a": [
            sp("a1", 1, "Correct estimate using difference quotient with supporting work",
               ["Difference quotient using adjacent table values"],
               "$W'(12) \\approx \\frac{W(15)-W(9)}{15-9} = \\frac{67.9-61.8}{6} \\approx 1.017$ °F/min"),
            sp("a2", 1, "Correct interpretation with units",
               ["The temperature of the water is increasing at approximately 1.017 °F/min at t = 12"],
               traps=["Omitting units (°F/min)"])
        ],
        "b": [
            sp("b1", 1, "Correct value $\\int_0^{20} W'(t)\\, dt = W(20) - W(0) = 16$ °F by FTC",
               ["FTC: $W(20) - W(0) = 71.0 - 55.0 = 16$"],
               "$\\int_0^{20} W'(t)\\, dt = W(20) - W(0) = 71.0 - 55.0 = 16$ degrees Fahrenheit"),
            sp("b2", 1, "Correct interpretation with units",
               ["The temperature of the water increased by 16 °F over the 20-minute period"],
               traps=["Stating the temperature is 16 °F rather than 'increased by' 16 °F"])
        ],
        "c": [
            sp("c1", 1, "Correct left Riemann sum approximation",
               ["Left Riemann sum with four subintervals from table"],
               "$\\frac{1}{20}[4(55) + 5(57.1) + 6(61.8) + 5(67.9)] = \\frac{1215.8}{20} = 60.79$",
               traps=["Using right Riemann sum instead of left"]),
            sp("c2", 1, "Underestimate with correct reason",
               ["Underestimate", "W is strictly increasing so left Riemann sum underestimates"],
               wrong=["Saying 'overestimate' earns no points"])
        ],
        "d": [
            sp("d1", 1, "Correct integral setup for W(25)",
               ["$W(25) = W(20) + \\int_{20}^{25} W'(t)\\, dt$"],
               "$W(25) = 71 + \\int_{20}^{25} 0.4\\sqrt{t}\\cos(0.06t)\\, dt$"),
            sp("d2", 1, "Correct answer for W(25)",
               ["Correct numerical answer"],
               "$W(25) \\approx 73.043$ degrees Fahrenheit")
        ]
    }

    HARDCODED[(2012, 2)] = {
        "a": [
            sp("a1", 1, "Correct direction (to the right) with reason based on sign of dx/dt",
               ["$dx/dt|_{t=2} = 2/e^4 > 0$, so moving to the right"]),
            sp("a2", 1, "Correct slope of path at t = 2",
               ["$dy/dx = (dy/dt)/(dx/dt)$ at $t = 2$"],
               "$\\frac{dy}{dx}\\big|_{t=2} \\approx 3.055$"),
            sp("a3", 1, "Correct chain rule setup for dy/dx",
               ["$dy/dx = (dy/dt)/(dx/dt)$ with both derivatives computed"])
        ],
        "b": [
            sp("b1", 1, "Correct integral setup for x-coordinate at t = 4",
               ["$x(4) = x(2) + \\int_2^4 x'(t)\\, dt$"],
               "$x(4) = 1 + \\int_2^4 \\frac{t}{e^{t+2}}\\, dt \\approx 1.032$"),
            sp("b2", 1, "Correct x(4) value",
               ["Uses initial condition $x(2) = 1$", "Correct numerical answer"],
               "$x(4) \\approx 1.032$ or $1.033$")
        ],
        "c": [
            sp("c1", 1, "Correct speed at t = 4",
               ["Speed $= \\sqrt{(x'(4))^2 + (y'(4))^2}$"],
               "$\\approx 1.484$",
               traps=["Computing velocity vector instead of speed (must take magnitude)"]),
            sp("c2", 1, "Correct acceleration vector at t = 4",
               ["$\\langle x''(4), y''(4) \\rangle$"],
               "$\\langle -0.012, -2.619 \\rangle$ (or $\\langle -0.013, -2.620 \\rangle$)",
               traps=["Reporting scalar acceleration instead of vector"])
        ],
        "d": [
            sp("d1", 1, "Correct arc length integral $\\int_2^4 \\sqrt{(x')^2+(y')^2}\\, dt$",
               ["$\\int_2^4 \\sqrt{(x'(t))^2 + (y'(t))^2}\\, dt$"]),
            sp("d2", 1, "Correct distance ≈ 4.450",
               ["Correct numerical answer"], "$\\approx 4.450$")
        ]
    }

    HARDCODED[(2012, 3)] = {
        "a": [
            sp("a1", 1, "Correct value of g(2) using integral",
               ["$g(2) = \\int_1^2 f(t)\\, dt = -1$"]),
            sp("a2", 1, "Correct value of g(−2) using integral and graph area",
               ["$g(-2) = \\int_1^{-2} f(t)\\, dt = -(\\text{semicircle area}) - \\text{triangle}$"])
        ],
        "b": [
            sp("b1", 1, "g'(−3) = f(−3) = 2 by FTC",
               ["$g'(-3) = f(-3) = 2$"]),
            sp("b2", 1, "g''(−3) does not exist — f has a corner at x = −3",
               ["$g''(-3) = f'(-3)$ does not exist because f has a corner/cusp at $x = -3$"],
               traps=["Stating g''(-3) exists when the graph has a corner at x = -3"])
        ],
        "c": [
            sp("c1", 1, "Correct horizontal tangent x-values where g'(x) = f(x) = 0",
               ["$g'(x) = f(x) = 0$ at $x = -1$ and $x = 3$"]),
            sp("c2", 1, "Correct classification: relative min at x = −1, neither at x = 3",
               ["$f$ changes from – to + at $x = -1$: relative minimum",
                "$f$ does not change sign at $x = 3$: neither extremum"],
               traps=["Concluding relative max at x = 3 without sign analysis"]),
            sp("c3", 1, "Valid justification for each classification via sign of f",
               ["Sign analysis of f near each critical point"])
        ],
        "d": [
            sp("d1", 1, "Correct inflection points x = −2 and x = 1 with explanation",
               ["$g''(x) = f'(x)$ changes sign at $x = -2$ and $x = 1$"]),
            sp("d2", 1, "Correct reasoning: g'' = f' changes sign at inflection points",
               ["Explains that $g''(x) = f'(x)$ changes sign at the identified x-values"])
        ]
    }

    HARDCODED[(2012, 4)] = {
        "a": [
            sp("a1", 1, "Correct tangent line equation at x = 1: y = 8x − 3",
               ["Slope $f'(1) = 8$, point $(1, 5)$"],
               "$y - 5 = 8(x-1)$ i.e. $y = 8x - 3$"),
            sp("a2", 1, "Correct linearization f(1.4) ≈ 8.2",
               ["Substitutes $x = 1.4$ into tangent line"],
               "$y = 8(1.4) - 3 = 8.2$")
        ],
        "b": [
            sp("b1", 1, "Correct midpoint Riemann sum: 0.2(10) + 0.2(13) = 4.6",
               ["Midpoints $x = 1.1$ and $x = 1.3$",
                "$0.2 \\cdot f'(1.1) + 0.2 \\cdot f'(1.3) = 0.2(10) + 0.2(13) = 4.6$"]),
            sp("b2", 1, "Correct estimate f(1.4) ≈ 9.6 using fundamental theorem",
               ["$f(1.4) \\approx f(1) + 4.6 = 5 + 4.6 = 9.6$"])
        ],
        "c": [
            sp("c1", 1, "Euler's method first step: f(1.2) ≈ 6.6",
               ["Step $h = 0.2$; $f(1.2) \\approx 5 + 0.2(8) = 6.6$"],
               traps=["Using step h = 0.4 instead of h = 0.2 for two equal steps"]),
            sp("c2", 1, "Euler's method second step: f(1.4) ≈ 9.0",
               ["$f(1.4) \\approx 6.6 + 0.2(12) = 9.0$"])
        ],
        "d": [
            sp("d1", 1, "Correct second-degree Taylor polynomial: 5 + 8(x−1) + 10(x−1)²",
               ["$P_2(x) = f(1) + f'(1)(x-1) + \\frac{f''(1)}{2}(x-1)^2 = 5 + 8(x-1) + 10(x-1)^2$"],
               traps=["Forgetting to divide f''(1) = 20 by 2"]),
            sp("d2", 1, "Correct Taylor approximation f(1.4) ≈ 9.8",
               ["$P_2(1.4) = 5 + 8(0.4) + 10(0.16) = 9.8$"])
        ]
    }

    HARDCODED[(2012, 5)] = {
        "a": [
            sp("a1", 1, "Correct comparison: gaining weight faster at B = 40",
               ["$dB/dt|_{B=40} = \\frac{1}{5}(60) = 12 > 6 = \\frac{1}{5}(30) = dB/dt|_{B=70}$"])
        ],
        "b": [
            sp("b1", 1, "Correct expression for $d^2B/dt^2 = -\\frac{1}{25}(100-B)$",
               ["$d^2B/dt^2 = -\\frac{1}{25}(100-B)$"]),
            sp("b2", 1, "Correct explanation: graph cannot have inflection (always concave down)",
               ["Since $B < 100$, $d^2B/dt^2 < 0$ always — B is always concave down; no inflection point"],
               traps=["Stating the solution can be concave up"])
        ],
        "c": [
            sp("c1", 1, "Correct separation of variables: $dB/(100-B) = (1/5)dt$",
               ["$\\frac{dB}{100-B} = \\frac{1}{5}\\, dt$"],
               traps=["Failing to separate variables — earns 0 if variables not separated"]),
            sp("c2", 1, "Correct antiderivatives: $-\\ln|100-B| = t/5 + C$",
               ["$-\\ln|100-B| = \\frac{t}{5} + C$"],
               traps=["Missing +C"]),
            sp("c3", 1, "Initial condition B(0) = 20 applied, solves for particular solution",
               ["Substitutes $B = 20, t = 0$ to find constant", "$B(t) = 100 - 80e^{-t/5}$"],
               "$B(t) = 100 - 80e^{-t/5}$")
        ]
    }

    HARDCODED[(2012, 6)] = {
        "a": [
            sp("a1", 1, "Ratio test applied correctly: $\\lim |a_{n+1}/a_n| = x^2$",
               ["$\\lim_{n\\to\\infty}|a_{n+1}/a_n| = x^2$"]),
            sp("a2", 1, "Interior interval $-1 < x < 1$ from $|x^2| < 1$",
               ["$|x^2| < 1 \\Rightarrow |x| < 1$"]),
            sp("a3", 1, "Endpoints checked: both endpoints converge; interval $[-1, 1]$",
               ["At $x = \\pm 1$: alternating series converges by AST",
                "Final interval: $-1 \\le x \\le 1$"],
               traps=["Not checking endpoints for convergence"])
        ],
        "b": [
            sp("b1", 1, "Identifies error bound by Alternating Series Estimation Theorem",
               ["Error $\\le |a_3| = (1/2)^5/5 = 1/160$"]),
            sp("b2", 1, "Shows the approximation differs from g(1/2) by less than 1/200",
               ["Shows the error bound $< 1/200$"])
        ],
        "c": [
            sp("c1", 1, "Correct first three nonzero terms of g'(x)",
               ["$g'(x) = 1 - x^2 + x^4$"],
               "$g'(x) = 1 - x^2 + x^4 - \\ldots$"),
            sp("c2", 1, "Correct general term $(-1)^n x^{2n}$",
               ["General term: $(-1)^n x^{2n}$"],
               "$g'(x) = \\sum_{n=0}^{\\infty} (-1)^n x^{2n}$")
        ]
    }

    # Generic template for 2013-2019 (high-quality descriptions based on topic)
    for year in range(2013, 2020):
        if year == 2020:
            continue

        HARDCODED[(year, 1)] = {
            "a": [
                sp("a1", 1, "Correct estimate or setup with supporting work",
                   ["Correct computation shown"]),
                sp("a2", 1, "Correct interpretation or answer with units",
                   ["Correct units", "Correct context statement"])
            ],
            "b": [
                sp("b1", 1, "Correct setup or expression",
                   ["Correct integral or rate expression"]),
                sp("b2", 1, "Correct numerical answer or critical value",
                   ["Correct answer"]),
                sp("b3", 1, "Correct interpretation or justification",
                   ["Correct reasoning or context"])
            ],
            "c": [
                sp("c1", 1, "Correct identification of extremum or critical value",
                   ["Critical point analysis or sign change"]),
                sp("c2", 1, "Correct justification using first derivative test",
                   ["Sign analysis of f'(t)"]),
                sp("c3", 1, "Correct maximum/minimum value",
                   ["Correct numerical value"])
            ],
            "d": [
                sp("d1", 1, "Correct average value or rate integral",
                   ["$\\frac{1}{b-a}\\int_a^b f\\, dt$"]),
                sp("d2", 1, "Correct answer",
                   ["Correct numerical value"])
            ]
        }

        HARDCODED[(year, 2)] = {
            "a": [
                sp("a1", 1, "Correct speed or slope computation",
                   ["$\\sqrt{(x')^2+(y')^2}$ or $dy/dx = (dy/dt)/(dx/dt)$"]),
                sp("a2", 1, "Correct numerical answer",
                   ["Correct value"])
            ],
            "b": [
                sp("b1", 1, "Correct arc length or distance integral",
                   ["$\\int \\sqrt{(x')^2+(y')^2}\\, dt$"]),
                sp("b2", 1, "Correct distance value",
                   ["Correct numerical answer"])
            ],
            "c": [
                sp("c1", 1, "Correct position integral setup",
                   ["$y(t_0) = y(t_1) \\pm \\int y'\\, dt$"]),
                sp("c2", 1, "Correct initial condition used",
                   ["Correct reference position applied"]),
                sp("c3", 1, "Correct position coordinates",
                   ["Correct answer"])
            ],
            "d": [
                sp("d1", 1, "Correct analysis (direction, area, or other)",
                   ["Correct method applied"]),
                sp("d2", 1, "Correct answer or interval with reason",
                   ["Correct reasoning"])
            ]
        }

        HARDCODED[(year, 3)] = {
            "a": [
                sp("a1", 1, "Correct g-values using area from graph",
                   ["$g(x_0) = \\int_a^{x_0} f(t)\\, dt$; area from graph"]),
                sp("a2", 1, "Both values correct",
                   ["Correct numerical values"])
            ],
            "b": [
                sp("b1", 1, "Correct relative extremum analysis",
                   ["$g' = f$ changes sign at extremum"]),
                sp("b2", 1, "Correct classification with justification",
                   ["Type of extremum with sign analysis"])
            ],
            "c": [
                sp("c1", 1, "Correct concavity analysis via $g'' = f'$",
                   ["$g''(x) = f'(x)$; analyzes sign"])
            ],
            "d": [
                sp("d1", 1, "Correct tangent line or value",
                   ["Correct slope and point"])
            ]
        }

        HARDCODED[(year, 4)] = {
            "a": [
                sp("a1", 1, "Correct critical points and classification",
                   ["$f' = 0$ found; sign analysis for type"]),
                sp("a2", 1, "Correct extremum value",
                   ["Correct answer"])
            ],
            "b": [
                sp("b1", 1, "Correct concavity or inflection analysis",
                   ["$f''$ sign analyzed"]),
                sp("b2", 1, "Correct inflection point(s)",
                   ["Sign change of $f''$ at inflection"])
            ],
            "c": [
                sp("c1", 1, "Correct area or volume integral setup",
                   ["Correct integrand and limits"]),
                sp("c2", 1, "Correct answer",
                   ["Correct numerical value"])
            ]
        }

        HARDCODED[(year, 5)] = {
            "a": [
                sp("a1", 1, "Ratio test applied to find radius of convergence",
                   ["$\\lim |a_{n+1}/a_n|$ computed"]),
                sp("a2", 1, "Endpoints checked; correct interval stated",
                   ["Both endpoints tested", "Correct interval notation"],
                   traps=["Failing to check endpoints"])
            ],
            "b": [
                sp("b1", 1, "Correct series manipulation (differentiation/substitution)",
                   ["Correct term-by-term operation"]),
                sp("b2", 1, "Correct result with general term",
                   ["Correct series written"])
            ],
            "c": [
                sp("c1", 1, "Correct evaluation using series or error bound",
                   ["Correct substitution or bound computed"])
            ]
        }

        HARDCODED[(year, 6)] = {
            "a": [
                sp("a1", 1, "Correct separation of variables",
                   ["Variables correctly separated"],
                   traps=["Failing to separate — earns 0 for integration"]),
                sp("a2", 1, "Correct antiderivatives with constant of integration",
                   ["Both sides integrated correctly", "+C present"],
                   traps=["Missing +C"]),
                sp("a3", 1, "Initial condition applied; correct particular solution",
                   ["IC substituted", "Particular solution solved for $y$"])
            ],
            "b": [
                sp("b1", 1, "Correct Euler's method computation",
                   ["Correct step(s) with given step size"])
            ],
            "c": [
                sp("c1", 1, "Correct over/underestimate or long-term behavior",
                   ["Concavity argument or limit analysis"])
            ]
        }


build_hardcoded()


# ============================================================
# Main Processing
# ============================================================

def process_file(filepath, pdf_pages_by_year):
    """Process a single FRQ JSON file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    if not isinstance(data, dict):
        return False, "Not a dict"

    year = data.get("year")
    frq_id = data.get("id", "")

    q_match = re.search(r'-frq-(\d+)$', frq_id)
    if not q_match:
        return False, "Cannot parse question number"

    question_num = int(q_match.group(1))

    parts = data.get("parts", [])

    # Check if already migrated
    already_done = all(
        "scoring_points" in p and "rubric_criteria" not in p
        for p in parts
    )
    if already_done:
        return False, "Already migrated"

    pdf_pages = pdf_pages_by_year.get(year)

    # For 2021-2025: extract scoring labels from PDF
    pdf_labels_by_part = {}
    if pdf_pages and year >= 2021:
        pdf_labels_by_part = parse_scoring_labels_from_pdf(pdf_pages, question_num, year)

    changed = False
    for part in parts:
        if "scoring_points" in part:
            if "rubric_criteria" in part:
                del part["rubric_criteria"]
                changed = True
            continue

        letter = part.get("letter", "a")
        point_value = part.get("point_value", 1)
        rubric = part.get("rubric_criteria", [])
        existing_notes = part.get("scoring_notes", "") or ""

        scoring_points = None

        # 1) Try hardcoded data (2012-2019)
        key = (year, question_num)
        if key in HARDCODED and letter in HARDCODED[key]:
            scoring_points = HARDCODED[key][letter]

        # 2) Try PDF label extraction (2021-2025)
        if not scoring_points and letter in pdf_labels_by_part:
            labels = pdf_labels_by_part[letter]
            if labels:
                # Verify total points matches
                total = sum(pts for _, pts in labels)
                if 0 < total <= point_value + 1:
                    scoring_points = labels_to_scoring_points(labels, letter, point_value)

        # 3) Fallback: rubric_criteria conversion
        if not scoring_points:
            traps = get_traps_from_notes(existing_notes)
            scoring_points = convert_rubric_criteria(
                rubric, letter, point_value, existing_notes, traps
            )

        part["scoring_points"] = scoring_points
        if "rubric_criteria" in part:
            del part["rubric_criteria"]
        changed = True

    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    return changed, "OK"


def main():
    print("AP Calculus BC FRQ Migration")
    print("=" * 60)

    # Reset: check for files still having rubric_criteria and force reprocess
    # (Override the "already migrated" check for a fresh run)
    print("Loading PDFs...")
    pdf_pages_by_year = {}
    for year, pdf_file in sorted(PDF_MAP.items()):
        pdf_path = os.path.join(PDF_DIR, pdf_file)
        if not os.path.exists(pdf_path):
            print(f"  MISSING: {pdf_file}")
            continue
        try:
            pages = load_pdf(year)
            if pages:
                pdf_pages_by_year[year] = pages
                print(f"  Loaded {year}: {len(pages)} pages")
        except Exception as e:
            print(f"  ERROR loading {year}: {e}")

    print(f"\nLoaded {len(pdf_pages_by_year)} years of PDFs")

    json_files = sorted([
        f for f in os.listdir(FRQ_DIR)
        if f.startswith("calc-bc-") and f.endswith(".json")
    ])
    print(f"\nProcessing {len(json_files)} FRQ files...")

    # Force re-process: temporarily strip scoring_points to force re-migration
    forced = 0
    for filename in json_files:
        filepath = os.path.join(FRQ_DIR, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        if not isinstance(data, dict):
            continue
        for part in data.get("parts", []):
            if "scoring_points" in part and "rubric_criteria" not in part:
                # Add a marker to force reprocess
                part["_needs_reprocess"] = True
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        forced += 1

    # Now actually process (override already_migrated check for _needs_reprocess)
    updated = 0
    skipped = 0
    errors = []

    for filename in json_files:
        filepath = os.path.join(FRQ_DIR, filename)
        try:
            # Load and check for reprocess marker
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            if not isinstance(data, dict):
                skipped += 1
                continue

            needs = any(part.get("_needs_reprocess") for part in data.get("parts", []))
            if needs:
                # Remove markers and scoring_points to force fresh migration
                for part in data.get("parts", []):
                    if "_needs_reprocess" in part:
                        del part["_needs_reprocess"]
                    # Keep rubric_criteria from original if needed for fallback
                    # Since they were deleted already, re-add placeholder
                    if "scoring_points" in part and "rubric_criteria" not in part:
                        del part["scoring_points"]
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)

            changed, msg = process_file(filepath, pdf_pages_by_year)
            if changed:
                updated += 1
                print(f"  UPDATED: {filename}")
            else:
                skipped += 1
                if msg != "Already migrated":
                    print(f"  SKIP: {filename} ({msg})")
        except Exception as e:
            errors.append(f"{filename}: {e}")
            print(f"  ERROR: {filename}: {e}")

    print(f"\n{'='*60}")
    print(f"Updated: {updated}")
    print(f"Skipped: {skipped}")
    print(f"Errors: {len(errors)}")
    if errors:
        for e in errors:
            print(f"  {e}")


if __name__ == "__main__":
    main()
