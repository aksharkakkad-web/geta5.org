"""
Analyze AP World History vocab PDF vs current drill files.
Produces a per-unit diff showing:
  - PDF groups (clusters of terms separated by blank lines)
  - Terms in PDF but missing from drills (need to ADD)
  - Terms in drills but missing from PDF (need to REMOVE)
  - Estimated region/empire label for each group
"""
import json
import re
from pathlib import Path
from pdfminer.high_level import extract_text

PDF = Path(r"C:\Users\kakka\Downloads\APWH All Units Vocab.pdf")
DRILLS = Path(r"C:\Ascendly\public\data\ap-world-history\drills")

def normalize(s: str) -> str:
    """Normalize for comparison: lowercase, strip punctuation/parens, collapse whitespace."""
    s = s.lower()
    s = re.sub(r"[\u2013\u2014]", "-", s)  # en/em dashes
    s = re.sub(r"['\u2019\u2018`]", "", s)   # apostrophes
    s = re.sub(r"\([^)]*\)", "", s)          # remove parentheticals
    s = re.sub(r"[^\w\s-]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s

def parse_pdf_units():
    """Parse PDF into units -> list of groups -> list of terms.
    Groups are clusters separated by blank lines (paragraph break)."""
    text = extract_text(str(PDF))
    # Replace weird chars
    text = text.replace("\u2019", "'").replace("\u2018", "'").replace("\ufffd", "'")
    lines = [l.rstrip() for l in text.split("\n")]

    units = {}  # unit_num -> list of groups (each group = list of term strings)
    current_unit = None
    current_group = []
    groups = []

    unit_re = re.compile(r"Unit\s+(\d+)(?:\s*Part\s+II)?\s*[:\-]", re.IGNORECASE)

    for line in lines:
        stripped = line.strip()
        m = unit_re.match(stripped)
        if m:
            # flush current group + unit
            if current_group:
                groups.append(current_group)
                current_group = []
            if current_unit is not None:
                units.setdefault(current_unit, []).extend(groups)
            unit_num = int(m.group(1))
            current_unit = unit_num
            groups = []
            continue

        if not stripped:
            # paragraph break = end of group
            if current_group:
                groups.append(current_group)
                current_group = []
            continue

        if current_unit is None:
            continue

        # It's a term line
        current_group.append(stripped)

    # flush last
    if current_group:
        groups.append(current_group)
    if current_unit is not None:
        units.setdefault(current_unit, []).extend(groups)

    return units

def load_drill_terms(unit_num: int):
    """Load all drill card answers for a unit."""
    f = DRILLS / f"unit-{unit_num}.json"
    data = json.loads(f.read_text(encoding="utf-8"))
    return [(c.get("answer", ""), c.get("mode", ""), c.get("is_key_term", False), c.get("id", "")) for c in data.get("cards", [])]

def main():
    units = parse_pdf_units()
    print(f"Parsed {len(units)} units from PDF\n")

    report = {}
    for unit_num in sorted(units.keys()):
        groups = units[unit_num]
        pdf_terms = []
        for g in groups:
            pdf_terms.extend(g)

        drill_terms = load_drill_terms(unit_num)
        drill_answers = [d[0] for d in drill_terms]

        pdf_norm = {normalize(t): t for t in pdf_terms}
        drill_norm = {normalize(t): t for t in drill_answers}

        missing_from_drills = [pdf_norm[k] for k in pdf_norm if k not in drill_norm and k]
        extra_in_drills = [(drill_norm[k], k) for k in drill_norm if k not in pdf_norm and k]

        report[unit_num] = {
            "pdf_total": len(pdf_terms),
            "pdf_groups": len(groups),
            "drill_total": len(drill_answers),
            "to_add": missing_from_drills,
            "to_remove": extra_in_drills,
            "groups": groups,
        }

        print(f"=== UNIT {unit_num} ===")
        print(f"  PDF terms: {len(pdf_terms)} in {len(groups)} groups")
        print(f"  Drill cards: {len(drill_answers)}")
        print(f"  TO ADD ({len(missing_from_drills)}): {missing_from_drills[:10]}{'...' if len(missing_from_drills) > 10 else ''}")
        print(f"  TO REMOVE ({len(extra_in_drills)}): {[e[0] for e in extra_in_drills[:10]]}{'...' if len(extra_in_drills) > 10 else ''}")
        print()

    # Write full report
    out = Path(r"C:\Ascendly\scripts\apwh-vocab-diff.json")
    out.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nWrote full diff to {out}")

if __name__ == "__main__":
    main()
