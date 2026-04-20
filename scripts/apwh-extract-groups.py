"""
Extract PDF groups per unit into a structured JSON for Writer subagents.
Output: scripts/apwh-pdf-groups.json
Format:
  {
    "unit-1": {
      "unit_name": "The Global Tapestry",
      "groups": [
        {"index": 0, "terms": ["Neo-Confucianism", "Mahayana Buddhism", ...]},
        ...
      ]
    }
  }
"""
import json
import re
from pathlib import Path
from pdfminer.high_level import extract_text

PDF = Path(r"C:\Users\kakka\Downloads\APWH All Units Vocab.pdf")
OUT = Path(r"C:\Ascendly\scripts\apwh-pdf-groups.json")

UNIT_NAMES = {
    1: "The Global Tapestry",
    2: "Networks of Exchange",
    3: "Land-Based Empires",
    4: "Transoceanic Interconnections",
    5: "Revolutions",
    6: "Consequences of Industrialization",
    7: "Global Conflict",
    8: "Cold War and Decolonization",
    9: "Globalization",
}

def main():
    text = extract_text(str(PDF))
    # Replace weird chars (diacritic placeholders)
    text = text.replace("\u2019", "'").replace("\u2018", "'").replace("\ufffd", "'")
    lines = [l.rstrip() for l in text.split("\n")]

    unit_re = re.compile(r"Unit\s+(\d+)(?:\s*:\s*|\s+-\s+)?(.*?)?c?\.?\s*\d{3,4}", re.IGNORECASE)
    part_re = re.compile(r"Unit\s+\d+\s+Part\s+II", re.IGNORECASE)

    units = {}  # unit_num -> list of groups
    current_unit = None
    current_group = []

    for line in lines:
        stripped = line.strip()

        # Unit 7 Part II is merged into Unit 7, so just flush group and continue
        if part_re.match(stripped):
            if current_group:
                units[current_unit].append(current_group)
                current_group = []
            continue

        m = re.match(r"Unit\s+(\d+)", stripped)
        if m and not part_re.match(stripped):
            # flush prior
            if current_group and current_unit is not None:
                units[current_unit].append(current_group)
                current_group = []
            current_unit = int(m.group(1))
            if current_unit not in units:
                units[current_unit] = []
            continue

        if not stripped:
            if current_group and current_unit is not None:
                units[current_unit].append(current_group)
                current_group = []
            continue

        if current_unit is None:
            continue
        current_group.append(stripped)

    # flush tail
    if current_group and current_unit is not None:
        units[current_unit].append(current_group)

    out = {}
    for u in sorted(units.keys()):
        out[f"unit-{u}"] = {
            "unit_name": UNIT_NAMES.get(u, f"Unit {u}"),
            "groups": [{"index": i, "terms": g} for i, g in enumerate(units[u])],
        }

    OUT.write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {OUT}")
    for u in sorted(units.keys()):
        total = sum(len(g) for g in units[u])
        print(f"  unit-{u}: {len(units[u])} groups, {total} terms")

if __name__ == "__main__":
    main()
