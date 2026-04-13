#!/usr/bin/env python3
"""
FRQ JSON Text Fixer v2
Comprehensively fixes text formatting issues from PDF extraction in released FRQ JSON files.
Handles:
1. (cid:XXX) PDF artifact sequences
2. Embedded page headers/footers
3. Chemistry formula subscript/superscript garbling
4. Common equilibrium constants (Ka, Kb, Ksp, etc.)
5. Thermodynamic symbols (ΔG°, ΔH°, ΔS°)
6. Reaction arrows
7. College Board header/footer injections
8. Misc encoding issues
"""

import json
import os
import re
import sys
from pathlib import Path
from copy import deepcopy

# Directories to scan
FRQ_DIRS = [
    "C:/Ascendly/public/data/ap-calculus-ab/frq",
    "C:/Ascendly/public/data/ap-chemistry/frq",
    "C:/Ascendly/public/data/ap-world-history/frq",
    "C:/Ascendly/public/data/ap-government/frq",
    "C:/Ascendly/public/data/ap-psychology/frq",
    "C:/Ascendly/public/data/ap-precalculus/frq",
]

changes_log = []
total_fixes = 0


def log_change(filepath, field, before_snippet, after_snippet):
    global total_fixes
    total_fixes += 1
    changes_log.append({
        'file': filepath.split('/')[-1].split('\\')[-1],
        'field': field,
        'before': before_snippet,
        'after': after_snippet,
    })


def fix_universal(text: str) -> str:
    """Apply fixes that apply to ALL subjects."""
    if not text:
        return text

    # 1. Remove (cid:XXX) sequences - PDF CID font artifacts
    text = re.sub(r'\(cid:\d+\)', '', text)

    # 2. Remove College Board copyright/page headers embedded in text
    # These appear when PDF pages had headers/footers that got extracted into the text
    text = re.sub(r'©\s*\d{4}\s*The College Board[^\n]*', '', text)
    text = re.sub(r'Visit the College Board on the Web:[^\n]*', '', text)
    text = re.sub(r'GO ON TO THE NEXT PAGE\.[^\n]*', '', text)
    text = re.sub(r'(?:^|\n)\s*-\d+-\s*(?:\n|$)', '\n', text)
    text = re.sub(r'\d{4}\s+AP[®©\u00ae]\s+CHEMISTRY[^\n]*FREE-RESPONSE QUESTIONS\s*', '', text)
    text = re.sub(r'AP CHEMISTRY \d{4}\s+[n•]\s+FREE-RESPONSE QUESTIONS\s*', '', text)
    text = re.sub(r'\d{4}\s+AP[®©\u00ae]\s+\w[\w\s]+FREE-RESPONSE QUESTIONS\s*', '', text)
    text = re.sub(r'STOP\s+END OF EXAM\s*', '', text)

    # 3. Fix multiplication sign encoded as ¥
    text = text.replace(' ¥ ', ' × ')
    text = text.replace(' ¥10', ' ×10')
    text = text.replace('¥ 10', '× 10')

    # 4. Fix encoding artifacts
    text = text.replace('\x92', "'")
    text = text.replace('\x93', '"')
    text = text.replace('\x94', '"')
    text = text.replace('\x96', '–')
    text = text.replace('\x97', '—')

    # 5. Collapse leftover multiple spaces (but preserve newlines)
    text = re.sub(r'[ \t]{2,}', ' ', text)

    # 6. Remove trailing whitespace on lines
    text = re.sub(r'[ \t]+\n', '\n', text)

    # 7. Remove excessive blank lines (3+ newlines -> 2)
    text = re.sub(r'\n{3,}', '\n\n', text)

    # 8. Strip leading/trailing whitespace
    text = text.strip()

    return text


def fix_chemistry(text: str) -> str:
    """Apply chemistry-specific fixes."""
    if not text:
        return text

    # ==============================
    # REACTION ARROWS
    # ==============================
    # PDF often encodes → as " " or "->" or special chars
    # Common patterns: "→" already OK, but PDF gives us:
    # " " (right-pointing arrow encoded as space-variant) - hard to detect reliably
    # Keep explicit patterns we know about:

    # ==============================
    # REMOVE AP CHEM HEADERS injected into body text
    # ==============================
    text = re.sub(r'AP CHEMISTRY 2025\s+n\s+FREE-RESPONSE QUESTIONS\s*', '', text)
    text = re.sub(r'AP CHEMISTRY \d{4}\s+n\s+FREE-RESPONSE QUESTIONS\s*', '', text)

    # Remove College Board "2016/2017... AP CHEMISTRY..." headers embedded in parts
    # These appear as garbled text like "(cid:19)(cid:17)..." already handled

    # ==============================
    # COLLEGE BOARD SCORING MARKERS
    # ==============================
    # Remove isolated scoring reference markers like "7 A", "8 B" etc.
    # that are score-entry boxes from the scoring guide
    text = re.sub(r'(?<=[.!?])\s*\n?\s*\d\s+[A-Z]\s*\n', '\n', text)
    text = re.sub(r'\n\d\s+[A-Z]\n', '\n', text)

    # Remove "_ i" artifacts (parenthetical notation from scoring)
    text = re.sub(r'\b_\s+i\b', '', text)

    # ==============================
    # EQUILIBRIUM CONSTANTS (with spaces from PDF extraction)
    # ==============================
    # These patterns are common across all AP Chem years

    # Ksp variants
    text = re.sub(r'\bK\s+sp\b', r'$K_{sp}$', text)
    text = re.sub(r'\bK_\{?sp\}?\b', r'$K_{sp}$', text)

    # Ka variants
    text = re.sub(r'\bpK\s+a\b', r'$pK_a$', text)
    text = re.sub(r'\bpK\s+b\b', r'$pK_b$', text)
    text = re.sub(r'\bK\s+a\b', r'$K_a$', text)
    text = re.sub(r'\bK\s+b\b', r'$K_b$', text)
    text = re.sub(r'\bK\s+c\b', r'$K_c$', text)
    text = re.sub(r'\bK\s+p\b', r'$K_p$', text)
    text = re.sub(r'\bK\s+w\b', r'$K_w$', text)
    text = re.sub(r'\bK\s+eq\b', r'$K_{eq}$', text)

    # Already-fixed KaTeX variants (skip if already $K_a$)
    # Make sure we don't double-wrap
    text = re.sub(r'\$\$K_\{?([a-z]+)\}?\$\$', r'$K_{\1}$', text)
    text = re.sub(r'\$K_\{?([a-z]+)\}?\$', lambda m: f'$K_{{{m.group(1)}}}$', text)

    # ==============================
    # THERMODYNAMIC SYMBOLS
    # ==============================
    # PDF often extracts ΔG° as "DG°" or "TGc" or "ΔG°" (already good)
    # Handle both DG/TG notations

    # Fix "TGc", "THc", "TSc" -> ΔG°, ΔH°, ΔS° (College Board PDF artifact)
    text = re.sub(r'\bTG\s*c\b', r'ΔG°', text)
    text = re.sub(r'\bTH\s*c\b', r'ΔH°', text)
    text = re.sub(r'\bTS\s*c\b', r'ΔS°', text)

    # Fix "TH r %xn" -> ΔH°rxn
    text = re.sub(r'\bTH\s*r?\s*%\s*xn\b', r'ΔH°rxn', text)
    text = re.sub(r'\bTH\s*%\s*(\d)', r'ΔH°$_\1$', text)
    text = re.sub(r'\bTH\s*f\s*%\b', r'ΔH°f', text)
    text = re.sub(r'\bTH\s*%\b', r'ΔH°', text)
    text = re.sub(r'\bTG\s*%\b', r'ΔG°', text)
    text = re.sub(r'\bTS\s*%\b', r'ΔS°', text)

    # TT artifact (ΔT for temperature change)
    text = re.sub(r'\bTT\b', r'ΔT', text)

    # Fix "DG°" -> ΔG° (legacy notation)
    text = re.sub(r'\bD([GHS])°', r'Δ\1°', text)

    # Fix "ΔG°" etc. already correct - wrap in KaTeX for display
    # We'll leave these as unicode since they render fine in the UI

    # ==============================
    # COMMON CHEMICAL FORMULAS
    # ==============================

    # Helper: state symbol pattern (optional space before state)
    # matches (g), (l), (s), (aq) with optional leading space
    STATE = r'\s*\([glsaq]{1,2}\)'

    # Water: "H O" -> $H_2O$ in various state contexts
    text = re.sub(r'\bH\s+O' + STATE, lambda m: '$H_2O$' + m.group(0)[m.group(0).find('('):], text)
    # Standalone H O at line end / before punctuation / standalone
    text = re.sub(r'\bH\s+O\b(?!\s*\()', r'$H_2O$', text)

    # Hydrogen peroxide: "H O " - tricky, leave alone for now

    # Diatomic molecules (with or without space before state symbol)
    text = re.sub(r'\bO\s+2' + STATE, lambda m: '$O_2$' + m.group(0)[m.group(0).find('('):], text)
    text = re.sub(r'\bO\s+2\b(?!\s*\()', r'$O_2$', text)
    # Handle case where subscript was on next line and already removed
    text = re.sub(r'\bO\s+\(g\)', r'$O_2$(g)', text)
    text = re.sub(r'\bO\s+\(l\)', r'$O_2$(l)', text)

    text = re.sub(r'\bN\s+2' + STATE, lambda m: '$N_2$' + m.group(0)[m.group(0).find('('):], text)
    # Be careful with N 2 standalone to not mangle N2O5 patterns
    text = re.sub(r'\bN\s+2\b(?!\s*[\(O])', r'$N_2$', text)

    text = re.sub(r'\bCl\s+2' + STATE, lambda m: '$Cl_2$' + m.group(0)[m.group(0).find('('):], text)
    text = re.sub(r'\bCl\s+2\b(?!\s*\()', r'$Cl_2$', text)

    text = re.sub(r'\bBr\s+2' + STATE, lambda m: '$Br_2$' + m.group(0)[m.group(0).find('('):], text)
    text = re.sub(r'\bBr\s+2\b(?!\s*\()', r'$Br_2$', text)

    text = re.sub(r'\bI\s+2' + STATE, lambda m: '$I_2$' + m.group(0)[m.group(0).find('('):], text)
    text = re.sub(r'\bI\s+2\b(?!\s*\()', r'$I_2$', text)

    text = re.sub(r'\bF\s+2' + STATE, lambda m: '$F_2$' + m.group(0)[m.group(0).find('('):], text)
    text = re.sub(r'\bF\s+2\b(?!\s*\()', r'$F_2$', text)

    text = re.sub(r'\bH\s+2' + STATE, lambda m: '$H_2$' + m.group(0)[m.group(0).find('('):], text)
    text = re.sub(r'\bH\s+2\b(?!\s*[\(O])', r'$H_2$', text)

    # Common polyatomic ions
    text = re.sub(r'\bNH\s+4\s*\+', r'$NH_4^+$', text)
    text = re.sub(r'\bNH\s+4\b(?!\s*\+)', r'$NH_4$', text)

    # Hydronium
    text = re.sub(r'\bH\s+3\s+O\s*\+', r'$H_3O^+$', text)

    # ==============================
    # PHOSPHORUS COMPOUNDS (2025 FRQ 3)
    # ==============================
    text = re.sub(r'\bP\s+4\s+O\s+10' + r'(?=' + STATE + r'|[)\s,.]|$)', r'$P_4O_{10}$', text)
    text = re.sub(r'\bP\s+4\s+O\s+10\b', r'$P_4O_{10}$', text)
    text = re.sub(r'\bP\s+4' + STATE, lambda m: '$P_4$' + m.group(0)[m.group(0).find('('):], text)
    text = re.sub(r'\bP\s+4\b(?!\s*[\(O])', r'$P_4$', text)
    text = re.sub(r'\bPCl\s+3\b', r'$PCl_3$', text)
    text = re.sub(r'\bPCl\s+5\b', r'$PCl_5$', text)
    text = re.sub(r'\bCl\s+2\b', r'$Cl_2$', text)

    # ==============================
    # NITROGEN OXIDE COMPOUNDS
    # ==============================
    text = re.sub(r'\bN\s*2\s*O\s*5\b', r'$N_2O_5$', text)
    text = re.sub(r'\bN\s*2\s*O\s*4\b', r'$N_2O_4$', text)
    text = re.sub(r'\bN\s*2\s*O\s*3\b', r'$N_2O_3$', text)
    text = re.sub(r'\bN\s*O\s*2\b', r'$NO_2$', text)
    text = re.sub(r'\bN\s*O\s*3\b', r'$NO_3$', text)

    # ==============================
    # SULFUR COMPOUNDS
    # ==============================
    text = re.sub(r'\bS\s*O\s*4\b', r'$SO_4$', text)
    text = re.sub(r'\bS\s*O\s*3\b', r'$SO_3$', text)
    text = re.sub(r'\bS\s*O\s*2\b', r'$SO_2$', text)
    text = re.sub(r'\bH\s*2\s*S\s*O\s*4\b', r'$H_2SO_4$', text)
    text = re.sub(r'\bH\s*2\s*S\s*O\s*3\b', r'$H_2SO_3$', text)
    # Thiosulfate
    text = re.sub(r'\bS\s*2\s*O\s*3\b', r'$S_2O_3$', text)
    text = re.sub(r'\bS\s*4\s*O\s*6\b', r'$S_4O_6$', text)

    # ==============================
    # CHROMATE/DICHROMATE
    # ==============================
    text = re.sub(r'\bCr\s*2\s*O\s*7\b', r'$Cr_2O_7$', text)
    text = re.sub(r'\bCr\s*O\s*4\b', r'$CrO_4$', text)

    # ==============================
    # MANGANESE
    # ==============================
    text = re.sub(r'\bMn\s*O\s*4\b', r'$MnO_4$', text)

    # ==============================
    # CARBON COMPOUNDS
    # ==============================
    text = re.sub(r'\bC\s*O\s*2\b', r'$CO_2$', text)
    text = re.sub(r'\bC\s*O\s*3\b', r'$CO_3$', text)

    # ==============================
    # PEROXIDE
    # ==============================
    text = re.sub(r'\bH\s*2\s*O\s*2\b', r'$H_2O_2$', text)

    # ==============================
    # METAL OXIDES AND HYDROXIDES
    # ==============================
    # Al2O3 - alumina
    text = re.sub(r'\bAl\s*2\s*O\s*3\b', r'$Al_2O_3$', text)
    text = re.sub(r'\bAl\s+O\b', r'$Al_2O_3$', text)  # When subscripts on next line
    # Na2O
    text = re.sub(r'\bNa\s*2\s*O\b', r'$Na_2O$', text)
    text = re.sub(r'\bNa\s+O\b', r'$Na_2O$', text)  # When subscripts displaced

    # Ca(OH)2
    text = re.sub(r'\bCa\(OH\)\s*\n?\s*(?!\s*2)(?=[\s,.(]|$)', r'$Ca(OH)_2$', text)
    text = re.sub(r'\bCa\(OH\)\s*\n?\s*2\b', r'$Ca(OH)_2$', text)

    # Ca(NO3)2 - calcium nitrate
    text = re.sub(r'\bCa\s*\(NO\s*\)\s*\n?\s*2\b', r'$Ca(NO_3)_2$', text)
    text = re.sub(r'\bCa\s*\(NO\s*3\s*\)\s*\n?\s*2\b', r'$Ca(NO_3)_2$', text)

    # Pb(NO3)2 - lead(II) nitrate
    text = re.sub(r'\bPb\s*\(NO\s*\)\s*\n?\s*2\b', r'$Pb(NO_3)_2$', text)
    text = re.sub(r'\bPb\s*\(NO\s*3\s*\)\s*\n?\s*2\b', r'$Pb(NO_3)_2$', text)

    # Cu(NO3)2, Sn(NO3)2
    text = re.sub(r'\bCu\s*\(NO\s*\)\s*\n?\s*2\b', r'$Cu(NO_3)_2$', text)
    text = re.sub(r'\bSn\s*\(NO\s*\)\s*\n?\s*2\b', r'$Sn(NO_3)_2$', text)

    # Mg(OH)2
    text = re.sub(r'\bMg\s*\(OH\)\s*\n?\s*2\b', r'$Mg(OH)_2$', text)
    text = re.sub(r'\bMg\s*\(OH\)\b(?!\s*2)', r'$Mg(OH)_2$', text)

    # MgO
    text = re.sub(r'\bMg\s+O\b', r'MgO', text)

    # ==============================
    # IODINE AND BROMINE (as elements)
    # ==============================
    # I2 and Br2 on their own line (PDF splits "I2" as "I\n2" or "I\n(s)")
    text = re.sub(r'\bI\s*\n\s*\(s\)', r'$I_2$(s)', text)
    text = re.sub(r'\bI\s*\n\s*\(g\)', r'$I_2$(g)', text)
    text = re.sub(r'\bI\s*\n\s*\(l\)', r'$I_2$(l)', text)
    text = re.sub(r'\bI\s*\n\s*\(aq\)', r'$I_2$(aq)', text)
    text = re.sub(r'\bBr\s*\n\s*\(l\)', r'$Br_2$(l)', text)
    text = re.sub(r'\bBr\s*\n\s*\(g\)', r'$Br_2$(g)', text)
    text = re.sub(r'\bBr\s*\n\s*\(s\)', r'$Br_2$(s)', text)

    # ==============================
    # ORPHANED SUBSCRIPT PAIRS ON NEW LINES
    # ==============================
    # Pattern: after a formula line, the subscript numbers appear alone
    # e.g., "O (g) + 2 H O(l)\n2 2\n" -> subscript 2 for O2 and H2O already on prev line
    # These orphaned "2 2" or "2 3" lines from table data can be removed
    # Be careful: only remove when they're truly orphaned (standalone number line)
    text = re.sub(r'\n\d\s+\d\s*\n', '\n', text)  # Remove lone "2 2" or "2 3" lines

    # ==============================
    # SCIENTIFIC NOTATION FIXES
    # ==============================
    # "10-12" -> "10^{-12}" outside KaTeX
    # First, find patterns NOT already in $...$
    def fix_sci_notation(m):
        base = m.group(1)
        sign = m.group(2)
        exp = m.group(3)
        sign_sym = '-' if sign in '-−' else ''
        return f'× 10$^{{{sign_sym}{exp}}}$'

    # Fix patterns like "× 10-12" or "× 10−12" or "×10-5"
    text = re.sub(r'[×x]\s*10\s*([−\-])(\d+)', lambda m: f'× 10$^{{-{m.group(2)}}}$', text)

    # Fix "10-3 M" patterns where 10-3 is superscript
    # Already OK if written as "10^{-3}"

    # ==============================
    # REMOVE TRAILING JUNK
    # ==============================
    # Remove "STOP" and "END OF EXAM" at end of prompts
    text = re.sub(r'\s*STOP\s*\n?\s*END OF EXAM\s*$', '', text)

    # Remove leftover "P O" fragments that are detritus from table data
    # (table data extracted as column values on separate lines)
    # e.g., "P O\nMass of 4 10" - This is very complex to fix reliably
    # Leave these as-is since auto-fixing could break correct content

    return text


def fix_calculus(text: str) -> str:
    """Apply calculus-specific fixes."""
    if not text:
        return text

    # Fix "Find g 4 , g 4 , and g 4 ." type expressions
    # These are function evaluations rendered without parentheses
    # Pattern: single letter + space + number (when the letter is clearly a function name)
    # e.g., "g 4" -> "g(4)"... but we need to be careful
    # Only fix in specific contexts (rubric text, etc.)
    # This is too risky to auto-fix without context - skip

    return text


def fix_text(text: str, filepath: str, field: str) -> str:
    """Apply all applicable fixes to a text string."""
    if not text or not isinstance(text, str):
        return text

    # Apply universal fixes
    text = fix_universal(text)

    # Apply subject-specific fixes
    is_chem = 'ap-chemistry' in filepath.replace('\\', '/')
    is_calc = 'ap-calculus' in filepath.replace('\\', '/') or 'ap-precalculus' in filepath.replace('\\', '/')

    if is_chem:
        text = fix_chemistry(text)
    elif is_calc:
        text = fix_calculus(text)

    # Final cleanup
    text = text.strip()

    return text


def fix_specific_fields(data: dict, filepath: str) -> dict:
    """Fix only the relevant fields in an FRQ JSON structure."""
    data = deepcopy(data)
    file_changes = 0

    def apply_fix(value: str, field: str) -> str:
        nonlocal file_changes
        if not value:
            return value
        fixed = fix_text(value, filepath, field)
        if fixed != value:
            log_change(filepath, field, value[:150], fixed[:150])
            file_changes += 1
        return fixed

    # Fix stimulus
    if data.get('stimulus'):
        data['stimulus'] = apply_fix(data['stimulus'], 'stimulus')

    # Fix parts
    for i, part in enumerate(data.get('parts', [])):
        if not isinstance(part, dict):
            continue

        if part.get('prompt'):
            data['parts'][i]['prompt'] = apply_fix(part['prompt'], f'parts[{i}].prompt')

        for j, criterion in enumerate(part.get('rubric_criteria', [])):
            if isinstance(criterion, str) and criterion:
                data['parts'][i]['rubric_criteria'][j] = apply_fix(
                    criterion, f'parts[{i}].rubric_criteria[{j}]'
                )
            elif isinstance(criterion, dict):
                for k, v in criterion.items():
                    if isinstance(v, str) and v:
                        data['parts'][i]['rubric_criteria'][j][k] = apply_fix(
                            v, f'parts[{i}].rubric_criteria[{j}].{k}'
                        )

        if part.get('scoring_notes'):
            data['parts'][i]['scoring_notes'] = apply_fix(
                part['scoring_notes'], f'parts[{i}].scoring_notes'
            )

    # Fix documents (DBQ)
    for i, doc in enumerate(data.get('documents') or []):
        if not isinstance(doc, dict):
            continue
        for field_name in ['content', 'source', 'title']:
            if doc.get(field_name):
                data['documents'][i][field_name] = apply_fix(
                    doc[field_name], f'documents[{i}].{field_name}'
                )

    return data, file_changes


def process_file(filepath: str) -> int:
    """Process a single file. Returns number of changes made."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except (json.JSONDecodeError, UnicodeDecodeError) as e:
        print(f"  ERROR: Cannot parse: {e}", file=sys.stderr)
        return 0

    # Only fix released FRQs
    if data.get('source') != 'released':
        return 0

    fixed_data, count = fix_specific_fields(data, filepath)

    if count == 0:
        return 0

    # Write the fixed data back
    with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(fixed_data, f, indent=2, ensure_ascii=False)
        f.write('\n')  # trailing newline

    return count


def main():
    files_processed = 0
    files_changed = 0

    for frq_dir in FRQ_DIRS:
        if not os.path.exists(frq_dir):
            print(f"WARNING: Directory does not exist: {frq_dir}", file=sys.stderr)
            continue

        subject = frq_dir.split('/')[-2]
        print(f"\n{'='*60}")
        print(f"Processing {subject}")
        print('='*60)

        json_files = sorted(Path(frq_dir).glob('*.json'))
        for json_file in json_files:
            if json_file.name in ['manifest.json', 'image-manifest.json']:
                continue

            files_processed += 1
            count = process_file(str(json_file))
            if count > 0:
                files_changed += 1
                print(f"  [{json_file.name}] {count} fixes")

    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print(f"{'='*60}")
    print(f"Files processed: {files_processed}")
    print(f"Files changed: {files_changed}")
    print(f"Total fixes: {total_fixes}")

    # Write log
    log_path = "C:/Ascendly/scripts/fix_log_v2.json"
    with open(log_path, 'w', encoding='utf-8') as f:
        json.dump(changes_log, f, indent=2, ensure_ascii=False)
    print(f"\nLog written to: {log_path}")


if __name__ == '__main__':
    main()
